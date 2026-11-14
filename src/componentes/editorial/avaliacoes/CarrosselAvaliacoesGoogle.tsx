"use client";

import { useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AvaliacaoGoogle } from "@/dominio/entidades/avaliacoesGoogle";
import { usePreferenciaMovimentoReduzido } from "@/ganchos/usarPreferenciaMovimentoReduzido";
import { CartaoAvaliacaoGoogle } from "./CartaoAvaliacaoGoogle";

export function CarrosselAvaliacoesGoogle({
  avaliacoes,
}: {
  readonly avaliacoes: readonly AvaliacaoGoogle[];
}) {
  const identificador = useId();
  const referencia = useRef<HTMLDivElement>(null);
  const [indice, definirIndice] = useState(0);
  const movimentoReduzido = usePreferenciaMovimentoReduzido();

  function navegar(destino: number) {
    const faixa = referencia.current;
    if (!faixa) return;
    const proximo = Math.max(0, Math.min(avaliacoes.length - 1, destino));
    faixa.scrollTo({
      left: proximo * faixa.clientWidth,
      behavior: movimentoReduzido ? "instant" : "smooth",
    });
    definirIndice(proximo);
  }

  if (!avaliacoes.length) return null;
  const classeBotao =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-current/25 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2";
  return (
    <section
      aria-label="Carrossel de avaliações do Google"
      aria-roledescription="carrossel"
      className="mt-3"
    >
      <div
        id={identificador}
        ref={referencia}
        tabIndex={0}
        aria-label="Depoimentos; use as setas para navegar"
        className="flex snap-x snap-mandatory overflow-x-auto rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2"
        onScroll={(evento) => {
          const faixa = evento.currentTarget;
          if (faixa.clientWidth) definirIndice(Math.round(faixa.scrollLeft / faixa.clientWidth));
        }}
        onKeyDown={(evento) => {
          if (evento.target !== evento.currentTarget) return;
          if (evento.key === "ArrowLeft" || evento.key === "ArrowRight") {
            evento.preventDefault();
            navegar(indice + (evento.key === "ArrowLeft" ? -1 : 1));
          }
        }}
      >
        {avaliacoes.map((avaliacao, posicao) => (
          <div
            key={avaliacao.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${posicao + 1} de ${avaliacoes.length}`}
            className="w-full shrink-0 snap-start px-0.5"
          >
            <CartaoAvaliacaoGoogle avaliacao={avaliacao} compacto />
          </div>
        ))}
      </div>
      {avaliacoes.length > 1 ? (
        <div className="mt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            className={classeBotao}
            aria-label="Avaliação anterior"
            aria-controls={identificador}
            disabled={indice === 0}
            onClick={() => navegar(indice - 1)}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="text-xs" role="status" aria-live="polite">
            {indice + 1} de {avaliacoes.length}
          </span>
          <button
            type="button"
            className={classeBotao}
            aria-label="Próxima avaliação"
            aria-controls={identificador}
            disabled={indice >= avaliacoes.length - 1}
            onClick={() => navegar(indice + 1)}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
