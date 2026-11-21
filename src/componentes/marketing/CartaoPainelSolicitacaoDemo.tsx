"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, MessageSquare } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { CURVA_EDITORIAL } from "@/componentes/interface/constantesAnimacao";
import { usePreferenciaMovimentoReduzido } from "@/ganchos/usarPreferenciaMovimentoReduzido";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import type { EtapaFluxoDemo, ExemploMicrofluxoInterativo } from "./dadosMicrofluxosLanding";

export interface PropriedadesCartaoPainelSolicitacaoDemo {
  readonly exemplo: ExemploMicrofluxoInterativo;
  readonly etapa: EtapaFluxoDemo;
  readonly etapaMaximaAlcancada: EtapaFluxoDemo;
  readonly respostaPasso1: string | null;
  readonly respostaPasso2: string | null;
  readonly respostasPasso3: readonly string[];
  readonly aoIrParaEtapa: (etapa: EtapaFluxoDemo) => void;
}

/**
 * Painel do assinante progressivo: exibe cada resposta somente após o usuário
 * chegar àquela etapa e escolher sua opção no celular ao lado.
 */
export function CartaoPainelSolicitacaoDemo({
  exemplo,
  etapa,
  etapaMaximaAlcancada,
  respostaPasso1,
  respostaPasso2,
  respostasPasso3,
  aoIrParaEtapa,
}: PropriedadesCartaoPainelSolicitacaoDemo) {
  const movimentoReduzido = usePreferenciaMovimentoReduzido();
  const animacaoBloco = {
    initial: movimentoReduzido ? false : ({ opacity: 0, y: 8 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: movimentoReduzido ? 0 : 0.25, ease: CURVA_EDITORIAL },
  };

  const etapasTrilha: readonly { readonly numero: EtapaFluxoDemo; readonly rotulo: string }[] = [
    { numero: 1, rotulo: `1. ${exemplo.rotuloEtapa1}` },
    { numero: 2, rotulo: `2. ${exemplo.rotuloEtapa2}` },
    { numero: 3, rotulo: `3. ${exemplo.rotuloEtapa3}` },
    { numero: 4, rotulo: "4. Enviado" },
  ];

  const temAlgumaResposta =
    Boolean(respostaPasso1) || Boolean(respostaPasso2) || respostasPasso3.length > 0;

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-white/12 bg-mineral-900 p-6 text-white sm:p-7">
      <div>
        {/* Trilha das etapas — clicável apenas para etapas já alcançadas */}
        <div className="flex flex-wrap gap-1.5 border-b border-white/10 pb-5">
          {etapasTrilha.map((item) => {
            const atual = etapa === item.numero;
            const alcancada = item.numero <= etapaMaximaAlcancada;
            const concluida = etapa > item.numero;
            return (
              <button
                key={item.numero}
                type="button"
                disabled={!alcancada}
                onClick={() => aoIrParaEtapa(item.numero)}
                className={combinarClasses(
                  "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors",
                  atual
                    ? "bg-white text-mineral-950"
                    : concluida
                      ? "cursor-pointer bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                      : alcancada
                        ? "cursor-pointer bg-white/12 text-white hover:bg-white/20"
                        : "cursor-default bg-white/5 text-neutral-500",
                )}
              >
                {item.rotulo}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-neutral-400">O que chega no seu painel</p>
            <h3 className="mt-0.5 text-lg font-bold text-white">Solicitação qualificada</h3>
          </div>
          <span
            className={combinarClasses(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              etapa === 4
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-white/10 text-neutral-300",
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            {etapa === 4 ? "Recebida" : temAlgumaResposta ? `Etapa ${etapa} de 3` : "Aguardando"}
          </span>
        </div>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
            <dt className="text-xs text-neutral-400">Cliente</dt>
            <dd className="mt-1 font-semibold text-white">{exemplo.clienteExemplo}</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
            <dt className="text-xs text-neutral-400">Canal</dt>
            <dd className="mt-1 font-semibold text-white">{exemplo.canalExemplo}</dd>
          </div>

          {!temAlgumaResposta ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-center sm:col-span-2">
              <p className="text-xs leading-relaxed text-neutral-400">
                Selecione uma opção no celular ao lado para acompanhar as respostas aparecendo aqui
                em tempo real.
              </p>
            </div>
          ) : null}

          {respostaPasso1 ? (
            <motion.div
              {...animacaoBloco}
              className={combinarClasses(
                "rounded-xl border p-3.5 transition-colors sm:col-span-2",
                etapa === 1
                  ? "border-white/35 bg-white/[0.08]"
                  : "border-white/10 bg-white/[0.04]",
              )}
            >
              <dt className="text-xs text-neutral-400">{exemplo.perguntaPasso1}</dt>
              <dd className="mt-1 font-semibold text-white">{respostaPasso1}</dd>
            </motion.div>
          ) : null}

          {etapaMaximaAlcancada >= 2 && respostaPasso2 ? (
            <motion.div
              {...animacaoBloco}
              className={combinarClasses(
                "rounded-xl border p-3.5 transition-colors sm:col-span-2",
                etapa === 2
                  ? "border-white/35 bg-white/[0.08]"
                  : "border-white/10 bg-white/[0.04]",
              )}
            >
              <dt className="text-xs text-neutral-400">{exemplo.perguntaPasso2}</dt>
              <dd className="mt-1 font-semibold text-white">{respostaPasso2}</dd>
            </motion.div>
          ) : null}

          {etapaMaximaAlcancada >= 3 && respostasPasso3.length > 0 ? (
            <motion.div
              {...animacaoBloco}
              className={combinarClasses(
                "rounded-xl border p-3.5 transition-colors sm:col-span-2",
                etapa === 3
                  ? "border-white/35 bg-white/[0.08]"
                  : "border-white/10 bg-white/[0.04]",
              )}
            >
              <dt className="text-xs text-neutral-400">{exemplo.perguntaPasso3}</dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {respostasPasso3.map((item) => (
                  <span
                    key={item}
                    className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-medium text-white"
                  >
                    {item}
                  </span>
                ))}
              </dd>
            </motion.div>
          ) : null}
        </dl>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-neutral-300">
          <MessageSquare className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          <span>Retorno ao WhatsApp em 1 clique</span>
        </div>

        <Botao
          variante="editorial_principal"
          tamanho="compacto"
          className="bg-white font-semibold text-mineral-950 hover:bg-neutral-200"
          comoFilho
        >
          <Link href="/criar-conta">
            Criar meu microfluxo
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Botao>
      </div>
    </div>
  );
}
