"use client";

import { Plus, Trash2 } from "lucide-react";
import type { FaixaHorarioDia } from "@/dominio/agenda/tiposAgenda";
import { converterHorarioParaMinutos } from "@/dominio/agenda/calendarioDatas";

export interface PropriedadesEditorFaixasHorarioDia {
  readonly faixas: readonly FaixaHorarioDia[];
  readonly desabilitado?: boolean;
  readonly rotulo?: string;
  readonly aoAlterar: (novasFaixas: readonly FaixaHorarioDia[]) => void;
}

export function EditorFaixasHorarioDia({
  faixas,
  desabilitado = false,
  rotulo = "Faixas de atendimento",
  aoAlterar,
}: PropriedadesEditorFaixasHorarioDia) {
  function atualizarFaixa(indice: number, campo: "inicio" | "fim", valor: string) {
    const atualizadas = faixas.map((f, i) => (i === indice ? { ...f, [campo]: valor } : f));
    aoAlterar(atualizadas);
  }

  function adicionarFaixa() {
    const ultima = faixas[faixas.length - 1];
    const novaFaixa: FaixaHorarioDia = ultima
      ? { inicio: "14:00", fim: "18:00" }
      : { inicio: "09:00", fim: "18:00" };
    aoAlterar([...faixas, novaFaixa]);
  }

  function removerFaixa(indice: number) {
    aoAlterar(faixas.filter((_, i) => i !== indice));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-mineral-700">{rotulo}</span>
        {faixas.length < 6 ? (
          <button
            type="button"
            disabled={desabilitado}
            onClick={adicionarFaixa}
            className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Adicionar faixa
          </button>
        ) : null}
      </div>

      {faixas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-marfim-300 bg-marfim-50/70 px-3 py-2 text-xs text-mineral-500">
          Nenhuma faixa definida.
        </p>
      ) : (
        <div className="space-y-2">
          {faixas.map((faixa, indice) => {
            let invalida = false;
            try {
              invalida =
                converterHorarioParaMinutos(faixa.fim) <=
                converterHorarioParaMinutos(faixa.inicio);
            } catch {
              invalida = true;
            }

            return (
              <div key={`${indice}-${faixa.inicio}-${faixa.fim}`} className="space-y-1">
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    aria-label={`Início da faixa ${indice + 1}`}
                    disabled={desabilitado}
                    value={faixa.inicio}
                    onChange={(e) => atualizarFaixa(indice, "inicio", e.target.value)}
                    className="min-h-10 flex-1 rounded-lg border border-marfim-300 bg-white px-2.5 text-sm text-mineral-950 focus:border-mineral-950 focus:outline-none disabled:opacity-50"
                  />
                  <span className="text-xs text-mineral-400">até</span>
                  <input
                    type="time"
                    aria-label={`Fim da faixa ${indice + 1}`}
                    disabled={desabilitado}
                    value={faixa.fim}
                    onChange={(e) => atualizarFaixa(indice, "fim", e.target.value)}
                    className="min-h-10 flex-1 rounded-lg border border-marfim-300 bg-white px-2.5 text-sm text-mineral-950 focus:border-mineral-950 focus:outline-none disabled:opacity-50"
                  />
                  {faixas.length > 1 ? (
                    <button
                      type="button"
                      disabled={desabilitado}
                      aria-label={`Remover faixa ${indice + 1}`}
                      onClick={() => removerFaixa(indice)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-mineral-400 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
                {invalida ? (
                  <p className="text-[11px] font-medium text-rose-700">
                    O horário final deve ser maior que o horário inicial.
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

