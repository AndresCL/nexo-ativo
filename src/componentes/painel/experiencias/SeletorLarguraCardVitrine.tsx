"use client";

import {
  resolverLarguraCardVitrine,
  tipoAcaoSuportaCardMetade,
  type LarguraCardVitrine,
} from "@/dominio/editorial/agrupamentoGridVitrine";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesSeletorLarguraCardVitrine {
  readonly tipoAcao?: string;
  readonly modoExibicaoColecao?: "modal_gaveta" | "carrossel" | "grade_2_colunas";
  readonly ehDestaque?: boolean;
  readonly valor?: LarguraCardVitrine;
  readonly disabled?: boolean;
  readonly compacto?: boolean;
  readonly aoAlterar: (valor: LarguraCardVitrine) => void;
}

/** Seletor reutilizável de largura na vitrine (Botão inteiro/50% para destaques; Card 100%/50% para padrão). */
export function SeletorLarguraCardVitrine({
  tipoAcao,
  modoExibicaoColecao,
  ehDestaque = false,
  valor,
  disabled = false,
  compacto = false,
  aoAlterar,
}: PropriedadesSeletorLarguraCardVitrine) {
  if (!tipoAcaoSuportaCardMetade(tipoAcao, modoExibicaoColecao)) {
    return null;
  }

  return (
    <label
      className={combinarClasses(
        "min-w-0",
        compacto
          ? "flex flex-col gap-1 text-[10px] font-semibold tracking-wider text-mineral-500 uppercase"
          : "space-y-1 text-xs font-medium text-mineral-700",
      )}
    >
      <span className="block truncate">Largura na vitrine</span>
      <select
        aria-label="Largura na vitrine"
        disabled={disabled}
        value={resolverLarguraCardVitrine(valor)}
        onChange={(evento) => aoAlterar(evento.target.value as LarguraCardVitrine)}
        className={combinarClasses(
          "w-full rounded-lg border border-marfim-200 bg-white text-mineral-950 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          compacto ? "min-h-9 px-2.5 text-xs sm:h-8 sm:min-h-8" : "min-h-10 px-3 text-sm",
        )}
      >
        <option value="inteiro">{ehDestaque ? "Linha inteira" : "Card 100%"}</option>
        <option value="metade">{ehDestaque ? "50% da linha" : "Card 50%"}</option>
      </select>
    </label>
  );
}

