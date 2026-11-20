import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DiagramaFunilCRO } from "@/componentes/painel/desempenho/funil/DiagramaFunilCRO";
import type { ResumoMetricasPeriodo } from "@/dominio/analytics/tiposMetricasAgregadas";
import { CalculadorMetricasCRO } from "@/dominio/analytics/calculadorMetricasCRO";

describe("DiagramaFunilCRO e ConectorAbandonoFunil", () => {
  const metricasCRO = CalculadorMetricasCRO.consolidarResumo({
    visitantesOuSessoes: 1000,
    cliquesAcaoTotais: 150,
    contatosUnicos: 100,
    leadsQualificados: 40,
    vendasConcluidas: 8,
  });

  const resumoMetricasMock: ResumoMetricasPeriodo = {
    totalVisitantesUnicos: 1000,
    totalInteracoesExperiencias: 150,
    totalContatosIniciados: 100,
    totalLeadsQualificados: 40,
    totalVendasConcluidas: 8,
    totalAberturasMicrofluxo: 19,
    totalConclusoesMicrofluxo: 11,
    totalCliquesWhatsapp: 0,
    totalAberturasPermalink: 15,
    metricasPorCanal: [],
    metricasPorMicrofluxo: [
      {
        id: "fluxo-agendamento",
        titulo: "Agendar serviço",
        aberturas: 19,
        conclusoes: 11,
        aberturasPermalink: 15,
        porEtapa: {},
      },
    ],
    metricasPorQrCode: [],
    metricasPorProfissional: [],
    metricasCRO,
  };

  it("renderiza o funil global com conectores de abandono e identifica o maior gargalo", () => {
    render(
      <DiagramaFunilCRO
        resumoMetricas={resumoMetricasMock}
        experiencias={[{ id: "fluxo-agendamento", titulo: "Agendar serviço" }]}
      />,
    );

    // Deve exibir os 5 estágios globais
    expect(screen.getByText("1. Audiência & Visitantes")).toBeInTheDocument();
    expect(screen.getByText("2. Cliques de Ação (CTR)")).toBeInTheDocument();
    expect(screen.getByText("3. Contatos Gerados (CVR)")).toBeInTheDocument();
    expect(screen.getByText("4. Leads Qualificados")).toBeInTheDocument();
    expect(screen.getByText("5. Vendas Fechadas")).toBeInTheDocument();

    // Deve renderizar os conectores de desistência entre as etapas
    expect(screen.getByLabelText("850 desistências entre as etapas")).toBeInTheDocument();
    expect(screen.getByText(/desistências \(85%\)/i)).toBeInTheDocument();

    // O maior gargalo de perda absoluta (850) deve receber o destaque de Maior gargalo!
    expect(screen.getByText("Maior gargalo!")).toBeInTheDocument();
  });

  it("renderiza todas as etapas cadastradas de qualquer fluxo individual e o abandono exato entre elas", () => {
    render(
      <DiagramaFunilCRO
        resumoMetricas={resumoMetricasMock}
        experiencias={[
          {
            id: "fluxo-agendamento",
            titulo: "Agendar serviço",
            etapas: [
              { id: "etapa-veiculo", titulo: "Você já escolheu um veículo?" },
              { id: "etapa-simular", titulo: "Escolha o veículo para simular" },
              { id: "etapa-contato", titulo: "Dados de Contato" },
            ],
          },
        ]}
      />,
    );

    // Seleciona a experiência
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "fluxo-agendamento" },
    });

    // 1. Início: Você já escolheu um veículo? (19 iniciaram)
    expect(screen.getByText("1. Início: Você já escolheu um veículo?")).toBeInTheDocument();
    expect(screen.getByText("19")).toBeInTheDocument();

    // 2. Escolha o veículo para simular (11 alcançaram)
    expect(screen.getByText("2. Escolha o veículo para simular")).toBeInTheDocument();

    // 3. Dados de Contato (11 alcançaram)
    expect(screen.getByText("3. Dados de Contato")).toBeInTheDocument();

    // 4. Propostas Concluídas (11)
    expect(screen.getByText("4. Propostas Concluídas (CVR)")).toBeInTheDocument();

    // Conector de abandono entre Etapa 1 e Etapa 2 exibindo exatamente os 8 que desistiram na 1ª tela!
    expect(screen.getByLabelText("8 desistências entre as etapas")).toBeInTheDocument();
    expect(screen.getByText(/desistências \(42\.1%\)/i)).toBeInTheDocument();
    expect(screen.getByText("Maior gargalo!")).toBeInTheDocument();

    // Atribuição de origem visível abaixo
    expect(screen.getByText(/Atribuição de Origem das 19 Aberturas/i)).toBeInTheDocument();
    expect(screen.getByText(/15 acessos \(78\.9%\)/i)).toBeInTheDocument();
  });

  it("renderiza etapas intermediárias reais quando há telemetria por etapa registrada", () => {
    const resumoComTelemetriaEtapas: ResumoMetricasPeriodo = {
      ...resumoMetricasMock,
      metricasPorMicrofluxo: [
        {
          id: "fluxo-financiamento",
          titulo: "Simular financiamento com taxa 1,19%!",
          aberturas: 33,
          conclusoes: 7,
          aberturasPermalink: 10,
          porEtapa: {
            "etapa-simular": 26,
            "etapa-contato": 15,
          },
        },
      ],
    };

    render(
      <DiagramaFunilCRO
        resumoMetricas={resumoComTelemetriaEtapas}
        experiencias={[
          {
            id: "fluxo-financiamento",
            titulo: "Simular financiamento com taxa 1,19%!",
            etapas: [
              { id: "etapa-veiculo", titulo: "Você já escolheu um veículo?" },
              { id: "etapa-simular", titulo: "Escolha o veículo para simular" },
              { id: "etapa-contato", titulo: "Dados de Contato" },
            ],
          },
        ]}
      />,
    );

    // Seleciona o percurso
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "fluxo-financiamento" },
    });

    // 1. Início: Você já escolheu um veículo? (33)
    expect(screen.getByText("1. Início: Você já escolheu um veículo?")).toBeInTheDocument();
    // 2. Escolha o veículo para simular (26)
    expect(screen.getByText("2. Escolha o veículo para simular")).toBeInTheDocument();
    // 3. Dados de Contato (15)
    expect(screen.getByText("3. Dados de Contato")).toBeInTheDocument();
    // 4. Propostas Concluídas (CVR) (7)
    expect(screen.getByText("4. Propostas Concluídas (CVR)")).toBeInTheDocument();

    // Drop-offs:
    // 33 -> 26: 7 abandonos (21.2%)
    expect(screen.getByLabelText("7 desistências entre as etapas")).toBeInTheDocument();
    // 26 -> 15: 11 abandonos (42.3%) -> Maior gargalo!
    expect(screen.getByLabelText("11 desistências entre as etapas")).toBeInTheDocument();
    // 15 -> 7: 8 abandonos (53.3%)
    expect(screen.getByLabelText("8 desistências entre as etapas")).toBeInTheDocument();
  });

  it("renderiza percurso sem etapas cadastradas usando Início e Conclusão limpos", () => {
    render(
      <DiagramaFunilCRO
        resumoMetricas={resumoMetricasMock}
        experiencias={[
          {
            id: "fluxo-agendamento",
            titulo: "Agendar serviço",
            etapas: [],
          },
        ]}
      />,
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "fluxo-agendamento" },
    });

    expect(screen.getByText("1. Aberturas do Percurso")).toBeInTheDocument();
    expect(screen.getByText("2. Propostas Concluídas (CVR)")).toBeInTheDocument();
    expect(screen.getByLabelText("8 desistências entre as etapas")).toBeInTheDocument();
  });

  it("renderiza nós ramificados com distribuição de rotas sem falsos gargalos no Padrão 1 Seguro", () => {
    const resumoGarage88: ResumoMetricasPeriodo = {
      ...resumoMetricasMock,
      metricasPorMicrofluxo: [
        {
          id: "fluxo-financiamento",
          titulo: "Simular financiamento com taxa 1,19%!",
          aberturas: 38,
          conclusoes: 7,
          aberturasPermalink: 3,
          porEtapa: {
            "etapa-preferencias": 2,
            "etapa-tipo-entrada": 2,
          },
        },
      ],
    };

    render(
      <DiagramaFunilCRO
        resumoMetricas={resumoGarage88}
        experiencias={[
          {
            id: "fluxo-financiamento",
            titulo: "Simular financiamento com taxa 1,19%!",
            etapaInicialId: "etapa-escolha-veiculo",
            etapas: [
              {
                id: "etapa-escolha-veiculo",
                titulo: "Você já escolheu um veículo?",
                proximaEtapaPadraoId: "etapa-tipo-entrada",
                opcoes: [
                  {
                    id: "estoque",
                    rotulo: "Quero escolher no estoque",
                    proximaEtapaIdOpcional: "etapa-catalogo",
                  },
                  {
                    id: "preferencias",
                    rotulo: "Quero informar o que procuro",
                    proximaEtapaIdOpcional: "etapa-preferencias",
                  },
                ],
              },
              {
                id: "etapa-catalogo",
                titulo: "Escolha o veículo para simular",
                proximaEtapaPadraoId: "etapa-tipo-entrada",
              },
              {
                id: "etapa-preferencias",
                titulo: "Qual veículo você procura?",
                proximaEtapaPadraoId: "etapa-tipo-entrada",
              },
              {
                id: "etapa-tipo-entrada",
                titulo: "Como pretende compor a entrada?",
                proximaEtapaPadraoId: "etapa-contato",
              },
              { id: "etapa-contato", titulo: "Como prefere receber o retorno?" },
            ],
          },
        ]}
      />,
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "fluxo-financiamento" },
    });

    // 1. Início: Você já escolheu um veículo? (38)
    expect(screen.getByText("1. Início: Você já escolheu um veículo?")).toBeInTheDocument();
    expect(screen.getByText("38")).toBeInTheDocument();
    expect(screen.getAllByText("Decisão de Rota").length).toBeGreaterThan(0);

    // As rotas aparecem dentro da decisão
    expect(screen.getByText("Quero escolher no estoque")).toBeInTheDocument();
    expect(screen.getByText("Quero informar o que procuro")).toBeInTheDocument();

    // Desistências na decisão: 38 - (0 + 2) = 36 desistências (94.7%)
    expect(screen.getByLabelText("36 desistências entre as etapas")).toBeInTheDocument();

    // 2. Como pretende compor a entrada? (2)
    expect(screen.getByText("2. Como pretende compor a entrada?")).toBeInTheDocument();

    // Conclusões finais (7)
    expect(screen.getByText("4. Propostas Concluídas (CVR)")).toBeInTheDocument();
  });
});
