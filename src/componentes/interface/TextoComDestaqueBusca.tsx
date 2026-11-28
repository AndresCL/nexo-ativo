"use client";

import { segmentarTextoComDestaque } from "@/dominio/editorial/destaqueTextoBusca";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesTextoComDestaqueBusca {
  readonly texto: string;
  readonly termo: string;
  readonly classNameDestaque?: string;
}

export function TextoComDestaqueBusca({
  texto,
  termo,
  classNameDestaque,
}: PropriedadesTextoComDestaqueBusca) {
  const segmentos = segmentarTextoComDestaque(texto, termo);

  return (
    <>
      {segmentos.map((segmento, indice) =>
        segmento.destacado ? (
          <mark
            key={`${indice}-${segmento.texto}`}
            className={combinarClasses(
              "rounded-[3px] bg-[var(--editorial-destaque)]/18 px-0.5 font-semibold text-[var(--editorial-texto)]",
              classNameDestaque,
            )}
          >
            {segmento.texto}
          </mark>
        ) : (
          <span key={`${indice}-${segmento.texto}`}>{segmento.texto}</span>
        ),
      )}
    </>
  );
}

