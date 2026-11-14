"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import {
  CATALOGO_ICONES_ACOES,
  MAPA_ICONES_POR_ID,
} from "@/dominio/entidades/catalogoIconesEditorial";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesSeletorIconeAcaoPopover {
  readonly valorSelecionado?: string;
  readonly aoSelecionar: (iconeId: string) => void;
  readonly disabled?: boolean;
  readonly compacto?: boolean;
}

// 6 atalhos padrão exibidos diretamente no card
const ATALHOS_PADRAO_IDS = [
  "automatico",
  "whatsapp",
  "conectar",
  "servicos",
  "catalogo",
  "agendamento",
] as const;

export function SeletorIconeAcaoPopover({
  valorSelecionado = "automatico",
  aoSelecionar,
  disabled = false,
  compacto = false,
}: PropriedadesSeletorIconeAcaoPopover) {
  const [aberto, setAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const inputBuscaRef = useRef<HTMLInputElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const idBusca = useId();

  const iconeAtual = MAPA_ICONES_POR_ID[valorSelecionado] ?? MAPA_ICONES_POR_ID["automatico"]!;

  // Fecha ao clicar fora ou pressionar ESC
  useEffect(() => {
    function tratarCliqueFora(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    function tratarEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAberto(false);
      }
    }

    if (aberto) {
      document.addEventListener("mousedown", tratarCliqueFora);
      document.addEventListener("keydown", tratarEsc);
      setTimeout(() => inputBuscaRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", tratarCliqueFora);
      document.removeEventListener("keydown", tratarEsc);
    };
  }, [aberto]);

  const iconesFiltrados = useMemo(() => {
    const normalizado = termoBusca.trim().toLowerCase();
    if (!normalizado) {
      return CATALOGO_ICONES_ACOES;
    }
    return CATALOGO_ICONES_ACOES.filter((item) => {
      if (item.rotulo.toLowerCase().includes(normalizado)) return true;
      if (item.id.toLowerCase().includes(normalizado)) return true;
      return item.palavrasChave.some((kw) => kw.includes(normalizado));
    });
  }, [termoBusca]);

  return (
    <div className={combinarClasses("relative", !compacto && "space-y-2")} ref={popoverRef}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {!compacto ? (
          <label className="text-xs font-semibold text-mineral-800 uppercase tracking-wider">
            Ícone da ação
          </label>
        ) : null}

        {/* Botão Gatilho do Popover */}
        <button
          type="button"
          disabled={disabled}
          aria-label={`Escolher ícone: ${iconeAtual.rotulo}`}
          title={`Escolher ícone: ${iconeAtual.rotulo}`}
          aria-expanded={aberto}
          onClick={() => setAberto((prev) => !prev)}
          className={combinarClasses(
            "inline-flex items-center rounded-md border text-xs font-medium transition-all disabled:opacity-40",
            compacto ? "h-12 w-12 shrink-0 flex-col justify-center gap-0.5" : "gap-2 px-2.5 py-1",
            aberto
              ? "border-mineral-700 bg-marfim-200 text-mineral-950 shadow-xs"
              : "border-marfim-300 bg-white text-mineral-800 hover:border-mineral-400 hover:bg-marfim-100",
          )}
        >
          <span className="flex items-center gap-1.5 font-semibold">
            {iconeAtual.componente({
              className: compacto ? "h-5 w-5" : "h-3.5 w-3.5",
              "aria-hidden": true,
            })}
            {!compacto ? <span>{iconeAtual.rotulo}</span> : null}
          </span>
          <ChevronDown
            className={combinarClasses(
              "h-3.5 w-3.5 opacity-60 transition-transform",
              aberto ? "rotate-180" : "",
            )}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Atalhos Rápidos por padrão */}
      {!compacto ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-mineral-500">Atalhos rápidos:</span>
          {ATALHOS_PADRAO_IDS.map((id) => {
            const item = MAPA_ICONES_POR_ID[id];
            if (!item) return null;
            const ativo = valorSelecionado === id;
            return (
              <button
                key={id}
                type="button"
                disabled={disabled}
                aria-pressed={ativo}
                onClick={() => aoSelecionar(id)}
                className={combinarClasses(
                  "inline-flex items-center gap-1 rounded-xs border px-2 py-0.5 text-[11px] font-medium transition-colors",
                  ativo
                    ? "border-mineral-700 bg-marfim-200 text-mineral-950"
                    : "border-marfim-300 bg-white text-mineral-700 hover:bg-marfim-100",
                )}
              >
                {item.componente({ className: "h-3 w-3", "aria-hidden": true })}
                <span>{item.rotulo}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Janela Flutuante do Popover com Busca */}
      {aberto ? (
        <div
          className={combinarClasses(
            "absolute left-0 z-50 mt-1.5 rounded-xl border border-marfim-300 bg-white p-3 shadow-xl space-y-3",
            compacto ? "w-[min(21rem,calc(100vw-4rem))]" : "w-full sm:w-84",
          )}
        >
          <div className="flex items-center justify-between border-b border-marfim-200 pb-2">
            <span className="text-xs font-semibold text-mineral-900">
              Escolher ícone ({CATALOGO_ICONES_ACOES.length} opções)
            </span>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="text-mineral-400 hover:text-mineral-700 p-0.5 rounded"
              aria-label="Fechar busca de ícones"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Campo de Busca */}
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-mineral-400" />
            <input
              ref={inputBuscaRef}
              id={idBusca}
              type="search"
              aria-label="Buscar ícone"
              placeholder="Buscar ícone (ex: carro, whats, foto, mapa...)"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full rounded-md border border-marfim-300 bg-marfim-50/60 py-1.5 pr-2.5 pl-8 text-xs text-mineral-950 placeholder:text-mineral-400 focus:border-mineral-950 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Grade com Scroll */}
          <div className="grid max-h-56 grid-cols-4 gap-1.5 overflow-y-auto pr-1">
            {iconesFiltrados.length > 0 ? (
              iconesFiltrados.map((item) => {
                const ativo = valorSelecionado === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.rotulo}
                    disabled={disabled}
                    aria-pressed={ativo}
                    onClick={() => {
                      aoSelecionar(item.id);
                      setAberto(false);
                      setTermoBusca("");
                    }}
                    className={combinarClasses(
                      "flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-center transition-all",
                      ativo
                        ? "border-mineral-700 bg-marfim-200 text-mineral-950 shadow-xs"
                        : "border-marfim-200 bg-marfim-50/40 text-mineral-700 hover:border-mineral-400 hover:bg-white",
                    )}
                  >
                    {item.componente({ className: "h-4 w-4 shrink-0", "aria-hidden": true })}
                    <span className="w-full truncate text-[10px] leading-tight font-medium">
                      {item.rotulo}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="col-span-4 py-4 text-center text-xs text-mineral-500">
                Nenhum ícone encontrado para &quot;{termoBusca}&quot;.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
