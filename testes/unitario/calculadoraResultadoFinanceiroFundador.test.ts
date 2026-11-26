import { describe, expect, it } from "vitest";
import { calcularResultadoFinanceiroFundador } from "@/dominio/fundador/calculadoraResultadoFinanceiroFundador";
import {
  converterUsdParaCentavosBrl,
  obterAnoMesAnterior,
  obterClassificacaoPadraoCategoria,
  type DespesaOperacionalFundador,
} from "@/dominio/fundador/tiposDespesasFundador";
import type { PontoHistoricoMrrMensal } from "@/dominio/fundador/tiposPainelFundador";

function criarDespesa(
  parcial: Partial<DespesaOperacionalFundador> & {
    id: string;
    titulo: string;
    categoria: DespesaOperacionalFundador["categoria"];
    anoMes: string;
    valorCentavos: number;
  },
): DespesaOperacionalFundador {
  return {
    classificacao: obterClassificacaoPadraoCategoria(parcial.categoria),
    recorrente: true,
    criadoEmIso: "2026-11-01T10:00:00.000Z",
    atualizadoEmIso: "2026-11-01T10:00:00.000Z",
    ...parcial,
  };
}

describe("calculadoraResultadoFinanceiroFundador", () => {
  it("separa COGS (Firebase/Resend) e OpEx (IA/Ferramentas) e calcula margens e unit economics", () => {
    const historicoMrrMensal: PontoHistoricoMrrMensal[] = [
      {
        anoMes: "2026-11",
        rotuloMes: "nov/26",
        mrrBrutoCentavos: 100_000, // R$ 1.000,00
        taxasAsaasCentavos: 5_000, // R$ 50,00
        mrrLiquidoCentavos: 95_000, // R$ 950,00
        quantidadeCobrancas: 10,
        mesAtual: true,
      },
    ];

    const despesas: DespesaOperacionalFundador[] = [
      criarDespesa({
        id: "d1",
        titulo: "Firebase Blaze",
        categoria: "firebase",
        anoMes: "2026-11",
        valorCentavos: 15_000, // R$ 150,00 (COGS)
      }),
      criarDespesa({
        id: "d2",
        titulo: "Resend Pro",
        categoria: "resend",
        anoMes: "2026-11",
        valorCentavos: 11_600, // R$ 116,00 (COGS)
      }),
      criarDespesa({
        id: "d3",
        titulo: "Cursor Pro",
        categoria: "ia",
        anoMes: "2026-11",
        valorCentavos: 11_600, // R$ 116,00 (OpEx)
      }),
    ];

    const resultado = calcularResultadoFinanceiroFundador({
      historicoMrrMensal,
      despesas,
      anoMesSelecionado: "2026-11",
      assinaturasAtivas: 10,
    });

    expect(resultado.resumoMesSelecionado.cogsCentavos).toBe(26_600);
    expect(resultado.resumoMesSelecionado.opexCentavos).toBe(11_600);
    expect(resultado.resumoMesSelecionado.totalDespesasCentavos).toBe(38_200);
    expect(resultado.resumoMesSelecionado.lucroBrutoCentavos).toBe(68_400);
    expect(resultado.resumoMesSelecionado.lucroLiquidoCentavos).toBe(56_800);
    expect(resultado.resumoMesSelecionado.margemBrutaPercentual).toBe(68.4);
    expect(resultado.resumoMesSelecionado.margemLiquidaPercentual).toBe(59.8);

    expect(resultado.unitEconomics.arpuLiquidoCentavos).toBe(9_500);
    expect(resultado.unitEconomics.custoEntregaPorClienteCentavos).toBe(2_660);
    expect(resultado.unitEconomics.clientesBreakEven).toBe(5);
  });

  it("evita divisão por zero quando não há receita nem assinaturas ativas", () => {
    const resultado = calcularResultadoFinanceiroFundador({
      historicoMrrMensal: [],
      despesas: [
        criarDespesa({
          id: "d1",
          titulo: "IA Dev",
          categoria: "ia",
          anoMes: "2026-11",
          valorCentavos: 10_000,
        }),
      ],
      anoMesSelecionado: "2026-11",
      assinaturasAtivas: 0,
    });

    expect(resultado.resumoMesSelecionado.lucroLiquidoCentavos).toBe(-10_000);
    expect(resultado.resumoMesSelecionado.margemBrutaPercentual).toBeNull();
    expect(resultado.resumoMesSelecionado.margemLiquidaPercentual).toBeNull();
    expect(resultado.unitEconomics.arpuLiquidoCentavos).toBeNull();
    expect(resultado.unitEconomics.custoEntregaPorClienteCentavos).toBeNull();
    expect(resultado.unitEconomics.clientesBreakEven).toBeNull();
  });

  it("converte USD para centavos de BRL e calcula mês anterior corretamente", () => {
    expect(converterUsdParaCentavosBrl(20, 5.8)).toBe(11_600);
    expect(converterUsdParaCentavosBrl(-5, 5.8)).toBe(0);
    expect(obterAnoMesAnterior("2026-01")).toBe("2025-12");
    expect(obterAnoMesAnterior("2026-11")).toBe("2026-10");
  });
});
