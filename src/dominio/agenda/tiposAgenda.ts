export type SituacaoAgendamento =
  | "confirmado"
  | "cancelado"
  | "concluido"
  | "nao_compareceu";

export interface FaixaHorarioDia {
  /** Formato HH:mm (ex.: "09:00"). */
  readonly inicio: string;
  /** Formato HH:mm (ex.: "12:00"). Deve ser estritamente maior que `inicio`. */
  readonly fim: string;
}

/**
 * Configuração de disponibilidade da agenda da organização.
 * Armazenada em `organizacoes/{organizacaoId}/configuracoes/agenda`.
 */
export interface ConfiguracaoAgendaOrganizacao {
  readonly organizacaoId: string;
  readonly ativo: boolean;
  readonly fusoHorario: string;
  readonly duracaoSlotMinutos: number;
  readonly intervaloEntreSlotsMinutos: number;
  readonly antecedenciaMinimaHoras: number;
  readonly janelaMaximaDias: number;
  /** Mapa explícito de datas civis ("YYYY-MM-DD") abertas com suas faixas de atendimento. */
  readonly datasAbertas: Readonly<Record<string, readonly FaixaHorarioDia[]>>;
  /** Faixas padrão aplicadas ao abrir rapidamente novos dias no calendário do painel. */
  readonly horarioPadraoAplicacaoRapida: readonly FaixaHorarioDia[];
  readonly atualizadoEmIso: string;
}

/**
 * Configurações visuais e de copy específicas da experiência de Agenda na vitrine.
 */
export interface ConfiguracaoAgendaVitrine {
  readonly tituloModal?: string;
  readonly descricaoCurtaModal?: string;
  readonly textoBotaoConfirmar?: string;
  readonly mensagemConfirmacaoTitulo?: string;
  readonly mensagemConfirmacaoCorpo?: string;
  readonly exigirTelefone?: boolean;
  readonly exibirCampoObservacoes?: boolean;
}

export interface AgendamentoAgenda {
  readonly id: string;
  readonly organizacaoId: string;
  readonly identificadorPublicoOrganizacao: string;
  readonly microfluxoId: string;
  readonly tituloExperiencia: string;
  /** Data civil no formato YYYY-MM-DD no fuso da organização. */
  readonly dataIso: string;
  /** Horário de início no formato HH:mm. */
  readonly horarioInicio: string;
  /** Horário de término no formato HH:mm. */
  readonly horarioFim: string;
  readonly duracaoMinutos: number;
  readonly fusoHorario: string;
  readonly nomeVisitante: string;
  readonly emailVisitante: string;
  readonly telefoneOuWhatsapp?: string;
  readonly observacoesVisitante?: string;
  readonly situacao: SituacaoAgendamento;
  readonly codigoConfirmacao: string;
  readonly chaveIdempotencia: string;
  readonly observacoesInternas?: string;
  readonly criadoEmIso: string;
  readonly atualizadoEmIso: string;
}

export interface IntervaloOcupadoDia {
  readonly agendamentoId: string;
  readonly inicioMin: number;
  readonly fimMin: number;
}

/**
 * Documento agregador diário sem PII usado para garantir atomicidade e
 * prevenir sobreposição de horários mesmo quando a duração do slot muda.
 * Armazenado em `organizacoes/{organizacaoId}/controleAgendaDiaria/{dataIso}`.
 */
export interface ControleAgendaDiaria {
  readonly organizacaoId: string;
  readonly dataIso: string;
  readonly intervalosOcupados: readonly IntervaloOcupadoDia[];
  readonly atualizadoEmIso: string;
}

export interface SlotHorarioDisponivel {
  readonly horarioInicio: string;
  readonly horarioFim: string;
  readonly periodo: "manha" | "tarde" | "noite";
}

export interface DisponibilidadeDiaPublico {
  readonly dataIso: string;
  readonly slots: readonly SlotHorarioDisponivel[];
}

export interface RespostaDisponibilidadeAgendaPublica {
  readonly agendaAtiva: boolean;
  readonly fusoHorario: string;
  readonly duracaoSlotMinutos: number;
  readonly anoMes: string;
  readonly diasDisponiveis: readonly DisponibilidadeDiaPublico[];
  readonly proximoDiaDisponivelOpcional?: string;
}

export const FUSO_HORARIO_PADRAO_AGENDA = "America/Sao_Paulo";

export const FAIXAS_HORARIO_PADRAO_AGENDA: readonly FaixaHorarioDia[] = [
  { inicio: "09:00", fim: "12:00" },
  { inicio: "14:00", fim: "18:00" },
];

export function criarConfiguracaoAgendaPadrao(
  organizacaoId: string,
  agoraIso = new Date().toISOString(),
): ConfiguracaoAgendaOrganizacao {
  return {
    organizacaoId,
    ativo: true,
    fusoHorario: FUSO_HORARIO_PADRAO_AGENDA,
    duracaoSlotMinutos: 60,
    intervaloEntreSlotsMinutos: 0,
    antecedenciaMinimaHoras: 2,
    janelaMaximaDias: 60,
    datasAbertas: {},
    horarioPadraoAplicacaoRapida: FAIXAS_HORARIO_PADRAO_AGENDA,
    atualizadoEmIso: agoraIso,
  };
}

