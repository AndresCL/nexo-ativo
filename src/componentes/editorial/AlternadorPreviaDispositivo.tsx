"use client";

import { useState, type ReactNode } from "react";
import {
  obterComposicoesEditoriaisAtivas,
  type TipoComposicaoEditorial,
} from "@/dominio/entidades/composicaoEditorial";
import type { ConteudoPaginaPublicada, ItemAcaoHome } from "@/dominio/entidades/paginaPublicada";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { MolduraSmartphone } from "./MolduraSmartphone";
import { RenderizadorComposicaoEditorial } from "./RenderizadorComposicaoEditorial";
import type { PreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";

export type ModoDispositivoPrevia = "mobile";

export interface PropriedadesAlternadorPreviaDispositivo {
  readonly aparencia?: "escura" | "clara";
  readonly previaEquipe?: PreviaEquipeVitrine;
  readonly complementoChamada?: ReactNode;
  readonly paginaBase: ConteudoPaginaPublicada;
  readonly permitirTrocarComposicao?: boolean;
  readonly aoAcionarItem?: (acao: ItemAcaoHome) => void;
}

/**
 * Contêiner interativo reutilizável (marketing e editor guiado do painel) para pré-visualizar
 * qualquer página editorial em formato Mobile (390px) dentro de uma moldura de smartphone.
 */
export function AlternadorPreviaDispositivo({
  aparencia = "escura",
  previaEquipe,
  paginaBase,
  permitirTrocarComposicao = false,
  aoAcionarItem,
  complementoChamada,
}: PropriedadesAlternadorPreviaDispositivo) {
  const clara = aparencia === "clara";
  const [composicaoSelecionada, setComposicaoSelecionada] = useState<TipoComposicaoEditorial>(
    paginaBase.composicaoVisual,
  );

  const paginaPrevia: ConteudoPaginaPublicada = permitirTrocarComposicao
    ? { ...paginaBase, composicaoVisual: composicaoSelecionada }
    : paginaBase;

  return (
    <div className="space-y-4">
      {permitirTrocarComposicao ? (
        <div
          className={combinarClasses(
            "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
            clara
              ? "border-marfim-200 bg-white text-mineral-800 shadow-xs"
              : "border-marfim-100/14 bg-mineral-900/90 text-marfim-100",
          )}
        >
          <div
            role="group"
            aria-label="Escolher composição editorial"
            className="flex flex-wrap items-center gap-1.5"
          >
            {obterComposicoesEditoriaisAtivas().map((descritor) => {
              const codigo = descritor.codigo;
              const ativa = composicaoSelecionada === codigo;
              return (
                <button
                  key={codigo}
                  type="button"
                  aria-pressed={ativa}
                  onClick={() => setComposicaoSelecionada(codigo)}
                  className={combinarClasses(
                    "min-h-10 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
                    ativa
                      ? "bg-marfim-100 text-mineral-950"
                      : "text-mineral-300 hover:bg-marfim-100/10 hover:text-marfim-100",
                  )}
                >
                  {descritor.nome}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <MolduraSmartphone
        dataTestId="quadro-previa-dispositivo"
        dataDispositivo="mobile"
        classNameFundo={combinarClasses(
          "rounded-2xl border",
          clara ? "border-marfim-200 shadow-xs" : "border-marfim-100/12",
        )}
      >
        <RenderizadorComposicaoEditorial
          previaEquipe={previaEquipe}
          pagina={paginaPrevia}
          modoMobileForcado
          aoAcionarItem={aoAcionarItem}
          alturaContidaPrevia
          complementoChamada={complementoChamada}
        />
      </MolduraSmartphone>
    </div>
  );
}
