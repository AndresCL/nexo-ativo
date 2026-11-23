"use client";

import { AlignVerticalJustifyStart } from "lucide-react";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import {
  LISTA_FAIXAS_INICIO_EXPERIENCIAS,
  resolverFaixaInicioExperiencias,
  resolverPosicaoCabecalhoMarca,
  type FaixaInicioExperiencias,
  type PosicaoCabecalhoMarca,
} from "@/dominio/editorial/faixaInicioExperiencias";

export interface PropriedadesSeletorFaixaInicioVitrine {
  readonly valorAtual?: FaixaInicioExperiencias;
  readonly aoAlterar: (faixa: FaixaInicioExperiencias) => void;
  readonly posicaoCabecalhoAtual?: PosicaoCabecalhoMarca;
  readonly somenteLeitura?: boolean;
}

export function SeletorFaixaInicioVitrine({
  valorAtual,
  aoAlterar,
  posicaoCabecalhoAtual,
  somenteLeitura = false,
}: PropriedadesSeletorFaixaInicioVitrine) {
  const faixaResolvida = resolverFaixaInicioExperiencias(valorAtual);
  const marcaNoTopo = resolverPosicaoCabecalhoMarca(posicaoCabecalhoAtual) === "topo";

  return (
    <div className="space-y-2.5">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-neutral-100 text-mineral-700">
            <AlignVerticalJustifyStart className="h-3 w-3" aria-hidden="true" />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-mineral-950">
            Início das experiências
          </h2>
        </div>
        <p className="text-xs text-mineral-600">
          Defina em que altura da tela os botões, vídeos e produtos começam a aparecer.
        </p>
      </div>

      <CartaoSuperficie className="rounded-2xl bg-white p-4 shadow-2xs sm:p-5">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {LISTA_FAIXAS_INICIO_EXPERIENCIAS.map((opcao) => {
            const ativo = faixaResolvida === opcao.codigo;
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

                {/* Prévia ilustrativa: marca fixa no topo ou acompanhando os blocos */}
                <div
                  className={combinarClasses(
                    "mt-3 flex h-16 w-full flex-col rounded-lg p-1.5",
                    ativo ? "bg-white/10" : "bg-slate-200/50",
                  )}
                  aria-hidden="true"
                >
                  {marcaNoTopo ? (
                    <div className="flex h-3 shrink-0 items-center justify-center border-b border-current/15 pb-1">
                      <div
                        className={combinarClasses(
                          "h-1 w-8 rounded-full",
                          ativo ? "bg-white/40" : "bg-mineral-400/50",
                        )}
                      />
                    </div>
                  ) : null}
                  <div
                    className={combinarClasses(
                      "flex flex-1 flex-col gap-1 pt-1",
                      opcao.classePreviaAlinhamento,
                    )}
                  >
                    {!marcaNoTopo ? (
                      <div className="flex justify-center pb-0.5">
                        <div
                          className={combinarClasses(
                            "h-1 w-8 rounded-full",
                            ativo ? "bg-white/45" : "bg-mineral-400/60",
                          )}
                        />
                      </div>
                    ) : null}
                    <div
                      className={combinarClasses(
                        "h-1.5 w-full rounded-full",
                        ativo ? "bg-white/70" : "bg-mineral-500/50",
                      )}
                    />
                    <div
                      className={combinarClasses(
                        "h-1.5 w-4/5 rounded-full",
                        ativo ? "bg-white/45" : "bg-mineral-400/40",
                      )}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CartaoSuperficie>
    </div>
  );
}

