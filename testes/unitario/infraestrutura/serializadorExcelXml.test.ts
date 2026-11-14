import { describe, expect, it } from "vitest";
import type { MatrizExportacaoSolicitacoes } from "@/dominio/solicitacoes/exportacao/tiposExportacaoSolicitacoes";
import {
  serializarLivroParaExcelXml,
  serializarMatrizParaExcelXml,
} from "@/infraestrutura/exportacao/serializadorExcelXml";

describe("serializadorExcelXml", () => {
  it("gera estrutura XML válida com cabeçalhos e linhas em aba única", () => {
    const matriz: MatrizExportacaoSolicitacoes = {
      cabecalhos: ["Protocolo", "Nome", "Vantagens"],
      linhas: [["sol-1", "Pedro", "Taxa 1,19%"]],
    };

    const xml = serializarMatrizParaExcelXml(matriz, "Garage88");
    expect(xml).toContain('<?mso-application progid="Excel.Sheet"?>');
    expect(xml).toContain('<Worksheet ss:Name="Garage88">');
    expect(xml).toContain('<Data ss:Type="String">Protocolo</Data>');
    expect(xml).toContain('<Data ss:Type="String">Pedro</Data>');
    expect(xml).toContain('<Data ss:Type="String">Taxa 1,19%</Data>');
  });

  it("suporta pastas de trabalho com múltiplas abas (Worksheets)", () => {
    const matrizGeral: MatrizExportacaoSolicitacoes = {
      cabecalhos: ["Protocolo", "Nome"],
      linhas: [["sol-1", "Pedro"], ["sol-2", "Mariana"]],
    };
    const matrizFinanciamento: MatrizExportacaoSolicitacoes = {
      cabecalhos: ["Protocolo", "Taxa"],
      linhas: [["sol-1", "1,19%"]],
    };

    const xml = serializarLivroParaExcelXml([
      { nome: "Visão Geral", matriz: matrizGeral },
      { nome: "Financiamento", matriz: matrizFinanciamento },
    ]);

    expect(xml).toContain('<Worksheet ss:Name="Visão Geral">');
    expect(xml).toContain('<Worksheet ss:Name="Financiamento">');
    expect(xml).toContain('<Data ss:Type="String">Mariana</Data>');
    expect(xml).toContain('<Data ss:Type="String">1,19%</Data>');
  });

  it("escapa caracteres especiais de XML e neutraliza início de fórmulas", () => {
    const matriz: MatrizExportacaoSolicitacoes = {
      cabecalhos: ["A & B", "<Teste>"],
      linhas: [['=HYPERLINK("evil.com")', "1 < 2"]],
    };

    const xml = serializarMatrizParaExcelXml(matriz);
    expect(xml).toContain("A &amp; B");
    expect(xml).toContain("&lt;Teste&gt;");
    expect(xml).toContain("&apos;=HYPERLINK(&quot;evil.com&quot;)");
  });
});
