"use client";

import { combinarClasses } from "@/utilitarios/combinarClasses";

export type IdAbaDesempenho = "visao_geral" | "aquisicao" | "experiencias" | "equipe";

export interface DefinicaoAbaDesempenho {
  readonly id: IdAbaDesempenho;
  readonly rotulo: string;
}

export const ABAS_DESEMPENHO: readonly DefinicaoAbaDesempenho[] = [
  { id: "visao_geral", rotulo: "Visão Geral" },
  { id: "aquisicao", rotulo: "Aquisição" },
  { id: "experiencias", rotulo: "Experiências" },
  { id: "equipe", rotulo: "Equipe" },
];

export interface PropriedadesNavegacaoAbasDesempenho {
  readonly abaAtiva: IdAbaDesempenho;
  readonly aoSelecionarAba: (aba: IdAbaDesempenho) => void;
}

export function NavegacaoAbasDesempenho({
  abaAtiva,
  aoSelecionarAba,
}: PropriedadesNavegacaoAbasDesempenho) {
  return (
    <nav
      aria-label="Seções de desempenho"
      className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-1"
    >
      {ABAS_DESEMPENHO.map((aba) => {
        const ativa = abaAtiva === aba.id;
        return (
          <button
            key={aba.id}
            type="button"
            role="tab"
            aria-selected={ativa}
            onClick={() => aoSelecionarAba(aba.id)}
            className={combinarClasses(
              "flex-1 min-w-[calc(50%-0.25rem)] sm:flex-none sm:min-w-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer",
              ativa
                ? "bg-white text-mineral-950 shadow-xs ring-1 ring-slate-200/80"
                : "text-mineral-600 hover:bg-white/60 hover:text-mineral-950",
            )}
          >
            {aba.rotulo}
          </button>
        );
      })}
    </nav>
  );
}

