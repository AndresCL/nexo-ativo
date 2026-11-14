import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as Firestore from "firebase/firestore";
import { ServicoCatalogoConteudoFirebaseCliente } from "@/infraestrutura/painel/servicoCatalogoConteudoCliente";
import { ServicoEditorAparenciaFirebaseCliente } from "@/infraestrutura/painel/servicoEditorAparenciaCliente";
import { criarRascunhoConfiguracaoPaginaPadrao } from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { CATALOGO_ACERVOS_DEMONSTRACAO } from "../../fixtures/dadosExemploVitrine";
import { criarMicrofluxoPadraoParaTestes } from "../../fixtures/geradoresMicrofluxoTeste";

const { documentos, gravar, concluirLote } = vi.hoisted(() => ({
  documentos: new Map<string, unknown>(),
  gravar: vi.fn(),
  concluirLote: vi.fn(),
}));
vi.mock("@/infraestrutura/firebase/clienteFirebase", () => ({
  obterServicosClienteFirebase: () => ({ bancoDados: {} }),
}));
vi.mock("firebase/firestore", async (importOriginal) => {
  const original = await importOriginal<typeof Firestore>();
  return {
    ...original,
    doc: (_banco: unknown, ...caminho: string[]) => caminho.join("/"),
    setDoc: async (caminho: string, dados: unknown) => {
      gravar(caminho, dados);
      documentos.set(caminho, dados);
    },
    writeBatch: () => {
      const operacoes: Array<() => void> = [];
      return {
        set: (caminho: string, dados: object) =>
          operacoes.push(() =>
            documentos.set(caminho, { ...((documentos.get(caminho) as object) ?? {}), ...dados }),
          ),
        delete: (caminho: string) =>
          operacoes.push(() => {
            documentos.delete(caminho);
          }),
        commit: async () => {
          await concluirLote();
          operacoes.forEach((operacao) => operacao());
        },
      };
    },
  };
});

const acervo = CATALOGO_ACERVOS_DEMONSTRACAO["garage-88"]!;
const cliente = new ServicoCatalogoConteudoFirebaseCliente();
beforeEach(() => {
  documentos.clear();
  concluirLote.mockResolvedValue(undefined);
});

describe("Persistência dos formulários do painel", () => {
  const servico = {
    ...acervo.servicos[0]!,
    rotuloPrecoOpcional: "A partir de",
    prazoOuDuracao: "2 dias",
    urlImagemOpcional: "https://example.com/servico.webp",
    pontoFocalImagem: { xPercentual: 30, yPercentual: 25 },
  };
  const produto = {
    ...acervo.produtos[0]!,
    especificacoesCurtas: ["Ano: 2025", "Cor: azul"],
    pontoFocalImagem: { xPercentual: 40, yPercentual: 20 },
  };
  const projeto = {
    ...acervo.projetosPortfolio[0]!,
    textoAlternativoCapa: "Projeto completo",
    pontoFocalCapa: { xPercentual: 60, yPercentual: 30 },
  };
  const profissional = {
    ...acervo.profissionais[0]!,
    emailContatoOpcional: "contato@exemplo.com.br",
    linkedinOpcional: "https://linkedin.com/in/consultor",
    instagramOpcional: "https://instagram.com/consultor",
    registroProfissionalOpcional: "REG 123",
  };

  it.each([
    { colecao: "servicos", entidade: servico, salvar: () => cliente.salvarServico(servico) },
    { colecao: "produtos", entidade: produto, salvar: () => cliente.salvarProduto(produto) },
    {
      colecao: "projetosPortfolio",
      entidade: projeto,
      salvar: () => cliente.salvarProjetoPortfolio(projeto),
    },
    {
      colecao: "profissionais",
      entidade: profissional,
      salvar: () => cliente.salvarProfissional(profissional),
    },
  ])(
    "grava todos os campos de $colecao no documento correto",
    async ({ colecao, entidade, salvar }) => {
      await salvar();
      expect(
        documentos.get(`organizacoes/${entidade.organizacaoId}/${colecao}/${entidade.id}`),
      ).toEqual({ ...entidade, atualizadoEmIso: expect.any(String) });
      expect([...documentos.keys()].every((chave) => !chave.startsWith("paginasPublicadas/"))).toBe(
        true,
      );
    },
  );

  it("remove opcionais antigos ao salvar o item novamente", async () => {
    await cliente.salvarServico(servico);
    const {
      rotuloPrecoOpcional: _rotulo,
      precoBaseCentavos: _preco,
      prazoOuDuracao: _prazo,
      ...limpo
    } = servico;
    await cliente.salvarServico(limpo);
    const registro = documentos.get(`organizacoes/${servico.organizacaoId}/servicos/${servico.id}`);
    expect(registro).not.toHaveProperty("rotuloPrecoOpcional");
    expect(registro).not.toHaveProperty("precoBaseCentavos");
    expect(registro).not.toHaveProperty("prazoOuDuracao");
  });

  it("grava a aparência completa no rascunho sem modificar a página pública", async () => {
    const rascunho = criarRascunhoConfiguracaoPaginaPadrao({
      organizacaoId: "org-teste",
      nomeOrganizacao: "Organização de teste",
    });
    await new ServicoEditorAparenciaFirebaseCliente().salvarRascunho(rascunho);
    expect(documentos.get("organizacoes/org-teste/configuracaoPagina/rascunho")).toEqual({
      ...rascunho,
      atualizadoEmIso: expect.any(String),
    });
    expect(documentos.size).toBe(1);
  });

  it("salva alterações e exclusões das experiências em um lote, preservando a versão publicada", async () => {
    const fluxo = criarMicrofluxoPadraoParaTestes({
      organizacaoId: "org-teste",
      nomeOrganizacao: "Organização de teste",
      modelo: "catalogo",
    });
    const caminho = `organizacoes/org-teste/microfluxos/${fluxo.id}`;
    documentos.set(caminho, { ...fluxo, versaoPublicada: 7 });
    documentos.set("organizacoes/org-teste/microfluxos/excluida", { id: "excluida" });
    await cliente.salvarRascunhoExperiencias(
      "org-teste",
      [{ ...fluxo, titulo: "Catálogo atualizado", versaoPublicada: 1 }],
      ["excluida"],
    );
    expect(documentos.get(caminho)).toMatchObject({
      titulo: "Catálogo atualizado",
      versaoPublicada: 7,
    });
    expect(documentos.has("organizacoes/org-teste/microfluxos/excluida")).toBe(false);
    expect(concluirLote).toHaveBeenCalledTimes(1);
  });
});
