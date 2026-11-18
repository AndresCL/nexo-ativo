"use client";

import { useState } from "react";
import * as Dialogo from "@radix-ui/react-dialog";
import { Clock, ExternalLink, MessageSquarePlus, Send, X } from "lucide-react";
import {
  DESCRITORES_ETAPA_KANBAN_FUNDADOR,
  type EtapaKanbanOrganizacaoFundador,
  type ItemVisaoGeralOrganizacaoFundador,
  type MensagemKanbanFundador,
} from "@/dominio/fundador/tiposPainelFundador";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import { combinarClasses } from "@/utilitarios/combinarClasses";

const formatadorDataHora = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

export interface PropriedadesGavetaMensagensOrganizacaoFundador {
  readonly organizacao: ItemVisaoGeralOrganizacaoFundador | null;
  readonly salvando: boolean;
  readonly acessandoOrgId: string | null;
  readonly aoFechar: () => void;
  readonly aoMoverEtapa: (
    organizacao: ItemVisaoGeralOrganizacaoFundador,
    novaEtapa: EtapaKanbanOrganizacaoFundador,
  ) => Promise<void>;
  readonly aoAdicionarMensagem: (
    organizacao: ItemVisaoGeralOrganizacaoFundador,
    texto: string,
  ) => Promise<void>;
  readonly aoAcessarPainel: (organizacao: ItemVisaoGeralOrganizacaoFundador) => Promise<void>;
  readonly aoAbrirAjustePlano: (organizacao: ItemVisaoGeralOrganizacaoFundador) => void;
  readonly aoAbrirAlterarSituacao: (organizacao: ItemVisaoGeralOrganizacaoFundador) => void;
  readonly aoAbrirPerfilPublicidade: (organizacao: ItemVisaoGeralOrganizacaoFundador) => void;
}

export function GavetaMensagensOrganizacaoFundador({
  organizacao,
  salvando,
  acessandoOrgId,
  aoFechar,
  aoMoverEtapa,
  aoAdicionarMensagem,
  aoAcessarPainel,
  aoAbrirAjustePlano,
  aoAbrirAlterarSituacao,
  aoAbrirPerfilPublicidade,
}: PropriedadesGavetaMensagensOrganizacaoFundador) {
  const [textoNovaMensagem, setTextoNovaMensagem] = useState("");
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  const mensagensOrdenadas: readonly MensagemKanbanFundador[] = organizacao?.mensagensKanban
    ? [...organizacao.mensagensKanban].sort((a, b) =>
        b.criadoEmIso.localeCompare(a.criadoEmIso),
      )
    : [];

  async function submeterMensagem(e: React.FormEvent) {
    e.preventDefault();
    if (!organizacao) return;

    const textoLimpo = textoNovaMensagem.trim();
    if (!textoLimpo) {
      notificar.erro("Digite uma mensagem antes de salvar.");
      return;
    }

    setEnviandoMensagem(true);
    try {
      await aoAdicionarMensagem(organizacao, textoLimpo);
      setTextoNovaMensagem("");
    } finally {
      setEnviandoMensagem(false);
    }
  }

  return (
    <Dialogo.Root
      open={organizacao !== null}
      onOpenChange={(aberto) => {
        if (!aberto && !enviandoMensagem) {
          aoFechar();
        }
      }}
    >
      <Dialogo.Portal>
        <Dialogo.Overlay className="fixed inset-0 z-50 bg-mineral-950/35 backdrop-blur-xs" />
        <Dialogo.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl focus:outline-none"
        >
          <div className="flex items-center justify-between gap-3 border-b border-marfim-200 px-6 py-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
                Acompanhamento do Fundador
              </p>
              <Dialogo.Title className="truncate text-base font-bold text-mineral-950">
                {organizacao?.nome ?? "Organização"}
              </Dialogo.Title>
            </div>
            <Dialogo.Close
              disabled={enviandoMensagem}
              aria-label="Fechar mensagens"
              className="rounded-lg p-2 text-mineral-600 hover:bg-marfim-100"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialogo.Close>
          </div>

          {organizacao ? (
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
              <CartaoSuperficie className="space-y-4 rounded-xl border border-marfim-200 bg-marfim-50/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-medium text-mineral-700">
                      /{organizacao.identificadorPublico}
                    </p>
                    <p className="text-[11px] text-mineral-500">
                      {organizacao.segmentoAtividade} · Plano{" "}
                      <strong className="uppercase">{organizacao.planoCodigo}</strong> (
                      {organizacao.situacaoAssinatura})
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={acessandoOrgId === organizacao.id}
                    onClick={() => void aoAcessarPainel(organizacao)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {acessandoOrgId === organizacao.id ? "Abrindo..." : "Acessar Painel"}
                    </span>
                  </button>
                </div>

                <div className="border-t border-marfim-200 pt-3">
                  <label
                    htmlFor="select-etapa-kanban-gaveta"
                    className="block text-[11px] font-semibold text-mineral-700"
                  >
                    Grupo no Kanban
                  </label>
                  <select
                    id="select-etapa-kanban-gaveta"
                    value={organizacao.etapaKanban ?? "onboarding"}
                    disabled={salvando}
                    onChange={(e) =>
                      void aoMoverEtapa(
                        organizacao,
                        e.target.value as EtapaKanbanOrganizacaoFundador,
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-marfim-300 bg-white px-3 py-2 text-xs font-medium text-mineral-900 focus:border-indigo-500 focus:outline-none disabled:opacity-60"
                  >
                    {(
                      Object.keys(
                        DESCRITORES_ETAPA_KANBAN_FUNDADOR,
                      ) as EtapaKanbanOrganizacaoFundador[]
                    ).map((codigo) => (
                      <option key={codigo} value={codigo}>
                        {DESCRITORES_ETAPA_KANBAN_FUNDADOR[codigo].rotulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-marfim-200 pt-3">
                  <button
                    type="button"
                    onClick={() => aoAbrirAjustePlano(organizacao)}
                    className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    Ajustar Plano
                  </button>
                  <button
                    type="button"
                    onClick={() => aoAbrirAlterarSituacao(organizacao)}
                    className="rounded-lg border border-marfim-300 bg-white px-2.5 py-1.5 text-[11px] font-medium text-mineral-800 transition-colors hover:bg-marfim-100"
                  >
                    Alterar Situação
                  </button>
                  <button
                    type="button"
                    onClick={() => aoAbrirPerfilPublicidade(organizacao)}
                    className="rounded-lg border border-marfim-300 bg-white px-2.5 py-1.5 text-[11px] font-medium text-mineral-800 transition-colors hover:bg-marfim-100"
                  >
                    Perfil de Publicidade
                  </button>
                </div>
              </CartaoSuperficie>

              <form onSubmit={(e) => void submeterMensagem(e)} className="space-y-3">
                <label
                  htmlFor="campo-nova-mensagem-fundador"
                  className="flex items-center gap-1.5 text-xs font-bold text-mineral-900"
                >
                  <MessageSquarePlus className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                  <span>Nova mensagem / anotação do cliente</span>
                </label>
                <textarea
                  id="campo-nova-mensagem-fundador"
                  rows={3}
                  maxLength={1000}
                  value={textoNovaMensagem}
                  onChange={(e) => setTextoNovaMensagem(e.target.value)}
                  placeholder="Registre observações, combinados comerciais, pendências de onboarding ou histórico de contato..."
                  className="w-full rounded-xl border border-marfim-300 bg-white p-3 text-xs leading-relaxed text-mineral-900 shadow-2xs focus:border-indigo-500 focus:outline-none"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-mineral-400">
                    Visível exclusivamente no Painel Fundador ({textoNovaMensagem.length}/1000)
                  </span>
                  <Botao
                    type="submit"
                    tamanho="compacto"
                    disabled={enviandoMensagem || textoNovaMensagem.trim().length === 0}
                    className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{enviandoMensagem ? "Salvando..." : "Adicionar mensagem"}</span>
                  </Botao>
                </div>
              </form>

              <div className="space-y-3 border-t border-marfim-200 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold tracking-tight text-mineral-900 uppercase">
                    Histórico de Mensagens ({mensagensOrdenadas.length})
                  </h3>
                </div>

                {mensagensOrdenadas.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-marfim-300 px-4 py-8 text-center">
                    <p className="text-xs text-mineral-500">
                      Nenhuma mensagem registrada para este cliente ainda.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2.5">
                    {mensagensOrdenadas.map((msg) => (
                      <li
                        key={msg.id}
                        className={combinarClasses(
                          "rounded-xl border border-marfim-200 bg-white p-3.5 shadow-2xs",
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-mineral-500">
                          <span className="inline-flex items-center gap-1 font-medium text-mineral-600">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            <time dateTime={msg.criadoEmIso}>
                              {formatadorDataHora.format(new Date(msg.criadoEmIso))}
                            </time>
                          </span>
                          {msg.autorEmail ? (
                            <span className="font-mono text-[10px] text-mineral-400">
                              {msg.autorEmail}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-mineral-900">
                          {msg.texto}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </Dialogo.Content>
      </Dialogo.Portal>
    </Dialogo.Root>
  );
}

