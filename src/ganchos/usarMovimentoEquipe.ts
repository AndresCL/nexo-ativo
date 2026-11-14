"use client";

import { useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePreferenciaMovimentoReduzido } from "./usarPreferenciaMovimentoReduzido";
import { ContextoApresentacaoEquipe } from "./contextoApresentacaoEquipe";

export const ATRASO_PRIMEIRO_MOVIMENTO_EQUIPE_MS = 1_200;
export const DURACAO_TROCA_EQUIPE_MS = 300;
// A descida do atual e a subida do próximo compartilham os mesmos 300ms.
export const INTERVALO_MOVIMENTO_EQUIPE_MS = DURACAO_TROCA_EQUIPE_MS + 2_400;

function observarVisibilidadePagina(aoAlterar: () => void) {
  document.addEventListener("visibilitychange", aoAlterar);
  return () => document.removeEventListener("visibilitychange", aoAlterar);
}

function obterVisibilidadePagina() {
  return !document.hidden;
}

function obterVisibilidadeNoServidor() {
  return false;
}

/** Destaca cada integrante e sincroniza sua descida com a subida do próximo. */
export function useMovimentoEquipe(quantidade: number) {
  const referenciaGrupo = useRef<HTMLSpanElement>(null);
  const apresentacaoLiberada = useContext(ContextoApresentacaoEquipe);
  const movimentoReduzido = usePreferenciaMovimentoReduzido();
  const paginaVisivel = useSyncExternalStore(
    observarVisibilidadePagina,
    obterVisibilidadePagina,
    obterVisibilidadeNoServidor,
  );
  const [naTela, definirNaTela] = useState(false);
  const [entradaIniciada, definirEntradaIniciada] = useState(false);
  const [indiceEmMovimento, definirIndiceEmMovimento] = useState<number | null>(null);
  const movimentoAtivo =
    apresentacaoLiberada && naTela && paginaVisivel && !movimentoReduzido && quantidade > 0;

  useEffect(() => {
    const elemento = referenciaGrupo.current;
    if (!elemento || typeof IntersectionObserver === "undefined") return;
    const observador = new IntersectionObserver(
      ([entrada]) => definirNaTela(Boolean(entrada?.isIntersecting)),
      { threshold: 0.1 },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    definirIndiceEmMovimento(null);
    if (!movimentoAtivo) return;

    definirEntradaIniciada(true);
    let proximoIndice = 0;
    let temporizador: number;
    function moverProximoAvatar() {
      definirIndiceEmMovimento(proximoIndice);
      proximoIndice = (proximoIndice + 1) % quantidade;
      temporizador = window.setTimeout(() => {
        if (quantidade === 1) {
          definirIndiceEmMovimento(null);
          temporizador = window.setTimeout(moverProximoAvatar, DURACAO_TROCA_EQUIPE_MS);
        } else {
          // Uma única atualização inicia as duas transições CSS no mesmo quadro.
          moverProximoAvatar();
        }
      }, INTERVALO_MOVIMENTO_EQUIPE_MS);
    }
    temporizador = window.setTimeout(moverProximoAvatar, ATRASO_PRIMEIRO_MOVIMENTO_EQUIPE_MS);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [movimentoAtivo, quantidade]);

  return {
    referenciaGrupo,
    apresentacaoLiberada,
    entradaIniciada: entradaIniciada || movimentoAtivo,
    movimentoAtivo,
    indiceEmMovimento: movimentoAtivo ? indiceEmMovimento : null,
  };
}
