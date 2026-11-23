import {
  adicionarDiasDataIso,
  converterHorarioParaMinutos,
  converterMinutosParaHorario,
  diferencaDiasEntreDatasIso,
  ehDataIsoValida,
  obterDataHoraAtualNoFuso,
} from "./calendarioDatas";
import type {
  ConfiguracaoAgendaOrganizacao,
  DisponibilidadeDiaPublico,
  IntervaloOcupadoDia,
  SlotHorarioDisponivel,
} from "./tiposAgenda";

/**
 * Verifica se dois intervalos semi-abertos [inicioA, fimA) e [inicioB, fimB) se sobrepõem.
 */
export function intervalosSeSobrepoem(
  inicioA: number,
  fimA: number,
  inicioB: number,
  fimB: number,
): boolean {
  return inicioA < fimB && inicioB < fimA;
}

export function classificarPeriodoHorario(inicioMin: number): "manha" | "tarde" | "noite" {
  if (inicioMin < 12 * 60) return "manha";
  if (inicioMin < 18 * 60) return "tarde";
  return "noite";
}

export interface ParametrosGeracaoSlotsDia {
  readonly configuracao: ConfiguracaoAgendaOrganizacao;
  readonly dataIso: string;
  readonly intervalosOcupados: readonly IntervaloOcupadoDia[];
  readonly agora?: Date;
}

/**
 * Calcula de forma pura todos os horários livres de uma data civil específica,
 * respeitando faixas abertas, duração, intervalo, antecedência mínima, janela máxima
 * e não-sobreposição com reservas existentes.
 */
export function gerarSlotsDisponiveisParaDia(
  parametros: ParametrosGeracaoSlotsDia,
): readonly SlotHorarioDisponivel[] {
  const { configuracao, dataIso, intervalosOcupados, agora = new Date() } = parametros;

  if (!configuracao.ativo || !ehDataIsoValida(dataIso)) {
    return [];
  }

  const faixas = configuracao.datasAbertas[dataIso];
  if (!faixas || faixas.length === 0) {
    return [];
  }

  const agoraLocal = obterDataHoraAtualNoFuso(agora, configuracao.fusoHorario);
  const diferencaDias = diferencaDiasEntreDatasIso(agoraLocal.dataIso, dataIso);

  if (diferencaDias < 0 || diferencaDias > configuracao.janelaMaximaDias) {
    return [];
  }

  const duracao = Math.max(15, Math.min(240, Math.floor(configuracao.duracaoSlotMinutos)));
  const passo = duracao + Math.max(0, Math.floor(configuracao.intervaloEntreSlotsMinutos));
  const antecedenciaMinutos = Math.max(0, configuracao.antecedenciaMinimaHoras) * 60;
  const minutosLimiteAntecedencia = agoraLocal.minutosDoDia + antecedenciaMinutos;
  const minutosDesdeHoje = diferencaDias * 1440;

  const faixasOrdenadas = [...faixas]
    .map((f) => ({
      inicioMin: converterHorarioParaMinutos(f.inicio),
      fimMin: converterHorarioParaMinutos(f.fim),
    }))
    .filter((f) => f.fimMin > f.inicioMin)
    .sort((a, b) => a.inicioMin - b.inicioMin);

  const slotsUnicos = new Map<number, SlotHorarioDisponivel>();

  for (const faixa of faixasOrdenadas) {
    for (
      let inicioMin = faixa.inicioMin;
      inicioMin + duracao <= faixa.fimMin;
      inicioMin += passo
    ) {
      const fimMin = inicioMin + duracao;

      // Respeita antecedência mínima mesmo quando cruza meia-noite (ex.: 24h de antecedência)
      if (minutosDesdeHoje + inicioMin < minutosLimiteAntecedencia) {
        continue;
      }

      const conflita = intervalosOcupados.some((ocupado) =>
        intervalosSeSobrepoem(inicioMin, fimMin, ocupado.inicioMin, ocupado.fimMin),
      );

      if (conflita) {
        continue;
      }

      if (!slotsUnicos.has(inicioMin)) {
        slotsUnicos.set(inicioMin, {
          horarioInicio: converterMinutosParaHorario(inicioMin),
          horarioFim: converterMinutosParaHorario(fimMin),
          periodo: classificarPeriodoHorario(inicioMin),
        });
      }
    }
  }

  return Array.from(slotsUnicos.entries())
    .sort(([a], [b]) => a - b)
    .map(([, slot]) => slot);
}

/**
 * Calcula a disponibilidade de todas as datas abertas dentro de um mês específico ("YYYY-MM").
 */
export function gerarDisponibilidadeMensal(parametros: {
  readonly configuracao: ConfiguracaoAgendaOrganizacao;
  readonly anoMes: string;
  readonly ocupacaoPorData: Readonly<Record<string, readonly IntervaloOcupadoDia[]>>;
  readonly agora?: Date;
}): readonly DisponibilidadeDiaPublico[] {
  const { configuracao, anoMes, ocupacaoPorData, agora = new Date() } = parametros;
  if (!configuracao.ativo) {
    return [];
  }

  const prefixoMes = `${anoMes}-`;
  const datasDoMes = Object.keys(configuracao.datasAbertas)
    .filter((dataIso) => dataIso.startsWith(prefixoMes))
    .sort();

  const resultado: DisponibilidadeDiaPublico[] = [];

  for (const dataIso of datasDoMes) {
    const slots = gerarSlotsDisponiveisParaDia({
      configuracao,
      dataIso,
      intervalosOcupados: ocupacaoPorData[dataIso] ?? [],
      agora,
    });
    if (slots.length > 0) {
      resultado.push({ dataIso, slots });
    }
  }

  return resultado;
}

/**
 * Encontra a próxima data com horários livres dentro da janela configurada (útil para auto-avançar mês).
 */
export function encontrarProximoDiaDisponivel(parametros: {
  readonly configuracao: ConfiguracaoAgendaOrganizacao;
  readonly ocupacaoPorData: Readonly<Record<string, readonly IntervaloOcupadoDia[]>>;
  readonly agora?: Date;
}): string | undefined {
  const { configuracao, ocupacaoPorData, agora = new Date() } = parametros;
  if (!configuracao.ativo) {
    return undefined;
  }

  const agoraLocal = obterDataHoraAtualNoFuso(agora, configuracao.fusoHorario);
  const dataLimite = adicionarDiasDataIso(agoraLocal.dataIso, configuracao.janelaMaximaDias);

  const datasOrdenadas = Object.keys(configuracao.datasAbertas)
    .filter((dataIso) => dataIso >= agoraLocal.dataIso && dataIso <= dataLimite)
    .sort();

  for (const dataIso of datasOrdenadas) {
    const slots = gerarSlotsDisponiveisParaDia({
      configuracao,
      dataIso,
      intervalosOcupados: ocupacaoPorData[dataIso] ?? [],
      agora,
    });
    if (slots.length > 0) {
      return dataIso;
    }
  }

  return undefined;
}

