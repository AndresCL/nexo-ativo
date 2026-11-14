"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Cell, Funnel, FunnelChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ResumoMetricasPeriodo } from "@/dominio/analytics/tiposMetricasAgregadas";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { CORES_METRICAS_DESEMPENHO } from "./coresMetricasDesempenho";

export interface PropriedadesDiagramaFunilInterativo {
  readonly resumoMetricas: ResumoMetricasPeriodo;
}

export function DiagramaFunilInterativo({ resumoMetricas }: PropriedadesDiagramaFunilInterativo) {
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);
  const totalVisitas = resumoMetricas.totalVisualizacoes;
  const aberturasFluxo = resumoMetricas.totalAberturasMicrofluxo;
  const conclusoesFluxo = resumoMetricas.totalConclusoesMicrofluxo;

  // Cálculos de retenção e drop-off
  const pctInteresse =
    totalVisitas > 0 ? Math.min(100, Math.round((aberturasFluxo / totalVisitas) * 100)) : 0;

  const pctConclusaoSobreAberturas =
    aberturasFluxo > 0 ? Math.min(100, Math.round((conclusoesFluxo / aberturasFluxo) * 100)) : 0;

  const pctConversaoGlobal =
    totalVisitas > 0 ? Math.round((conclusoesFluxo / totalVisitas) * 1000) / 10 : 0;

  // Diagnóstico de saúde do funil
  const saudeFunil =
    pctConversaoGlobal >= 5
      ? {
          rotulo: "Conversão de Alto Impacto",
          cor: "bg-emerald-50 text-emerald-800 border-emerald-200",
        }
      : pctConversaoGlobal > 0
        ? { rotulo: "Funil Ativo & Saudável", cor: "bg-sky-50 text-sky-800 border-sky-200" }
        : {
            rotulo: "Aguardando Interações",
            cor: "bg-marfim-100 text-mineral-600 border-marfim-300",
          };

  // Dados formatados para o Recharts FunnelChart
  const dadosRecharts = useMemo(() => {
    const v1 = Math.max(totalVisitas, 1);
    const v2 = Math.max(aberturasFluxo, 0);
    const v3 = Math.max(conclusoesFluxo, 0);

    return [
      {
        name: "Visitas Vitrine",
        value: v1,
        realValue: totalVisitas,
        taxa: "100%",
        fill: CORES_METRICAS_DESEMPENHO.visualizacoes.principal,
        classeLegenda: "border-indigo-200 bg-indigo-50/70 text-indigo-950",
        classeRotulo: "text-indigo-800",
        rotulo: `${totalVisitas} visitas (100%)`,
        detalhe: "Acessos à vitrine editorial e cartões VIP",
      },
      {
        name: "Microfluxo Aberto",
        value: Math.max(v2, 0.001),
        realValue: aberturasFluxo,
        taxa: `${pctInteresse}%`,
        fill: CORES_METRICAS_DESEMPENHO.aberturas.principal,
        classeLegenda: "border-sky-200 bg-sky-50/70 text-sky-950",
        classeRotulo: "text-sky-800",
        rotulo: `${aberturasFluxo} iniciados (${pctInteresse}%)`,
        detalhe: `${pctInteresse}% das visitas iniciaram este fluxo`,
      },
      {
        name: "Proposta Concluída",
        value: Math.max(v3, 0.0001),
        realValue: conclusoesFluxo,
        taxa: `${pctConversaoGlobal}%`,
        fill: CORES_METRICAS_DESEMPENHO.conclusoes.principal,
        classeLegenda: "border-emerald-200 bg-emerald-50/70 text-emerald-950",
        classeRotulo: "text-emerald-800",
        rotulo: `${conclusoesFluxo} concluídos (${pctConversaoGlobal}%)`,
        detalhe: `${pctConclusaoSobreAberturas}% dos que iniciaram finalizaram`,
      },
    ];
  }, [
    totalVisitas,
    aberturasFluxo,
    conclusoesFluxo,
    pctInteresse,
    pctConversaoGlobal,
    pctConclusaoSobreAberturas,
  ]);

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Seção (Fora do Card) */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white shadow-2xs">
              <Sparkles className="h-3 w-3" />
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-mineral-500 uppercase">
              Pipeline de Conversão
            </span>
          </div>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-mineral-950">
            Funil de Conversão & Retenção
          </h3>
          <p className="mt-0.5 text-xs text-mineral-600">
            Jornada do visitante desde a chegada na vitrine até a conclusão com a equipe.
          </p>
        </div>

        {/* Badge de Saúde do Funil */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Badge de Saúde do Funil */}
          <div
            className={combinarClasses(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-2xs",
              saudeFunil.cor,
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            <span>{saudeFunil.rotulo}</span>
          </div>
        </div>
      </div>

      {/* Card com o Gráfico e Métricas do Funil */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-white p-4 shadow-xs sm:p-6">
        {/* Luz ambiente de fundo sutil */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-100/60 via-sky-100/30 to-transparent blur-3xl"
        />

        {/* Gráfico Visual de Funil (Recharts FunnelChart) */}
        <div className="relative rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-white p-4">
          {montado ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0]?.payload as (typeof dadosRecharts)[0] | undefined;
                        if (!item) return null;
                        return (
                          <div className="rounded-xl border border-marfim-300 bg-white p-3.5 shadow-xl text-xs">
                            <p className={combinarClasses("font-bold", item.classeRotulo)}>
                              {item.name}
                            </p>
                            <p className="mt-1 text-mineral-700">
                              Volume:{" "}
                              <strong className="text-sm font-bold text-mineral-950">
                                {item.realValue}
                              </strong>
                            </p>
                            <p className="text-[11px] text-mineral-500 mt-0.5">{item.detalhe}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Funnel dataKey="value" data={dadosRecharts} isAnimationActive>
                    {dadosRecharts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 w-full animate-pulse rounded-xl bg-marfim-100" />
          )}

          {/* Legenda Estruturada Abaixo do Funil */}
          <div className="mt-4 grid grid-cols-1 gap-2 border-t border-marfim-200/80 pt-4 sm:grid-cols-3">
            {dadosRecharts.map((etapa) => (
              <div
                key={etapa.name}
                className={combinarClasses(
                  "flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 shadow-2xs",
                  etapa.classeLegenda,
                )}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full shadow-2xs"
                  style={{ backgroundColor: etapa.fill }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className={combinarClasses("text-[11px] font-semibold", etapa.classeRotulo)}>
                    {etapa.name}
                  </p>
                  <p className="text-sm font-bold tabular-nums">{etapa.rotulo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
