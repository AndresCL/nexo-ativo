"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, LayoutGrid, List } from "lucide-react";
import type { ProdutoCatalogo, ServicoOrganizacao } from "@/dominio/entidades/catalogoConteudo";
import {
  obterDescritorTipografiaEditorial,
  type ConteudoPaginaPublicada,
} from "@/dominio/entidades/paginaPublicada";
import {
  adaptarProdutosParaCatalogo,
  adaptarServicosParaCatalogo,
  extrairCategoriasCatalogo,
  filtrarEOrdenarCatalogo,
  type OrdenacaoCatalogoAcervo,
} from "@/dominio/editorial/filtroCatalogoAcervo";
import { TrilhaChipsFiltro } from "@/componentes/interface/TrilhaChipsFiltro";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { TelaSobrepostaLateralEditorial } from "../TelaSobrepostaLateralEditorial";
import { BuscadorCatalogoAcervo } from "./BuscadorCatalogoAcervo";
import { CartaoItemAcervoCompacto } from "./CartaoItemAcervoCompacto";
import { CartaoItemAcervoListaCompacta } from "./CartaoItemAcervoListaCompacta";

type ModoVisualizacaoCatalogo = "grade" | "lista";

export interface PropriedadesTelaCatalogoAcervoCompleta {
  readonly aberto: boolean;
  readonly tipo: "produtos" | "servicos";
  readonly tituloPersonalizado?: string;
  readonly pagina: ConteudoPaginaPublicada;
  readonly produtos: readonly ProdutoCatalogo[];
  readonly servicos: readonly ServicoOrganizacao[];
  readonly aoFechar: () => void;
  readonly aoRetornarFoco?: () => void;
  readonly aoSelecionarItem: (tipo: "produtos" | "servicos", itemId: string) => void;
}

export function TelaCatalogoAcervoCompleta({
  aberto,
  tipo,
  tituloPersonalizado,
  pagina,
  produtos,
  servicos,
  aoFechar,
  aoRetornarFoco,
  aoSelecionarItem,
}: PropriedadesTelaCatalogoAcervoCompleta) {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [ordenacao, setOrdenacao] = useState<OrdenacaoCatalogoAcervo>("destaque");
  const [modoVisualizacao, setModoVisualizacao] = useState<ModoVisualizacaoCatalogo>("grade");

  const tipografia = obterDescritorTipografiaEditorial(pagina.tipografiaId);

  const titulo =
    tituloPersonalizado?.trim() || (tipo === "produtos" ? "Produtos" : "Serviços");

  const itensBase = useMemo(
    () =>
      tipo === "produtos"
        ? adaptarProdutosParaCatalogo(produtos)
        : adaptarServicosParaCatalogo(servicos),
    [tipo, produtos, servicos],
  );

  const opcoesCategoria = useMemo(
    () =>
      extrairCategoriasCatalogo(itensBase).map((cat) => ({
        valor: cat.nome,
        rotulo: cat.nome,
        quantidade: cat.quantidade,
      })),
    [itensBase],
  );

  const itensFiltrados = useMemo(
    () =>
      filtrarEOrdenarCatalogo(itensBase, {
        termoBusca: "",
        categoriaSelecionada,
        ordenacao,
      }),
    [itensBase, categoriaSelecionada, ordenacao],
  );

  const possuiFiltroAtivo = categoriaSelecionada !== null || ordenacao !== "destaque";

  function limparFiltros() {
    setCategoriaSelecionada(null);
    setOrdenacao("destaque");
  }

  return (
    <TelaSobrepostaLateralEditorial
      aberto={aberto}
      chaveAnimacao={`catalogo-tela-cheia-${tipo}`}
      ariaLabel={titulo}
      pagina={pagina}
      aoFechar={aoFechar}
      aoRetornarFoco={aoRetornarFoco}
    >
      {/* Header Sticky com Voltar, Busca, Filtros e Toggle de Layout */}
      <header className="shrink-0 border-b border-[var(--editorial-borda)] bg-[var(--editorial-fundo)]">
        <div className="mx-auto w-full max-w-md space-y-3 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-3.5 sm:max-w-3xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={aoFechar}
                aria-label="Voltar para a vitrine"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] text-[var(--editorial-texto)] transition-colors hover:border-current/35 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="min-w-0">
                <h2
                  className={combinarClasses(
                    "truncate text-lg font-semibold leading-tight",
                    tipografia.classeTitulo,
                  )}
                >
                  {titulo}
                </h2>
                <p className="text-[11px] text-[var(--editorial-texto-secundario)]">
                  {itensFiltrados.length}{" "}
                  {itensFiltrados.length === 1 ? "item" : "itens"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <select
                value={ordenacao}
                onChange={(evento) =>
                  setOrdenacao(evento.target.value as OrdenacaoCatalogoAcervo)
                }
                aria-label="Ordenar itens"
                className="h-8 rounded-lg border border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] px-2 text-xs text-[var(--editorial-texto)] focus:outline-hidden cursor-pointer"
              >
                <option value="destaque">Destaque</option>
                <option value="menor_preco">Menor preço</option>
                <option value="maior_preco">Maior preço</option>
                <option value="az">A–Z</option>
              </select>

              <div
                role="group"
                aria-label="Modo de visualização"
                className="inline-flex items-center rounded-lg border border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] p-0.5"
              >
                <button
                  type="button"
                  onClick={() => setModoVisualizacao("grade")}
                  aria-label="Visualização em grade"
                  aria-pressed={modoVisualizacao === "grade"}
                  className={combinarClasses(
                    "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer",
                    modoVisualizacao === "grade"
                      ? "bg-[var(--editorial-texto)] text-[var(--editorial-fundo)]"
                      : "text-[var(--editorial-texto-secundario)] hover:text-[var(--editorial-texto)]",
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setModoVisualizacao("lista")}
                  aria-label="Visualização em lista"
                  aria-pressed={modoVisualizacao === "lista"}
                  className={combinarClasses(
                    "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer",
                    modoVisualizacao === "lista"
                      ? "bg-[var(--editorial-texto)] text-[var(--editorial-fundo)]"
                      : "text-[var(--editorial-texto-secundario)] hover:text-[var(--editorial-texto)]",
                  )}
                >
                  <List className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <BuscadorCatalogoAcervo
            itens={itensBase}
            tipo={tipo}
            aoSelecionarItem={(itemId) => aoSelecionarItem(tipo, itemId)}
          />

          <TrilhaChipsFiltro
            opcoes={opcoesCategoria}
            selecionado={categoriaSelecionada}
            aoSelecionar={setCategoriaSelecionada}
          />
        </div>
      </header>

      {/* Área rolável de resultados */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-md px-4 pt-4 pb-10 sm:max-w-3xl">
          {itensFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-[var(--editorial-texto)]">
                Nenhum item encontrado
              </p>
              <p className="mt-1 text-xs text-[var(--editorial-texto-secundario)]">
                {possuiFiltroAtivo
                  ? "Tente ajustar sua busca ou limpar os filtros ativos."
                  : "Os itens desta seção estão sendo atualizados."}
              </p>
              {possuiFiltroAtivo ? (
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="mt-4 rounded-full border border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] px-4 py-1.5 text-xs font-medium text-[var(--editorial-texto)] transition-colors hover:border-current/35 cursor-pointer"
                >
                  Limpar filtros
                </button>
              ) : null}
            </div>
          ) : modoVisualizacao === "grade" ? (
            <div className="grid grid-cols-2 gap-3">
              {itensFiltrados.map((item, indice) => (
                <CartaoItemAcervoCompacto
                  key={item.id}
                  item={item}
                  indice={indice}
                  modo="grade_2_colunas"
                  aoSelecionar={(id) => aoSelecionarItem(tipo, id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {itensFiltrados.map((item) => (
                <CartaoItemAcervoListaCompacta
                  key={item.id}
                  item={item}
                  tipo={tipo}
                  aoSelecionar={(id) => aoSelecionarItem(tipo, id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </TelaSobrepostaLateralEditorial>
  );
}

