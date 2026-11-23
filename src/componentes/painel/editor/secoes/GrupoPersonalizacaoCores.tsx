"use client";

import type { ReactNode } from "react";

export interface PropriedadesGrupoPersonalizacaoCores {
  readonly titulo: string;
  readonly descricao: string;
  readonly quantidadePersonalizada: number;
  readonly somenteLeitura?: boolean;
  readonly aoRestaurarGrupo: () => void;
  readonly controleExtra?: ReactNode;
  readonly children: ReactNode;
}

export function GrupoPersonalizacaoCores({
  titulo,
  descricao,
  quantidadePersonalizada,
  somenteLeitura = false,
  aoRestaurarGrupo,
  controleExtra,
  children,
}: PropriedadesGrupoPersonalizacaoCores) {
  return (
    <section
      aria-label={titulo}
      className="rounded-xl border border-slate-200/90 bg-slate-50/40 p-3.5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200/80 pb-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-mineral-950">{titulo}</h4>
            {quantidadePersonalizada > 0 ? (
              <span className="rounded-full bg-mineral-950 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {quantidadePersonalizada}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-[11px] text-mineral-500">{descricao}</p>
        </div>

        {quantidadePersonalizada > 0 ? (
          <button
            type="button"
            disabled={somenteLeitura}
            onClick={aoRestaurarGrupo}
            className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-mineral-700 hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
          >
            Restaurar grupo
          </button>
        ) : null}
      </div>

      {controleExtra ? (
        <div className="border-b border-slate-200/80 py-3">{controleExtra}</div>
      ) : null}

      <div className="mt-1 divide-y divide-slate-200/70 text-xs">{children}</div>
    </section>
  );
}

