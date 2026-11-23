import type {
  ConfiguracaoAgendaOrganizacao,
  RespostaDisponibilidadeAgendaPublica,
  SituacaoAgendamento,
} from "@/dominio/agenda/tiposAgenda";
import type {
  DadosConsultaDisponibilidadeAgenda,
  DadosSubmissaoAgendamentoVisitante,
} from "@/validacoes/esquemasAgenda";

export interface ResultadoSubmissaoAgendamentoVisitante {
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
}

/**
 * Porta segregada (ISP) para o fluxo público do visitante na vitrine.
 */
export interface PortaAgendamentoVisitante {
  consultarDisponibilidade(
    dados: DadosConsultaDisponibilidadeAgenda,
  ): Promise<RespostaDisponibilidadeAgendaPublica>;
  registrarAgendamento(
    dados: DadosSubmissaoAgendamentoVisitante,
  ): Promise<ResultadoSubmissaoAgendamentoVisitante>;
}

export interface ResultadoAtualizacaoSituacaoAgendamentoCliente {
  readonly agendamentoId: string;
  readonly situacao: SituacaoAgendamento;
  readonly observacoesInternas?: string;
  readonly atualizadoEmIso: string;
}

/**
 * Porta segregada (ISP) para a gestão autenticada da agenda no painel do assinante.
 */
export interface PortaAgendaPainel {
  salvarConfiguracaoAgenda(
    configuracao: ConfiguracaoAgendaOrganizacao,
  ): Promise<ConfiguracaoAgendaOrganizacao>;
  atualizarSituacaoAgendamento(parametros: {
    readonly organizacaoId: string;
    readonly agendamentoId: string;
    readonly situacao: SituacaoAgendamento;
    readonly observacoesInternas?: string;
  }): Promise<ResultadoAtualizacaoSituacaoAgendamentoCliente>;
}

