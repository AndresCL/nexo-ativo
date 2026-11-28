"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import type { PaginaCardapio } from "@/dominio/entidades/cardapioDigital";

interface PropriedadesGradeMiniaturasPaginas {
  readonly paginas: readonly PaginaCardapio[];
  readonly aoMover: (indice: number, direcao: -1 | 1) => void;
  readonly aoRemover: (indice: number) => void;
}

export function GradeMiniaturasPaginas({
  paginas,
  aoMover,
  aoRemover,
}: PropriedadesGradeMiniaturasPaginas) {
  if (paginas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-borda-sutil p-5 text-center text-xs text-texto-secundario">
        Nenhuma página adicionada ainda. Envie um PDF ou imagens acima.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {paginas.map((pagina, indice) => (
        <div
          key={`${pagina.url}-${indice}`}
          className="flex flex-col overflow-hidden rounded-xl border border-borda-sutil bg-superficie-elevada"
        >
          <div className="relative aspect-[3/4] w-full bg-black/5">
            <Image
              src={pagina.url}
              alt={`Página ${indice + 1}`}
              fill
              sizes="160px"
              unoptimized
              className="object-cover"
            />
            <span className="absolute top-1.5 left-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
              Pág. {indice + 1}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 border-t border-borda-sutil p-1.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => aoMover(indice, -1)}
                disabled={indice === 0}
                aria-label="Mover página para trás"
                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-borda-sutil text-texto-secundario hover:text-texto-primario disabled:opacity-35"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => aoMover(indice, 1)}
                disabled={indice === paginas.length - 1}
                aria-label="Mover página para frente"
                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-borda-sutil text-texto-secundario hover:text-texto-primario disabled:opacity-35"
              >
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => aoRemover(indice)}
              aria-label="Remover página"
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

