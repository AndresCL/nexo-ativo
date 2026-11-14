import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import type { ProjetoPortfolio } from "@/dominio/entidades/catalogoConteudo";
import { GerenciadorPortfolioPainel } from "@/componentes/painel/catalogo/GerenciadorPortfolioPainel";

const projeto: ProjetoPortfolio = {
  id: "projeto-1",
  organizacaoId: "garage-88",
  titulo: "Restauração Porsche",
  categoriaOuSerie: "Restauração",
  anoOuLocal: "São Paulo · 2026",
  resumoEditorial: "Recuperação completa da pintura",
  urlImagemCapa: "/midias-demonstracao/galeria-obra-monolito.svg",
  textoAlternativoCapa: "Porsche restaurado",
  pontoFocalCapa: { xPercentual: 30, yPercentual: 40 },
  destaqueVitrine: false,
  ordemExibicao: 1,
  ativo: true,
  atualizadoEmIso: "2026-11-13T12:00:00Z",
};

function montar(
  opcoes: { editar?: boolean; projetos?: readonly ProjetoPortfolio[]; falhar?: boolean } = {},
) {
  const salvarProjetoPortfolio = opcoes.falhar
    ? vi.fn().mockRejectedValue(new Error("Falha ao salvar"))
    : vi.fn().mockResolvedValue(undefined);
  const publicarPagina = vi
    .fn()
    .mockResolvedValue({ versaoPublicada: 2, publicadoEmIso: "2026-11-13T12:00:00Z" });
  const servicoDuble: ServicoCatalogoConteudoPorta = {
    salvarProjetoPortfolio,
    publicarPagina,
    salvarProduto: vi.fn(),
    salvarServico: vi.fn(),
    salvarProfissional: vi.fn(),
    excluirProfissional: vi.fn(),
    salvarMicrofluxo: vi.fn(),
    salvarRascunhoExperiencias: vi.fn(),
    enviarMidia: vi.fn(),
  };
  render(
    <GerenciadorPortfolioPainel
      organizacaoId="garage-88"
      identificadorPublico="garage-88"
      projetosIniciais={
        opcoes.projetos ?? [
          projeto,
          {
            ...projeto,
            id: "projeto-2",
            titulo: "Revisão BMW",
            textoAlternativoCapa: "BMW revisado",
            categoriaOuSerie: "Manutenção",
            anoOuLocal: "Curitiba",
            ativo: false,
          },
        ]
      }
      versaoPublicadaInicial={1}
      podeEditarConteudo={opcoes.editar ?? true}
      podePublicarPagina={opcoes.editar ?? true}
      servicoCatalogo={servicoDuble}
    />,
  );
  return { salvarProjetoPortfolio, publicarPagina };
}

describe("Portfólio do painel", () => {
  it("combina busca por local e visibilidade e permite limpar os filtros", () => {
    montar();
    const lista = () => screen.getByRole("list", { name: "Lista de projetos" });
    expect(within(lista()).getAllByRole("listitem")).toHaveLength(2);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "curitiba" } });
    expect(within(lista()).getByText("Revisão BMW")).toBeInTheDocument();
    expect(within(lista()).queryByText("Restauração Porsche")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Filtrar visibilidade"), {
      target: { value: "ativos" },
    });
    expect(screen.getByText("Nenhum projeto encontrado")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(within(lista()).getAllByRole("listitem")).toHaveLength(2);
  });

  it("edita o enquadramento, preserva o destaque existente e publica", async () => {
    const { salvarProjetoPortfolio, publicarPagina } = montar();
    const lista = screen.getByRole("list", { name: "Lista de projetos" });
    expect(within(lista).getByAltText("Porsche restaurado")).toHaveStyle({
      objectPosition: "30% 40%",
    });
    fireEvent.click(screen.getByRole("button", { name: "Editar Restauração Porsche" }));
    expect(screen.getByLabelText(/Título do projeto ou obra/)).toHaveFocus();
    fireEvent.click(screen.getByText("Ajustar enquadramento da imagem principal"));
    fireEvent.change(screen.getByLabelText(/Posição vertical \(Y\)/), { target: { value: "26" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() =>
      expect(salvarProjetoPortfolio).toHaveBeenCalledWith(
        expect.objectContaining({
          id: projeto.id,
          titulo: projeto.titulo,
          destaqueVitrine: false,
          ativo: true,
          pontoFocalCapa: { xPercentual: 30, yPercentual: 26 },
          textoAlternativoCapa: projeto.textoAlternativoCapa,
        }),
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    await waitFor(() => expect(publicarPagina).toHaveBeenCalledWith("garage-88"));
    expect(await screen.findByText("Vitrine v2")).toBeInTheDocument();
  });

  it("cadastra um projeto e usa uma descrição acessível padrão para a capa", async () => {
    const { salvarProjetoPortfolio } = montar({ projetos: [] });
    expect(screen.getByText("Seu portfólio começa aqui")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Título do projeto ou obra/), {
      target: { value: "Projeto novo" },
    });
    fireEvent.change(screen.getByLabelText(/Categoria ou série/), { target: { value: "Obras" } });
    fireEvent.change(screen.getByLabelText(/Resumo editorial/), {
      target: { value: "Entrega completa" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Adicionar imagens de teste/i }));
    fireEvent.click(screen.getByRole("button", { name: "Adicionar ao portfólio" }));
    await waitFor(() =>
      expect(salvarProjetoPortfolio).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: "Projeto novo",
          ativo: true,
          textoAlternativoCapa: "Fotografia de Projeto novo",
        }),
      ),
    );
    expect(await screen.findByRole("button", { name: "Editar Projeto novo" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Título do projeto ou obra/)).toHaveValue("");
  });

  it("atualiza a visibilidade e conserva o restante do projeto", async () => {
    const { salvarProjetoPortfolio } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Ocultar Restauração Porsche" }));
    await waitFor(() =>
      expect(salvarProjetoPortfolio).toHaveBeenCalledWith(
        expect.objectContaining({ ...projeto, ativo: false, atualizadoEmIso: expect.any(String) }),
      ),
    );
    expect(
      await screen.findByRole("button", { name: "Reativar Restauração Porsche" }),
    ).toBeEnabled();
  });

  it("mantém os dados no formulário quando a gravação falha", async () => {
    montar({ falhar: true });
    fireEvent.click(screen.getByRole("button", { name: "Editar Restauração Porsche" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao salvar");
    expect(screen.getByLabelText(/Título do projeto ou obra/)).toHaveValue("Restauração Porsche");
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeEnabled();
  });

  it("mantém as permissões e mostra uma alternativa quando a imagem falha", async () => {
    montar({ editar: false });
    expect(screen.getByRole("button", { name: "Editar Restauração Porsche" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ocultar Restauração Porsche" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Publicar página" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Adicionar ao portfólio" })).toBeDisabled();
    const lista = screen.getByRole("list", { name: "Lista de projetos" });
    fireEvent.error(within(lista).getByAltText("Porsche restaurado"));
    await waitFor(() =>
      expect(within(lista).queryByAltText("Porsche restaurado")).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("searchbox")).toBeEnabled();
  });
  it("salva todos os campos do projeto, a capa e seu enquadramento", async () => {
    const { salvarProjetoPortfolio } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Editar Restauração Porsche" }));
    for (const [rotulo, valor] of [
      [/Título do projeto ou obra/, "Restauração BMW"],
      [/Categoria ou série/, "Clássicos"],
      [/Ano ou cidade/, "Curitiba · 2026"],
      [/Resumo editorial/, "Restauração de um clássico"],
      [/Texto alternativo da capa/, "BMW restaurado na oficina"],
    ] as const)
      fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
    fireEvent.click(screen.getByText("Ajustar enquadramento da imagem principal"));
    fireEvent.change(screen.getByLabelText(/Posição horizontal \(X\)/), {
      target: { value: "65" },
    });
    fireEvent.change(screen.getByLabelText(/Posição vertical \(Y\)/), { target: { value: "22" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() => expect(salvarProjetoPortfolio).toHaveBeenCalledTimes(1));
    expect(salvarProjetoPortfolio.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        ...projeto,
        titulo: "Restauração BMW",
      categoriaOuSerie: "Clássicos",
      anoOuLocal: "Curitiba · 2026",
      resumoEditorial: "Restauração de um clássico",
      textoAlternativoCapa: "BMW restaurado na oficina",
      pontoFocalCapa: { xPercentual: 65, yPercentual: 22 },
      atualizadoEmIso: expect.any(String),
    }),
    );
  });
});
