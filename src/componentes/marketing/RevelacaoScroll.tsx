"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { usePreferenciaMovimentoReduzido } from "@/ganchos/usarPreferenciaMovimentoReduzido";
import { CURVA_EDITORIAL } from "@/componentes/interface/constantesAnimacao";

export interface PropriedadesRevelacaoScroll {
  readonly children: ReactNode;
  readonly atrasoSegundos?: number;
  readonly duracaoSegundos?: number;
  readonly distanciaY?: number;
  readonly className?: string;
}

/**
 * Revelação sóbria e progressiva no scroll usando a curva editorial oficial do app.
 * Dispara uma única vez (once: true) com amount: "some" para evitar espaços vazios no mobile.
 */
export function RevelacaoScroll({
  children,
  atrasoSegundos = 0,
  duracaoSegundos = 0.85,
  distanciaY = 24,
  className,
}: PropriedadesRevelacaoScroll) {
  const movimentoReduzido = usePreferenciaMovimentoReduzido();

  return (
    <motion.div
      initial={movimentoReduzido ? false : { opacity: 0, y: distanciaY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some", margin: "0px 0px -60px 0px" }}
      transition={{
        duration: movimentoReduzido ? 0 : duracaoSegundos,
        delay: movimentoReduzido ? 0 : atrasoSegundos,
        ease: CURVA_EDITORIAL,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

