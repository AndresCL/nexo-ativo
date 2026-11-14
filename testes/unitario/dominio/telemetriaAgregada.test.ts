import { describe, expect, it } from "vitest";
import {
  consolidarResumoMetricas,
  type MetricasDiariasOrganizacao,
} from "@/dominio/analytics/tiposMetricasAgregadas";
import { esquemaRegistroEventoAnonimo } from "@/validacoes/esquemasTelemetriaAnonima";

describe("Analytics Agregado sem PII e Funil Editorial", () => {
  const historicoExemplo: MetricasDiariasOrganizacao[] = [
    {
      dataIso: "2026-11-08",
      visualizacoesVitrine: 100,
      visualizacoesCartao: 20,
      aberturasMicrofluxo: 40,
      conclusoesMicrofluxo: 10,
      cliquesWhatsapp: 8,
      cliquesAcoesHome: 14,
      porCanal: {
        instagram: {
          visualizacoes: 60,
          aberturasFluxo: 25,
          contatosWhatsapp: 5,
          cliquesAcoesHome: 8,
        },
        cartao_equipe: {
          visualizacoes: 20,
          aberturasFluxo: 10,
          contatosWhatsapp: 2,
          cliquesAcoesHome: 4,
        },
        direto: { visualizacoes: 20, aberturasFluxo: 5, contatosWhatsapp: 1, cliquesAcoesHome: 2 },
      },
      porCartao: {
        "prof-bruno-silva": {
          nome: "Bruno Silva",
          visualizacoes: 20,
          cliquesAcoesHome: 4,
          fluxosIniciados: 10,
          contatosWhatsapp: 2,
        },
      },
      atualizadoEmIso: "2026-11-08T18:00:00.000Z",
    },
    {
      dataIso: "2026-11-07",
      visualizacoesVitrine: 150,
      visualizacoesCartao: 30,
      aberturasMicrofluxo: 60,
      conclusoesMicrofluxo: 15,
      cliquesWhatsapp: 12,
      porCanal: {
        instagram: { visualizacoes: 90, aberturasFluxo: 40, contatosWhatsapp: 8 },
        whatsapp: { visualizacoes: 30, aberturasFluxo: 10, contatosWhatsapp: 3 },
        direto: { visualizacoes: 30, aberturasFluxo: 10, contatosWhatsapp: 1 },
      },
      porCartao: {
        "prof-bruno-silva": {
          nome: "Bruno Silva",
          visualizacoes: 15,
          fluxosIniciados: 5,
          contatosWhatsapp: 2,
        },
        "prof-fernanda-drummond": {
          nome: "Fernanda Drummond",
          visualizacoes: 15,
          fluxosIniciados: 5,
          contatosWhatsapp: 1,
        },
      },
      atualizadoEmIso: "2026-11-07T18:00:00.000Z",
    },
  ];

  it("deve somar indicadores e calcular taxas de conversão percentuais determinísticas", () => {
    const resumo = consolidarResumoMetricas(historicoExemplo, 30);

    expect(resumo.totalVisualizacoes).toBe(250);
    expect(resumo.totalVisualizacoesCartoes).toBe(50);
    expect(resumo.totalAberturasMicrofluxo).toBe(100);
    expect(resumo.totalConclusoesMicrofluxo).toBe(25);
    expect(resumo.totalCliquesWhatsapp).toBe(20);

    // 25 conclusões / 100 aberturas = 25.0%
    expect(resumo.taxaConversaoMicrofluxoPercentual).toBe(25.0);

    // 25 conclusões / 250 visitas = 10.0%
    expect(resumo.taxaConversaoContatoPercentual).toBe(10.0);
  });

  it("deve consolidar tráfego por canal (Instagram, Cartões VIP, WhatsApp, Direto)", () => {
    const resumo = consolidarResumoMetricas(historicoExemplo, 30);

    const canalInstagram = resumo.metricasPorCanal.find((c) => c.canal === "instagram");
    expect(canalInstagram).toBeDefined();
    expect(canalInstagram?.visualizacoes).toBe(150); // 60 + 90
    expect(canalInstagram?.aberturasFluxo).toBe(65); // 25 + 40
    expect(canalInstagram?.contatosWhatsapp).toBe(13); // 5 + 8

    const canalCartao = resumo.metricasPorCanal.find((c) => c.canal === "cartao_equipe");
    expect(canalCartao).toBeDefined();
    expect(canalCartao?.visualizacoes).toBe(20);
    expect(canalCartao?.aberturasFluxo).toBe(10);
    expect(canalCartao?.contatosWhatsapp).toBe(2);
  });

  it("deve consolidar desempenho por cartão de consultor VIP", () => {
    const resumo = consolidarResumoMetricas(historicoExemplo, 30);

    const bruno = resumo.metricasPorCartao.find((c) => c.id === "prof-bruno-silva");
    expect(bruno).toBeDefined();
    expect(bruno?.nome).toBe("Bruno Silva");
    expect(bruno?.visualizacoes).toBe(35); // 20 + 15
    expect(bruno?.cliquesAcoesHome).toBe(4); // 4 + 0
    expect(bruno?.fluxosIniciados).toBe(15); // 10 + 5
    expect(bruno?.contatosWhatsapp).toBe(4); // 2 + 2

    const fernanda = resumo.metricasPorCartao.find((c) => c.id === "prof-fernanda-drummond");
    expect(fernanda).toBeDefined();
    expect(fernanda?.nome).toBe("Fernanda Drummond");
    expect(fernanda?.visualizacoes).toBe(15);
  });

  it("deve permitir isolamento de um único dia específico (drilldown)", () => {
    const diaIsolado = [historicoExemplo[0]!];
    const resumoDia = consolidarResumoMetricas(diaIsolado, 1);

    expect(resumoDia.diasConsiderados).toBe(1);
    expect(resumoDia.totalVisualizacoes).toBe(100);
    expect(resumoDia.totalAberturasMicrofluxo).toBe(40);
    expect(resumoDia.totalConclusoesMicrofluxo).toBe(10);
  });

  it("deve validar payload de telemetria anônima com canal de origem e cartão", () => {
    const payloadValido = {
      organizacaoId: "garage-88",
      tipoEvento: "abertura_microfluxo",
      canalOrigem: "instagram",
      cartaoProfissionalId: "prof-bruno-silva",
      cartaoProfissionalNome: "Bruno Silva",
      microfluxoId: "financiamento-feirao",
      microfluxoTitulo: "Financiamento Feirão Acelera",
    };

    const parsed = esquemaRegistroEventoAnonimo.safeParse(payloadValido);
    expect(parsed.success).toBe(true);
  });

  it("deve lidar com histórico vazio sem divisões por zero ou erros", () => {
    const resumo = consolidarResumoMetricas([], 30);

    expect(resumo.totalVisualizacoes).toBe(0);
    expect(resumo.totalAberturasMicrofluxo).toBe(0);
    expect(resumo.totalConclusoesMicrofluxo).toBe(0);
    expect(resumo.taxaConversaoMicrofluxoPercentual).toBe(0);
    expect(resumo.taxaConversaoContatoPercentual).toBe(0);
    expect(resumo.historicoDiario).toHaveLength(0);
  });
});
