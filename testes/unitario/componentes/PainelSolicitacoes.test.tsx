import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PortaGerenciamentoSolicitacoesPainel } from "@/aplicacao/portas/portasSolicitacoesComerciais";
import type { SolicitacaoComercial } from "@/dominio/entidades/solicitacaoComercial";
import { GerenciadorSolicitacoesPainel } from "@/componentes/painel/solicitacoes/GerenciadorSolicitacoesPainel";

describe("Painel Comercial de Solicitações (/painel/solicitacoes)", () => {
  const solicitacaoDemonstracao: SolicitacaoComercial = {
    id: "sol-org-1-fluxo-financiamento-11999887766",
    organizacaoId: "org-1",
    identificadorPublicoOrganizacao: "estudio-alvorada",
    microfluxoId: "fluxo-financiamento",
    tituloExperiencia: "Planejar meu projeto",
    versaoMicrofluxo: 2,
    nomeVisitante: "Henrique Vasconcelos",
    telefoneOuWhatsapp: "(11) 99988-7766",
    emailVisitante: "henrique@exemplo.com.br",
    mensagemAdicional: "Terreno em declive na Serra da Mantiqueira.",
    respostasRegistradas: [
      {
        etapaId: "etapa-prioridades",
        pergunta: "Quais frentes fazem parte do que você deseja planejar?",
        respostaTexto: "Estudo inicial e concepção · Projeto executivo / detalhamento técnico",
      },
    ],
    demonstrativoComercialCongelado: {
      modalidade: "base_mais_adicionais",
      moeda: "BRL",
      linhas: [
        {
          id: "item-base",
          rotulo: "Diagnóstico e financiamento base",
          quantidade: 1,
          valorUnitarioCentavos: 240000,
          subtotalCentavos: 240000,
        },
        {
          id: "etapa-prioridades:item-concepcao",
          rotulo: "Estudo inicial e concepção",
          quantidade: 1,
          valorUnitarioCentavos: 180000,
          subtotalCentavos: 180000,
        },
        {
          id: "etapa-prioridades:item-detalhamento",
          rotulo: "Projeto executivo / detalhamento técnico",
          quantidade: 1,
          valorUnitarioCentavos: 420000,
          subtotalCentavos: 420000,
        },
      ],
      totalCentavos: 840000,
      resumoFormatado: "R$ 8.400,00",
      versaoMicrofluxo: 2,
      calculadoEmIso: "2026-11-08T14:30:00.000Z",
    },
    situacao: "nova",
    chaveIdempotencia: "sol-org-1-fluxo-financiamento-11999887766",
    criadoEmIso: "2026-11-08T14:30:00.000Z",
    atualizadoEmIso: "2026-11-08T14:30:00.000Z",
  };

  it("deve exibir o demonstrativo comercial histórico congelado, gerar link de WhatsApp e atualizar situação/anotações", async () => {
    const atualizarAndamentoSolicitacao = vi.fn().mockResolvedValue(undefined);
    const servicoDuble: PortaGerenciamentoSolicitacoesPainel = {
      atualizarAndamentoSolicitacao,
    };

    render(
      <GerenciadorSolicitacoesPainel
        organizacaoId="org-1"
        nomeOrganizacao="Estúdio Alvorada"
        solicitacoesIniciais={[solicitacaoDemonstracao]}
        profissionaisAtivos={[]}
        podeGerenciarSolicitacoes
        servicoSolicitacoes={servicoDuble}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Abrir solicitação de Henrique/i }));

    expect(screen.getByTestId("detalhe-solicitacao-painel")).toBeInTheDocument();
    expect(screen.getByTestId("demonstrativo-historico-painel")).toHaveTextContent("R$ 8.400,00");
    expect(screen.getByText(/Terreno em declive na Serra da Mantiqueira/i)).toBeInTheDocument();

    const linkWhatsapp = screen.getByRole("link", { name: /Responder no WhatsApp/i });
    expect(linkWhatsapp).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/5511999887766"),
    );

    fireEvent.change(screen.getByLabelText(/Situação do atendimento/i), {
      target: { value: "proposta_enviada" },
    });
    fireEvent.change(screen.getByLabelText(/Anotações internas da equipe/i), {
      target: { value: "Reunião realizada por vídeo; proposta enviada por e-mail." },
    });

    fireEvent.click(screen.getByRole("button", { name: /Salvar andamento/i }));

    await waitFor(() => {
      expect(atualizarAndamentoSolicitacao).toHaveBeenCalledWith({
        organizacaoId: "org-1",
        solicitacaoId: solicitacaoDemonstracao.id,
        situacao: "proposta_enviada",
        observacoesInternas: "Reunião realizada por vídeo; proposta enviada por e-mail.",
      });
    });

    expect(await screen.findByRole("status")).toHaveTextContent(/Proposta enviada/i);
  });

  function montarQuadro(
    parametros: {
      podeGerenciar?: boolean;
      atualizar?: PortaGerenciamentoSolicitacoesPainel["atualizarAndamentoSolicitacao"];
      solicitacoesAdicionais?: readonly SolicitacaoComercial[];
    } = {},
  ) {
    const atualizar = parametros.atualizar ?? vi.fn().mockResolvedValue(undefined);
    render(
      <GerenciadorSolicitacoesPainel
        organizacaoId="org-1"
        nomeOrganizacao="Garage 88"
        solicitacoesIniciais={[
          solicitacaoDemonstracao,
          {
            ...solicitacaoDemonstracao,
            id: "desqualificada-1",
            nomeVisitante: "Cliente desqualificado",
            situacao: "desqualificada",
          },
          ...(parametros.solicitacoesAdicionais ?? []),
        ]}
        profissionaisAtivos={[]}
        podeGerenciarSolicitacoes={parametros.podeGerenciar ?? true}
        servicoSolicitacoes={{ atualizarAndamentoSolicitacao: atualizar }}
      />,
    );
    return atualizar;
  }

  it("mantém as cinco colunas comerciais incluindo Desqualificadas diretamente no quadro", () => {
    montarQuadro();
    for (const nome of [
      "Novas (1)",
      "Em atendimento (0)",
      "Proposta enviada (0)",
      "Concluídas (0)",
      "Desqualificadas (1)",
    ]) {
      expect(screen.getByRole("region", { name: nome })).toBeInTheDocument();
    }
    expect(screen.getByText("Cliente desqualificado")).toBeInTheDocument();
    expect(screen.getByText("Henrique Vasconcelos")).toBeInTheDocument();
  });

  it("move imediatamente e grava apenas a situação ao usar Mover para", async () => {
    let concluir!: () => void;
    const atualizar = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          concluir = resolve;
        }),
    );
    montarQuadro({ atualizar });
    fireEvent.change(screen.getByRole("combobox", { name: /Mover solicitação de Henrique/ }), {
      target: { value: "em_atendimento" },
    });
    expect(
      within(screen.getByRole("region", { name: "Em atendimento (1)" })).getByText(
        "Henrique Vasconcelos",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Mover solicitação de Henrique/ })).toBeDisabled();
    expect(atualizar).toHaveBeenCalledWith({
      organizacaoId: "org-1",
      solicitacaoId: solicitacaoDemonstracao.id,
      situacao: "em_atendimento",
    });
    concluir();
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: /Mover solicitação de Henrique/ })).toBeEnabled(),
    );
  });

  it("restaura a coluna anterior quando a gravação falha", async () => {
    montarQuadro({ atualizar: vi.fn().mockRejectedValue(new Error("Falha ao salvar")) });
    fireEvent.change(screen.getByRole("combobox", { name: /Mover solicitação de Henrique/ }), {
      target: { value: "concluida" },
    });
    await waitFor(() =>
      expect(
        within(screen.getByRole("region", { name: "Novas (1)" })).getByText("Henrique Vasconcelos"),
      ).toBeInTheDocument(),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao salvar");
  });

  it("move por arrastar e soltar para uma coluna vazia", async () => {
    const atualizar = montarQuadro();
    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn().mockReturnValue(solicitacaoDemonstracao.id),
      effectAllowed: "",
      dropEffect: "",
    };
    fireEvent.dragStart(screen.getByRole("img", { name: /Arrastar solicitação de Henrique/ }), {
      dataTransfer,
    });
    fireEvent.dragOver(screen.getByRole("region", { name: "Proposta enviada (0)" }), {
      dataTransfer,
    });
    fireEvent.drop(screen.getByRole("region", { name: "Proposta enviada (0)" }), { dataTransfer });
    await waitFor(() =>
      expect(atualizar).toHaveBeenCalledWith(
        expect.objectContaining({ situacao: "proposta_enviada" }),
      ),
    );
    expect(
      within(screen.getByRole("region", { name: "Proposta enviada (1)" })).getByText(
        "Henrique Vasconcelos",
      ),
    ).toBeInTheDocument();
  });

  it("permite consultar e impede movimentação sem permissão", () => {
    const atualizar = montarQuadro({ podeGerenciar: false });
    expect(screen.queryByRole("combobox", { name: /Mover solicitação/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /Arrastar solicitação/ })).not.toBeInTheDocument();
    fireEvent.drop(screen.getByRole("region", { name: "Concluídas (0)" }), {
      dataTransfer: { getData: () => solicitacaoDemonstracao.id },
    });
    expect(atualizar).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /Abrir solicitação de Henrique/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar andamento" })).toBeDisabled();
  });

  it("filtra todas as colunas e mantém o quadro vazio visível", () => {
    montarQuadro();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "inexistente" } });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Nenhuma solicitação encontrada para esta busca",
    );
    expect(screen.getByRole("region", { name: "Novas (0)" })).toBeInTheDocument();
    expect(screen.queryByText("Henrique Vasconcelos")).not.toBeInTheDocument();
  });

  it("exibe a barra de saúde comercial e permite disparar o WhatsApp direto do cartão do Kanban", async () => {
    montarQuadro();

    // Barra de saúde
    const barraSaude = screen.getByTestId("barra-saude-comercial-painel");
    expect(barraSaude).toBeInTheDocument();
    expect(within(barraSaude).getByText("Agilidade de Retorno")).toBeInTheDocument();
    expect(within(barraSaude).getByText("Top Conversão da Vitrine")).toBeInTheDocument();
    expect(within(barraSaude).getByTitle("Planejar meu projeto")).toBeInTheDocument();

    // Botões diretos no cartão
    const botaoWhatsapp = screen.getByRole("link", {
      name: "Responder Henrique Vasconcelos no WhatsApp",
    });
    expect(botaoWhatsapp).toBeInTheDocument();
    expect(botaoWhatsapp).toHaveAttribute("href", expect.stringContaining("wa.me/5511999887766"));

    const botaoCopiar = screen.getAllByRole("button", { name: "Copiar resumo completo" })[0];
    expect(botaoCopiar).toBeInTheDocument();
  });

  it("exibe diálogo de pós-venda para avaliação no Google ao concluir solicitação quando há local configurado", async () => {
    const atualizarAndamentoSolicitacao = vi.fn().mockResolvedValue(undefined);
    const servicoDuble: PortaGerenciamentoSolicitacoesPainel = {
      atualizarAndamentoSolicitacao,
    };

    render(
      <GerenciadorSolicitacoesPainel
        organizacaoId="org-1"
        nomeOrganizacao="Estúdio Alvorada"
        solicitacoesIniciais={[solicitacaoDemonstracao]}
        profissionaisAtivos={[]}
        identificadorLocalGoogle="ChIJ123456789"
        podeGerenciarSolicitacoes
        servicoSolicitacoes={servicoDuble}
      />,
    );

    const seletorMover = screen.getByRole("combobox", {
      name: `Mover solicitação de ${solicitacaoDemonstracao.nomeVisitante} para`,
    });
    fireEvent.change(seletorMover, { target: { value: "concluida" } });

    await waitFor(() => {
      expect(screen.getByText("Atendimento Concluído!")).toBeInTheDocument();
    });

    const linkConvite = screen.getByRole("link", { name: "Enviar Convite no WhatsApp" });
    expect(linkConvite).toBeInTheDocument();
    expect(linkConvite).toHaveAttribute(
      "href",
      expect.stringContaining("search.google.com%2Flocal%2Fwritereview%3Fplaceid%3DChIJ123456789"),
    );
  });

  it("aplica o limite de 15 solicitações por coluna e permite expandir via Ver mais / Ver menos", () => {
    // Cria 18 solicitações para a coluna "Novas"
    const solicitacoesExtras: SolicitacaoComercial[] = Array.from({ length: 18 }, (_, i) => ({
      ...solicitacaoDemonstracao,
      id: `sol-extra-${i + 1}`,
      nomeVisitante: `Visitante Extra ${i + 1}`,
      situacao: "nova",
      chaveIdempotencia: `chave-extra-${i + 1}`,
    }));

    montarQuadro({ solicitacoesAdicionais: solicitacoesExtras });

    // A coluna "Novas" tem 19 itens (1 demonstracao + 18 extras)
    const colunaNovas = screen.getByRole("region", { name: "Novas (19)" });
    expect(colunaNovas).toBeInTheDocument();

    // Deve exibir botão "Ver mais (+4)"
    const botaoVerMais = within(colunaNovas).getByRole("button", { name: /Ver mais \(\+4\)/i });
    expect(botaoVerMais).toBeInTheDocument();

    // O 15º item exibido (índice 14 dos extras) deve estar visível
    expect(within(colunaNovas).getByText("Visitante Extra 14")).toBeInTheDocument();
    // O 18º item não deve estar no DOM da lista colapsada
    expect(within(colunaNovas).queryByText("Visitante Extra 18")).not.toBeInTheDocument();

    // Clica para expandir
    fireEvent.click(botaoVerMais);

    // Agora todos os 19 itens estão renderizados e botão virou "Ver menos"
    expect(within(colunaNovas).getByText("Visitante Extra 18")).toBeInTheDocument();
    const botaoVerMenos = within(colunaNovas).getByRole("button", { name: /Ver menos/i });
    expect(botaoVerMenos).toBeInTheDocument();

    // Clica para recolher
    fireEvent.click(botaoVerMenos);
    expect(within(colunaNovas).queryByText("Visitante Extra 18")).not.toBeInTheDocument();
    expect(within(colunaNovas).getByRole("button", { name: /Ver mais \(\+4\)/i })).toBeInTheDocument();
  });
});
