"use client";

import { RotateCcw } from "lucide-react";

function normalizarHexParaColorInput(valor: string): string {
  const limpo = valor.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(limpo)) {
    return limpo;
  }
  if (/^#[0-9a-fA-F]{3}$/.test(limpo)) {
    return `#${limpo[1]}${limpo[1]}${limpo[2]}${limpo[2]}${limpo[3]}${limpo[3]}`;
  }
  return "#ffffff";
}

export interface PropriedadesCampoCorElemento {
  readonly rotulo: string;
  readonly descricao: string;
  readonly valorAtual: string;
  readonly personalizado: boolean;
  readonly somenteLeitura?: boolean;
  readonly aoAlterar: (novaCor: string) => void;
  readonly aoRestaurar: () => void;
}

export function CampoCorElemento({
  rotulo,
  descricao,
  valorAtual,
  personalizado,
  somenteLeitura = false,
  aoAlterar,
  aoRestaurar,
}: PropriedadesCampoCorElemento) {
  return (
    <div className="flex flex-col gap-1.5 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-mineral-900">{rotulo}</p>
        <p className="text-[11px] text-mineral-500">{descricao}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <input
          type="color"
          aria-label={`Selecionar cor: ${rotulo}`}
          disabled={somenteLeitura}
          value={normalizarHexParaColorInput(valorAtual)}
          onChange={(e) => aoAlterar(e.target.value)}
          className="h-7 w-8 cursor-pointer rounded border border-slate-300 bg-transparent p-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <input
          type="text"
          aria-label={`Código da cor: ${rotulo}`}
          disabled={somenteLeitura}
          value={valorAtual}
          onChange={(e) => aoAlterar(e.target.value)}
          className="w-28 rounded border border-slate-300 px-2 py-0.5 font-mono text-[11px] text-mineral-900 focus:border-mineral-950 focus:outline-none disabled:opacity-60"
        />
        {personalizado ? (
          <button
            type="button"
            disabled={somenteLeitura}
            onClick={aoRestaurar}
            title={`Restaurar padrão de ${rotulo}`}
            aria-label={`Restaurar cor padrão: ${rotulo}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-mineral-500 hover:bg-slate-50 hover:text-mineral-900 disabled:opacity-60 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

