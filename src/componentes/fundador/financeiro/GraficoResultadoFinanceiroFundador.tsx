"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  ItemComposicaoCategoriaDespesa,
  PontoResultadoFinanceiroMensal,
} from "@/dominio/fundador/calculadoraResultadoFinanceiroFundador";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";

export interface PropriedadesGraficoResultadoFinanceiroFundador {
  readonly serieMensal: readonly PontoResultadoFinanceiroMensal[];
  readonly composicaoPorCategoria: readonly ItemComposicaoCategoriaDespesa[];
  readonly rotuloMesSelecionado: string;
}

function formatarEixoReais(valorCentavos: number): string {
  const reais = valorCentavos / 100;
  if (reais === 0) return "R$ 0";
  const sinal = reais < 0 ? "-" : "";
  const abs = Math.abs(reais);
  if (abs >= 1000) {
    return `${sinal}R$ ${(abs / 1000).toFixed(1).replace(".", ",")}k`;
  }
  return `${sinal}R$ ${Math.round(abs)}`;
}

function formatarMoedaTooltip(centavos: number): string {
  const sinal = centavos < 0 ? "-" : "";
  return `${sinal}${ValorMonetarioCentavos.deCentavos(Math.abs(centavos)).formatarMoedaBrasileira()}`;
}

export function GraficoResultadoFinanceiroFundador({
  serieMensal,
  composicaoPorCategoria,
  rotuloMesSelecionado,
}: PropriedadesGraficoResultadoFinanceiroFundador) {
  const dados = [...serieMensal];
  const possuiAlgumValor = dados.some(
    (ponto) => ponto.receitaLiquidaCentavos > 0 || ponto.totalDespesasCentavos > 0,
  );

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <CartaoSuperficie className="rounded-2xl border border-marfim-200 bg-white p-5 shadow-xs lg:col-span-2 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-mineral-950">
              Receita Líquida vs. Gastos e Lucro
            </h2>
            <p className="mt-0.5 text-xs text-mineral-500">
              Evolução mensal comparando MRR líquido (pós-Asaas), despesas registradas e resultado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-mineral-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" aria-hidden="true" />
              Receita Líquida
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-amber-500" aria-hidden="true" />
              Gastos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-indigo-600" aria-hidden="true" />
              Lucro
            </span>
          </div>
        </div>

        {!possuiAlgumValor ? (
          <div className="mt-6 flex h-60 items-center justify-center rounded-xl border border-dashed border-marfim-300 bg-marfim-50/50 px-4 text-center text-xs text-mineral-500">
            Registre seu primeiro gasto ou aguarde cobranças liquidadas para visualizar o comparativo.
          </div>
        ) : (
          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dados} margin={{ top: 10, right: 16, left: 4, bottom: 4 }}>
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
                <Tooltip
                  formatter={(valor, nome) => {
                    const numero = typeof valor === "number" ? valor : Number(valor ?? 0);
                    const rotulo =
                      nome === "receitaLiquidaCentavos"
                        ? "Receita Líquida"
                        : nome === "totalDespesasCentavos"
                          ? "Gastos"
                          : "Lucro Líquido";
                    return [formatarMoedaTooltip(numero), rotulo];
                  }}
                  contentStyle={{
                    borderRadius: "12px",
                    borderColor: "#e7e5e4",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="receitaLiquidaCentavos"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="totalDespesasCentavos"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
                <Line
                  type="monotone"
                  dataKey="lucroLiquidoCentavos"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: "#4f46e5" }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CartaoSuperficie>

      <CartaoSuperficie className="rounded-2xl border border-marfim-200 bg-white p-5 shadow-xs sm:p-6">
        <h2 className="text-base font-semibold tracking-tight text-mineral-950">
          Gastos por Categoria
        </h2>
        <p className="mt-0.5 text-xs text-mineral-500">Distribuição em {rotuloMesSelecionado}</p>

        {composicaoPorCategoria.length === 0 ? (
          <div className="mt-6 flex h-52 items-center justify-center rounded-xl border border-dashed border-marfim-300 bg-marfim-50/50 px-4 text-center text-xs text-mineral-500">
            Nenhum gasto registrado neste mês.
          </div>
        ) : (
          <ul className="mt-5 space-y-3.5">
            {composicaoPorCategoria.map((item) => (
              <li key={item.categoria} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-medium text-mineral-800">{item.rotulo}</span>
                  <span className="shrink-0 font-semibold text-mineral-950">
                    {ValorMonetarioCentavos.deCentavos(item.totalCentavos).formatarMoedaBrasileira()}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-marfim-100">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(4, item.percentualSobreDespesas))}%`,
                      backgroundColor: item.corHex,
                    }}
                  />
                </div>
                <p className="text-[11px] text-mineral-500">
                  {item.percentualSobreDespesas.toFixed(1).replace(".", ",")}% · {item.quantidade}{" "}
                  {item.quantidade === 1 ? "item" : "itens"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CartaoSuperficie>
    </div>
  );
}

