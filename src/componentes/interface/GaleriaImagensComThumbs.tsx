"use client";

import Image from "next/image";
import { useState } from "react";
import type { MidiaItemCatalogo } from "@/dominio/entidades/catalogoConteudo";
import { deveIgnorarOtimizadorImagem } from "@/dominio/entidades/paginaPublicada";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesGaleriaImagensComThumbs {
  readonly imagens: readonly MidiaItemCatalogo[];
  readonly tituloFallback: string;
  readonly sizes?: string;
  readonly className?: string;
  readonly proporcaoClassName?: string;
  readonly temaEscuro?: boolean;
}

/**
 * Exibe uma imagem principal com miniaturas clicáveis abaixo quando houver mais de uma imagem.
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

  const imagensValidas = imagens.filter((item) => item.url.trim().length > 0 && !urlsComErro[item.url]);
  if (imagensValidas.length === 0) return null;

  const indiceSeguro = indiceAtivo < imagensValidas.length ? indiceAtivo : 0;
  const imagemPrincipal = imagensValidas[indiceSeguro];
  if (!imagemPrincipal) return null;

  const registrarErro = (url: string) => {
    setUrlsComErro((prev) => ({ ...prev, [url]: true }));
  };

  return (
    <div className={combinarClasses("space-y-2", className)}>
      <div className={combinarClasses("relative overflow-hidden rounded-xl", proporcaoClassName)}>
        <Image
          src={imagemPrincipal.url}
          alt={imagemPrincipal.textoAlternativo || tituloFallback}
          fill
          sizes={sizes}
          unoptimized={deveIgnorarOtimizadorImagem(imagemPrincipal.url)}
          className="object-cover transition-opacity duration-200"
          style={{
            objectPosition: `${imagemPrincipal.pontoFocal?.xPercentual ?? 50}% ${imagemPrincipal.pontoFocal?.yPercentual ?? 50}%`,
          }}
          onError={() => registrarErro(imagemPrincipal.url)}
        />
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
