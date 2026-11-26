import { describe, expect, it } from "vitest";
import {
  briefingPossuiConteudo,
  DADOS_BRIEFING_VAZIO,
  formatarBriefingComoMarkdown,
  normalizarDadosBriefing,
} from "@/dominio/fundador/briefingImplantacao";

describe("briefingImplantacao (domínio)", () => {
  it("identifica corretamente briefing vazio vs preenchido parcialmente", () => {
    expect(briefingPossuiConteudo(DADOS_BRIEFING_VAZIO)).toBe(false);
    expect(
      briefingPossuiConteudo({
        ...DADOS_BRIEFING_VAZIO,
        sobreNegocio: "   \n  ",
      }),
    ).toBe(false);
    expect(
      briefingPossuiConteudo({
        ...DADOS_BRIEFING_VAZIO,
        pendenciasEProximosPassos: "Aguardando logo em SVG",
      }),
    ).toBe(true);
    expect(
      briefingPossuiConteudo({
        ...DADOS_BRIEFING_VAZIO,
        previsaoEntregaData: "2026-12-15",
      }),
    ).toBe(true);
  });

  it("preserva quebras de linha e textos longos acima de 1000 caracteres", () => {
    const textoLongo = `${"Linha de contexto comercial.\n".repeat(60)}`;
    const normalizado = normalizarDadosBriefing({
      sobreNegocio: textoLongo,
      previsaoEntregaData: "2026-12-01",
    });

    expect(normalizado.sobreNegocio.length).toBeGreaterThan(1000);
    expect(normalizado.sobreNegocio).toBe(textoLongo);
    expect(normalizado.previsaoEntregaData).toBe("2026-12-01");
  });

  it("formata briefing em Markdown organizado por seções com data formatada", () => {
    const markdown = formatarBriefingComoMarkdown(
      "Clínica Horizonte",
      {
        ...DADOS_BRIEFING_VAZIO,
        sobreNegocio: "Clínica odontológica premium.\nFoco em implantes.",
        previsaoEntregaData: "2026-12-20",
      },
      "2026-11-26T15:30:00.000Z",
    );

    expect(markdown).toContain("# Briefing de Implantação — Clínica Horizonte");
    expect(markdown).toContain("**Previsão de entrega:** 20/12/2026");
    expect(markdown).toContain("## Sobre o negócio");
    expect(markdown).toContain("Clínica odontológica premium.\nFoco em implantes.");
    expect(markdown).toContain("## Conteúdo e serviços\n\n_Não informado._");
  });
});

