"use client";

import { createStore } from "zustand/vanilla";

export type TipoNotificacao = "sucesso" | "erro" | "informacao" | "aviso";

export interface Notificacao {
  readonly id: string;
  readonly tipo: TipoNotificacao;
  readonly mensagem: string;
  readonly duracaoMs: number;
}

interface OpcoesNotificacao {
  readonly duracaoMs?: number;
}

export const estadoNotificacoes = createStore<{ readonly itens: readonly Notificacao[] }>(() => ({
  itens: [],
}));

let proximoId = 0;

function adicionar(tipo: TipoNotificacao, mensagem: string, opcoes?: OpcoesNotificacao): string {
  const existentes = estadoNotificacoes.getState().itens;
  const repetida = existentes.find((item) => item.tipo === tipo && item.mensagem === mensagem);
  if (repetida) return repetida.id;

  const notificacao: Notificacao = {
    id: `notificacao-${++proximoId}`,
    tipo,
    mensagem,
    duracaoMs: opcoes?.duracaoMs ?? (tipo === "erro" || tipo === "aviso" ? 10000 : 6000),
  };
  estadoNotificacoes.setState({ itens: [...existentes, notificacao].slice(-3) });
  return notificacao.id;
}

/** Avisos de operações do app. Validação de campos e estados permanentes ficam junto ao conteúdo. */
export const notificar = {
  sucesso: (mensagem: string, opcoes?: OpcoesNotificacao) => adicionar("sucesso", mensagem, opcoes),
  erro: (mensagem: string, opcoes?: OpcoesNotificacao) => adicionar("erro", mensagem, opcoes),
  informacao: (mensagem: string, opcoes?: OpcoesNotificacao) =>
    adicionar("informacao", mensagem, opcoes),
  aviso: (mensagem: string, opcoes?: OpcoesNotificacao) => adicionar("aviso", mensagem, opcoes),
  dispensar: (id: string) => {
    estadoNotificacoes.setState(({ itens }) => ({ itens: itens.filter((item) => item.id !== id) }));
  },
  limpar: () => estadoNotificacoes.setState({ itens: [] }),
};
