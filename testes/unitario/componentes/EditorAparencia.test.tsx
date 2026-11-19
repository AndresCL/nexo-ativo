import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ServicoEditorAparenciaPorta } from "@/aplicacao/portas/portasEditorAparencia";
import { criarRascunhoConfiguracaoPaginaPadrao } from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { ProvedorEstadoEditorAparencia } from "@/estados/estadoEditorAparencia";
import { EditorGuiadoAparencia } from "@/componentes/painel/editor/EditorGuiadoAparencia";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import type { PreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";

vi.mock("@/infraestrutura/avaliacoes/servicoAvaliacoesGoogleCliente", async () => {
  const { RESUMO_AVALIACOES_GOOGLE_TESTE } =
    await import("../../fixtures/dadosAvaliacoesGoogleTeste");
  return {
    servicoAvaliacoesGoogleCliente: {
      pesquisar: async () => [RESUMO_AVALIACOES_GOOGLE_TESTE],
      consultar: async () => RESUMO_AVALIACOES_GOOGLE_TESTE,
    },
  };
});

vi.mock("@/ganchos/usarPreferenciaMovimentoReduzido", () => ({
  usePreferenciaMovimentoReduzido: () => false,
}));

describe("Componente: EditorGuiadoAparencia", () => {
  function renderizarEditorComDuble(opcoes?: {
    readonly emailVerificado?: boolean;
    readonly microfluxos?: readonly DefinicaoMicrofluxo[];
    readonly previaEquipe?: PreviaEquipeVitrine;
  }) {
    const rascunhoInicial = criarRascunhoConfiguracaoPaginaPadrao({
      organizacaoId: "org-teste-editor",
      nomeOrganizacao: "Clínica Serena",
      agoraIso: "2026-11-08T15:00:00.000Z",
    });

    const salvarRascunho = vi.fn().mockResolvedValue(undefined);
    const enviarMidia = vi.fn().mockResolvedValue({
      urlPublica: "https://storage.googleapis.com/demo-fluxo/nova-foto.webp",
      caminhoArmazenamento: "organizacoes/org-teste-editor/imagens/nova-foto.webp",
    });
    const publicarPagina = vi.fn().mockResolvedValue({
      organizacaoId: "org-teste-editor",
      identificadorPublico: "clinica-serena",
      versaoPublicada: 1,
      publicadoEmIso: "2026-11-08T15:05:00.000Z",
    });

    const servicoDuble: ServicoEditorAparenciaPorta = {
      salvarRascunho,
      enviarMidia,
      publicarPagina,
    };

    const emailVerificado = opcoes?.emailVerificado ?? true;

    render(
      <ProvedorEstadoEditorAparencia
        dadosIniciais={{
          rascunhoInicial,
          versaoPublicadaInicial: null,
          ultimoPublicadoEmIsoInicial: null,
        }}
      >
        <EditorGuiadoAparencia
          microfluxos={opcoes?.microfluxos}
          previaEquipe={opcoes?.previaEquipe}
          identificadorPublico="clinica-serena"
          nomeOrganizacao="Clínica Serena"
          emailVerificado={emailVerificado}
          podeEditarAparencia
          podePublicarPagina={emailVerificado}
          servicoEditor={servicoDuble}
        />
      </ProvedorEstadoEditorAparencia>,
    );

    return { salvarRascunho, enviarMidia, publicarPagina };
  }

  it("mostra o convite de uma experiência de equipe mesmo com as ações do rascunho vazias", () => {
    renderizarEditorComDuble({
      previaEquipe: {
        total: 4,
        avatares: [
          {
            id: "ana",
            nomeCompleto: "Ana Silva",
            pontoFocalFoto: { xPercentual: 50, yPercentual: 50 },
          },
        ],
      },
      microfluxos: [
        {
          id: "equipe",
          organizacaoId: "org-teste-editor",
          tipoAcao: "secao_equipe",
          titulo: "Converse com nossa equipe",
          rotuloBotaoHome: "Equipe disponível",
          descricaoCurta: "",
          textoBotaoConclusao: "",
          mensagemConfirmacaoTitulo: "",
          mensagemConfirmacaoCorpo: "",
          etapaInicialId: "",
          etapas: [],
          ativo: true,
          atualizadoEmIso: "2026-11-12",
        },
      ],
    });
    const convite = screen.getByRole("button", { name: "Equipe disponível" });
    expect(convite).toHaveTextContent("AS");
    expect(convite).toHaveTextContent("+3");
    fireEvent.click(convite);
    expect(screen.getByText(/Prévia da ação "Equipe disponível"/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mobile" }));
    expect(screen.getByRole("button", { name: "Equipe disponível" })).toHaveTextContent("+3");
  });

  it("salva e publica a configuração de avaliações pelo editor existente", async () => {
    const { salvarRascunho, publicarPagina } = renderizarEditorComDuble();
    fireEvent.click(screen.getByRole("tab", { name: /Google e SEO/i }));
    fireEvent.change(screen.getByLabelText("Nome da empresa e cidade"), {
      target: { value: "Clínica Serena, São Paulo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Buscar empresa" }));
    fireEvent.click(await screen.findByRole("button", { name: "Selecionar Clínica Serena" }));
    fireEvent.click(screen.getByLabelText("Exibir avaliações na vitrine"));
    fireEvent.click(screen.getByLabelText("Nota com carrossel de depoimentos"));
    await screen.findByRole("button", { name: /128 avaliações no Google/ });
    fireEvent.click(screen.getByRole("button", { name: /Publicar/i }));
    await waitFor(() => expect(publicarPagina).toHaveBeenCalledWith("org-teste-editor"));
    expect(salvarRascunho.mock.calls[0]?.[0].avaliacoesGoogle).toEqual({
      habilitado: true,
      identificadorLocal: "ChIJ_serena",
      modoExibicao: "carrossel",
    });
    expect(salvarRascunho.mock.calls[0]?.[0].avaliacoesGoogle).not.toHaveProperty("avaliacoes");
  });

  it("deve atualizar composição e título editorial em tempo real na prévia ao vivo", () => {
    renderizarEditorComDuble();

    const quadroPrevia = screen.getByTestId("quadro-previa-dispositivo");
    expect(quadroPrevia.querySelector('[data-composicao="imersivo"]')).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Retrato Editorial/i }));
    expect(quadroPrevia.querySelector('[data-composicao="retrato_editorial"]')).not.toBeNull();
    expect(screen.getByText("Alterações não salvas")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /2\. Identidade e texto/i }));

    const campoTitulo = screen.getByLabelText(/Título editorial principal/i);
    fireEvent.change(campoTitulo, {
      target: { value: "Dermatologia clínica com escuta atenta e precisão diagnóstica." },
    });

    expect(
      screen.getByRole("heading", {
        name: "Dermatologia clínica com escuta atenta e precisão diagnóstica.",
      }),
    ).toBeInTheDocument();
  });

  it("edita e salva até três chamadas, remove uma e preserva as demais", async () => {
    const { salvarRascunho } = renderizarEditorComDuble();
    fireEvent.click(screen.getByRole("tab", { name: /Identidade e texto/i }));
    const adicionar = screen.getByRole("button", { name: "Adicionar chamada" });
    fireEvent.click(adicionar);
    fireEvent.change(
      within(screen.getByRole("group", { name: "Chamada 2" })).getByLabelText(
        /Título editorial principal/,
      ),
      {
        target: { value: "Segunda campanha editorial" },
      },
    );
    fireEvent.click(adicionar);
    fireEvent.change(
      within(screen.getByRole("group", { name: "Chamada 3" })).getByLabelText(
        /Título editorial principal/,
      ),
      {
        target: { value: "Terceira campanha editorial" },
      },
    );
    expect(adicionar).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Exibir chamada 3/ }));
    expect(
      screen.getByRole("heading", { name: "Terceira campanha editorial" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remover chamada 2" }));
    expect(adicionar).toBeEnabled();
    expect(
      within(screen.getByRole("group", { name: "Chamada 2" })).getByLabelText(
        /Título editorial principal/,
      ),
    ).toHaveValue("Terceira campanha editorial");
    fireEvent.click(screen.getByRole("button", { name: /Salvar rascunho/i }));
    await waitFor(() => expect(salvarRascunho).toHaveBeenCalled());
    expect(salvarRascunho.mock.calls[0]?.[0].chamadasEditoriaisAdicionais).toEqual([
      { tituloPrincipal: "Terceira campanha editorial" },
    ]);
  });

  it("promove a próxima chamada quando a primeira é removida e mantém ao menos uma", () => {
    renderizarEditorComDuble();
    fireEvent.click(screen.getByRole("tab", { name: /Identidade e texto/i }));
    fireEvent.click(screen.getByRole("button", { name: "Adicionar chamada" }));
    fireEvent.change(
      within(screen.getByRole("group", { name: "Chamada 2" })).getByLabelText(
        /Título editorial principal/,
      ),
      {
        target: { value: "Nova mensagem principal" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Remover chamada 1" }));
    expect(screen.getByRole("heading", { name: "Nova mensagem principal" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Remover chamada/ })).toBeNull();
    expect(screen.getByLabelText(/Título editorial principal/)).toHaveValue(
      "Nova mensagem principal",
    );
  });

  it("deve permitir ajustar o ponto focal na aba de mídia e publicar nova versão", async () => {
    const { salvarRascunho, publicarPagina } = renderizarEditorComDuble();

    fireEvent.click(screen.getByRole("tab", { name: /3\. Mídia e foco/i }));

    const controleVertical = screen.getByLabelText(/Posição vertical \(Y\)/i);
    fireEvent.change(controleVertical, { target: { value: "26" } });

    fireEvent.click(screen.getByRole("button", { name: /Publicar página/i }));

    await waitFor(() => {
      expect(salvarRascunho).toHaveBeenCalledTimes(1);
      expect(publicarPagina).toHaveBeenCalledWith("org-teste-editor");
    });

    const rascunhoEnviado = salvarRascunho.mock.calls[0]?.[0];
    expect(rascunhoEnviado.midiaFundo.pontoFocalDesktop.yPercentual).toBe(26);

    expect(screen.getByTestId("selo-versao-publicada")).toHaveTextContent("Publicada · v1");
    expect(screen.getByRole("link", { name: /Ver página pública/i })).toHaveAttribute(
      "href",
      "/clinica-serena",
    );
  });

  it("deve exibir aviso e manter botão de publicar desabilitado quando o e-mail não estiver confirmado", () => {
    renderizarEditorComDuble({ emailVerificado: false });

    expect(
      screen.getByText(/Confirme seu endereço de e-mail antes de publicar sua página/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Publicar página/i })).toBeDisabled();
  });

  it("navega pelas seções com o teclado e mantém o foco na aba selecionada", () => {
    renderizarEditorComDuble();
    const estilo = screen.getByRole("tab", { name: /Estilo e cores/ });
    fireEvent.keyDown(estilo, { key: "ArrowRight" });
    const identidade = screen.getByRole("tab", { name: /Identidade e texto/ });
    expect(identidade).toHaveFocus();
    expect(identidade).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", identidade.id);
    fireEvent.keyDown(identidade, { key: "Home" });
    expect(estilo).toHaveFocus();
    expect(estilo).toHaveAttribute("aria-selected", "true");
  });

  it("concentra as cores avançadas em um único controle e preserva os ajustes ao salvar", async () => {
    const { salvarRascunho } = renderizarEditorComDuble();
    expect(screen.getAllByText("Personalizar cores dos elementos")).toHaveLength(1);
    const detalhes = screen.getByText("Personalizar cores dos elementos").closest("details");
    expect(detalhes).not.toHaveAttribute("open");
    fireEvent.click(screen.getByText("Personalizar cores dos elementos"));
    fireEvent.change(screen.getByLabelText("Código da cor: Destaques e etiquetas"), {
      target: { value: "#4f46e5" },
    });
    fireEvent.change(screen.getByLabelText("Código da cor: Título Principal"), {
      target: { value: "#123456" },
    });
    fireEvent.click(screen.getByRole("tab", { name: /Identidade e texto/ }));
    expect(screen.queryByText("Personalizar cores dos elementos")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Salvar rascunho/ }));
    await waitFor(() => expect(salvarRascunho).toHaveBeenCalled());
    expect(salvarRascunho.mock.calls[0]?.[0].customizacaoTokens).toEqual({
      corDestaque: "#4f46e5",
      corTextoPrincipal: "#123456",
    });
  });
  it("salva os campos de todas as abas e publica o mesmo rascunho em uma única ação", async () => {
    const { salvarRascunho, publicarPagina } = renderizarEditorComDuble();
    function alterar(rotulo: RegExp | string, valor: string) {
      fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
    }
    fireEvent.click(screen.getByRole("button", { name: /Retrato Editorial/ }));
    fireEvent.click(screen.getByRole("button", { name: /Safira Corporativo/ }));
    fireEvent.click(screen.getByRole("button", { name: /Impacto Moderno/ }));
    alterar("Código da cor primária da marca", "#123456");
    fireEvent.click(screen.getByText("Personalizar cores dos elementos"));
    const tokens = [
      ["Destaques e etiquetas", "corDestaque"],
      ["Título Principal", "corTextoPrincipal"],
      ["Subtítulo & Apoio", "corTextoSecundario"],
      ["Fundo Geral", "corFundoPrincipal"],
      ["Fundo dos cartões", "corSuperficie"],
      ["Bordas & Linhas", "corBorda"],
      ["Botão principal (Fundo)", "corCtaFundo"],
      ["Botão principal (Texto)", "corCtaTexto"],
      ["Botões Secundários (Fundo)", "corSecundarioFundo"],
      ["Botões Secundários (Texto)", "corSecundarioTexto"],
    ];
    for (const [rotulo] of tokens) alterar(`Código da cor: ${rotulo}`, "#334455");
    fireEvent.click(screen.getByRole("tab", { name: /Identidade e texto/ }));
    for (const [rotulo, valor] of [
      [/Nome de exibição/, "Serena Saúde"],
      [/Especialidade ou subtítulo curto/, "Medicina integrada"],
      [/Cidade e estado ou endereço/, "São Paulo · SP"],
      [/Link do Google Maps/, "https://maps.google.com/serena"],
      [/Telefone principal/, "1133334444"],
      [/Celular \(opcional\)/, "11999998888"],
      [/Horário de funcionamento/, "Seg a sex, 8h às 18h"],
      [/Registro profissional/, "CRM 12345"],
      [/Logotipo opcional/, "https://example.com/logo.webp"],
      [/Sobretítulo discreto/, "Cuidado próximo"],
      [/Título editorial principal/, "Sua saúde em boas mãos"],
      [/Descrição curta de apoio/, "Atendimento com atenção e clareza"],
    ] as const)
      alterar(rotulo, valor);
    fireEvent.click(screen.getByRole("tab", { name: /Mídia e foco/ }));
    alterar(/Fotografia principal de fundo/, "https://example.com/fundo.webp");
    alterar(/Fotografia vertical exclusiva/, "https://example.com/mobile.webp");
    alterar(/Descrição da imagem para acessibilidade/, "Consultório com iluminação natural");
    fireEvent.click(screen.getByRole("button", { name: "Intenso" }));
    fireEvent.click(screen.getByRole("button", { name: "Dots modernos (ativado)" }));
    alterar(/Posição horizontal \(X\)/, "65");
    alterar(/Posição vertical \(Y\)/, "25");
    fireEvent.click(
      within(
        screen.getByRole("group", { name: "Escolher tela para ajuste do ponto focal" }),
      ).getByRole("button", { name: "Celular" }),
    );
    fireEvent.click(
      screen.getByLabelText(
        "Usar ponto focal diferente especificamente em telas verticais de celular",
      ),
    );
    alterar(/Posição horizontal \(X\)/, "40");
    alterar(/Posição vertical \(Y\)/, "20");
    fireEvent.click(screen.getByRole("tab", { name: /Redes sociais/ }));
    fireEvent.click(screen.getByRole("button", { name: "Adicionar rede" }));
    alterar("Rede", "linkedin");
    alterar(/Endereço completo/, "https://linkedin.com/company/serena");
    fireEvent.click(screen.getByRole("tab", { name: /Google e SEO/ }));
    alterar(/Título para buscadores/, "Serena Saúde em São Paulo");
    alterar(/Descrição para compartilhamento/, "Conheça nossa equipe médica");
    alterar(/Imagem específica para compartilhamento/, "https://example.com/compartilhar.webp");
    const indexavel = screen.getByLabelText(
      "Permitir que minha página publicada apareça em buscas no Google",
    ) as HTMLInputElement;
    if (!indexavel.checked) fireEvent.click(indexavel);
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    await waitFor(() => expect(publicarPagina).toHaveBeenCalledWith("org-teste-editor"));
    expect(salvarRascunho).toHaveBeenCalledTimes(1);
    expect(salvarRascunho.mock.invocationCallOrder[0]).toBeLessThan(
      publicarPagina.mock.invocationCallOrder[0]!,
    );
    expect(salvarRascunho.mock.calls[0]?.[0]).toMatchObject({
      composicaoVisual: "retrato_editorial",
      paletaId: "safira_corporativo",
      tipografiaId: "contemporaneo_minimalista",
      corPersonalizadaHex: "#123456",
      customizacaoTokens: Object.fromEntries(tokens.map(([, chave]) => [chave, "#334455"])),
      identidade: {
        nomeExibicao: "Serena Saúde",
        subtituloCurto: "Medicina integrada",
        cidadeEstado: "São Paulo · SP",
        urlMapaEnderecoOpcional: "https://maps.google.com/serena",
        telefonePrincipalOpcional: "1133334444",
        celularOpcional: "11999998888",
        horarioFuncionamentoOpcional: "Seg a sex, 8h às 18h",
        registroProfissionalOpcional: "CRM 12345",
        urlLogotipoOpcional: "https://example.com/logo.webp",
      },
      chamadaEditorial: {
        sobretituloOpcional: "Cuidado próximo",
        tituloPrincipal: "Sua saúde em boas mãos",
        descricaoCurta: "Atendimento com atenção e clareza",
      },
      midiaFundo: {
        tipo: "imagem",
        urlPrincipal: "https://example.com/fundo.webp",
        urlMobileOpcional: "https://example.com/mobile.webp",
        textoAlternativo: "Consultório com iluminação natural",
        intensidadeVeloEscuro: "intenso",
        efeitoCantos: "dots",
        pontoFocalDesktop: { xPercentual: 65, yPercentual: 25 },
        pontoFocalMobile: { xPercentual: 40, yPercentual: 20 },
      },
      redesSociais: [
        expect.objectContaining({ rede: "linkedin", url: "https://linkedin.com/company/serena" }),
      ],
      seo: {
        tituloSeo: "Serena Saúde em São Paulo",
        descricaoSeo: "Conheça nossa equipe médica",
        urlImagemCompartilhamento: "https://example.com/compartilhar.webp",
        indexavel: true,
      },
    });
  });

  it("preserva o rascunho salvo se a publicação falhar e não salva novamente ao tentar publicar", async () => {
    const { salvarRascunho, publicarPagina } = renderizarEditorComDuble();
    publicarPagina.mockRejectedValueOnce(new Error("Falha na publicação"));
    fireEvent.click(screen.getByRole("tab", { name: /Identidade e texto/ }));
    fireEvent.change(screen.getByLabelText(/Nome de exibição/), {
      target: { value: "Clínica renovada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Falha na publicação");
    expect(screen.getByText("Rascunho salvo · publicação pendente")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    await waitFor(() => expect(publicarPagina).toHaveBeenCalledTimes(2));
    expect(salvarRascunho).toHaveBeenCalledTimes(1);
  });

  it("grava o rascunho inicial antes da primeira publicação mesmo sem alterações locais", async () => {
    const { salvarRascunho, publicarPagina } = renderizarEditorComDuble();
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    await waitFor(() => expect(publicarPagina).toHaveBeenCalledTimes(1));
    expect(salvarRascunho).toHaveBeenCalledTimes(1);
    expect(salvarRascunho.mock.invocationCallOrder[0]).toBeLessThan(
      publicarPagina.mock.invocationCallOrder[0]!,
    );
  });

  it("permite reordenar as redes sociais para cima e para baixo no editor", async () => {
    const { salvarRascunho } = renderizarEditorComDuble();
    fireEvent.click(screen.getByRole("tab", { name: /Redes sociais/ }));

    fireEvent.click(screen.getByRole("button", { name: "Adicionar rede" }));
    fireEvent.click(screen.getByRole("button", { name: "Adicionar rede" }));

    const seletoresRede = screen.getAllByLabelText("Rede");
    expect(seletoresRede).toHaveLength(2);

    fireEvent.change(seletoresRede[0]!, { target: { value: "instagram" } });
    fireEvent.change(seletoresRede[1]!, { target: { value: "linkedin" } });

    const enderecos = screen.getAllByLabelText(/Endereço completo/);
    fireEvent.change(enderecos[0]!, { target: { value: "https://instagram.com/clinica" } });
    fireEvent.change(enderecos[1]!, { target: { value: "https://linkedin.com/company/clinica" } });

    // O primeiro item não pode subir e o último não pode descer
    expect(
      screen.getByRole("button", { name: "Mover rede instagram para cima" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Mover rede linkedin para baixo" }),
    ).toBeDisabled();

    // Move o LinkedIn para cima (passa a ser o primeiro)
    fireEvent.click(screen.getByRole("button", { name: "Mover rede linkedin para cima" }));

    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    await waitFor(() => expect(salvarRascunho).toHaveBeenCalledTimes(1));

    expect(salvarRascunho.mock.calls[0]?.[0].redesSociais).toEqual([
      expect.objectContaining({
        rede: "linkedin",
        url: "https://linkedin.com/company/clinica",
      }),
      expect.objectContaining({
        rede: "instagram",
        url: "https://instagram.com/clinica",
      }),
    ]);
  });
});
