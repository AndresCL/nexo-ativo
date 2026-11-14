import { describe, expect, it, vi } from "vitest";
import { executarConsultaAvaliacoesGoogleVitrine } from "../../../funcoes/src/avaliacoes/consultarAvaliacoesGoogleVitrine";
import {
  executarConsultaAvaliacoesGooglePrevia,
  executarPesquisaEstabelecimentosGoogle,
} from "../../../funcoes/src/avaliacoes/consultarAvaliacoesGooglePainel";
import {
  criarBancoAvaliacoesGoogleTeste,
  USUARIO_AVALIACOES_TESTE,
} from "../../fixtures/bancoAvaliacoesGoogleTeste";
import { RESUMO_AVALIACOES_GOOGLE_TESTE } from "../../fixtures/dadosAvaliacoesGoogleTeste";

function prepararConsulta() {
  return {
    ...criarBancoAvaliacoesGoogleTeste(),
    provedor: {
      consultarAvaliacoes: vi.fn().mockResolvedValue(RESUMO_AVALIACOES_GOOGLE_TESTE),
      pesquisarEstabelecimentos: vi.fn().mockResolvedValue([]),
    },
    reservar: vi.fn().mockResolvedValue(undefined),
  };
}

describe("Consultas de avaliações com isolamento de organização", () => {
  it("usa exclusivamente o estabelecimento publicado e não consulta o rascunho", async () => {
    const { bancoDados, documentos, provedor, reservar } = prepararConsulta();
    documentos.set("organizacoes/org-serena/configuracaoPagina/rascunho", {
      avaliacoesGoogle: { identificadorLocal: "ChIJ_rascunho" },
    });
    await executarConsultaAvaliacoesGoogleVitrine(
      bancoDados,
      { identificadorPublico: "clinica-serena" },
      provedor,
      reservar,
    );
    expect(provedor.consultarAvaliacoes).toHaveBeenCalledExactlyOnceWith("ChIJ_serena");
    expect(reservar).toHaveBeenCalledWith(bancoDados, "org-serena");
  });

  it.each([
    ["organizacoes/org-serena", { situacao: "suspensa" }],
    [
      "identificadoresPublicos/clinica-serena",
      { organizacaoId: "org-serena", situacao: "inativo" },
    ],
    ["paginasPublicadas/org-serena", { publicado: true, paginaAtiva: false }],
    [
      "paginasPublicadas/org-serena",
      {
        publicado: true,
        paginaAtiva: true,
        identificadorPublico: "clinica-serena",
        avaliacoesGoogle: { habilitado: false, modoExibicao: "resumo" },
      },
    ],
  ])("bloqueia páginas indisponíveis antes de consumir a API (%s)", async (caminho, dados) => {
    const { bancoDados, documentos, provedor, reservar } = prepararConsulta();
    documentos.set(caminho, dados);
    await expect(
      executarConsultaAvaliacoesGoogleVitrine(
        bancoDados,
        { identificadorPublico: "clinica-serena" },
        provedor,
        reservar,
      ),
    ).rejects.toMatchObject({ code: "not-found" });
    expect(reservar).not.toHaveBeenCalled();
    expect(provedor.consultarAvaliacoes).not.toHaveBeenCalled();
  });

  it("permite prévia de uma seleção não publicada sem gravar conteúdo externo", async () => {
    const { bancoDados, documentos, provedor, reservar } = prepararConsulta();
    const quantidadeAnterior = documentos.size;
    await executarConsultaAvaliacoesGooglePrevia(
      bancoDados,
      USUARIO_AVALIACOES_TESTE,
      { organizacaoId: "org-serena", identificadorLocal: "ChIJ_novo" },
      provedor,
      reservar,
    );
    expect(provedor.consultarAvaliacoes).toHaveBeenCalledWith("ChIJ_novo");
    expect(documentos.size).toBe(quantidadeAnterior);
  });

  it("nega pesquisa anônima e prévia sem vínculo com a organização", async () => {
    const { bancoDados, provedor, reservar } = prepararConsulta();
    await expect(
      executarPesquisaEstabelecimentosGoogle(
        bancoDados,
        null,
        { organizacaoId: "org-serena", consulta: "Clínica São Paulo" },
        provedor,
        reservar,
      ),
    ).rejects.toMatchObject({ codigo: "USUARIO_NAO_AUTENTICADO" });
    await expect(
      executarConsultaAvaliacoesGooglePrevia(
        bancoDados,
        { ...USUARIO_AVALIACOES_TESTE, uid: "outra-pessoa" },
        { organizacaoId: "org-serena", identificadorLocal: "ChIJ_serena" },
        provedor,
        reservar,
      ),
    ).rejects.toMatchObject({ codigo: "VINCULO_ORGANIZACAO_INEXISTENTE" });
    expect(reservar).not.toHaveBeenCalled();
    expect(provedor.consultarAvaliacoes).not.toHaveBeenCalled();
    expect(provedor.pesquisarEstabelecimentos).not.toHaveBeenCalled();
  });

  it("nega edição a membros sem papel administrativo e respeita o limite antes da consulta", async () => {
    const { bancoDados, documentos, provedor, reservar } = prepararConsulta();
    documentos.set("organizacoes/org-serena/membros/usuario-serena", {
      usuarioId: "usuario-serena",
      organizacaoId: "org-serena",
      situacao: "ativo",
      papel: "membro",
    });
    await expect(
      executarPesquisaEstabelecimentosGoogle(
        bancoDados,
        USUARIO_AVALIACOES_TESTE,
        { organizacaoId: "org-serena", consulta: "Clínica São Paulo" },
        provedor,
        reservar,
      ),
    ).rejects.toMatchObject({ codigo: "PAPEL_INSUFICIENTE" });
    reservar.mockRejectedValueOnce(new Error("Limite atingido"));
    await expect(
      executarConsultaAvaliacoesGoogleVitrine(
        bancoDados,
        { identificadorPublico: "clinica-serena" },
        provedor,
        reservar,
      ),
    ).rejects.toThrow("Limite atingido");
    expect(provedor.consultarAvaliacoes).not.toHaveBeenCalled();
  });
});
