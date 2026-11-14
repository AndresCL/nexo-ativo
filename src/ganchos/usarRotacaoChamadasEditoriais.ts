"use client";

import { useEffect, useState } from "react";

export const INTERVALO_ROTACAO_CHAMADAS_MS = 8_000;

export function useRotacaoChamadasEditoriais(quantidade: number) {
  const [selecao, definirSelecao] = useState({ indice: 0, ciclo: 0 });
  const [paginaVisivel, definirPaginaVisivel] = useState(false);
  const rotacaoAtiva = quantidade > 1 && paginaVisivel;
  const indiceAtivo = selecao.indice % quantidade;

  useEffect(() => {
    const atualizarVisibilidade = () => {
      definirPaginaVisivel(!document.hidden);
      if (!document.hidden) {
        definirSelecao((atual) => ({ ...atual, ciclo: atual.ciclo + 1 }));
      }
    };
    atualizarVisibilidade();
    document.addEventListener("visibilitychange", atualizarVisibilidade);
    return () => document.removeEventListener("visibilitychange", atualizarVisibilidade);
  }, []);

  useEffect(() => {
    if (!rotacaoAtiva) return;
    const temporizador = window.setTimeout(() => {
      definirSelecao((atual) => ({
        indice: (atual.indice + 1) % quantidade,
        ciclo: atual.ciclo + 1,
      }));
    }, INTERVALO_ROTACAO_CHAMADAS_MS);
    return () => window.clearTimeout(temporizador);
  }, [quantidade, rotacaoAtiva, selecao.ciclo]);

  function selecionarChamada(novoIndice: number) {
    definirSelecao((atual) => ({
      indice: (novoIndice + quantidade) % quantidade,
      ciclo: atual.ciclo + 1,
    }));
  }

  return {
    indiceAtivo,
    ciclo: selecao.ciclo,
    rotacaoAtiva,
    selecionarChamada,
  };
}
