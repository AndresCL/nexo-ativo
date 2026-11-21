import { describe, expect, it } from "vitest";
import {
  calcularMetricasAssinaturaFundador,
  formatarRotuloSituacaoAssinatura,
  resolverOrigemAssinaturaEfetiva,
  type AssinaturaRecorrenteAtiva,
  type ResumoOrganizacaoParaMetricas,
} from "@/dominio/fundador/calculadoraMetricasFundador";

describe("calculadoraMetricasFundador", () => {
  it("não soma MRR nem assinaturasAtivas para organizações sem assinatura recorrente ativa (cortesia ou legado)", () => {
    const organizacoes: ResumoOrganizacaoParaMetricas[] = [
      {
        id: "org-legado-1",
        situacao: "ativa",
        planoCodigo: "pro",
        situacaoAssinatura: "ativa",
      },
      {
        id: "org-cortesia-2",
        situacao: "ativa",
        planoCodigo: "pro",
        situacaoAssinatura: "ativa",
        origemAssinatura: "cortesia",
      },
    ];

    const assinaturasAtivas = new Map<string, AssinaturaRecorrenteAtiva>();

    const resultado = calcularMetricasAssinaturaFundador(organizacoes, assinaturasAtivas);

    expect(resultado.totalOrganizacoes).toBe(2);
    expect(resultado.organizacoesAtivas).toBe(2);
    expect(resultado.assinaturasAtivas).toBe(0);
    expect(resultado.receitaMensalRecorrenteCentavos).toBe(0);
  });

  it("soma MRR apenas para organizações ativas com assinatura recorrente ativa no gateway", () => {
    const organizacoes: ResumoOrganizacaoParaMetricas[] = [
      {
        id: "org-pagante-1",
        situacao: "ativa",
        planoCodigo: "pro",
        situacaoAssinatura: "ativa",
        origemAssinatura: "gateway",
      },
      {
        id: "org-pagante-legado-sem-campo-origem",
        situacao: "ativa",
        planoCodigo: "pro",
        situacaoAssinatura: "ativa",
      },
      {
        id: "org-cortesia",
        situacao: "ativa",
        planoCodigo: "pro",
        situacaoAssinatura: "ativa",
        origemAssinatura: "cortesia",
      },
      {
        id: "org-suspensa-com-assinatura",
        situacao: "suspensa",
        planoCodigo: "pro",
        situacaoAssinatura: "ativa",
        origemAssinatura: "gateway",
      },
      {
        id: "org-inadimplente",
        situacao: "ativa",
        planoCodigo: "pro",
        situacaoAssinatura: "inadimplente",
      },
      {
        id: "org-cancelada",
        situacao: "ativa",
        planoCodigo: "pro",
        situacaoAssinatura: "cancelada",
      },
    ];

    const assinaturasAtivas = new Map<string, AssinaturaRecorrenteAtiva>([
      ["org-pagante-1", { organizacaoId: "org-pagante-1", valorMensalCentavos: 8700 }],
      [
        "org-pagante-legado-sem-campo-origem",
        { organizacaoId: "org-pagante-legado-sem-campo-origem", valorMensalCentavos: 9700 },
      ],
      [
        "org-suspensa-com-assinatura",
        { organizacaoId: "org-suspensa-com-assinatura", valorMensalCentavos: 8700 },
      ],
    ]);

    const resultado = calcularMetricasAssinaturaFundador(organizacoes, assinaturasAtivas);

    expect(resultado.totalOrganizacoes).toBe(6);
    expect(resultado.organizacoesAtivas).toBe(5);
    expect(resultado.organizacoesSuspensas).toBe(1);
    expect(resultado.assinaturasAtivas).toBe(2);
    expect(resultado.assinaturasInadimplentes).toBe(1);
    expect(resultado.assinaturasCanceladas).toBe(1);
    expect(resultado.receitaMensalRecorrenteCentavos).toBe(18400);
  });

  it("usa o valor de catálogo como fallback se valorMensalCentavos vier zerado", () => {
    const organizacoes: ResumoOrganizacaoParaMetricas[] = [
      {
        id: "org-fallback",
        situacao: "ativa",
        planoCodigo: "pro",
        situacaoAssinatura: "ativa",
        origemAssinatura: "gateway",
      },
    ];

    const assinaturasAtivas = new Map<string, AssinaturaRecorrenteAtiva>([
      ["org-fallback", { organizacaoId: "org-fallback", valorMensalCentavos: 0 }],
    ]);

    const resultado = calcularMetricasAssinaturaFundador(organizacoes, assinaturasAtivas);

    expect(resultado.assinaturasAtivas).toBe(1);
    expect(resultado.receitaMensalRecorrenteCentavos).toBe(8700);
  });

  it("resolve origem efetiva e formata rótulo corretamente", () => {
    expect(
      resolverOrigemAssinaturaEfetiva({ situacaoAssinatura: "ativa" }, undefined),
    ).toBe("cortesia");

    expect(
      resolverOrigemAssinaturaEfetiva(
        { situacaoAssinatura: "ativa" },
        { organizacaoId: "org-1", valorMensalCentavos: 8700 },
      ),
    ).toBe("gateway");

    expect(formatarRotuloSituacaoAssinatura("ativa", "cortesia")).toBe("ativa (cortesia)");
    expect(formatarRotuloSituacaoAssinatura("ativa", "gateway")).toBe("ativa");
    expect(formatarRotuloSituacaoAssinatura("cancelada", "gateway")).toBe("cancelada");
  });
});

