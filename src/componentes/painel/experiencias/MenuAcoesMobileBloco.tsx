"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, X } from "lucide-react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface AcaoMenuMobileBloco {
  readonly id: string;
  readonly rotulo: string;
  readonly icone: ReactNode;
  readonly desabilitado?: boolean;
  readonly destaque?: boolean;
  readonly href?: string;
  readonly aoExecutar?: () => void;
}

export interface PropriedadesMenuAcoesMobileBloco {
  readonly tituloBloco: string;
  readonly acoes: readonly AcaoMenuMobileBloco[];
}

export function MenuAcoesMobileBloco({
  tituloBloco,
  acoes,
}: PropriedadesMenuAcoesMobileBloco) {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!aberto) return;

    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAberto(false);
      }
    }

    window.addEventListener("keydown", aoPressionarTecla);
    return () => window.removeEventListener("keydown", aoPressionarTecla);
  }, [aberto]);

  return (
    <div className="shrink-0 sm:hidden">
      <button
        type="button"
        aria-label={`Mais ações para ${tituloBloco}`}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={() => setAberto(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-marfim-200 bg-white text-mineral-600 transition hover:bg-marfim-50 hover:text-mineral-950"
      >
        <MoreVertical className="h-4 w-4" aria-hidden="true" />
      </button>

      {aberto && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-50 sm:hidden" role="dialog" aria-modal="true">
              <div
                aria-hidden="true"
                onClick={() => setAberto(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
              />
              <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-marfim-200 bg-white px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-marfim-200/80 pb-2.5">
                  <span className="truncate text-sm font-semibold text-mineral-950">
                    {tituloBloco}
                  </span>
                  <button
                    type="button"
                    aria-label="Fechar menu de ações"
                    onClick={() => setAberto(false)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-mineral-500 hover:bg-marfim-100 hover:text-mineral-900"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-1">
                  {acoes.map((acao) => {
                    const classesItem = combinarClasses(
                      "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors",
                      acao.destaque
                        ? "bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
                        : "text-mineral-800 hover:bg-marfim-100",
                      acao.desabilitado ? "cursor-not-allowed opacity-40" : "",
                    );

                    if (acao.href) {
                      return (
                        <Link
                          key={acao.id}
                          href={acao.href}
                          onClick={() => setAberto(false)}
                          className={classesItem}
                        >
                          <span className="shrink-0">{acao.icone}</span>
                          <span>{acao.rotulo}</span>
                        </Link>
                      );
                    }

                    return (
                      <button
                        key={acao.id}
                        type="button"
                        disabled={acao.desabilitado}
                        onClick={() => {
                          setAberto(false);
                          acao.aoExecutar?.();
                        }}
                        className={classesItem}
                      >
                        <span className="shrink-0">{acao.icone}</span>
                        <span>{acao.rotulo}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

