export const CODIGOS_CATEGORIA_DESPESA_FUNDADOR = [
  "firebase",
  "resend",
  "infraestrutura",
  "ia",
  "ferramentas",
  "marketing",
  "impostos",
  "outros",
] as const;

export type CategoriaDespesaFundador = (typeof CODIGOS_CATEGORIA_DESPESA_FUNDADOR)[number];

export const CODIGOS_CLASSIFICACAO_CUSTO_FUNDADOR = ["cogs", "opex"] as const;

export type ClassificacaoCustoFundador = (typeof CODIGOS_CLASSIFICACAO_CUSTO_FUNDADOR)[number];

export interface DescritorCategoriaDespesaFundador {
  readonly rotulo: string;
  readonly descricao: string;
  readonly classificacaoPadrao: ClassificacaoCustoFundador;
  readonly corHex: string;
  readonly classeBadge: string;
}

export const DESCRITORES_CATEGORIA_DESPESA_FUNDADOR: Readonly<
  Record<CategoriaDespesaFundador, DescritorCategoriaDespesaFundador>
> = {
  firebase: {
    rotulo: "Firebase / Servidores",
    descricao: "Firestore, Auth, Hosting, Cloud Functions e armazenamento",
    classificacaoPadrao: "cogs",
    corHex: "#d97706",
    classeBadge: "bg-amber-50 text-amber-800 border-amber-200",
  },
  resend: {
    rotulo: "Resend / E-mail",
    descricao: "Envio de e-mails transacionais e domínios de disparo",
    classificacaoPadrao: "cogs",
    corHex: "#0284c7",
    classeBadge: "bg-sky-50 text-sky-800 border-sky-200",
  },
  infraestrutura: {
    rotulo: "Infraestrutura",
    descricao: "Hospedagem, CDN, banco de dados ou APIs de entrega do app",
    classificacaoPadrao: "cogs",
    corHex: "#0f766e",
    classeBadge: "bg-teal-50 text-teal-800 border-teal-200",
  },
  ia: {
    rotulo: "IA (Dev / Produtividade)",
    descricao: "Assinaturas e créditos de IA para desenvolvimento e operação",
    classificacaoPadrao: "opex",
    corHex: "#4f46e5",
    classeBadge: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  ferramentas: {
    rotulo: "Ferramentas & Domínios",
    descricao: "IDE, GitHub, domínios, design, produtividade e softwares internos",
    classificacaoPadrao: "opex",
    corHex: "#7c3aed",
    classeBadge: "bg-violet-50 text-violet-800 border-violet-200",
  },
  marketing: {
    rotulo: "Marketing & Aquisição",
    descricao: "Anúncios, conteúdo, prospecção e patrocínios",
    classificacaoPadrao: "opex",
    corHex: "#e11d48",
    classeBadge: "bg-rose-50 text-rose-800 border-rose-200",
  },
  impostos: {
    rotulo: "Impostos & Contabilidade",
    descricao: "DAS, tributos, contador e taxas administrativas",
    classificacaoPadrao: "opex",
    corHex: "#475569",
    classeBadge: "bg-slate-100 text-slate-800 border-slate-200",
  },
  outros: {
    rotulo: "Outros gastos",
    descricao: "Despesas operacionais diversas",
    classificacaoPadrao: "opex",
    corHex: "#64748b",
    classeBadge: "bg-stone-100 text-stone-700 border-stone-200",
  },
};

export interface DespesaOperacionalFundador {
  readonly id: string;
  readonly titulo: string;
  readonly categoria: CategoriaDespesaFundador;
  readonly classificacao: ClassificacaoCustoFundador;
  readonly anoMes: string; // YYYY-MM
  readonly valorCentavos: number;
  readonly valorOriginalUsd?: number;
  readonly cotacaoDolar?: number;
  readonly recorrente: boolean;
  readonly observacao?: string;
  readonly criadoEmIso: string;
  readonly atualizadoEmIso: string;
}

export interface ParametrosCriarDespesaFundador {
  readonly titulo: string;
  readonly categoria: CategoriaDespesaFundador;
  readonly classificacao?: ClassificacaoCustoFundador;
  readonly anoMes: string;
  readonly valorCentavos: number;
  readonly valorOriginalUsd?: number;
  readonly cotacaoDolar?: number;
  readonly recorrente?: boolean;
  readonly observacao?: string;
}

export interface ParametrosAtualizarDespesaFundador {
  readonly titulo?: string;
  readonly categoria?: CategoriaDespesaFundador;
  readonly classificacao?: ClassificacaoCustoFundador;
  readonly anoMes?: string;
  readonly valorCentavos?: number;
  readonly valorOriginalUsd?: number | null;
  readonly cotacaoDolar?: number | null;
  readonly recorrente?: boolean;
  readonly observacao?: string | null;
}

export interface ParametrosCopiarDespesasMesAnterior {
  readonly anoMesDestino: string;
}

const MESES_ABREVIADOS_PT_BR = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
] as const;

export function obterClassificacaoPadraoCategoria(
  categoria: CategoriaDespesaFundador,
): ClassificacaoCustoFundador {
  return DESCRITORES_CATEGORIA_DESPESA_FUNDADOR[categoria].classificacaoPadrao;
}

/**
 * Retorna o ano-mês atual no fuso horário de São Paulo (YYYY-MM),
 * evitando virada prematura de mês por UTC.
 */
export function obterAnoMesAtualSaoPaulo(dataReferencia: Date = new Date()): string {
  const formatador = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  });
  const partes = formatador.formatToParts(dataReferencia);
  const ano = partes.find((p) => p.type === "year")?.value ?? String(dataReferencia.getFullYear());
  const mes =
    partes.find((p) => p.type === "month")?.value ??
    String(dataReferencia.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

export function obterAnoMesAnterior(anoMes: string): string {
  const [anoStr, mesStr] = anoMes.split("-");
  const ano = Number(anoStr);
  const mes = Number(mesStr);
  if (!Number.isInteger(ano) || !Number.isInteger(mes) || mes < 1 || mes > 12) {
    return obterAnoMesAtualSaoPaulo();
  }
  if (mes === 1) {
    return `${ano - 1}-12`;
  }
  return `${ano}-${String(mes - 1).padStart(2, "0")}`;
}

export function formatarRotuloAnoMes(anoMes: string): string {
  const [anoStr, mesStr] = anoMes.split("-");
  const mesIndice = Number(mesStr) - 1;
  const rotuloMes = MESES_ABREVIADOS_PT_BR[mesIndice];
  if (!rotuloMes || !anoStr) {
    return anoMes;
  }
  return `${rotuloMes}/${anoStr.slice(-2)}`;
}

export function converterUsdParaCentavosBrl(valorUsd: number, cotacaoDolar: number): number {
  if (!Number.isFinite(valorUsd) || !Number.isFinite(cotacaoDolar) || valorUsd <= 0 || cotacaoDolar <= 0) {
    return 0;
  }
  return Math.round(valorUsd * cotacaoDolar * 100);
}

