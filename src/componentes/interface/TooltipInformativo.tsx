"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesTooltipInformativo {
  /** Texto informativo exibido no balão flutuante */
  readonly texto: string;
  /** Posição vertical do balão em relação ao ícone */
  readonly posicao?: "cima" | "baixo";
  /** Alinhamento horizontal do balão */
  readonly alinhamento?: "esquerda" | "centro" | "direita";
  /** Tamanho do ícone indicador em pixels (padrão: 13) */
  readonly tamanhoIcone?: number;
  /** Classes CSS adicionais para o contêiner */
  readonly className?: string;
  /** Elemento opcional disparador customizado (se não fornecido, usa o ícone HelpCircle) */
  readonly children?: ReactNode;
}

const CLASSES_ALINHAMENTO = {
  esquerda: "left-0",
  centro: "left-1/2 -translate-x-1/2",
  direita: "right-0",
} as const;

const CLASSES_POSICAO = {
  cima: "bottom-full mb-1.5",
  baixo: "top-full mt-1.5",
} as const;

export function TooltipInformativo({
  texto,
  posicao = "baixo",
  alinhamento = "centro",
  tamanhoIcone = 13,
  className,
  children,
}: PropriedadesTooltipInformativo) {
  const [visivel, setVisivel] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fecha o tooltip se o usuário clicar fora ou pressionar ESC
  useEffect(() => {
    if (!visivel) return;

    function tratarCliqueFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setVisivel(false);
      }
    }

    function tratarEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setVisivel(false);
      }
    }

    document.addEventListener("mousedown", tratarCliqueFora);
    document.addEventListener("keydown", tratarEsc);
    return () => {
      document.removeEventListener("mousedown", tratarCliqueFora);
      document.removeEventListener("keydown", tratarEsc);
    };
  }, [visivel]);

  return (
    <div
      ref={containerRef}
      className={combinarClasses("relative inline-flex items-center", className)}
      onMouseEnter={() => setVisivel(true)}
      onMouseLeave={() => setVisivel(false)}
    >
      <button
        type="button"
        aria-label={texto}
        aria-expanded={visivel}
        onClick={(e) => {
          e.stopPropagation();
          setVisivel((prev) => !prev);
        }}
        onFocus={() => setVisivel(true)}
        onBlur={() => setVisivel(false)}
        className="inline-flex items-center justify-center rounded-full text-mineral-400 transition-colors hover:text-mineral-800 focus:text-mineral-950 focus:outline-hidden"
      >
        {children ?? <HelpCircle style={{ width: tamanhoIcone, height: tamanhoIcone }} />}
      </button>

      {visivel && (
        <div
          role="tooltip"
          className={combinarClasses(
            "pointer-events-none absolute z-40 w-56 rounded-xl border border-mineral-800 bg-mineral-950/95 px-3 py-2 text-[11px] leading-relaxed font-normal normal-case tracking-normal text-white shadow-xl backdrop-blur-xs transition-opacity duration-150 animate-in fade-in-0 zoom-in-95",
            CLASSES_POSICAO[posicao],
            CLASSES_ALINHAMENTO[alinhamento],
          )}
        >
          {texto}
        </div>
      )}
    </div>
  );
}
