import { describe, expect, it } from "vitest";
import {
  contextualizarAcaoParaCartao,
  contextualizarAcoesParaCartao,
  type ContextoColaboradorAcao,
} from "@/dominio/editorial/contextualizadorAcoesCartao";
import type { ItemAcaoHome } from "@/dominio/entidades/paginaPublicada";

describe("Contextualizador de Ações Comerciais para Cartões Profissionais (SOLID/Clean Architecture)", () => {
  const contextoBruno: ContextoColaboradorAcao = {
    nomeCompleto: "Bruno Silva",
    primeiroNome: "Bruno",
    cargoOuEspecialidade: "Consultor de Vendas & Feirão Acelera",
    whatsapp: "5522981038549",
    nomeOrganizacao: "Garage 88",
  };

  it("deve contextualizar a simulação de financiamento para o atendimento pessoal do colaborador", () => {
    const acaoOriginal: ItemAcaoHome = {
      id: "acao-simular",
      rotulo: "Simular financiamento",
      subtituloDiscreto: "Consulte as condições disponíveis",
      tipoDestino: "microfluxo",
      destino: "#fluxo-financiamento",
    };

    const contextualizada = contextualizarAcaoParaCartao(acaoOriginal, contextoBruno);

    expect(contextualizada.rotulo).toBe("Simular financiamento");
    expect(contextualizada.subtituloDiscreto).toBe("Faça uma simulação com meu atendimento");
    expect(contextualizada.destino).toBe("#fluxo-financiamento");
    expect(contextualizada.tipoDestino).toBe("microfluxo");
  });

  it("deve contextualizar a visualização de estoque e catálogo para a empresa do consultor", () => {
    const acaoOriginal: ItemAcaoHome = {
      id: "acao-estoque",
      rotulo: "Ver estoque completo",
      subtituloDiscreto: "Acesse os veículos da Garage 88",
      tipoDestino: "link_externo",
      destino: "https://garage88.com.br",
    };

    const contextualizada = contextualizarAcaoParaCartao(acaoOriginal, contextoBruno);

    expect(contextualizada.rotulo).toBe("Ver estoque completo");
    expect(contextualizada.subtituloDiscreto).toBe("Confira os veículos da Garage 88");
  });

  it("deve contextualizar a avaliação de veículo usado para envio direto ao consultor", () => {
    const acaoOriginal: ItemAcaoHome = {
      id: "acao-usado",
      rotulo: "Avaliar meu usado",
      subtituloDiscreto: "Venda seu carro ou utilize na troca",
      tipoDestino: "microfluxo",
      destino: "#fluxo-atendimento",
    };

    const contextualizada = contextualizarAcaoParaCartao(acaoOriginal, contextoBruno);

    expect(contextualizada.rotulo).toBe("Avaliar meu usado");
    expect(contextualizada.subtituloDiscreto).toBe("Envie os dados do seu carro para avaliação");
  });

  it("deve contextualizar a cotação de seguro para atendimento pessoal", () => {
    const acaoOriginal: ItemAcaoHome = {
      id: "acao-seguro",
      rotulo: "Cotar seguro",
      subtituloDiscreto: "Solicite uma cotação para seu veículo",
      tipoDestino: "microfluxo",
      destino: "#fluxo-diagnostico",
    };

    const contextualizada = contextualizarAcaoParaCartao(acaoOriginal, contextoBruno);

    expect(contextualizada.rotulo).toBe("Cotar seguro");
    expect(contextualizada.subtituloDiscreto).toBe("Solicite uma cotação de seguro");
  });

  it("deve contextualizar o contato da equipe para o WhatsApp direto do consultor", () => {
    const acaoOriginal: ItemAcaoHome = {
      id: "acao-equipe",
      rotulo: "Falar com nossa equipe",
      subtituloDiscreto: "Entre em contato com um consultor",
      tipoDestino: "microfluxo",
      destino: "#fluxo-profissional",
    };

    const contextualizada = contextualizarAcaoParaCartao(acaoOriginal, contextoBruno);

    expect(contextualizada.rotulo).toBe("Falar comigo no WhatsApp");
    expect(contextualizada.subtituloDiscreto).toBe("Atendimento direto com Bruno Silva");
  });

  it("deve respeitar sobrescritas manuais explícitas interpolando variáveis de template", () => {
    const acaoComSobrescrita: ItemAcaoHome = {
      id: "acao-personalizada",
      rotulo: "Fale com nossos advogados",
      subtituloDiscreto: "Agende sua consulta",
      rotuloCartaoOpcional: "Falar com {primeiroNome}",
      subtituloCartaoOpcional: "Assessoria jurídica direta com {nome} na {empresa}",
      tipoDestino: "microfluxo",
      destino: "#fluxo-profissional",
    };

    const contextualizada = contextualizarAcaoParaCartao(acaoComSobrescrita, contextoBruno);

    expect(contextualizada.rotulo).toBe("Falar com Bruno");
    expect(contextualizada.subtituloDiscreto).toBe(
      "Assessoria jurídica direta com Bruno Silva na Garage 88",
    );
  });

  it("deve preservar intactas ações genéricas sem regras específicas (compatibilidade multi-empresa)", () => {
    const acaoGenerica: ItemAcaoHome = {
      id: "acao-politica",
      rotulo: "Termos & Garantia",
      subtituloDiscreto: "Consulte o manual de garantia",
      tipoDestino: "link_externo",
      destino: "https://garage88.com.br/garantia",
    };

    const contextualizada = contextualizarAcaoParaCartao(acaoGenerica, contextoBruno);

    expect(contextualizada.rotulo).toBe("Termos & Garantia");
    expect(contextualizada.subtituloDiscreto).toBe("Consulte o manual de garantia");
  });

  it("deve processar uma lista inteira de ações preservando a ordem e integridade dos ids", () => {
    const acoes: ItemAcaoHome[] = [
      {
        id: "a-1",
        rotulo: "Simular financiamento",
        subtituloDiscreto: "Consulte as condições disponíveis",
        tipoDestino: "microfluxo",
        destino: "#fluxo-financiamento",
      },
      {
        id: "a-2",
        rotulo: "Ver estoque completo",
        subtituloDiscreto: "Acesse os veículos da Garage 88",
        tipoDestino: "link_externo",
        destino: "https://garage88.com.br",
      },
    ];

    const resultado = contextualizarAcoesParaCartao(acoes, contextoBruno);

    expect(resultado).toHaveLength(2);
    expect(resultado[0]!.id).toBe("a-1");
    expect(resultado[0]!.subtituloDiscreto).toBe("Faça uma simulação com meu atendimento");
    expect(resultado[1]!.id).toBe("a-2");
    expect(resultado[1]!.subtituloDiscreto).toBe("Confira os veículos da Garage 88");
  });
});
