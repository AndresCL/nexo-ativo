"use client";

import { useId, type CSSProperties } from "react";
import { ChevronRight } from "lucide-react";
import type {
  ItemAcaoHome,
  ModoFundoEquipeEditorial,
} from "@/dominio/entidades/paginaPublicada";
import type { PreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { GrupoAvataresEquipe } from "./GrupoAvataresEquipe";
import { CURVA_EDITORIAL, DURACOES_MS } from "@/componentes/interface/constantesAnimacao";
import estilos from "./EquipeVitrine.module.css";

export type ManipuladorAcaoHome = (acao: ItemAcaoHome, acionador?: HTMLButtonElement) => void;

export interface PropriedadesAcaoEquipeVitrine {
  readonly acao: ItemAcaoHome;
  readonly previa: PreviaEquipeVitrine;
  readonly aoAcionarItem?: ManipuladorAcaoHome;
  readonly destaque?: boolean;
  readonly modoFundo?: ModoFundoEquipeEditorial;
  readonly className?: string;
}

export function AcaoEquipeVitrine({
  acao,
  previa,
  aoAcionarItem,
  destaque,
  modoFundo = "transparente",
  className,
}: PropriedadesAcaoEquipeVitrine) {
  const id = useId();
  if (previa.total === 0) return null;

  const usarFundoFixo = modoFundo === "fixo";

  const propriedades = {
    "data-acao-home-id": acao.id,
    "data-modo-fundo-equipe": modoFundo,
    style: {
      "--equipe-tempo-interacao": `${DURACOES_MS.microinteracao}ms`,
      "--equipe-tempo-entrada": `${DURACOES_MS.entradaEditorial}ms`,
      "--equipe-curva-entrada": `cubic-bezier(${CURVA_EDITORIAL.join(",")})`,
    } as CSSProperties,
    "aria-labelledby": `${id}-titulo`,
    "aria-describedby": acao.subtituloDiscreto
      ? `${id}-subtitulo ${id}-descricao`
      : `${id}-descricao`,
    className: combinarClasses(
      "group flex min-h-12 w-full flex-row items-center justify-between gap-3 rounded-xl py-3 text-left text-[var(--editorial-equipe-texto)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--editorial-equipe-texto)] @5xl:flex-col @5xl:items-start @5xl:gap-2.5",
      usarFundoFixo
        ? "bg-[var(--editorial-equipe-fundo)] px-4 shadow-md backdrop-blur-md hover:opacity-95"
        : "bg-transparent px-2 hover:bg-[var(--editorial-superficie)]/45",
      estilos.acao,
      className,
    ),
  };
  const conteudo = (
    <>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          id={`${id}-titulo`}
          className={combinarClasses(
            "max-w-full text-sm leading-relaxed wrap-anywhere",
            destaque ? "font-semibold" : "font-medium",
          )}
        >
          {acao.rotulo}
        </span>
        {acao.subtituloDiscreto ? (
          <span
            id={`${id}-subtitulo`}
            className="max-w-full text-xs leading-snug wrap-anywhere text-[var(--editorial-equipe-subtitulo)]"
          >
            {acao.subtituloDiscreto}
          </span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <GrupoAvataresEquipe previa={previa} limiteAvatares={acao.limiteAvataresEquipe} />
        <ChevronRight
          aria-hidden="true"
          className={combinarClasses("h-4 w-4 shrink-0 opacity-70", estilos.seta)}
        />
      </span>
      <span id={`${id}-descricao`} className="sr-only">
        {previa.total === 1
          ? "Ver 1 integrante da equipe."
          : `Ver os ${previa.total} integrantes da equipe.`}
      </span>
    </>
  );

  return aoAcionarItem ? (
    <button
      {...propriedades}
      type="button"
      aria-haspopup="dialog"
      onClick={(evento) => aoAcionarItem(acao, evento.currentTarget)}
    >
      {conteudo}
    </button>
  ) : (
    <a {...propriedades} href={acao.destino}>
      {conteudo}
    </a>
  );
}
