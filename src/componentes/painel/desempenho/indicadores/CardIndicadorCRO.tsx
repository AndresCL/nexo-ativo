"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { TooltipInformativo } from "@/componentes/interface/TooltipInformativo";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface ItemSparkline {
  readonly data: string;
  readonly valor: number;
}

export interface PropriedadesCardIndicadorCRO {
  readonly titulo: string;
  readonly valorPrincipal: string | number;
  readonly rotuloFormula: string;
  readonly explicacao: string;
  readonly badgeContexto: string;
  readonly icone: ReactNode;
  readonly corLinha?: string;
  readonly gradienteId: string;
  readonly dadosSparkline: readonly ItemSparkline[];
  readonly alinhamentoTooltip?: "esquerda" | "centro" | "direita";
  readonly className?: string;
}

export function CardIndicadorCRO({
  titulo,
  valorPrincipal,
  rotuloFormula,
  explicacao,
  badgeContexto,
  icone,
  corLinha = "#334155",
  gradienteId,
  dadosSparkline,
  alinhamentoTooltip = "centro",
  className,
}: PropriedadesCardIndicadorCRO) {
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  return (
    <div
      className={combinarClasses(
        "relative flex flex-col justify-between rounded-2xl bg-white p-5 shadow-2xs transition-all hover:shadow-xs focus-within:z-20",
        className,
      )}
    >
      <div>
        {/* Linha de Título, Ícone e Tooltip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TooltipInformativo alinhamento={alinhamentoTooltip} texto={explicacao} />
            <span className="text-xs font-semibold text-mineral-700">{titulo}</span>
          </div>
          <div className="flex h-7 w-7 items-center justify-center text-mineral-800">
            {icone}
          </div>
        </div>

        {/* Valor em Destaque e Badge de Contexto */}
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <p className="text-3xl font-extrabold tracking-tight tabular-nums text-mineral-950">
            {valorPrincipal}
          </p>
          <span className="shrink-0 rounded-full border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
            {badgeContexto}
          </span>
        </div>

        {/* Rótulo da Fórmula Explicada */}
        <p className="mt-1 text-[11px] text-mineral-500 font-normal">
          {rotuloFormula}
        </p>
      </div>

      {/* Sparkline Recharts */}
      <div className="mt-3 border-t border-slate-100 pt-2">
        {!montado ? (
          <div className="h-10 w-full rounded bg-slate-100/60 animate-pulse" />
        ) : (
          <div className="h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dadosSparkline as { data: string; valor: number }[]}
                margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={gradienteId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={corLinha} stopOpacity="0.20" />
                    <stop offset="100%" stopColor={corLinha} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0]?.payload as ItemSparkline | undefined;
                      if (!item) return null;
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white/95 px-2 py-1 text-[10px] shadow-sm">
                          <span className="font-medium text-mineral-600">{item.data}:</span>{" "}
                          <strong className="font-bold text-mineral-950">{item.valor}</strong>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke={corLinha}
                  strokeWidth={1.75}
                  fill={`url(#${gradienteId})`}
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
