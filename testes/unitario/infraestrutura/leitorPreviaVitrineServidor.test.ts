import { beforeEach, describe, expect, it, vi } from "vitest";
import { criarEquipeTeste } from "../../fixtures/equipeVitrine";
import type { ContextoEditorOrganizacaoServidor } from "@/infraestrutura/painel/leitorPainelOrganizacaoServidor";

const simulacao = vi.hoisted(() => ({ get: vi.fn(), documento: vi.fn(), colecao: vi.fn() }));
vi.mock("@/infraestrutura/firebase/adminFirebase", () => ({
  obterServicosAdminFirebase: () => ({
    bancoDadosAdmin: {
      collection: (nome: string) => {
        simulacao.colecao(nome);
        return {
          doc: (id: string) => {
            simulacao.documento(id);
            return {
              collection: (subcolecao: string) => ({ get: () => simulacao.get(subcolecao) }),
            };
          },
        };
      },
    },
  }),
}));

import { carregarPreviaVitrineServidor } from "@/infraestrutura/painel/leitorPreviaVitrineServidor";

const contexto = { organizacao: { id: "org-equipe" } } as ContextoEditorOrganizacaoServidor;

describe("Leitura dos dados da prévia autenticada", () => {
  beforeEach(() => vi.clearAllMocks());

  it("consulta somente equipe e experiências da organização autorizada e descarta dados inválidos", async () => {
    const equipe = criarEquipeTeste(4);
    const experiencia = {
      id: "equipe",
      organizacaoId: "org-equipe",
      tipoAcao: "secao_equipe",
      titulo: "Converse com nossa equipe",
      ativo: true,
      atualizadoEmIso: "2026-11-12",
      posicionamentoEquipe: { desktop: "abaixo_hero" },
    };
    simulacao.get.mockImplementation(async (colecao: string) => ({
      docs: (colecao === "profissionais"
        ? [
            ...equipe,
            { ...equipe[0], id: "inativo", ativo: false },
            { ...equipe[0], id: "outro", organizacaoId: "outra" },
            {},
          ]
        : [experiencia, { ...experiencia, id: "inativa", ativo: false }, {}]
      ).map((dados) => ({ data: () => dados })),
    }));
    const resultado = await carregarPreviaVitrineServidor(contexto);
    expect(simulacao.colecao).toHaveBeenCalledExactlyOnceWith("organizacoes");
    expect(simulacao.documento).toHaveBeenCalledExactlyOnceWith("org-equipe");
    expect(simulacao.get.mock.calls.map(([nome]) => nome)).toEqual([
      "profissionais",
      "microfluxos",
    ]);
    expect(resultado.previaEquipe.total).toBe(4);
    expect(resultado.previaEquipe.avatares).toHaveLength(4);
    expect(resultado.microfluxos).toHaveLength(1);
    expect(resultado.microfluxos[0]?.posicionamentoEquipe).toEqual({ desktop: "abaixo_hero" });
  });

  it("trata coleções vazias", async () => {
    simulacao.get.mockResolvedValue({ docs: [] });
    expect(await carregarPreviaVitrineServidor(contexto)).toEqual({
      previaEquipe: { total: 0, avatares: [] },
      microfluxos: [],
    });
  });
});
