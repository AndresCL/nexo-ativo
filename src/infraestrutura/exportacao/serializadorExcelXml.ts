import type {
  MatrizExportacaoSolicitacoes,
  PlanilhaXmlExcel,
} from "@/dominio/solicitacoes/exportacao/tiposExportacaoSolicitacoes";

function escaparXml(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  const texto = String(valor);

  // Neutraliza início de fórmula no Excel
  const seguro =
    texto.trimStart().startsWith("=") || texto.trimStart().startsWith("@")
      ? `'${texto}`
      : texto;

  return seguro
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sanitizarNomeAba(nome: string): string {
  // O Excel limita o nome de abas a 31 caracteres e proíbe : \ / ? * [ ]
  const limpo = nome.replace(/[:\\/?*[\]]/g, " ").trim();
  return limpo.slice(0, 31) || "Planilha";
}

function gerarTabelaXml(matriz: MatrizExportacaoSolicitacoes): string {
  const cabecalhosXml = matriz.cabecalhos
    .map(
      (c) =>
        `<Cell ss:StyleID="Cabecalho"><Data ss:Type="String">${escaparXml(c)}</Data></Cell>`,
    )
    .join("");

  const linhasXml = matriz.linhas
    .map((linha) => {
      const celulas = linha
        .map((valor) => {
          const valorEscapado = escaparXml(valor);
          return `<Cell><Data ss:Type="String">${valorEscapado}</Data></Cell>`;
        })
        .join("");
      return `<Row>${celulas}</Row>`;
    })
    .join("\n   ");

  return `<Table>
   <Row ss:Height="24">
    ${cabecalhosXml}
   </Row>
   ${linhasXml}
  </Table>`;
}

/**
 * Converte múltiplas planilhas (abas) em uma pasta de trabalho SpreadsheetML (XML Spreadsheet 2003).
 * Suporta abas separadas por experiência, estilos e acentuação nativa sem dependências pesadas.
 */
export function serializarLivroParaExcelXml(
  planilhas: readonly PlanilhaXmlExcel[],
): string {
  const abasXml = planilhas
    .map((planilha) => {
      const nomeAba = sanitizarNomeAba(planilha.nome);
      const tabela = gerarTabelaXml(planilha.matriz);
      return ` <Worksheet ss:Name="${escaparXml(nomeAba)}">
  ${tabela}
 </Worksheet>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Cabecalho">
   <Alignment ss:Vertical="Center" ss:Horizontal="Left"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
  </Style>
 </Styles>
${abasXml}
</Workbook>`;
}

/**
 * Wrapper de conveniência para serializar uma única planilha (aba única) para Excel XML.
 */
export function serializarMatrizParaExcelXml(
  matriz: MatrizExportacaoSolicitacoes,
  nomePlanilha: string = "Solicitacoes",
): string {
  return serializarLivroParaExcelXml([{ nome: nomePlanilha, matriz }]);
}
