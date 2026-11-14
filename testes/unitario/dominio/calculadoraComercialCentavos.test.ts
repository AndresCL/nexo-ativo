import { describe, expect, it } from "vitest";
import {
  calcularDemonstrativoComercialMicrofluxo,
  validarRegraCalculoComercial,
} from "@/dominio/comercial/calculadoraComercialCentavos";
import { criarMicrofluxoPadraoParaTestes } from "../../fixtures/geradoresMicrofluxoTeste";
import {
  atualizarRespostasExecucaoMicrofluxo,
  avancarEtapaExecucaoMicrofluxo,
  criarEstadoExecucaoMicrofluxo,
} from "@/dominio/microfluxos/motorExecucaoMicrofluxo";
import { CATALOGO_ACERVOS_DEMONSTRACAO } from "../../fixtures/dadosExemploVitrine";

describe("Calculadora Comercial Determinística em Centavos e Preservação Histórica", () => {
  const acervoShowroom = CATALOGO_ACERVOS_DEMONSTRACAO["lumina-arquitetura-luz"]!;

  it("deve calcular exatamente Valor Fixo em centavos a partir do item de catálogo selecionado", () => {
    const fluxo = {
      ...criarMicrofluxoPadraoParaTestes({
        organizacaoId: "org-1",
        nomeOrganizacao: "Lumina Arquitetura & Luz",
        modelo: "atendimento",
      }),
      regraCalculoComercial: {
        modalidade: "valor_fixo" as const,
        rotuloBase: "Consultoria base",
        valorBaseCentavos: 150000,
      },
    };

    const estado = criarEstadoExecucaoMicrofluxo(fluxo, {
      servicoPreSelecionadoId: "srv-lumina-1",
    });

    const demonstrativo = calcularDemonstrativoComercialMicrofluxo({
      microfluxo: fluxo,
      respostas: estado.respostas,
      acervo: acervoShowroom,
    });

    expect(demonstrativo).not.toBeNull();
    expect(demonstrativo?.modalidade).toBe("valor_fixo");
    expect(demonstrativo?.totalCentavos).toBe(350000);
    expect(demonstrativo?.resumoFormatado).toBe("R$ 3.500,00");
  });

  it("deve somar Valor Base + Adicionais selecionados sem imprecisão de ponto flutuante", () => {
    const fluxoPlanejar = criarMicrofluxoPadraoParaTestes({
      organizacaoId: "org-1",
      nomeOrganizacao: "Veloce Motors",
      modelo: "financiamento",
    });

    let estado = criarEstadoExecucaoMicrofluxo(fluxoPlanejar);
    estado = atualizarRespostasExecucaoMicrofluxo(estado, {
      opcoesMultiplasPorEtapa: {
        "etapa-prioridades": ["item-concepcao", "item-detalhamento"],
      },
    });

    const demonstrativo = calcularDemonstrativoComercialMicrofluxo({
      microfluxo: fluxoPlanejar,
      respostas: estado.respostas,
      acervo: acervoShowroom,
    });

    // Base (240.000) + Concepção (180.000) + Detalhamento (420.000) = 840.000 centavos (R$ 8.400,00)
    expect(demonstrativo?.modalidade).toBe("base_mais_adicionais");
    expect(demonstrativo?.totalCentavos).toBe(840000);
    expect(demonstrativo?.linhas).toHaveLength(3);
    expect(demonstrativo?.resumoFormatado).toBe("R$ 8.400,00");
  });

  it("deve multiplicar Quantidade × Preço Unitário em centavos inteiros", () => {
    const fluxoExplorar = criarMicrofluxoPadraoParaTestes({
      organizacaoId: "org-1",
      nomeOrganizacao: "AutoVeloce Showroom",
      modelo: "catalogo",
    });

    let estado = criarEstadoExecucaoMicrofluxo(fluxoExplorar);
    estado = atualizarRespostasExecucaoMicrofluxo(estado, {
      produtoSelecionadoId: "prd-lumina-1", // 485.000 centavos (R$ 4.850,00)
      quantidadeComercial: 2,
    });

    const demonstrativo = calcularDemonstrativoComercialMicrofluxo({
      microfluxo: fluxoExplorar,
      respostas: estado.respostas,
      acervo: acervoShowroom,
    });

    expect(demonstrativo?.modalidade).toBe("quantidade_vezes_preco");
    expect(demonstrativo?.totalCentavos).toBe(970000);
    expect(demonstrativo?.resumoFormatado).toBe("R$ 9.700,00");
  });

  it("deve calcular Faixa Configurada (mínimo e máximo) e rejeitar faixa invertida", () => {
    expect(() =>
      validarRegraCalculoComercial({
        modalidade: "faixa_configurada",
        minimoFaixaCentavos: 500000,
        maximoFaixaCentavos: 200000,
      }),
    ).toThrow(/não pode ser inferior ao valor mínimo/i);

    const fluxoPlanejarFaixa = {
      ...criarMicrofluxoPadraoParaTestes({
        organizacaoId: "org-1",
        nomeOrganizacao: "Veloce Motors",
        modelo: "financiamento",
      }),
      regraCalculoComercial: {
        modalidade: "faixa_configurada" as const,
        rotuloBase: "Estimativa de projeto",
        minimoFaixaCentavos: 1200000,
        maximoFaixaCentavos: 1800000,
      },
    };

    let estado = criarEstadoExecucaoMicrofluxo(fluxoPlanejarFaixa);
    estado = atualizarRespostasExecucaoMicrofluxo(estado, {
      opcoesMultiplasPorEtapa: {
        "etapa-prioridades": ["item-concepcao"], // + 180.000 centavos
      },
    });

    const demonstrativo = calcularDemonstrativoComercialMicrofluxo({
      microfluxo: fluxoPlanejarFaixa,
      respostas: estado.respostas,
      acervo: acervoShowroom,
    });

    expect(demonstrativo?.minimoCentavos).toBe(1380000);
    expect(demonstrativo?.maximoCentavos).toBe(1980000);
    expect(demonstrativo?.resumoFormatado).toBe("De R$ 13.800,00 a R$ 19.800,00");
  });

  it("deve congelar snapshot histórico imutável na conclusão do microfluxo mesmo se o catálogo mudar depois", () => {
    const fluxoExplorar = {
      ...criarMicrofluxoPadraoParaTestes({
        organizacaoId: "org-1",
        nomeOrganizacao: "Lumina Arquitetura & Luz",
        modelo: "catalogo",
      }),
      versaoPublicada: 3,
    };

    let estado = criarEstadoExecucaoMicrofluxo(fluxoExplorar, {
      produtoPreSelecionadoId: "prd-lumina-1", // pula para etapa-contato
    });
    estado = atualizarRespostasExecucaoMicrofluxo(estado, {
      quantidadeComercial: 2,
      contatoVisitante: {
        nomeCompleto: "Beatriz Lemos",
        telefoneOuWhatsapp: "21999887766",
      },
    });

    const estadoConcluido = avancarEtapaExecucaoMicrofluxo(estado, acervoShowroom);
    expect(estadoConcluido.concluido).toBe(true);

    const congelado = estadoConcluido.demonstrativoComercialCongelado;
    expect(congelado).toBeDefined();
    expect(Object.isFrozen(congelado)).toBe(true);
    expect(congelado?.totalCentavos).toBe(970000);
    expect(congelado?.versaoMicrofluxo).toBe(3);

    // Simula alteração futura de preço no catálogo da organização
    const acervoFuturoAlterado = {
      ...acervoShowroom,
      produtos: acervoShowroom.produtos.map((p) =>
        p.id === "prd-lumina-1" ? { ...p, precoCentavos: 500000 } : p,
      ),
    };

    // O novo cálculo reflete o novo preço, mas o snapshot histórico congelado permanece intacto!
    const calculoNovo = calcularDemonstrativoComercialMicrofluxo({
      microfluxo: fluxoExplorar,
      respostas: estadoConcluido.respostas,
      acervo: acervoFuturoAlterado,
    });
    expect(calculoNovo?.totalCentavos).toBe(1000000);
    expect(estadoConcluido.demonstrativoComercialCongelado?.totalCentavos).toBe(970000);
  });
});
