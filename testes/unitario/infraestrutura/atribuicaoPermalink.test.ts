import { beforeEach, describe, expect, it } from "vitest";
import {
  obterOuDetectarOrigemSessao,
  gravarAtribuicaoOrigem,
} from "@/infraestrutura/analytics/rastreadorSessaoOrigem";
import { esquemaRegistroEventoAnonimo } from "@/validacoes/esquemasTelemetriaAnonima";

beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState(null, "", "/cliente");
});

describe("Atribuição de entradas por permalink", () => {
  it("reclassifica uma entrada por permalink mesmo quando a aba já tinha origem direta", () => {
    gravarAtribuicaoOrigem("org-teste", { canalOrigem: "direto" });
    window.history.replaceState(null, "", "/cliente#experiencia=e-YWxmYQ");
    expect(obterOuDetectarOrigemSessao("org-teste").canalOrigem).toBe("permalink");
    window.history.replaceState(null, "", "/cliente");
    expect(obterOuDetectarOrigemSessao("org-teste").canalOrigem).toBe("permalink");
  });

  it("mantém a atribuição ao consultor e não duplica o acesso no canal Instagram", () => {
    window.history.replaceState(
      null,
      "",
      "/cliente?consultor=ana&utm_source=instagram#experiencia=e-YWxmYQ",
    );
    expect(obterOuDetectarOrigemSessao("org-teste")).toEqual({
      canalOrigem: "permalink",
      cartaoProfissionalId: "ana",
    });
  });

  it("continua reconhecendo os demais canais quando a entrada não é um permalink", () => {
    window.history.replaceState(null, "", "/cliente?utm_source=instagram");
    expect(obterOuDetectarOrigemSessao("org-teste").canalOrigem).toBe("instagram");
  });

  it("aceita o novo canal no contrato enviado às funções", () => {
    expect(
      esquemaRegistroEventoAnonimo.safeParse({
        organizacaoId: "org-teste",
        tipoEvento: "abertura_microfluxo",
        canalOrigem: "permalink",
        microfluxoId: "alfa",
      }).success,
    ).toBe(true);
  });
});
