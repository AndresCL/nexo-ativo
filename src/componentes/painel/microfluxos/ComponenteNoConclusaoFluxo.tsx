"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { CheckCircle2 } from "lucide-react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export type TipoNoConclusaoFluxo = Node<
  {
    titulo: string;
    descricao: string;
    selecionado: boolean;
  },
  "conclusaoFluxo"
>;

export function ComponenteNoConclusaoFluxo({ data }: NodeProps<TipoNoConclusaoFluxo>) {
  return (
    <div
      className={combinarClasses(
        "w-72 rounded-lg border bg-white p-3.5 shadow-xs transition-all",
        data.selecionado
          ? "border-stone-900 ring-2 ring-stone-900/15 shadow-sm"
          : "border-stone-200/90 hover:border-stone-400",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3.5 !w-3.5 !border-2 !border-white !bg-stone-900 transition-transform hover:scale-125"
      />
      <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 tracking-tight">
        <span className="flex h-4 w-4 items-center justify-center rounded bg-stone-100 text-stone-700">
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
        </span>
        Conclusão da experiência
      </div>
      <p className="mt-1.5 truncate text-xs font-medium text-stone-800">{data.titulo}</p>
      <p className="mt-0.5 text-[11px] text-stone-500 leading-normal">{data.descricao}</p>
    </div>
  );
}
