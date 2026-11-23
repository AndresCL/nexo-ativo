"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MidiaItemCatalogo } from "@/dominio/entidades/catalogoConteudo";
import { deveIgnorarOtimizadorImagem } from "@/dominio/entidades/paginaPublicada";
import { combinarClasses } from "@/utilitarios/combinarClasses";

const LIMIAR_SWIPE_HORIZONTAL_PX = 36;

export interface PropriedadesGaleriaImagensComThumbs {
  readonly imagens: readonly MidiaItemCatalogo[];
  readonly tituloFallback: string;
  readonly sizes?: string;
  readonly className?: string;
  readonly proporcaoClassName?: string;
  readonly temaEscuro?: boolean;
}

/**
 * Exibe uma imagem principal com navegação por swipe horizontal, setas discretas
 * e miniaturas clicáveis abaixo quando houver mais de uma imagem.
 */
export function GaleriaImagensComThumbs({
  imagens,
  tituloFallback,
  sizes = "(max-width: 639px) calc(100vw - 3rem), 408px",
  className,
  proporcaoClassName = "aspect-[16/9]",
  temaEscuro = false,
}: PropriedadesGaleriaImagensComThumbs) {
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [urlsComErro, setUrlsComErro] = useState<Record<string, boolean>>({});
  const inicioGestoRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);

  const chaveGaleria = imagens.map((item) => item.url).join("|");
  useEffect(() => {
    setIndiceAtivo(0);
  }, [chaveGaleria]);

  const imagensValidas = imagens.filter((item) => item.url.trim().length > 0 && !urlsComErro[item.url]);
  if (imagensValidas.length === 0) return null;

  const indiceSeguro = indiceAtivo < imagensValidas.length ? indiceAtivo : 0;
  const imagemPrincipal = imagensValidas[indiceSeguro];
  if (!imagemPrincipal) return null;

  const possuiMultiplasImagens = imagensValidas.length > 1;

  const registrarErro = (url: string) => {
    setUrlsComErro((prev) => ({ ...prev, [url]: true }));
  };

  const irParaAnterior = () => {
    setIndiceAtivo((atual) => (atual - 1 + imagensValidas.length) % imagensValidas.length);
  };

  const irParaProxima = () => {
    setIndiceAtivo((atual) => (atual + 1) % imagensValidas.length);
  };

  const aoIniciarPonteiro = (evento: ReactPointerEvent<HTMLDivElement>) => {
    if (!possuiMultiplasImagens) return;
    const alvo = evento.target as HTMLElement | null;
    if (alvo?.closest("button")) return;
    evento.stopPropagation();
    inicioGestoRef.current = {
      x: evento.clientX,
      y: evento.clientY,
      pointerId: evento.pointerId,
    };
  };

  const aoFinalizarPonteiro = (evento: ReactPointerEvent<HTMLDivElement>) => {
    const inicio = inicioGestoRef.current;
    inicioGestoRef.current = null;
    if (!inicio || inicio.pointerId !== evento.pointerId || !possuiMultiplasImagens) {
      return;
    }

    const deltaX = evento.clientX - inicio.x;
    const deltaY = evento.clientY - inicio.y;

    if (
      Math.abs(deltaX) >= LIMIAR_SWIPE_HORIZONTAL_PX &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.15
    ) {
      evento.stopPropagation();
      if (deltaX < 0) {
        irParaProxima();
      } else {
        irParaAnterior();
      }
    }
  };

  return (
    <div className={combinarClasses("space-y-2", className)}>
      <div
        data-gesto-horizontal={possuiMultiplasImagens ? "true" : undefined}
        onPointerDown={aoIniciarPonteiro}
        onPointerUp={aoFinalizarPonteiro}
        onPointerCancel={() => {
          inicioGestoRef.current = null;
        }}
        className={combinarClasses(
          "relative overflow-hidden rounded-xl select-none",
          possuiMultiplasImagens && "touch-pan-y",
          proporcaoClassName,
        )}
      >
        <Image
          src={imagemPrincipal.url}
          alt={imagemPrincipal.textoAlternativo || tituloFallback}
          fill
          draggable={false}
          sizes={sizes}
          unoptimized={deveIgnorarOtimizadorImagem(imagemPrincipal.url)}
          className="object-cover transition-opacity duration-200"
          style={{
            objectPosition: `${imagemPrincipal.pontoFocal?.xPercentual ?? 50}% ${imagemPrincipal.pontoFocal?.yPercentual ?? 50}%`,
          }}
          onError={() => registrarErro(imagemPrincipal.url)}
        />

        {possuiMultiplasImagens ? (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={(e) => {
                e.stopPropagation();
                irParaAnterior();
              }}
              className="absolute top-1/2 left-2.5 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              onClick={(e) => {
                e.stopPropagation();
                irParaProxima();
              }}
              className="absolute top-1/2 right-2.5 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65 active:scale-95"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <span
              aria-live="polite"
              className="pointer-events-none absolute right-3 bottom-2.5 z-10 rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-white backdrop-blur-md"
            >
              {indiceSeguro + 1} / {imagensValidas.length}
            </span>
          </>
        ) : null}
      </div>

      {imagensValidas.length > 1 ? (
        <div
          className="flex flex-wrap gap-1.5"
          role="tablist"
          aria-label={`Miniaturas de ${tituloFallback}`}
        >
          {imagensValidas.map((item, idx) => {
            const ativo = idx === indiceSeguro;
            return (
              <button
                key={`${item.url}-${idx}`}
                type="button"
                role="tab"
                aria-selected={ativo}
                aria-label={`Ver imagem ${idx + 1} de ${imagensValidas.length}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndiceAtivo(idx);
                }}
                className={combinarClasses(
                  "relative h-11 w-14 shrink-0 overflow-hidden rounded-lg border transition-all focus-visible:outline-2 focus-visible:outline-offset-2",
                  ativo
                    ? temaEscuro
                      ? "border-white ring-2 ring-white/40"
                      : "border-mineral-950 ring-2 ring-mineral-950/25"
                    : temaEscuro
                      ? "border-white/15 opacity-65 hover:opacity-100"
                      : "border-black/15 opacity-65 hover:opacity-100",
                )}
              >
                <Image
                  src={item.url}
                  alt={item.textoAlternativo || `${tituloFallback} (${idx + 1})`}
                  fill
                  sizes="56px"
                  unoptimized={deveIgnorarOtimizadorImagem(item.url)}
                  className="object-cover"
                  style={{
                    objectPosition: `${item.pontoFocal?.xPercentual ?? 50}% ${item.pontoFocal?.yPercentual ?? 50}%`,
                  }}
                  onError={() => registrarErro(item.url)}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
