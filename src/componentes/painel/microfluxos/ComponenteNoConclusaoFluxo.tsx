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
        "w-72 rounded-xl border bg-white p-4 shadow-sm",
        data.selecionado ? "border-mineral-950 ring-2 ring-mineral-950/20" : "border-marfim-300",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-4 !w-4 !border-2 !border-white !bg-emerald-700"
      />
      <div className="flex items-center gap-2 text-sm font-semibold text-mineral-950">
        <CheckCircle2 className="h-5 w-5 text-emerald-700" aria-hidden="true" />
        Finalização
      </div>
      <p className="mt-2 truncate text-sm text-mineral-800">{data.titulo}</p>
      <p className="mt-1 text-xs text-mineral-600">{data.descricao}</p>
    </div>
  );
}
