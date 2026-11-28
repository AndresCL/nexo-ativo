"use client";

import type { CardapioOrganizacao } from "@/dominio/entidades/cardapioDigital";
import { combinarClasses } from "@/utilitarios/combinarClasses";

interface PropriedadesSeletorAbasCardapio {
  readonly cardapios: readonly CardapioOrganizacao[];
  readonly cardapioAtivoId: string;
  readonly aoSelecionar: (cardapio: CardapioOrganizacao) => void;
}

export function SeletorAbasCardapio({
  cardapios,
  cardapioAtivoId,
  aoSelecionar,
}: PropriedadesSeletorAbasCardapio) {
  if (cardapios.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Cardápios disponíveis"
      className="sticky top-14 z-20 border-b border-[var(--editorial-borda)] bg-[var(--editorial-fundo)]/95 backdrop-blur-md"
    >
      <div
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className="mx-auto flex w-full max-w-3xl items-center gap-2 overflow-x-auto px-3 py-2.5 sm:px-5 [&::-webkit-scrollbar]:hidden"
      >
        {cardapios.map((cardapio) => {
          const selecionado = cardapio.id === cardapioAtivoId;
          return (
            <button
              key={cardapio.id}
              type="button"
              role="tab"
              aria-selected={selecionado}
              onClick={() => aoSelecionar(cardapio)}
              className={combinarClasses(
                "shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                selecionado
                  ? "bg-[var(--editorial-destaque)] text-[var(--editorial-texto-sobre-destaque)] shadow-xs"
                  : "border border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] text-[var(--editorial-texto-secundario)] hover:text-[var(--editorial-texto)]",
              )}
            >
              {cardapio.titulo}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

