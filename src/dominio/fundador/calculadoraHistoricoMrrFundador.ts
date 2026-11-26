import type { SituacaoCobrancaAsaas } from "../assinaturas/tiposAssinaturaAsaas";
import type { PontoHistoricoMrrMensal } from "./tiposPainelFundador";

export interface CobrancaParaHistoricoMrr {
  readonly assinaturaAsaasId?: string;
  readonly valorCentavos: number;
  readonly valorLiquidoCentavos?: number;
  readonly situacao: SituacaoCobrancaAsaas | string;
  readonly dataVencimentoIso?: string;
  readonly dataPagamentoIso?: string;
}

export interface ParametrosCalculoHistoricoMrr {
  readonly cobrancas: readonly CobrancaParaHistoricoMrr[];
  readonly mrrLiquidoAtualCentavos: number;
  readonly mrrBrutoAtualCentavos: number;
  readonly dataReferencia?: Date;
  readonly quantidadeMeses?: number;
}

const MESES_ABREVIADOS_PT = [
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

const SITUACOES_PAGAS: ReadonlySet<string> = new Set(["RECEIVED", "CONFIRMED"]);

function extrairAnoMesCompetencia(dataIso?: string): string | null {
  if (!dataIso || typeof dataIso !== "string") {
    return null;
  }
  const match = /^(\d{4})-(\d{2})/.exec(dataIso.trim());
  if (!match) {
    return null;
  }
  return `${match[1]}-${match[2]}`;
}

export function formatarRotuloAnoMes(anoMes: string): string {
  const [anoStr, mesStr] = anoMes.split("-");
  const indiceMes = Number(mesStr) - 1;
  const nomeMes = MESES_ABREVIADOS_PT[indiceMes] ?? mesStr ?? "";
  const anoCurto = (anoStr ?? "").slice(-2);
  return `${nomeMes}/${anoCurto}`;
}

function gerarListaUltimosMeses(dataReferencia: Date, quantidadeMeses: number): readonly string[] {
  const total = Math.max(1, Math.min(24, Math.floor(quantidadeMeses)));
  const anoBase = dataReferencia.getUTCFullYear();
  const mesBase = dataReferencia.getUTCMonth(); // 0..11
  const meses: string[] = [];

  for (let deslocamento = total - 1; deslocamento >= 0; deslocamento -= 1) {
    const data = new Date(Date.UTC(anoBase, mesBase - deslocamento, 1));
    const ano = data.getUTCFullYear();
    const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
    meses.push(`${ano}-${mes}`);
  }

  return meses;
}

/**
 * Consolida a série histórica mensal de MRR (líquido e bruto) dos últimos N meses.
 * - Considera apenas cobranças recorrentes (`assinaturaAsaasId` presente) e pagas (`RECEIVED` ou `CONFIRMED`).
 * - Agrupa por competência (`dataVencimentoIso`, com fallback para `dataPagamentoIso`).
 * - No mês atual, garante piso igual ao MRR recorrente ativo para evitar falsa queda no início do mês.
 */
export function calcularSerieHistoricaMrrMensal(
  parametros: ParametrosCalculoHistoricoMrr,
): readonly PontoHistoricoMrrMensal[] {
  const dataReferencia = parametros.dataReferencia ?? new Date();
  const quantidadeMeses = parametros.quantidadeMeses ?? 6;
  const meses = gerarListaUltimosMeses(dataReferencia, quantidadeMeses);
  const anoMesAtual = meses[meses.length - 1] ?? "";

  const acumuladoPorMes = new Map<
    string,
    { bruto: number; liquido: number; quantidade: number }
  >();
  for (const anoMes of meses) {
    acumuladoPorMes.set(anoMes, { bruto: 0, liquido: 0, quantidade: 0 });
  }

  for (const cobranca of parametros.cobrancas) {
    if (!cobranca.assinaturaAsaasId || !SITUACOES_PAGAS.has(cobranca.situacao)) {
      continue;
    }

    const anoMes =
      extrairAnoMesCompetencia(cobranca.dataVencimentoIso) ??
      extrairAnoMesCompetencia(cobranca.dataPagamentoIso);
    if (!anoMes) {
      continue;
    }

    const balde = acumuladoPorMes.get(anoMes);
    if (!balde) {
      continue;
    }

    const bruto =
      Number.isFinite(cobranca.valorCentavos) && cobranca.valorCentavos > 0
        ? Math.round(cobranca.valorCentavos)
        : 0;
    const liquido =
      typeof cobranca.valorLiquidoCentavos === "number" &&
      Number.isFinite(cobranca.valorLiquidoCentavos) &&
      cobranca.valorLiquidoCentavos > 0
        ? Math.round(cobranca.valorLiquidoCentavos)
        : bruto;

    balde.bruto += bruto;
    balde.liquido += liquido;
    balde.quantidade += 1;
  }

  return meses.map((anoMes) => {
    const balde = acumuladoPorMes.get(anoMes) ?? { bruto: 0, liquido: 0, quantidade: 0 };
    const ehMesAtual = anoMes === anoMesAtual;

    const mrrBrutoCentavos = ehMesAtual
      ? Math.max(balde.bruto, Math.max(0, Math.round(parametros.mrrBrutoAtualCentavos)))
      : balde.bruto;
    const mrrLiquidoCentavos = ehMesAtual
      ? Math.max(balde.liquido, Math.max(0, Math.round(parametros.mrrLiquidoAtualCentavos)))
      : balde.liquido;
    const taxasAsaasCentavos = Math.max(0, mrrBrutoCentavos - mrrLiquidoCentavos);

    return {
      anoMes,
      rotuloMes: formatarRotuloAnoMes(anoMes),
      mrrLiquidoCentavos,
      mrrBrutoCentavos,
      taxasAsaasCentavos,
      quantidadeCobrancas: balde.quantidade,
      mesAtual: ehMesAtual,
    };
  });
}

