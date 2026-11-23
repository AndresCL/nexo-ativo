import { describe, expect, it } from "vitest";
import {
  comporNumeroComDdi,
  montarLinkWhatsapp,
  normalizarNumeroWhatsappInternacional,
  separarDdiENumero,
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

describe("separarDdiENumero e comporNumeroComDdi", () => {
  it("mantém apenas o dígito digitado ao compor e separar números parciais", () => {
    const compostoBr = comporNumeroComDdi("55", "9");
    expect(compostoBr).toBe("+559");
    expect(separarDdiENumero(compostoBr)).toEqual({ ddi: "55", numeroNacional: "9" });

    const compostoUs = comporNumeroComDdi("1", "9");
    expect(compostoUs).toBe("+19");
    expect(separarDdiENumero(compostoUs)).toEqual({ ddi: "1", numeroNacional: "9" });

    const compostoPt = comporNumeroComDdi("351", "91");
    expect(compostoPt).toBe("+35191");
    expect(separarDdiENumero(compostoPt)).toEqual({ ddi: "351", numeroNacional: "91" });
  });

  it("separa DDI corretamente mesmo com mais de 15 dígitos no total", () => {
    expect(separarDdiENumero("+5511999999999999")).toEqual({
      ddi: "55",
      numeroNacional: "11999999999999",
    });
  });

  it("separa números legados sem prefixo + e com prefixo 00", () => {
    expect(separarDdiENumero("(22) 98103-8549")).toEqual({
      ddi: "55",
      numeroNacional: "22981038549",
    });
    expect(separarDdiENumero("00351912345678")).toEqual({
      ddi: "351",
      numeroNacional: "912345678",
    });
    expect(separarDdiENumero("")).toEqual({ ddi: null, numeroNacional: "" });
  });
});

