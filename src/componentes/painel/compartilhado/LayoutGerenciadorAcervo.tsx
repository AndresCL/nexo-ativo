"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { GavetaFormularioPainel } from "./GavetaFormularioPainel";

export interface PropriedadesLayoutGerenciadorAcervo {
  readonly rotuloBotaoNovo: string;
  readonly podeCriar: boolean;
  readonly aoClicarNovo: () => void;
  readonly cabecalhoSuperior?: ReactNode;
  readonly barraAcoesExtras?: ReactNode;
  readonly formularioAberto: boolean;
  readonly tituloFormulario: string;
  readonly subtituloFormulario?: string;
  readonly aoFecharFormulario: () => void;
  readonly conteudoFormulario: ReactNode;
  readonly rodapeFormulario?: ReactNode;
  readonly children: ReactNode;
}

/**
 * Layout List-First compartilhado para gerenciadores de acervo (Portfólio, Serviços, Produtos, Vídeos, Equipe).
 * Mantém a lista em 100% da largura por padrão e abre o formulário sob demanda em gaveta responsiva.
 */
export function LayoutGerenciadorAcervo({
  rotuloBotaoNovo,
  podeCriar,
  aoClicarNovo,
  cabecalhoSuperior,
  barraAcoesExtras,
  formularioAberto,
  tituloFormulario,
  subtituloFormulario,
  aoFecharFormulario,
  conteudoFormulario,
  rodapeFormulario,
  children,
}: PropriedadesLayoutGerenciadorAcervo) {
  return (
    <div className="min-w-0 space-y-6">
      {cabecalhoSuperior}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">{barraAcoesExtras}</div>

        {podeCriar ? (
          <Botao
            type="button"
            variante="operacional_primario"
            tamanho="compacto"
            onClick={aoClicarNovo}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{rotuloBotaoNovo}</span>
          </Botao>
        ) : null}
      </div>

      {/* Lista em largura total */}
      <div className="min-w-0">{children}</div>

      {/* Formulário sob demanda */}
      <GavetaFormularioPainel
        aberto={formularioAberto}
        titulo={tituloFormulario}
        subtitulo={subtituloFormulario}
        aoFechar={aoFecharFormulario}
        rodape={rodapeFormulario}
      >
        {conteudoFormulario}
      </GavetaFormularioPainel>
    </div>
  );
}
