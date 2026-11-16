import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import type { ProdutoCatalogo } from "@/dominio/entidades/catalogoConteudo";
import { GerenciadorCatalogoPainel } from "@/componentes/painel/catalogo/GerenciadorCatalogoPainel";

const produto: ProdutoCatalogo = {
  id: "porsche",
  organizacaoId: "garage-88",
  nome: "Porsche 911",
  categoria: "Esportivos",
  resumo: "Procedência e garantia",
  precoCentavos: 78900000,
  disponibilidade: "disponivel",
  especificacoesCurtas: ["Ano: 2024"],
  urlImagemPrincipal: "/midias-demonstracao/logo-garage88.png",
  pontoFocalImagem: { xPercentual: 30, yPercentual: 40 },
  ordemExibicao: 1,
  ativo: true,
  atualizadoEmIso: "2026-11-13T12:00:00Z",
};

function montar(
  opcoes: { editar?: boolean; produtos?: readonly ProdutoCatalogo[]; falhar?: boolean } = {},
) {
  const salvarProduto = opcoes.falhar
    ? vi.fn().mockRejectedValue(new Error("Falha ao salvar"))
    : vi.fn().mockResolvedValue(undefined);
  const publicarPagina = vi
    .fn()
    .mockResolvedValue({ versaoPublicada: 2, publicadoEmIso: "2026-11-13T12:00:00Z" });
  const servico: ServicoCatalogoConteudoPorta = {
    salvarProduto,
    publicarPagina,
    salvarServico: vi.fn(),
    salvarProjetoPortfolio: vi.fn(),
    salvarProfissional: vi.fn(),
    excluirProfissional: vi.fn(),
    salvarMicrofluxo: vi.fn(),
    salvarRascunhoExperiencias: vi.fn(),
    enviarMidia: vi.fn(),
  };
  render(
    <GerenciadorCatalogoPainel
      organizacaoId="garage-88"
      identificadorPublico="garage-88"
      produtosIniciais={
        opcoes.produtos ?? [
          produto,
          {
            ...produto,
            id: "bmw",
            nome: "BMW M3",
            categoria: "Sedãs",
            disponibilidade: "sob_encomenda",
            ativo: false,
          },
        ]
      }
      versaoPublicadaInicial={1}
      podeEditarConteudo={opcoes.editar ?? true}
      podePublicarPagina={opcoes.editar ?? true}
      servicoCatalogo={servico}
    />,
  );
  return { salvarProduto, publicarPagina };
}

describe("Catálogo do painel", () => {
  it("combina busca e disponibilidade e permite limpar filtros sem alterar os itens", () => {
    montar();
    const lista = () => screen.getByRole("list", { name: "Itens do catálogo" });
    expect(within(lista()).getAllByRole("listitem")).toHaveLength(2);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "sedãs" } });
    expect(within(lista()).getByText("BMW M3")).toBeInTheDocument();
    expect(within(lista()).queryByText("Porsche 911")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Filtrar disponibilidade"), {
      target: { value: "disponivel" },
    });
    expect(screen.getByText("Nenhum item encontrado")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(within(lista()).getAllByRole("listitem")).toHaveLength(2);
  });

  it("edita com foco no formulário, preserva a foto e o ponto focal e publica", async () => {
    const { salvarProduto, publicarPagina } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Editar Porsche 911" }));
    const nome = screen.getByLabelText(/Nome do produto/);
    expect(nome).toHaveFocus();
    expect(nome).toHaveValue("Porsche 911");
    fireEvent.change(nome, { target: { value: "Porsche 911 GTS" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() =>
      expect(salvarProduto).toHaveBeenCalledWith(
        expect.objectContaining({
          id: produto.id,
          nome: "Porsche 911 GTS",
          precoCentavos: produto.precoCentavos,
          pontoFocalImagem: produto.pontoFocalImagem,
          urlImagemPrincipal: produto.urlImagemPrincipal,
        }),
      ),
    );
    expect(
      await screen.findByRole("button", { name: "Editar Porsche 911 GTS" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    await waitFor(() => expect(publicarPagina).toHaveBeenCalledWith("garage-88"));
    expect(await screen.findByText("Vitrine v2")).toBeInTheDocument();
  });

  it("conserva a visibilidade e o formulário após falha de gravação", async () => {
    const { salvarProduto } = montar({ falhar: true });
    fireEvent.click(screen.getByRole("button", { name: "Ocultar Porsche 911" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao salvar");
    expect(screen.getByRole("button", { name: "Ocultar Porsche 911" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Editar Porsche 911" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() => expect(salvarProduto).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeEnabled(),
    );
    expect(screen.getByLabelText(/Nome do produto/)).toHaveValue("Porsche 911");
  });

  it("mantém as permissões de edição e publicação", () => {
    montar({ editar: false });
    expect(screen.getByRole("button", { name: "Editar Porsche 911" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ocultar Porsche 911" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Publicar página" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Adicionar ao catálogo" })).toBeDisabled();
    expect(screen.getByLabelText(/Nome do produto/)).toBeDisabled();
    expect(screen.getByRole("searchbox")).toBeEnabled();
  });
  it("salva todos os campos do item e remove opcionais quando são limpos", async () => {
    const { salvarProduto } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Editar Porsche 911" }));
    for (const [rotulo, valor] of [
      [/Nome do produto/, "BMW M4"],
      [/Categoria ou linha/, "Cupês"],
      [/Descrição editorial/, "Veículo revisado e com garantia"],
      [/^Preço/, "123.456,78"],
      [/Especificações em formato/, "Ano: 2025\n\nMotor: 3.0\n"],
    ] as const)
      fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
    fireEvent.change(screen.getByLabelText(/Disponibilidade/), {
      target: { value: "sob_encomenda" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() => expect(salvarProduto).toHaveBeenCalledTimes(1));
    expect(salvarProduto.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        ...produto,
        nome: "BMW M4",
        categoria: "Cupês",
        resumo: "Veículo revisado e com garantia",
        precoCentavos: 12345678,
        disponibilidade: "sob_encomenda",
        especificacoesCurtas: ["Ano: 2025", "Motor: 3.0"],
        atualizadoEmIso: expect.any(String),
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Editar BMW M4" }));
    fireEvent.change(screen.getByLabelText(/Especificações em formato/), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() => expect(salvarProduto).toHaveBeenCalledTimes(2));
    expect(salvarProduto.mock.calls[1]?.[0].especificacoesCurtas).toEqual([]);
  });
});
