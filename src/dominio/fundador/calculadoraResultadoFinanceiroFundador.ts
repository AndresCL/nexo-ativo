import {
  DESCRITORES_CATEGORIA_DESPESA_FUNDADOR,
  formatarRotuloAnoMes,
  type CategoriaDespesaFundador,
  type DespesaOperacionalFundador,
} from "./tiposDespesasFundador";
import type { PontoHistoricoMrrMensal } from "./tiposPainelFundador";

export interface PontoResultadoFinanceiroMensal {
  readonly anoMes: string;
  readonly rotuloMes: string;
  readonly mrrBrutoCentavos: number;
  readonly taxasAsaasCentavos: number;
  readonly receitaLiquidaCentavos: number;
  readonly cogsCentavos: number;
  readonly opexCentavos: number;
  readonly totalDespesasCentavos: number;
  readonly lucroBrutoCentavos: number;
  readonly lucroLiquidoCentavos: number;
  readonly margemBrutaPercentual: number | null;
  readonly margemLiquidaPercentual: number | null;
  readonly quantidadeDespesas: number;
}

export interface ItemComposicaoCategoriaDespesa {
  readonly categoria: CategoriaDespesaFundador;
  readonly rotulo: string;
  readonly corHex: string;
  readonly totalCentavos: number;
  readonly quantidade: number;
  readonly percentualSobreDespesas: number;
}

export interface UnitEconomicsFundador {
  readonly assinaturasAtivas: number;
  readonly arpuLiquidoCentavos: number | null;
  readonly custoEntregaPorClienteCentavos: number | null;
  readonly custoTotalPorClienteCentavos: number | null;
  readonly clientesBreakEven: number | null;
}

export interface ResultadoFinanceiroFundador {
  readonly anoMesSelecionado: string;
  readonly resumoMesSelecionado: PontoResultadoFinanceiroMensal;
  readonly serieMensal: readonly PontoResultadoFinanceiroMensal[];
  readonly composicaoPorCategoria: readonly ItemComposicaoCategoriaDespesa[];
  readonly unitEconomics: UnitEconomicsFundador;
}

export interface ParametrosCalculoResultadoFinanceiroFundador {
  readonly historicoMrrMensal: readonly PontoHistoricoMrrMensal[];
  readonly despesas: readonly DespesaOperacionalFundador[];
  readonly anoMesSelecionado: string;
  readonly assinaturasAtivas: number;
}

function calcularPercentualSeguro(numerador: number, denominador: number): number | null {
  if (!Number.isFinite(denominador) || denominador <= 0) {
    return null;
  }
  return Math.round((numerador / denominador) * 1000) / 10;
}

function montarPontoMensal(
  anoMes: string,
  pontoMrr: PontoHistoricoMrrMensal | undefined,
  despesasDoMes: readonly DespesaOperacionalFundador[],
): PontoResultadoFinanceiroMensal {
  const mrrBrutoCentavos = pontoMrr?.mrrBrutoCentavos ?? 0;
  const taxasAsaasCentavos = pontoMrr?.taxasAsaasCentavos ?? 0;
  const receitaLiquidaCentavos = pontoMrr?.mrrLiquidoCentavos ?? 0;

  let cogsCentavos = 0;
  let opexCentavos = 0;

  for (const despesa of despesasDoMes) {
    const valor = Math.max(0, Math.round(despesa.valorCentavos));
    if (despesa.classificacao === "cogs") {
      cogsCentavos += valor;
    } else {
      opexCentavos += valor;
    }
  }

  const totalDespesasCentavos = cogsCentavos + opexCentavos;
  const lucroBrutoCentavos = receitaLiquidaCentavos - cogsCentavos;
  const lucroLiquidoCentavos = receitaLiquidaCentavos - totalDespesasCentavos;

  return {
    anoMes,
    rotuloMes: pontoMrr?.rotuloMes ?? formatarRotuloAnoMes(anoMes),
    mrrBrutoCentavos,
    taxasAsaasCentavos,
    receitaLiquidaCentavos,
    cogsCentavos,
    opexCentavos,
    totalDespesasCentavos,
    lucroBrutoCentavos,
    lucroLiquidoCentavos,
    margemBrutaPercentual: calcularPercentualSeguro(lucroBrutoCentavos, mrrBrutoCentavos),
    margemLiquidaPercentual: calcularPercentualSeguro(lucroLiquidoCentavos, receitaLiquidaCentavos),
    quantidadeDespesas: despesasDoMes.length,
  };
}

/**
 * Cruza o histórico de MRR líquido (pós-taxas Asaas) com os gastos operacionais
 * cadastrados pelo fundador para calcular margens, lucro líquido e unit economics.
 */
export function calcularResultadoFinanceiroFundador({
  historicoMrrMensal,
  despesas,
  anoMesSelecionado,
  assinaturasAtivas,
}: ParametrosCalculoResultadoFinanceiroFundador): ResultadoFinanceiroFundador {
  const mrrPorMes = new Map<string, PontoHistoricoMrrMensal>();
  for (const ponto of historicoMrrMensal) {
    mrrPorMes.set(ponto.anoMes, ponto);
  }

  const despesasPorMes = new Map<string, DespesaOperacionalFundador[]>();
  for (const despesa of despesas) {
    const lista = despesasPorMes.get(despesa.anoMes);
    if (lista) {
      lista.push(despesa);
    } else {
      despesasPorMes.set(despesa.anoMes, [despesa]);
    }
  }

  const mesesOrdenados = Array.from(
    new Set([...historicoMrrMensal.map((p) => p.anoMes), anoMesSelecionado]),
  ).sort();

  const serieMensal = mesesOrdenados.map((anoMes) =>
    montarPontoMensal(anoMes, mrrPorMes.get(anoMes), despesasPorMes.get(anoMes) ?? []),
  );

  const resumoMesSelecionado =
    serieMensal.find((ponto) => ponto.anoMes === anoMesSelecionado) ??
    montarPontoMensal(anoMesSelecionado, mrrPorMes.get(anoMesSelecionado), []);

  const despesasMesSelecionado = despesasPorMes.get(anoMesSelecionado) ?? [];
  const acumuladoCategoria = new Map<
    CategoriaDespesaFundador,
    { totalCentavos: number; quantidade: number }
  >();

  for (const despesa of despesasMesSelecionado) {
    const atual = acumuladoCategoria.get(despesa.categoria) ?? { totalCentavos: 0, quantidade: 0 };
    acumuladoCategoria.set(despesa.categoria, {
      totalCentavos: atual.totalCentavos + Math.max(0, Math.round(despesa.valorCentavos)),
      quantidade: atual.quantidade + 1,
    });
  }

  const composicaoPorCategoria: ItemComposicaoCategoriaDespesa[] = Array.from(
    acumuladoCategoria.entries(),
  )
    .map(([categoria, dados]) => {
      const descritor = DESCRITORES_CATEGORIA_DESPESA_FUNDADOR[categoria];
      const percentual =
        resumoMesSelecionado.totalDespesasCentavos > 0
          ? Math.round((dados.totalCentavos / resumoMesSelecionado.totalDespesasCentavos) * 1000) /
            10
          : 0;
      return {
        categoria,
        rotulo: descritor.rotulo,
        corHex: descritor.corHex,
        totalCentavos: dados.totalCentavos,
        quantidade: dados.quantidade,
        percentualSobreDespesas: percentual,
      };
    })
    .sort((a, b) => b.totalCentavos - a.totalCentavos);

  const assinaturasPagantes = Math.max(0, Math.round(assinaturasAtivas));
  const arpuLiquidoCentavos =
    assinaturasPagantes > 0
      ? Math.round(resumoMesSelecionado.receitaLiquidaCentavos / assinaturasPagantes)
      : null;

  const custoEntregaPorClienteCentavos =
    assinaturasPagantes > 0
      ? Math.round(resumoMesSelecionado.cogsCentavos / assinaturasPagantes)
      : null;

  const custoTotalPorClienteCentavos =
    assinaturasPagantes > 0
      ? Math.round(resumoMesSelecionado.totalDespesasCentavos / assinaturasPagantes)
      : null;

  const clientesBreakEven =
    arpuLiquidoCentavos !== null && arpuLiquidoCentavos > 0
      ? Math.ceil(resumoMesSelecionado.totalDespesasCentavos / arpuLiquidoCentavos)
      : null;

  return {
    anoMesSelecionado,
    resumoMesSelecionado,
    serieMensal,
    composicaoPorCategoria,
    unitEconomics: {
      assinaturasAtivas: assinaturasPagantes,
      arpuLiquidoCentavos,
      custoEntregaPorClienteCentavos,
      custoTotalPorClienteCentavos,
      clientesBreakEven,
    },
  };
}

