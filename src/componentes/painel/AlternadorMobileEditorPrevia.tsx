"use client";

import type { ReactNode } from "react";
import { Eye, SlidersHorizontal } from "lucide-react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export type ModoMobileEditorPrevia = "editor" | "previa";

export interface PropriedadesAlternadorMobileEditorPrevia {
  readonly modoAtivo: ModoMobileEditorPrevia;
  readonly aoAlterarModo: (modo: ModoMobileEditorPrevia) => void;
  readonly rotuloEditor?: string;
  readonly iconeEditor?: ReactNode;
  readonly ariaLabel?: string;
}

export function AlternadorMobileEditorPrevia({
  modoAtivo,
  aoAlterarModo,
  rotuloEditor = "Editor",
  iconeEditor,
  ariaLabel = "Alternar entre editor e prévia",
}: PropriedadesAlternadorMobileEditorPrevia) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex w-full rounded-xl border border-marfim-200 bg-marfim-100/80 p-1 xl:hidden"
    >
      <button
        type="button"
        role="tab"
        aria-selected={modoAtivo === "editor"}
        onClick={() => aoAlterarModo("editor")}
        className={combinarClasses(
          "flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors cursor-pointer",
          modoAtivo === "editor"
            ? "bg-white text-mineral-950 shadow-xs"
            : "text-mineral-600 hover:text-mineral-900",
        )}
      >
        {iconeEditor ?? <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />}
        {rotuloEditor}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={modoAtivo === "previa"}
        onClick={() => aoAlterarModo("previa")}
        className={combinarClasses(
          "flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors cursor-pointer",
          modoAtivo === "previa"
            ? "bg-white text-mineral-950 shadow-xs"
            : "text-mineral-600 hover:text-mineral-900",
        )}
      >
        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        Prévia
      </button>
    </div>
  );
}

