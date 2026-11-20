"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Image, Palette, Search, Share2, Type } from "lucide-react";
import { useEstadoEditorAparencia, type AbaEditorAparencia } from "@/estados/estadoEditorAparencia";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export const ETAPAS_EDITOR_APARENCIA = [
  {
    id: "estilo" as AbaEditorAparencia,
    rotulo: "1. Estilo e cores",
    descricao: "Composição e paleta",
    icone: Palette,
  },
  {
    id: "identidade" as AbaEditorAparencia,
    rotulo: "2. Identidade e texto",
    descricao: "Sua marca e mensagem",
    icone: Type,
  },
  {
    id: "midia" as AbaEditorAparencia,
    rotulo: "3. Mídia e foco",
    descricao: "Fotos e vídeos",
    icone: Image,
  },
  {
    id: "acoes" as AbaEditorAparencia,
    rotulo: "4. Redes sociais",
    descricao: "Seus canais de contato",
    icone: Share2,
  },
  {
    id: "galeria_seo" as AbaEditorAparencia,
    rotulo: "5. Google e SEO",
    descricao: "Busca e avaliações",
    icone: Search,
  },
] as const;

/**
 * Dropdown rico de seleção de etapas do editor de aparência.
 * Exibe a etapa ativa com ícone, título e subtítulo, e abre uma lista suspensa
 * minimalista e acessível com todas as seções configuráveis da vitrine.
 */
export function SeletorEtapasEditorAparencia() {
  const abaAtiva = useEstadoEditorAparencia((e) => e.abaAtiva);
  const definirAbaAtiva = useEstadoEditorAparencia((e) => e.definirAbaAtiva);
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const etapaAtiva =
    ETAPAS_EDITOR_APARENCIA.find((e) => e.id === abaAtiva) ?? ETAPAS_EDITOR_APARENCIA[0];
  const IconeAtiva = etapaAtiva.icone;

  useEffect(() => {
    function tratarCliqueFora(evento: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    }

    function tratarTeclado(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAberto(false);
      }
    }

    if (aberto) {
      document.addEventListener("mousedown", tratarCliqueFora);
      document.addEventListener("keydown", tratarTeclado);
    }

    return () => {
      document.removeEventListener("mousedown", tratarCliqueFora);
      document.removeEventListener("keydown", tratarTeclado);
    };
  }, [aberto]);

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      <div className="flex items-center justify-between px-0.5">
        <label
          htmlFor="seletor-etapa-trigger"
          className="text-xs font-semibold tracking-wider uppercase text-mineral-500"
        >
          Etapa do Editor
        </label>
        <span className="text-[11px] text-mineral-400">
          Alterne entre as seções de personalização
        </span>
      </div>

      {/* Botão Gatilho Rico */}
      <button
        type="button"
        id="seletor-etapa-trigger"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        onClick={() => setAberto((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white p-3 text-left shadow-2xs transition-colors hover:border-slate-300 focus-visible:outline-2 focus-visible:outline-mineral-950 sm:p-3.5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mineral-950 text-white shadow-xs">
            <IconeAtiva className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-mineral-950 sm:text-sm">
                {etapaAtiva.rotulo}
              </span>
            </div>
            <p className="truncate text-[11px] text-mineral-500">{etapaAtiva.descricao}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 text-mineral-500">
          <span className="hidden text-[11px] font-medium text-mineral-400 sm:inline">
            Trocar etapa
          </span>
          <ChevronDown
            className={combinarClasses(
              "h-4 w-4 transition-transform duration-200",
              aberto ? "rotate-180 text-mineral-900" : "text-mineral-500",
            )}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Menu Suspenso Rico */}
      <div
        role="tablist"
        aria-label="Etapas de personalização da página"
        className={combinarClasses(
          "absolute top-full left-0 z-30 mt-2 w-full space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-black/5 transition-all duration-150",
          aberto ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0 invisible",
        )}
      >
        {ETAPAS_EDITOR_APARENCIA.map((etapa) => {
          const selecionada = abaAtiva === etapa.id;
          const IconeEtapa = etapa.icone;

          return (
            <button
              key={etapa.id}
              id={`aba-${etapa.id}`}
              role="tab"
              type="button"
              aria-selected={selecionada}
              aria-controls={`painel-aba-${etapa.id}`}
              tabIndex={selecionada ? 0 : -1}
              onKeyDown={(evento) => {
                const indice = ETAPAS_EDITOR_APARENCIA.findIndex((item) => item.id === etapa.id);
                const proxima =
                  evento.key === "ArrowRight" || evento.key === "ArrowDown"
                    ? (indice + 1) % ETAPAS_EDITOR_APARENCIA.length
                    : evento.key === "ArrowLeft" || evento.key === "ArrowUp"
                      ? (indice - 1 + ETAPAS_EDITOR_APARENCIA.length) %
                        ETAPAS_EDITOR_APARENCIA.length
                      : evento.key === "Home"
                        ? 0
                        : evento.key === "End"
                          ? ETAPAS_EDITOR_APARENCIA.length - 1
                          : null;
                if (proxima === null) return;
                evento.preventDefault();
                const etapaDestino = ETAPAS_EDITOR_APARENCIA[proxima];
                if (!etapaDestino) return;
                definirAbaAtiva(etapaDestino.id);
                document.getElementById(`aba-${etapaDestino.id}`)?.focus();
              }}
              onClick={() => {
                definirAbaAtiva(etapa.id);
                setAberto(false);
              }}
              className={combinarClasses(
                "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition-colors",
                selecionada
                  ? "bg-slate-100/90 font-medium text-mineral-950"
                  : "text-mineral-700 hover:bg-slate-50 hover:text-mineral-950",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={combinarClasses(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                    selecionada
                      ? "bg-mineral-950 text-white"
                      : "bg-slate-100 text-mineral-700",
                  )}
                >
                  <IconeEtapa className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-mineral-950 leading-tight">{etapa.rotulo}</p>
                  <p className="mt-0.5 text-[11px] text-mineral-500 leading-tight">
                    {etapa.descricao}
                  </p>
                </div>
              </div>

              {selecionada ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mineral-950 text-white">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
