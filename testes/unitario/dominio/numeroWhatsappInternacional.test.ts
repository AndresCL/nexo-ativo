import { describe, expect, it } from "vitest";
import {
  montarLinkWhatsapp,
  normalizarNumeroWhatsappInternacional,
} from "@/dominio/servicos/numeroWhatsappInternacional";

describe("normalizarNumeroWhatsappInternacional", () => {
  it("adiciona DDI 55 a números nacionais brasileiros", () => {
    expect(normalizarNumeroWhatsappInternacional("(22) 98103-8549")).toBe("5522981038549");
  });

  it("mantém número brasileiro que já contém o DDI", () => {
    expect(normalizarNumeroWhatsappInternacional("+55 22 98103-8549")).toBe("5522981038549");
    expect(normalizarNumeroWhatsappInternacional("5522981038549")).toBe("5522981038549");
  });

  it("respeita DDI estrangeiro explícito com + ou 00", () => {
    expect(normalizarNumeroWhatsappInternacional("+1 415 555 2671")).toBe("14155552671");
    expect(normalizarNumeroWhatsappInternacional("+351 912 345 678")).toBe("351912345678");
    expect(normalizarNumeroWhatsappInternacional("00351912345678")).toBe("351912345678");
  });

  it("assume DDI já informado em números longos sem prefixo", () => {
    expect(normalizarNumeroWhatsappInternacional("351912345678")).toBe("351912345678");
  });

  it("retorna null para vazio ou inválido", () => {
    expect(normalizarNumeroWhatsappInternacional(undefined)).toBeNull();
    expect(normalizarNumeroWhatsappInternacional("")).toBeNull();
    expect(normalizarNumeroWhatsappInternacional("123")).toBeNull();
  });
});

describe("montarLinkWhatsapp", () => {
  it("codifica a mensagem e retorna null sem número", () => {
    expect(montarLinkWhatsapp("+351912345678", "Olá!")).toBe(
      "https://wa.me/351912345678?text=Ol%C3%A1!",
    );
    expect(montarLinkWhatsapp(undefined, "Olá")).toBeNull();
  });
});

