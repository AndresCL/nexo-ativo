"use client";

import { AlertTriangle, ArrowDown } from "lucide-react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesConectorAbandonoFunil {
  readonly volumeAnterior: number;
  readonly volumeAtual: number;
  readonly ehMaiorGargalo?: boolean;
}

export function ConectorAbandonoFunil({
  volumeAnterior,
  volumeAtual,
  ehMaiorGargalo = false,
}: PropriedadesConectorAbandonoFunil) {
  const perda = Math.max(volumeAnterior - volumeAtual, 0);
  const pctPerda =
    volumeAnterior > 0 ? Math.round((perda / volumeAnterior) * 1000) / 10 : 0;

  return (
    <div
      aria-label={`${perda} desistências entre as etapas`}
      className="my-1 flex flex-col items-center justify-center"
    >
      <div className="flex items-center gap-2">
        <div className="h-4 w-px bg-slate-300" aria-hidden="true" />
        <div
          className={combinarClasses(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors shadow-2xs",
            ehMaiorGargalo && perda > 0
              ? "border-rose-300 bg-rose-50 text-rose-800 ring-1 ring-rose-200"
              : perda > 0
                ? "border-slate-200 bg-white text-mineral-600"
                : "border-emerald-200 bg-emerald-50 text-emerald-800",
          )}
        >
          {perda > 0 ? (
            <>
              <ArrowDown className="h-3 w-3 text-rose-500 shrink-0" aria-hidden="true" />
              <span>
                <strong>{perda.toLocaleString("pt-BR")}</strong> {perda === 1 ? "desistência" : "desistências"} ({pctPerda}%)
              </span>
              {ehMaiorGargalo ? (
                <span className="ml-1 inline-flex items-center gap-0.5 font-bold text-rose-700">
                  <AlertTriangle className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                  <span>Maior gargalo!</span>
                </span>
              ) : null}
            </>
          ) : (
            <span>✓ 100% de retenção (0 abandonos)</span>
          )}
        </div>
        <div className="h-4 w-px bg-slate-300" aria-hidden="true" />
      </div>
    </div>
  );
}

