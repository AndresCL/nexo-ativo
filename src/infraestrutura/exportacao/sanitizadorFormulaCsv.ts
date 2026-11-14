/**
 * Caracteres que acionam execução de fórmulas, comandos DDE ou hiperlinks no
 * Excel, Google Sheets, LibreOffice Calc e Apple Numbers (CWE-1236 / OWASP).
 */
const CARACTERES_DISPARADORES_FORMULA = new Set([
  "=",
  "+",
  "-",
  "@",
  "\t",
  "\r",
  "|",
  "%",
]);

/**
 * Sanitiza o conteúdo de uma célula CSV para evitar injeção de fórmulas e quebra de delimitadores RFC 4180.
 *
 * @param valor - Dado primitivo a ser gravado na célula
 * @param separador - Separador de colunas utilizado (padrão ';' para Excel Brasil)
 */
export function sanitizarCelulaCsv(valor: unknown, separador: string = ";"): string {
  if (valor === null || valor === undefined) {
    return "";
  }

  const texto = String(valor);

  // 1. Detecta gatilho de fórmula mesmo com espaços, tabs ou quebras no início
  const textoSemEspacosIniciais = texto.trimStart();
  const primeiroCaractere = textoSemEspacosIniciais.charAt(0);

  let textoSeguro = texto;

  if (CARACTERES_DISPARADORES_FORMULA.has(primeiroCaractere)) {
    // Prefixar com apóstrofo instrui o Excel a tratar como texto puro
    textoSeguro = `'${texto}`;
  }

  // 2. Conformidade RFC 4180: encapsular em aspas se contiver separador, aspas, quebra de linha ou apóstrofo
  const precisaDeAspas =
    textoSeguro.includes(separador) ||
    textoSeguro.includes('"') ||
    textoSeguro.includes("\n") ||
    textoSeguro.includes("\r") ||
    textoSeguro.startsWith("'");

  if (precisaDeAspas) {
    return `"${textoSeguro.replace(/"/g, '""')}"`;
  }

  return textoSeguro;
}

