import { describe, expect, it, vi } from "vitest";
import { carregarContextoDesempenhoOrganizacaoServidor } from "@/infraestrutura/painel/leitorDesempenhoOrganizacaoServidor";
import type { UsuarioAutenticado } from "@/dominio/entidades/autenticacaoEOrganizacao";
import { criarMicrofluxoPadraoParaTestes } from "../../fixtures/geradoresMicrofluxoTeste";

vi.mock("@/dominio/permissoes/autorizadorOrganizacao", () => ({
  verificarPermissaoOrganizacao: () => true,
}));
vi.mock("@/infraestrutura/firebase/adminFirebase", () => ({
  obterServicosAdminFirebase: () => ({ bancoDadosAdmin: banco }),
}));

const experiencia = criarMicrofluxoPadraoParaTestes({
  organizacaoId: "org-teste",
  nomeOrganizacao: "Teste",
  modelo: "catalogo",
});
const documentos: Record<string, Record<string, unknown>> = {
  "organizacoes/org-teste": { id: "org-teste" },
  "organizacoes/org-teste/metricasDiarias/2026-11-13": {
    dataIso: "2026-11-13",
    visualizacoesVitrine: 2,
    aberturasMicrofluxo: 2,
    conclusoesMicrofluxo: 1,
    [`porMicrofluxo.${experiencia.id}.titulo`]: "Experiência teste",
    [`porMicrofluxo.${experiencia.id}.aberturas`]: 2,
    [`porMicrofluxo.${experiencia.id}.conclusoes`]: 1,
    [`porMicrofluxo.${experiencia.id}.aberturasPermalink`]: 1,
  },
  "organizacoes/org-teste/solicitacoes/sol-1": {
    microfluxoId: experiencia.id,
    tituloExperiencia: "Experiência teste",
  },
  "organizacoes/org-teste/microfluxos/teste": experiencia as unknown as Record<string, unknown>,
};
function referencia(caminho: string) {
  return {
    collection: (nome: string) => referencia(`${caminho}/${nome}`),
    doc: (id: string) => referencia(`${caminho}/${id}`),
    orderBy: () => referencia(caminho),
    limit: () => referencia(caminho),
    get: async () => {
      const docs = Object.entries(documentos)
        .filter(
          ([chave]) =>
            chave.startsWith(`${caminho}/`) && !chave.slice(caminho.length + 1).includes("/"),
        )
        .map(([, dados]) => ({ data: () => dados }));
      return {
        exists: caminho in documentos,
        data: () => documentos[caminho],
        docs,
        empty: docs.length === 0,
      };
    },
  };
}
const banco = { collection: (nome: string) => referencia(nome) };

describe("Leitura do desempenho por experiência", () => {
  it("preserva os eventos diários sem somar novamente solicitações e inclui os percursos cadastrados", async () => {
    const contexto = await carregarContextoDesempenhoOrganizacaoServidor(
      { uid: "usuario" } as UsuarioAutenticado,
      "org-teste",
    );
    expect(contexto?.resumoMetricas.metricasPorMicrofluxo).toEqual([
      {
        id: experiencia.id,
        titulo: "Experiência teste",
        aberturas: 2,
        conclusoes: 1,
        aberturasPermalink: 1,
        porEtapa: {},
      },
    ]);
    expect(contexto?.experiencias).toEqual([
      {
        id: experiencia.id,
        titulo: experiencia.titulo,
        etapas: [
          {
            id: "etapa-catalogo",
            titulo: "Escolha o item ou modalidade de seu interesse",
          },
          {
            id: "etapa-contato",
            titulo: "Para onde enviamos os detalhes e disponibilidade?",
          },
        ],
      },
    ]);
  });
});
