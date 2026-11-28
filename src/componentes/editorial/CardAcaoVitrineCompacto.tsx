"use client";

import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import type { ItemAcaoHome } from "@/dominio/entidades/paginaPublicada";
import type { ManipuladorAcaoHome } from "./AcaoEquipeVitrine";

export interface PropriedadesCardAcaoVitrineCompacto {
  readonly acao: ItemAcaoHome;
  readonly icone: ReactNode;
  readonly aoAcionarItem?: ManipuladorAcaoHome;
}

function ehDestinoExterno(destino: string): boolean {
  return /^https?:\/\//i.test(destino);
}

/** Card modular compacto (Card 50%) para experiências padrão (terciário) em grade 2×1. */
export function CardAcaoVitrineCompacto({
  acao,
  icone,
  aoAcionarItem,
}: PropriedadesCardAcaoVitrineCompacto) {
  const externo = ehDestinoExterno(acao.destino);
  const classesCard =
    "group flex h-full w-full min-w-0 flex-col justify-between gap-2.5 rounded-xl bg-[var(--editorial-secundario-fundo)] p-3 text-left text-[var(--editorial-secundario-texto)] shadow-md backdrop-blur-md transition-all duration-300 hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--editorial-texto)]";

  const conteudo = (
    <>
      <div className="flex w-full items-center justify-between gap-2">
        {icone ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/5 text-current transition-transform duration-200 group-hover:scale-110 dark:bg-white/10">
            {icone}
          </div>
        ) : (
          <span />
        )}
        <ArrowUpRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 opacity-60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
        />
      </div>

      <div className="min-w-0 space-y-0.5">
        <span className="line-clamp-2 block break-words text-[13px] font-semibold leading-snug tracking-wide">
          {acao.rotulo}
        </span>
        {acao.subtituloDiscreto ? (
          <span className="line-clamp-2 block break-words text-[11px] leading-snug text-[var(--editorial-texto-secundario)]">
            {acao.subtituloDiscreto}
          </span>
        ) : null}
      </div>
    </>
  );

  if (aoAcionarItem) {
    return (
      <button
        type="button"
        data-acao-home-id={acao.id}
        data-formato-card="metade"
        data-nivel-destaque="terciario"
        onClick={(evento) => aoAcionarItem(acao, evento.currentTarget)}
        className={classesCard}
      >
        {conteudo}
      </button>
    );
  }

  return (
    <a
      href={acao.destino}
      data-formato-card="metade"
      data-nivel-destaque="terciario"
      {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={classesCard}
    >
      {conteudo}
    </a>
  );
}
