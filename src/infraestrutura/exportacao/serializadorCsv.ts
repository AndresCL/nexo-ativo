import type { MatrizExportacaoSolicitacoes } from "@/dominio/solicitacoes/exportacao/tiposExportacaoSolicitacoes";
import { sanitizarCelulaCsv } from "./sanitizadorFormulaCsv";

export interface OpcoesSerializacaoCsv {
  readonly separador?: string;
  readonly incluirBomUtf8?: boolean;
}

/**
 * Converte a matriz de dados em uma string CSV compatível com o Excel em português
 * (RFC 4180, delimitador ';' e BOM UTF-8 para prevenir problemas de acentuação).
 */
export function serializarMatrizParaCsv(
  matriz: MatrizExportacaoSolicitacoes,
  opcoes: OpcoesSerializacaoCsv = {},
): string {
  const separador = opcoes.separador ?? ";";
  const incluirBom = opcoes.incluirBomUtf8 ?? true;

  const linhasCsv: string[] = [];

  // 1. Cabeçalhos
  const cabecalhosFormatados = matriz.cabecalhos.map((c) =>
    sanitizarCelulaCsv(c, separador),
  );
  linhasCsv.push(cabecalhosFormatados.join(separador));

  // 2. Linhas de dados
  for (const linha of matriz.linhas) {
    const celulasFormatadas = linha.map((valor) =>
      sanitizarCelulaCsv(valor, separador),
    );
    linhasCsv.push(celulasFormatadas.join(separador));
  }

  const corpoCsv = linhasCsv.join("\r\n");

  return incluirBom ? `\uFEFF${corpoCsv}` : corpoCsv;
}

