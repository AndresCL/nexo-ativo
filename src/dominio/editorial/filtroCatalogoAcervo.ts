import type { ProdutoCatalogo, ServicoOrganizacao } from "@/dominio/entidades/catalogoConteudo";

export const LIMITE_CARROSSEL_HOME = 8;
export const LIMITE_GRADE_HOME = 6;

export interface ResultadoFatiamentoColecaoHome<T> {
  readonly itensVisiveis: readonly T[];
  readonly quantidadeRestante: number;
  readonly total: number;
}

export function fatiarColecaoParaHome<T>(
  itens: readonly T[],
  modo: "carrossel" | "grade_2_colunas",
): ResultadoFatiamentoColecaoHome<T> {
  const total = itens.length;

  if (modo === "carrossel") {
    // Evita cortar por apenas 1 item ("+1 produto") no carrossel
    if (total <= LIMITE_CARROSSEL_HOME + 1) {
      return { itensVisiveis: itens, quantidadeRestante: 0, total };
    }
    return {
      itensVisiveis: itens.slice(0, LIMITE_CARROSSEL_HOME),
      quantidadeRestante: total - LIMITE_CARROSSEL_HOME,
      total,
    };
  }

  if (total <= LIMITE_GRADE_HOME) {
    return { itensVisiveis: itens, quantidadeRestante: 0, total };
  }

  return {
    itensVisiveis: itens.slice(0, LIMITE_GRADE_HOME),
    quantidadeRestante: total - LIMITE_GRADE_HOME,
    total,
  };
}

export type OrdenacaoCatalogoAcervo = "destaque" | "menor_preco" | "maior_preco" | "az";

export interface ItemCatalogoFiltravel {
  readonly id: string;
  readonly nome: string;
  readonly resumo?: string;
  readonly categoria?: string;
  readonly urlImagem?: string;
  readonly precoCentavos?: number;
  readonly rotuloPrecoOpcional?: string;
  readonly prazoOuDuracao?: string;
  readonly especificacoes?: readonly string[];
  readonly ordemOriginal: number;
}

export interface CategoriaCatalogoResumo {
  readonly nome: string;
  readonly quantidade: number;
}

export interface CriteriosFiltroCatalogo {
  readonly termoBusca: string;
  readonly categoriaSelecionada: string | null;
  readonly ordenacao: OrdenacaoCatalogoAcervo;
}

export function normalizarTextoBusca(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function adaptarProdutosParaCatalogo(
  produtos: readonly ProdutoCatalogo[],
): readonly ItemCatalogoFiltravel[] {
  return produtos
    .filter((produto) => produto.ativo)
    .map((produto, indice) => ({
      id: produto.id,
      nome: produto.nome,
      resumo: produto.resumo,
      categoria: produto.categoria?.trim() || undefined,
      urlImagem: produto.imagens?.[0]?.url || produto.urlImagemPrincipal,
      precoCentavos: produto.precoCentavos,
      rotuloPrecoOpcional: produto.rotuloPrecoOpcional,
      especificacoes: produto.especificacoesCurtas,
      ordemOriginal: indice,
    }));
}

export function adaptarServicosParaCatalogo(
  servicos: readonly ServicoOrganizacao[],
): readonly ItemCatalogoFiltravel[] {
  return servicos
    .filter((servico) => servico.ativo)
    .map((servico, indice) => ({
      id: servico.id,
      nome: servico.nome,
      resumo: servico.resumo,
      categoria: servico.categoria?.trim() || undefined,
      urlImagem: servico.imagens?.[0]?.url || servico.urlImagemOpcional,
      precoCentavos: servico.precoBaseCentavos,
      rotuloPrecoOpcional: servico.rotuloPrecoOpcional,
      prazoOuDuracao: servico.prazoOuDuracao,
      ordemOriginal: indice,
    }));
}

export function extrairCategoriasCatalogo(
  itens: readonly ItemCatalogoFiltravel[],
): readonly CategoriaCatalogoResumo[] {
  const contagemPorCategoria = new Map<string, number>();

  for (const item of itens) {
    const categoria = item.categoria?.trim();
    if (!categoria) continue;
    contagemPorCategoria.set(categoria, (contagemPorCategoria.get(categoria) ?? 0) + 1);
  }

  return Array.from(contagemPorCategoria.entries()).map(([nome, quantidade]) => ({
    nome,
    quantidade,
  }));
}

function correspondeAoTermo(item: ItemCatalogoFiltravel, termoNormalizado: string): boolean {
  if (!termoNormalizado) return true;

  const camposPesquisaveis = [
    item.nome,
    item.categoria ?? "",
    item.resumo ?? "",
    item.prazoOuDuracao ?? "",
    ...(item.especificacoes ?? []),
  ];

  return camposPesquisaveis.some((campo) =>
    normalizarTextoBusca(campo).includes(termoNormalizado),
  );
}

export function filtrarEOrdenarCatalogo(
  itens: readonly ItemCatalogoFiltravel[],
  criterios: CriteriosFiltroCatalogo,
): readonly ItemCatalogoFiltravel[] {
  const termoNormalizado = normalizarTextoBusca(criterios.termoBusca);

  const filtrados = itens.filter((item) => {
    if (
      criterios.categoriaSelecionada &&
      item.categoria !== criterios.categoriaSelecionada
    ) {
      return false;
    }
    return correspondeAoTermo(item, termoNormalizado);
  });

  if (criterios.ordenacao === "destaque") {
    return filtrados;
  }

  return [...filtrados].sort((a, b) => {
    if (criterios.ordenacao === "az") {
      return a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
    }

    const precoA = a.precoCentavos;
    const precoB = b.precoCentavos;
    const aTemPreco = typeof precoA === "number" && Number.isFinite(precoA);
    const bTemPreco = typeof precoB === "number" && Number.isFinite(precoB);

    if (!aTemPreco && !bTemPreco) return a.ordemOriginal - b.ordemOriginal;
    if (!aTemPreco) return 1;
    if (!bTemPreco) return -1;

    if (criterios.ordenacao === "menor_preco") {
      return precoA - precoB || a.ordemOriginal - b.ordemOriginal;
    }

    return precoB - precoA || a.ordemOriginal - b.ordemOriginal;
  });
}

