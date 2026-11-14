import { beforeEach, describe, expect, it, vi } from "vitest";
import { LeitorPaginaPublicadaFirestore } from "@/infraestrutura/vitrine/leitorPaginaPublicadaFirestore";
import { CATALOGO_DEMONSTRACOES_EDITORIAIS } from "../../fixtures/dadosExemploVitrine";
import { criarMicrofluxoPadraoParaTestes } from "../../fixtures/geradoresMicrofluxoTeste";
const { documentos } = vi.hoisted(() => ({ documentos: new Map<string, unknown>() }));
vi.mock("@/infraestrutura/firebase/adminFirebase", () => {
  function colecao(caminho: string) {
    return {
      doc: (id: string) => ({
        get: async () => ({
          exists: documentos.has(`${caminho}/${id}`),
          data: () => documentos.get(`${caminho}/${id}`),
        }),
        collection: (nome: string) => colecao(`${caminho}/${id}/${nome}`),
      }),
      get: async () => ({
        docs: [...documentos.entries()]
          .filter(
            ([chave]) =>
              chave.startsWith(`${caminho}/`) && !chave.slice(caminho.length + 1).includes("/"),
          )
          .map(([, valor]) => ({ data: () => valor })),
      }),
    };
  }
  return { obterServicosAdminFirebase: () => ({ bancoDadosAdmin: { collection: colecao } }) };
});
const pagina = CATALOGO_DEMONSTRACOES_EDITORIAIS["lumina-arquitetura-luz"]!;
const fluxo = criarMicrofluxoPadraoParaTestes({
  organizacaoId: pagina.organizacaoId,
  nomeOrganizacao: "Lumina",
  modelo: "catalogo",
});
beforeEach(() => {
  documentos.clear();
  documentos.set(`identificadoresPublicos/${pagina.identificadorPublico}`, {
    organizacaoId: pagina.organizacaoId,
    situacao: "ativo",
  });
  documentos.set(`organizacoes/${pagina.organizacaoId}`, { situacao: "ativa" });
  documentos.set(`paginasPublicadas/${pagina.organizacaoId}`, pagina);
  documentos.set(
    `paginasPublicadas/${pagina.organizacaoId}/microfluxosPublicados/${fluxo.id}`,
    fluxo,
  );
  documentos.set(`organizacoes/${pagina.organizacaoId}/microfluxos/rascunho-secreto`, {
    ...fluxo,
    id: "rascunho-secreto",
  });
});
describe("Leitura pública de experiências", () => {
  it("lê somente experiências publicadas sem vazar rascunhos", async () => {
    const pacote = await new LeitorPaginaPublicadaFirestore().buscarVitrineCompletaPorIdentificador(
      pagina.identificadorPublico,
    );
    expect(pacote?.acervo.microfluxos?.map((m) => m.id)).toEqual([fluxo.id]);
  });
  it.each(["suspensa", "encerrada"])(
    "bloqueia a organização %s mesmo quando o slug ainda está ativo",
    async (situacao) => {
      documentos.set(`organizacoes/${pagina.organizacaoId}`, { situacao });
      expect(
        await new LeitorPaginaPublicadaFirestore().buscarVitrineCompletaPorIdentificador(
          pagina.identificadorPublico,
        ),
      ).toBeNull();
    },
  );
});
