"use client";

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import { X } from "lucide-react";

export interface DadosConectorFluxo extends Record<string, unknown> {
  readonly onExcluirConector?: () => void;
  readonly ehCondicional?: boolean;
}

export function ConectorFluxoInterativo({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const onExcluir = (data as DadosConectorFluxo | undefined)?.onExcluirConector;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: selected ? "#0f1110" : (style.stroke ?? "#0f1110"),
          strokeWidth: selected ? 3 : (style.strokeWidth ?? 2),
        }}
        markerEnd={markerEnd}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan flex items-center gap-1.5"
        >
          {label ? (
            <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-medium text-mineral-800 shadow-xs border border-marfim-300">
              {label}
            </span>
          ) : null}

          {onExcluir ? (
            <button
              type="button"
              onClick={(evento) => {
                evento.stopPropagation();
                onExcluir();
              }}
              title="Excluir conexão (desconectar)"
              aria-label="Excluir conexão"
              className="group flex h-5 w-5 items-center justify-center rounded-full border border-marfim-300 bg-white shadow-xs transition hover:scale-110 hover:border-red-500 hover:bg-red-50"
            >
              <X className="h-3 w-3 text-mineral-500 group-hover:text-red-600" />
            </button>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
