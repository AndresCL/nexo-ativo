"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePreferenciaMovimentoReduzido } from "@/ganchos/usarPreferenciaMovimentoReduzido";
import { CURVA_EDITORIAL, DURACOES_SEGUNDOS } from "./constantesAnimacao";

export interface PropriedadesTransicaoColapsavel {
  readonly aberto: boolean;
  readonly children: ReactNode;
  readonly className?: string;
  readonly duracaoSegundos?: number;
}

/**
 * Transição suave de expansão e recolhimento de altura para seções retráteis
 * (ex: configurações de e-mail, painéis de filtro ou formulários inline).
 */
export function TransicaoColapsavel({
  aberto,
  children,
  className,
  duracaoSegundos = DURACOES_SEGUNDOS.colapsavel,
}: PropriedadesTransicaoColapsavel) {
  const movimentoReduzido = usePreferenciaMovimentoReduzido();

  return (
    <AnimatePresence initial={false}>
      {aberto ? (
        <motion.div
          initial={movimentoReduzido ? false : { opacity: 0, height: 0, overflow: "hidden" }}
          animate={{
            opacity: 1,
            height: "auto",
            transitionEnd: { overflow: "visible" },
          }}
          exit={movimentoReduzido ? undefined : { opacity: 0, height: 0, overflow: "hidden" }}
          transition={{
            height: {
              duration: movimentoReduzido ? 0 : duracaoSegundos,
              ease: CURVA_EDITORIAL,
            },
            opacity: {
              duration: movimentoReduzido ? 0 : duracaoSegundos * 0.75,
              ease: CURVA_EDITORIAL,
            },
          }}
          className={className}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
