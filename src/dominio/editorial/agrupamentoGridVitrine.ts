import type { ItemAcaoHome } from "../entidades/paginaPublicada";

export const LARGURAS_CARD_VITRINE = ["inteiro", "metade"] as const;
export type LarguraCardVitrine = (typeof LARGURAS_CARD_VITRINE)[number];

export type GrupoPareamentoMetadeVitrine = "botao" | "card";

export type LinhaVitrine =
  | { readonly tipo: "inteira"; readonly idBloco: string }
  | { readonly tipo: "metade_isolada"; readonly idBloco: string; readonly grupo: "botao" }
  | {
      readonly tipo: "par";
      readonly idsBlocos: readonly [string, string];
      readonly grupo?: GrupoPareamentoMetadeVitrine;
    };

/** Resolve a largura configurada garantindo `"inteiro"` como fallback padrão. */
export function resolverLarguraCardVitrine(
  largura?: LarguraCardVitrine | null,
): LarguraCardVitrine {
  return largura === "metade" ? "metade" : "inteiro";
}

/** Verifica se um tipo de ação suporta exibição em card compacto (1/2 largura). */
export function tipoAcaoSuportaCardMetade(
  tipoAcao?: string,
  modoExibicaoColecao?: "modal_gaveta" | "carrossel" | "grade_2_colunas",
): boolean {
  if (tipoAcao === "secao_videos" || tipoAcao === "secao_equipe") {
    return false;
  }
  if (
    (tipoAcao === "secao_produtos" || tipoAcao === "secao_servicos") &&
    modoExibicaoColecao &&
    modoExibicaoColecao !== "modal_gaveta"
  ) {
    return false;
  }
  return true;
}

/**
 * Determina se uma ação da vitrine pode efetivamente ocupar 1/2 largura.
 * Destaques primários, secundários e cards terciários suportam 1/2 largura
 * desde que o tipo de ação seja compatível (seções inline continuam inteiras).
 */
export function podeUsarLarguraMetade(
  acao: ItemAcaoHome,
  _ehDestaque?: boolean,
): boolean {
  if (resolverLarguraCardVitrine(acao.larguraCard) !== "metade") return false;
  return tipoAcaoSuportaCardMetade(acao.tipoDestino, acao.modoExibicaoColecao);
}

/**
 * Agrupa a ordem resolvida de blocos em linhas inteiras ou pares 2×1.
 * Regra anti-buraco: um bloco `"metade"` sem par consecutivo compatível é promovido
 * automaticamente para linha inteira.
 * Quando o classificador retorna um grupo (`"botao"` | `"card"`), apenas blocos do
 * mesmo grupo formam par 2×1 (evitando misturar botão pílula 50% com card 50%).
 */
export function agruparBlocosEmLinhasVitrine(
  ordemBlocos: readonly string[],
  classificarBlocoMetade: (idBloco: string) => boolean | GrupoPareamentoMetadeVitrine | null,
): readonly LinhaVitrine[] {
  const linhas: LinhaVitrine[] = [];
  let pendente: { idBloco: string; grupo: GrupoPareamentoMetadeVitrine | "generico" } | null = null;

  function encerrarPendente() {
    if (pendente === null) return;
    if (pendente.grupo === "botao") {
      linhas.push({ tipo: "metade_isolada", idBloco: pendente.idBloco, grupo: "botao" });
    } else {
      linhas.push({ tipo: "inteira", idBloco: pendente.idBloco });
    }
    pendente = null;
  }

  for (const idBloco of ordemBlocos) {
    const resultado = classificarBlocoMetade(idBloco);
    const grupoAtual: GrupoPareamentoMetadeVitrine | "generico" | null =
      resultado === true ? "generico" : resultado === false || resultado === null ? null : resultado;

    if (grupoAtual !== null) {
      if (pendente === null) {
        pendente = { idBloco, grupo: grupoAtual };
      } else if (pendente.grupo === grupoAtual) {
        linhas.push({
          tipo: "par",
          idsBlocos: [pendente.idBloco, idBloco],
          ...(grupoAtual !== "generico" ? { grupo: grupoAtual } : {}),
        });
        pendente = null;
      } else {
        encerrarPendente();
        pendente = { idBloco, grupo: grupoAtual };
      }
      continue;
    }

    encerrarPendente();
    linhas.push({ tipo: "inteira", idBloco });
  }

  encerrarPendente();

  return linhas;
}

