"use client";

import { Check, Type } from "lucide-react";
import { CATALOGO_TIPOGRAFIAS_EDITORIAIS } from "@/dominio/entidades/composicaoEditorial";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";

export interface PropriedadesIndicadorTipografiaEditorial {
  readonly somenteLeitura?: boolean;
}

/**
 * Exibe a tipografia editorial oficial (Executivo Corporativo) de forma elegante e minimalista.
 * Como o sistema adota "Executivo Corporativo" como padrão executivo institucional,
 * não expõe opções desnecessárias a usuários leigos, mantendo clareza e zero atrito.
 */
export function IndicadorTipografiaEditorial({
  somenteLeitura: _somenteLeitura = false,
}: PropriedadesIndicadorTipografiaEditorial) {
  const tipografia = CATALOGO_TIPOGRAFIAS_EDITORIAIS.classico_editorial;

  return (
    <CartaoSuperficie className="rounded-2xl bg-white p-5 shadow-2xs sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-100 text-mineral-700">
              <Type className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <h2 className="text-sm font-semibold tracking-tight text-mineral-950">
              Par tipográfico
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
              <Check className="h-3 w-3" aria-hidden="true" />
              Padrão executivo
            </span>
          </div>
          <p className="text-xs text-mineral-600">
            Tipografia calibrada para máxima legibilidade e presença em qualquer tela.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-neutral-50 p-4 border border-neutral-100">
        <p className="text-base font-semibold text-mineral-950">{tipografia.nome}</p>
        <p className="mt-1 text-xs text-mineral-600">{tipografia.descricao}</p>
      </div>
    </CartaoSuperficie>
  );
}

