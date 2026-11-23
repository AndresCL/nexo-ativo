import { decomporDataIso } from "./calendarioDatas";

export interface ParametrosArquivoIcsAgendamento {
  readonly uid: string;
  readonly titulo: string;
  readonly descricao: string;
  readonly dataIso: string;
  readonly horarioInicio: string;
  readonly horarioFim: string;
  readonly fusoHorario: string;
  readonly localizacaoOpcional?: string;
}

function escaparTextoIcs(texto: string): string {
  return texto
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatarDataHoraLocalIcs(dataIso: string, horario: string): string {
  const { ano, mes, dia } = decomporDataIso(dataIso);
  const [hh, mm] = horario.split(":");
  return `${String(ano).padStart(4, "0")}${String(mes).padStart(2, "0")}${String(dia).padStart(2, "0")}T${hh}${mm}00`;
}

/**
 * Gera conteúdo iCalendar (.ics) no padrão RFC 5545 para o visitante adicionar a reserva
 * diretamente ao Google Calendar, Apple Calendar ou Outlook.
 */
export function gerarConteudoArquivoIcs(parametros: ParametrosArquivoIcsAgendamento): string {
  const agoraUtc = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");

  const inicioLocal = formatarDataHoraLocalIcs(parametros.dataIso, parametros.horarioInicio);
  const fimLocal = formatarDataHoraLocalIcs(parametros.dataIso, parametros.horarioFim);

  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nexo Ativo//Agenda Editorial//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escaparTextoIcs(parametros.uid)}@nexoativo.com.br`,
    `DTSTAMP:${agoraUtc}`,
    `DTSTART;TZID=${parametros.fusoHorario}:${inicioLocal}`,
    `DTEND;TZID=${parametros.fusoHorario}:${fimLocal}`,
    `SUMMARY:${escaparTextoIcs(parametros.titulo)}`,
    `DESCRIPTION:${escaparTextoIcs(parametros.descricao)}`,
    ...(parametros.localizacaoOpcional
      ? [`LOCATION:${escaparTextoIcs(parametros.localizacaoOpcional)}`]
      : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${linhas.join("\r\n")}\r\n`;
}

