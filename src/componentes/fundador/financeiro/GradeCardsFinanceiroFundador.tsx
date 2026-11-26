"use client";

import { ArrowDownRight, ArrowUpRight, Percent, Scale, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import type {
  PontoResultadoFinanceiroMensal,
  UnitEconomicsFundador,
} from "@/dominio/fundador/calculadoraResultadoFinanceiroFundador";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";

export interface PropriedadesGradeCardsFinanceiroFundador {
  readonly resumo: PontoResultadoFinanceiroMensal;
  readonly unitEconomics: UnitEconomicsFundador;
}

function formatarReais(centavos: number): string {
  const negativo = centavos < 0;
  const formatado = ValorMonetarioCentavos.deCentavos(
    Math.abs(centavos),
  ).formatarMoedaBrasileira();
  return negativo ? `-${formatado}` : formatado;
}

function formatarPercentual(valor: number | null): string {
  if (valor === null) {
    return "—";
  }
  return `${valor.toFixed(1).replace(".", ",")}%`;
}

export function GradeCardsFinanceiroFundador({
  resumo,
  unitEconomics,
}: PropriedadesGradeCardsFinanceiroFundador) {
  const lucroPositivo = resumo.lucroLiquidoCentavos >= 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CartaoSuperficie className="rounded-2xl border border-marfim-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-mineral-500">
            <span>Receita Líquida (pós-Asaas)</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-mineral-950">
            {formatarReais(resumo.receitaLiquidaCentavos)}
          </p>
          <p className="mt-1 text-xs text-mineral-500">
            Bruto {formatarReais(resumo.mrrBrutoCentavos)} · Taxas{" "}
            {formatarReais(resumo.taxasAsaasCentavos)}
          </p>
        </CartaoSuperficie>

        <CartaoSuperficie className="rounded-2xl border border-marfim-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-mineral-500">
            <span>Gastos do Mês</span>
            <ArrowDownRight className="h-4 w-4 text-amber-600" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-mineral-950">
            {formatarReais(resumo.totalDespesasCentavos)}
          </p>
          <p className="mt-1 text-xs text-mineral-500">
            Entrega (COGS) {formatarReais(resumo.cogsCentavos)} · Operação (OpEx){" "}
            {formatarReais(resumo.opexCentavos)}
          </p>
        </CartaoSuperficie>

        <CartaoSuperficie className="rounded-2xl border border-marfim-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-mineral-500">
            <span>Resultado Líquido Estimado</span>
            {lucroPositivo ? (
              <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-600" aria-hidden="true" />
            )}
          </div>
          <p
            className={`mt-2 text-2xl font-bold tracking-tight ${
              lucroPositivo ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {formatarReais(resumo.lucroLiquidoCentavos)}
          </p>
          <p className="mt-1 text-xs text-mineral-500">
            MRR Líquido − Gastos ({resumo.quantidadeDespesas}{" "}
            {resumo.quantidadeDespesas === 1 ? "lançamento" : "lançamentos"})
          </p>
        </CartaoSuperficie>

        <CartaoSuperficie className="rounded-2xl border border-marfim-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-mineral-500">
            <span>Margem Líquida</span>
            <Percent className="h-4 w-4 text-indigo-600" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-mineral-950">
            {formatarPercentual(resumo.margemLiquidaPercentual)}
          </p>
          <p className="mt-1 text-xs text-mineral-500">
            Margem Bruta (pós-COGS): {formatarPercentual(resumo.margemBrutaPercentual)}
          </p>
        </CartaoSuperficie>
      </div>

      <CartaoSuperficie className="rounded-2xl border border-marfim-200 bg-marfim-50/60 px-5 py-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 font-semibold text-mineral-800">
            <Scale className="h-4 w-4 text-indigo-600" aria-hidden="true" />
            <span>Unit Economics ({unitEconomics.assinaturasAtivas} assinaturas pagantes)</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-mineral-600">
            <div>
              <span className="text-mineral-500">ARPU Líquido: </span>
              <strong className="font-semibold text-mineral-950">
                {unitEconomics.arpuLiquidoCentavos !== null
                  ? formatarReais(unitEconomics.arpuLiquidoCentavos)
                  : "—"}
              </strong>
            </div>
            <div>
              <span className="text-mineral-500">Custo entrega/cliente (COGS): </span>
              <strong className="font-semibold text-mineral-950">
                {unitEconomics.custoEntregaPorClienteCentavos !== null
                  ? formatarReais(unitEconomics.custoEntregaPorClienteCentavos)
                  : "—"}
              </strong>
            </div>
            <div className="inline-flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5 text-mineral-400" aria-hidden="true" />
              <span className="text-mineral-500">Break-even: </span>
              <strong className="font-semibold text-mineral-950">
                {unitEconomics.clientesBreakEven !== null
                  ? `${unitEconomics.clientesBreakEven} ${
                      unitEconomics.clientesBreakEven === 1 ? "cliente" : "clientes"
                    }`
                  : "—"}
              </strong>
            </div>
          </div>
        </div>
      </CartaoSuperficie>
    </div>
  );
}

