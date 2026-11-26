"use client";

import type { PontoHistoricoMrrMensal } from "@/dominio/fundador/tiposPainelFundador";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";

interface ItemPayloadTooltipMrr {
  readonly payload?: PontoHistoricoMrrMensal;
}

export interface PropriedadesTooltipEvolucaoMrr {
  readonly active?: boolean;
  readonly payload?: readonly ItemPayloadTooltipMrr[];
}

export function TooltipEvolucaoMrr({ active, payload }: PropriedadesTooltipEvolucaoMrr) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const ponto = payload[0]?.payload;
  if (!ponto) {
    return null;
  }

  const liquido = ValorMonetarioCentavos.deCentavos(
    ponto.mrrLiquidoCentavos,
  ).formatarMoedaBrasileira();
  const bruto = ValorMonetarioCentavos.deCentavos(
    ponto.mrrBrutoCentavos,
  ).formatarMoedaBrasileira();
  const taxas = ValorMonetarioCentavos.deCentavos(
    ponto.taxasAsaasCentavos,
  ).formatarMoedaBrasileira();

  return (
    <div className="rounded-xl border border-marfim-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur-xs">
      <p className="font-semibold text-mineral-950">
        {ponto.rotuloMes}
        {ponto.mesAtual ? " (mês atual)" : ""}
      </p>
      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 text-mineral-600">
            <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
            MRR Líquido
          </span>
          <span className="font-bold tabular-nums text-emerald-700">{liquido}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 text-mineral-600">
            <span className="h-2 w-2 rounded-full bg-mineral-400" aria-hidden="true" />
            MRR Bruto
          </span>
          <span className="font-medium tabular-nums text-mineral-800">{bruto}</span>
        </div>
        {ponto.taxasAsaasCentavos > 0 ? (
          <div className="flex items-center justify-between gap-4 border-t border-marfim-200 pt-1">
            <span className="text-mineral-500">Taxas Asaas</span>
            <span className="font-medium tabular-nums text-amber-700">-{taxas}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

