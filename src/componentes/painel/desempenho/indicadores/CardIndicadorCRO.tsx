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
  readonly corLinha: string;
  readonly gradienteId: string;
  readonly dadosSparkline: readonly ItemSparkline[];
  readonly varianteCor: "indigo" | "sky" | "violet" | "emerald" | "amber";
  readonly alinhamentoTooltip?: "esquerda" | "centro" | "direita";
}

const ESTILOS_VARIANTE = {
  indigo: {
    borda: "border-indigo-200 hover:border-indigo-300",
    fundo: "bg-gradient-to-b from-indigo-50/80 via-white to-white",
    textoTitulo: "text-indigo-900",
    textoValor: "text-indigo-950",
    badgeFundo: "bg-indigo-100 text-indigo-900",
    iconeFundo: "bg-indigo-600 text-white",
    divisor: "border-indigo-100",
  },
  sky: {
    borda: "border-sky-200 hover:border-sky-300",
    fundo: "bg-gradient-to-b from-sky-50/80 via-white to-white",
    textoTitulo: "text-sky-900",
    textoValor: "text-sky-950",
    badgeFundo: "bg-sky-100 text-sky-900",
    iconeFundo: "bg-sky-600 text-white",
    divisor: "border-sky-100",
  },
  violet: {
    borda: "border-violet-200 hover:border-violet-300",
    fundo: "bg-gradient-to-b from-violet-50/80 via-white to-white",
    textoTitulo: "text-violet-900",
    textoValor: "text-violet-950",
    badgeFundo: "bg-violet-100 text-violet-900",
    iconeFundo: "bg-violet-600 text-white",
    divisor: "border-violet-100",
  },
  emerald: {
    borda: "border-emerald-200 hover:border-emerald-300",
    fundo: "bg-gradient-to-b from-emerald-50/80 via-white to-white",
    textoTitulo: "text-emerald-900",
    textoValor: "text-emerald-950",
    badgeFundo: "bg-emerald-100 text-emerald-900",
    iconeFundo: "bg-emerald-600 text-white",
    divisor: "border-emerald-100",
  },
  amber: {
    borda: "border-amber-200 hover:border-amber-300",
    fundo: "bg-gradient-to-b from-amber-50/80 via-white to-white",
    textoTitulo: "text-amber-900",
    textoValor: "text-amber-950",
    badgeFundo: "bg-amber-100 text-amber-900",
    iconeFundo: "bg-amber-600 text-white",
    divisor: "border-amber-100",
  },
} as const;

export function CardIndicadorCRO({
  titulo,
  valorPrincipal,
  rotuloFormula,
  explicacao,
  badgeContexto,
  icone,
  corLinha,
  gradienteId,
  dadosSparkline,
  varianteCor,
  alinhamentoTooltip = "centro",
}: PropriedadesCardIndicadorCRO) {
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  const estilo = ESTILOS_VARIANTE[varianteCor];

  return (
    <div
      className={combinarClasses(
        "relative flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition-all hover:z-20 hover:shadow-sm focus-within:z-20",
        estilo.borda,
        estilo.fundo,
      )}
    >
      <div>
        {/* Linha de Título, Ícone e Tooltip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TooltipInformativo alinhamento={alinhamentoTooltip} texto={explicacao} />
            <span className={combinarClasses("text-xs font-bold", estilo.textoTitulo)}>
              {titulo}
            </span>
          </div>
          <div
            className={combinarClasses(
              "flex h-7 w-7 items-center justify-center rounded-lg shadow-2xs",
              estilo.iconeFundo,
            )}
          >
            {icone}
          </div>
        </div>

        {/* Valor em Destaque e Badge de Contexto */}
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <p className={combinarClasses("text-3xl font-extrabold tabular-nums", estilo.textoValor)}>
            {valorPrincipal}
          </p>
          <span
            className={combinarClasses(
              "rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0",
              estilo.badgeFundo,
            )}
          >
            {badgeContexto}
          </span>
        </div>

        {/* Rótulo da Fórmula Explicada (De quê em relação a quê) */}
        <p className="mt-1 text-[11px] font-semibold text-mineral-600 tracking-tight">
          {rotuloFormula}
        </p>
      </div>

      {/* Sparkline Recharts */}
      <div className={combinarClasses("mt-3 pt-2 border-t", estilo.divisor)}>
        {!montado ? (
          <div className="h-10 w-full rounded bg-marfim-100/60 animate-pulse" />
        ) : (
          <div className="h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dadosSparkline as { data: string; valor: number }[]}
                margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={gradienteId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={corLinha} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={corLinha} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0]?.payload as ItemSparkline | undefined;
                      if (!item) return null;
                      return (
                        <div className="rounded-lg border border-marfim-300 bg-white/95 px-2 py-1 shadow-md text-[10px]">
                          <span className="font-semibold text-mineral-700">{item.data}:</span>{" "}
                          <strong className="text-mineral-950 font-bold">{item.valor}</strong>
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
                  strokeWidth={2}
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

