import type { Firestore } from "firebase-admin/firestore";
import type { AgendamentoAgenda } from "../../../src/dominio/agenda/tiposAgenda";
import {
  construirEmailConfirmacaoAgendamentoVisitante,
  construirEmailNovoAgendamentoEquipe,
} from "../../../src/dominio/email/templatesEmailAgenda";
import {
  criarConfiguracaoEmailPadraoOrganizacao,
  extrairAnoMesReferenciaIso,
  type ConfiguracaoEmailOrganizacao,
  type ConsumoMensalEmailOrganizacao,
  type MensagemEmailTransacional,
} from "../../../src/dominio/email/tiposEmailTransacional";
import type { Organizacao } from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import type { PortaProvedorEmailTransacional } from "../email/adaptadorResendEmail";

export interface ResumoNotificacoesAgendamento {
  readonly emailVisitanteEnviado: boolean;
  readonly emailEquipeEnviado: boolean;
  readonly bloqueadoPorCotaMensal: boolean;
  readonly enviosNoMesAtual: number;
  readonly limiteMensalPlano: number;
}

/**
 * Despacha os e-mails transacionais de confirmação de um agendamento:
 * - Visitante: SEMPRE priorizado e enviado (independentemente de `enviarConfirmacaoVisitante` de leads).
 * - Equipe: enviado conforme `configuracoes/email` da organização.
 * Respeita idempotência e cota mensal do plano.
 */
export async function processarNotificacoesEmailAgendamento(
  bancoDados: Firestore,
  provedorEmail: PortaProvedorEmailTransacional,
  organizacao: Organizacao,
  agendamento: AgendamentoAgenda,
): Promise<ResumoNotificacoesAgendamento> {
  const agoraIso = new Date().toISOString();
  const anoMesIso = extrairAnoMesReferenciaIso(agendamento.criadoEmIso || agoraIso);
  const limiteSalvo = Math.max(0, organizacao.resumoDireitosPlano.limiteEnviosEmailMensal);
  const limiteMensalPlano =
    limiteSalvo === 300 ? 5000 : limiteSalvo === 50 ? 500 : limiteSalvo;

  const refOrg = bancoDados.collection("organizacoes").doc(organizacao.id);
  const refConfigEmail = refOrg.collection("configuracoes").doc("email");
  const refConsumoMensal = refOrg.collection("metricasDiarias").doc(`email-${anoMesIso}`);

  const [docConfig, docConsumo] = await Promise.all([refConfigEmail.get(), refConsumoMensal.get()]);

  const configuracao: ConfiguracaoEmailOrganizacao = docConfig.exists
    ? (docConfig.data() as ConfiguracaoEmailOrganizacao)
    : criarConfiguracaoEmailPadraoOrganizacao(organizacao.id, undefined, agoraIso);

  const consumoExistente = docConsumo.exists
    ? (docConsumo.data() as ConsumoMensalEmailOrganizacao)
    : null;

  let enviosNoMesAtual = consumoExistente?.enviosNoMesAtual ?? 0;
  const chavesProcessadas = new Set<string>(consumoExistente?.chavesIdempotenciaProcessadas ?? []);

  const mensagensCandidatas: Array<{
    readonly tipo: "visitante" | "equipe";
    readonly mensagem: MensagemEmailTransacional;
  }> = [];

  // 1. Confirmação do visitante (sempre priorizada no fluxo de agenda)
  const responderParaVisitante =
    configuracao.emailRespostaOpcional ?? configuracao.emailsDestinatariosEquipe[0];
  mensagensCandidatas.push({
    tipo: "visitante",
    mensagem: construirEmailConfirmacaoAgendamentoVisitante({
      agendamento,
      nomeOrganizacao: organizacao.nome,
      ...(responderParaVisitante ? { responderParaOpcional: responderParaVisitante } : {}),
    }),
  });

  // 2. Aviso para a equipe da organização (quando configurado)
  if (
    configuracao.notificarEquipeNovasSolicitacoes &&
    configuracao.emailsDestinatariosEquipe.length > 0
  ) {
    mensagensCandidatas.push({
      tipo: "equipe",
      mensagem: construirEmailNovoAgendamentoEquipe({
        agendamento,
        nomeOrganizacao: organizacao.nome,
        destinatarios: configuracao.emailsDestinatariosEquipe,
        urlPainelBase: process.env.NEXT_PUBLIC_URL_BASE_PUBLICA ?? "https://nexoativo.com.br",
      }),
    });
  }

  let emailVisitanteEnviado = false;
  let emailEquipeEnviado = false;
  let bloqueadoPorCotaMensal = false;
  let houveNovoEnvio = false;

  for (const item of mensagensCandidatas) {
    if (chavesProcessadas.has(item.mensagem.chaveIdempotencia)) {
      if (item.tipo === "visitante") {
        emailVisitanteEnviado = true;
      } else {
        emailEquipeEnviado = true;
      }
      continue;
    }

    if (enviosNoMesAtual >= limiteMensalPlano) {
      bloqueadoPorCotaMensal = true;
      continue;
    }

    const resultado = await provedorEmail.enviarEmailIdempotente(item.mensagem);
    if (resultado.enviado) {
      enviosNoMesAtual += 1;
      chavesProcessadas.add(item.mensagem.chaveIdempotencia);
      houveNovoEnvio = true;

      if (item.tipo === "visitante") {
        emailVisitanteEnviado = true;
      } else {
        emailEquipeEnviado = true;
      }
    }
  }

  if (houveNovoEnvio) {
    const novoConsumo: ConsumoMensalEmailOrganizacao = {
      anoMesIso,
      enviosNoMesAtual,
      limiteMensalPlano,
      chavesIdempotenciaProcessadas: Array.from(chavesProcessadas),
      atualizadoEmIso: agoraIso,
    };

    await bancoDados.runTransaction(async (transacao) => {
      transacao.set(refConsumoMensal, novoConsumo);
    });
  }

  return {
    emailVisitanteEnviado,
    emailEquipeEnviado,
    bloqueadoPorCotaMensal,
    enviosNoMesAtual,
    limiteMensalPlano,
  };
}

