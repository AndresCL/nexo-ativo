"use client";

import { Search, X } from "lucide-react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesCampoBuscaCompacto {
  readonly valor: string;
  readonly aoAlterar: (novoValor: string) => void;
  readonly placeholder?: string;
  readonly ariaLabel?: string;
  readonly className?: string;
}

export function CampoBuscaCompacto({
  valor,
  aoAlterar,
  placeholder = "Buscar...",
  ariaLabel = "Buscar itens",
  className,
}: PropriedadesCampoBuscaCompacto) {
  return (
    <div className={combinarClasses("relative flex items-center", className)}>
      <Search
        className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--editorial-texto-secundario)]"
        aria-hidden="true"
      />
      <input
        type="search"
        value={valor}
        onChange={(evento) => aoAlterar(evento.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-10 w-full rounded-xl border border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] pr-9 pl-9 text-sm text-[var(--editorial-texto)] placeholder:text-[var(--editorial-texto-secundario)]/70 focus:border-current/40 focus:outline-hidden [&::-webkit-search-cancel-button]:hidden"
      />
      {valor.length > 0 ? (
        <button
          type="button"
          onClick={() => aoAlterar("")}
          aria-label="Limpar busca"
          className="absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--editorial-texto-secundario)] transition-colors hover:bg-current/10 hover:text-[var(--editorial-texto)] cursor-pointer"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

