"use client";

import Image from "next/image";
import { ZoomIn } from "lucide-react";
import type { PaginaCardapio } from "@/dominio/entidades/cardapioDigital";

interface PropriedadesListaPaginasCardapio {
  readonly tituloCardapio: string;
  readonly paginas: readonly PaginaCardapio[];
  readonly aoAbrirZoom: (pagina: PaginaCardapio, indice: number) => void;
}

export function ListaPaginasCardapio({
  tituloCardapio,
  paginas,
  aoAbrirZoom,
}: PropriedadesListaPaginasCardapio) {
  const total = paginas.length;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-3 py-4 sm:px-5 sm:py-6">
      {paginas.map((pagina, indice) => (
        <figure
          key={`${pagina.url}-${indice}`}
          className="group relative overflow-hidden rounded-2xl border border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] shadow-xs"
        >
          <button
            type="button"
            onClick={() => aoAbrirZoom(pagina, indice)}
            aria-label={`Ampliar página ${indice + 1} de ${tituloCardapio}`}
            className="relative block w-full cursor-zoom-in text-left focus:outline-hidden"
          >
            <Image
              src={pagina.url}
              alt={`${tituloCardapio} — página ${indice + 1}`}
              width={pagina.largura}
              height={pagina.altura}
              unoptimized
              priority={indice === 0}
              loading={indice === 0 ? "eager" : "lazy"}
              className="h-auto w-full object-contain"
            />
            <span className="pointer-events-none absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
              <ZoomIn className="h-3 w-3" aria-hidden="true" />
              <span>
                {indice + 1} / {total}
              </span>
            </span>
          </button>
        </figure>
      ))}
    </div>
  );
}

