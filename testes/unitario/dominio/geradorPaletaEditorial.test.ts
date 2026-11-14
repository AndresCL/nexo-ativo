import { describe, expect, it } from "vitest";
import {
  gerarPaletaEditorialAPartirDeCorPrimaria,
  hexParaRgb,
  hslParaRgb,
  rgbParaHex,
  rgbParaHsl,
} from "@/dominio/servicos/geradorPaletaEditorial";

describe("Serviço de Domínio: Gerador de Paleta Editorial a partir de Cor Primária", () => {
  it("deve converter HEX para RGB e RGB para HEX com fidelidade", () => {
    const rgbAzul = hexParaRgb("#1e3a8a");
    expect(rgbAzul).toEqual({ r: 30, g: 58, b: 138 });
    expect(rgbParaHex(rgbAzul)).toBe("#1e3a8a");

    const rgbCurto = hexParaRgb("#fff");
    expect(rgbCurto).toEqual({ r: 255, g: 255, b: 255 });
    expect(rgbParaHex(rgbCurto)).toBe("#ffffff");

    // Fallback gracioso para entrada inválida
    const invalido = hexParaRgb("nao-e-hex");
    expect(invalido).toEqual({ r: 15, g: 17, b: 16 });
  });

  it("deve converter RGB para HSL e HSL de volta para RGB", () => {
    const rgbOriginal = { r: 220, g: 38, b: 38 }; // Vermelho vibrante
    const hsl = rgbParaHsl(rgbOriginal);
    const rgbConvertido = hslParaRgb(hsl);

    // Margem de tolerância de 1 unidade devido a arredondamento
    expect(Math.abs(rgbConvertido.r - rgbOriginal.r)).toBeLessThanOrEqual(2);
    expect(Math.abs(rgbConvertido.g - rgbOriginal.g)).toBeLessThanOrEqual(2);
    expect(Math.abs(rgbConvertido.b - rgbOriginal.b)).toBeLessThanOrEqual(2);
  });

  it("deve gerar paleta escura harmônica e contrastante a partir de um azul corporativo (#1E3A8A)", () => {
    const paleta = gerarPaletaEditorialAPartirDeCorPrimaria("#1e3a8a", "escuro");

    expect(paleta.temaEscuro).toBe(true);
    expect(paleta.corFundoPrincipal).toMatch(/^#[0-9a-f]{6}$/i);
    expect(paleta.corSuperficie).toMatch(/^#[0-9a-f]{6}$/i);
    expect(paleta.corTextoPrincipal).toBe("#f8fafc");
    expect(paleta.corDestaque).toMatch(/^#[0-9a-f]{6}$/i);

    // O fundo deve ser muito escuro (luminosidade baixa)
    const hslFundo = rgbParaHsl(hexParaRgb(paleta.corFundoPrincipal));
    expect(hslFundo.l).toBeLessThanOrEqual(10);

    // A superfície deve ter elevação perceptível em relação ao fundo
    const hslSuperficie = rgbParaHsl(hexParaRgb(paleta.corSuperficie));
    expect(hslSuperficie.l).toBeGreaterThan(hslFundo.l);
  });

  it("deve gerar paleta clara equilibrada a partir de um verde esmeralda (#059669)", () => {
    const paleta = gerarPaletaEditorialAPartirDeCorPrimaria("#059669", "claro");

    expect(paleta.temaEscuro).toBe(false);
    expect(paleta.corFundoPrincipal).toMatch(/^#[0-9a-f]{6}$/i);

    // O fundo deve ter luminosidade de off-white (> 90%)
    const hslFundo = rgbParaHsl(hexParaRgb(paleta.corFundoPrincipal));
    expect(hslFundo.l).toBeGreaterThanOrEqual(90);

    // O texto principal deve ser muito escuro para contraste de leitura (< 20%)
    const hslTexto = rgbParaHsl(hexParaRgb(paleta.corTextoPrincipal));
    expect(hslTexto.l).toBeLessThanOrEqual(20);
  });
});
