"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as Dialogo from "@radix-ui/react-dialog";
import { motion, useReducedMotion } from "motion/react";
import {
  AlertCircle,
  Calendar,
  Check,
  Copy,
  FileText,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import {
  CURVA_EDITORIAL,
  DURACOES_SEGUNDOS,
} from "@/componentes/interface/constantesAnimacao";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import {
  formatarBriefingComoMarkdown,
  SECOES_BRIEFING_IMPLANTACAO,
} from "@/dominio/fundador/briefingImplantacao";
import type { ItemVisaoGeralOrganizacaoFundador } from "@/dominio/fundador/tiposPainelFundador";
import {
  servicoOperacoesFundadorCliente,
  type PortaBriefingFundadorCliente,
} from "@/infraestrutura/fundador/servicoOperacoesFundadorCliente";
import { useAutoSalvamentoBriefing } from "@/componentes/fundador/hooks/useAutoSalvamentoBriefing";

const formatadorDataHora = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

interface PropriedadesCampoTextoExpansivel {
  readonly id: string;
  readonly rotulo: string;
  readonly valor: string;
  readonly placeholder: string;
  readonly aoAlterar: (valor: string) => void;
}

function CampoTextoExpansivel({
  id,
  rotulo,
  valor,
  placeholder,
  aoAlterar,
}: PropriedadesCampoTextoExpansivel) {
  const refTextarea = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const elemento = refTextarea.current;
    if (!elemento) return;
    elemento.style.height = "auto";
    elemento.style.height = `${Math.max(elemento.scrollHeight, 96)}px`;
  }, [valor]);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-mineral-900">
        {rotulo}
      </label>
      <textarea
        ref={refTextarea}
        id={id}
        rows={3}
        value={valor}
        onChange={(e) => aoAlterar(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none overflow-hidden rounded-xl border border-marfim-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-mineral-900 shadow-2xs transition-colors placeholder:text-mineral-400 focus:border-indigo-500 focus:outline-none"
      />
    </div>
  );
}

export interface PropriedadesModalBriefingImplantacaoFundador {
  readonly organizacao: ItemVisaoGeralOrganizacaoFundador;
  readonly servicoBriefing?: PortaBriefingFundadorCliente;
  readonly aoFechar: () => void;
}

export function ModalBriefingImplantacaoFundador({
  organizacao,
  servicoBriefing = servicoOperacoesFundadorCliente,
  aoFechar,
}: PropriedadesModalBriefingImplantacaoFundador) {
  const prefereMovimentoReduzido = useReducedMotion();
  const [copiadoRecentemente, setCopiadoRecentemente] = useState(false);
  const [fechandoComFlush, setFechandoComFlush] = useState(false);
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);

  const {
    dados,
    carregandoInicial,
    erroCarregamento,
    estadoSalvamento,
    mensagemErroSalvamento,
    atualizadoEmIso,
    atualizarCampo,
    salvarAgora,
    recarregar,
  } = useAutoSalvamentoBriefing({
    organizacaoId: organizacao.id,
    servico: servicoBriefing,
  });

  useEffect(() => {
    if (!copiadoRecentemente) return;
    const timer = setTimeout(() => setCopiadoRecentemente(false), 2000);
    return () => clearTimeout(timer);
  }, [copiadoRecentemente]);

  async function tentarFechar() {
    if (fechandoComFlush) return;

    setFechandoComFlush(true);
    try {
      const salvoComSucesso = await salvarAgora();
      if (salvoComSucesso) {
        aoFechar();
      } else {
        setConfirmarDescarte(true);
      }
    } finally {
      setFechandoComFlush(false);
    }
  }

  async function copiarBriefingMarkdown() {
    const markdown = formatarBriefingComoMarkdown(
      organizacao.nome,
      dados,
      atualizadoEmIso,
    );

    try {
      await navigator.clipboard.writeText(markdown);
      setCopiadoRecentemente(true);
      notificar.sucesso("Briefing copiado em Markdown.");
    } catch {
      notificar.erro("Não foi possível copiar para a área de transferência.");
    }
  }

  return (
    <Dialogo.Root
      open
      onOpenChange={(aberto) => {
        if (!aberto) {
          void tentarFechar();
        }
      }}
    >
      <Dialogo.Portal>
        <Dialogo.Overlay asChild>
          <motion.div
            initial={prefereMovimentoReduzido ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DURACOES_SEGUNDOS.microinteracao }}
            className="fixed inset-0 z-[60] bg-mineral-950/45 backdrop-blur-xs"
          />
        </Dialogo.Overlay>

        <Dialogo.Content
          aria-describedby={undefined}
          onEscapeKeyDown={(evento) => {
            evento.preventDefault();
            void tentarFechar();
          }}
          onInteractOutside={(evento) => {
            evento.preventDefault();
            void tentarFechar();
          }}
          asChild
        >
          <motion.div
            initial={prefereMovimentoReduzido ? false : { opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: DURACOES_SEGUNDOS.painel,
              ease: CURVA_EDITORIAL,
            }}
            className="fixed inset-0 z-[60] flex h-[100dvh] w-full flex-col bg-white shadow-2xl focus:outline-none sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[90vh] sm:w-[calc(100%-2rem)] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-marfim-200"
          >
            <header className="flex items-start justify-between gap-3 border-b border-marfim-200 px-5 py-4 sm:px-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Briefing de Implantação</span>
                </div>
                <Dialogo.Title className="mt-0.5 truncate text-base font-bold text-mineral-950 sm:text-lg">
                  {organizacao.nome}
                </Dialogo.Title>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-mineral-500">
                  <span>
                    {atualizadoEmIso
                      ? `Última atualização: ${formatadorDataHora.format(new Date(atualizadoEmIso))}`
                      : "Ainda não salvo"}
                  </span>

                  {estadoSalvamento === "pendente" ? (
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      Alterações pendentes...
                    </span>
                  ) : null}

                  {estadoSalvamento === "salvando" ? (
                    <span className="inline-flex items-center gap-1 text-indigo-600">
                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                      Salvando...
                    </span>
                  ) : null}

                  {estadoSalvamento === "salvo" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <Check className="h-3 w-3" aria-hidden="true" />
                      Salvo
                    </span>
                  ) : null}

                  {estadoSalvamento === "erro" ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-rose-700">
                      <AlertCircle className="h-3 w-3" aria-hidden="true" />
                      <span>{mensagemErroSalvamento ?? "Erro ao salvar"}</span>
                      <button
                        type="button"
                        onClick={() => void salvarAgora()}
                        className="underline hover:text-rose-900"
                      >
                        Tentar novamente
                      </button>
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  disabled={carregandoInicial || erroCarregamento !== null}
                  onClick={() => void copiarBriefingMarkdown()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-marfim-300 bg-white px-2.5 py-1.5 text-xs font-medium text-mineral-800 transition-colors hover:bg-marfim-100 disabled:opacity-50"
                >
                  {copiadoRecentemente ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                      <span className="hidden sm:inline">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="hidden sm:inline">Copiar briefing completo</span>
                      <span className="sm:hidden">Copiar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={fechandoComFlush}
                  onClick={() => void tentarFechar()}
                  aria-label="Fechar briefing"
                  className="rounded-lg p-2 text-mineral-600 transition-colors hover:bg-marfim-100 disabled:opacity-50"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </header>

            {confirmarDescarte && estadoSalvamento === "erro" ? (
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-200 bg-rose-50 px-5 py-2.5 text-xs text-rose-900 sm:px-6">
                <span>
                  Não foi possível salvar as alterações pendentes. Deseja tentar novamente ou
                  descartar?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void tentarFechar()}
                    className="rounded-md bg-rose-700 px-2.5 py-1 font-medium text-white hover:bg-rose-800"
                  >
                    Tentar novamente
                  </button>
                  <button
                    type="button"
                    onClick={aoFechar}
                    className="rounded-md border border-rose-300 bg-white px-2.5 py-1 font-medium text-rose-800 hover:bg-rose-100"
                  >
                    Descartar e fechar
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {carregandoInicial ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-xs text-mineral-500">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600" aria-hidden="true" />
                  <span>Carregando briefing...</span>
                </div>
              ) : erroCarregamento ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
                  <AlertCircle className="h-6 w-6 text-rose-600" aria-hidden="true" />
                  <p className="text-sm font-medium text-rose-900">{erroCarregamento}</p>
                  <Botao
                    type="button"
                    tamanho="compacto"
                    variante="operacional_secundario"
                    onClick={recarregar}
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Tentar novamente</span>
                  </Botao>
                </div>
              ) : (
                <div className="space-y-5">
                  {SECOES_BRIEFING_IMPLANTACAO.map((secao) => (
                    <CampoTextoExpansivel
                      key={secao.chave}
                      id={`briefing-${secao.chave}`}
                      rotulo={secao.titulo}
                      valor={dados[secao.chave]}
                      placeholder={secao.placeholder}
                      aoAlterar={(valor) => atualizarCampo(secao.chave, valor)}
                    />
                  ))}

                  <div className="space-y-1.5 border-t border-marfim-200 pt-4">
                    <label
                      htmlFor="briefing-previsao-entrega"
                      className="flex items-center gap-1.5 text-xs font-semibold text-mineral-900"
                    >
                      <Calendar className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
                      <span>Previsão de entrega</span>
                    </label>
                    <input
                      id="briefing-previsao-entrega"
                      type="date"
                      value={dados.previsaoEntregaData ?? ""}
                      onChange={(e) =>
                        atualizarCampo(
                          "previsaoEntregaData",
                          e.target.value.trim() ? e.target.value.trim() : null,
                        )
                      }
                      className="w-full max-w-xs rounded-xl border border-marfim-300 bg-white px-3.5 py-2 text-sm text-mineral-900 shadow-2xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </Dialogo.Content>
      </Dialogo.Portal>
    </Dialogo.Root>
  );
}
