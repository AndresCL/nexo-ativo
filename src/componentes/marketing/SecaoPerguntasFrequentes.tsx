"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { CURVA_EDITORIAL } from "@/componentes/interface/constantesAnimacao";
import { usePreferenciaMovimentoReduzido } from "@/ganchos/usarPreferenciaMovimentoReduzido";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { PERGUNTAS_FREQUENTES } from "./conteudoLanding";
import { RevelacaoScroll } from "./RevelacaoScroll";

/**
 * Acordeão acessível (WCAG 2.2) com expansão suave e respostas diretas.
 */
export function SecaoPerguntasFrequentes() {
  const movimentoReduzido = usePreferenciaMovimentoReduzido();
  const [abertaId, setAbertaId] = useState<string | null>(PERGUNTAS_FREQUENTES[0]?.id ?? null);

  function alternarPergunta(id: string) {
    setAbertaId((atual) => (atual === id ? null : id));
  }

  return (
    <section
      id="perguntas"
      aria-labelledby="titulo-perguntas"
      className="bg-neutral-50 py-18 lg:py-24"
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <RevelacaoScroll>
          <h2
            id="titulo-perguntas"
            className="text-center text-3xl font-bold tracking-tight text-mineral-950 sm:text-4xl"
          >
            Perguntas frequentes
          </h2>
        </RevelacaoScroll>

        <RevelacaoScroll atrasoSegundos={0.06} className="mt-10">
          <div className="divide-y divide-neutral-200 border-y border-neutral-200">
            {PERGUNTAS_FREQUENTES.map((item) => {
              const aberta = abertaId === item.id;
              const painelId = `resposta-faq-${item.id}`;
              return (
                <div key={item.id} className="py-5">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={aberta}
                      aria-controls={painelId}
                      onClick={() => alternarPergunta(item.id)}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 text-left text-base font-semibold text-mineral-950 transition-colors hover:text-neutral-600"
                    >
                      <span>{item.pergunta}</span>
                      <ChevronDown
                        className={combinarClasses(
                          "h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200",
                          aberta && "rotate-180 text-mineral-950",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {aberta ? (
                      <motion.div
                        id={painelId}
                        initial={movimentoReduzido ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={movimentoReduzido ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: movimentoReduzido ? 0 : 0.24, ease: CURVA_EDITORIAL }}
                        className="overflow-hidden"
                      >
                        <p className="pt-2.5 pr-8 text-sm leading-relaxed text-neutral-600">
                          {item.resposta}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </RevelacaoScroll>
      </div>
    </section>
  );
}
