import { describe, expect, it } from "vitest";
import {
  extrairCategoriasCatalogo,
  fatiarColecaoParaHome,
  filtrarEOrdenarCatalogo,
  LIMITE_CARROSSEL_HOME,
  LIMITE_GRADE_HOME,
  normalizarTextoBusca,
  type ItemCatalogoFiltravel,
} from "@/dominio/editorial/filtroCatalogoAcervo";

const ITENS_EXEMPLO: readonly ItemCatalogoFiltravel[] = [
  {
    id: "p1",
    nome: "Café Especial Torra Média",
    resumo: "Notas de chocolate e caramelo",
    categoria: "Cafés",
    precoCentavos: 4500,
    especificacoes: ["250g", "Grãos inteiros"],
    ordemOriginal: 0,
  },
  {
    id: "p2",
    nome: "Bolo de Cenoura Artesanal",
    resumo: "Cobertura cremosa de chocolate belga",
    categoria: "Bolos",
    precoCentavos: 6800,
    especificacoes: ["Serve 10 pessoas"],
    ordemOriginal: 1,
  },
  {
    id: "p3",
    nome: "Kit Degustação Corporativo",
    resumo: "Seleção sob medida para eventos",
    categoria: "Cafés",
    rotuloPrecoOpcional: "Sob consulta",
    ordemOriginal: 2,
  },
];

describe("filtroCatalogoAcervo", () => {
  it("normaliza acentos e maiúsculas corretamente", () => {
    expect(normalizarTextoBusca("  Café Especial — Torra Média ")).toBe(
      "cafe especial — torra media",
    );
  });

  it("extrai categorias únicas com contagem preservando ordem de aparição", () => {
    expect(extrairCategoriasCatalogo(ITENS_EXEMPLO)).toEqual([
      { nome: "Cafés", quantidade: 2 },
      { nome: "Bolos", quantidade: 1 },
    ]);
  });

  it("filtra por termo sem acento em nome, resumo e especificações", () => {
    const porNome = filtrarEOrdenarCatalogo(ITENS_EXEMPLO, {
      termoBusca: "cafe",
      categoriaSelecionada: null,
      ordenacao: "destaque",
    });
    expect(porNome.map((item) => item.id)).toEqual(["p1", "p3"]);

    const porEspecificacao = filtrarEOrdenarCatalogo(ITENS_EXEMPLO, {
      termoBusca: "graos",
      categoriaSelecionada: null,
      ordenacao: "destaque",
    });
    expect(porEspecificacao.map((item) => item.id)).toEqual(["p1"]);
  });

  it("combina filtro de categoria e busca", () => {
    const resultado = filtrarEOrdenarCatalogo(ITENS_EXEMPLO, {
      termoBusca: "chocolate",
      categoriaSelecionada: "Bolos",
      ordenacao: "destaque",
    });
    expect(resultado.map((item) => item.id)).toEqual(["p2"]);
  });

  it("ordena por menor preço, maior preço e A-Z mantendo itens sem preço no final", () => {
    const menorPreco = filtrarEOrdenarCatalogo(ITENS_EXEMPLO, {
      termoBusca: "",
      categoriaSelecionada: null,
      ordenacao: "menor_preco",
    });
    expect(menorPreco.map((item) => item.id)).toEqual(["p1", "p2", "p3"]);

    const maiorPreco = filtrarEOrdenarCatalogo(ITENS_EXEMPLO, {
      termoBusca: "",
      categoriaSelecionada: null,
      ordenacao: "maior_preco",
    });
    expect(maiorPreco.map((item) => item.id)).toEqual(["p2", "p1", "p3"]);

    const alfabetica = filtrarEOrdenarCatalogo(ITENS_EXEMPLO, {
      termoBusca: "",
      categoriaSelecionada: null,
      ordenacao: "az",
    });
    expect(alfabetica.map((item) => item.id)).toEqual(["p2", "p1", "p3"]);
  });

  it("fatia coleções para a Home respeitando limite do carrossel (sem cortar por +1) e da grade", () => {
    const noveItens = Array.from({ length: 9 }, (_, i) => i);
    const dezItens = Array.from({ length: 10 }, (_, i) => i);

    expect(fatiarColecaoParaHome(noveItens, "carrossel")).toEqual({
      itensVisiveis: noveItens,
      quantidadeRestante: 0,
      total: 9,
    });

    expect(fatiarColecaoParaHome(dezItens, "carrossel")).toEqual({
      itensVisiveis: dezItens.slice(0, LIMITE_CARROSSEL_HOME),
      quantidadeRestante: 2,
      total: 10,
    });

    expect(fatiarColecaoParaHome(dezItens, "grade_2_colunas")).toEqual({
      itensVisiveis: dezItens.slice(0, LIMITE_GRADE_HOME),
      quantidadeRestante: 4,
      total: 10,
    });
  });
});

