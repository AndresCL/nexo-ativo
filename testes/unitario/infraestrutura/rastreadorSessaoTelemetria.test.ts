import { describe, expect, it } from "vitest";
import {
  RastreadorSessaoTelemetria,
  type ArmazenamentoSessaoTelemetria,
} from "@/infraestrutura/analytics/rastreadorSessaoTelemetria";
import { CalculadorMetricasCRO } from "@/dominio/analytics/calculadorMetricasCRO";
import { consolidarResumoMetricas } from "@/dominio/analytics/tiposMetricasAgregadas";

function criarArmazenamentoMemoria(): ArmazenamentoSessaoTelemetria {
  const mapa = new Map<string, string>();
  return {
    getItem: (chave) => mapa.get(chave) ?? null,
    setItem: (chave, valor) => {
      mapa.set(chave, valor);
    },
  };
}

describe("RastreadorSessaoTelemetria", () => {
  it("marca apenas a primeira visualização e o primeiro clique por organização e dia", () => {
    const armazenamento = criarArmazenamentoMemoria();
    let dataAtual = "2026-11-24";
    const rastreador = new RastreadorSessaoTelemetria({
      obterArmazenamento: () => armazenamento,
      obterDataIso: () => dataAtual,
    });

    const vis1 = rastreador.enriquecerComSinaisSessao({
      organizacaoId: "org-1",
      tipoEvento: "visualizacao_vitrine",
    });
    const vis2 = rastreador.enriquecerComSinaisSessao({
      organizacaoId: "org-1",
      tipoEvento: "visualizacao_cartao",
    });
    const clk1 = rastreador.enriquecerComSinaisSessao({
      organizacaoId: "org-1",
      tipoEvento: "clique_acao_home",
    });
    const clk2 = rastreador.enriquecerComSinaisSessao({
      organizacaoId: "org-1",
      tipoEvento: "clique_whatsapp",
    });

    expect(vis1.primeiraVisualizacaoSessao).toBe(true);
    expect(vis2.primeiraVisualizacaoSessao).toBeUndefined();
    expect(clk1.primeiroCliqueSessao).toBe(true);
    expect(clk2.primeiroCliqueSessao).toBeUndefined();

    // Na virada de data UTC, volta a contar como primeira interação do novo dia
    dataAtual = "2026-11-25";
    const visDiaSeguinte = rastreador.enriquecerComSinaisSessao({
      organizacaoId: "org-1",
      tipoEvento: "visualizacao_vitrine",
    });
    expect(visDiaSeguinte.primeiraVisualizacaoSessao).toBe(true);
  });

  it("usa fallback em memória quando sessionStorage lança exceção", () => {
    const rastreador = new RastreadorSessaoTelemetria({
      obterArmazenamento: () => {
        throw new Error("SecurityError");
      },
      obterDataIso: () => "2026-11-24",
    });

    const primeiro = rastreador.enriquecerComSinaisSessao({
      organizacaoId: "org-2",
      tipoEvento: "clique_whatsapp",
    });
    const segundo = rastreador.enriquecerComSinaisSessao({
      organizacaoId: "org-2",
      tipoEvento: "abertura_microfluxo",
    });

    expect(primeiro.primeiroCliqueSessao).toBe(true);
    expect(segundo.primeiroCliqueSessao).toBeUndefined();
  });
});

describe("Funil CRO baseado em sessões únicas", () => {
  it("calcula CTR e funil por sessões únicas mantendo cliques totais no detalhe", () => {
    const resumo = consolidarResumoMetricas([
      {
        dataIso: "2026-11-24",
        visualizacoesVitrine: 12,
        visualizacoesCartao: 3,
        sessoesUnicas: 9,
        sessoesComCliqueAcao: 6,
        cliquesAcoesHome: 7,
        aberturasMicrofluxo: 5,
        conclusoesMicrofluxo: 2,
        cliquesWhatsapp: 3,
        atualizadoEmIso: "2026-11-24T14:00:00.000Z",
      },
    ]);

    expect(resumo.possuiTelemetriaSessao).toBe(true);
    expect(resumo.metricasCRO?.ctr.valorPercentual).toBe(66.7);
    expect(resumo.metricasCRO?.etapasFunil[0]?.volume).toBe(9);
    expect(resumo.metricasCRO?.etapasFunil[1]?.volume).toBe(6);
    expect(resumo.metricasCRO?.etapasFunil[1]?.percentualSobreTopo).toBe(66.7);
    expect(resumo.metricasCRO?.etapasFunil[1]?.detalhe).toContain("15 cliques totais");
  });

  it("sinaliza contagem legada sem mascarar histórico quando não há telemetria de sessão", () => {
    const resumo = CalculadorMetricasCRO.consolidarResumo({
      visitantesOuSessoes: 9,
      cliquesAcaoTotais: 15,
      usandoContagemLegada: true,
      contatosUnicos: 3,
      leadsQualificados: 1,
      vendasConcluidas: 0,
    });

    expect(resumo.etapasFunil[1]?.detalhe).toContain("Contagem legada");
  });
});

