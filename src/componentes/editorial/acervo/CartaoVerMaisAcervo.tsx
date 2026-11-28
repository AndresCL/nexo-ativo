"use client";

import { ArrowRight } from "lucide-react";

interface PropriedadesCartaoVerMaisAcervo {
  readonly tipo: "produtos" | "servicos";
  readonly quantidadeRestante: number;
  readonly aoAcionar: () => void;
}

export function CartaoVerMaisAcervo({
  tipo,
  quantidadeRestante,
  aoAcionar,
}: PropriedadesCartaoVerMaisAcervo) {
  const rotuloTipo =
    tipo === "produtos"
      ? quantidadeRestante === 1
        ? "produto"
        : "produtos"
      : quantidadeRestante === 1
        ? "serviço"
        : "serviços";

  return (
    <article
      role="group"
      aria-roledescription="slide"
      aria-label={`Ver mais ${quantidadeRestante} ${rotuloTipo}`}
      className="flex w-[46%] min-w-[140px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--editorial-card-acervo-borda,var(--editorial-borda))] bg-[var(--editorial-card-acervo-fundo,var(--editorial-superficie))] shadow-xs transition-all duration-300 hover:shadow-md select-none"
    >
      <button
        type="button"
        onClick={aoAcionar}
        className="flex h-full w-full flex-col items-center justify-center gap-2.5 p-4 text-center focus:outline-hidden cursor-pointer"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-current/15 bg-current/5 text-[var(--editorial-card-acervo-texto,var(--editorial-texto))] transition-transform duration-300 group-hover:translate-x-0.5">
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>

        <div className="space-y-0.5">
          <span className="block text-sm font-semibold tracking-tight text-[var(--editorial-card-acervo-texto,var(--editorial-texto))]">
            Ver mais
          </span>
          <span className="block text-[11px] font-medium text-[var(--editorial-card-acervo-preco,var(--editorial-texto-secundario))]">
            +{quantidadeRestante} {rotuloTipo}
          </span>
        </div>
      </button>
    </article>
  );
}

