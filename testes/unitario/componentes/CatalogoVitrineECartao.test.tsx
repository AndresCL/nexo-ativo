import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import { criarResumoDireitosPlanoInicial } from "@/dominio/entidades/autenticacaoEOrganizacao";
import {
  CATALOGO_ACERVOS_DEMONSTRACAO,
  CATALOGO_DEMONSTRACOES_EDITORIAIS,
} from "../../fixtures/dadosExemploVitrine";
import { CartaoDigitalProfissionalPublico } from "@/componentes/editorial/CartaoDigitalProfissionalPublico";
import { VitrinePublicaInterativa } from "@/componentes/editorial/VitrinePublicaInterativa";
import { GerenciadorEquipePainel } from "@/componentes/painel/catalogo/GerenciadorEquipePainel";

vi.mock("@/ganchos/usarPreferenciaMovimentoReduzido", () => ({
  usePreferenciaMovimentoReduzido: () => false,
}));

describe("Vitrine com Gavetas Editoriais, Cartão Digital Individual e Painel de Equipe", () => {
  it("abre a equipe pelo convite e devolve foco ao acionador ao fechar com Escape", async () => {
    const pagina = {
      ...CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!,
      acoesPrincipais: [
        {
          id: "equipe-foco",
          tipoDestino: "secao_equipe" as const,
          destino: "#equipe",
          rotulo: "Converse com nossa equipe",
        },
      ],
    };
    const acervo = { ...CATALOGO_ACERVOS_DEMONSTRACAO["garage-88"]!, microfluxos: [] };
    render(<VitrinePublicaInterativa pagina={pagina} acervo={acervo} />);
    const convite = screen.getByRole("button", { name: "Converse com nossa equipe" });
    vi.spyOn(convite, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
    fireEvent.click(convite);
    expect(screen.getByRole("heading", { name: "Nossa Equipe" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(convite).toHaveFocus());
  });

  it("deve abrir as gavetas editoriais (#servicos, #portfolio, #equipe) a partir das ações da Home", () => {
    const paginaHelena = CATALOGO_DEMONSTRACOES_EDITORIAIS["vasconcelos-advocacia-empresarial"]!;
    const acervoHelena = CATALOGO_ACERVOS_DEMONSTRACAO["vasconcelos-advocacia-empresarial"]!;

    render(<VitrinePublicaInterativa pagina={paginaHelena} acervo={acervoHelena} />);

    fireEvent.click(screen.getByRole("button", { name: /Áreas de atuação corporativa/i }));

    expect(screen.getByRole("heading", { name: "Serviços" })).toBeInTheDocument();
    expect(
      screen.getByText("Assessoria Jurídica em Fusões & Aquisições (M&A)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Reestruturação Societária & Governança Corporativa"),
    ).toBeInTheDocument();
  });

  it("deve abrir o Cartão Digital in-place a partir da gaveta de equipe e permitir voltar", async () => {
    const paginaGarage = {
      ...CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!,
      acoesPrincipais: [
        {
          id: "acao-equipe-teste",
          rotulo: "Conhecer nossa equipe",
          tipoDestino: "secao_equipe" as const,
          destino: "#equipe",
        },
      ],
    };
    const acervoGarage = {
      ...CATALOGO_ACERVOS_DEMONSTRACAO["garage-88"]!,
      microfluxos: [],
    };

    render(<VitrinePublicaInterativa pagina={paginaGarage} acervo={acervoGarage} />);

    // Abre gaveta de equipe
    fireEvent.click(screen.getAllByRole("button", { name: /Conhecer nossa equipe/i })[0]!);
    expect(screen.getByRole("heading", { name: "Nossa Equipe" })).toBeInTheDocument();

    // Clica no botão Ver perfil
    const botoesCartao = screen.getAllByRole("button", { name: /Ver perfil/i });
    expect(botoesCartao.length).toBeGreaterThan(0);
    fireEvent.click(botoesCartao[0]!);

    // O Cartão Digital abre in-place na tela
    expect(screen.getByTestId("cartao-digital-profissional")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bruno Silva" })).toBeInTheDocument();

    // Clica no botão de voltar para a vitrine
    const botaoVoltar = screen.getByRole("button", { name: "Garage 88" });
    fireEvent.click(botaoVoltar);

    // O Cartão fecha e volta à vitrine
    await waitFor(() => {
      expect(screen.queryByTestId("cartao-digital-profissional")).not.toBeInTheDocument();
    });
  });

  it("deve renderizar o Cartão Digital Individual VIP com foto imersiva, WhatsApp e ações da loja", () => {
    const paginaGarage = CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!;
    const acervoGarage = CATALOGO_ACERVOS_DEMONSTRACAO["garage-88"]!;
    const consultor = acervoGarage.profissionais[0]!;

    render(
      <CartaoDigitalProfissionalPublico
        paginaOrganizacao={paginaGarage}
        profissional={consultor}
        servicosAtivos={acervoGarage.servicos}
        acervo={acervoGarage}
        urlPublicaCartao="https://fluxo.app/garage-88/equipe/bruno-silva"
      />,
    );

    expect(screen.getByRole("heading", { name: "Bruno Silva" })).toBeInTheDocument();
    expect(screen.getByText("Cabo Frio · RJ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Compartilhar este cartão/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Garage 88/i })[0]).toBeInTheDocument();

    // CTA unificado de WhatsApp com o consultor
    const linkWhatsapp = screen.getByRole("link", { name: /Falar comigo no WhatsApp/i });
    expect(linkWhatsapp).toBeInTheDocument();
    expect(linkWhatsapp).toHaveTextContent("Atendimento direto com Bruno Silva");

    // Ações comerciais contextualizadas para o relacionamento com Bruno Silva (sem duplicidade de WhatsApp)
    expect(
      screen.queryByRole("button", { name: /Falar comigo no WhatsApp/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Simular financiamento/i })).toHaveTextContent(
      "Faça uma simulação com meu atendimento",
    );
    expect(screen.getByRole("link", { name: /Ver estoque completo/i })).toHaveTextContent(
      "Confira os veículos da Garage 88",
    );
    expect(
      screen.getByRole("button", { name: /Venda seu carro|Avaliar meu usado/i }),
    ).toHaveTextContent("Envie os dados do seu carro para avaliação");
    expect(screen.getByRole("button", { name: /Cotar seguro/i })).toHaveTextContent(
      "Solicite uma cotação de seguro",
    );

    // Clicar em uma ação de microfluxo deve abrir o assistente interativo sem sair da página
    fireEvent.click(screen.getByRole("button", { name: /Simular financiamento/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("permite recolher o acordeão 'Escolha como prefere continuar' ou ocultá-lo completamente quando exibirAcoesVitrineNoCartao for false", async () => {
    const paginaGarage = CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!;
    const acervoGarage = CATALOGO_ACERVOS_DEMONSTRACAO["garage-88"]!;
    const consultor = acervoGarage.profissionais[0]!;

    const { rerender } = render(
      <CartaoDigitalProfissionalPublico
        paginaOrganizacao={paginaGarage}
        profissional={consultor}
        servicosAtivos={acervoGarage.servicos}
        acervo={acervoGarage}
        urlPublicaCartao="https://fluxo.app/garage-88/equipe/bruno-silva"
      />,
    );

    const botaoAcordeao = screen.getByRole("button", {
      name: /Escolha como prefere continuar/i,
    });
    expect(botaoAcordeao).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /Simular financiamento/i })).toBeInTheDocument();

    // Clica para recolher o acordeão
    fireEvent.click(botaoAcordeao);
    expect(botaoAcordeao).toHaveAttribute("aria-expanded", "false");

    // Quando exibirAcoesVitrineNoCartao === false, não deve mostrar nada da seção
    rerender(
      <CartaoDigitalProfissionalPublico
        paginaOrganizacao={paginaGarage}
        profissional={{ ...consultor, exibirAcoesVitrineNoCartao: false }}
        servicosAtivos={acervoGarage.servicos}
        acervo={acervoGarage}
        urlPublicaCartao="https://fluxo.app/garage-88/equipe/bruno-silva"
      />,
    );

    expect(
      screen.queryByRole("button", { name: /Escolha como prefere continuar/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Simular financiamento/i }),
    ).not.toBeInTheDocument();
  });

  it("deve cadastrar profissional sugerindo slug automático e respeitar limite de equipe do plano", async () => {
    const salvarProfissional = vi.fn().mockResolvedValue(undefined);
    const excluirProfissional = vi.fn().mockResolvedValue(undefined);
    const servicoDuble: ServicoCatalogoConteudoPorta = {
      salvarServico: vi.fn(),
      salvarProduto: vi.fn(),
      salvarProjetoPortfolio: vi.fn(),
      salvarProfissional,
      excluirProfissional,
      salvarMicrofluxo: vi.fn(),
      salvarRascunhoExperiencias: vi.fn(),
      enviarMidia: vi.fn(),
      publicarPagina: vi.fn(),
    };

    render(
      <GerenciadorEquipePainel
        organizacaoId="org-1"
        identificadorPublico="clinica-serena"
        urlBasePublica="https://fluxo.app"
        resumoDireitosPlano={criarResumoDireitosPlanoInicial()}
        profissionaisIniciais={[]}
        versaoPublicadaInicial={1}
        podeEditarConteudo
        podePublicarPagina
        servicoCatalogo={servicoDuble}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Nome completo/i), {
      target: { value: "Dr. Rafael Nogueira" },
    });

    expect(screen.getByLabelText(/Endereço do cartão digital/i)).toHaveValue("dr-rafael-nogueira");

    fireEvent.change(screen.getByLabelText(/Cargo ou especialidade/i), {
      target: { value: "Dermatologista Clínico" },
    });
    fireEvent.change(screen.getByLabelText(/Apresentação editorial/i), {
      target: { value: "Especialista em dermatologia clínica e oncológica." },
    });

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar profissional/i }));

    await waitFor(() => {
      expect(salvarProfissional).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId("indicador-cota-equipe")).toHaveTextContent(
      "Perfis ativos: 1 de 1 incluídos no plano atual",
    );

    // Tentar cadastrar um 2º profissional ativo com limite 1 deve exibir alerta de plano
    fireEvent.change(screen.getByLabelText(/Nome completo/i), {
      target: { value: "Dra. Camila Torres" },
    });
    fireEvent.change(screen.getByLabelText(/Cargo ou especialidade/i), {
      target: { value: "Dermatologista" },
    });
    fireEvent.change(screen.getByLabelText(/Apresentação editorial/i), {
      target: { value: "Atuação em cosmiatria." },
    });

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar profissional/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Plano Equipe/i);
  });

  it("deve resolver ações no Cartão Digital a partir dos microfluxos do acervo mesmo se acoesPrincipais da página vier vazia", () => {
    const paginaGarage = CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!;
    const acervoGarage = CATALOGO_ACERVOS_DEMONSTRACAO["garage-88"]!;
    const consultor = acervoGarage.profissionais[0]!;

    const paginaComAcoesVazias = {
      ...paginaGarage,
      acoesPrincipais: [],
    };

    const acervoComLink = {
      ...acervoGarage,
      microfluxos: [
        ...(acervoGarage.microfluxos ?? []),
        {
          id: "fluxo-estoque-site",
          organizacaoId: "org-garage88",
          tipoAcao: "link_externo" as const,
          urlDestinoOpcional: "https://garage88.com.br",
          titulo: "Ver estoque completo",
          descricaoCurta: "Acesse nosso site",
          textoBotaoConclusao: "Acessar",
          mensagemConfirmacaoTitulo: "Redirecionando",
          mensagemConfirmacaoCorpo: "Acessando site...",
          rotuloBotaoHome: "Ver estoque completo",
          ativo: true,
          atualizadoEmIso: "2026-11-08T12:00:00.000Z",
          etapaInicialId: "etapa-vazia",
          etapas: [],
        },
      ],
    };

    render(
      <CartaoDigitalProfissionalPublico
        paginaOrganizacao={paginaComAcoesVazias}
        profissional={consultor}
        servicosAtivos={acervoGarage.servicos}
        acervo={acervoComLink}
        urlPublicaCartao="https://fluxo.app/garage-88/equipe/bruno-silva"
      />,
    );

    // Deve resolver os microfluxos mesmo com acoesPrincipais vazia
    expect(screen.getByRole("button", { name: /Simular financiamento/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver estoque completo/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Venda seu carro|Avaliar meu usado/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cotar seguro/i })).toBeInTheDocument();
  });

  it("deve permitir excluir integrante da equipe e seu cartão digital após confirmação", async () => {
    const excluirProfissional = vi.fn().mockResolvedValue(undefined);
    const servicoDuble: ServicoCatalogoConteudoPorta = {
      salvarServico: vi.fn(),
      salvarProduto: vi.fn(),
      salvarProjetoPortfolio: vi.fn(),
      salvarProfissional: vi.fn(),
      excluirProfissional,
      salvarMicrofluxo: vi.fn(),
      salvarRascunhoExperiencias: vi.fn(),
      enviarMidia: vi.fn(),
      publicarPagina: vi.fn(),
    };

    const profissionalExemplo = {
      id: "prof-10",
      organizacaoId: "org-1",
      identificadorCartao: "marcos-mendes",
      nomeCompleto: "Marcos Mendes",
      cargoOuEspecialidade: "Consultor Técnico",
      minibiografia: "Especialista técnico em pós-venda.",
      pontoFocalFoto: { xPercentual: 50, yPercentual: 30 },
      aceitaSolicitacoesDiretas: true,
      ordemExibicao: 1,
      ativo: true,
      atualizadoEmIso: "2026-11-08T12:00:00.000Z",
    };

    render(
      <GerenciadorEquipePainel
        organizacaoId="org-1"
        identificadorPublico="clinica-serena"
        urlBasePublica="https://fluxo.app"
        resumoDireitosPlano={criarResumoDireitosPlanoInicial()}
        profissionaisIniciais={[profissionalExemplo]}
        versaoPublicadaInicial={1}
        podeEditarConteudo
        podePublicarPagina
        servicoCatalogo={servicoDuble}
      />,
    );

    expect(screen.getByText("Marcos Mendes")).toBeInTheDocument();

    // Clicar no botão de lixeira abre a confirmação inline
    fireEvent.click(screen.getByRole("button", { name: /Excluir Marcos Mendes/i }));

    expect(screen.getByText(/Deseja realmente excluir/i)).toBeInTheDocument();

    // Clicar em "Sim, excluir" executa a exclusão via serviço
    fireEvent.click(screen.getByRole("button", { name: /Sim, excluir/i }));

    await waitFor(() => {
      expect(excluirProfissional).toHaveBeenCalledWith("org-1", "prof-10");
    });

    // O profissional é removido da lista
    await waitFor(() => {
      expect(screen.queryByText("Marcos Mendes")).not.toBeInTheDocument();
    });

    expect(
      screen.getByText(/foram excluídos\. Clique em 'Publicar página'/i),
    ).toBeInTheDocument();
  });
});
