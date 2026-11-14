"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { usePreferenciaMovimentoReduzido } from "@/ganchos/usarPreferenciaMovimentoReduzido";
import { CURVA_EDITORIAL, DURACOES_SEGUNDOS } from "./constantesAnimacao";

export interface PropriedadesTransicaoEditorial {
  readonly children: ReactNode;
  readonly atrasoSegundos?: number;
  readonly className?: string;
}

/**
 * Entrada suave para títulos e elementos editoriais.
 * Respeita integralmente prefers-reduced-motion sem bloquear a interação do visitante.
 */
export function TransicaoEditorial({
  children,
  atrasoSegundos = 0,
  className,
}: PropriedadesTransicaoEditorial) {
  const movimentoReduzido = usePreferenciaMovimentoReduzido();

  return (
    <motion.div
      initial={movimentoReduzido ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: movimentoReduzido ? 0 : DURACOES_SEGUNDOS.entradaEditorial,
        delay: movimentoReduzido ? 0 : atrasoSegundos,
        ease: CURVA_EDITORIAL,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
