"use client";

import { useState, type ReactNode } from "react";
import { Monitor, Smartphone } from "lucide-react";
import {
  CATALOGO_COMPOSICOES_EDITORIAIS,
  obterComposicoesEditoriaisAtivas,
  type TipoComposicaoEditorial,
} from "@/dominio/entidades/composicaoEditorial";
import type { ConteudoPaginaPublicada, ItemAcaoHome } from "@/dominio/entidades/paginaPublicada";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { RenderizadorComposicaoEditorial } from "./RenderizadorComposicaoEditorial";
import type { PreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";

export type ModoDispositivoPrevia = "desktop" | "mobile";

export interface PropriedadesAlternadorPreviaDispositivo {
  readonly aparencia?: "escura" | "clara";
  readonly previaEquipe?: PreviaEquipeVitrine;
  readonly complementoChamada?: ReactNode;
  readonly paginaBase: ConteudoPaginaPublicada;
  readonly permitirTrocarComposicao?: boolean;
  readonly dispositivoInicial?: ModoDispositivoPrevia;
  readonly aoAcionarItem?: (acao: ItemAcaoHome) => void;
}

/**
 * Contêiner interativo reutilizável (marketing e editor guiado do painel) para pré-visualizar
 * qualquer página editorial em Desktop e Mobile (390px) usando Container Queries reais.
 */
export function AlternadorPreviaDispositivo({
  aparencia = "escura",
  previaEquipe,
  paginaBase,
  permitirTrocarComposicao = false,
  dispositivoInicial = "desktop",
  aoAcionarItem,
  complementoChamada,
}: PropriedadesAlternadorPreviaDispositivo) {
  const clara = aparencia === "clara";
  const [dispositivo, setDispositivo] = useState<ModoDispositivoPrevia>(dispositivoInicial);
  const [composicaoSelecionada, setComposicaoSelecionada] = useState<TipoComposicaoEditorial>(
    paginaBase.composicaoVisual,
  );

  const paginaPrevia: ConteudoPaginaPublicada = permitirTrocarComposicao
    ? { ...paginaBase, composicaoVisual: composicaoSelecionada }
    : paginaBase;

  return (
    <div className="space-y-4">
      <div
        className={combinarClasses(
          "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
          clara
            ? "border-marfim-200 bg-white text-mineral-800 shadow-xs"
            : "border-marfim-100/14 bg-mineral-900/90 text-marfim-100",
        )}
      >
        {permitirTrocarComposicao ? (
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
        ) : (
          <p
            className={combinarClasses(
              "text-[10px] font-semibold tracking-[0.12em] uppercase",
              clara ? "text-mineral-500" : "text-mineral-300",
            )}
          >
            Prévia ao vivo · {CATALOGO_COMPOSICOES_EDITORIAIS[paginaPrevia.composicaoVisual].nome}
          </p>
        )}

        <div
          role="group"
          aria-label="Alternar formato de tela da prévia"
          className={combinarClasses(
            "inline-flex items-center rounded-lg border p-0.5",
            clara ? "border-marfim-200 bg-marfim-50" : "border-marfim-100/16",
          )}
        >
          <button
            type="button"
            aria-pressed={dispositivo === "desktop"}
            onClick={() => setDispositivo("desktop")}
            className={combinarClasses(
              "inline-flex min-h-9 items-center gap-1.5 rounded-xs px-3 py-1 text-xs transition-colors",
              dispositivo === "desktop"
                ? clara
                  ? "bg-white font-semibold text-indigo-700 shadow-xs"
                  : "bg-marfim-100 font-medium text-mineral-950"
                : clara
                  ? "text-mineral-500 hover:text-mineral-900"
                  : "text-mineral-300 hover:text-marfim-100",
            )}
          >
            <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
            Desktop
          </button>
          <button
            type="button"
            aria-pressed={dispositivo === "mobile"}
            onClick={() => setDispositivo("mobile")}
            className={combinarClasses(
              "inline-flex min-h-9 items-center gap-1.5 rounded-xs px-3 py-1 text-xs transition-colors",
              dispositivo === "mobile"
                ? clara
                  ? "bg-white font-semibold text-indigo-700 shadow-xs"
                  : "bg-marfim-100 font-medium text-mineral-950"
                : clara
                  ? "text-mineral-500 hover:text-mineral-900"
                  : "text-mineral-300 hover:text-marfim-100",
            )}
          >
            <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
            Mobile
          </button>
        </div>
      </div>

      <div
        className={combinarClasses(
          "flex min-w-0 justify-center rounded-2xl border p-2 sm:p-4",
          clara
            ? "border-marfim-200 bg-gradient-to-b from-indigo-50/60 via-marfim-50 to-white shadow-xs"
            : "border-marfim-100/12 bg-mineral-950/70",
        )}
      >
        <div
          data-testid="quadro-previa-dispositivo"
          data-dispositivo={dispositivo}
          className={combinarClasses(
            "overflow-hidden transition-all duration-300",
            dispositivo === "mobile"
              ? "w-full max-w-[390px] rounded-[2rem] border-4 border-mineral-800 shadow-2xl"
              : "w-full rounded-md border border-marfim-100/12 shadow-xl",
          )}
        >
          <RenderizadorComposicaoEditorial
            previaEquipe={previaEquipe}
            pagina={paginaPrevia}
            modoMobileForcado={dispositivo === "mobile"}
            aoAcionarItem={aoAcionarItem}
            alturaContidaPrevia
            complementoChamada={complementoChamada}
          />
        </div>
      </div>
    </div>
  );
}
