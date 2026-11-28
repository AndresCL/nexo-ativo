"use client";

import { useRef, type FocusEventHandler, type KeyboardEventHandler } from "react";
import { Search, X } from "lucide-react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesCampoBuscaCompacto {
  readonly valor: string;
  readonly aoAlterar: (novoValor: string) => void;
  readonly placeholder?: string;
  readonly ariaLabel?: string;
  readonly className?: string;
  readonly aoFocar?: FocusEventHandler<HTMLInputElement>;
  readonly aoPressionarTecla?: KeyboardEventHandler<HTMLInputElement>;
  readonly role?: "combobox" | "searchbox";
  readonly ariaExpanded?: boolean;
  readonly ariaControls?: string;
  readonly ariaActiveDescendant?: string;
}

export function CampoBuscaCompacto({
  valor,
  aoAlterar,
  placeholder = "Buscar...",
  ariaLabel = "Buscar itens",
  className,
  aoFocar,
  aoPressionarTecla,
  role,
  ariaExpanded,
  ariaControls,
  ariaActiveDescendant,
}: PropriedadesCampoBuscaCompacto) {
  const inputRef = useRef<HTMLInputElement>(null);

  function limparEFocar() {
    aoAlterar("");
    inputRef.current?.focus();
  }

  return (
    <div
      className={combinarClasses(
        "group relative flex items-center rounded-xl border border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] transition-all duration-150 focus-within:border-[var(--editorial-destaque)] focus-within:ring-2 focus-within:ring-[var(--editorial-destaque)]/20",
        className,
      )}
    >
      <Search
        className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--editorial-texto-secundario)] transition-colors duration-150 group-focus-within:text-[var(--editorial-destaque)]"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        role={role}
        value={valor}
        onChange={(evento) => aoAlterar(evento.target.value)}
        onFocus={aoFocar}
        onKeyDown={aoPressionarTecla}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-autocomplete={role === "combobox" ? "list" : undefined}
        aria-expanded={role === "combobox" ? ariaExpanded : undefined}
        aria-controls={role === "combobox" ? ariaControls : undefined}
        aria-activedescendant={ariaActiveDescendant}
        className="h-10 w-full rounded-xl bg-transparent pr-9 pl-9 text-base text-[var(--editorial-texto)] caret-[var(--editorial-destaque)] placeholder:text-[var(--editorial-texto-secundario)]/70 focus:outline-hidden sm:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {valor.length > 0 ? (
        <button
          type="button"
          onClick={limparEFocar}
          aria-label="Limpar busca"
          className="absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-current/8 text-[var(--editorial-texto-secundario)] transition-colors hover:bg-current/15 hover:text-[var(--editorial-texto)] cursor-pointer"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
