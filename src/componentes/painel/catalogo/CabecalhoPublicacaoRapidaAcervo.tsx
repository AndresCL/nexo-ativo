"use client";

import { AcoesPublicacaoPagina } from "@/componentes/painel/AcoesPublicacaoPagina";
import type { ControlePublicacaoPagina } from "@/ganchos/usePublicacaoPagina";

import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesCabecalhoPublicacaoRapidaAcervo {
  readonly aparencia?: "padrao" | "clara";
  readonly controle: ControlePublicacaoPagina;
  readonly titulo: string;
  readonly subtitulo: string;
  readonly identificadorPublico: string;
  readonly exibirSalvarRascunho?: boolean;
}

export function CabecalhoPublicacaoRapidaAcervo({
  aparencia = "padrao",
  controle,
  titulo,
  subtitulo,
  identificadorPublico,
  exibirSalvarRascunho = false,
}: PropriedadesCabecalhoPublicacaoRapidaAcervo) {
  const versaoAtual = controle.versaoPublicada;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-marfim-200/80 pb-3 sm:pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
              {titulo}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                versaoAtual !== null
                  ? aparencia === "clara"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "bg-emerald-900/12 text-emerald-900"
                  : "bg-marfim-200 text-mineral-700"
              }`}
            >
              {versaoAtual !== null ? `Vitrine v${versaoAtual}` : "Ainda não publicada"}
            </span>
          </div>
          <p
            className={combinarClasses(
              "mt-1 max-w-2xl text-mineral-600",
              aparencia === "clara" ? "text-xs leading-relaxed" : "text-sm",
            )}
          >
            {subtitulo}
          </p>
        </div>

        <AcoesPublicacaoPagina
          controle={controle}
          identificadorPublico={identificadorPublico}
          exibirSalvarRascunho={exibirSalvarRascunho}
        />
      </header>
    </div>
  );
}
