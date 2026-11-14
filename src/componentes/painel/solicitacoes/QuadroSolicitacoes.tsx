"use client";

import { useState } from "react";
import {
  Archive,
  Check,
  CheckCheck,
  Compass,
  Copy,
  GripVertical,
  Inbox,
  MessageCircle,
  Send,
} from "lucide-react";
import {
  DESCRITORES_SITUACAO_SOLICITACAO,
  gerarLinkRetornoWhatsappSolicitacao,
  gerarTextoResumoParaCopia,
  type SituacaoSolicitacaoComercial,
  type SolicitacaoComercial,
} from "@/dominio/entidades/solicitacaoComercial";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import { combinarClasses } from "@/utilitarios/combinarClasses";

const COLUNAS = [
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
    situacao: "arquivada",
    titulo: "Arquivadas",
    descricao: "Solicitações encerradas",
    icone: Archive,
    superficie: "border-marfim-300 from-marfim-100",
    texto: "text-mineral-800",
    distintivo: "bg-marfim-200 text-mineral-800",
    iconeCor: "bg-mineral-600",
    destaque: "ring-mineral-400",
  },
] as const;

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "America/Sao_Paulo",
});

export function QuadroSolicitacoes({
  solicitacoes,
  nomeOrganizacao,
  exibirArquivadas,
  buscando,
  podeGerenciar,
  salvandoId,
  aoAbrir,
  aoMover,
}: {
  readonly solicitacoes: readonly SolicitacaoComercial[];
  readonly nomeOrganizacao: string;
  readonly exibirArquivadas: boolean;
  readonly buscando: boolean;
  readonly podeGerenciar: boolean;
  readonly salvandoId: string | null;
  readonly aoAbrir: (id: string) => void;
  readonly aoMover: (
    item: SolicitacaoComercial,
    situacao: SituacaoSolicitacaoComercial,
  ) => Promise<void>;
}) {
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [etapaMobile, setEtapaMobile] = useState<SituacaoSolicitacaoComercial>("nova");
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);
  const [colunaAlvo, setColunaAlvo] = useState<SituacaoSolicitacaoComercial | null>(null);

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
  const colunas = COLUNAS.filter(
    (coluna) => (coluna.situacao === "arquivada") === exibirArquivadas,
  );
  const etapaVisivel = exibirArquivadas ? "arquivada" : etapaMobile;
  const podeMover = podeGerenciar && salvandoId === null;

  return (
    <section aria-label="Kanban de solicitações" className="space-y-4">
      {!exibirArquivadas ? (
        <div className="md:hidden">
          <label
            htmlFor="etapa-kanban"
            className="mb-2 block text-xs font-semibold text-mineral-700"
          >
            Etapa do atendimento
          </label>
          <select
            id="etapa-kanban"
            value={etapaVisivel}
            onChange={(e) => setEtapaMobile(e.target.value as SituacaoSolicitacaoComercial)}
            className="w-full rounded-lg border border-marfim-300 bg-white px-3 py-3 text-sm"
          >
            {colunas.map((coluna) => (
              <option key={coluna.situacao} value={coluna.situacao}>
                {coluna.titulo} ({solicitacoes.filter((s) => s.situacao === coluna.situacao).length}
                )
              </option>
            ))}
          </select>
        </div>
      ) : null}
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
      <div
        className={combinarClasses(
          "grid items-start gap-4",
          exibirArquivadas ? "grid-cols-1" : "md:grid-cols-2 xl:grid-cols-4",
        )}
      >
        {colunas.map((coluna) => {
          const itens = solicitacoes.filter((item) => item.situacao === coluna.situacao);
          const Icone = coluna.icone;
          return (
            <section
              key={coluna.situacao}
              aria-label={`${coluna.titulo} (${itens.length})`}
              onDragOver={(e) => {
                if (!podeMover || !arrastandoId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setColunaAlvo(coluna.situacao);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setColunaAlvo(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setColunaAlvo(null);
                setArrastandoId(null);
                if (!podeMover) return;
                const item = solicitacoes.find(
                  (s) => s.id === e.dataTransfer.getData("text/plain"),
                );
                if (item && item.situacao !== coluna.situacao) void aoMover(item, coluna.situacao);
              }}
              className={combinarClasses(
                "min-w-0 rounded-2xl border bg-gradient-to-b via-white to-white p-4 shadow-xs transition-shadow",
                coluna.superficie,
                etapaVisivel !== coluna.situacao && "hidden md:block",
                colunaAlvo === coluna.situacao && podeMover && `ring-2 ${coluna.destaque}`,
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
              <ul
                className={combinarClasses(
                  "min-h-44 space-y-3",
                  exibirArquivadas && "grid gap-3 space-y-0 md:grid-cols-2 xl:grid-cols-4",
                )}
              >
                {itens.map((item) => (
                  <li
                    key={item.id}
                    aria-busy={salvandoId === item.id}
                    className={combinarClasses(
                      "rounded-xl border border-marfim-200 bg-white shadow-xs transition-shadow hover:shadow-sm",
                      arrastandoId === item.id && "opacity-50",
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
                          onDragStart={(e) => {
                            if (!podeMover) {
                              e.preventDefault();
                              return;
                            }
                            e.dataTransfer.setData("text/plain", item.id);
                            e.dataTransfer.effectAllowed = "move";

                            // Captura o cartão <li> inteiro como imagem de arrasto do cursor
                            const elementoCartao = (e.currentTarget as HTMLElement).closest("li");
                            if (elementoCartao && typeof e.dataTransfer.setDragImage === "function") {
                              const rect = elementoCartao.getBoundingClientRect();
                              const offsetX = e.clientX > 0 ? e.clientX - rect.left : rect.width - 20;
                              const offsetY = e.clientY > 0 ? e.clientY - rect.top : 20;
                              e.dataTransfer.setDragImage(elementoCartao, offsetX, offsetY);
                            }

                            setArrastandoId(item.id);
                          }}
                          onDragEnd={() => {
                            setArrastandoId(null);
                            setColunaAlvo(null);
                          }}
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
                        onClick={(e) => void copiarResumo(item, e)}
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
                            {salvandoId === item.id ? "Salvando…" : "Mover para"}
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
                            {COLUNAS.map((destino) => (
                              <option key={destino.situacao} value={destino.situacao}>
                                {DESCRITORES_SITUACAO_SOLICITACAO[destino.situacao].rotulo}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    ) : null}
                  </li>
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
            </section>
          );
        })}
      </div>
    </section>
  );
}
