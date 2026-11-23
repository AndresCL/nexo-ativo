import * as copiaTexto from "@/componentes/interface/notificacoes/copiarTextoComAviso";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
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

function preparar(iniciais = [criarExperiencia("alfa", 0), criarExperiencia("beta", 1)]) {
  const salvarRascunhoExperiencias = vi.fn().mockResolvedValue(undefined);
  const publicarPagina = vi.fn().mockResolvedValue({ versaoPublicada: 2 });
  const servico: ServicoCatalogoConteudoPorta = {
    salvarServico: vi.fn(),
    salvarProduto: vi.fn(),
    salvarProjetoPortfolio: vi.fn(),
    salvarProfissional: vi.fn(),
    excluirProfissional: vi.fn(),
    salvarMicrofluxo: vi.fn(),
    salvarRascunhoExperiencias,
    publicarPagina,
    enviarMidia: vi.fn(),
  };
  render(
    <GerenciadorExperienciasPainel
      organizacaoId="org-teste"
      identificadorPublico="cliente-teste"
      microfluxosIniciais={iniciais}
      versaoPublicadaInicial={1}
      podeEditarConteudo
      podePublicarPagina
      servicoCatalogo={servico}
    />,
  );
  return { salvarRascunhoExperiencias, publicarPagina };
}

function excluirSelecionada(confirmar = true) {
  fireEvent.click(screen.getByLabelText("Mais opções da experiência"));
  fireEvent.click(screen.getByRole("button", { name: "Excluir experiência" }));
  if (confirmar)
    fireEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "Excluir experiência" }),
    );
}

describe("Rascunho global das experiências", () => {
  it("copia o permalink de cada card sem trocar a seleção nem abrir a finalização", () => {
    const copiar = vi.spyOn(copiaTexto, "copiarTextoComAviso").mockResolvedValue(true);
    preparar([
      { ...criarExperiencia("alfa", 0), tipoAcao: "microfluxo", ativo: false },
      { ...criarExperiencia("beta", 1), tipoAcao: "microfluxo", ativo: false },
    ]);
    expect(
      screen.queryByRole("heading", { name: "Conclusão da experiência" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Copiar permalink de Experiência alfa" }));
    expect(copiar).toHaveBeenLastCalledWith(
      `${window.location.origin}/cliente-teste#experiencia=e-YWxmYQ`,
      "Permalink da experiência copiado.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Copiar permalink de Experiência beta" }));
    expect(screen.getByRole("tab", { name: /Experiência alfa/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(copiar).toHaveBeenLastCalledWith(
      `${window.location.origin}/cliente-teste#experiencia=e-YmV0YQ`,
      "Permalink da experiência copiado.",
    );
  });
  it("edita o título livre da equipe e salva as posições independentes antes de publicar", async () => {
    const { salvarRascunhoExperiencias, publicarPagina } = preparar([
      {
        ...criarExperiencia("equipe", 0),
        tipoAcao: "secao_equipe",
        titulo: "Nome antigo",
        rotuloBotaoHome: "Converse com nossa equipe",
      },
    ]);
    expect(screen.getByRole("heading", { name: "Converse com nossa equipe" })).toBeInTheDocument();
    expect(screen.getByLabelText("Posição no desktop")).toHaveValue("lista_acoes");
    expect(screen.getByLabelText("Posição no celular")).toHaveValue("lista_acoes");
    expect(screen.getByRole("spinbutton", { name: "Limite de avatares (opcional)" })).toHaveValue(
      null,
    );
    fireEvent.change(screen.getByRole("spinbutton", { name: "Limite de avatares (opcional)" }), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Editar título da experiência" }));
    const campo = screen.getByLabelText("Título na vitrine");
    expect(campo).toHaveAttribute("maxlength", "80");
    fireEvent.change(campo, { target: { value: "Entre em contato " } });
    expect(campo).toHaveValue("Entre em contato ");
    fireEvent.change(campo, { target: { value: "Entre em contato conosco" } });
    fireEvent.keyDown(campo, { key: "Enter" });
    fireEvent.change(screen.getByLabelText("Posição no desktop"), {
      target: { value: "abaixo_hero" },
    });
    fireEvent.change(screen.getByLabelText("Posição no celular"), {
      target: { value: "antes_acoes" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    await waitFor(() => expect(publicarPagina).toHaveBeenCalledWith("org-teste"));
    expect(salvarRascunhoExperiencias).toHaveBeenCalledWith(
      "org-teste",
      [
        expect.objectContaining({
          titulo: "Entre em contato conosco",
          rotuloBotaoHome: "Entre em contato conosco",
          ordemHome: 0,
          posicionamentoEquipe: { desktop: "abaixo_hero", mobile: "antes_acoes" },
          limiteAvataresEquipe: 3,
        }),
      ],
      [],
    );
  });

  it("permite limpar um limite salvo para voltar a mostrar todos os avatares", async () => {
    const { salvarRascunhoExperiencias } = preparar([
      {
        ...criarExperiencia("equipe", 0),
        tipoAcao: "secao_equipe",
        limiteAvataresEquipe: 3,
      },
    ]);
    const campo = screen.getByRole("spinbutton", { name: "Limite de avatares (opcional)" });
    expect(campo).toHaveValue(3);
    fireEvent.change(campo, { target: { value: "" } });
    expect(campo).toHaveValue(null);
    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    await waitFor(() =>
      expect(salvarRascunhoExperiencias).toHaveBeenCalledWith(
        "org-teste",
        [expect.objectContaining({ id: "equipe", limiteAvataresEquipe: null })],
        [],
      ),
    );
  });

  it("move uma experiência não selecionada e salva a ordem sem trocar a seleção", async () => {
    const { salvarRascunhoExperiencias } = preparar();
    const beta = screen.getByRole("tab", { name: /Experiência beta/ });
    expect(beta).toHaveAttribute("aria-selected", "false");
    fireEvent.click(
      within(beta).getByRole("button", { name: "Mover Experiência beta para a esquerda" }),
    );
    expect(screen.getAllByRole("tab")[0]).toHaveTextContent("Experiência beta");
    expect(screen.getByRole("tab", { name: /Experiência alfa/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("heading", { name: "Experiência alfa" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    await waitFor(() =>
      expect(salvarRascunhoExperiencias).toHaveBeenCalledWith(
        "org-teste",
        [
          expect.objectContaining({ id: "beta", ordemHome: 0 }),
          expect.objectContaining({ id: "alfa", ordemHome: 1 }),
        ],
        [],
      ),
    );
  });

  it("abre a edição pelo lápis, cancela com Escape e salva o título no rascunho", async () => {
    const { salvarRascunhoExperiencias } = preparar();
    expect(screen.queryByLabelText("Texto do botão na vitrine")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Editar título da experiência" }));
    const campo = screen.getByLabelText("Texto do botão na vitrine");
    expect(campo).toHaveFocus();
    fireEvent.change(campo, { target: { value: "Título temporário" } });
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeEnabled();
    fireEvent.keyDown(campo, { key: "Escape" });
    expect(screen.queryByLabelText("Texto do botão na vitrine")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Experiência alfa" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Editar título da experiência" }));
    fireEvent.change(screen.getByLabelText("Texto do botão na vitrine"), {
      target: { value: "Novo título" },
    });
    fireEvent.keyDown(screen.getByLabelText("Texto do botão na vitrine"), { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    await waitFor(() =>
      expect(salvarRascunhoExperiencias).toHaveBeenCalledWith(
        "org-teste",
        [
          expect.objectContaining({
            id: "alfa",
            titulo: "Novo título",
            rotuloBotaoHome: "Novo título",
          }),
        ],
        [],
      ),
    );
  });

  it("salva todas as experiências editadas antes de publicar", async () => {
    const { salvarRascunhoExperiencias, publicarPagina } = preparar();
    fireEvent.click(screen.getByRole("button", { name: "Editar título da experiência" }));
    fireEvent.change(screen.getByLabelText("Texto do botão na vitrine"), {
      target: { value: "Alfa alterada" },
    });
    fireEvent.click(screen.getByRole("tab", { name: /Experiência beta/ }));
    fireEvent.click(screen.getByRole("button", { name: "Editar título da experiência" }));
    fireEvent.change(screen.getByLabelText("Texto do botão na vitrine"), {
      target: { value: "Beta alterada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    await waitFor(() => expect(publicarPagina).toHaveBeenCalledWith("org-teste"));
    expect(salvarRascunhoExperiencias).toHaveBeenCalledWith(
      "org-teste",
      [
        expect.objectContaining({ id: "alfa", titulo: "Alfa alterada" }),
        expect.objectContaining({ id: "beta", titulo: "Beta alterada" }),
      ],
      [],
    );
    expect(salvarRascunhoExperiencias.mock.invocationCallOrder[0]).toBeLessThan(
      publicarPagina.mock.invocationCallOrder[0]!,
    );
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeDisabled();
  });

  it("salva a exclusão de uma experiência desaparecida e permite publicar a exclusão da última", async () => {
    const { salvarRascunhoExperiencias, publicarPagina } = preparar();
    excluirSelecionada();
    expect(screen.queryByRole("tab", { name: /Experiência alfa/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    await waitFor(() =>
      expect(salvarRascunhoExperiencias).toHaveBeenCalledWith("org-teste", expect.any(Array), [
        "alfa",
      ]),
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeDisabled(),
    );
    excluirSelecionada();
    expect(
      screen.getByRole("heading", { name: "Nenhuma experiência no rascunho" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    await waitFor(() => expect(publicarPagina).toHaveBeenCalledOnce());
    expect(salvarRascunhoExperiencias).toHaveBeenLastCalledWith("org-teste", [], ["beta"]);
  });

  it("mantém exclusões pendentes e bloqueia a publicação quando o salvamento falha", async () => {
    const { salvarRascunhoExperiencias, publicarPagina } = preparar();
    salvarRascunhoExperiencias.mockRejectedValueOnce(new Error("Não foi possível salvar."));
    excluirSelecionada();
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível salvar.");
    expect(publicarPagina).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    await waitFor(() => expect(publicarPagina).toHaveBeenCalledOnce());
    expect(salvarRascunhoExperiencias).toHaveBeenLastCalledWith("org-teste", expect.any(Array), [
      "alfa",
    ]);
  });

  it("permite tentar publicar novamente um rascunho já salvo", async () => {
    const { salvarRascunhoExperiencias, publicarPagina } = preparar();
    publicarPagina.mockRejectedValueOnce(new Error("Publicação indisponível."));
    fireEvent.click(screen.getByRole("button", { name: "Editar título da experiência" }));
    fireEvent.change(screen.getByLabelText("Texto do botão na vitrine"), {
      target: { value: "Experiência revisada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Publicação indisponível.");
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    await waitFor(() => expect(publicarPagina).toHaveBeenCalledTimes(2));
    expect(salvarRascunhoExperiencias).toHaveBeenCalledOnce();
  });

  it("alterna a exibição com destaque único e mantém as mudanças no rascunho", async () => {
    const { salvarRascunhoExperiencias } = preparar();
    fireEvent.change(screen.getByRole("combobox", { name: "Exibição" }), {
      target: { value: "destaque" },
    });
    fireEvent.click(screen.getByRole("tab", { name: /Experiência beta/ }));
    fireEvent.change(screen.getByRole("combobox", { name: "Exibição" }), {
      target: { value: "destaque" },
    });
    fireEvent.click(screen.getByRole("tab", { name: /Experiência alfa/ }));
    expect(screen.getByRole("combobox", { name: "Exibição" })).toHaveValue("visivel");
    fireEvent.change(screen.getByRole("combobox", { name: "Exibição" }), {
      target: { value: "oculta" },
    });
    expect(salvarRascunhoExperiencias).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    await waitFor(() => expect(salvarRascunhoExperiencias).toHaveBeenCalledOnce());
    const alteradas = salvarRascunhoExperiencias.mock.calls[0]![1] as DefinicaoMicrofluxo[];
    expect(alteradas.find((fluxo) => fluxo.id === "alfa")).toMatchObject({
      ativo: false,
      destaquePrimarioHome: false,
    });
    expect(alteradas.find((fluxo) => fluxo.id === "beta")).toMatchObject({
      ativo: true,
      destaquePrimarioHome: true,
      ordemHome: 0,
    });
  });

  it("não exclui quando o usuário cancela e abre corretamente um rascunho vazio", () => {
    const confirmarNativo = vi.spyOn(window, "confirm");
    preparar();
    excluirSelecionada(false);
    const modal = screen.getByRole("alertdialog");
    expect(within(modal).getByRole("button", { name: "Cancelar" })).toHaveFocus();
    expect(modal).toHaveTextContent("Experiência alfa");
    expect(confirmarNativo).not.toHaveBeenCalled();
    fireEvent.click(within(modal).getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeDisabled();
  });

  it("salva uma experiência nova sem etapas e mantém sua exibição oculta enquanto é montada", async () => {
    const { salvarRascunhoExperiencias } = preparar([]);
    fireEvent.click(screen.getByRole("button", { name: "Nova experiência" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    await waitFor(() =>
      expect(salvarRascunhoExperiencias).toHaveBeenCalledWith(
        "org-teste",
        [
          expect.objectContaining({
            etapaInicialId: "",
            etapas: [],
            ativo: false,
            ativoNaHome: false,
          }),
        ],
        [],
      ),
    );
    expect(salvarRascunhoExperiencias.mock.lastCall![1][0].conclusao).toBeUndefined();
  });
  it("permite criar uma experiência quando o rascunho começa vazio", () => {
    preparar([]);
    expect(
      screen.getByRole("heading", { name: "Nenhuma experiência no rascunho" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Nova experiência" }));
    expect(screen.getByRole("heading", { name: "Nova experiência 1" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Texto do botão na vitrine")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeEnabled();
  });

  it("reordena pela posição completa durante uma busca e mantém a seleção", async () => {
    const { salvarRascunhoExperiencias } = preparar();
    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar experiências" }), {
      target: { value: "beta" },
    });
    expect(screen.getAllByRole("tab")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Mover Experiência beta para a esquerda" }));
    expect(screen.getByRole("heading", { name: "Experiência alfa" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "" } });
    expect(screen.getAllByRole("tab")[0]).toHaveTextContent("Experiência beta");
    expect(screen.getByRole("tab", { name: /Experiência alfa/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    await waitFor(() =>
      expect(salvarRascunhoExperiencias).toHaveBeenCalledWith(
        "org-teste",
        [
          expect.objectContaining({ id: "beta", ordemHome: 0 }),
          expect.objectContaining({ id: "alfa", ordemHome: 1 }),
        ],
        [],
      ),
    );
  });

  it("filtra a exibição e permite recuperar a lista sem alterar o rascunho", () => {
    preparar();
    fireEvent.change(screen.getByLabelText("Filtrar experiências por exibição"), {
      target: { value: "ocultas" },
    });
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
    expect(screen.getByText("Nenhuma experiência encontrada")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeDisabled();
  });

  it("navega entre experiências pelo teclado sem mudar a ordem", () => {
    preparar();
    const alfa = screen.getByRole("tab", { name: /Experiência alfa/ });
    const beta = screen.getByRole("tab", { name: /Experiência beta/ });
    fireEvent.keyDown(alfa, { key: "ArrowRight" });
    expect(beta).toHaveFocus();
    expect(beta).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Experiência beta" })).toBeInTheDocument();
    fireEvent.keyDown(beta, { key: "Home" });
    expect(alfa).toHaveFocus();
    expect(screen.getAllByRole("tab")[0]).toHaveTextContent("Experiência alfa");
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeDisabled();
  });

  it("fecha a confirmação com Escape sem excluir ou modificar o rascunho", () => {
    const { salvarRascunhoExperiencias } = preparar();
    excluirSelecionada(false);
    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeDisabled();
    expect(salvarRascunhoExperiencias).not.toHaveBeenCalled();
  });

  it.each([
    ["microfluxo", undefined, undefined],
    ["link_externo", "URL de Destino Externo", "https://example.com/novo"],
    ["whatsapp", "Número ou Link do WhatsApp", "551199998888"],
    ["telefone", "Telefone para Discagem Direta", "1133334444"],
    ["secao_equipe", undefined, "#equipe"],
  ] as const)(
    "salva título, subtítulo, exibição e destino da ação %s",
    async (tipo, campoDestino, destino) => {
      const { salvarRascunhoExperiencias, publicarPagina } = preparar();
      fireEvent.change(screen.getByLabelText("Tipo de Ação na Vitrine"), {
        target: { value: tipo },
      });
      fireEvent.click(screen.getByRole("button", { name: "Editar título da experiência" }));
      const campoTitulo = screen.getByLabelText(
        tipo === "secao_equipe" ? "Título na vitrine" : "Texto do botão na vitrine",
      );
      fireEvent.change(campoTitulo, { target: { value: "Experiência revisada" } });
      fireEvent.keyDown(campoTitulo, { key: "Enter" });
      fireEvent.change(
        screen.getByLabelText(
          tipo === "secao_equipe" ? "Subtítulo na vitrine" : "Subtítulo discreto do botão",
        ),
        { target: { value: "Descrição de apoio" } },
      );
      if (campoDestino)
        fireEvent.change(screen.getByLabelText(campoDestino), { target: { value: destino } });
      fireEvent.change(screen.getByRole("combobox", { name: "Exibição" }), {
        target: { value: "oculta" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
      await waitFor(() => expect(salvarRascunhoExperiencias).toHaveBeenCalledTimes(1));
      expect(salvarRascunhoExperiencias.mock.calls[0]?.[1]).toEqual([
        expect.objectContaining({
          id: "alfa",
          tipoAcao: tipo,
          titulo: "Experiência revisada",
          rotuloBotaoHome: "Experiência revisada",
          subtituloBotaoHome: "Descrição de apoio",
          ativo: false,
          ativoNaHome: false,
          ...(destino ? { urlDestinoOpcional: destino } : {}),
        }),
      ]);
      expect(publicarPagina).not.toHaveBeenCalled();
    },
  );

  it.each(["secao_equipe"])(
    "salva o título da seção %s sem mudar o texto do botão",
    async (tipo) => {
      const { salvarRascunhoExperiencias } = preparar();
      fireEvent.change(screen.getByLabelText("Tipo de Ação na Vitrine"), {
        target: { value: tipo },
      });
      const campo = screen.getByLabelText("Título da seção (opcional)");
      expect(campo).toHaveAttribute("maxlength", "100");
      fireEvent.change(campo, { target: { value: "Conheça nosso trabalho" } });
      fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
      await waitFor(() => expect(salvarRascunhoExperiencias).toHaveBeenCalledTimes(1));
      expect(salvarRascunhoExperiencias.mock.calls[0]?.[1]).toEqual([
        expect.objectContaining({
          tituloSecao: "Conheça nosso trabalho",
          rotuloBotaoHome: "Experiência alfa",
        }),
      ]);
      fireEvent.change(campo, { target: { value: "" } });
      fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
      await waitFor(() => expect(salvarRascunhoExperiencias).toHaveBeenCalledTimes(2));
      expect(salvarRascunhoExperiencias.mock.calls[1]?.[1]).toEqual([
        expect.objectContaining({ tituloSecao: "" }),
      ]);
    },
  );
});
