"use client";

import {
  construirCssDegradadoEditorial,
  DEGRADADO_EDITORIAL_PADRAO,
  type ConfiguracaoDegradadoEditorial,
} from "@/dominio/objetos-valor/degradadoEditorial";

const PONTOS_ANGULO_DEGRADADO = [
  { graus: 0, rotulo: "0°", direcao: "Abaixo → Acima" },
  { graus: 45, rotulo: "45°", direcao: "Diagonal ↗" },
  { graus: 90, rotulo: "90°", direcao: "Esquerda → Direita" },
  { graus: 135, rotulo: "135°", direcao: "Diagonal ↘" },
  { graus: 180, rotulo: "180°", direcao: "Acima → Abaixo" },
  { graus: 225, rotulo: "225°", direcao: "Diagonal ↙" },
  { graus: 270, rotulo: "270°", direcao: "Direita → Esquerda" },
  { graus: 315, rotulo: "315°", direcao: "Diagonal ↖" },
  { graus: 360, rotulo: "360°", direcao: "Abaixo → Acima" },
] as const;

interface PropriedadesSeletorDegradadoMidia {
  readonly valor?: ConfiguracaoDegradadoEditorial;
  readonly somenteLeitura?: boolean;
  readonly aoAlterar: (novoValor: ConfiguracaoDegradadoEditorial) => void;
}

export function SeletorDegradadoMidia({
  valor,
  somenteLeitura = false,
  aoAlterar,
}: PropriedadesSeletorDegradadoMidia) {
  const atual = valor ?? DEGRADADO_EDITORIAL_PADRAO;

  return (
    <div className="space-y-4 rounded-xl border border-marfim-200 bg-marfim-50/50 p-4">
      <div
        className="h-24 w-full rounded-lg border border-marfim-200 shadow-inner"
        style={{ background: construirCssDegradadoEditorial(atual) }}
        aria-label="Prévia do degradado"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center justify-between gap-3 rounded-lg border border-marfim-200 bg-white px-3 py-2 text-xs font-medium text-mineral-800">
          <span>Cor 1</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-mineral-500">{atual.corInicial}</span>
            <input
              type="color"
              disabled={somenteLeitura}
              value={atual.corInicial}
              onChange={(e) => aoAlterar({ ...atual, corInicial: e.target.value })}
              className="h-7 w-9 cursor-pointer rounded border border-marfim-300 bg-transparent p-0"
            />
          </div>
        </label>

        <label className="flex items-center justify-between gap-3 rounded-lg border border-marfim-200 bg-white px-3 py-2 text-xs font-medium text-mineral-800">
          <span>Cor 2</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-mineral-500">{atual.corFinal}</span>
            <input
              type="color"
              disabled={somenteLeitura}
              value={atual.corFinal}
              onChange={(e) => aoAlterar({ ...atual, corFinal: e.target.value })}
              className="h-7 w-9 cursor-pointer rounded border border-marfim-300 bg-transparent p-0"
            />
          </div>
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="angulo-degradado-midia"
            className="text-[11px] font-semibold tracking-wider text-mineral-700 uppercase"
          >
            Ângulo do degradado
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-mineral-500">
              {PONTOS_ANGULO_DEGRADADO.find((p) => p.graus === (atual.anguloGraus ?? 135))?.direcao ?? ""}
            </span>
            <span className="font-mono text-xs font-semibold text-mineral-900">
              {atual.anguloGraus ?? 135}°
            </span>
          </div>
        </div>

        <input
          id="angulo-degradado-midia"
          type="range"
          min={0}
          max={360}
          step={45}
          list="marcas-angulo-degradado"
          disabled={somenteLeitura}
          value={atual.anguloGraus ?? 135}
          onChange={(e) => aoAlterar({ ...atual, anguloGraus: Number(e.target.value) })}
          className="h-2 w-full cursor-pointer accent-indigo-600"
        />

        <datalist id="marcas-angulo-degradado">
          {PONTOS_ANGULO_DEGRADADO.map((p) => (
            <option key={p.graus} value={p.graus} label={p.rotulo} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

