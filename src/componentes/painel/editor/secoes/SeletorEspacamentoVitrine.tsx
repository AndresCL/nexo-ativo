"use client";

import { Sliders } from "lucide-react";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import type { EspacamentoAcoesHome } from "@/dominio/entidades/paginaPublicada";

export interface PropriedadesSeletorEspacamentoVitrine {
  readonly valorAtual?: EspacamentoAcoesHome;
  readonly aoAlterar: (espacamento: EspacamentoAcoesHome) => void;
  readonly somenteLeitura?: boolean;
}

const OPCOES_ESPACAMENTO = [
  {
    codigo: "compacto" as const,
    nome: "Compacto",
    resumo: "Mais links visíveis na tela inicial sem precisar rolar.",
    classeVisual: "gap-1",
  },
  {
    codigo: "medio" as const,
    nome: "Equilibrado",
    resumo: "Visual arejado e confortável para tocar no celular.",
    classeVisual: "gap-2.5",
  },
  {
    codigo: "amplo" as const,
    nome: "Espaçado",
    resumo: "Destaque marcante e respiro amplo para cada botão.",
    classeVisual: "gap-4",
  },
] as const;

export function SeletorEspacamentoVitrine({
  valorAtual = "compacto",
  aoAlterar,
  somenteLeitura = false,
}: PropriedadesSeletorEspacamentoVitrine) {
  return (
    <div className="space-y-2.5">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-neutral-100 text-mineral-700">
            <Sliders className="h-3 w-3" aria-hidden="true" />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-mineral-950">
            Espaçamento entre botões
          </h2>
        </div>
        <p className="text-xs text-mineral-600">
          Escolha a distância ideal entre os botões de ação e contatos na sua vitrine.
        </p>
      </div>

      <CartaoSuperficie className="rounded-2xl bg-white p-4 shadow-2xs sm:p-5">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {OPCOES_ESPACAMENTO.map((opcao) => {
            const ativo = valorAtual === opcao.codigo;
            return (
              <button
                key={opcao.codigo}
                type="button"
                disabled={somenteLeitura}
                aria-pressed={ativo}
                onClick={() => aoAlterar(opcao.codigo)}
                className={combinarClasses(
                  "flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all cursor-pointer disabled:opacity-60",
                  ativo
                    ? "border-mineral-950 bg-mineral-950 text-white shadow-xs"
                    : "border-neutral-200 bg-white text-mineral-900 hover:border-neutral-300 hover:bg-neutral-50",
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={combinarClasses(
                        "text-xs font-semibold",
                        ativo ? "text-white" : "text-mineral-950",
                      )}
                    >
                      {opcao.nome}
                    </span>
                    {ativo ? (
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white">
                        Ativo
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={combinarClasses(
                      "mt-1 text-[11px] leading-relaxed",
                      ativo ? "text-white/80" : "text-mineral-600",
                    )}
                  >
                    {opcao.resumo}
                  </p>
                </div>

                {/* Prévia gráfica ilustrativa do espaçamento */}
                <div
                  className={combinarClasses(
                    "mt-3 flex w-full flex-col rounded-lg p-2",
                    ativo ? "bg-white/10" : "bg-slate-200/50",
                    opcao.classeVisual,
                  )}
                  aria-hidden="true"
                >
                  <div
                    className={combinarClasses(
                      "h-1.5 w-full rounded-full",
                      ativo ? "bg-white/50" : "bg-mineral-400/40",
                    )}
                  />
                  <div
                    className={combinarClasses(
                      "h-1.5 w-full rounded-full",
                      ativo ? "bg-white/50" : "bg-mineral-400/40",
                    )}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </CartaoSuperficie>
    </div>
  );
}
