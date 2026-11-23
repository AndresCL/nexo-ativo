import { z } from "zod";
import { converterHorarioParaMinutos, ehDataIsoValida } from "@/dominio/agenda/calendarioDatas";

const esquemaHorarioMm = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Informe o horário no formato HH:mm.");

const esquemaDataIso = z
  .string()
  .refine((valor) => ehDataIsoValida(valor), "Informe uma data válida no formato AAAA-MM-DD.");

const esquemaAnoMes = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Informe o mês no formato AAAA-MM.");

export const esquemaFaixaHorarioDia = z
  .object({
    inicio: esquemaHorarioMm,
    fim: esquemaHorarioMm,
  })
  .refine(
    (faixa) => converterHorarioParaMinutos(faixa.fim) > converterHorarioParaMinutos(faixa.inicio),
    "O horário final deve ser maior que o horário inicial.",
  );

export const esquemaConfiguracaoAgendaOrganizacao = z.object({
  organizacaoId: z.string().min(1),
  ativo: z.boolean().default(true),
  fusoHorario: z.string().trim().min(3).max(80).default("America/Sao_Paulo"),
  duracaoSlotMinutos: z.number().int().min(15).max(240),
  intervaloEntreSlotsMinutos: z.number().int().min(0).max(120).default(0),
  antecedenciaMinimaHoras: z.number().int().min(0).max(168).default(2),
  janelaMaximaDias: z.number().int().min(1).max(180).default(60),
  datasAbertas: z.record(esquemaDataIso, z.array(esquemaFaixaHorarioDia).max(8)),
  horarioPadraoAplicacaoRapida: z.array(esquemaFaixaHorarioDia).min(1).max(8),
  atualizadoEmIso: z.string().min(1),
});

export const esquemaConfiguracaoAgendaVitrine = z.object({
  tituloModal: z.string().trim().max(120).optional(),
  descricaoCurtaModal: z.string().trim().max(240).optional(),
  textoBotaoConfirmar: z.string().trim().max(60).optional(),
  mensagemConfirmacaoTitulo: z.string().trim().max(120).optional(),
  mensagemConfirmacaoCorpo: z.string().trim().max(320).optional(),
  exigirTelefone: z.boolean().optional(),
  exibirCampoObservacoes: z.boolean().optional(),
});

export const esquemaConsultaDisponibilidadeAgenda = z.object({
  organizacaoId: z.string().trim().min(1, "Organização inválida.").max(120),
  anoMes: esquemaAnoMes,
});

export const esquemaSubmissaoAgendamentoVisitante = z.object({
  organizacaoId: z.string().trim().min(1).max(120),
  identificadorPublicoOrganizacao: z.string().trim().min(1).max(120),
  microfluxoId: z.string().trim().min(1).max(120),
  tituloExperiencia: z.string().trim().min(1).max(140),
  dataIso: esquemaDataIso,
  horarioInicio: esquemaHorarioMm,
  nomeVisitante: z
    .string()
    .trim()
    .min(2, "Informe seu nome completo.")
    .max(120, "O nome pode ter no máximo 120 caracteres."),
  emailVisitante: z
    .string()
    .trim()
    .toLowerCase()
    .email("Informe um e-mail válido para receber a confirmação.")
    .max(160),
  telefoneOuWhatsapp: z.string().trim().max(30).optional(),
  observacoesVisitante: z.string().trim().max(600).optional(),
  chaveIdempotencia: z.string().trim().min(8).max(120).optional(),
  /** Honeypot invisível anti-bot: deve permanecer vazio. */
  campoArmadilhaBot: z.string().max(200).optional(),
});

export const esquemaAtualizacaoSituacaoAgendamento = z.object({
  organizacaoId: z.string().trim().min(1).max(120),
  agendamentoId: z.string().trim().min(1).max(160),
  situacao: z.enum(["confirmado", "cancelado", "concluido", "nao_compareceu"]),
  observacoesInternas: z.string().trim().max(1000).optional(),
});

export type DadosConsultaDisponibilidadeAgenda = z.infer<
  typeof esquemaConsultaDisponibilidadeAgenda
>;
export type DadosSubmissaoAgendamentoVisitante = z.infer<
  typeof esquemaSubmissaoAgendamentoVisitante
>;
export type DadosAtualizacaoSituacaoAgendamento = z.infer<
  typeof esquemaAtualizacaoSituacaoAgendamento
>;

