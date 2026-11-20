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
      className="my-1 flex items-center justify-center py-0.5"
    >
      <div
        className={combinarClasses(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] transition-colors",
          ehMaiorGargalo && perda > 0
            ? "border-rose-200 bg-rose-50 text-rose-800 font-semibold"
            : perda > 0
              ? "border-slate-200/80 bg-slate-50 text-slate-600 font-medium"
              : "border-slate-200/80 bg-slate-50 text-slate-600 font-medium",
        )}
      >
        {perda > 0 ? (
          <>
            <ArrowDown className="h-2.5 w-2.5 text-rose-500 shrink-0" aria-hidden="true" />
            <span>
              <strong className="font-semibold text-mineral-950">{perda.toLocaleString("pt-BR")}</strong>{" "}
              {perda === 1 ? "desistência" : "desistências"} ({pctPerda}%)
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
    </div>
  );
}
