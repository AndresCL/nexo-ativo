import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import { criarRascunhoConfiguracaoPaginaPadrao } from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { GerenciadorExperienciasPainel } from "@/componentes/painel/catalogo/GerenciadorExperienciasPainel";

function criarExperiencia(id: string, ordemHome: number): DefinicaoMicrofluxo {
  return {
    id,
    ordemHome,
    organizacaoId: "org-teste",
    tipoAcao: "link_externo",
    urlDestinoOpcional: "https://example.com",
    titulo: `Experiência ${id}`,
    rotuloBotaoHome: `Experiência ${id}`,
    descricaoCurta: "",
    textoBotaoConclusao: "",
    mensagemConfirmacaoTitulo: "",
    mensagemConfirmacaoCorpo: "",
    etapaInicialId: "",
    etapas: [],
    ativo: true,
    atualizadoEmIso: "2026-11-12T10:00:00.000Z",
  };
}

describe("Painel de Experiências em 2 passos com blocos unificados", () => {
  it("exibe blocos do sistema e experiências na lista vertical, permite reordenar, ocultar e abrir o editor no Passo 2", async () => {
    const salvarRascunhoExperiencias = vi.fn().mockResolvedValue(undefined);
    const salvarOrdemEBlocosSistemaVitrine = vi.fn().mockResolvedValue(undefined);
    const publicarPagina = vi.fn().mockResolvedValue({ versaoPublicada: 2 });

    const servico: ServicoCatalogoConteudoPorta = {
      salvarServico: vi.fn(),
      salvarProduto: vi.fn(),
      salvarProjetoPortfolio: vi.fn(),
      salvarProfissional: vi.fn(),
      excluirProfissional: vi.fn(),
      salvarMicrofluxo: vi.fn(),
      salvarRascunhoExperiencias,
      salvarOrdemEBlocosSistemaVitrine,
      publicarPagina,
      enviarMidia: vi.fn(),
    };

    const rascunhoBase = criarRascunhoConfiguracaoPaginaPadrao({
      organizacaoId: "org-teste",
      nomeOrganizacao: "Clínica Serena",
    });

    const rascunhoComBlocos = {
      ...rascunhoBase,
      identidade: {
        ...rascunhoBase.identidade,
        posicaoCabecalho: "topo" as const,
      },
      avaliacoesGoogle: {
        habilitado: true,
        identificadorLocal: "ChIJ_serena",
        modoExibicao: "resumo" as const,
      },
      redesSociais: [
        { id: "r1", rede: "instagram" as const, url: "https://instagram.com/serena" },
      ],
    };

    render(
      <GerenciadorExperienciasPainel
        organizacaoId="org-teste"
        identificadorPublico="clinica-serena"
        microfluxosIniciais={[criarExperiencia("alfa", 0), criarExperiencia("beta", 1)]}
        rascunhoPaginaInicial={rascunhoComBlocos}
        versaoPublicadaInicial={1}
        podeEditarConteudo
        podePublicarPagina
        servicoCatalogo={servico}
      />,
    );

    // Passo 1: lista visível, editor ainda não aberto
    expect(screen.getByTestId("item-bloco-bloco:marca")).toBeInTheDocument();
    expect(screen.getByTestId("item-bloco-bloco:avaliacoes_google")).toBeInTheDocument();
    expect(screen.getByTestId("item-bloco-bloco:redes_sociais")).toBeInTheDocument();
    expect(screen.getByTestId("item-bloco-exp:alfa")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Voltar para a lista/i })).not.toBeInTheDocument();

    // Solta a marca do topo para a lista ordenável
    fireEvent.click(screen.getByRole("button", { name: /Mover para lista/i }));

    // Oculta ícones de redes sociais diretamente na lista
    fireEvent.click(screen.getByRole("button", { name: "Ocultar Ícones de redes sociais" }));

    // Move "Avaliações do Google" para cima
    fireEvent.click(screen.getByRole("button", { name: "Mover Avaliações do Google para cima" }));

    // Salva rascunho e verifica persistência parcial da ordem e visibilidade
    fireEvent.click(screen.getByRole("button", { name: /Salvar rascunho/i }));
    await waitFor(() => expect(salvarOrdemEBlocosSistemaVitrine).toHaveBeenCalledTimes(1));

    expect(salvarOrdemEBlocosSistemaVitrine).toHaveBeenCalledWith(
      "org-teste",
      expect.objectContaining({
        posicaoCabecalhoMarca: "acima_experiencias",
        blocosSistemaOcultos: ["bloco:redes_sociais"],
        avaliacoesGoogleHabilitado: true,
        ordemBlocosVitrine: [
          "bloco:marca",
          "exp:alfa",
          "bloco:avaliacoes_google",
          "exp:beta",
          "bloco:redes_sociais",
        ],
      }),
    );

    // Passo 2: clica em Editar na Experiência alfa e volta para a lista
    fireEvent.click(screen.getByRole("button", { name: "Editar Experiência alfa" }));
    expect(screen.getByRole("button", { name: /Voltar para a lista/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Tipo de Ação na Vitrine")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Voltar para a lista/i }));
    expect(screen.getByTestId("item-bloco-exp:alfa")).toBeInTheDocument();
  });
});

