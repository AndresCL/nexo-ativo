"use client";

import { useState } from "react";
import type React from "react";
import {
  CheckCheck,
  Inbox,
  MessageCircle,
  Send,
  UserX,
} from "lucide-react";
import {
  gerarTextoResumoParaCopia,
  type SituacaoSolicitacaoComercial,
  type SolicitacaoComercial,
} from "@/dominio/entidades/solicitacaoComercial";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import {
  ColunaKanbanSolicitacoes,
  type DefinicaoColunaKanban,
} from "./ColunaKanbanSolicitacoes";

export const COLUNAS_KANBAN: readonly DefinicaoColunaKanban[] = [
  {
    situacao: "nova",
    titulo: "Novas",
    descricao: "Aguardando primeiro contato",
    icone: Inbox,
    superficie: "border-indigo-200 from-indigo-50/80",
    texto: "text-indigo-900",
    distintivo: "bg-indigo-100 text-indigo-900",
    iconeCor: "bg-indigo-600",
    destaque: "ring-indigo-400",
  },
  {
    situacao: "em_atendimento",
    titulo: "Em atendimento",
    descricao: "Conversa iniciada",
    icone: MessageCircle,
    superficie: "border-sky-200 from-sky-50/80",
    texto: "text-sky-900",
    distintivo: "bg-sky-100 text-sky-900",
    iconeCor: "bg-sky-600",
    destaque: "ring-sky-400",
  },
  {
    situacao: "proposta_enviada",
    titulo: "Proposta enviada",
    descricao: "Aguardando retorno do cliente",
    icone: Send,
    superficie: "border-violet-200 from-violet-50/80",
    texto: "text-violet-900",
    distintivo: "bg-violet-100 text-violet-900",
    iconeCor: "bg-violet-600",
    destaque: "ring-violet-400",
  },
  {
    situacao: "concluida",
    titulo: "Concluídas",
    descricao: "Atendimento efetivado",
    icone: CheckCheck,
    superficie: "border-emerald-200 from-emerald-50/80",
    texto: "text-emerald-900",
    distintivo: "bg-emerald-100 text-emerald-900",
    iconeCor: "bg-emerald-600",
    destaque: "ring-emerald-400",
  },
  {
    situacao: "desqualificada",
    titulo: "Desqualificadas",
    descricao: "Sem perfil ou encerradas",
    icone: UserX,
    superficie: "border-rose-200 from-rose-50/80",
    texto: "text-rose-950",
    distintivo: "bg-rose-100 text-rose-900",
    iconeCor: "bg-rose-600",
    destaque: "ring-rose-400",
  },
] as const;

export interface PropriedadesQuadroSolicitacoes {
  readonly solicitacoes: readonly SolicitacaoComercial[];
  readonly nomeOrganizacao: string;
  readonly buscando: boolean;
  readonly podeGerenciar: boolean;
  readonly salvandoId: string | null;
  readonly limitePorColuna?: number;
  readonly aoAbrir: (id: string) => void;
  readonly aoMover: (
    item: SolicitacaoComercial,
    situacao: SituacaoSolicitacaoComercial,
  ) => Promise<void>;
}

export function QuadroSolicitacoes({
  solicitacoes,
  nomeOrganizacao,
  buscando,
  podeGerenciar,
  salvandoId,
  limitePorColuna = 15,
  aoAbrir,
  aoMover,
}: PropriedadesQuadroSolicitacoes) {
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [etapaMobile, setEtapaMobile] = useState<SituacaoSolicitacaoComercial>("nova");
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);
  const [colunaAlvo, setColunaAlvo] = useState<SituacaoSolicitacaoComercial | null>(null);

  const podeMover = podeGerenciar && salvandoId === null;

  const copiarResumo = async (item: SolicitacaoComercial, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const texto = gerarTextoResumoParaCopia(item, nomeOrganizacao);
      await navigator.clipboard.writeText(texto);
      setCopiadoId(item.id);
      notificar.sucesso("Resumo da solicitação copiado!");
      setTimeout(() => setCopiadoId((idAtual) => (idAtual === item.id ? null : idAtual)), 2000);
    } catch {
      notificar.erro("Não foi possível copiar o resumo.");
    }
  };

  const iniciarArrasto = (id: string, e: React.DragEvent<HTMLElement>) => {
    if (!podeMover) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";

    const elementoCartao = (e.currentTarget as HTMLElement).closest("li");
    if (elementoCartao && typeof e.dataTransfer.setDragImage === "function") {
      const rect = elementoCartao.getBoundingClientRect();
      const offsetX = e.clientX > 0 ? e.clientX - rect.left : rect.width - 20;
      const offsetY = e.clientY > 0 ? e.clientY - rect.top : 20;
      e.dataTransfer.setDragImage(elementoCartao, offsetX, offsetY);
    }

    setArrastandoId(id);
  };

  const soltarItem = (
    e: React.DragEvent<HTMLElement>,
    situacao: SituacaoSolicitacaoComercial,
  ) => {
    e.preventDefault();
    setColunaAlvo(null);
    setArrastandoId(null);
    if (!podeMover) return;
    const itemId = e.dataTransfer.getData("text/plain");
    const item = solicitacoes.find((s) => s.id === itemId);
    if (item && item.situacao !== situacao) {
      void aoMover(item, situacao);
    }
  };

  return (
    <section aria-label="Kanban de solicitações" className="space-y-4">
      {/* Seletor de etapas para telas mobile */}
      <div className="md:hidden">
        <label
          htmlFor="etapa-kanban"
          className="mb-2 block text-xs font-semibold text-mineral-700"
        >
          Etapa do atendimento
        </label>
        <select
          id="etapa-kanban"
          value={etapaMobile}
          onChange={(e) => setEtapaMobile(e.target.value as SituacaoSolicitacaoComercial)}
          className="w-full rounded-lg border border-marfim-300 bg-white px-3 py-3 text-sm font-medium text-mineral-900"
        >
          {COLUNAS_KANBAN.map((coluna) => (
            <option key={coluna.situacao} value={coluna.situacao}>
              {coluna.titulo} ({solicitacoes.filter((s) => s.situacao === coluna.situacao).length})
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-mineral-500">
        {podeGerenciar
          ? "Arraste os cartões entre etapas ou use “Mover para” em cada solicitação."
          : "Selecione uma solicitação para consultar os detalhes do atendimento."}
      </p>

      {buscando && solicitacoes.length === 0 ? (
        <p
          role="status"
          className="rounded-xl border border-marfim-200 bg-white p-4 text-sm text-mineral-600"
        >
          Nenhuma solicitação encontrada para esta busca.
        </p>
      ) : null}

      {/* Grade com as 5 etapas lado a lado */}
      <div className="grid items-start gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {COLUNAS_KANBAN.map((coluna) => {
          const itensDaColuna = solicitacoes.filter(
            (item) => item.situacao === coluna.situacao,
          );

          return (
            <ColunaKanbanSolicitacoes
              key={coluna.situacao}
              coluna={coluna}
              todasColunas={COLUNAS_KANBAN}
              itens={itensDaColuna}
              etapaVisivelMobile={etapaMobile}
              colunaAlvo={colunaAlvo}
              arrastandoId={arrastandoId}
              salvandoId={salvandoId}
              copiadoId={copiadoId}
              podeGerenciar={podeGerenciar}
              podeMover={podeMover}
              buscando={buscando}
              nomeOrganizacao={nomeOrganizacao}
              limitePorColuna={limitePorColuna}
              aoAbrir={aoAbrir}
              aoMover={aoMover}
              aoCopiarResumo={copiarResumo}
              aoIniciarArrasto={iniciarArrasto}
              aoFinalizarArrasto={() => {
                setArrastandoId(null);
                setColunaAlvo(null);
              }}
              aoEntrarAlvoArrasto={setColunaAlvo}
              aoSairAlvoArrasto={() => setColunaAlvo(null)}
              aoSoltarItem={soltarItem}
            />
          );
        })}
      </div>
    </section>
  );
}
