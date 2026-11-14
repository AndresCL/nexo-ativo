import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";

const simulacoes = vi.hoisted(() => ({
  set: vi.fn(),
  excluir: vi.fn(),
  commit: vi.fn(),
  criarLote: vi.fn(),
}));
vi.mock("firebase/firestore", () => ({
  doc: (_banco: unknown, ...segmentos: string[]) => segmentos.join("/"),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  writeBatch: () => {
    simulacoes.criarLote();
    return { set: simulacoes.set, delete: simulacoes.excluir, commit: simulacoes.commit };
  },
}));
vi.mock("@/infraestrutura/firebase/clienteFirebase", () => ({
  obterServicosClienteFirebase: () => ({ bancoDados: {} }),
}));
vi.mock("@/infraestrutura/painel/servicoEditorAparenciaCliente", () => ({
  servicoEditorAparenciaCliente: {},
}));

import { ServicoCatalogoConteudoFirebaseCliente } from "@/infraestrutura/painel/servicoCatalogoConteudoCliente";

const experiencia: DefinicaoMicrofluxo = {
  id: "acao-teste",
  organizacaoId: "org-teste",
  tipoAcao: "link_externo",
  urlDestinoOpcional: "https://example.com",
  titulo: "Consultar estoque",
  descricaoCurta: "",
  textoBotaoConclusao: "",
  mensagemConfirmacaoTitulo: "",
  mensagemConfirmacaoCorpo: "",
  etapaInicialId: "",
  etapas: [],
  ativo: true,
  versaoPublicada: 3,
  atualizadoEmIso: "2026-11-12T10:00:00.000Z",
};

describe("Persistência do rascunho de experiências", () => {
  it.each([3, null])(
    "persiste o limite %s inclusive ao remover um limite já salvo",
    async (limiteAvataresEquipe) => {
      await new ServicoCatalogoConteudoFirebaseCliente().salvarRascunhoExperiencias(
        "org-teste",
        [
          {
            ...experiencia,
            tipoAcao: "secao_equipe",
            limiteAvataresEquipe,
          },
        ],
        [],
      );
      expect(simulacoes.set).toHaveBeenCalledWith(
        "organizacoes/org-teste/microfluxos/acao-teste",
        expect.objectContaining({ limiteAvataresEquipe }),
        { merge: true },
      );
    },
  );

  it("preserva título livre e posição da equipe no lote de rascunho", async () => {
    const posicionamentoEquipe = { desktop: "abaixo_hero", mobile: "antes_acoes" } as const;
    await new ServicoCatalogoConteudoFirebaseCliente().salvarRascunhoExperiencias(
      "org-teste",
      [
        {
          ...experiencia,
          tipoAcao: "secao_equipe",
          rotuloBotaoHome: "Equipe disponível",
          posicionamentoEquipe,
        },
      ],
      [],
    );
    expect(simulacoes.set).toHaveBeenCalledWith(
      "organizacoes/org-teste/microfluxos/acao-teste",
      expect.objectContaining({ rotuloBotaoHome: "Equipe disponível", posicionamentoEquipe }),
      { merge: true },
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
    simulacoes.commit.mockResolvedValue(undefined);
  });

  it("salva uma experiência vazia e passos soltos como rascunho", async () => {
    await new ServicoCatalogoConteudoFirebaseCliente().salvarRascunhoExperiencias(
      "org-teste",
      [
        { ...experiencia, tipoAcao: "microfluxo", ativo: false, etapaInicialId: "", etapas: [] },
        {
          ...experiencia,
          id: "rascunho-solto",
          tipoAcao: "microfluxo",
          etapaInicialId: "",
          etapas: [
            {
              id: "solta",
              tipoEtapa: "etapa_livre",
              titulo: "Etapa solta",
              obrigatoria: false,
              blocos: [],
            },
          ],
        },
      ],
      [],
    );
    expect(simulacoes.set).toHaveBeenCalledTimes(2);
    expect(simulacoes.commit).toHaveBeenCalledOnce();
  });
  it("grava edições e exclusões em um único lote e preserva a versão gerenciada pelo servidor", async () => {
    await new ServicoCatalogoConteudoFirebaseCliente().salvarRascunhoExperiencias(
      "org-teste",
      [{ ...experiencia, iconeBotaoHome: "carro" }],
      ["acao-antiga"],
    );
    expect(simulacoes.set).toHaveBeenCalledWith(
      "organizacoes/org-teste/microfluxos/acao-teste",
      expect.objectContaining({ iconeBotaoHome: "carro" }),
      { merge: true },
    );
    expect(simulacoes.set.mock.calls[0]![1]).not.toHaveProperty("versaoPublicada");
    expect(simulacoes.excluir).toHaveBeenCalledWith(
      "organizacoes/org-teste/microfluxos/acao-antiga",
    );
    expect(simulacoes.commit).toHaveBeenCalledOnce();
  });

  it("valida todo o lote antes de iniciar qualquer gravação", async () => {
    await expect(
      new ServicoCatalogoConteudoFirebaseCliente().salvarRascunhoExperiencias(
        "org-teste",
        [experiencia, { ...experiencia, id: "acao-invalida", titulo: "" }],
        ["acao-antiga"],
      ),
    ).rejects.toThrow();
    expect(simulacoes.criarLote).not.toHaveBeenCalled();
    expect(simulacoes.commit).not.toHaveBeenCalled();
  });

  it("rejeita edições de outra organização e itens marcados simultaneamente para edição e exclusão", async () => {
    const servico = new ServicoCatalogoConteudoFirebaseCliente();
    await expect(
      servico.salvarRascunhoExperiencias("outra-org", [experiencia], []),
    ).rejects.toThrow(/mesmo rascunho/);
    await expect(
      servico.salvarRascunhoExperiencias("org-teste", [experiencia], [experiencia.id]),
    ).rejects.toThrow(/mesmo rascunho/);
    expect(simulacoes.criarLote).not.toHaveBeenCalled();
  });
});
