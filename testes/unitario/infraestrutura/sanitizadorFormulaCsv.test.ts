import { describe, expect, it } from "vitest";
import { sanitizarCelulaCsv } from "@/infraestrutura/exportacao/sanitizadorFormulaCsv";

describe("sanitizarCelulaCsv (Prevenção de CSV Injection / CWE-1236)", () => {
  it("trata valores nulos e indefinidos retornando string vazia", () => {
    expect(sanitizarCelulaCsv(null)).toBe("");
    expect(sanitizarCelulaCsv(undefined)).toBe("");
  });

  it("mantém textos comuns inalterados quando não possuem caracteres especiais", () => {
    expect(sanitizarCelulaCsv("Pedro Henrique")).toBe("Pedro Henrique");
    expect(sanitizarCelulaCsv(1234)).toBe("1234");
  });

  it("escapa células com ponto-e-vírgula e aspas no padrão RFC 4180", () => {
    expect(sanitizarCelulaCsv("Sedã; Hatch")).toBe('"Sedã; Hatch"');
    expect(sanitizarCelulaCsv('Modelo "Corolla"')).toBe('"Modelo ""Corolla"""');
  });

  it("bloqueia injeção de fórmulas iniciadas com =", () => {
    const payload = '=HYPERLINK("https://malware.com", "Clique")';
    const sanitizado = sanitizarCelulaCsv(payload);
    expect(sanitizado).toBe(`"'=HYPERLINK(""https://malware.com"", ""Clique"")"`);
  });

  it("bloqueia injeção com espaços em branco antes do gatilho =", () => {
    const payload = '   =HYPERLINK("https://malware.com")';
    const sanitizado = sanitizarCelulaCsv(payload);
    expect(sanitizado).toBe(`"'   =HYPERLINK(""https://malware.com"")"`);
  });

  it("bloqueia outros gatilhos perigosos (@, +, -, tabs)", () => {
    expect(sanitizarCelulaCsv("@SUM(1+1)")).toBe(`"'@SUM(1+1)"`);
    expect(sanitizarCelulaCsv("+cmd|' /C calc'!A0")).toBe(`"'+cmd|' /C calc'!A0"`);
    expect(sanitizarCelulaCsv("\t=cmd")).toBe(`"'\t=cmd"`);
    expect(sanitizarCelulaCsv("-2+5")).toBe(`"'-2+5"`);
  });

  it("preserva quebras de linha devidamente encapsuladas em aspas duplas", () => {
    const textoComQuebra = "Linha 1\nLinha 2";
    expect(sanitizarCelulaCsv(textoComQuebra)).toBe('"Linha 1\nLinha 2"');
  });
});

