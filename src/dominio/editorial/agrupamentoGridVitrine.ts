import type { ItemAcaoHome } from "../entidades/paginaPublicada";

export const LARGURAS_CARD_VITRINE = ["inteiro", "metade"] as const;
export type LarguraCardVitrine = (typeof LARGURAS_CARD_VITRINE)[number];

export type LinhaVitrine =
  | { readonly tipo: "inteira"; readonly idBloco: string }
  | { readonly tipo: "par"; readonly idsBlocos: readonly [string, string] };

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
 * Destaques primários e seções inline sempre ocupam largura inteira.
 */
export function podeUsarLarguraMetade(
  acao: ItemAcaoHome,
  ehDestaque: boolean,
): boolean {
  if (ehDestaque) return false;
  if (resolverLarguraCardVitrine(acao.larguraCard) !== "metade") return false;
  return tipoAcaoSuportaCardMetade(acao.tipoDestino, acao.modoExibicaoColecao);
}

/**
 * Agrupa a ordem resolvida de blocos em linhas inteiras ou pares 2×1.
 * Regra anti-buraco: um card `"metade"` sem par consecutivo é promovido
 * automaticamente para linha inteira.
 */
export function agruparBlocosEmLinhasVitrine(
  ordemBlocos: readonly string[],
  ehBlocoMetade: (idBloco: string) => boolean,
): readonly LinhaVitrine[] {
  const linhas: LinhaVitrine[] = [];
  let pendenteMetade: string | null = null;

  for (const idBloco of ordemBlocos) {
    if (ehBlocoMetade(idBloco)) {
      if (pendenteMetade === null) {
        pendenteMetade = idBloco;
      } else {
        linhas.push({ tipo: "par", idsBlocos: [pendenteMetade, idBloco] });
        pendenteMetade = null;
      }
      continue;
    }

    if (pendenteMetade !== null) {
      linhas.push({ tipo: "inteira", idBloco: pendenteMetade });
      pendenteMetade = null;
    }
    linhas.push({ tipo: "inteira", idBloco });
  }

  if (pendenteMetade !== null) {
    linhas.push({ tipo: "inteira", idBloco: pendenteMetade });
  }

  return linhas;
}

