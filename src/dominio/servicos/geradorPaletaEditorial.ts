import type { DescritorPaletaEditorial } from "../entidades/composicaoEditorial";

export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface Hsl {
  readonly h: number;
  readonly s: number;
  readonly l: number;
}

export type AtmosferaDesejada = "escuro" | "claro" | "automatica";

/**
 * Converte uma cor HEX (#RGB, #RRGGBB) para valores RGB de 0 a 255.
 */
export function hexParaRgb(hexBruto: string): Rgb {
  let hexLimpo = hexBruto.trim().replace(/^#/, "");

  if (hexLimpo.length === 3) {
    hexLimpo = hexLimpo
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (hexLimpo.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(hexLimpo)) {
    // Fallback defensivo para cor neutra mineral escura
    return { r: 15, g: 17, b: 16 };
  }

  const num = parseInt(hexLimpo, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converte RGB (0-255) para string hexadecimal #rrggbb.
 */
export function rgbParaHex(rgb: Rgb): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const canalHex = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${canalHex(rgb.r)}${canalHex(rgb.g)}${canalHex(rgb.b)}`;
}

/**
 * Converte RGB para HSL (h: 0-360, s: 0-100, l: 0-100).
 */
export function rgbParaHsl(rgb: Rgb): Hsl {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converte HSL para RGB.
 */
export function hslParaRgb(hsl: Hsl): Rgb {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hueParaRgb = (p: number, q: number, t: number) => {
    let tNorm = t;
    if (tNorm < 0) tNorm += 1;
    if (tNorm > 1) tNorm -= 1;
    if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
    if (tNorm < 1 / 2) return q;
    if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hueParaRgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hueParaRgb(p, q, h) * 255),
    b: Math.round(hueParaRgb(p, q, h - 1 / 3) * 255),
  };
}

/**
 * Gera uma paleta cromática editorial completa garantindo contraste legível
 * a partir de uma única cor primária (Single Responsibility - SOLID).
 */
export function gerarPaletaEditorialAPartirDeCorPrimaria(
  corPrimariaHex: string,
  atmosferaDesejada: AtmosferaDesejada = "escuro",
): DescritorPaletaEditorial {
  const rgbBase = hexParaRgb(corPrimariaHex);
  const hslBase = rgbParaHsl(rgbBase);

  const temaEscuro =
    atmosferaDesejada === "escuro" ? true : atmosferaDesejada === "claro" ? false : hslBase.l < 50;

  if (temaEscuro) {
    // Atmosfera escura: fundo quase preto tingido suavemente pelo matiz da marca
    const satFundo = Math.min(hslBase.s, 18);
    const fundoRgb = hslParaRgb({ h: hslBase.h, s: satFundo, l: 6 });
    const superficieRgb = hslParaRgb({ h: hslBase.h, s: Math.min(hslBase.s, 22), l: 12 });
    const textoSecundarioRgb = hslParaRgb({ h: hslBase.h, s: Math.min(hslBase.s, 15), l: 72 });

    // O destaque em tema escuro deve ser vibrante e perceptível
    const destaqueLuminosidade = Math.max(55, Math.min(75, hslBase.l));
    const destaqueSaturacao = Math.max(50, hslBase.s);
    const destaqueRgb = hslParaRgb({
      h: hslBase.h,
      s: destaqueSaturacao,
      l: destaqueLuminosidade,
    });

    return {
      codigo: "noite_mineral", // Identificador compatível
      nome: `Personalizada (${rgbParaHex(rgbBase)})`,
      corFundoPrincipal: rgbParaHex(fundoRgb),
      corSuperficie: rgbParaHex(superficieRgb),
      corTextoPrincipal: "#f8fafc",
      corTextoSecundario: rgbParaHex(textoSecundarioRgb),
      corDestaque: rgbParaHex(destaqueRgb),
      corBorda: "rgba(255, 255, 255, 0.15)",
      corCtaFundo: rgbParaHex(destaqueRgb),
      corCtaTexto: rgbParaHex(fundoRgb),
      corSecundarioFundo: "rgba(0, 0, 0, 0.4)",
      corSecundarioTexto: "#f8fafc",
      temaEscuro: true,
    };
  }

  // Atmosfera clara: fundo off-white tingido suavemente com a cor primária
  const satClaro = Math.min(hslBase.s, 12);
  const fundoRgb = hslParaRgb({ h: hslBase.h, s: satClaro, l: 97 });
  const superficieRgb = hslParaRgb({ h: hslBase.h, s: Math.min(hslBase.s, 16), l: 92 });
  const textoPrincipalRgb = hslParaRgb({ h: hslBase.h, s: Math.min(hslBase.s, 20), l: 10 });
  const textoSecundarioRgb = hslParaRgb({ h: hslBase.h, s: Math.min(hslBase.s, 15), l: 38 });

  // Destaque em tema claro precisa de contraste seguro contra o fundo off-white
  const destaqueLuminosidadeClaro = Math.max(25, Math.min(45, hslBase.l));
  const destaqueRgb = hslParaRgb({
    h: hslBase.h,
    s: Math.max(55, hslBase.s),
    l: destaqueLuminosidadeClaro,
  });

  return {
    codigo: "marfim_editorial", // Identificador compatível
    nome: `Personalizada (${rgbParaHex(rgbBase)})`,
    corFundoPrincipal: rgbParaHex(fundoRgb),
    corSuperficie: rgbParaHex(superficieRgb),
    corTextoPrincipal: rgbParaHex(textoPrincipalRgb),
    corTextoSecundario: rgbParaHex(textoSecundarioRgb),
    corDestaque: rgbParaHex(destaqueRgb),
    corBorda: "rgba(0, 0, 0, 0.12)",
    corCtaFundo: rgbParaHex(destaqueRgb),
    corCtaTexto: "#ffffff",
    corSecundarioFundo: "rgba(255, 255, 255, 0.7)",
    corSecundarioTexto: rgbParaHex(textoPrincipalRgb),
    temaEscuro: false,
  };
}
