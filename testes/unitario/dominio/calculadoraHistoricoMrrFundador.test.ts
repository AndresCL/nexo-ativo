import { describe, expect, it } from "vitest";
import { calcularSerieHistoricaMrrMensal } from "@/dominio/fundador/calculadoraHistoricoMrrFundador";
import { calcularMetricasAssinaturaFundador } from "@/dominio/fundador/calculadoraMetricasFundador";
import { CODIGOS_ETAPA_KANBAN_FUNDADOR, DESCRITORES_ETAPA_KANBAN_FUNDADOR } from "@/dominio/fundador/tiposPainelFundador";

describe("MRR Líquido, Série Histórica e Kanban Fundador", () => {
  it("calcula MRR líquido (R$ 64,02), bruto (R$ 67,00) e taxas Asaas (R$ 2,98)", () => {
    const resultado = calcularMetricasAssinaturaFundador(
      [
        {
          id: "org-amigo",
          situacao: "ativa",
          planoCodigo: "pro",
          situacaoAssinatura: "ativa",
          origemAssinatura: "gateway",
        },
      ],
      new Map([
        [
          "org-amigo",
          {
            organizacaoId: "org-amigo",
            valorMensalCentavos: 6700,
            valorLiquidoMensalCentavos: 6402,
          },
        ],
      ]),
    );

    expect(resultado.receitaMensalRecorrenteCentavos).toBe(6700);
    expect(resultado.receitaMensalRecorrenteLiquidaCentavos).toBe(6402);
    expect(resultado.taxasAsaasMensaisCentavos).toBe(298);
  });

  it("consolida série histórica ignorando cobranças avulsas e pendentes, usando competência por vencimento", () => {
    const serie = calcularSerieHistoricaMrrMensal({
      dataReferencia: new Date("2026-11-15T12:00:00.000Z"),
      quantidadeMeses: 3,
      mrrLiquidoAtualCentavos: 6402,
      mrrBrutoAtualCentavos: 6700,
      cobrancas: [
        // Cobrança de assinatura de outubro paga em atraso em novembro -> entra em outubro!
        {
          assinaturaAsaasId: "sub_1",
          valorCentavos: 6700,
          valorLiquidoCentavos: 6402,
          situacao: "RECEIVED",
          dataVencimentoIso: "2026-10-28",
          dataPagamentoIso: "2026-11-02",
        },
        // Cobrança avulsa de implantação (sem assinaturaAsaasId) -> deve ser ignorada!
        {
          valorCentavos: 29700,
          valorLiquidoCentavos: 28500,
          situacao: "RECEIVED",
          dataVencimentoIso: "2026-10-10",
          dataPagamentoIso: "2026-10-10",
        },
        // Cobrança pendente de novembro -> ignorada, mas mês atual usa piso do MRR ativo
        {
          assinaturaAsaasId: "sub_1",
          valorCentavos: 6700,
          situacao: "PENDING",
          dataVencimentoIso: "2026-11-28",
        },
      ],
    });

    expect(serie).toHaveLength(3);
    expect(serie[0]?.anoMes).toBe("2026-09");
    expect(serie[0]?.mrrLiquidoCentavos).toBe(0);

    expect(serie[1]?.anoMes).toBe("2026-10");
    expect(serie[1]?.mrrBrutoCentavos).toBe(6700);
    expect(serie[1]?.mrrLiquidoCentavos).toBe(6402);
    expect(serie[1]?.taxasAsaasCentavos).toBe(298);

    expect(serie[2]?.anoMes).toBe("2026-11");
    expect(serie[2]?.mesAtual).toBe(true);
    expect(serie[2]?.mrrLiquidoCentavos).toBe(6402);
    expect(serie[2]?.mrrBrutoCentavos).toBe(6700);
  });

  it("mantém a ordem do Kanban em Em onboarding, Em negociação, Ativo e Churn", () => {
    expect(CODIGOS_ETAPA_KANBAN_FUNDADOR).toEqual(["onboarding", "atencao", "ativo", "inativo"]);
    expect(CODIGOS_ETAPA_KANBAN_FUNDADOR.map((c) => DESCRITORES_ETAPA_KANBAN_FUNDADOR[c].rotulo)).toEqual([
      "Em onboarding",
      "Em negociação",
      "Ativo",
      "Churn",
    ]);
  });
});

