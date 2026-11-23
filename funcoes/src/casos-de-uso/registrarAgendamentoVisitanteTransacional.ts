import type { Firestore } from "firebase-admin/firestore";
import {
  criarConfiguracaoAgendaPadrao,
  type AgendamentoAgenda,
  type ConfiguracaoAgendaOrganizacao,
  type ControleAgendaDiaria,
} from "../../../src/dominio/agenda/tiposAgenda";
import {
  gerarChaveIdempotenciaAgendamento,
  gerarCodigoConfirmacaoAgendamento,
  validarSlotParaReserva,
} from "../../../src/dominio/agenda/validadorReservaAgenda";
import type { Organizacao } from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import { ErroAcessoNegado, ErroValidacaoDominio } from "../../../src/dominio/erros/errosDominio";
import { esquemaSubmissaoAgendamentoVisitante } from "../../../src/validacoes/esquemasAgenda";
import {
  criarProvedorEmailPadrao,
  type PortaProvedorEmailTransacional,
} from "../email/adaptadorResendEmail";
import {
  processarNotificacoesEmailAgendamento,
  type ResumoNotificacoesAgendamento,
} from "./processarNotificacoesAgendamento";

export interface ResultadoRegistroAgendamentoVisitante {
  readonly agendamentoId: string;
  readonly organizacaoId: string;
  readonly codigoConfirmacao: string;
  readonly dataIso: string;
  readonly horarioInicio: string;
  readonly horarioFim: string;
  readonly duracaoMinutos: number;
  readonly fusoHorario: string;
  readonly duplicadaIdempotente: boolean;
  readonly emailConfirmacaoEnviado: boolean;
  readonly criadoEmIso: string;
  readonly resumoNotificacoesEmail?: ResumoNotificacoesAgendamento;
}

function removerIndefinidos<T>(valor: T): T {
  if (Array.isArray(valor)) {
    return valor.map((item) => removerIndefinidos(item)) as unknown as T;
  }
  if (valor !== null && typeof valor === "object") {
    const limpo: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
      if (v !== undefined) {
        limpo[k] = removerIndefinidos(v);
      }
    }
    return limpo as T;
  }
  return valor;
}

/**
 * Registra de forma transacional, atômica e idempotente uma reserva feita por um visitante.
 * Garante que não haja sobreposição de horários via `controleAgendaDiaria/{dataIso}` e
 * dispara o e-mail de confirmação para o visitante (e aviso para a equipe).
 */
export async function executarRegistroAgendamentoVisitante(
  bancoDados: Firestore,
  entradaBruta: unknown,
  provedorEmail: PortaProvedorEmailTransacional = criarProvedorEmailPadrao(),
  agora: Date = new Date(),
): Promise<ResultadoRegistroAgendamentoVisitante> {
  const validacao = esquemaSubmissaoAgendamentoVisitante.safeParse(entradaBruta);
  if (!validacao.success) {
    throw new ErroValidacaoDominio(
      validacao.error.issues[0]?.message ?? "Os dados informados no agendamento estão inválidos.",
      "AGENDAMENTO_INVALIDO",
    );
  }

  const dados = validacao.data;

  if (dados.campoArmadilhaBot && dados.campoArmadilhaBot.trim().length > 0) {
    throw new ErroValidacaoDominio(
      "Agendamento recusado pela verificação anti-automação.",
      "SUBMISSAO_AUTOMATIZADA_BLOQUEADA",
    );
  }

  const agoraIso = agora.toISOString();
  const chaveIdempotencia =
    dados.chaveIdempotencia?.trim() ||
    gerarChaveIdempotenciaAgendamento({
      organizacaoId: dados.organizacaoId,
      dataIso: dados.dataIso,
      horarioInicio: dados.horarioInicio,
      emailVisitante: dados.emailVisitante,
    });

  const refOrg = bancoDados.collection("organizacoes").doc(dados.organizacaoId);
  const refPaginaPublicada = bancoDados.collection("paginasPublicadas").doc(dados.organizacaoId);
  const refConfigAgenda = refOrg.collection("configuracoes").doc("agenda");
  const refControleDia = refOrg.collection("controleAgendaDiaria").doc(dados.dataIso);
  const refAgendamento = refOrg.collection("agendamentos").doc(chaveIdempotencia);

  const resultadoTx = await bancoDados.runTransaction(async (transacao) => {
    const [docOrg, docPagina, docConfig, docControleDia, docExistente] = await Promise.all([
      transacao.get(refOrg),
      transacao.get(refPaginaPublicada),
      transacao.get(refConfigAgenda),
      transacao.get(refControleDia),
      transacao.get(refAgendamento),
    ]);

    if (!docOrg.exists) {
      throw new ErroValidacaoDominio(
        "A organização informada não foi encontrada.",
        "ORGANIZACAO_INEXISTENTE",
      );
    }

    const organizacao = docOrg.data() as Organizacao;
    if (organizacao.situacao !== "ativa") {
      throw new ErroAcessoNegado(
        "Esta organização não está recebendo novos agendamentos no momento.",
        "ORGANIZACAO_SUSPENSA",
      );
    }

    const paginaAtiva =
      docPagina.exists &&
      docPagina.data()?.publicado === true &&
      docPagina.data()?.paginaAtiva === true;

    if (!paginaAtiva) {
      throw new ErroAcessoNegado(
        "A página pública desta organização não está disponível para agendamentos.",
        "PAGINA_INATIVA",
      );
    }

    if (docExistente.exists) {
      const existente = docExistente.data() as AgendamentoAgenda;
      return {
        duplicadaIdempotente: true as const,
        organizacao,
        agendamento: existente,
      };
    }

    if (!docConfig.exists) {
      throw new ErroValidacaoDominio(
        "Esta agenda ainda não possui dias e horários configurados.",
        "AGENDA_NAO_CONFIGURADA",
      );
    }

    const configuracao: ConfiguracaoAgendaOrganizacao = {
      ...criarConfiguracaoAgendaPadrao(dados.organizacaoId),
      ...(docConfig.data() as Partial<ConfiguracaoAgendaOrganizacao>),
      organizacaoId: dados.organizacaoId,
    };

    const controleAtual = docControleDia.exists
      ? (docControleDia.data() as Partial<ControleAgendaDiaria>)
      : null;
    const intervalosOcupados = Array.isArray(controleAtual?.intervalosOcupados)
      ? controleAtual.intervalosOcupados
      : [];

    const { slot, inicioMin, fimMin } = validarSlotParaReserva({
      configuracao,
      dataIso: dados.dataIso,
      horarioInicio: dados.horarioInicio,
      intervalosOcupados,
      agora,
    });

    const codigoConfirmacao = gerarCodigoConfirmacaoAgendamento(
      `${chaveIdempotencia}-${agoraIso}`,
    );

    const novoAgendamento: AgendamentoAgenda = removerIndefinidos({
      id: chaveIdempotencia,
      organizacaoId: dados.organizacaoId,
      identificadorPublicoOrganizacao: dados.identificadorPublicoOrganizacao,
      microfluxoId: dados.microfluxoId,
      tituloExperiencia: dados.tituloExperiencia,
      dataIso: dados.dataIso,
      horarioInicio: slot.horarioInicio,
      horarioFim: slot.horarioFim,
      duracaoMinutos: fimMin - inicioMin,
      fusoHorario: configuracao.fusoHorario,
      nomeVisitante: dados.nomeVisitante,
      emailVisitante: dados.emailVisitante,
      ...(dados.telefoneOuWhatsapp?.trim()
        ? { telefoneOuWhatsapp: dados.telefoneOuWhatsapp.trim() }
        : {}),
      ...(dados.observacoesVisitante?.trim()
        ? { observacoesVisitante: dados.observacoesVisitante.trim() }
        : {}),
      situacao: "confirmado",
      codigoConfirmacao,
      chaveIdempotencia,
      criadoEmIso: agoraIso,
      atualizadoEmIso: agoraIso,
    });

    const novoControleDia: ControleAgendaDiaria = {
      organizacaoId: dados.organizacaoId,
      dataIso: dados.dataIso,
      intervalosOcupados: [
        ...intervalosOcupados,
        {
          agendamentoId: chaveIdempotencia,
          inicioMin,
          fimMin,
        },
      ],
      atualizadoEmIso: agoraIso,
    };

    transacao.set(refAgendamento, novoAgendamento);
    transacao.set(refControleDia, novoControleDia);

    return {
      duplicadaIdempotente: false as const,
      organizacao,
      agendamento: novoAgendamento,
    };
  });

  if (resultadoTx.duplicadaIdempotente) {
    const a = resultadoTx.agendamento;
    return {
      agendamentoId: a.id,
      organizacaoId: a.organizacaoId,
      codigoConfirmacao: a.codigoConfirmacao,
      dataIso: a.dataIso,
      horarioInicio: a.horarioInicio,
      horarioFim: a.horarioFim,
      duracaoMinutos: a.duracaoMinutos,
      fusoHorario: a.fusoHorario,
      duplicadaIdempotente: true,
      emailConfirmacaoEnviado: true,
      criadoEmIso: a.criadoEmIso,
    };
  }

  let resumoNotificacoesEmail: ResumoNotificacoesAgendamento | undefined;
  try {
    resumoNotificacoesEmail = await processarNotificacoesEmailAgendamento(
      bancoDados,
      provedorEmail,
      resultadoTx.organizacao,
      resultadoTx.agendamento,
    );
    console.log(
      `[Notificações Agenda] Reserva ${resultadoTx.agendamento.id}: visitante=${resumoNotificacoesEmail.emailVisitanteEnviado}, equipe=${resumoNotificacoesEmail.emailEquipeEnviado}`,
    );
  } catch (erro) {
    console.error(
      `[Notificações Agenda Erro] Falha ao enviar e-mail da reserva ${resultadoTx.agendamento.id}:`,
      erro,
    );
  }

  const a = resultadoTx.agendamento;
  return {
    agendamentoId: a.id,
    organizacaoId: a.organizacaoId,
    codigoConfirmacao: a.codigoConfirmacao,
    dataIso: a.dataIso,
    horarioInicio: a.horarioInicio,
    horarioFim: a.horarioFim,
    duracaoMinutos: a.duracaoMinutos,
    fusoHorario: a.fusoHorario,
    duplicadaIdempotente: false,
    emailConfirmacaoEnviado: resumoNotificacoesEmail?.emailVisitanteEnviado ?? false,
    criadoEmIso: a.criadoEmIso,
    ...(resumoNotificacoesEmail ? { resumoNotificacoesEmail } : {}),
  };
}

