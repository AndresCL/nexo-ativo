"use client";

import { RefreshCw } from "lucide-react";
import type { EstadoConexaoTempoReal } from "@/aplicacao/portas/portasReatividade";

export interface PropriedadesIndicadorTempoRealPainel {
  readonly estadoConexao: EstadoConexaoTempoReal;
  readonly aoAtualizarManual?: () => void;
}

export function IndicadorTempoRealPainel({
  estadoConexao,
  aoAtualizarManual,
}: PropriedadesIndicadorTempoRealPainel) {
  if (estadoConexao === "ao_vivo") {
    return (
      <span
        data-testid="indicador-tempo-real-ao-vivo"
        title="Novos registros aparecem automaticamente nesta tela"
        className="inline-flex h-7 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 text-[11px] font-medium text-emerald-800"
      >
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
        </span>
        <span>Ao vivo</span>
      </span>
    );
  }

  if (estadoConexao === "degradado" && aoAtualizarManual) {
    return (
      <button
        type="button"
        onClick={aoAtualizarManual}
        data-testid="botao-atualizar-manual-painel"
        title="Atualização automática indisponível nesta sessão. Clique para recarregar."
        className="inline-flex h-7 items-center gap-1.5 rounded-full border border-marfim-300 bg-white px-2.5 text-[11px] font-medium text-mineral-700 transition hover:border-mineral-400 hover:bg-marfim-50 hover:text-mineral-950"
      >
        <RefreshCw className="h-3 w-3 text-mineral-500" aria-hidden="true" />
        <span>Atualizar</span>
      </button>
    );
  }

  return null;
}

