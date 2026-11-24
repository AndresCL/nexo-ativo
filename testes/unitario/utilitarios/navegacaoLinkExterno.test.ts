import { describe, expect, it } from "vitest";
import { deveAbrirNaMesmaJanela } from "@/utilitarios/navegacaoLinkExterno";

describe("deveAbrirNaMesmaJanela", () => {
  const uaInstagram =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21A329 Instagram 302.0.0.23.109";
  const uaSafariMobile =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
  const uaChromeDesktop =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  it("usa mesma janela para qualquer link no navegador interno do Instagram", () => {
    expect(deveAbrirNaMesmaJanela("https://maps.app.goo.gl/abc", uaInstagram)).toBe(true);
    expect(deveAbrirNaMesmaJanela("https://exemplo.com.br", uaInstagram)).toBe(true);
  });

  it("usa mesma janela no mobile para Google Maps e WhatsApp", () => {
    expect(deveAbrirNaMesmaJanela("https://maps.app.goo.gl/abc", uaSafariMobile)).toBe(true);
    expect(deveAbrirNaMesmaJanela("https://wa.me/5522999999999", uaSafariMobile)).toBe(true);
    expect(deveAbrirNaMesmaJanela("https://exemplo.com.br", uaSafariMobile)).toBe(false);
  });

  it("mantém nova aba no desktop", () => {
    expect(deveAbrirNaMesmaJanela("https://maps.app.goo.gl/abc", uaChromeDesktop)).toBe(false);
    expect(deveAbrirNaMesmaJanela("https://exemplo.com.br", uaChromeDesktop)).toBe(false);
  });
});

