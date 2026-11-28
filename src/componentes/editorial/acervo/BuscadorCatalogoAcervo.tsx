"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Briefcase, Clock, Package } from "lucide-react";
import { formatarApresentacaoPrecoItem } from "@/dominio/entidades/catalogoConteudo";
import type { ItemCatalogoFiltravel } from "@/dominio/editorial/filtroCatalogoAcervo";
import { gerarSugestoesCatalogo } from "@/dominio/editorial/destaqueTextoBusca";
import { usarValorComDebounce } from "@/ganchos/usarValorComDebounce";
import { CampoBuscaCompacto } from "@/componentes/interface/CampoBuscaCompacto";
import { TextoComDestaqueBusca } from "@/componentes/interface/TextoComDestaqueBusca";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesBuscadorCatalogoAcervo {
  readonly itens: readonly ItemCatalogoFiltravel[];
  readonly tipo: "produtos" | "servicos";
  readonly aoSelecionarItem: (itemId: string) => void;
}

export function BuscadorCatalogoAcervo({
  itens,
  tipo,
  aoSelecionarItem,
}: PropriedadesBuscadorCatalogoAcervo) {
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const [valor, setValor] = useState("");
  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);

  const valorDebounced = usarValorComDebounce(valor, 200);

  const sugestoes = useMemo(
    () => gerarSugestoesCatalogo(itens, valorDebounced, itens.length),
    [itens, valorDebounced],
  );

  const exibirDropdown = aberto && valorDebounced.trim().length > 0;
  const IconeFallback = tipo === "produtos" ? Package : Briefcase;

  useEffect(() => {
    setIndiceAtivo(-1);
  }, [valorDebounced]);

  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(evento: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    }

    document.addEventListener("pointerdown", aoClicarFora);
    return () => document.removeEventListener("pointerdown", aoClicarFora);
  }, [aberto]);

  function selecionarSugestao(itemId: string) {
    setAberto(false);
    setIndiceAtivo(-1);
    aoSelecionarItem(itemId);
  }

  function lidarComTeclado(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === "Escape") {
      if (exibirDropdown) {
        evento.preventDefault();
        setAberto(false);
        setIndiceAtivo(-1);
      }
      return;
    }

    if (!exibirDropdown || sugestoes.length === 0) return;

    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      setIndiceAtivo((atual) => (atual + 1) % sugestoes.length);
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      setIndiceAtivo((atual) => (atual <= 0 ? sugestoes.length - 1 : atual - 1));
    } else if (evento.key === "Enter" && indiceAtivo >= 0 && sugestoes[indiceAtivo]) {
      evento.preventDefault();
      selecionarSugestao(sugestoes[indiceAtivo].item.id);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <CampoBuscaCompacto
        valor={valor}
        aoAlterar={(novoValor) => {
          setValor(novoValor);
          setAberto(novoValor.trim().length > 0);
        }}
        aoFocar={() => {
          if (valor.trim().length > 0) setAberto(true);
        }}
        aoPressionarTecla={lidarComTeclado}
        placeholder={tipo === "produtos" ? "Buscar produtos..." : "Buscar serviços..."}
        ariaLabel={tipo === "produtos" ? "Buscar produtos" : "Buscar serviços"}
        role="combobox"
        ariaExpanded={exibirDropdown}
        ariaControls={listboxId}
        ariaActiveDescendant={
          exibirDropdown && indiceAtivo >= 0 ? `${listboxId}-opcao-${indiceAtivo}` : undefined
        }
      />

      {exibirDropdown ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Sugestões de busca"
          className="absolute right-0 left-0 z-30 mt-1.5 overflow-hidden rounded-xl border border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] shadow-lg"
        >
          {sugestoes.length === 0 ? (
            <p className="px-3.5 py-4 text-center text-xs text-[var(--editorial-texto-secundario)]">
              Nenhum {tipo === "produtos" ? "produto" : "serviço"} encontrado para &ldquo;
              {valorDebounced.trim()}&rdquo;.
            </p>
          ) : (
            <ul className="max-h-72 divide-y divide-[var(--editorial-borda)]/60 overflow-y-auto">
              {sugestoes.map(({ item, trechoSecundario }, indice) => {
                const ativo = indice === indiceAtivo;
                const rotuloPreco = formatarApresentacaoPrecoItem({
                  centavos: item.precoCentavos,
                  rotuloOpcional: item.rotuloPrecoOpcional,
                });

                return (
                  <li
                    key={item.id}
                    id={`${listboxId}-opcao-${indice}`}
                    role="option"
                    aria-selected={ativo}
                  >
                    <button
                      type="button"
                      onMouseDown={(evento) => evento.preventDefault()}
                      onClick={() => selecionarSugestao(item.id)}
                      onMouseEnter={() => setIndiceAtivo(indice)}
                      className={combinarClasses(
                        "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer",
                        ativo ? "bg-current/8" : "hover:bg-current/5",
                      )}
                    >
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
                        {item.urlImagem ? (
                          <Image
                            src={item.urlImagem}
                            alt=""
                            fill
                            sizes="40px"
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <IconeFallback
                            className="h-4 w-4 text-[var(--editorial-texto-secundario)]/70"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-medium text-[var(--editorial-texto)]">
                            <TextoComDestaqueBusca texto={item.nome} termo={valorDebounced} />
                          </p>
                          <span className="shrink-0 text-[11px] font-semibold text-[var(--editorial-texto)]">
                            {rotuloPreco}
                          </span>
                        </div>

                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--editorial-texto-secundario)]">
                          {item.categoria ? (
                            <span className="truncate">
                              <TextoComDestaqueBusca
                                texto={item.categoria}
                                termo={valorDebounced}
                              />
                            </span>
                          ) : null}
                          {item.prazoOuDuracao ? (
                            <span className="inline-flex shrink-0 items-center gap-0.5">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              {item.prazoOuDuracao}
                            </span>
                          ) : null}
                        </div>

                        {trechoSecundario ? (
                          <p className="mt-0.5 truncate text-[11px] text-[var(--editorial-texto-secundario)]/85">
                            <TextoComDestaqueBusca
                              texto={trechoSecundario}
                              termo={valorDebounced}
                            />
                          </p>
                        ) : null}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
