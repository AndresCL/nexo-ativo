"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export interface PropriedadesGavetaFormularioPainel {
  readonly aberto: boolean;
  readonly titulo: string;
  readonly subtitulo?: string;
  readonly aoFechar: () => void;
  readonly fecharAoClicarFora?: boolean;
  readonly children: ReactNode;
  readonly rodape?: ReactNode;
}

/**
 * Gaveta responsiva para formulários do painel:
 * - Mobile (< lg): sheet em tela cheia (100dvh) com cabeçalho fixo e corpo rolável.
 * - Desktop (lg+): drawer lateral à direita (max-w-xl) mantendo a lista visível ao fundo.
 */
export function GavetaFormularioPainel({
  aberto,
  titulo,
  subtitulo,
  aoFechar,
  fecharAoClicarFora = false,
  children,
  rodape,
}: PropriedadesGavetaFormularioPainel) {
  useEffect(() => {
    if (!aberto) return;
    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        aoFechar();
      }
    }
    window.addEventListener("keydown", aoPressionarTecla);
    return () => window.removeEventListener("keydown", aoPressionarTecla);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-mineral-950/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onClick={(evento) => {
        if (fecharAoClicarFora && evento.target === evento.currentTarget) {
          aoFechar();
        }
      }}
    >
      <div className="flex h-dvh w-full flex-col bg-white shadow-2xl lg:max-w-xl lg:border-l lg:border-marfim-200">
        {/* Cabeçalho fixo */}
        <div className="flex items-start justify-between gap-3 border-b border-marfim-200 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-mineral-950">{titulo}</h2>
            {subtitulo ? (
              <p className="mt-0.5 text-xs leading-relaxed text-mineral-600">{subtitulo}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar formulário"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-marfim-200 bg-white text-mineral-600 transition-colors hover:bg-marfim-100 hover:text-mineral-950 cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Corpo rolável */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {/* Rodapé fixo opcional */}
        {rodape ? (
          <div className="border-t border-marfim-200 bg-marfim-50/70 px-5 py-3.5">{rodape}</div>
        ) : null}
      </div>
    </div>
  );
}

