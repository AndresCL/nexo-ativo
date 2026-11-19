"use client";

import { useState } from "react";
import type React from "react";
import { ChevronDown, ChevronUp, type LucideIcon } from "lucide-react";
import type {
  SituacaoSolicitacaoComercial,
  SolicitacaoComercial,
} from "@/dominio/entidades/solicitacaoComercial";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { CartaoSolicitacaoKanban } from "./CartaoSolicitacaoKanban";

export interface DefinicaoColunaKanban {
  readonly situacao: SituacaoSolicitacaoComercial;
  readonly titulo: string;
  readonly descricao: string;
  readonly icone: LucideIcon;
  readonly superficie: string;
  readonly texto: string;
  readonly distintivo: string;
  readonly iconeCor: string;
  readonly destaque: string;
}

export interface PropriedadesColunaKanbanSolicitacoes {
  readonly coluna: DefinicaoColunaKanban;
  readonly todasColunas: readonly DefinicaoColunaKanban[];
  readonly itens: readonly SolicitacaoComercial[];
  readonly etapaVisivelMobile: SituacaoSolicitacaoComercial;
  readonly colunaAlvo: SituacaoSolicitacaoComercial | null;
  readonly arrastandoId: string | null;
  readonly salvandoId: string | null;
  readonly copiadoId: string | null;
  readonly podeGerenciar: boolean;
  readonly podeMover: boolean;
  readonly buscando: boolean;
  readonly nomeOrganizacao: string;
  readonly limitePorColuna?: number;
  readonly aoAbrir: (id: string) => void;
  readonly aoMover: (
    item: SolicitacaoComercial,
    situacao: SituacaoSolicitacaoComercial,
  ) => Promise<void>;
  readonly aoCopiarResumo: (item: SolicitacaoComercial, e: React.MouseEvent) => Promise<void>;
  readonly aoIniciarArrasto: (id: string, e: React.DragEvent<HTMLElement>) => void;
  readonly aoFinalizarArrasto: () => void;
  readonly aoEntrarAlvoArrasto: (situacao: SituacaoSolicitacaoComercial) => void;
  readonly aoSairAlvoArrasto: () => void;
  readonly aoSoltarItem: (e: React.DragEvent<HTMLElement>, situacao: SituacaoSolicitacaoComercial) => void;
}

export function ColunaKanbanSolicitacoes({
  coluna,
  todasColunas,
  itens,
  etapaVisivelMobile,
  colunaAlvo,
  arrastandoId,
  salvandoId,
  copiadoId,
  podeGerenciar,
  podeMover,
  buscando,
  nomeOrganizacao,
  limitePorColuna = 15,
  aoAbrir,
  aoMover,
  aoCopiarResumo,
  aoIniciarArrasto,
  aoFinalizarArrasto,
  aoEntrarAlvoArrasto,
  aoSairAlvoArrasto,
  aoSoltarItem,
}: PropriedadesColunaKanbanSolicitacoes) {
  const [expandido, setExpandido] = useState(false);
  const Icone = coluna.icone;
  const ehAlvoArrasto = colunaAlvo === coluna.situacao && podeMover;

  const itensExibidos =
    expandido || itens.length <= limitePorColuna
      ? itens
      : itens.slice(0, limitePorColuna);

  return (
    <section
      aria-label={`${coluna.titulo} (${itens.length})`}
      onDragOver={(e) => {
        if (!podeMover || !arrastandoId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        aoEntrarAlvoArrasto(coluna.situacao);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          aoSairAlvoArrasto();
        }
      }}
      onDrop={(e) => aoSoltarItem(e, coluna.situacao)}
      className={combinarClasses(
        "min-w-0 rounded-2xl border bg-gradient-to-b via-white to-white p-4 shadow-xs transition-shadow",
        coluna.superficie,
        etapaVisivelMobile !== coluna.situacao && "hidden md:block",
        ehAlvoArrasto && `ring-2 ${coluna.destaque}`,
      )}
    >
      <header className="mb-4">
        <div className="flex items-center justify-between gap-2">
          <div
            className={combinarClasses(
              "flex items-center gap-2 text-sm font-bold",
              coluna.texto,
            )}
          >
            <span
              className={combinarClasses(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs",
                coluna.iconeCor,
              )}
            >
              <Icone className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2>{coluna.titulo}</h2>
          </div>
          <span
            className={combinarClasses(
              "rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
              coluna.distintivo,
            )}
          >
            {itens.length}
          </span>
        </div>
        <p className="mt-2 text-[11px] text-mineral-500">{coluna.descricao}</p>
      </header>

      <ul className="min-h-44 space-y-3">
        {itensExibidos.map((item) => (
          <CartaoSolicitacaoKanban
            key={item.id}
            item={item}
            nomeOrganizacao={nomeOrganizacao}
            podeGerenciar={podeGerenciar}
            podeMover={podeMover}
            salvandoId={salvandoId}
            arrastandoId={arrastandoId}
            copiadoId={copiadoId}
            colunasDestino={todasColunas}
            aoAbrir={aoAbrir}
            aoMover={aoMover}
            aoCopiarResumo={aoCopiarResumo}
            aoIniciarArrasto={aoIniciarArrasto}
            aoFinalizarArrasto={aoFinalizarArrasto}
          />
        ))}

        {itens.length === 0 ? (
          <li className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-marfim-300 px-4 text-center">
            <Icone className="mb-2 h-5 w-5 text-mineral-400" aria-hidden="true" />
            <p className="text-xs text-mineral-500">
              {buscando
                ? "Nenhum resultado nesta etapa"
                : "Nenhuma solicitação nesta etapa"}
            </p>
          </li>
        ) : null}
      </ul>

      {itens.length > limitePorColuna ? (
        <div className="pt-3">
          <button
            type="button"
            onClick={() => setExpandido((prev) => !prev)}
            aria-expanded={expandido}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-marfim-200 bg-white/90 py-2 text-xs font-semibold text-mineral-700 shadow-2xs hover:bg-white hover:text-mineral-950 focus-visible:outline-2 focus-visible:outline-indigo-500"
          >
            {expandido ? (
              <>
                <ChevronUp className="h-3.5 w-3.5 text-mineral-500" aria-hidden="true" />
                <span>Ver menos</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5 text-mineral-500" aria-hidden="true" />
                <span>Ver mais (+{itens.length - limitePorColuna})</span>
              </>
            )}
          </button>
        </div>
      ) : null}
    </section>
  );
}

