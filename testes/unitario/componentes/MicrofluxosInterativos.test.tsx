import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import { criarColecaoMicrofluxosPadraoParaTestes } from "../../fixtures/geradoresMicrofluxoTeste";
import {
  buscarAcervoDemonstracaoPorSlug,
  CATALOGO_DEMONSTRACOES_EDITORIAIS,
} from "../../fixtures/dadosExemploVitrine";
import { VitrinePublicaInterativa } from "@/componentes/editorial/VitrinePublicaInterativa";
import { GerenciadorExperienciasPainel } from "@/componentes/painel/catalogo/GerenciadorExperienciasPainel";

vi.mock("@/ganchos/usarPreferenciaMovimentoReduzido", () => ({
  usePreferenciaMovimentoReduzido: () => false,
}));

describe("Experiências Interativas (Microfluxos) na Vitrine e no Painel", () => {
  it("deve abrir o microfluxo Explorar em Lumina Arquitetura & Luz, selecionar luminária e concluir", async () => {
    const pagina = CATALOGO_DEMONSTRACOES_EDITORIAIS["lumina-arquitetura-luz"]!;
    const acervo = buscarAcervoDemonstracaoPorSlug("lumina-arquitetura-luz");

    const mockServicoSubmissao = {
      enviarSolicitacaoVisitante: vi.fn().mockResolvedValue({
        solicitacaoId: "sol-lumina-mock-123",
        duplicadaIdempotente: false,
      }),
    };

    render(
      <VitrinePublicaInterativa
        pagina={pagina}
        acervo={acervo}
        servicoSubmissao={mockServicoSubmissao}
      />,
    );

    // Aciona #fluxo-catalogo
    fireEvent.click(screen.getByRole("button", { name: /Explorar peças e ambientes/i }));

    expect(screen.getByTestId("executor-microfluxo-visitante")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Escolha o item ou modalidade de seu interesse/i }),
    ).toBeInTheDocument();

    expect(screen.getByRole("dialog")).toHaveAccessibleName(
      "Escolha o item ou modalidade de seu interesse",
    );
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(/^Passo 1:/);
    expect(
      screen
        .getAllByRole("heading")
        .filter((titulo) => screen.getByRole("dialog").contains(titulo)),
    ).toHaveLength(1);

    // Seleciona um item do catálogo (Pendente Linear Slim Latão Escovado 2700K - R$ 4.850,00)
    fireEvent.click(
      screen.getByRole("button", { name: /Pendente Linear Slim Latão Escovado 2700K/i }),
    );

    // Altera a quantidade para 2 unidades e confere atualização determinística (2 x R$ 4.850,00 = R$ 9.700,00)
    fireEvent.change(screen.getByLabelText(/Quantidade desejada/i), {
      target: { value: "2" },
    });
    expect(screen.getByTestId("demonstrativo-comercial-microfluxo")).toHaveTextContent(
      "R$ 9.700,00",
    );

    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));

    expect(screen.getByRole("dialog")).toHaveAccessibleName(
      "Para onde enviamos os detalhes e disponibilidade?",
    );
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(/^Passo 2:/);

    // Passo 2: dados de contato
    fireEvent.change(screen.getByLabelText(/Seu nome/i), {
      target: { value: "Eduardo Vasques" },
    });
    fireEvent.change(screen.getByLabelText(/WhatsApp ou telefone/i), {
      target: { value: "11988887777" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Solicitar informações sobre este item/i }));

    expect(await screen.findByTestId("confirmacao-microfluxo-concluido")).toBeInTheDocument();
    expect(screen.getByTestId("demonstrativo-comercial-congelado")).toHaveTextContent(
      "R$ 9.700,00",
    );
    expect(screen.getByText(/Interesse registrado com sucesso/i)).toBeInTheDocument();
    expect(screen.getByText(/Eduardo Vasques/i)).toBeInTheDocument();
  }, 15000);

  it("deve permitir configurar experiências e ativar instrução de Pix manual no painel do assinante", async () => {
    const salvarRascunhoExperiencias = vi.fn().mockResolvedValue(undefined);
    const servicoDuble: ServicoCatalogoConteudoPorta = {
      salvarServico: vi.fn(),
      salvarProduto: vi.fn(),
      salvarProjetoPortfolio: vi.fn(),
      salvarProfissional: vi.fn(),
      excluirProfissional: vi.fn(),
      salvarMicrofluxo: vi.fn(),
      salvarRascunhoExperiencias,
      enviarMidia: vi.fn(),
      publicarPagina: vi.fn(),
    };

    const microfluxosIniciais = criarColecaoMicrofluxosPadraoParaTestes({
      organizacaoId: "org-1",
      nomeOrganizacao: "Lumina Arquitetura & Luz",
    });

    render(
      <GerenciadorExperienciasPainel
        organizacaoId="org-1"
        identificadorPublico="lumina-arquitetura-luz"
        microfluxosIniciais={microfluxosIniciais}
        versaoPublicadaInicial={2}
        podeEditarConteudo
        podePublicarPagina
        servicoCatalogo={servicoDuble}
      />,
    );

    // Seleciona a aba Explorar
    fireEvent.click(screen.getByRole("tab", { name: /Explorar/i }));

    // Habilita Pix manual
    fireEvent.click(screen.getByLabelText(/Incluir instrução de Pix manual/i));
    fireEvent.change(screen.getByLabelText(/Chave Pix/i), {
      target: { value: "pix@monteclaro.arq.br" },
    });

    // Configura Ponto de Entrada da Vitrine (Botão da Home)
    fireEvent.click(screen.getByRole("button", { name: "Editar título da experiência" }));
    fireEvent.change(screen.getByLabelText(/Texto do botão na vitrine/i), {
      target: { value: "Explorar Coleção de Luminárias" },
    });
    fireEvent.change(screen.getByLabelText(/Subtítulo discreto do botão/i), {
      target: { value: "Peças autorais em latão" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Escolher ícone: Automático" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar ícone" }), {
      target: { value: "carro" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Veículos" }));
    expect(screen.getByRole("button", { name: "Escolher ícone: Veículos" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Salvar rascunho/i }));

    await waitFor(() => {
      expect(salvarRascunhoExperiencias).toHaveBeenCalledTimes(1);
    });

    const argumentoSalvo = salvarRascunhoExperiencias.mock.calls[0]?.[1][0];
    expect(argumentoSalvo.rotuloBotaoHome).toBe("Explorar Coleção de Luminárias");
    expect(argumentoSalvo.subtituloBotaoHome).toBe("Peças autorais em latão");
    expect(argumentoSalvo.iconeBotaoHome).toBe("carro");
    expect(
      argumentoSalvo.etapas.some(
        (e: { tipoEtapa: string }) => e.tipoEtapa === "instrucao_pix_manual",
      ),
    ).toBe(true);
  });
});
