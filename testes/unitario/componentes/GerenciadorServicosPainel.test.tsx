import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import type { ServicoOrganizacao } from "@/dominio/entidades/catalogoConteudo";
import { GerenciadorServicosPainel } from "@/componentes/painel/catalogo/GerenciadorServicosPainel";

const servico: ServicoOrganizacao = {
  id: "detailing",
  organizacaoId: "garage-88",
  nome: "Detailing completo",
  categoria: "Estética",
  resumo: "Limpeza e proteção da pintura",
  precoBaseCentavos: 85000,
  prazoOuDuracao: "2 dias",
  urlImagemOpcional: "/midias-demonstracao/logo-garage88.png",
  pontoFocalImagem: { xPercentual: 30, yPercentual: 40 },
  ordemExibicao: 1,
  ativo: true,
  atualizadoEmIso: "2026-11-13T12:00:00Z",
};

function montar(
  opcoes: { editar?: boolean; servicos?: readonly ServicoOrganizacao[]; falhar?: boolean } = {},
) {
  const salvarServico = opcoes.falhar
    ? vi.fn().mockRejectedValue(new Error("Falha ao salvar"))
    : vi.fn().mockResolvedValue(undefined);
  const publicarPagina = vi
    .fn()
    .mockResolvedValue({ versaoPublicada: 2, publicadoEmIso: "2026-11-13T12:00:00Z" });
  const enviarMidia = vi.fn().mockResolvedValue({
    urlPublica: "https://storage.googleapis.com/loja/servico.webp",
    caminhoArmazenamento: "organizacoes/garage-88/imagens/servico.webp",
  });
  const servicoDuble: ServicoCatalogoConteudoPorta = {
    salvarServico,
    publicarPagina,
    salvarProduto: vi.fn(),
    salvarProjetoPortfolio: vi.fn(),
    salvarProfissional: vi.fn(),
    excluirProfissional: vi.fn(),
    salvarMicrofluxo: vi.fn(),
    salvarRascunhoExperiencias: vi.fn(),
    enviarMidia,
  };
  render(
    <GerenciadorServicosPainel
      organizacaoId="garage-88"
      identificadorPublico="garage-88"
      servicosIniciais={
        opcoes.servicos ?? [
          servico,
          {
            ...servico,
            id: "revisao",
            nome: "Revisão preventiva",
            categoria: "Manutenção",
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
  return { salvarServico, publicarPagina, enviarMidia };
}

describe("Serviços do painel", () => {
  it("combina busca por categoria com visibilidade e permite limpar os filtros", () => {
    montar();
    const lista = () => screen.getByRole("list", { name: "Lista de serviços" });
    expect(within(lista()).getAllByRole("listitem")).toHaveLength(2);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "manutenção" } });
    expect(within(lista()).getByText("Revisão preventiva")).toBeInTheDocument();
    expect(within(lista()).queryByText("Detailing completo")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Filtrar visibilidade"), {
      target: { value: "ativos" },
    });
    expect(screen.getByText("Nenhum serviço encontrado")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(within(lista()).getAllByRole("listitem")).toHaveLength(2);
  });

  it("edita com foco no formulário, preserva a mídia e publica", async () => {
    const { salvarServico, publicarPagina } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Editar Detailing completo" }));
    const nome = screen.getByLabelText(/Nome do serviço/);
    expect(nome).toHaveFocus();
    expect(nome).toHaveValue("Detailing completo");
    fireEvent.change(nome, { target: { value: "Detailing premium" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() =>
      expect(salvarServico).toHaveBeenCalledWith(
        expect.objectContaining({
          id: servico.id,
          nome: "Detailing premium",
          precoBaseCentavos: 85000,
          prazoOuDuracao: "2 dias",
          pontoFocalImagem: servico.pontoFocalImagem,
          urlImagemOpcional: servico.urlImagemOpcional,
        }),
      ),
    );
    expect(
      await screen.findByRole("button", { name: "Editar Detailing premium" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    await waitFor(() => expect(publicarPagina).toHaveBeenCalledWith("garage-88"));
    expect(await screen.findByText("Vitrine v2")).toBeInTheDocument();
  });

  it("cadastra um serviço sem preço com a apresentação Sob consulta", async () => {
    const { salvarServico } = montar({ servicos: [] });
    expect(screen.getByText("Seu primeiro serviço começa aqui")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Nome do serviço/), {
      target: { value: "Consultoria" },
    });
    fireEvent.change(screen.getByLabelText(/Categoria ou área/), {
      target: { value: "Avaliação" },
    });
    fireEvent.change(screen.getByLabelText(/Resumo editorial/), {
      target: { value: "Atendimento especializado" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar serviço" }));
    await waitFor(() =>
      expect(salvarServico).toHaveBeenCalledWith(
        expect.objectContaining({ nome: "Consultoria", ativo: true }),
      ),
    );
    expect(salvarServico.mock.calls[0]?.[0]).not.toHaveProperty("precoBaseCentavos");
    expect(await screen.findByText("Sob consulta")).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome do serviço/)).toHaveValue("");
  });

  it("altera a visibilidade e conserva os dados existentes", async () => {
    const { salvarServico } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Ocultar Detailing completo" }));
    await waitFor(() =>
      expect(salvarServico).toHaveBeenCalledWith(
        expect.objectContaining({ id: servico.id, ativo: false, precoBaseCentavos: 85000 }),
      ),
    );
    expect(
      await screen.findByRole("button", { name: "Reativar Detailing completo" }),
    ).toBeEnabled();
    fireEvent.change(screen.getByLabelText("Filtrar visibilidade"), {
      target: { value: "ativos" },
    });
    expect(screen.getByText("Nenhum serviço encontrado")).toBeInTheDocument();
  });

  it("preserva a visibilidade e a edição após falha de gravação", async () => {
    const { salvarServico } = montar({ falhar: true });
    fireEvent.click(screen.getByRole("button", { name: "Ocultar Detailing completo" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao salvar");
    expect(screen.getByRole("button", { name: "Ocultar Detailing completo" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Editar Detailing completo" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() => expect(salvarServico).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeEnabled(),
    );
    expect(screen.getByLabelText(/Nome do serviço/)).toHaveValue("Detailing completo");
  });

  it("mantém as permissões de edição e publicação", () => {
    montar({ editar: false });
    expect(screen.getByRole("button", { name: "Editar Detailing completo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ocultar Detailing completo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Publicar página" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Adicionar serviço" })).toBeDisabled();
    expect(screen.getByLabelText(/Nome do serviço/)).toBeDisabled();
    expect(screen.getByRole("searchbox")).toBeEnabled();
  });
  it("salva todos os campos do serviço e permite remover preço, complemento e prazo", async () => {
    const { salvarServico } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Editar Detailing completo" }));
    for (const [rotulo, valor] of [
      [/Nome do serviço/, "Proteção cerâmica"],
      [/Categoria ou área/, "Proteção"],
      [/Resumo editorial/, "Aplicação de proteção com garantia"],
      [/Valor base opcional/, "1.234,56"],
      [/Complemento de preço/, "A partir de"],
      [/Duração ou prazo/, "3 dias"],
    ] as const)
      fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() => expect(salvarServico).toHaveBeenCalledTimes(1));
    expect(salvarServico.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        ...servico,
        nome: "Proteção cerâmica",
        categoria: "Proteção",
        resumo: "Aplicação de proteção com garantia",
        precoBaseCentavos: 123456,
        rotuloPrecoOpcional: "A partir de",
        prazoOuDuracao: "3 dias",
        atualizadoEmIso: expect.any(String),
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Editar Proteção cerâmica" }));
    for (const rotulo of [
      /Valor base opcional/,
      /Complemento de preço/,
      /Duração ou prazo/,
    ])
      fireEvent.change(screen.getByLabelText(rotulo), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() => expect(salvarServico).toHaveBeenCalledTimes(2));
    for (const campo of [
      "precoBaseCentavos",
      "rotuloPrecoOpcional",
      "prazoOuDuracao",
    ])
      expect(salvarServico.mock.calls[1]?.[0]).not.toHaveProperty(campo);
  });

  it("envia a foto para a organização correta e grava a URL retornada no serviço", async () => {
    const { salvarServico, enviarMidia } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Editar Detailing completo" }));
    const arquivo = new File(["imagem"], "servico.webp", { type: "image/webp" });
    fireEvent.change(document.querySelector('input[type="file"]')!, {
      target: { files: [arquivo] },
    });
    await waitFor(() =>
      expect(enviarMidia).toHaveBeenCalledWith(
        expect.objectContaining({ organizacaoId: "garage-88", categoria: "imagem", arquivo }),
      ),
    );
    await waitFor(() => expect(screen.getByText("Arquivo enviado com sucesso.")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() =>
      expect(salvarServico).toHaveBeenCalledWith(
        expect.objectContaining({
          id: servico.id,
          imagens: expect.arrayContaining([
            expect.objectContaining({ url: "https://storage.googleapis.com/loja/servico.webp" }),
          ]),
        }),
      ),
    );
    expect(screen.queryByText("Modelos visuais prontos:")).not.toBeInTheDocument();
  });
});
