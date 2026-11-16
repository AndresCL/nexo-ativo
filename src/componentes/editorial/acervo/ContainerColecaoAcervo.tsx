import type { ReactNode } from "react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export type ModoLayoutAcervo = "carrossel" | "grade_2_colunas";

interface PropriedadesContainerColecaoAcervo<T> {
  readonly itens: readonly T[];
  readonly modo: ModoLayoutAcervo;
  readonly renderizarItem: (item: T, indice: number, modo: ModoLayoutAcervo) => ReactNode;
  readonly className?: string;
  readonly ariaLabel?: string;
}

export function ContainerColecaoAcervo<T>({
  itens,
  modo,
  renderizarItem,
  className,
  ariaLabel,
}: PropriedadesContainerColecaoAcervo<T>) {
  if (itens.length === 0) return null;

  if (modo === "carrossel") {
    return (
      <div
        role="region"
        aria-roledescription="carrossel"
        aria-label={ariaLabel}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className={combinarClasses(
          "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1.5 pt-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-scrollbar]:hidden",
          className,
        )}
      >
        {itens.map((item, indice) => renderizarItem(item, indice, "carrossel"))}
      </div>
    );
  }

  // modo === "grade_2_colunas"
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={combinarClasses("grid grid-cols-2 gap-2.5 sm:gap-3", className)}
    >
      {itens.map((item, indice) => renderizarItem(item, indice, "grade_2_colunas"))}
    </div>
  );
}

