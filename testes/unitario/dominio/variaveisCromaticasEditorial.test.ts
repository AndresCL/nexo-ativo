import { describe, expect, it } from "vitest";
import {
  CATALOGO_PALETAS_EDITORIAIS,
  type IdentificadorPaletaEditorial,
} from "@/dominio/entidades/composicaoEditorial";
import {
  gerarVariaveisCssBottomSheetEditorial,
  gerarVariaveisCssPaletaEditorial,
  resolverTemaEscuroBottomSheetEditorial,
} from "@/dominio/entidades/paginaPublicada";
import { gerarPaletaEditorialAPartirDeCorPrimaria } from "@/dominio/servicos/geradorPaletaEditorial";

describe("Variáveis cromáticas editoriais (Logo, Equipe, Bottom Sheets e Paletas)", () => {
  it("garante que todas as 8 paletas oficiais possuem todos os tokens novos preenchidos", () => {
    const codigos = Object.keys(CATALOGO_PALETAS_EDITORIAIS) as IdentificadorPaletaEditorial[];
    expect(codigos).toHaveLength(8);

    for (const codigo of codigos) {
      const paleta = CATALOGO_PALETAS_EDITORIAIS[codigo];
      expect(paleta.corLogoTitulo).toBeTruthy();
      expect(paleta.corLogoSubtitulo).toBeTruthy();
      expect(paleta.corEquipeTextoPrincipal).toBeTruthy();
      expect(paleta.corEquipeTextoSecundario).toBeTruthy();
      expect(paleta.corBottomSheetFundo).toBeTruthy();
      expect(paleta.corBottomSheetSuperficie).toBeTruthy();
      expect(paleta.corBottomSheetBorda).toBeTruthy();
      expect(paleta.corBottomSheetTextoPrincipal).toBeTruthy();
      expect(paleta.corBottomSheetTextoSecundario).toBeTruthy();
      expect(paleta.corBottomSheetDestaque).toBeTruthy();
      expect(paleta.corBottomSheetCtaFundo).toBeTruthy();
      expect(paleta.corBottomSheetCtaTexto).toBeTruthy();
    }
  });

  it("gera todos os tokens novos ao derivar paleta de uma cor primária (claro e escuro)", () => {
    for (const atmosfera of ["escuro", "claro"] as const) {
      const paleta = gerarPaletaEditorialAPartirDeCorPrimaria("#2563eb", atmosfera);
      expect(paleta.corLogoTitulo).toMatch(/^#/);
      expect(paleta.corLogoSubtitulo).toMatch(/^#/);
      expect(paleta.corEquipeTextoPrincipal).toMatch(/^#/);
      expect(paleta.corEquipeTextoSecundario).toMatch(/^#/);
      expect(paleta.corBottomSheetFundo).toMatch(/^#/);
      expect(paleta.corBottomSheetTextoPrincipal).toMatch(/^#/);
      expect(paleta.corBottomSheetCtaFundo).toMatch(/^#/);
    }
  });

  it("permite alterar separadamente as cores de título e subtítulo da logo sem afetar o texto principal", () => {
    const variaveis = gerarVariaveisCssPaletaEditorial("noite_mineral", undefined, {
      corLogoTitulo: "#ffcc00",
      corLogoSubtitulo: "#00ccff",
    });

    expect(variaveis["--editorial-logo-titulo"]).toBe("#ffcc00");
    expect(variaveis["--editorial-logo-subtitulo"]).toBe("#00ccff");
    expect(variaveis["--editorial-texto"]).toBe(
      CATALOGO_PALETAS_EDITORIAIS.noite_mineral.corTextoPrincipal,
    );
  });

  it("aplica fundo transparente na equipe por padrão e usa Botões Secundários no modo fundo fixo", () => {
    const transparente = gerarVariaveisCssPaletaEditorial("noite_mineral");
    expect(transparente["--editorial-equipe-fundo"]).toBe("transparent");
    expect(transparente["--editorial-equipe-texto"]).toBe(
      CATALOGO_PALETAS_EDITORIAIS.noite_mineral.corEquipeTextoPrincipal,
    );

    const fixo = gerarVariaveisCssPaletaEditorial("noite_mineral", undefined, {
      modoFundoEquipe: "fixo",
      corSecundarioFundo: "#ffffff",
      corSecundarioTexto: "#111827",
    });
    expect(fixo["--editorial-equipe-fundo"]).toBe("#ffffff");
    expect(fixo["--editorial-equipe-texto"]).toBe("#111827");
    expect(fixo["--editorial-equipe-subtitulo"]).toContain("#111827");

    const fixoComOverrideTexto = gerarVariaveisCssPaletaEditorial("noite_mineral", undefined, {
      modoFundoEquipe: "fixo",
      corSecundarioFundo: "#ffffff",
      corSecundarioTexto: "#111827",
      corEquipeTextoPrincipal: "#1d4ed8",
      corEquipeTextoSecundario: "#475569",
    });
    expect(fixoComOverrideTexto["--editorial-equipe-fundo"]).toBe("#ffffff");
    expect(fixoComOverrideTexto["--editorial-equipe-texto"]).toBe("#1d4ed8");
    expect(fixoComOverrideTexto["--editorial-equipe-subtitulo"]).toBe("#475569");
  });

  it("isola completamente as cores e a detecção de tema escuro nos Bottom Sheets", () => {
    const variaveis = gerarVariaveisCssBottomSheetEditorial("noite_mineral", undefined, {
      corBottomSheetFundo: "#ffffff",
      corBottomSheetSuperficie: "#f3f4f6",
      corBottomSheetBorda: "#d1d5db",
      corBottomSheetTextoPrincipal: "#111827",
      corBottomSheetTextoSecundario: "#4b5563",
      corBottomSheetDestaque: "#2563eb",
      corBottomSheetCtaFundo: "#111827",
      corBottomSheetCtaTexto: "#ffffff",
    });

    expect(variaveis["--editorial-fundo"]).toBe("#ffffff");
    expect(variaveis["--editorial-superficie"]).toBe("#f3f4f6");
    expect(variaveis["--editorial-borda"]).toBe("#d1d5db");
    expect(variaveis["--editorial-texto"]).toBe("#111827");
    expect(variaveis["--editorial-titulo"]).toBe("#111827");
    expect(variaveis["--editorial-texto-secundario"]).toBe("#4b5563");
    expect(variaveis["--editorial-subtitulo"]).toBe("#4b5563");
    expect(variaveis["--editorial-destaque"]).toBe("#2563eb");
    expect(variaveis["--editorial-cta-fundo"]).toBe("#111827");
    expect(variaveis["--editorial-cta-texto"]).toBe("#ffffff");

    // Paleta base é escura, mas o fundo do Bottom Sheet é branco -> tema escuro deve ser false
    expect(
      resolverTemaEscuroBottomSheetEditorial("noite_mineral", undefined, {
        corBottomSheetFundo: "#ffffff",
      }),
    ).toBe(false);

    // Paleta base é clara, mas o fundo do Bottom Sheet é preto -> tema escuro deve ser true
    expect(
      resolverTemaEscuroBottomSheetEditorial("marfim_editorial", undefined, {
        corBottomSheetFundo: "#09090b",
      }),
    ).toBe(true);
  });
});

