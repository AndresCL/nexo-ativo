import { describe, expect, it } from "vitest";
import {
  construirEntradasSitemapArtigos,
  construirJsonLdArtigo,
  resolverArtigosRelacionados,
  serializarJsonLdArtigoSeguro,
} from "@/dominio/conteudo/artigosEditoriais";
import {
  buscarArtigoEditorialPorSlug,
  CATALOGO_ARTIGOS_EDITORIAIS,
} from "@/infraestrutura/conteudo/catalogoArtigos";

describe("artigosEditoriais", () => {
  it("garante que o catálogo tem slugs únicos, datas válidas e zero links relacionados quebrados", () => {
    const slugs = new Set(CATALOGO_ARTIGOS_EDITORIAIS.map((artigo) => artigo.slug));
    expect(slugs.size).toBe(CATALOGO_ARTIGOS_EDITORIAIS.length);
    expect(CATALOGO_ARTIGOS_EDITORIAIS.length).toBeGreaterThanOrEqual(6);

    for (const artigo of CATALOGO_ARTIGOS_EDITORIAIS) {
      expect(Number.isNaN(new Date(artigo.publicadoEmIso).getTime())).toBe(false);
      expect(Number.isNaN(new Date(artigo.atualizadoEmIso).getTime())).toBe(false);
      expect(artigo.secoes.length).toBeGreaterThan(0);

      for (const slugRelacionado of artigo.slugsRelacionados) {
        expect(slugRelacionado).not.toBe(artigo.slug);
        expect(slugs.has(slugRelacionado)).toBe(true);
      }
    }
  });

  it("resolve artigos relacionados sem autorreferência, sem duplicatas e respeitando o limite", () => {
    const artigo = buscarArtigoEditorialPorSlug("como-qualificar-clientes-antes-do-whatsapp");
    expect(artigo).toBeDefined();

    const relacionados = resolverArtigosRelacionados(artigo!, CATALOGO_ARTIGOS_EDITORIAIS, 3);
    expect(relacionados).toHaveLength(3);
    expect(relacionados.some((item) => item.slug === artigo!.slug)).toBe(false);
    expect(new Set(relacionados.map((item) => item.slug)).size).toBe(3);
  });

  it("gera entradas de sitemap para /blog e todos os artigos com datas reais", () => {
    const entradas = construirEntradasSitemapArtigos(CATALOGO_ARTIGOS_EDITORIAIS);

    expect(entradas[0]?.caminho).toBe("/blog");
    expect(entradas[0]?.atualizadoEmIso).toBe("2026-11-21");
    expect(entradas).toHaveLength(CATALOGO_ARTIGOS_EDITORIAIS.length + 1);
  });

  it("constrói JSON-LD com Article e BreadcrumbList e escapa caractere <", () => {
    const artigo = CATALOGO_ARTIGOS_EDITORIAIS[0];
    const jsonLd = construirJsonLdArtigo(artigo, "https://nexoativo.com.br/");
    const grafo = jsonLd["@graph"] as Array<Record<string, unknown>>;

    expect(grafo).toHaveLength(2);
    expect(grafo[0]?.["@type"]).toBe("Article");
    expect(grafo[0]?.dateModified).toBe(artigo.atualizadoEmIso);
    expect(grafo[1]?.["@type"]).toBe("BreadcrumbList");

    const serializado = serializarJsonLdArtigoSeguro(
      { ...artigo, titulo: "Teste <script>" },
      "https://nexoativo.com.br",
    );
    expect(serializado).not.toContain("<script>");
    expect(serializado).toContain("\\u003cscript>");
  });
});

