import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { ExecutorMicrofluxoVisitante } from "@/componentes/editorial/ExecutorMicrofluxoVisitante";
import {
  CATALOGO_ACERVOS_DEMONSTRACAO,
  CATALOGO_DEMONSTRACOES_EDITORIAIS,
} from "../../fixtures/dadosExemploVitrine";

vi.mock("@/ganchos/usarPreferenciaMovimentoReduzido", () => ({
  usePreferenciaMovimentoReduzido: () => false,
}));

describe("Formulários Dinâmicos Universais no Executor", () => {
  const pagina = CATALOGO_DEMONSTRACOES_EDITORIAIS["lumina-arquitetura-luz"]!;
  const acervo = CATALOGO_ACERVOS_DEMONSTRACAO["lumina-arquitetura-luz"]!;

  const fluxoComFormularioDinamico: DefinicaoMicrofluxo = {
    id: "fluxo-teste-dinamico",
    organizacaoId: "org-1",
    ancoraAcionamento: "#fluxo-atendimento",
    titulo: "Formulário de Avaliação e Simulação",
    descricaoCurta: "Preencha as informações para continuar.",
    textoBotaoConclusao: "Finalizar Pedido",
    mensagemConfirmacaoTitulo: "Solicitação recebida com sucesso",
    mensagemConfirmacaoCorpo: "Nossa equipe entrará em contato em breve.",
    etapaInicialId: "etapa-formulario",
    ativo: true,
    atualizadoEmIso: new Date().toISOString(),
    etapas: [
      {
        id: "etapa-formulario",
        tipoEtapa: "formulario_dinamico",
        titulo: "Dados para Simulação",
        subtituloOpcional: "Informe os detalhes solicitados abaixo.",
        obrigatoria: true,
        proximaEtapaPadraoId: "etapa-contato",
        campos: [
          {
            id: "campo-item",
            rotulo: "Modelo ou Descrição",
            tipo: "texto_curto",
            obrigatorio: true,
            placeholder: "Ex.: Honda Civic Touring 2022",
          },
          {
            id: "campo-km",
            rotulo: "Quilometragem",
            tipo: "numero",
            sufixoVisual: "km",
            obrigatorio: true,
            placeholder: "Ex.: 45000",
          },
          {
            id: "campo-entrada",
            rotulo: "Valor de Entrada",
            tipo: "moeda",
            obrigatorio: false,
            placeholder: "0,00",
          },
          {
            id: "campo-debito",
            rotulo: "Possui débitos pendentes?",
            tipo: "booleano",
            obrigatorio: true,
          },
          {
            id: "campo-cambio",
            rotulo: "Tipo de Câmbio",
            tipo: "selecao_unica",
            opcoesCustomizadas: ["Automático", "Manual"],
            obrigatorio: true,
          },
        ],
      },
      {
        id: "etapa-contato",
        tipoEtapa: "coleta_contato",
        titulo: "Onde enviamos sua simulação?",
        subtituloOpcional: "Informe seus dados para contato.",
        obrigatoria: true,
      },
    ],
  };

  it("deve renderizar campos universais com rótulos, badges e inputs corretos", () => {
    render(
      <ExecutorMicrofluxoVisitante
        aberto={true}
        aoAlterarAbertura={vi.fn()}
        microfluxo={fluxoComFormularioDinamico}
        pagina={pagina}
        acervo={acervo}
      />,
    );

    // Verifica rótulo e placeholder do campo texto curto
    expect(screen.getByLabelText(/Modelo ou Descrição/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Ex.: Honda Civic Touring 2022/i),
    ).toBeInTheDocument();

    // Verifica campo número e badge do sufixo visual "km"
    expect(screen.getByLabelText(/Quilometragem/i)).toBeInTheDocument();
    expect(screen.getByText("km")).toBeInTheDocument();

    // Verifica campo moeda R$
    expect(screen.getByLabelText(/Valor de Entrada/i)).toBeInTheDocument();
    expect(screen.getByText("R$")).toBeInTheDocument();

    // Verifica botões Sim / Não para campo booleano
    expect(screen.getByRole("button", { name: /^Sim$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Não$/i })).toBeInTheDocument();

    // Verifica opções de seleção única
    expect(screen.getByRole("button", { name: /^Automático$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Manual$/i })).toBeInTheDocument();
  });

  it("deve bloquear avanço com mensagem amigável quando campo obrigatório não é preenchido", () => {
    render(
      <ExecutorMicrofluxoVisitante
        aberto={true}
        aoAlterarAbertura={vi.fn()}
        microfluxo={fluxoComFormularioDinamico}
        pagina={pagina}
        acervo={acervo}
      />,
    );

    // Tenta avançar sem preencher nada
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));

    // Deve exibir alerta informando o campo pendente
    expect(
      screen.getByText(/Por favor, preencha o campo "Modelo ou Descrição"/i),
    ).toBeInTheDocument();
  });

  it("deve permitir preencher todos os campos universais e avançar com sucesso para a próxima etapa", () => {
    render(
      <ExecutorMicrofluxoVisitante
        aberto={true}
        aoAlterarAbertura={vi.fn()}
        microfluxo={fluxoComFormularioDinamico}
        pagina={pagina}
        acervo={acervo}
      />,
    );

    // 1. Preenche campo texto
    fireEvent.change(screen.getByLabelText(/Modelo ou Descrição/i), {
      target: { value: "Toyota Corolla Altis 2023" },
    });

    // 2. Preenche campo número (KM)
    fireEvent.change(screen.getByLabelText(/Quilometragem/i), {
      target: { value: "32000" },
    });

    // 3. Preenche campo moeda
    fireEvent.change(screen.getByLabelText(/Valor de Entrada/i), {
      target: { value: "2500000" },
    });

    // 4. Seleciona booleano "Não"
    fireEvent.click(screen.getByRole("button", { name: /^Não$/i }));

    // 5. Seleciona câmbio "Automático"
    fireEvent.click(screen.getByRole("button", { name: /^Automático$/i }));

    // Avança para o próximo passo
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));

    // Deve avançar para a etapa de coleta de contato
    expect(
      screen.getByRole("heading", { name: /Onde enviamos sua simulação\?/i }),
    ).toBeInTheDocument();
  });
});

