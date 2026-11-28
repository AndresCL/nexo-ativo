"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatarCorComOpacidade,
  parsearCorComOpacidade,
} from "@/utilitarios/corComTransparencia";

const FUNDO_QUADRICULADO =
  "repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%) 50% / 8px 8px";

const ATALHOS_OPACIDADE = [0, 25, 50, 75, 100] as const;

export interface PropriedadesSeletorCorComOpacidade {
  readonly valor: string;
  readonly rotulo: string;
  readonly somenteLeitura?: boolean;
  readonly aoAlterar: (novaCor: string) => void;
}

export function SeletorCorComOpacidade({
  valor,
  rotulo,
  somenteLeitura = false,
  aoAlterar,
}: PropriedadesSeletorCorComOpacidade) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { hex, opacidadePercent } = parsearCorComOpacidade(valor);

  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(evento: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    }

    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", aoClicarFora);
    window.addEventListener("keydown", aoPressionarTecla);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      window.removeEventListener("keydown", aoPressionarTecla);
    };
  }, [aberto]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={somenteLeitura}
        aria-label={`Selecionar cor e transparência: ${rotulo}`}
        aria-expanded={aberto}
        onClick={() => setAberto((atual) => !atual)}
        className="relative h-7 w-8 cursor-pointer overflow-hidden rounded border border-slate-300 p-0.5 transition-shadow hover:ring-2 hover:ring-mineral-950/15 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ background: FUNDO_QUADRICULADO }}
      >
        <span
          className="block h-full w-full rounded-[3px]"
          style={{ backgroundColor: formatarCorComOpacidade(hex, opacidadePercent) }}
        />
      </button>

      {aberto ? (
        <div
          role="dialog"
          aria-label={`Ajustar cor e opacidade: ${rotulo}`}
          className="absolute top-full right-0 z-50 mt-1.5 w-60 space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-mineral-900">Cor base</span>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
              <input
                type="color"
                aria-label={`Cor base: ${rotulo}`}
                value={hex}
                onChange={(e) =>
                  aoAlterar(formatarCorComOpacidade(e.target.value, opacidadePercent))
                }
                className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0"
              />
              <span className="font-mono text-[11px] text-mineral-700">{hex}</span>
            </label>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-mineral-900">Opacidade</span>
              <span className="font-mono text-mineral-600">{opacidadePercent}%</span>
            </div>

            <div
              className="relative flex h-5 items-center rounded-full border border-slate-200 px-1"
              style={{
                backgroundImage: `linear-gradient(to right, transparent, ${hex}), ${FUNDO_QUADRICULADO}`,
              }}
            >
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                aria-label={`Opacidade de ${rotulo}`}
                value={opacidadePercent}
                onChange={(e) => aoAlterar(formatarCorComOpacidade(hex, Number(e.target.value)))}
                className="h-1.5 w-full cursor-pointer appearance-none bg-transparent accent-mineral-950"
              />
            </div>

            <div className="flex items-center justify-between gap-1 pt-0.5">
              {ATALHOS_OPACIDADE.map((nivel) => (
                <button
                  key={nivel}
                  type="button"
                  onClick={() => aoAlterar(formatarCorComOpacidade(hex, nivel))}
                  className={`flex-1 cursor-pointer rounded-md py-1 font-mono text-[10px] transition-colors ${
                    opacidadePercent === nivel
                      ? "bg-mineral-950 text-white"
                      : "bg-slate-100 text-mineral-600 hover:bg-slate-200"
                  }`}
                >
                  {nivel}%
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

