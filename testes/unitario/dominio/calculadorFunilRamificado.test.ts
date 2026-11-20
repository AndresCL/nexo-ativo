import { describe, expect, it } from "vitest";
import { analisarTopologiaFunil } from "@/dominio/microfluxos/analisadorTopologiaFunil";
import { calcularEstagiosFunilRamificado } from "@/dominio/analytics/calculadorFunilRamificado";
import type { EtapaExperienciaPainel } from "@/infraestrutura/painel/leitorDesempenhoOrganizacaoServidor";

describe("calculadorFunilRamificado (Padrão 1 Seguro)", () => {
  it("calcula corretamente um fluxo linear simples", () => {
    const etapas: EtapaExperienciaPainel[] = [
      { id: "e1", titulo: "Início", proximaEtapaPadraoId: "e2" },
      { id: "e2", titulo: "Formulário", proximaEtapaPadraoId: "e3" },
      { id: "e3", titulo: "Contato" },
    ];

    const topologia = analisarTopologiaFunil(etapas, "e1");

    const estagios = calcularEstagiosFunilRamificado({
      topologia,
      topo: 100,
      conclusoes: 20,
      metricasEtapas: { e2: 60, e3: 30 },
      tituloMicrofluxo: "Fluxo Simples",
    });

    expect(estagios).toHaveLength(4); // 3 etapas + conclusão
    expect(estagios[0]!.volume).toBe(100);
    expect(estagios[0]!.percentualSobreTopo).toBe(100);

    expect(estagios[1]!.volume).toBe(60);
    expect(estagios[1]!.percentualSobreTopo).toBe(60);

    expect(estagios[2]!.volume).toBe(30);
    expect(estagios[2]!.percentualSobreTopo).toBe(30);

    expect(estagios[3]!.volume).toBe(20);
    expect(estagios[3]!.percentualSobreTopo).toBe(20);
  });

  it("elimina o vácuo de zero e o falso gargalo de 100% no fluxo real de financiamento", () => {
    const etapas: EtapaExperienciaPainel[] = [
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
        proximaEtapaPadraoId: "etapa-prazo",
        opcoes: [
          { id: "dinheiro", rotulo: "Em dinheiro", proximaEtapaIdOpcional: "etapa-valor-entrada" },
          {
            id: "troca",
            rotulo: "Veículo na troca",
            proximaEtapaIdOpcional: "etapa-veiculo-troca",
          },
          { id: "sem-entrada", rotulo: "Sem entrada", proximaEtapaIdOpcional: "etapa-prazo" },
        ],
      },
      {
        id: "etapa-valor-entrada",
        titulo: "Qual entrada pretende oferecer?",
        proximaEtapaPadraoId: "etapa-prazo",
      },
      {
        id: "etapa-veiculo-troca",
        titulo: "Conte sobre o veículo da troca",
        proximaEtapaPadraoId: "etapa-prazo",
      },
      {
        id: "etapa-prazo",
        titulo: "Suas preferências de pagamento",
        proximaEtapaPadraoId: "etapa-contato",
      },
      { id: "etapa-contato", titulo: "Como prefere receber o retorno?" },
    ];

    const topologia = analisarTopologiaFunil(etapas, "etapa-escolha-veiculo");

    // Cenário real exato relatado pelo usuário:
    // Topo: 38
    // etapa-preferencias: 2
    // etapa-tipo-entrada: 2
    // etapa-catalogo: 0 (ou sem registros)
    // Conclusões: 7
    const estagios = calcularEstagiosFunilRamificado({
      topologia,
      topo: 38,
      conclusoes: 7,
      metricasEtapas: {
        "etapa-preferencias": 2,
        "etapa-tipo-entrada": 2,
      },
      tituloMicrofluxo: "Simular financiamento com taxa 1,19%!",
    });

    // 4 nós topológicos + 1 nó de conclusão = 5 estágios
    expect(estagios).toHaveLength(5);

    // Estágio 1: Decisão do Veículo (Ramificado)
    const estagio1 = estagios[0]!;
    expect(estagio1.tipo).toBe("ramificado");
    expect(estagio1.volume).toBe(38);
    expect(estagio1.percentualSobreTopo).toBe(100);

    if (estagio1.tipo === "ramificado") {
      // Duas rotas mapeadas
      expect(estagio1.rotas).toHaveLength(2);
      // Rota Estoque (0 acessos)
      expect(estagio1.rotas[0]!.rotuloOpcao).toBe("Quero escolher no estoque");
      expect(estagio1.rotas[0]!.volume).toBe(0);
      expect(estagio1.rotas[0]!.percentualSobreTopo).toBe(0);

      // Rota Preferências (2 acessos)
      expect(estagio1.rotas[1]!.rotuloOpcao).toBe("Quero informar o que procuro");
      expect(estagio1.rotas[1]!.volume).toBe(2);
      expect(estagio1.rotas[1]!.percentualSobreTopo).toBe(5.3);

      // Desistências na decisão: 38 - (0 + 2) = 36 desistências (94.7%)
      // JAMAIS 38 desistências no estoque!
      expect(estagio1.desistenciasNaDecisao).toBe(36);
      expect(estagio1.percentualDesistenciaDecisao).toBe(94.7);
    }

    // Estágio 2: Decisão da Entrada (Ramificado)
    const estagio2 = estagios[1]!;
    expect(estagio2.tipo).toBe("ramificado");
    expect(estagio2.volume).toBe(2);
    expect(estagio2.percentualSobreTopo).toBe(5.3);

    // Estágio Final: Conclusão
    const estagioFinal = estagios[4]!;
    expect(estagioFinal.id).toBe("conclusao-final");
    expect(estagioFinal.volume).toBe(7);
    expect(estagioFinal.percentualSobreTopo).toBe(18.4);
  });
});
