import type { MetricaQrCode } from "./tiposMetricasAgregadas";

export interface ResumoQrCodeCalculado {
  readonly codigo: string;
  readonly rotulo: string;
  readonly visitas: number;
  readonly fluxos: number;
  readonly conclusoes: number;
  readonly whatsapp: number;
  readonly conversoes: number;
  readonly taxaConversao: number;
  readonly ehFluxoDireto: boolean;
}

export interface OrigemPercursoCalculada {
  readonly total: number;
  readonly permalink: number;
  readonly vitrine: number;
  readonly pctPermalink: number;
  readonly pctVitrine: number;
}

export function formatarRotuloQrCode(codigo: string): string {
  if (codigo === "vitrine") return "Vitrine Principal (Home)";
  if (codigo.startsWith("fluxo_")) return `Fluxo: ${codigo.replace("fluxo_", "")}`;
  if (codigo.startsWith("profissional_")) {
    return `Profissional: ${codigo.replace("profissional_", "")}`;
  }
  return codigo;
}

export function calcularResumoQrCode(item: MetricaQrCode): ResumoQrCodeCalculado {
  const conversoes = item.conclusoesFluxo + item.contatosWhatsapp;
  const taxaConversao =
    item.visualizacoes > 0 ? Math.round((conversoes / item.visualizacoes) * 1000) / 10 : 0;

  return {
    codigo: item.codigo,
    rotulo: formatarRotuloQrCode(item.codigo),
    visitas: item.visualizacoes,
    fluxos: item.aberturasFluxo,
    conclusoes: item.conclusoesFluxo,
    whatsapp: item.contatosWhatsapp,
    conversoes,
    taxaConversao,
    ehFluxoDireto: item.codigo.startsWith("fluxo_"),
  };
}

export function calcularOrigemPercurso(
  aberturas: number,
  aberturasPermalink?: number,
): OrigemPercursoCalculada | null {
  if (aberturas <= 0) return null;
  const permalink = aberturasPermalink ?? 0;
  const vitrine = Math.max(0, aberturas - permalink);
  const pctPermalink = Math.round((permalink / aberturas) * 1000) / 10;
  const pctVitrine = Math.round((vitrine / aberturas) * 1000) / 10;
  return { total: aberturas, permalink, vitrine, pctPermalink, pctVitrine };
}

