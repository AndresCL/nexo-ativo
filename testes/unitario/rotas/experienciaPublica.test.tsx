import { obterIdentificadorPublicoExperiencia } from "@/dominio/microfluxos/conclusaoMicrofluxo";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PaginaExperienciaPublica from "@/app/(vitrine-publica)/[identificadorOrganizacao]/experiencias/[identificadorExperiencia]/page";
import { criarMicrofluxoPadraoParaTestes } from "../../fixtures/geradoresMicrofluxoTeste";
import {
  CATALOGO_ACERVOS_DEMONSTRACAO,
  CATALOGO_DEMONSTRACOES_EDITORIAIS,
} from "../../fixtures/dadosExemploVitrine";
const { buscar, redirecionar } = vi.hoisted(() => ({
  buscar: vi.fn(),
  redirecionar: vi.fn((destino: string) => {
    throw new Error(`REDIRECT:${destino}`);
  }),
}));
vi.mock("@/infraestrutura/vitrine/leitorPaginaPublicadaFirestore", () => ({
  leitorPaginaPublicadaPadrao: { buscarVitrineCompletaPorIdentificador: buscar },
}));
vi.mock("next/navigation", () => ({
  redirect: redirecionar,
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
const pagina = CATALOGO_DEMONSTRACOES_EDITORIAIS["lumina-arquitetura-luz"]!;
const fluxo = criarMicrofluxoPadraoParaTestes({
  organizacaoId: pagina.organizacaoId,
  nomeOrganizacao: "Lumina",
  modelo: "catalogo",
});
const pacote = {
  pagina,
  acervo: { ...CATALOGO_ACERVOS_DEMONSTRACAO["lumina-arquitetura-luz"]!, microfluxos: [fluxo] },
};
const params = Promise.resolve({
  identificadorOrganizacao: pagina.identificadorPublico,
  identificadorExperiencia: obterIdentificadorPublicoExperiencia(fluxo.id),
});
beforeEach(() => buscar.mockResolvedValue(pacote));
describe("Entrada direta pública", () => {
  it("recusa o ID interno como endereço público", async () => {
    await expect(
      PaginaExperienciaPublica({
        params: Promise.resolve({
          identificadorOrganizacao: pagina.identificadorPublico,
          identificadorExperiencia: fluxo.id,
        }),
      }),
    ).rejects.toThrow("NOT_FOUND");
  });
  it("redireciona o permalink anterior à home com a experiência no modal", async () => {
    await expect(PaginaExperienciaPublica({ params })).rejects.toThrow(
      `REDIRECT:/${pagina.identificadorPublico}#experiencia=${obterIdentificadorPublicoExperiencia(fluxo.id)}`,
    );
    expect(buscar).toHaveBeenCalledWith(pagina.identificadorPublico);
  });
  it("preserva consultor, origem e parâmetros repetidos no redirecionamento", async () => {
    await expect(
      PaginaExperienciaPublica({
        params,
        searchParams: Promise.resolve({
          consultor: "ana",
          utm_source: "instagram",
          tag: ["a", "b"],
        }),
      }),
    ).rejects.toThrow(
      `REDIRECT:/${pagina.identificadorPublico}?consultor=ana&utm_source=instagram&tag=a&tag=b#experiencia=${obterIdentificadorPublicoExperiencia(fluxo.id)}`,
    );
  });
  it.each([
    null,
    { ...pacote, acervo: { ...pacote.acervo, microfluxos: [] } },
    { ...pacote, acervo: { ...pacote.acervo, microfluxos: [{ ...fluxo, ativo: false }] } },
    {
      ...pacote,
      acervo: { ...pacote.acervo, microfluxos: [{ ...fluxo, organizacaoId: "outra-organizacao" }] },
    },
  ])(
    "bloqueia organização indisponível, experiência privada, removida ou de outro tenant",
    async (resposta) => {
      buscar.mockResolvedValue(resposta);
      await expect(PaginaExperienciaPublica({ params })).rejects.toThrow("NOT_FOUND");
    },
  );
  it("valida identificadores antes de consultar", async () => {
    await expect(
      PaginaExperienciaPublica({
        params: Promise.resolve({
          identificadorOrganizacao: "lumina",
          identificadorExperiencia: "../privado",
        }),
      }),
    ).rejects.toThrow("NOT_FOUND");
    expect(buscar).not.toHaveBeenCalled();
  });
});
