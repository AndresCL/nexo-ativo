import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type * as ModuloReactFlow from "@xyflow/react";
import type { ReactFlowProps } from "@xyflow/react";
import { CanvasEditorVisualFluxos } from "@/componentes/painel/microfluxos/CanvasEditorVisualFluxos";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { criarMicrofluxoPadraoParaTestes } from "../../fixtures/geradoresMicrofluxoTeste";
const { renderizarCanvas } = vi.hoisted(() => ({ renderizarCanvas: vi.fn() }));
vi.mock("@xyflow/react", async (importOriginal) => ({
  ...(await importOriginal<typeof ModuloReactFlow>()),
  ReactFlow: (props: ReactFlowProps) => {
    renderizarCanvas(props);
    return <div data-testid="diagrama-fluxo" />;
  },
}));
const fluxo = criarMicrofluxoPadraoParaTestes({
  organizacaoId: "org-teste",
  nomeOrganizacao: "Teste",
  modelo: "catalogo",
});
function preparar(atual: DefinicaoMicrofluxo = fluxo) {
  const salvar = vi.fn();
  render(
    <CanvasEditorVisualFluxos
      fluxo={atual}
      fluxos={[atual]}
      profissionais={[]}
      identificadorPublico="teste"
      permiteFinanceiro
      podeEditar
      aoSalvarFluxo={salvar}
    />,
  );
  return salvar;
}
function propriedadesCanvas(): ReactFlowProps {
  return renderizarCanvas.mock.lastCall![0];
}

describe("Finalização integrada ao editor de fluxo", () => {
  it("um fluxo novo mostra somente o Início, sem inserir etapas de execução", () => {
    preparar({ ...fluxo, etapaInicialId: "", etapas: [], conclusao: undefined });
    expect(propriedadesCanvas().nodes!.map((no) => no.type)).toEqual(["inicioFluxo"]);
    expect(propriedadesCanvas().edges).toEqual([]);
  });
  it("adiciona etapas livres e modelos sem alterar conexões nem definir a entrada", () => {
    const salvar = preparar({ ...fluxo, etapaInicialId: "", etapas: [], conclusao: undefined });
    fireEvent.click(screen.getByRole("button", { name: "Etapa livre" }));
    expect(salvar.mock.lastCall![0]).toMatchObject({
      etapaInicialId: "",
      etapas: [expect.objectContaining({ tipoEtapa: "etapa_livre" })],
    });
    expect(salvar.mock.lastCall![0].etapas[0].proximaEtapaPadraoId).toBeUndefined();
    fireEvent.click(screen.getByText("Modelos de etapa"));
    fireEvent.click(screen.getByRole("button", { name: "Dados para retorno" }));
    expect(salvar.mock.lastCall![0]).toMatchObject({
      etapaInicialId: "",
      etapas: [
        expect.objectContaining({
          tipoEtapa: "etapa_livre",
          modeloOrigem: "coleta_contato",
          saidaPadraoDesconectada: true,
          blocos: [
            expect.objectContaining({
              tipo: "escolha",
              opcoes: [
                { id: "whatsapp", rotulo: "WhatsApp" },
                { id: "ligacao", rotulo: "Ligação" },
              ],
            }),
            expect.objectContaining({ finalidade: "nomeCompleto" }),
            expect.objectContaining({ finalidade: "telefoneOuWhatsapp" }),
          ],
        }),
      ],
    });
  });
  it("criar uma etapa não conecta a última caixa existente", () => {
    const salvar = preparar();
    fireEvent.click(screen.getByRole("button", { name: "Etapa livre" }));
    expect(salvar.mock.lastCall![0].etapas.slice(0, -1)).toEqual(fluxo.etapas);
    expect(salvar.mock.lastCall![0].etapaInicialId).toBe(fluxo.etapaInicialId);
  });
  it("o conector visual do Início define a primeira etapa sem persistir o nó", () => {
    const salvar = preparar({ ...fluxo, etapaInicialId: "" });
    const props = propriedadesCanvas();
    const inicio = props.nodes!.find((no) => no.type === "inicioFluxo")!;
    act(() =>
      props.onConnect!({
        source: inicio.id,
        target: fluxo.etapas[0]!.id,
        sourceHandle: "inicio",
        targetHandle: null,
      }),
    );
    expect(salvar.mock.lastCall![0]).toMatchObject({
      etapaInicialId: fluxo.etapas[0]!.id,
      etapas: fluxo.etapas,
    });
    expect(JSON.stringify(salvar.mock.lastCall![0])).not.toContain(inicio.id);
  });
  it("oferece etapa livre e modelos editáveis, sem categorias fixas na barra", () => {
    const salvar = preparar();
    expect(screen.queryByRole("button", { name: "Pergunta" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Formulário" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Contato" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Etapa livre" }));
    expect(salvar.mock.lastCall![0].etapas.at(-1)).toMatchObject({
      tipoEtapa: "etapa_livre",
      titulo: "Nova etapa",
    });
  });
  it("abre a configuração na lateral do editor e salva sem adicionar etapas ao contrato", () => {
    const salvar = preparar();
    expect(screen.queryByLabelText("Título da conclusão")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Finalização" }));
    const painel = screen.getByRole("complementary", { name: "Configurações da finalização" });
    expect(painel).toContainElement(screen.getByLabelText("Título da conclusão"));
    fireEvent.change(screen.getByLabelText("Título da conclusão"), {
      target: { value: "Obrigado por participar" },
    });
    expect(salvar).toHaveBeenLastCalledWith(
      expect.objectContaining({
        etapas: fluxo.etapas,
        mensagemConfirmacaoTitulo: "Obrigado por participar",
      }),
    );
    fireEvent.change(screen.getByLabelText("Texto do botão para finalizar o percurso"), {
      target: { value: "Concluir" },
    });
    expect(salvar).toHaveBeenLastCalledWith(
      expect.objectContaining({ textoBotaoConclusao: "Concluir", etapas: fluxo.etapas }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Fechar painel de finalização" }));
    expect(screen.queryByLabelText("Título da conclusão")).not.toBeInTheDocument();
  });
  it("projeta a finalização para os nós terminais e permite selecionar sua caixa", () => {
    preparar();
    const props = propriedadesCanvas();
    const final = props.nodes!.find((node) => node.type === "conclusaoFluxo")!;
    expect(final.deletable).toBe(false);
    expect(
      props.edges!.filter((edge) => edge.target === final.id).map((edge) => edge.source),
    ).toEqual(["etapa-contato"]);
    act(() => props.onNodeClick!({} as never, final));
    expect(screen.getByLabelText("Título da conclusão")).toBeInTheDocument();
  });
  it("conectar à finalização remove a próxima etapa sem persistir o identificador visual", () => {
    const salvar = preparar();
    const props = propriedadesCanvas();
    const final = props.nodes!.find((node) => node.type === "conclusaoFluxo")!;
    act(() =>
      props.onConnect!({
        source: "etapa-catalogo",
        target: final.id,
        sourceHandle: null,
        targetHandle: null,
      }),
    );
    const salvo: DefinicaoMicrofluxo = salvar.mock.lastCall![0];
    expect(salvo.etapas).toHaveLength(fluxo.etapas.length);
    expect(
      salvo.etapas.find((etapa) => etapa.id === "etapa-catalogo")?.proximaEtapaPadraoId,
    ).toBeUndefined();
    expect(JSON.stringify(salvo)).not.toContain(final.id);
  });
  it("não mostra saída direta de uma pergunta cujas opções levam a outras etapas", () => {
    preparar({
      ...fluxo,
      etapaInicialId: "escolha",
      etapas: [
        {
          id: "escolha",
          tipoEtapa: "selecao_unica",
          titulo: "Escolha",
          obrigatoria: true,
          opcoes: [{ id: "a", rotulo: "Contato", proximaEtapaIdOpcional: "etapa-contato" }],
        },
        fluxo.etapas[1]!,
      ],
    });
    const props = propriedadesCanvas();
    const final = props.nodes!.find((node) => node.type === "conclusaoFluxo")!;
    expect(props.edges!.some((edge) => edge.source === "escolha" && edge.target === final.id)).toBe(
      false,
    );
  });
  it("permite editar o destino de cada resposta e mostra os ramos lado a lado", () => {
    const bifurcado: DefinicaoMicrofluxo = {
      ...fluxo,
      etapaInicialId: "escolha",
      etapas: [
        {
          id: "escolha",
          titulo: "Como deseja continuar?",
          tipoEtapa: "selecao_unica",
          obrigatoria: true,
          opcoes: [
            { id: "a", rotulo: "Primeira opção", proximaEtapaIdOpcional: "ramo-a" },
            { id: "b", rotulo: "Segunda opção", proximaEtapaIdOpcional: "ramo-b" },
          ],
        },
        {
          id: "ramo-a",
          titulo: "Dados da primeira opção",
          tipoEtapa: "entrada_curta",
          obrigatoria: false,
          proximaEtapaPadraoId: "etapa-contato",
        },
        {
          id: "ramo-b",
          titulo: "Dados da segunda opção",
          tipoEtapa: "entrada_curta",
          obrigatoria: false,
          proximaEtapaPadraoId: "etapa-contato",
        },
        fluxo.etapas[1]!,
      ],
    };
    const salvar = preparar(bifurcado);
    const nos = propriedadesCanvas().nodes!;
    const a = nos.find((no) => no.id === "ramo-a")!;
    const b = nos.find((no) => no.id === "ramo-b")!;
    expect(a.position.y).toBe(b.position.y);
    expect(a.position.x).not.toBe(b.position.x);
    expect(screen.getByLabelText("Destino da opção 1")).toHaveValue("ramo-a");
    fireEvent.change(screen.getByLabelText("Destino da opção 1"), { target: { value: "ramo-b" } });
    expect(salvar).toHaveBeenCalledWith(
      expect.objectContaining({
        etapas: expect.arrayContaining([
          expect.objectContaining({
            id: "escolha",
            tipoEtapa: "etapa_livre",
            blocos: expect.arrayContaining([
              expect.objectContaining({
                tipo: "escolha",
                opcoes: expect.arrayContaining([
                  expect.objectContaining({ id: "a", proximaEtapaIdOpcional: "ramo-b" }),
                ]),
              }),
            ]),
          }),
        ]),
      }),
    );
  });
  it("excluir o link de uma pergunta mantém sua saída sem conexão após renderizar novamente", () => {
    const escolhido = {
      ...fluxo,
      etapaInicialId: "pergunta",
      etapas: [
        {
          id: "pergunta",
          tipoEtapa: "selecao_unica" as const,
          titulo: "O que deseja?",
          obrigatoria: true,
          proximaEtapaPadraoId: "etapa-contato",
          opcoes: [{ id: "a", rotulo: "Opção A", proximaEtapaIdOpcional: "etapa-contato" }],
        },
        fluxo.etapas[1]!,
      ],
    };
    const salvar = preparar(escolhido);
    const props = propriedadesCanvas();
    const aresta = props.edges!.find((a) => a.data?.opcaoId === "a")!;
    expect(aresta.deletable).toBe(true);
    act(() => (aresta.data!.onExcluirConector as () => void)());
    const salvo = salvar.mock.lastCall![0];
    expect(salvo.etapas[0].opcoes[0]).toMatchObject({
      desconectada: true,
      encerrarPercurso: false,
    });
    expect(salvo.etapas[0].proximaEtapaPadraoId).toBe("etapa-contato");
  });
});
