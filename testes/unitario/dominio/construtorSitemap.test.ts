import { describe, expect, it } from "vitest";
import {
  CAMINHOS_BLOQUEADOS_ROBOTS,
  construirConfiguracaoRobots,
  construirEntradasSitemap,
  normalizarUrlBaseSitemap,
} from "@/dominio/servicos/construtorSitemap";

describe("construtorSitemap", () => {
  it("normaliza URL base removendo barras finais e espaços", () => {
    expect(normalizarUrlBaseSitemap("  https://nexoativo.com.br///  ")).toBe(
      "https://nexoativo.com.br",
    );
  });

  it("gera entradas institucionais com URLs absolutas e datas válidas", () => {
    const entradas = construirEntradasSitemap("https://nexoativo.com.br/");

    expect(entradas.map((item) => item.url)).toEqual([
      "https://nexoativo.com.br",
      "https://nexoativo.com.br/privacidade",
      "https://nexoativo.com.br/termos",
    ]);

    for (const item of entradas) {
      expect(item.lastModified).toBeInstanceOf(Date);
      expect(Number.isNaN((item.lastModified as Date).getTime())).toBe(false);
    }
  });

  it("mescla rotas editoriais adicionais, normaliza caminhos e deduplica URLs", () => {
    const entradas = construirEntradasSitemap("https://nexoativo.com.br", [
      { caminho: "/privacidade/", atualizadoEmIso: "2026-12-01" },
      { caminho: "blog/qualificacao-whatsapp/", atualizadoEmIso: "2026-11-21" },
      { caminho: "/blog/sem-data" },
      { caminho: "/blog/data-invalida", atualizadoEmIso: "data-invalida" },
    ]);

    expect(entradas.map((item) => item.url)).toEqual([
      "https://nexoativo.com.br",
      "https://nexoativo.com.br/privacidade",
      "https://nexoativo.com.br/termos",
      "https://nexoativo.com.br/blog/qualificacao-whatsapp",
      "https://nexoativo.com.br/blog/sem-data",
      "https://nexoativo.com.br/blog/data-invalida",
    ]);

    expect(entradas[4].lastModified).toBeUndefined();
    expect(entradas[5].lastModified).toBeUndefined();
  });

  it("gera configuração de robots apontando para sitemap oficial e bloqueando apenas rotas privadas", () => {
    const config = construirConfiguracaoRobots("https://nexoativo.com.br/");

    expect(config.sitemap).toBe("https://nexoativo.com.br/sitemap.xml");
    expect(config.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: [...CAMINHOS_BLOQUEADOS_ROBOTS],
    });
  });
});

