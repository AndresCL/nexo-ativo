"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { usePreferenciaMovimentoReduzido } from "@/ganchos/usarPreferenciaMovimentoReduzido";

export interface PropriedadesTituloDigitadoHero {
  readonly textoFixo: string;
  readonly textoDigitado: string;
  readonly className?: string;
}

const ATRASO_INICIAL_MS = 380;
const INTERVALO_CARACTERE_MS = 55;
const DURACAO_PULSO_FINAL_MS = 3500;

/**
 * Exibe a abertura do H1 imediatamente (preservando LCP e leitura instantânea)
 * e digita o fechamento de impacto com cursor fino que pulsa por ~3.5s e desaparece.
 */
export function TituloDigitadoHero({
  textoFixo,
  textoDigitado,
  className,
}: PropriedadesTituloDigitadoHero) {
  const movimentoReduzido = usePreferenciaMovimentoReduzido();
  const [quantidadeVisivel, setQuantidadeVisivel] = useState<number>(0);
  const [exibirCursor, setExibirCursor] = useState<boolean>(true);

  useEffect(() => {
    if (movimentoReduzido) {
      setQuantidadeVisivel(textoDigitado.length);
      setExibirCursor(false);
      return;
    }

    let indice = 0;
    let intervalo: ReturnType<typeof setInterval> | undefined;
    let temporizadorSumir: ReturnType<typeof setTimeout> | undefined;

    const temporizadorInicio = setTimeout(() => {
      intervalo = setInterval(() => {
        indice += 1;
        setQuantidadeVisivel(indice);

        if (indice >= textoDigitado.length) {
          if (intervalo) clearInterval(intervalo);
          temporizadorSumir = setTimeout(() => {
            setExibirCursor(false);
          }, DURACAO_PULSO_FINAL_MS);
        }
      }, INTERVALO_CARACTERE_MS);
    }, ATRASO_INICIAL_MS);

    return () => {
      clearTimeout(temporizadorInicio);
      if (intervalo) clearInterval(intervalo);
      if (temporizadorSumir) clearTimeout(temporizadorSumir);
    };
  }, [movimentoReduzido, textoDigitado]);

  const trechoVisivel = movimentoReduzido
    ? textoDigitado
    : textoDigitado.slice(0, quantidadeVisivel);
  const concluido = quantidadeVisivel >= textoDigitado.length;

  return (
    <h1 className={className}>
      <span className="sr-only">
        {textoFixo}
        {textoDigitado}
      </span>

      <span className="relative block" aria-hidden="true">
        {/* Reserva exatamente a altura final para zero layout shift */}
        <span className="invisible block">
          {textoFixo}
          {textoDigitado}
        </span>

        <span className="absolute inset-0 block">
          {textoFixo}
          <span>{trechoVisivel}</span>
          {!movimentoReduzido ? (
            <motion.span
              initial={{ opacity: 1 }}
              animate={
                exibirCursor
                  ? concluido
                    ? { opacity: [1, 0, 1] }
                    : { opacity: 1 }
                  : { opacity: 0 }
              }
              transition={
                exibirCursor && concluido
                  ? { duration: 0.85, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.45, ease: "easeOut" }
              }
              className="ml-0.5 inline-block h-[0.86em] w-[2.5px] translate-y-[0.08em] rounded-full bg-mineral-950 align-baseline"
            />
          ) : null}
        </span>
      </span>
    </h1>
  );
}

