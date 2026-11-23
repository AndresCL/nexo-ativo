import type { Firestore } from "firebase-admin/firestore";
import { converterHorarioParaMinutos } from "../../../src/dominio/agenda/calendarioDatas";
import { intervalosSeSobrepoem } from "../../../src/dominio/agenda/geradorHorariosDisponiveis";
import type {
  AgendamentoAgenda,
  ControleAgendaDiaria,
  SituacaoAgendamento,
} from "../../../src/dominio/agenda/tiposAgenda";
import type { UsuarioAutenticado } from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import { ErroValidacaoDominio } from "../../../src/dominio/erros/errosDominio";
import { esquemaAtualizacaoSituacaoAgendamento } from "../../../src/validacoes/esquemasAgenda";
import { carregarEValidarAcessoOrganizacao } from "../seguranca/autorizadorAdminFirestore";

export interface ResultadoAtualizacaoSituacaoAgendamento {
  readonly agendamentoId: string;
  readonly situacao: SituacaoAgendamento;
  readonly observacoesInternas?: string;
  readonly atualizadoEmIso: string;
}

/**
 * Atualiza a situação e observações internas de um agendamento no painel.
 * Ao cancelar, remove atomicamente o intervalo de `controleAgendaDiaria/{dataIso}`,
 * liberando o horário para novos visitantes. Ao reativar para `confirmado`, valida
 * que não houve novo conflito no horário.
 */
export async function executarAtualizacaoSituacaoAgendamento(
  bancoDados: Firestore,
  usuario: UsuarioAutenticado | null,
  entradaBruta: unknown,
): Promise<ResultadoAtualizacaoSituacaoAgendamento> {
  const validacao = esquemaAtualizacaoSituacaoAgendamento.safeParse(entradaBruta);
  if (!validacao.success) {
    throw new ErroValidacaoDominio(
      validacao.error.issues[0]?.message ?? "Dados inválidos para atualizar o agendamento.",
      "ATUALIZACAO_AGENDAMENTO_INVALIDA",
    );
  }

  const { organizacaoId, agendamentoId, situacao, observacoesInternas } = validacao.data;

  await carregarEValidarAcessoOrganizacao(
    bancoDados,
    usuario,
    organizacaoId,
    "gerenciar_agenda",
  );

  const agoraIso = new Date().toISOString();
  const refOrg = bancoDados.collection("organizacoes").doc(organizacaoId);
  const refAgendamento = refOrg.collection("agendamentos").doc(agendamentoId);

  return bancoDados.runTransaction(async (transacao) => {
    const docAgendamento = await transacao.get(refAgendamento);
    if (!docAgendamento.exists) {
      throw new ErroValidacaoDominio(
        "Agendamento não encontrado nesta organização.",
        "AGENDAMENTO_INEXISTENTE",
      );
    }

    const atual = docAgendamento.data() as AgendamentoAgenda;
    const refControleDia = refOrg.collection("controleAgendaDiaria").doc(atual.dataIso);
    const docControleDia = await transacao.get(refControleDia);

    const controleAtual = docControleDia.exists
      ? (docControleDia.data() as Partial<ControleAgendaDiaria>)
      : null;
    const intervalosAtuais = Array.isArray(controleAtual?.intervalosOcupados)
      ? controleAtual.intervalosOcupados
      : [];

    const semEste = intervalosAtuais.filter((item) => item.agendamentoId !== agendamentoId);

    if (situacao === "cancelado") {
      if (docControleDia.exists) {
        transacao.set(refControleDia, {
          organizacaoId,
          dataIso: atual.dataIso,
          intervalosOcupados: semEste,
          atualizadoEmIso: agoraIso,
        });
      }
    } else if (atual.situacao === "cancelado" && situacao === "confirmado") {
      const inicioMin = converterHorarioParaMinutos(atual.horarioInicio);
      const fimMin = converterHorarioParaMinutos(atual.horarioFim);
      const conflita = semEste.some((ocupado) =>
        intervalosSeSobrepoem(inicioMin, fimMin, ocupado.inicioMin, ocupado.fimMin),
      );
      if (conflita) {
        throw new ErroValidacaoDominio(
          "Não é possível reconfirmar: outro visitante já reservou este horário.",
          "HORARIO_JA_RESERVADO",
        );
      }
      transacao.set(refControleDia, {
        organizacaoId,
        dataIso: atual.dataIso,
        intervalosOcupados: [
          ...semEste,
          {
            agendamentoId,
            inicioMin,
            fimMin,
          },
        ],
        atualizadoEmIso: agoraIso,
      });
    }

    const camposAtualizados: Record<string, unknown> = {
      situacao,
      atualizadoEmIso: agoraIso,
    };

    if (observacoesInternas !== undefined) {
      camposAtualizados.observacoesInternas = observacoesInternas;
    }

    transacao.update(refAgendamento, camposAtualizados);

    return {
      agendamentoId,
      situacao,
      ...(observacoesInternas !== undefined ? { observacoesInternas } : {}),
      atualizadoEmIso: agoraIso,
    };
  });
}

