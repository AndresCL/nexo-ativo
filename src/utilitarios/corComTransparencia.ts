export interface CorComOpacidade {
  readonly hex: string;
  readonly opacidadePercent: number;
}

function limitarCanalRgb(valor: number): number {
  return Math.max(0, Math.min(255, Math.round(valor)));
}

function rgbParaHex(r: number, g: number, b: number): string {
  const paraHex2 = (n: number) => limitarCanalRgb(n).toString(16).padStart(2, "0");
  return `#${paraHex2(r)}${paraHex2(g)}${paraHex2(b)}`;
}

function hexParaRgb(hex: string): { r: number; g: number; b: number } | null {
  const limpo = hex.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(limpo)) return null;
  return {
    r: parseInt(limpo.slice(1, 3), 16),
    g: parseInt(limpo.slice(3, 5), 16),
    b: parseInt(limpo.slice(5, 7), 16),
  };
}

export function parsearCorComOpacidade(valor: string): CorComOpacidade {
  const limpo = valor.trim().toLowerCase();

  if (limpo === "transparent") {
    return { hex: "#000000", opacidadePercent: 0 };
  }

  if (/^#[0-9a-f]{6}$/.test(limpo)) {
    return { hex: limpo, opacidadePercent: 100 };
  }

  if (/^#[0-9a-f]{3}$/.test(limpo)) {
    return {
      hex: `#${limpo[1]}${limpo[1]}${limpo[2]}${limpo[2]}${limpo[3]}${limpo[3]}`,
      opacidadePercent: 100,
    };
  }

  if (/^#[0-9a-f]{8}$/.test(limpo)) {
    const alfa = parseInt(limpo.slice(7, 9), 16) / 255;
    return {
      hex: limpo.slice(0, 7),
      opacidadePercent: Math.round(alfa * 100),
    };
  }

  const matchRgba = limpo.match(
    /^rgba?\(\s*([0-9.]+)\s*[,\s]\s*([0-9.]+)\s*[,\s]\s*([0-9.]+)(?:\s*[,/]\s*([0-9.]+%?))?\s*\)$/,
  );
  if (matchRgba) {
    const r = Number(matchRgba[1]);
    const g = Number(matchRgba[2]);
    const b = Number(matchRgba[3]);
    const alfaBruto = matchRgba[4];

    let opacidadePercent = 100;
    if (alfaBruto !== undefined) {
      if (alfaBruto.endsWith("%")) {
        opacidadePercent = Math.max(0, Math.min(100, Math.round(Number(alfaBruto.slice(0, -1)))));
      } else {
        opacidadePercent = Math.max(0, Math.min(100, Math.round(Number(alfaBruto) * 100)));
      }
    }

    return {
      hex: rgbParaHex(r, g, b),
      opacidadePercent,
    };
  }

  return { hex: "#ffffff", opacidadePercent: 100 };
}

export function formatarCorComOpacidade(hex: string, opacidadePercent: number): string {
  const opacidadeLimitada = Math.max(0, Math.min(100, Math.round(opacidadePercent)));
  const hexNormalizado = parsearCorComOpacidade(hex).hex;

  if (opacidadeLimitada >= 100) {
    return hexNormalizado;
  }

  const rgb = hexParaRgb(hexNormalizado);
  if (!rgb) return hexNormalizado;

  const alfa = Number((opacidadeLimitada / 100).toFixed(2));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alfa})`;
}

