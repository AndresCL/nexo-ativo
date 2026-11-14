import { describe, expect, it } from "vitest";
import { resolverMicrofluxoPorDestino } from "@/componentes/editorial/roteadorAcoesPublicas";
import { construirCaminhoExperiencia } from "@/dominio/microfluxos/conclusaoMicrofluxo";
import { criarMicrofluxoPadraoParaTestes } from "../../fixtures/geradoresMicrofluxoTeste";

const experiencia = criarMicrofluxoPadraoParaTestes({
  organizacaoId: "org-teste",
  nomeOrganizacao: "Teste",
  modelo: "catalogo",
});
const hash = `#${construirCaminhoExperiencia("teste", experiencia.id).split("#")[1]}`;

describe("Permalink na home", () => {
  it("resolve apenas a experiência identificada pelo link", () => {
    const outra = { ...experiencia, id: "outra-experiencia" };
    expect(resolverMicrofluxoPorDestino(hash, [outra, experiencia])?.microfluxo).toBe(experiencia);
    expect(resolverMicrofluxoPorDestino(hash, [outra])).toBeNull();
  });

  it("não abre experiências inativas nem ações externas pelo permalink", () => {
    expect(resolverMicrofluxoPorDestino(hash, [{ ...experiencia, ativo: false }])).toBeNull();
    expect(
      resolverMicrofluxoPorDestino(hash, [{ ...experiencia, tipoAcao: "link_externo" }]),
    ).toBeNull();
  });

  it("preserva a diferença entre maiúsculas e minúsculas do identificador público", () => {
    expect(resolverMicrofluxoPorDestino(hash.toLowerCase(), [experiencia])).toBeNull();
  });
});
