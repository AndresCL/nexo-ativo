import { describe, expect, it } from "vitest";
import { CalculadorMetricasCRO } from "@/dominio/analytics/calculadorMetricasCRO";
import type { EntradaDadosMetricasCRO } from "@/dominio/analytics/tiposMetricasCRO";

describe("CalculadorMetricasCRO", () => {
  // Caso de exemplo da concessionária citado pelo usuário:
  // 1.000 visitantes -> 150 cliques -> 100 contatos -> 40 qualificados -> 8 vendas
  const casoConcessionaria: EntradaDadosMetricasCRO = {
    visitantesOuSessoes: 1000,
    cliquesAcaoTotais: 150,
    contatosUnicos: 100,
    leadsQualificados: 40,
    vendasConcluidas: 8,
  };

  it("calcula o CTR corretamente com base no exemplo da concessionária (15%)", () => {
    const ctr = CalculadorMetricasCRO.calcularCTR(
      casoConcessionaria.cliquesAcaoTotais,
      casoConcessionaria.visitantesOuSessoes,
    );

    expect(ctr.valorPercentual).toBe(15);
    expect(ctr.numerador).toBe(150);
    expect(ctr.denominador).toBe(1000);
    expect(ctr.rotuloFormula).toBe("150 cliques / 1.000 exposições");
  });

  it("calcula o CVR a contato corretamente (10%)", () => {
    const cvr = CalculadorMetricasCRO.calcularCVRContato(
      casoConcessionaria.contatosUnicos,
      casoConcessionaria.visitantesOuSessoes,
    );

    expect(cvr.valorPercentual).toBe(10);
    expect(cvr.numerador).toBe(100);
    expect(cvr.denominador).toBe(1000);
    expect(cvr.rotuloFormula).toBe("100 contatos / 1.000 visitantes");
  });

  it("calcula a taxa de leads qualificados sobre contatos (40%)", () => {
    const qualificados = CalculadorMetricasCRO.calcularTaxaLeadsQualificados(
      casoConcessionaria.leadsQualificados,
      casoConcessionaria.contatosUnicos,
    );

    expect(qualificados.valorPercentual).toBe(40);
    expect(qualificados.numerador).toBe(40);
    expect(qualificados.denominador).toBe(100);
    expect(qualificados.rotuloFormula).toBe("40 qualificados / 100 contatos");
  });

  it("calcula a conversão a venda sobre contatos (8%) e sobre visitantes (0.8%)", () => {
    const vendaSobreContatos = CalculadorMetricasCRO.calcularConversaoVendaSobreContatos(
      casoConcessionaria.vendasConcluidas,
      casoConcessionaria.contatosUnicos,
    );
    expect(vendaSobreContatos.valorPercentual).toBe(8);
    expect(vendaSobreContatos.rotuloFormula).toBe("8 vendas / 100 contatos");

    const vendaSobreVisitantes = CalculadorMetricasCRO.calcularConversaoVendaSobreVisitantes(
      casoConcessionaria.vendasConcluidas,
      casoConcessionaria.visitantesOuSessoes,
    );
    expect(vendaSobreVisitantes.valorPercentual).toBe(0.8);
    expect(vendaSobreVisitantes.rotuloFormula).toBe("8 vendas / 1.000 visitantes");
  });

  it("consolida o resumo completo com proteção contra divisão por zero", () => {
    const dadosVazios: EntradaDadosMetricasCRO = {
      visitantesOuSessoes: 0,
      cliquesAcaoTotais: 0,
      contatosUnicos: 0,
      leadsQualificados: 0,
      vendasConcluidas: 0,
    };

    const resumo = CalculadorMetricasCRO.consolidarResumo(dadosVazios);

    expect(resumo.ctr.valorPercentual).toBe(0);
    expect(resumo.cvrContato.valorPercentual).toBe(0);
    expect(resumo.taxaLeadsQualificados.valorPercentual).toBe(0);
    expect(resumo.conversaoVendaSobreContatos.valorPercentual).toBe(0);
    expect(resumo.conversaoVendaSobreVisitantes.valorPercentual).toBe(0);
  });

  it("constrói os 5 estágios do funil visual CRO com as retenções passo a passo", () => {
    const etapas = CalculadorMetricasCRO.construirEtapasFunil(casoConcessionaria);

    expect(etapas).toHaveLength(5);

    // 1. Visitantes
    expect(etapas[0].id).toBe("visitantes");
    expect(etapas[0].volume).toBe(1000);
    expect(etapas[0].percentualSobreTopo).toBe(100);

    // 2. Cliques de Ação (150 de 1000 = 15%)
    expect(etapas[1].id).toBe("interacoes");
    expect(etapas[1].volume).toBe(150);
    expect(etapas[1].percentualSobreTopo).toBe(15);
    expect(etapas[1].percentualSobreEtapaAnterior).toBe(15);

    // 3. Contatos Gerados (100 de 150 cliques = 66.7%)
    expect(etapas[2].id).toBe("contatos");
    expect(etapas[2].volume).toBe(100);
    expect(etapas[2].percentualSobreTopo).toBe(10);
    expect(etapas[2].percentualSobreEtapaAnterior).toBe(66.7);

    // 4. Leads Qualificados (40 de 100 contatos = 40%)
    expect(etapas[3].id).toBe("qualificados");
    expect(etapas[3].volume).toBe(40);
    expect(etapas[3].percentualSobreTopo).toBe(4);
    expect(etapas[3].percentualSobreEtapaAnterior).toBe(40);

    // 5. Vendas Fechadas (8 de 40 qualificados = 20%, e 8 de 1000 = 0.8%)
    expect(etapas[4].id).toBe("vendas");
    expect(etapas[4].volume).toBe(8);
    expect(etapas[4].percentualSobreTopo).toBe(0.8);
    expect(etapas[4].percentualSobreEtapaAnterior).toBe(20);
  });
});

