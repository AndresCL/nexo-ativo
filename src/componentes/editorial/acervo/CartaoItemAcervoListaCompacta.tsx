"use client";

import Image from "next/image";
import { Briefcase, Clock, Package } from "lucide-react";
import { formatarApresentacaoPrecoItem } from "@/dominio/entidades/catalogoConteudo";
import type { ItemCatalogoFiltravel } from "@/dominio/editorial/filtroCatalogoAcervo";

interface PropriedadesCartaoItemAcervoListaCompacta {
  readonly item: ItemCatalogoFiltravel;
  readonly tipo: "produtos" | "servicos";
  readonly aoSelecionar: (id: string) => void;
}

export function CartaoItemAcervoListaCompacta({
  item,
  tipo,
  aoSelecionar,
}: PropriedadesCartaoItemAcervoListaCompacta) {
  const rotuloPreco = formatarApresentacaoPrecoItem({
    centavos: item.precoCentavos,
    rotuloOpcional: item.rotuloPrecoOpcional,
  });
  const IconeFallback = tipo === "produtos" ? Package : Briefcase;

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] transition-all duration-200 hover:border-current/30 hover:shadow-xs">
      <button
        type="button"
        onClick={() => aoSelecionar(item.id)}
        className="flex w-full items-center gap-3 p-2.5 text-left focus:outline-hidden cursor-pointer"
      >
        <div className="relative flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/5 dark:bg-white/5">
          {item.urlImagem ? (
            <Image
              src={item.urlImagem}
              alt=""
              fill
              sizes="72px"
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <IconeFallback
              className="h-6 w-6 text-[var(--editorial-texto-secundario)]/70"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-[var(--editorial-texto)]">
              {item.nome}
            </h3>
            <span className="shrink-0 text-xs font-bold tracking-tight text-[var(--editorial-texto)]">
              {rotuloPreco}
            </span>
          </div>

          {item.resumo ? (
            <p className="line-clamp-1 text-[11px] leading-snug text-[var(--editorial-texto-secundario)]">
              {item.resumo}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {item.categoria ? (
              <span className="rounded-full bg-current/8 px-2 py-0.5 text-[10px] font-medium text-[var(--editorial-texto-secundario)]">
                {item.categoria}
              </span>
            ) : null}
            {item.prazoOuDuracao ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-[var(--editorial-texto-secundario)]">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {item.prazoOuDuracao}
              </span>
            ) : null}
          </div>
        </div>
      </button>
    </article>
  );
}

