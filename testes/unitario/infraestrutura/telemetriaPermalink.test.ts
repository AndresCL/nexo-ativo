import type { Firestore } from "firebase-admin/firestore";
import { describe, expect, it, vi } from "vitest";
import { executarRegistroEventoAgregadoAnonimo } from "../../../funcoes/src/analytics/registrarEventoAgregadoAnonimo";
import { consolidarResumoMetricas } from "@/dominio/analytics/tiposMetricasAgregadas";

describe("Métricas de permalink por experiência", () => {
  it("registra uma abertura no total, no canal e na experiência sem duplicar o total", async () => {
    const salvar = vi.fn().mockResolvedValue(undefined);
    const referencia = { collection: vi.fn(), doc: vi.fn(), set: salvar };
    referencia.collection.mockReturnValue(referencia);
    referencia.doc.mockReturnValue(referencia);
    await executarRegistroEventoAgregadoAnonimo(referencia as unknown as Firestore, {
      organizacaoId: "org-teste",
      tipoEvento: "abertura_microfluxo",
      canalOrigem: "permalink",
      microfluxoId: "alfa",
      microfluxoTitulo: "Alfa",
    });
    const dados = salvar.mock.calls[0]![0];
    expect(dados.porMicrofluxo.alfa.aberturasPermalink).toEqual(dados.porMicrofluxo.alfa.aberturas);
    expect(dados.porCanal.permalink.aberturasFluxo).toEqual(dados.aberturasMicrofluxo);
    expect(salvar).toHaveBeenCalledTimes(1);
  });

  it("consolida separadamente os acessos novos e aceita histórico sem a nova métrica", () => {
    const base = {
      visualizacoesVitrine: 5,
      aberturasMicrofluxo: 4,
      conclusoesMicrofluxo: 1,
      cliquesWhatsapp: 0,
      atualizadoEmIso: "2026-11-13T12:00:00Z",
    };
    const resumo = consolidarResumoMetricas([
      {
        ...base,
        dataIso: "2026-11-13",
        porCanal: { permalink: { visualizacoes: 2, aberturasFluxo: 2 } },
        porMicrofluxo: {
          alfa: { titulo: "Alfa", aberturas: 4, conclusoes: 1, aberturasPermalink: 2 },
        },
      },
      {
        ...base,
        dataIso: "2026-11-12",
        porMicrofluxo: { alfa: { titulo: "Alfa", aberturas: 4, conclusoes: 1 } },
      },
    ]);
    expect(resumo.metricasPorMicrofluxo[0]).toMatchObject({
      aberturas: 8,
      conclusoes: 2,
      aberturasPermalink: 2,
    });
    expect(resumo.metricasPorCanal.find((c) => c.canal === "permalink")).toMatchObject({
      rotulo: "Permalink",
      visualizacoes: 2,
      aberturasFluxo: 2,
    });
    expect(resumo.totalVisualizacoes).toBe(10);
  });
});
