"use client";
import { Handle, Position, type Node } from "@xyflow/react";
import { Play } from "lucide-react";
export type TipoNoInicioFluxo = Node<Record<string, unknown>, "inicioFluxo">;
export function ComponenteNoInicioFluxo() {
  return (
    <div className="relative w-56 rounded-lg border border-stone-200/90 bg-white p-3.5 shadow-xs">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 tracking-tight">
        <span className="flex h-4 w-4 items-center justify-center rounded bg-stone-100 text-stone-700">
          <Play className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
        </span>
        Início da experiência
      </div>
      <p className="mt-1 text-[11px] text-stone-500 leading-normal">
        Ponto de partida do visitante.
      </p>
      <Handle
        id="inicio"
        type="source"
        position={Position.Bottom}
        className="!h-3.5 !w-3.5 !border-2 !border-white !bg-stone-900 transition-transform hover:scale-125"
        style={{ bottom: -18 }}
      />
    </div>
  );
}
