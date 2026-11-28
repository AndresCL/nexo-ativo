import { describe, expect, it } from "vitest";
import {
  formatarCorComOpacidade,
  parsearCorComOpacidade,
} from "@/utilitarios/corComTransparencia";

describe("corComTransparencia", () => {
  it("interpreta hex 3, 6 e 8 dígitos corretamente", () => {
    expect(parsearCorComOpacidade("#abc")).toEqual({ hex: "#aabbcc", opacidadePercent: 100 });
    expect(parsearCorComOpacidade("#0F1110")).toEqual({ hex: "#0f1110", opacidadePercent: 100 });
    expect(parsearCorComOpacidade("#00000080")).toEqual({ hex: "#000000", opacidadePercent: 50 });
  });

  it("interpreta rgba, rgb e transparent corretamente", () => {
    expect(parsearCorComOpacidade("rgba(0, 0, 0, 0.4)")).toEqual({
      hex: "#000000",
      opacidadePercent: 40,
    });
    expect(parsearCorComOpacidade("rgb(255, 128, 0)")).toEqual({
      hex: "#ff8000",
      opacidadePercent: 100,
    });
    expect(parsearCorComOpacidade("transparent")).toEqual({
      hex: "#000000",
      opacidadePercent: 0,
    });
  });

  it("formata hex limpo em 100% e rgba quando menor que 100%", () => {
    expect(formatarCorComOpacidade("#0f1110", 100)).toBe("#0f1110");
    expect(formatarCorComOpacidade("#000000", 40)).toBe("rgba(0, 0, 0, 0.4)");
    expect(formatarCorComOpacidade("#ffffff", 0)).toBe("rgba(255, 255, 255, 0)");
  });
});

