"use client";

import { useState } from "react";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  ExternalLink,
  GripVertical,
  MessageSquare,
  Rocket,
} from "lucide-react";
import { formatarRotuloSituacaoAssinatura } from "@/dominio/fundador/calculadoraMetricasFundador";
import {
  DESCRITORES_ETAPA_KANBAN_FUNDADOR,
  type EtapaKanbanOrganizacaoFundador,
  type ItemVisaoGeralOrganizacaoFundador,
} from "@/dominio/fundador/tiposPainelFundador";
import { combinarClasses } from "@/utilitarios/combinarClasses";

const COLUNAS_KANBAN_FUNDADOR = [
  {
    etapa: "onboarding" as const,
    icone: Rocket,
    superficie: "border-indigo-200 from-indigo-50/80",
    texto: "text-indigo-900",
    distintivo: "bg-indigo-100 text-indigo-900",
    iconeCor: "bg-indigo-600",
    destaque: "ring-indigo-400",
  },
  {
    etapa: "ativo" as const,
    icone: CheckCircle2,
    superficie: "border-emerald-200 from-emerald-50/80",
    texto: "text-emerald-900",
    distintivo: "bg-emerald-100 text-emerald-900",
    iconeCor: "bg-emerald-600",
    destaque: "ring-emerald-400",
  },
  {
    etapa: "atencao" as const,
    icone: AlertCircle,
    superficie: "border-amber-200 from-amber-50/80",
    texto: "text-amber-900",
    distintivo: "bg-amber-100 text-amber-900",
    iconeCor: "bg-amber-600",
    destaque: "ring-amber-400",
  },
  {
    etapa: "inativo" as const,
    icone: Archive,
    superficie: "border-marfim-300 from-marfim-100",
    texto: "text-mineral-800",
    distintivo: "bg-marfim-200 text-mineral-800",
    iconeCor: "bg-mineral-600",
    destaque: "ring-mineral-400",
  },
] as const;

export interface PropriedadesQuadroKanbanOrganizacoesFundador {
  readonly organizacoes: readonly ItemVisaoGeralOrganizacaoFundador[];
  readonly salvandoId: string | null;
  readonly acessandoOrgId: string | null;
  readonly aoMover: (
    organizacao: ItemVisaoGeralOrganizacaoFundador,
    novaEtapa: EtapaKanbanOrganizacaoFundador,
  ) => Promise<void>;
  readonly aoAbrirMensagens: (organizacao: ItemVisaoGeralOrganizacaoFundador) => void;
  readonly aoAcessarPainel: (organizacao: ItemVisaoGeralOrganizacaoFundador) => Promise<void>;
}

export function QuadroKanbanOrganizacoesFundador({
  organizacoes,
  salvandoId,
  acessandoOrgId,
  aoMover,
  aoAbrirMensagens,
  aoAcessarPainel,
}: PropriedadesQuadroKanbanOrganizacoesFundador) {
  const [etapaMobile, setEtapaMobile] = useState<EtapaKanbanOrganizacaoFundador>("onboarding");
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);
  const [colunaAlvo, setColunaAlvo] = useState<EtapaKanbanOrganizacaoFundador | null>(null);

  const podeMover = salvandoId === null;

  return (
    <div className="space-y-4">
      <div className="md:hidden">
        <label
          htmlFor="etapa-kanban-fundador-mobile"
          className="mb-1.5 block text-xs font-semibold text-mineral-700"
        >
          Grupo do Kanban
        </label>
        <select
          id="etapa-kanban-fundador-mobile"
          value={etapaMobile}
          onChange={(e) => setEtapaMobile(e.target.value as EtapaKanbanOrganizacaoFundador)}
          className="w-full rounded-lg border border-marfim-300 bg-white px-3 py-2.5 text-xs font-medium text-mineral-900"
        >
          {COLUNAS_KANBAN_FUNDADOR.map((coluna) => {
            const descritor = DESCRITORES_ETAPA_KANBAN_FUNDADOR[coluna.etapa];
            const total = organizacoes.filter(
              (org) => (org.etapaKanban ?? "onboarding") === coluna.etapa,
            ).length;
            return (
              <option key={coluna.etapa} value={coluna.etapa}>
                {descritor.rotulo} ({total})
              </option>
            );
          })}
        </select>
      </div>

      <p className="text-xs text-mineral-500">
        Arraste os cartões entre os grupos, use o seletor “Mover para” ou clique em “Mensagens” para
        registrar notas internas sobre cada cliente.
      </p>

      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUNAS_KANBAN_FUNDADOR.map((coluna) => {
          const descritor = DESCRITORES_ETAPA_KANBAN_FUNDADOR[coluna.etapa];
          const itens = organizacoes.filter(
            (org) => (org.etapaKanban ?? "onboarding") === coluna.etapa,
          );
          const Icone = coluna.icone;

          return (
            <section
              key={coluna.etapa}
              aria-label={`${descritor.rotulo} (${itens.length})`}
              onDragOver={(e) => {
                if (!podeMover || !arrastandoId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setColunaAlvo(coluna.etapa);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                  setColunaAlvo(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setColunaAlvo(null);
                setArrastandoId(null);
                if (!podeMover) return;
                const orgAlvo = organizacoes.find(
                  (o) => o.id === e.dataTransfer.getData("text/plain"),
                );
                const etapaAtual = orgAlvo?.etapaKanban ?? "onboarding";
                if (orgAlvo && etapaAtual !== coluna.etapa) {
                  void aoMover(orgAlvo, coluna.etapa);
                }
              }}
              className={combinarClasses(
                "min-w-0 rounded-2xl border bg-gradient-to-b via-white to-white p-4 shadow-xs transition-shadow",
                coluna.superficie,
                etapaMobile !== coluna.etapa && "hidden md:block",
                colunaAlvo === coluna.etapa && podeMover && `ring-2 ${coluna.destaque}`,
              )}
            >
              <header className="mb-4">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={combinarClasses(
                      "flex items-center gap-2 text-xs font-bold",
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
                    <h2>{descritor.rotulo}</h2>
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
                <p className="mt-2 text-[11px] text-mineral-500">{descritor.descricao}</p>
              </header>

              <ul className="min-h-44 space-y-3">
                {itens.map((org) => {
                  const mensagens = org.mensagensKanban ?? [];
                  const ultimaMensagem =
                    mensagens.length > 0
                      ? [...mensagens].sort((a, b) =>
                          b.criadoEmIso.localeCompare(a.criadoEmIso),
                        )[0]
                      : undefined;

                  return (
                    <li
                      key={org.id}
                      aria-busy={salvandoId === org.id}
                      className={combinarClasses(
                        "rounded-xl border border-marfim-200 bg-white p-3 shadow-xs transition-shadow hover:shadow-sm",
                        arrastandoId === org.id && "opacity-50",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-mineral-950">{org.nome}</p>
                          <p className="truncate font-mono text-[10px] text-mineral-500">
                            /{org.identificadorPublico}
                          </p>
                        </div>

                        <span
                          draggable={podeMover}
                          role="img"
                          aria-label={`Arrastar ${org.nome}`}
                          title="Arraste para outro grupo"
                          onDragStart={(e) => {
                            if (!podeMover) {
                              e.preventDefault();
                              return;
                            }
                            e.dataTransfer.setData("text/plain", org.id);
                            e.dataTransfer.effectAllowed = "move";
                            const elementoCartao = (e.currentTarget as HTMLElement).closest("li");
                            if (
                              elementoCartao &&
                              typeof e.dataTransfer.setDragImage === "function"
                            ) {
                              const rect = elementoCartao.getBoundingClientRect();
                              const offsetX =
                                e.clientX > 0 ? e.clientX - rect.left : rect.width - 20;
                              const offsetY = e.clientY > 0 ? e.clientY - rect.top : 20;
                              e.dataTransfer.setDragImage(elementoCartao, offsetX, offsetY);
                            }
                            setArrastandoId(org.id);
                          }}
                          onDragEnd={() => {
                            setArrastandoId(null);
                            setColunaAlvo(null);
                          }}
                          className="cursor-grab rounded p-1 text-mineral-400 hover:text-mineral-700 active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span
                          className={combinarClasses(
                            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            org.situacao === "ativa"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                              : "border-red-300 bg-red-50 text-red-900",
                          )}
                        >
                          {org.situacao}
                        </span>
                        <span className="rounded-full border border-marfim-200 bg-marfim-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-mineral-700">
                          {org.planoCodigo}
                        </span>
                        <span className="text-[10px] text-mineral-500">
                          ·{" "}
                          {formatarRotuloSituacaoAssinatura(
                            org.situacaoAssinatura,
                            org.origemAssinatura,
                          )}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => aoAbrirMensagens(org)}
                        className="mt-3 block w-full rounded-lg border border-marfim-200/90 bg-marfim-50/70 p-2.5 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
                      >
                        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-indigo-900">
                          <span className="inline-flex items-center gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                            <span>Mensagens</span>
                          </span>
                          <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-900">
                            {mensagens.length}
                          </span>
                        </div>
                        {ultimaMensagem ? (
                          <p className="mt-1.5 line-clamp-2 break-words text-[11px] leading-relaxed text-mineral-700">
                            {ultimaMensagem.texto}
                          </p>
                        ) : (
                          <p className="mt-1 text-[11px] italic text-mineral-400">
                            Clique para adicionar uma mensagem...
                          </p>
                        )}
                      </button>

                      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-marfim-100 pt-2.5">
                        <button
                          type="button"
                          disabled={acessandoOrgId === org.id}
                          onClick={() => void aoAcessarPainel(org)}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-900 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                        >
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          <span>{acessandoOrgId === org.id ? "Abrindo..." : "Painel"}</span>
                        </button>

                        <label className="flex min-w-0 flex-1 items-center justify-end gap-1.5 text-[10px] text-mineral-500">
                          <span className="shrink-0">
                            {salvandoId === org.id ? "Salvando…" : "Grupo:"}
                          </span>
                          <select
                            aria-label={`Mover ${org.nome} para grupo`}
                            value={org.etapaKanban ?? "onboarding"}
                            disabled={!podeMover}
                            onChange={(e) => {
                              const destino = e.target.value as EtapaKanbanOrganizacaoFundador;
                              if (destino !== (org.etapaKanban ?? "onboarding")) {
                                void aoMover(org, destino);
                              }
                            }}
                            className="max-w-36 min-w-0 truncate rounded-md border border-marfim-200 bg-white px-1.5 py-1 text-[10px] font-medium text-mineral-800 disabled:opacity-60"
                          >
                            {COLUNAS_KANBAN_FUNDADOR.map((dest) => (
                              <option key={dest.etapa} value={dest.etapa}>
                                {DESCRITORES_ETAPA_KANBAN_FUNDADOR[dest.etapa].rotulo}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </li>
                  );
                })}

                {itens.length === 0 ? (
                  <li className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-marfim-300 px-4 text-center">
                    <Icone className="mb-1.5 h-5 w-5 text-mineral-400" aria-hidden="true" />
                    <p className="text-xs text-mineral-500">Nenhum cliente neste grupo</p>
                  </li>
                ) : null}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

