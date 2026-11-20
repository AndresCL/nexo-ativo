import { describe, expect, it } from "vitest";
import { analisarTopologiaFunil } from "@/dominio/microfluxos/analisadorTopologiaFunil";
import type { EtapaExperienciaPainel } from "@/infraestrutura/painel/leitorDesempenhoOrganizacaoServidor";

describe("analisadorTopologiaFunil", () => {
  it("deve retornar lista vazia quando não há etapas", () => {
    const topologia = analisarTopologiaFunil([]);
    expect(topologia.nos).toHaveLength(0);
    expect(topologia.temRamificacoes).toBe(false);
  });

  it("deve mapear corretamente um fluxo 100% linear (sem ramificações)", () => {
    const etapas: EtapaExperienciaPainel[] = [
      { id: "e1", titulo: "Início", proximaEtapaPadraoId: "e2" },
      { id: "e2", titulo: "Dados Pessoais", proximaEtapaPadraoId: "e3" },
      { id: "e3", titulo: "Confirmação" },
    ];

    const topologia = analisarTopologiaFunil(etapas, "e1");

    expect(topologia.temRamificacoes).toBe(false);
    expect(topologia.nos).toHaveLength(3);
    expect(topologia.nos[0]).toEqual({ tipo: "linear", id: "e1", titulo: "Início" });
    expect(topologia.nos[1]).toEqual({ tipo: "linear", id: "e2", titulo: "Dados Pessoais" });
    expect(topologia.nos[2]).toEqual({ tipo: "linear", id: "e3", titulo: "Confirmação" });
  });

  it("deve mapear com precisão o fluxo real de financiamento da Garage 88 (diamantes sucessivos)", () => {
    const etapas: EtapaExperienciaPainel[] = [
      // 1. Decisão: Escolha do veículo
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
      // 2A. Rota Estoque
      {
        id: "etapa-catalogo",
        titulo: "Escolha o veículo para simular",
        proximaEtapaPadraoId: "etapa-tipo-entrada",
      },
      // 2B. Rota Preferências
      {
        id: "etapa-preferencias",
        titulo: "Qual veículo você procura?",
        proximaEtapaPadraoId: "etapa-tipo-entrada",
      },
      // 3. Reencontro / Decisão: Tipo de entrada
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
      // 4A. Rota Dinheiro
      {
        id: "etapa-valor-entrada",
        titulo: "Qual entrada pretende oferecer?",
        proximaEtapaPadraoId: "etapa-prazo",
      },
      // 4B. Rota Troca
      {
        id: "etapa-veiculo-troca",
        titulo: "Conte sobre o veículo da troca",
        proximaEtapaPadraoId: "etapa-prazo",
      },
      // 5. Reencontro: Prazo / Pagamento
      {
        id: "etapa-prazo",
        titulo: "Suas preferências de pagamento",
        proximaEtapaPadraoId: "etapa-contato",
      },
      // 6. Contato
      { id: "etapa-contato", titulo: "Como prefere receber o retorno?" },
    ];

    const topologia = analisarTopologiaFunil(etapas, "etapa-escolha-veiculo");

    expect(topologia.temRamificacoes).toBe(true);
    // Deve condensar a espinha dorsal em exatamente 4 nós estruturais:
    // Nó 0: Nó ramificado "Você já escolheu um veículo?"
    // Nó 1: Nó ramificado "Como pretende compor a entrada?"
    // Nó 2: Nó linear "Suas preferências de pagamento"
    // Nó 3: Nó linear "Como prefere receber o retorno?"
    expect(topologia.nos).toHaveLength(4);

    // Nó 0: Decisão do Veículo
    const no0 = topologia.nos[0]!;
    expect(no0.tipo).toBe("ramificado");
    if (no0.tipo === "ramificado") {
      expect(no0.id).toBe("etapa-escolha-veiculo");
      expect(no0.destinoReencontroId).toBe("etapa-tipo-entrada");
      expect(no0.rotas).toHaveLength(2);
      expect(no0.rotas[0]!.rotuloOpcao).toBe("Quero escolher no estoque");
      expect(no0.rotas[0]!.etapas).toEqual([
        { id: "etapa-catalogo", titulo: "Escolha o veículo para simular" },
      ]);
      expect(no0.rotas[1]!.rotuloOpcao).toBe("Quero informar o que procuro");
      expect(no0.rotas[1]!.etapas).toEqual([
        { id: "etapa-preferencias", titulo: "Qual veículo você procura?" },
      ]);
    }

    // Nó 1: Decisão da Entrada
    const no1 = topologia.nos[1]!;
    expect(no1.tipo).toBe("ramificado");
    if (no1.tipo === "ramificado") {
      expect(no1.id).toBe("etapa-tipo-entrada");
      expect(no1.destinoReencontroId).toBe("etapa-prazo");
      expect(no1.rotas).toHaveLength(3);
      expect(no1.rotas[0]!.rotuloOpcao).toBe("Em dinheiro");
      expect(no1.rotas[0]!.etapas).toEqual([
        { id: "etapa-valor-entrada", titulo: "Qual entrada pretende oferecer?" },
      ]);
      expect(no1.rotas[1]!.rotuloOpcao).toBe("Veículo na troca");
      expect(no1.rotas[1]!.etapas).toEqual([
        { id: "etapa-veiculo-troca", titulo: "Conte sobre o veículo da troca" },
      ]);
      expect(no1.rotas[2]!.rotuloOpcao).toBe("Sem entrada");
      expect(no1.rotas[2]!.etapas).toEqual([]); // Pulo direto para etapa-prazo
    }

    // Nó 2 e 3: Lineares
    expect(topologia.nos[2]).toEqual({
      tipo: "linear",
      id: "etapa-prazo",
      titulo: "Suas preferências de pagamento",
    });
    expect(topologia.nos[3]).toEqual({
      tipo: "linear",
      id: "etapa-contato",
      titulo: "Como prefere receber o retorno?",
    });
  });

  it("deve lidar com rotas assimétricas (uma rota com 2 passos e outra com 1 passo)", () => {
    const etapas: EtapaExperienciaPainel[] = [
      {
        id: "inicio",
        titulo: "Início",
        proximaEtapaPadraoId: "final",
        opcoes: [
          { id: "curto", rotulo: "Caminho Curto", proximaEtapaIdOpcional: "etapa-curta" },
          { id: "longo", rotulo: "Caminho Longo", proximaEtapaIdOpcional: "etapa-longa-1" },
        ],
      },
      { id: "etapa-curta", titulo: "Curta 1", proximaEtapaPadraoId: "final" },
      { id: "etapa-longa-1", titulo: "Longa 1", proximaEtapaPadraoId: "etapa-longa-2" },
      { id: "etapa-longa-2", titulo: "Longa 2", proximaEtapaPadraoId: "final" },
      { id: "final", titulo: "Final" },
    ];

    const topologia = analisarTopologiaFunil(etapas, "inicio");

    expect(topologia.nos).toHaveLength(2); // Nó ramificado "inicio" + Nó linear "final"
    const noInicio = topologia.nos[0]!;
    expect(noInicio.tipo).toBe("ramificado");
    if (noInicio.tipo === "ramificado") {
      expect(noInicio.rotas[0]!.etapas).toHaveLength(1);
      expect(noInicio.rotas[1]!.etapas).toHaveLength(2);
      expect(noInicio.rotas[1]!.etapas[0]!.id).toBe("etapa-longa-1");
      expect(noInicio.rotas[1]!.etapas[1]!.id).toBe("etapa-longa-2");
      expect(noInicio.destinoReencontroId).toBe("final");
    }
  });
});
