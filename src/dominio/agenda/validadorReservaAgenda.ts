import { ErroValidacaoDominio } from "../erros/errosDominio";
import {
  adicionarDiasDataIso,
  converterHorarioParaMinutos,
  ehDataIsoValida,
  obterDataHoraAtualNoFuso,
} from "./calendarioDatas";
import { gerarSlotsDisponiveisParaDia, intervalosSeSobrepoem } from "./geradorHorariosDisponiveis";
import type {
  ConfiguracaoAgendaOrganizacao,
  FaixaHorarioDia,
  IntervaloOcupadoDia,
  SlotHorarioDisponivel,
} from "./tiposAgenda";

export interface ResultadoValidacaoSlotReserva {
  readonly slot: SlotHorarioDisponivel;
  readonly inicioMin: number;
  readonly fimMin: number;
}

/**
 * Valida se uma data e horário escolhidos pelo visitante são elegíveis na agenda
 * e livres de sobreposição com reservas já confirmadas.
 */
export function validarSlotParaReserva(parametros: {
  readonly configuracao: ConfiguracaoAgendaOrganizacao;
  readonly dataIso: string;
  readonly horarioInicio: string;
  readonly intervalosOcupados: readonly IntervaloOcupadoDia[];
  readonly agora?: Date;
}): ResultadoValidacaoSlotReserva {
  const { configuracao, dataIso, horarioInicio, intervalosOcupados, agora = new Date() } =
    parametros;

  if (!configuracao.ativo) {
    throw new ErroValidacaoDominio(
      "Esta agenda não está aberta para novos agendamentos no momento.",
      "AGENDA_INATIVA",
    );
  }

  if (!ehDataIsoValida(dataIso)) {
    throw new ErroValidacaoDominio("A data selecionada é inválida.", "DATA_AGENDA_INVALIDA");
  }

  const slotsSemOcupacao = gerarSlotsDisponiveisParaDia({
    configuracao,
    dataIso,
    intervalosOcupados: [],
    agora,
  });

  const slotValido = slotsSemOcupacao.find((s) => s.horarioInicio === horarioInicio);
  if (!slotValido) {
    throw new ErroValidacaoDominio(
      "O horário selecionado não está mais disponível nesta data.",
      "HORARIO_INDISPONIVEL",
    );
  }

  const inicioMin = converterHorarioParaMinutos(slotValido.horarioInicio);
  const fimMin = converterHorarioParaMinutos(slotValido.horarioFim);

  const possuiColisao = intervalosOcupados.some((ocupado) =>
    intervalosSeSobrepoem(inicioMin, fimMin, ocupado.inicioMin, ocupado.fimMin),
  );

  if (possuiColisao) {
    throw new ErroValidacaoDominio(
      "Este horário acabou de ser reservado por outro visitante. Escolha outro horário disponível.",
      "HORARIO_JA_RESERVADO",
    );
  }

  return { slot: slotValido, inicioMin, fimMin };
}

/**
 * Gera um código curto legível de confirmação (ex.: AGD-7K2M) a partir do identificador.
 */
export function gerarCodigoConfirmacaoAgendamento(semente: string): string {
  const alfabeto = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let hash = 2166136261;
  for (let i = 0; i < semente.length; i += 1) {
    hash ^= semente.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let valor = hash >>> 0;
  let codigo = "";
  for (let i = 0; i < 4; i += 1) {
    codigo += alfabeto[valor % alfabeto.length];
    valor = Math.floor(valor / alfabeto.length);
  }
  return `AGD-${codigo}`;
}

export function gerarChaveIdempotenciaAgendamento(parametros: {
  readonly organizacaoId: string;
  readonly dataIso: string;
  readonly horarioInicio: string;
  readonly emailVisitante: string;
}): string {
  const emailNormalizado = parametros.emailVisitante
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const horaLimpa = parametros.horarioInicio.replace(":", "");
  return `agd-${parametros.organizacaoId.slice(0, 12)}-${parametros.dataIso}-${horaLimpa}-${emailNormalizado.slice(0, 24)}`;
}

/**
 * Remove datas passadas antigas (> `diasRetencao` dias atrás) de `datasAbertas`
 * para evitar crescimento ilimitado do documento `configuracoes/agenda`.
 */
export function podarDatasAbertasPassadas(
  datasAbertas: Readonly<Record<string, readonly FaixaHorarioDia[]>>,
  fusoHorario: string,
  diasRetencao = 7,
  agora: Date = new Date(),
): Record<string, readonly FaixaHorarioDia[]> {
  const hojeLocal = obterDataHoraAtualNoFuso(agora, fusoHorario).dataIso;
  const corteIso = adicionarDiasDataIso(hojeLocal, -Math.max(0, diasRetencao));

  const resultado: Record<string, readonly FaixaHorarioDia[]> = {};
  for (const [dataIso, faixas] of Object.entries(datasAbertas)) {
    if (ehDataIsoValida(dataIso) && dataIso >= corteIso && faixas.length > 0) {
      resultado[dataIso] = faixas;
    }
  }
  return resultado;
}

