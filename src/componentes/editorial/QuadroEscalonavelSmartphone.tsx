"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const LARGURA_INTERNA_PADRAO = 390;
const ALTURA_INTERNA_PADRAO = 800;
const ESPESSURA_BORDA_PX = 6;
const MARGEM_VERTICAL_VIEWPORT_PX = 72;
const ESCALA_MINIMA_PADRAO = 0.78;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface PropriedadesQuadroEscalonavelSmartphone {
  readonly children: ReactNode;
  readonly larguraInterna?: number;
  readonly alturaInterna?: number;
  readonly escalaMinima?: number;
  readonly refMoldura?: (elemento: HTMLDivElement | null) => void;
  readonly dataTestId?: string;
  readonly dataDispositivo?: string;
}

/**
 * Moldura escalonável que preserva a viewport lógica real de um smartphone (390x800 internos)
 * e aplica `transform: scale()` proporcional ao espaço disponível sem distorcer o aspect ratio.
 */
export function QuadroEscalonavelSmartphone({
  children,
  larguraInterna = LARGURA_INTERNA_PADRAO,
  alturaInterna = ALTURA_INTERNA_PADRAO,
  escalaMinima = ESCALA_MINIMA_PADRAO,
  refMoldura,
  dataTestId,
  dataDispositivo,
}: PropriedadesQuadroEscalonavelSmartphone) {
  const refContainer = useRef<HTMLDivElement | null>(null);
  const [escala, setEscala] = useState(1);

  const larguraExterna = larguraInterna + ESPESSURA_BORDA_PX * 2;
  const alturaExterna = alturaInterna + ESPESSURA_BORDA_PX * 2;

  useIsomorphicLayoutEffect(() => {
    const container = refContainer.current;
    if (!container) return;

    const atualizarEscala = () => {
      const larguraDisponivel = container.clientWidth;
      if (larguraDisponivel <= 0) return;

      const alturaDisponivel = Math.max(320, window.innerHeight - MARGEM_VERTICAL_VIEWPORT_PX);
      const escalaX = larguraDisponivel / larguraExterna;
      const escalaY = alturaDisponivel / alturaExterna;
      const escalaAltura = Math.max(escalaMinima, escalaY);
      const novaEscala = Math.min(1, escalaX, escalaAltura);

      setEscala((atual) => (Math.abs(atual - novaEscala) > 0.002 ? novaEscala : atual));
    };

    atualizarEscala();

    const observador = new ResizeObserver(atualizarEscala);
    observador.observe(container);
    window.addEventListener("resize", atualizarEscala);

    return () => {
      observador.disconnect();
      window.removeEventListener("resize", atualizarEscala);
    };
  }, [larguraExterna, alturaExterna, escalaMinima]);

  return (
    <div ref={refContainer} className="flex w-full justify-center">
      <div
        style={{
          width: `${larguraExterna * escala}px`,
          height: `${alturaExterna * escala}px`,
        }}
        className="relative shrink-0"
      >
        <div
          ref={refMoldura}
          data-testid={dataTestId}
          data-dispositivo={dataDispositivo}
          style={{
            width: `${larguraExterna}px`,
            height: `${alturaExterna}px`,
            transform: `scale(${escala})`,
            transformOrigin: "top left",
          }}
          className="relative flex flex-col overflow-hidden rounded-[2.25rem] border-[6px] border-mineral-900 shadow-2xl"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

