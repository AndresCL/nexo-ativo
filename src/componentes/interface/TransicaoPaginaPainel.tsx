"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { usePreferenciaMovimentoReduzido } from "@/ganchos/usarPreferenciaMovimentoReduzido";
import { CURVA_EDITORIAL, DURACOES_SEGUNDOS } from "./constantesAnimacao";

export interface PropriedadesTransicaoPaginaPainel {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Proporciona transição visual suave entre as diferentes rotas e seções do painel administrativo.
 * Elimina a quebra visual abrupta durante trocas de rotas no Next.js App Router, sem reter o unmount do roteador.
 */
export function TransicaoPaginaPainel({ children, className }: PropriedadesTransicaoPaginaPainel) {
  const pathname = usePathname();
  const movimentoReduzido = usePreferenciaMovimentoReduzido();

  return (
    <motion.div
      key={pathname}
      initial={movimentoReduzido ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: movimentoReduzido ? 0 : DURACOES_SEGUNDOS.painel,
        ease: CURVA_EDITORIAL,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
