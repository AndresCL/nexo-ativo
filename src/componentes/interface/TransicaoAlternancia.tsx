"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { usePreferenciaMovimentoReduzido } from "@/ganchos/usarPreferenciaMovimentoReduzido";
import { CURVA_EDITORIAL, DURACOES_SEGUNDOS } from "./constantesAnimacao";

export type VarianteTransicaoAlternancia = "vertical" | "horizontal" | "fade";

export interface PropriedadesTransicaoAlternancia {
  readonly chaveId: string;
  readonly children: ReactNode;
  readonly variante?: VarianteTransicaoAlternancia;
  readonly className?: string;
  readonly duracaoSegundos?: number;
}

const CONFIGURACOES_VARIANTE = {
  vertical: {
    inicial: { opacity: 0, y: 8 },
    animado: { opacity: 1, y: 0 },
    saida: { opacity: 0, y: -6 },
  },
  horizontal: {
    inicial: { opacity: 0, x: 12 },
    animado: { opacity: 1, x: 0 },
    saida: { opacity: 0, x: -10 },
  },
  fade: {
    inicial: { opacity: 0 },
    animado: { opacity: 1 },
    saida: { opacity: 0 },
  },
} as const;

/**
 * Transição suave para alternância entre estados mutuamente exclusivos (ex: passos de microfluxo,
 * seleção de solicitações no painel ou abas).
 * Respeita preferências de acessibilidade e movimento reduzido.
 */
export function TransicaoAlternancia({
  chaveId,
  children,
  variante = "vertical",
  className,
  duracaoSegundos = DURACOES_SEGUNDOS.transicaoEtapa,
}: PropriedadesTransicaoAlternancia) {
  const movimentoReduzido = usePreferenciaMovimentoReduzido();
  const animacao = CONFIGURACOES_VARIANTE[variante];

  return (
    <motion.div
      key={chaveId}
      initial={movimentoReduzido ? false : animacao.inicial}
      animate={animacao.animado}
      exit={movimentoReduzido ? undefined : animacao.saida}
      transition={{
        duration: movimentoReduzido ? 0 : duracaoSegundos,
        ease: CURVA_EDITORIAL,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
