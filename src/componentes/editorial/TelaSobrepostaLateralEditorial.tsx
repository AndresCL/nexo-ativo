"use client";

import { useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  gerarVariaveisCssCatalogoEditorial,
  obterDescritorTipografiaEditorial,
  type ConteudoPaginaPublicada,
} from "@/dominio/entidades/paginaPublicada";
import { usePreferenciaMovimentoReduzido } from "@/ganchos/usarPreferenciaMovimentoReduzido";
import { CURVA_EDITORIAL, DURACOES_SEGUNDOS } from "@/componentes/interface/constantesAnimacao";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { useAmbienteVitrine } from "./contextoAmbienteVitrine";

export interface PropriedadesTelaSobrepostaLateralEditorial {
  readonly aberto: boolean;
  readonly chaveAnimacao: string;
  readonly ariaLabel: string;
  readonly pagina: ConteudoPaginaPublicada;
  readonly aoFechar: () => void;
  readonly aoRetornarFoco?: () => void;
  readonly children: ReactNode;
  readonly className?: string;
  readonly zIndexClassName?: string;
}

/**
 * Primitivo reutilizável de tela cheia que desliza da lateral direita.
 * Suporta tanto viewport público (fixed) quanto prévia contida em MolduraSmartphone (absolute).
 */
export function TelaSobrepostaLateralEditorial({
  aberto,
  chaveAnimacao,
  ariaLabel,
  pagina,
  aoFechar,
  aoRetornarFoco,
  children,
  className,
  zIndexClassName = "z-[35]",
}: PropriedadesTelaSobrepostaLateralEditorial) {
  const { containerPortal } = useAmbienteVitrine();
  const estaContido = containerPortal !== null;
  const movimentoReduzido = usePreferenciaMovimentoReduzido();
  const tipografia = obterDescritorTipografiaEditorial(pagina.tipografiaId);

  const variaveisPaleta = useMemo(
    () =>
      gerarVariaveisCssCatalogoEditorial(
        pagina.paletaId,
        pagina.corPersonalizadaHex,
        pagina.customizacaoTokens,
      ) as CSSProperties,
    [pagina.paletaId, pagina.corPersonalizadaHex, pagina.customizacaoTokens],
  );

  useEffect(() => {
    if (!aberto) return;

    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.stopPropagation();
        aoFechar();
      }
    }

    window.addEventListener("keydown", aoPressionarTecla);
    return () => {
      window.removeEventListener("keydown", aoPressionarTecla);
    };
  }, [aberto, aoFechar]);

  useEffect(() => {
    if (aberto || !aoRetornarFoco) return;
    aoRetornarFoco();
  }, [aberto, aoRetornarFoco]);

  return (
    <AnimatePresence>
      {aberto ? (
        <motion.div
          key={chaveAnimacao}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          initial={movimentoReduzido ? { opacity: 0 } : { x: "100%" }}
          animate={movimentoReduzido ? { opacity: 1 } : { x: 0 }}
          exit={movimentoReduzido ? { opacity: 0 } : { x: "100%" }}
          transition={{
            duration: DURACOES_SEGUNDOS.transicaoEtapa,
            ease: CURVA_EDITORIAL,
          }}
          style={variaveisPaleta}
          className={combinarClasses(
            estaContido ? "absolute inset-0" : "fixed inset-0",
            zIndexClassName,
            "flex flex-col overflow-hidden bg-[var(--editorial-fundo)] text-[var(--editorial-texto)] shadow-2xl",
            tipografia.classeCorpo,
            className,
          )}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

