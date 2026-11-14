"use client";
import { Handle, Position, type Node } from "@xyflow/react";
import { Play } from "lucide-react";
export type TipoNoInicioFluxo = Node<Record<string, unknown>, "inicioFluxo">;
export function ComponenteNoInicioFluxo() {
  return (
    <div className="relative w-56 rounded-xl border border-emerald-700/40 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-mineral-950">
        <Play className="h-4 w-4 text-emerald-700" aria-hidden="true" />
        Início
      </div>
      <p className="mt-1 text-xs text-mineral-600">Conecte à primeira etapa.</p>
      <Handle
        id="inicio"
        type="source"
        position={Position.Bottom}
        className="!h-4 !w-4 !border-2 !border-white !bg-emerald-700"
      />
    </div>
  );
}
