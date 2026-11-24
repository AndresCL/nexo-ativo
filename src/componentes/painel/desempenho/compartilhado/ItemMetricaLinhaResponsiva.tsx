"use client";

import type { ReactNode } from "react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface DadoMetricaLinha {
  readonly rotulo: string;
  readonly valor: string;
  readonly destaque?: "forte" | "medio" | "suave";
}

export interface PropriedadesItemMetricaLinhaResponsiva {
  readonly titulo: ReactNode;
  readonly corIndicador: string;
  readonly metricas: readonly DadoMetricaLinha[];
  readonly icone?: ReactNode;
  readonly acaoDireita?: ReactNode;
  readonly percentualBarra?: number;
  readonly atenuado?: boolean;
}

const CLASSE_DESTAQUE: Readonly<Record<NonNullable<DadoMetricaLinha["destaque"]>, string>> = {
  forte: "font-bold text-mineral-950",
  medio: "font-semibold text-mineral-800",
  suave: "font-medium text-mineral-500",
};

/**
 * Linha de métrica responsiva em 2 níveis:
 * - Linha 1: indicador de cor, ícone opcional, título completo (sem corte) e ação à direita.
 * - Linha 2: métricas compactas em grade alinhada para web e mobile.
 * - Linha 3 (opcional): barra de progresso proporcional.
 */
export function ItemMetricaLinhaResponsiva({
  titulo,
  corIndicador,
  metricas,
  icone,
  acaoDireita,
  percentualBarra,
  atenuado = false,
}: PropriedadesItemMetricaLinhaResponsiva) {
  const larguraBarra =
    percentualBarra !== undefined && percentualBarra > 0
      ? `${Math.min(Math.max(percentualBarra, 3), 100)}%`
      : "0%";

  const classeGradeMetricas =
    metricas.length <= 3 ? "grid-cols-3" : "grid-cols-4";

  return (
    <div
      className={combinarClasses(
        "rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50/70",
        atenuado ? "opacity-65 hover:opacity-100" : "",
      )}
    >
      {/* Linha 1: Título completo + ação opcional */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className="h-3.5 w-1 shrink-0 rounded-full"
            style={{ backgroundColor: corIndicador }}
            aria-hidden="true"
          />
          {icone ? <span className="shrink-0">{icone}</span> : null}
          <div className="min-w-0 flex-1 text-xs font-semibold leading-snug text-mineral-950 break-words">
            {titulo}
          </div>
        </div>
        {acaoDireita ? <div className="shrink-0">{acaoDireita}</div> : null}
      </div>

      {/* Linha 2: Métricas compactas em grade */}
      <div className={combinarClasses("mt-2 grid gap-2 pl-3", classeGradeMetricas)}>
        {metricas.map((metrica) => (
          <div key={metrica.rotulo} className="min-w-0">
            <div className="text-[10px] font-medium leading-tight text-mineral-400">
              {metrica.rotulo}
            </div>
            <div
              className={combinarClasses(
                "mt-0.5 text-xs tabular-nums",
                CLASSE_DESTAQUE[metrica.destaque ?? "medio"],
              )}
            >
              {metrica.valor}
            </div>
          </div>
        ))}
      </div>

      {/* Linha 3 (opcional): Barra de progresso proporcional */}
      {percentualBarra !== undefined ? (
        <div className="mt-2 ml-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-500 motion-reduce:transition-none"
            style={{
              width: larguraBarra,
              backgroundColor: corIndicador,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

