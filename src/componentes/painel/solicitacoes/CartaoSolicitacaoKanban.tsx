"use client";

import type React from "react";
import {
  Check,
  Compass,
  Copy,
  GripVertical,
  MessageCircle,
} from "lucide-react";
import {
  DESCRITORES_SITUACAO_SOLICITACAO,
  gerarLinkRetornoWhatsappSolicitacao,
  type SituacaoSolicitacaoComercial,
  type SolicitacaoComercial,
} from "@/dominio/entidades/solicitacaoComercial";
import { combinarClasses } from "@/utilitarios/combinarClasses";

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "America/Sao_Paulo",
});

export interface PropriedadesCartaoSolicitacaoKanban {
  readonly item: SolicitacaoComercial;
  readonly nomeOrganizacao: string;
  readonly podeGerenciar: boolean;
  readonly podeMover: boolean;
  readonly salvandoId: string | null;
  readonly arrastandoId: string | null;
  readonly copiadoId: string | null;
  readonly colunasDestino: readonly { readonly situacao: SituacaoSolicitacaoComercial; readonly titulo: string }[];
  readonly aoAbrir: (id: string) => void;
  readonly aoMover: (
    item: SolicitacaoComercial,
    situacao: SituacaoSolicitacaoComercial,
  ) => Promise<void>;
  readonly aoCopiarResumo: (item: SolicitacaoComercial, e: React.MouseEvent) => Promise<void>;
  readonly aoIniciarArrasto: (id: string, e: React.DragEvent<HTMLElement>) => void;
  readonly aoFinalizarArrasto: () => void;
}

export function CartaoSolicitacaoKanban({
  item,
  nomeOrganizacao,
  podeGerenciar,
  podeMover,
  salvandoId,
  arrastandoId,
  copiadoId,
  colunasDestino,
  aoAbrir,
  aoMover,
  aoCopiarResumo,
  aoIniciarArrasto,
  aoFinalizarArrasto,
}: PropriedadesCartaoSolicitacaoKanban) {
  const estaSalvando = salvandoId === item.id;
  const estaArrastando = arrastandoId === item.id;

  return (
    <li
      aria-busy={estaSalvando}
      className={combinarClasses(
        "rounded-xl border border-marfim-200 bg-white shadow-xs transition-shadow hover:shadow-sm",
        estaArrastando && "opacity-50",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 pt-3 text-[10px] text-mineral-500">
        <time dateTime={item.criadoEmIso}>
          {formatoData.format(new Date(item.criadoEmIso))}
        </time>
        {podeGerenciar ? (
          <span
            draggable={podeMover}
            role="img"
            aria-label={`Arrastar solicitação de ${item.nomeVisitante}`}
            title="Arraste para outra etapa"
            onDragStart={(e) => aoIniciarArrasto(item.id, e)}
            onDragEnd={aoFinalizarArrasto}
            className="cursor-grab rounded p-1 active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <button
        type="button"
        aria-label={`Abrir solicitação de ${item.nomeVisitante}`}
        onClick={() => aoAbrir(item.id)}
        className="block w-full space-y-2 rounded-lg px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-indigo-500"
      >
        <p className="break-words text-sm font-semibold text-mineral-950">
          {item.nomeVisitante}
        </p>
        <p className="break-words text-xs text-mineral-600">
          {item.servicoNome ?? item.produtoNome ?? item.tituloExperiencia}
        </p>
        {(item.servicoNome || item.produtoNome) && item.tituloExperiencia ? (
          <p className="flex items-center gap-1 break-words text-[11px] text-mineral-500">
            <Compass className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{item.tituloExperiencia}</span>
          </p>
        ) : null}
        {item.demonstrativoComercialCongelado ? (
          <p className="text-sm font-bold text-mineral-950">
            {item.demonstrativoComercialCongelado.resumoFormatado}
          </p>
        ) : null}
        <p className="text-[11px] text-mineral-500">
          {item.profissionalNome ?? "Equipe geral"}
        </p>
      </button>

      <div className="mx-3 mb-2 flex items-center justify-between gap-1.5 border-t border-marfim-100 pt-2">
        <a
          href={gerarLinkRetornoWhatsappSolicitacao(item, nomeOrganizacao)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title={`Responder ${item.nomeVisitante} no WhatsApp`}
          aria-label={`Responder ${item.nomeVisitante} no WhatsApp`}
          className="inline-flex min-h-7 flex-1 items-center justify-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-emerald-600"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          <span>WhatsApp</span>
        </a>
        <button
          type="button"
          onClick={(e) => void aoCopiarResumo(item, e)}
          title="Copiar resumo completo da solicitação"
          aria-label="Copiar resumo completo"
          className="inline-flex min-h-7 items-center justify-center gap-1 rounded-md border border-marfim-200 bg-white px-2 py-1 text-[11px] font-medium text-mineral-700 transition-colors hover:bg-marfim-50 focus-visible:outline-2 focus-visible:outline-mineral-500"
        >
          {copiadoId === item.id ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              <span className="text-emerald-700">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-mineral-500" aria-hidden="true" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {podeGerenciar ? (
        <div className="mx-3 mb-3 border-t border-marfim-100 pt-2">
          <label className="flex items-center gap-2 text-[10px] text-mineral-500">
            <span className="shrink-0">
              {estaSalvando ? "Salvando…" : "Mover para"}
            </span>
            <select
              aria-label={`Mover solicitação de ${item.nomeVisitante} para`}
              value={item.situacao}
              disabled={!podeMover}
              onChange={(e) => {
                const situacao = e.target.value as SituacaoSolicitacaoComercial;
                if (situacao !== item.situacao) void aoMover(item, situacao);
              }}
              className="min-w-0 flex-1 rounded-md border border-marfim-200 bg-white px-1 py-2 text-[11px] text-mineral-700 disabled:opacity-60"
            >
              {colunasDestino.map((destino) => (
                <option key={destino.situacao} value={destino.situacao}>
                  {DESCRITORES_SITUACAO_SOLICITACAO[destino.situacao].rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </li>
  );
}

