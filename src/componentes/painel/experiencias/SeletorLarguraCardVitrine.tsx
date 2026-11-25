"use client";

import {
  resolverLarguraCardVitrine,
  tipoAcaoSuportaCardMetade,
  type LarguraCardVitrine,
} from "@/dominio/editorial/agrupamentoGridVitrine";

export interface PropriedadesSeletorLarguraCardVitrine {
  readonly tipoAcao?: string;
  readonly modoExibicaoColecao?: "modal_gaveta" | "carrossel" | "grade_2_colunas";
  readonly destaquePrimario?: boolean;
  readonly valor?: LarguraCardVitrine;
  readonly disabled?: boolean;
  readonly aoAlterar: (valor: LarguraCardVitrine) => void;
}

/** Seletor reutilizável de largura na vitrine (Linha inteira vs Card compacto 1/2). */
export function SeletorLarguraCardVitrine({
  tipoAcao,
  modoExibicaoColecao,
  destaquePrimario = false,
  valor,
  disabled = false,
  aoAlterar,
}: PropriedadesSeletorLarguraCardVitrine) {
  if (destaquePrimario || !tipoAcaoSuportaCardMetade(tipoAcao, modoExibicaoColecao)) {
    return null;
  }

  return (
    <label className="space-y-1 text-xs font-medium text-mineral-700">
      <span className="block">Largura na vitrine</span>
      <select
        aria-label="Largura na vitrine"
        disabled={disabled}
        value={resolverLarguraCardVitrine(valor)}
        onChange={(evento) => aoAlterar(evento.target.value as LarguraCardVitrine)}
        className="min-h-10 rounded-lg border border-marfim-200 bg-white px-3 text-sm text-mineral-950"
      >
        <option value="inteiro">Linha inteira</option>
        <option value="metade">Card 1/2 (lado a lado)</option>
      </select>
    </label>
  );
}

