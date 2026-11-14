import type { Firestore } from "firebase-admin/firestore";
import {
  construirEmailConfirmacaoVisitante,
  construirEmailNovaSolicitacaoEquipe,
} from "../../../src/dominio/email/templatesEmailEditorial";
import {
  criarConfiguracaoEmailPadraoOrganizacao,
  extrairAnoMesReferenciaIso,
  type ConfiguracaoEmailOrganizacao,
  type ConsumoMensalEmailOrganizacao,
  type MensagemEmailTransacional,
} from "../../../src/dominio/email/tiposEmailTransacional";
import type { Organizacao } from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import type { SolicitacaoComercial } from "../../../src/dominio/entidades/solicitacaoComercial";
import type { PortaProvedorEmailTransacional } from "../email/adaptadorResendEmail";

export interface ResumoProcessamentoNotificacoesEmail {
  readonly emailEquipeEnviado: boolean;
  readonly emailVisitanteEnviado: boolean;
  readonly bloqueadoPorCotaMensal: boolean;
  readonly enviosNoMesAtual: number;
  readonly limiteMensalPlano: number;
}

/**
 * Processa o envio idempotente de e-mails transacionais de uma solicitação comercial
 * (alerta para a equipe da organização e confirmação opcional para o visitante),
 * respeitando o limite mensal de envios do plano (`limiteEnviosEmailMensal`).
 */
export async function processarNotificacoesEmailSolicitacao(
  bancoDados: Firestore,
  provedorEmail: PortaProvedorEmailTransacional,
  organizacao: Organizacao,
  solicitacao: SolicitacaoComercial,
): Promise<ResumoProcessamentoNotificacoesEmail> {
  const agoraIso = new Date().toISOString();
  const anoMesIso = extrairAnoMesReferenciaIso(solicitacao.criadoEmIso || agoraIso);
  const limiteMensalPlano = Math.max(0, organizacao.resumoDireitosPlano.limiteEnviosEmailMensal);

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
    readonly tipo: "equipe" | "visitante";
    readonly mensagem: MensagemEmailTransacional;
  }> = [];

  if (
    configuracao.notificarEquipeNovasSolicitacoes &&
    configuracao.emailsDestinatariosEquipe.length > 0
  ) {
    mensagensCandidatas.push({
      tipo: "equipe",
      mensagem: construirEmailNovaSolicitacaoEquipe({
        solicitacao,
        nomeOrganizacao: organizacao.nome,
        destinatarios: configuracao.emailsDestinatariosEquipe,
        ...(configuracao.emailRespostaOpcional
          ? { responderParaOpcional: configuracao.emailRespostaOpcional }
          : {}),
      }),
    });
  }

  if (configuracao.enviarConfirmacaoVisitante && solicitacao.emailVisitante) {
    const emailResponderPara =
      configuracao.emailRespostaOpcional ?? configuracao.emailsDestinatariosEquipe[0];
    mensagensCandidatas.push({
      tipo: "visitante",
      mensagem: construirEmailConfirmacaoVisitante({
        solicitacao,
        nomeOrganizacao: organizacao.nome,
        emailVisitante: solicitacao.emailVisitante,
        ...(emailResponderPara ? { responderParaOpcional: emailResponderPara } : {}),
      }),
    });
  }

  let emailEquipeEnviado = false;
  let emailVisitanteEnviado = false;
  let bloqueadoPorCotaMensal = false;
  let houveNovoEnvio = false;

  for (const item of mensagensCandidatas) {
    if (chavesProcessadas.has(item.mensagem.chaveIdempotencia)) {
      if (item.tipo === "equipe") {
        emailEquipeEnviado = true;
      } else {
        emailVisitanteEnviado = true;
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

      if (item.tipo === "equipe") {
        emailEquipeEnviado = true;
      } else {
        emailVisitanteEnviado = true;
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
    emailEquipeEnviado,
    emailVisitanteEnviado,
    bloqueadoPorCotaMensal,
    enviosNoMesAtual,
    limiteMensalPlano,
  };
}
