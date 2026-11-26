"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PontoHistoricoMrrMensal } from "@/dominio/fundador/tiposPainelFundador";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { TooltipEvolucaoMrr } from "@/componentes/fundador/metricas/TooltipEvolucaoMrr";

export interface PropriedadesGraficoEvolucaoMrrFundador {
  readonly historico: readonly PontoHistoricoMrrMensal[];
}

function formatarEixoReais(valorCentavos: number): string {
  const reais = valorCentavos / 100;
  if (reais === 0) return "R$ 0";
  if (reais >= 1000) {
    return `R$ ${(reais / 1000).toFixed(1).replace(".", ",")}k`;
  }
  return `R$ ${Math.round(reais)}`;
}

export function GraficoEvolucaoMrrFundador({ historico }: PropriedadesGraficoEvolucaoMrrFundador) {
  const dados = [...historico];
  const pontoAtual = dados[dados.length - 1];
  const pontoAnterior = dados.length >= 2 ? dados[dados.length - 2] : undefined;

  const variacaoCentavos =
    pontoAtual && pontoAnterior
      ? pontoAtual.mrrLiquidoCentavos - pontoAnterior.mrrLiquidoCentavos
      : 0;
  const variacaoPercentual =
    pontoAnterior && pontoAnterior.mrrLiquidoCentavos > 0
      ? Math.round((variacaoCentavos / pontoAnterior.mrrLiquidoCentavos) * 100)
      : null;

  const possuiAlgumValor = dados.some(
    (ponto) => ponto.mrrLiquidoCentavos > 0 || ponto.mrrBrutoCentavos > 0,
  );

  return (
    <CartaoSuperficie className="rounded-2xl border border-marfim-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-mineral-950">
            Evolução do MRR (últimos {dados.length} meses)
          </h2>
          <p className="mt-0.5 text-xs text-mineral-500">
            Comparativo mensal entre receita recorrente líquida (pós-taxas Asaas) e bruta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {pontoAnterior && variacaoCentavos !== 0 ? (
            <span
              className={
                variacaoCentavos > 0
                  ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700"
                  : "inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-700"
              }
            >
              {variacaoCentavos > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>
                {variacaoCentavos > 0 ? "+" : "-"}
                {ValorMonetarioCentavos.deCentavos(
                  Math.abs(variacaoCentavos),
                ).formatarMoedaBrasileira()}
                {variacaoPercentual !== null
                  ? ` (${variacaoPercentual > 0 ? "+" : ""}${variacaoPercentual}%)`
                  : ""}{" "}
                vs {pontoAnterior.rotuloMes}
              </span>
            </span>
          ) : null}

          <div className="flex items-center gap-3 text-[11px] text-mineral-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" aria-hidden="true" />
              Líquido
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-mineral-400" aria-hidden="true" />
              Bruto
            </span>
          </div>
        </div>
      </div>

      {!possuiAlgumValor ? (
        <div className="mt-6 flex h-56 items-center justify-center rounded-xl border border-dashed border-marfim-300 bg-marfim-50/50 px-4 text-center text-xs text-mineral-500">
          Ainda não há cobranças recorrentes liquidadas suficientes para traçar a evolução do MRR.
        </div>
      ) : (
        <div className="mt-5 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados} margin={{ top: 10, right: 16, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis
                dataKey="rotuloMes"
                tick={{ fontSize: 11, fill: "#57534e" }}
                axisLine={{ stroke: "#d6d3d1" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatarEixoReais}
                tick={{ fontSize: 11, fill: "#57534e" }}
                axisLine={false}
                tickLine={false}
                width={64}
              />
              <Tooltip content={<TooltipEvolucaoMrr />} />
              <Line
                type="monotone"
                dataKey="mrrBrutoCentavos"
                name="MRR Bruto"
                stroke="#a8a29e"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: "#a8a29e" }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="mrrLiquidoCentavos"
                name="MRR Líquido"
                stroke="#059669"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#059669", strokeWidth: 2, stroke: "#ffffff" }}
                activeDot={{ r: 6, fill: "#059669" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </CartaoSuperficie>
  );
}

