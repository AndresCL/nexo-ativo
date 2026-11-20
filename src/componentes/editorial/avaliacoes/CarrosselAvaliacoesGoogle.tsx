"use client";

import type { AvaliacaoGoogle } from "@/dominio/entidades/avaliacoesGoogle";
import { CartaoAvaliacaoGoogle } from "./CartaoAvaliacaoGoogle";

export function CarrosselAvaliacoesGoogle({
  avaliacoes,
  aoSelecionar,
}: {
  readonly avaliacoes: readonly AvaliacaoGoogle[];
  readonly aoSelecionar?: () => void;
}) {
  if (!avaliacoes.length) return null;

  return (
    <div
      role="region"
      aria-label="Depoimentos de clientes"
      className="mt-3 flex w-full snap-x snap-mandatory gap-2.5 overflow-x-auto px-0.5 pb-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]"
    >
      {avaliacoes.map((avaliacao) => (
        <CartaoAvaliacaoGoogle
          key={avaliacao.id}
          avaliacao={avaliacao}
          compacto
          aoClicar={aoSelecionar}
        />
      ))}
      <div aria-hidden="true" className="w-3 shrink-0" />
    </div>
  );
}
