"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { CURVA_EDITORIAL } from "@/componentes/interface/constantesAnimacao";
import { usePreferenciaMovimentoReduzido } from "@/ganchos/usarPreferenciaMovimentoReduzido";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { SEGMENTOS_PME, type DefinicaoSegmentoPme } from "./conteudoLanding";
import { MockupVitrineReal } from "./MockupVitrineReal";
import { RevelacaoScroll } from "./RevelacaoScroll";

/**
 * Segmentação por perfil de negócio com vitrines reais e transição suave entre abas.
 */
export function SecaoSegmentosPme() {
  const movimentoReduzido = usePreferenciaMovimentoReduzido();
  const [segmentoAtivoId, setSegmentoAtivoId] = useState<DefinicaoSegmentoPme["id"]>("profissionais");

  const segmentoAtivo =
    SEGMENTOS_PME.find((segmento) => segmento.id === segmentoAtivoId) ?? SEGMENTOS_PME[0];

  if (!segmentoAtivo) {
    return null;
  }

  return (
    <section
      id="segmentos"
      aria-labelledby="titulo-segmentos"
      className="border-b border-neutral-200/80 bg-neutral-50 py-18 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevelacaoScroll className="mx-auto max-w-xl text-center">
          <h2
            id="titulo-segmentos"
            className="text-3xl font-bold tracking-tight text-mineral-950 sm:text-4xl"
          >
            Feito para negócios reais.
          </h2>
          <p className="mt-2.5 text-sm text-neutral-600 sm:text-base">
            Escolha seu perfil e veja como o Nexo Ativo funciona na prática.
          </p>
        </RevelacaoScroll>

        {/* Abas */}
        <RevelacaoScroll atrasoSegundos={0.06} distanciaY={8}>
          <div
            role="tablist"
            aria-label="Perfis de negócio atendidos pelo Nexo Ativo"
            className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white p-1.5"
          >
            {SEGMENTOS_PME.map((segmento) => {
              const ativo = segmento.id === segmentoAtivo.id;
              return (
                <button
                  key={segmento.id}
                  type="button"
                  role="tab"
                  id={`aba-segmento-${segmento.id}`}
                  aria-selected={ativo}
                  aria-controls={`painel-segmento-${segmento.id}`}
                  onClick={() => setSegmentoAtivoId(segmento.id)}
                  className={combinarClasses(
                    "flex-1 cursor-pointer rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors sm:text-sm",
                    ativo
                      ? "bg-mineral-950 text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-mineral-950",
                  )}
                >
                  {segmento.rotuloAba}
                </button>
              );
            })}
          </div>
        </RevelacaoScroll>

        {/* Conteúdo da aba com crossfade suave */}
        <RevelacaoScroll atrasoSegundos={0.1} distanciaY={12}>
          <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={segmentoAtivo.id}
                role="tabpanel"
                id={`painel-segmento-${segmentoAtivo.id}`}
                aria-labelledby={`aba-segmento-${segmentoAtivo.id}`}
                initial={movimentoReduzido ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={movimentoReduzido ? undefined : { opacity: 0, y: -6 }}
                transition={{
                  duration: movimentoReduzido ? 0 : 0.28,
                  ease: CURVA_EDITORIAL,
                }}
                className="grid items-center gap-10 lg:grid-cols-12"
              >
                <div className="flex justify-center lg:col-span-5">
                  <MockupVitrineReal dados={segmentoAtivo.vitrine} />
                </div>

                <div className="lg:col-span-7">
                  <h3 className="text-2xl font-bold tracking-tight text-mineral-950 sm:text-3xl">
                    {segmentoAtivo.titulo}
                  </h3>

                  <ul className="mt-6 space-y-4">
                    {segmentoAtivo.beneficios.map((beneficio) => (
                      <li key={beneficio.titulo} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mineral-950 text-white">
                          <Check className="h-3 w-3" aria-hidden="true" />
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-mineral-950">
                            {beneficio.titulo}
                          </h4>
                          <p className="mt-0.5 text-sm text-neutral-600">{beneficio.descricao}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Botao
                      variante="operacional_primario"
                      tamanho="padrao"
                      className="group bg-mineral-950 text-white hover:bg-mineral-800"
                      comoFilho
                    >
                      <Link href="/criar-conta">
                        Começar nesse formato
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </Botao>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </RevelacaoScroll>
      </div>
    </section>
  );
}
