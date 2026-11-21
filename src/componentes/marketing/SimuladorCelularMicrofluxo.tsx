"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { CURVA_EDITORIAL } from "@/componentes/interface/constantesAnimacao";
import { usePreferenciaMovimentoReduzido } from "@/ganchos/usarPreferenciaMovimentoReduzido";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import type { EtapaFluxoDemo, ExemploMicrofluxoInterativo } from "./dadosMicrofluxosLanding";

export interface PropriedadesSimuladorCelularMicrofluxo {
  readonly exemplo: ExemploMicrofluxoInterativo;
  readonly etapa: EtapaFluxoDemo;
  readonly opcaoPasso1Id: string | null;
  readonly opcaoPasso2Id: string | null;
  readonly opcoesPasso3Selecionadas: readonly string[];
  readonly aoSelecionarPasso1: (id: string) => void;
  readonly aoSelecionarPasso2: (id: string) => void;
  readonly aoAlternarPasso3: (item: string) => void;
  readonly aoMudarEtapa: (etapa: EtapaFluxoDemo) => void;
  readonly aoReiniciar: () => void;
}

/**
 * Formato real de smartphone com imagem natural embaçada da vitrine ao fundo
 * e bottom-sheet branco aberto com fluxo multi-etapas interativo.
 */
export function SimuladorCelularMicrofluxo({
  exemplo,
  etapa,
  opcaoPasso1Id,
  opcaoPasso2Id,
  opcoesPasso3Selecionadas,
  aoSelecionarPasso1,
  aoSelecionarPasso2,
  aoAlternarPasso3,
  aoMudarEtapa,
  aoReiniciar,
}: PropriedadesSimuladorCelularMicrofluxo) {
  const movimentoReduzido = usePreferenciaMovimentoReduzido();

  return (
    <div className="relative mx-auto flex min-h-[600px] w-[304px] shrink-0 flex-col justify-end overflow-hidden rounded-[2.25rem] border border-white/15 bg-mineral-950 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.65)] ring-1 ring-white/10">
      {/* Fotografia real da vitrine embaçada ao fundo */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={exemplo.imagemFundoSrc}
          alt=""
          fill
          sizes="320px"
          className="scale-105 object-cover object-top blur-[4px] brightness-[0.55]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-mineral-950/50 via-mineral-950/55 to-mineral-950/85"
        />
      </div>

      {/* Topo desfocado da vitrine aberta atrás do bottom-sheet */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative flex flex-1 flex-col items-center justify-center px-6 pt-6 pb-4 text-center opacity-70 blur-[1.5px]"
      >
        <p className="text-xs font-bold tracking-[0.26em] text-white uppercase">
          {exemplo.nomeVitrineFundo}
        </p>
        <p className="mt-1 text-[9px] tracking-[0.18em] text-white/75 uppercase">
          {exemplo.subtituloVitrineFundo}
        </p>
        <span className="mt-4 h-7 w-40 rounded-full bg-white/25" />
      </div>

      {/* Bottom-sheet branco aberto */}
      <div className="relative flex min-h-[435px] flex-col justify-between rounded-t-[1.75rem] bg-white px-5 pt-3 pb-5 text-mineral-950 shadow-[0_-12px_36px_rgba(0,0,0,0.35)]">
        <div>
          {/* Alça discreta */}
          <div className="flex justify-center pb-2.5">
            <span className="h-1 w-9 rounded-full bg-neutral-200" aria-hidden="true" />
          </div>

          {/* Cabeçalho limpo com badge de convite para testar e botão X */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <p className="truncate text-[11px] font-medium text-neutral-500">
                {exemplo.tituloFluxo}
              </p>
              {!opcaoPasso1Id && etapa === 1 ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Toque para testar
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={aoReiniciar}
              aria-label="Reiniciar fluxo"
              title="Reiniciar fluxo"
              className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-mineral-950"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${exemplo.id}-${etapa}`}
              initial={movimentoReduzido ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={movimentoReduzido ? undefined : { opacity: 0, x: -10 }}
              transition={{ duration: movimentoReduzido ? 0 : 0.22, ease: CURVA_EDITORIAL }}
            >
              {/* Etapa 1: Escolha única */}
              {etapa === 1 ? (
                <div className="mt-2.5">
                  <h3 className="text-base leading-snug font-bold tracking-tight text-mineral-950">
                    {exemplo.perguntaPasso1}
                  </h3>

                  <div className="my-3.5 h-px bg-neutral-100" />

                  <div className="space-y-2" role="radiogroup" aria-label={exemplo.perguntaPasso1}>
                    {exemplo.opcoesPasso1.map((opcao, indice) => {
                      const selecionada = opcao.id === opcaoPasso1Id;
                      const convitePrimeiraOpcao =
                        !opcaoPasso1Id && indice === 0 && !movimentoReduzido;

                      return (
                        <motion.button
                          key={opcao.id}
                          type="button"
                          role="radio"
                          aria-checked={selecionada}
                          onClick={() => aoSelecionarPasso1(opcao.id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          animate={
                            convitePrimeiraOpcao
                              ? {
                                  borderColor: [
                                    "rgba(229, 231, 235, 1)",
                                    "rgba(15, 17, 16, 0.45)",
                                    "rgba(229, 231, 235, 1)",
                                  ],
                                  boxShadow: [
                                    "0 0 0 0 rgba(0, 0, 0, 0)",
                                    "0 4px 14px -2px rgba(0, 0, 0, 0.08)",
                                    "0 0 0 0 rgba(0, 0, 0, 0)",
                                  ],
                                }
                              : undefined
                          }
                          transition={
                            convitePrimeiraOpcao
                              ? {
                                  duration: 2.4,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }
                              : undefined
                          }
                          className={combinarClasses(
                            "relative w-full cursor-pointer rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                            selecionada
                              ? "border-mineral-950 bg-neutral-50 shadow-sm"
                              : "border-neutral-200 bg-white hover:border-neutral-300",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-mineral-950">{opcao.titulo}</p>
                            {convitePrimeiraOpcao ? (
                              <span className="text-[10px] font-medium text-emerald-600">
                                Experimentar
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">
                            {opcao.descricao}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Etapa 2: Escolha única */}
              {etapa === 2 ? (
                <div className="mt-2.5">
                  <h3 className="text-base leading-snug font-bold tracking-tight text-mineral-950">
                    {exemplo.perguntaPasso2}
                  </h3>

                  <div className="my-3.5 h-px bg-neutral-100" />

                  <div className="space-y-2" role="radiogroup" aria-label={exemplo.perguntaPasso2}>
                    {exemplo.opcoesPasso2.map((opcao) => {
                      const selecionada = opcao.id === opcaoPasso2Id;
                      return (
                        <button
                          key={opcao.id}
                          type="button"
                          role="radio"
                          aria-checked={selecionada}
                          onClick={() => aoSelecionarPasso2(opcao.id)}
                          className={combinarClasses(
                            "w-full cursor-pointer rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                            selecionada
                              ? "border-mineral-950 bg-neutral-50"
                              : "border-neutral-200 bg-white hover:border-neutral-300",
                          )}
                        >
                          <p className="text-xs font-semibold text-mineral-950">{opcao.titulo}</p>
                          <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">
                            {opcao.descricao}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Etapa 3: Múltipla escolha por toque (zero atrito de digitação) */}
              {etapa === 3 ? (
                <div className="mt-2.5">
                  <h3 className="text-base leading-snug font-bold tracking-tight text-mineral-950">
                    {exemplo.perguntaPasso3}
                  </h3>
                  <p className="mt-1 text-[11px] text-neutral-500">Selecione um ou mais itens</p>

                  <div className="my-3.5 h-px bg-neutral-100" />

                  <div className="grid grid-cols-1 gap-2">
                    {exemplo.opcoesPasso3.map((item) => {
                      const marcado = opcoesPasso3Selecionadas.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          aria-pressed={marcado}
                          onClick={() => aoAlternarPasso3(item)}
                          className={combinarClasses(
                            "flex w-full cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition-colors",
                            marcado
                              ? "border-mineral-950 bg-neutral-50 text-mineral-950"
                              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300",
                          )}
                        >
                          <span>{item}</span>
                          <span
                            className={combinarClasses(
                              "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                              marcado
                                ? "border-mineral-950 bg-mineral-950 text-white"
                                : "border-neutral-300 bg-white",
                            )}
                          >
                            {marcado ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Etapa 4: Confirmação limpa (ícone OK + título + descrição) */}
              {etapa === 4 ? (
                <div className="py-7 text-center">
                  <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-alerta-sucesso/10 text-alerta-sucesso">
                    <Check className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold tracking-tight text-mineral-950">
                    {exemplo.tituloConfirmacao}
                  </h3>
                  <p className="mx-auto mt-2 max-w-[235px] text-xs leading-relaxed text-neutral-600">
                    {exemplo.descricaoConfirmacao}
                  </p>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Rodapé de navegação da gaveta */}
        <div className="mt-4 border-t border-neutral-100 pt-3.5">
          {etapa === 1 ? (
            <button
              type="button"
              disabled={!opcaoPasso1Id}
              onClick={() => aoMudarEtapa(2)}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-mineral-950 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-mineral-800 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Continuar
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}

          {etapa === 2 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => aoMudarEtapa(1)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Voltar
              </button>
              <button
                type="button"
                disabled={!opcaoPasso2Id}
                onClick={() => aoMudarEtapa(3)}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-mineral-950 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-mineral-800 disabled:cursor-not-allowed disabled:opacity-35"
              >
                Continuar
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : null}

          {etapa === 3 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => aoMudarEtapa(2)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Voltar
              </button>
              <button
                type="button"
                disabled={opcoesPasso3Selecionadas.length === 0}
                onClick={() => aoMudarEtapa(4)}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-mineral-950 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-mineral-800 disabled:cursor-not-allowed disabled:opacity-35"
              >
                Enviar
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : null}

          {etapa === 4 ? (
            <div className="space-y-2">
              <Link
                href="/criar-conta"
                className="flex w-full items-center justify-center rounded-lg bg-mineral-950 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-mineral-800"
              >
                {exemplo.ctaWhatsapp}
              </Link>
              <button
                type="button"
                onClick={aoReiniciar}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Testar de novo
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

