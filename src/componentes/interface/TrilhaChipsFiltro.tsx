"use client";

import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface OpcaoChipFiltro {
  readonly valor: string;
  readonly rotulo: string;
  readonly quantidade?: number;
}

export interface PropriedadesTrilhaChipsFiltro {
  readonly opcoes: readonly OpcaoChipFiltro[];
  readonly selecionado: string | null;
  readonly aoSelecionar: (valor: string | null) => void;
  readonly rotuloTodos?: string;
  readonly ariaLabel?: string;
  readonly className?: string;
}

export function TrilhaChipsFiltro({
  opcoes,
  selecionado,
  aoSelecionar,
  rotuloTodos = "Todos",
  ariaLabel = "Filtrar por categoria",
  className,
}: PropriedadesTrilhaChipsFiltro) {
  if (opcoes.length <= 1) return null;

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={combinarClasses(
        "flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <button
        type="button"
        role="tab"
        aria-selected={selecionado === null}
        onClick={() => aoSelecionar(null)}
        className={combinarClasses(
          "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
          selecionado === null
            ? "bg-[var(--editorial-texto)] text-[var(--editorial-fundo)]"
            : "border border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] text-[var(--editorial-texto-secundario)] hover:text-[var(--editorial-texto)]",
        )}
      >
        {rotuloTodos}
      </button>

      {opcoes.map((opcao) => {
        const ativo = selecionado === opcao.valor;
        return (
          <button
            key={opcao.valor}
            type="button"
            role="tab"
            aria-selected={ativo}
            onClick={() => aoSelecionar(ativo ? null : opcao.valor)}
            className={combinarClasses(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
              ativo
                ? "bg-[var(--editorial-texto)] text-[var(--editorial-fundo)]"
                : "border border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] text-[var(--editorial-texto-secundario)] hover:text-[var(--editorial-texto)]",
            )}
          >
            {opcao.rotulo}
            {typeof opcao.quantidade === "number" ? (
              <span className="ml-1 opacity-70">({opcao.quantidade})</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

