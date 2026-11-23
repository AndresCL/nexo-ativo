"use client";

import type { RefObject } from "react";
import { Reorder } from "motion/react";
import { Plus, Search } from "lucide-react";
import type { IdentificadorBlocoSistemaVitrine } from "@/dominio/editorial/ordemBlocosVitrine";
import { Botao } from "@/componentes/interface/Botao";
import type { ItemListaUnificadaVitrine } from "./descritoresTipoAcao";
import { ItemBlocoListaVitrine } from "./ItemBlocoListaVitrine";

export type FiltroVisibilidadeLista = "todas" | "visiveis" | "ocultas" | "destaque";

export interface PropriedadesListaOrdenavelBlocosVitrine {
  readonly blocoMarcaFixaTopo: Extract<ItemListaUnificadaVitrine, { tipo: "sistema" }> | null;
  readonly itensFluxoOrdenados: readonly ItemListaUnificadaVitrine[];
  readonly identificadorPublico: string;
  readonly busca: string;
  readonly filtroVisibilidade: FiltroVisibilidadeLista;
  readonly podeAlterar: boolean;
  readonly referenciaBotaoNovaExperiencia: RefObject<HTMLButtonElement | null>;
  readonly aoAlterarBusca: (valor: string) => void;
  readonly aoAlterarFiltro: (valor: FiltroVisibilidadeLista) => void;
  readonly aoCriarNovaExperiencia: () => void;
  readonly aoReordenarPorArraste: (novaOrdemIds: string[]) => void;
  readonly aoMoverItem: (indiceOrigem: number, direcao: -1 | 1) => void;
  readonly aoAlternarVisibilidadeExperiencia: (fluxoId: string) => void;
  readonly aoAlternarVisibilidadeSistema: (idBloco: IdentificadorBlocoSistemaVitrine) => void;
  readonly aoAlternarFixarMarcaTopo: () => void;
  readonly aoAbrirEditorExperiencia: (fluxoId: string) => void;
}

export function ListaOrdenavelBlocosVitrine({
  blocoMarcaFixaTopo,
  itensFluxoOrdenados,
  identificadorPublico,
  busca,
  filtroVisibilidade,
  podeAlterar,
  referenciaBotaoNovaExperiencia,
  aoAlterarBusca,
  aoAlterarFiltro,
  aoCriarNovaExperiencia,
  aoReordenarPorArraste,
  aoMoverItem,
  aoAlternarVisibilidadeExperiencia,
  aoAlternarVisibilidadeSistema,
  aoAlternarFixarMarcaTopo,
  aoAbrirEditorExperiencia,
}: PropriedadesListaOrdenavelBlocosVitrine) {
  const filtroAtivo = busca.trim().length > 0 || filtroVisibilidade !== "todas";
  const termo = busca.trim().toLocaleLowerCase("pt-BR");

  const itensFiltrados = itensFluxoOrdenados
    .map((item, indiceReal) => ({ item, indiceReal }))
    .filter(({ item }) => {
      if (item.tipo === "sistema") {
        const correspondeBusca =
          !termo ||
          `${item.titulo} ${item.subtitulo} ${item.badgeTipo}`
            .toLocaleLowerCase("pt-BR")
            .includes(termo);
        const correspondeSituacao =
          filtroVisibilidade === "todas" ||
          (filtroVisibilidade === "visiveis"
            ? item.visivel
            : filtroVisibilidade === "ocultas"
              ? !item.visivel
              : false);
        return correspondeBusca && correspondeSituacao;
      }

      const { fluxo } = item;
      const correspondeBusca =
        !termo ||
        `${fluxo.titulo} ${fluxo.rotuloBotaoHome ?? ""} ${fluxo.descricaoCurta}`
          .toLocaleLowerCase("pt-BR")
          .includes(termo);
      const correspondeSituacao =
        filtroVisibilidade === "todas" ||
        (filtroVisibilidade === "visiveis"
          ? fluxo.ativo
          : filtroVisibilidade === "ocultas"
            ? !fluxo.ativo
            : fluxo.ativo && fluxo.destaquePrimarioHome);
      return correspondeBusca && correspondeSituacao;
    });

  const arrasteHabilitado = podeAlterar && !filtroAtivo;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mineral-400"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Buscar experiências"
              value={busca}
              onChange={(e) => aoAlterarBusca(e.target.value)}
              placeholder="Buscar experiências ou blocos…"
              className="min-h-10 w-full rounded-lg border border-marfim-200 bg-white py-2 pr-3 pl-9 text-xs focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <select
            aria-label="Filtrar experiências por exibição"
            value={filtroVisibilidade}
            onChange={(e) => aoAlterarFiltro(e.target.value as FiltroVisibilidadeLista)}
            className="min-h-10 min-w-0 rounded-lg border border-marfim-200 bg-white px-3 py-2 text-xs text-mineral-700 focus:border-indigo-400 focus:outline-none"
          >
            <option value="todas">Todos os blocos</option>
            <option value="visiveis">Visíveis</option>
            <option value="ocultas">Ocultos</option>
            <option value="destaque">Em destaque</option>
          </select>
        </div>

        <Botao
          type="button"
          variante="operacional_secundario"
          tamanho="compacto"
          ref={referenciaBotaoNovaExperiencia}
          onClick={aoCriarNovaExperiencia}
          disabled={!podeAlterar}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Nova experiência</span>
        </Botao>
      </div>

      {blocoMarcaFixaTopo && !filtroAtivo ? (
        <div className="space-y-1.5">
          <p className="px-1 text-[11px] font-semibold tracking-wider text-mineral-500 uppercase">
            Topo da tela
          </p>
          <ItemBlocoListaVitrine
            item={blocoMarcaFixaTopo}
            identificadorPublico={identificadorPublico}
            podeAlterar={podeAlterar}
            arrasteHabilitado={false}
            podeSubir={false}
            podeDescer={false}
            aoAlternarVisibilidade={() => aoAlternarVisibilidadeSistema("bloco:marca")}
            aoAlternarFixarMarcaTopo={aoAlternarFixarMarcaTopo}
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <p className="text-[11px] font-semibold tracking-wider text-mineral-500 uppercase">
            Ordem na vitrine (de cima para baixo)
          </p>
          <p className="text-[11px] text-mineral-400">
            {filtroAtivo
              ? "Limpe o filtro para arrastar; use as setas para reordenar."
              : "Arraste pela alça ou use as setas; clique em uma experiência para editar."}
          </p>
        </div>

        {itensFluxoOrdenados.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-marfim-200 bg-white px-6 py-12 text-center">
            <h2 className="text-base font-semibold text-mineral-950">
              Nenhuma experiência no rascunho
            </h2>
            <p className="mt-2 text-sm text-mineral-600">
              Use “Nova experiência” para adicionar uma opção à sua página.
            </p>
          </div>
        ) : itensFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-marfim-200 bg-white p-6 text-center">
            <p className="text-sm font-semibold text-mineral-900">Nenhuma experiência encontrada</p>
            <button
              type="button"
              className="mt-2 min-h-10 rounded-lg px-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
              onClick={() => {
                aoAlterarBusca("");
                aoAlterarFiltro("todas");
              }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={itensFluxoOrdenados.map((i) => i.idBloco)}
            onReorder={(novaOrdem) => {
              if (arrasteHabilitado) {
                aoReordenarPorArraste(novaOrdem);
              }
            }}
            className="space-y-2"
            aria-label="Ordem dos blocos da vitrine"
          >
            {itensFiltrados.map(({ item, indiceReal }) => (
              <ItemBlocoListaVitrine
                key={item.idBloco}
                item={item}
                posicaoExibicao={indiceReal + 1}
                identificadorPublico={identificadorPublico}
                podeAlterar={podeAlterar}
                arrasteHabilitado={arrasteHabilitado}
                podeSubir={podeAlterar && indiceReal > 0}
                podeDescer={podeAlterar && indiceReal < itensFluxoOrdenados.length - 1}
                aoMover={(direcao) => aoMoverItem(indiceReal, direcao)}
                aoAlternarVisibilidade={() =>
                  item.tipo === "sistema"
                    ? aoAlternarVisibilidadeSistema(item.idBloco)
                    : aoAlternarVisibilidadeExperiencia(item.fluxo.id)
                }
                aoAlternarFixarMarcaTopo={
                  item.tipo === "sistema" && item.idBloco === "bloco:marca"
                    ? aoAlternarFixarMarcaTopo
                    : undefined
                }
                aoAbrirEditor={
                  item.tipo === "experiencia"
                    ? () => aoAbrirEditorExperiencia(item.fluxo.id)
                    : undefined
                }
              />
            ))}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}

