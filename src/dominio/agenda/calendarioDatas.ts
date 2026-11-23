import { FUSO_HORARIO_PADRAO_AGENDA } from "./tiposAgenda";

export interface DataHoraLocalFuso {
  readonly dataIso: string;
  readonly minutosDoDia: number;
  readonly ano: number;
  readonly mes: number;
  readonly dia: number;
}

export interface CelulaCalendarioMensal {
  readonly dataIso: string;
  readonly dia: number;
  readonly pertenceAoMes: boolean;
  readonly diaSemana: number;
}

const REGEX_DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const REGEX_HORA_MM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function ehDataIsoValida(dataIso: string): boolean {
  const m = REGEX_DATA_ISO.exec(dataIso);
  if (!m) return false;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return false;
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    d.getUTCFullYear() === ano &&
    d.getUTCMonth() + 1 === mes &&
    d.getUTCDate() === dia
  );
}

export function converterHorarioParaMinutos(horario: string): number {
  const m = REGEX_HORA_MM.exec(horario.trim());
  if (!m) {
    throw new Error(`Horário inválido: "${horario}". Use o formato HH:mm.`);
  }
  return Number(m[1]) * 60 + Number(m[2]);
}

export function converterMinutosParaHorario(minutos: number): string {
  const normalizado = Math.max(0, Math.min(23 * 60 + 59, Math.floor(minutos)));
  const horas = Math.floor(normalizado / 60);
  const mins = normalizado % 60;
  return `${String(horas).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function decomporDataIso(dataIso: string): {
  readonly ano: number;
  readonly mes: number;
  readonly dia: number;
} {
  const m = REGEX_DATA_ISO.exec(dataIso);
  if (!m) {
    throw new Error(`Data ISO inválida: "${dataIso}".`);
  }
  return { ano: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]) };
}

export function montarDataIso(ano: number, mes: number, dia: number): string {
  return `${String(ano).padStart(4, "0")}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export function montarAnoMes(ano: number, mes: number): string {
  return `${String(ano).padStart(4, "0")}-${String(mes).padStart(2, "0")}`;
}

export function decomporAnoMes(anoMes: string): { readonly ano: number; readonly mes: number } {
  const m = /^(\d{4})-(\d{2})$/.exec(anoMes);
  if (!m) {
    throw new Error(`Ano/mês inválido: "${anoMes}". Use YYYY-MM.`);
  }
  const mes = Number(m[2]);
  if (mes < 1 || mes > 12) {
    throw new Error(`Mês inválido em "${anoMes}".`);
  }
  return { ano: Number(m[1]), mes };
}

export function adicionarDiasDataIso(dataIso: string, dias: number): string {
  const { ano, mes, dia } = decomporDataIso(dataIso);
  const d = new Date(Date.UTC(ano, mes - 1, dia + dias));
  return montarDataIso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function adicionarMesesAnoMes(anoMes: string, deltaMeses: number): string {
  const { ano, mes } = decomporAnoMes(anoMes);
  const d = new Date(Date.UTC(ano, mes - 1 + deltaMeses, 1));
  return montarAnoMes(d.getUTCFullYear(), d.getUTCMonth() + 1);
}

export function diferencaDiasEntreDatasIso(inicioIso: string, fimIso: string): number {
  const a = decomporDataIso(inicioIso);
  const b = decomporDataIso(fimIso);
  const msA = Date.UTC(a.ano, a.mes - 1, a.dia);
  const msB = Date.UTC(b.ano, b.mes - 1, b.dia);
  return Math.round((msB - msA) / 86_400_000);
}

export function obterDiaSemanaDataIso(dataIso: string): number {
  const { ano, mes, dia } = decomporDataIso(dataIso);
  return new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
}

/**
 * Obtém data civil e minutos do dia no fuso horário da organização sem depender do fuso do servidor.
 */
export function obterDataHoraAtualNoFuso(
  agora: Date = new Date(),
  fusoHorario: string = FUSO_HORARIO_PADRAO_AGENDA,
): DataHoraLocalFuso {
  const formatador = new Intl.DateTimeFormat("en-CA", {
    timeZone: fusoHorario,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const partes = formatador.formatToParts(agora);
  const mapa = new Map<string, string>();
  for (const parte of partes) {
    if (parte.type !== "literal") {
      mapa.set(parte.type, parte.value);
    }
  }

  const ano = Number(mapa.get("year") ?? "1970");
  const mes = Number(mapa.get("month") ?? "01");
  const dia = Number(mapa.get("day") ?? "01");
  const horaRaw = Number(mapa.get("hour") ?? "0");
  const hora = horaRaw === 24 ? 0 : horaRaw;
  const minuto = Number(mapa.get("minute") ?? "0");

  return {
    dataIso: montarDataIso(ano, mes, dia),
    minutosDoDia: hora * 60 + minuto,
    ano,
    mes,
    dia,
  };
}

/**
 * Gera todas as células da grade mensal (múltiplo de 7, semanas começando no domingo).
 */
export function gerarMatrizMensalCalendario(anoMes: string): readonly CelulaCalendarioMensal[] {
  const { ano, mes } = decomporAnoMes(anoMes);
  const primeiroDia = new Date(Date.UTC(ano, mes - 1, 1));
  const ultimoDia = new Date(Date.UTC(ano, mes, 0));
  const inicioSemana = primeiroDia.getUTCDay();
  const totalDiasMes = ultimoDia.getUTCDate();

  const celulas: CelulaCalendarioMensal[] = [];

  for (let i = inicioSemana - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(ano, mes - 1, -i));
    celulas.push({
      dataIso: montarDataIso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()),
      dia: d.getUTCDate(),
      pertenceAoMes: false,
      diaSemana: d.getUTCDay(),
    });
  }

  for (let dia = 1; dia <= totalDiasMes; dia += 1) {
    const d = new Date(Date.UTC(ano, mes - 1, dia));
    celulas.push({
      dataIso: montarDataIso(ano, mes, dia),
      dia,
      pertenceAoMes: true,
      diaSemana: d.getUTCDay(),
    });
  }

  let diaProximo = 1;
  while (celulas.length % 7 !== 0) {
    const d = new Date(Date.UTC(ano, mes, diaProximo));
    celulas.push({
      dataIso: montarDataIso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()),
      dia: d.getUTCDate(),
      pertenceAoMes: false,
      diaSemana: d.getUTCDay(),
    });
    diaProximo += 1;
  }

  return celulas;
}

export function listarDatasDoMes(anoMes: string): readonly string[] {
  const { ano, mes } = decomporAnoMes(anoMes);
  const totalDias = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const datas: string[] = [];
  for (let dia = 1; dia <= totalDias; dia += 1) {
    datas.push(montarDataIso(ano, mes, dia));
  }
  return datas;
}

const MESES_PT_BR = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

const MESES_CURTOS_PT_BR = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

const DIAS_SEMANA_PT_BR = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

const DIAS_SEMANA_CURTOS_PT_BR = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

export const ROTULOS_DIAS_SEMANA_CALENDARIO = DIAS_SEMANA_CURTOS_PT_BR;

export function formatarTituloMesPtBr(anoMes: string): string {
  const { ano, mes } = decomporAnoMes(anoMes);
  return `${MESES_PT_BR[mes - 1]} de ${ano}`;
}

export function formatarDataExtensoPtBr(dataIso: string): string {
  const { ano, mes, dia } = decomporDataIso(dataIso);
  const diaSemana = DIAS_SEMANA_PT_BR[obterDiaSemanaDataIso(dataIso)];
  return `${diaSemana}, ${dia} de ${MESES_PT_BR[mes - 1]?.toLowerCase()} de ${ano}`;
}

export function formatarDataCurtaPtBr(dataIso: string): string {
  const { mes, dia } = decomporDataIso(dataIso);
  const diaSemana = DIAS_SEMANA_CURTOS_PT_BR[obterDiaSemanaDataIso(dataIso)];
  return `${diaSemana}, ${String(dia).padStart(2, "0")} ${MESES_CURTOS_PT_BR[mes - 1]}`;
}

export function formatarRotuloFusoHorario(fusoHorario: string): string {
  if (fusoHorario === "America/Sao_Paulo") {
    return "Horário de Brasília";
  }
  return fusoHorario;
}

