"use client";

import { useState } from "react";
import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import type { PaginaCardapio } from "@/dominio/entidades/cardapioDigital";

interface PropriedadesLightboxZoomPagina {
  readonly pagina: PaginaCardapio | null;
  readonly rotuloPagina: string;
  readonly aoFechar: () => void;
}

const NIVEIS_ZOOM = [1, 1.5, 2] as const;

export function LightboxZoomPagina({
  pagina,
  rotuloPagina,
  aoFechar,
}: PropriedadesLightboxZoomPagina) {
  const [indiceZoom, setIndiceZoom] = useState(1);

  if (!pagina) {
    return null;
  }

  const escala = NIVEIS_ZOOM[indiceZoom] ?? 1.5;

  return (
    <DialogoPrimitivo.Root
      open={Boolean(pagina)}
      onOpenChange={(aberto) => {
        if (!aberto) {
          setIndiceZoom(1);
          aoFechar();
        }
      }}
    >
      <DialogoPrimitivo.Portal>
        <DialogoPrimitivo.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs" />
        <DialogoPrimitivo.Content className="fixed inset-0 z-50 flex flex-col focus:outline-hidden">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-black/80 px-4 text-white">
            <DialogoPrimitivo.Title className="truncate text-sm font-medium">
              {rotuloPagina}
            </DialogoPrimitivo.Title>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIndiceZoom((atual) => Math.max(0, atual - 1))}
                disabled={indiceZoom === 0}
                aria-label="Diminuir zoom"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-40"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="min-w-11 text-center text-xs font-semibold">
                {Math.round(escala * 100)}%
              </span>
              <button
                type="button"
                onClick={() =>
                  setIndiceZoom((atual) => Math.min(NIVEIS_ZOOM.length - 1, atual + 1))
                }
                disabled={indiceZoom === NIVEIS_ZOOM.length - 1}
                aria-label="Aumentar zoom"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-40"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
              <DialogoPrimitivo.Close
                aria-label="Fechar ampliação"
                className="ml-1 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </DialogoPrimitivo.Close>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3">
            <div
              style={{ width: `${escala * 100}%` }}
              className="mx-auto min-w-full transition-[width] duration-200"
            >
              <Image
                src={pagina.url}
                alt={rotuloPagina}
                width={pagina.largura}
                height={pagina.altura}
                unoptimized
                className="h-auto w-full rounded-lg"
              />
            </div>
          </div>
        </DialogoPrimitivo.Content>
      </DialogoPrimitivo.Portal>
    </DialogoPrimitivo.Root>
  );
}

