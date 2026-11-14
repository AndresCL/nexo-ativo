import { ErroValidacaoDominio } from "../erros/errosDominio";

interface EspecificacaoVersaoQr {
  readonly versao: number;
  readonly bytesDadosTotais: number;
  readonly bytesCorrecaoPorBloco: number;
  readonly quantidadeBlocos: number;
  readonly centrosAlinhamento: readonly number[];
}

/**
 * Parâmetros oficiais ISO/IEC 18004 (Nível de Correção L — `01`) para versões 1 a 9,
 * cobrindo com folga qualquer URL pública ou endereço de cartão digital em UTF-8.
 */
const ESPECIFICACOES_VERSOES_NIVEL_L: readonly EspecificacaoVersaoQr[] = [
  {
    versao: 1,
    bytesDadosTotais: 19,
    bytesCorrecaoPorBloco: 7,
    quantidadeBlocos: 1,
    centrosAlinhamento: [],
  },
  {
    versao: 2,
    bytesDadosTotais: 34,
    bytesCorrecaoPorBloco: 10,
    quantidadeBlocos: 1,
    centrosAlinhamento: [6, 18],
  },
  {
    versao: 3,
    bytesDadosTotais: 55,
    bytesCorrecaoPorBloco: 15,
    quantidadeBlocos: 1,
    centrosAlinhamento: [6, 22],
  },
  {
    versao: 4,
    bytesDadosTotais: 80,
    bytesCorrecaoPorBloco: 20,
    quantidadeBlocos: 1,
    centrosAlinhamento: [6, 26],
  },
  {
    versao: 5,
    bytesDadosTotais: 108,
    bytesCorrecaoPorBloco: 26,
    quantidadeBlocos: 1,
    centrosAlinhamento: [6, 30],
  },
  {
    versao: 6,
    bytesDadosTotais: 136,
    bytesCorrecaoPorBloco: 18,
    quantidadeBlocos: 2,
    centrosAlinhamento: [6, 34],
  },
  {
    versao: 7,
    bytesDadosTotais: 156,
    bytesCorrecaoPorBloco: 20,
    quantidadeBlocos: 2,
    centrosAlinhamento: [6, 22, 38],
  },
  {
    versao: 8,
    bytesDadosTotais: 194,
    bytesCorrecaoPorBloco: 24,
    quantidadeBlocos: 2,
    centrosAlinhamento: [6, 24, 42],
  },
  {
    versao: 9,
    bytesDadosTotais: 232,
    bytesCorrecaoPorBloco: 30,
    quantidadeBlocos: 2,
    centrosAlinhamento: [6, 26, 46],
  },
];

function multiplicarGf256(a: number, b: number): number {
  let resultado = 0;
  let esquerdo = a & 0xff;
  let direito = b & 0xff;

  for (let i = 0; i < 8; i += 1) {
    if ((direito & 1) !== 0) {
      resultado ^= esquerdo;
    }
    const transbordo = (esquerdo & 0x80) !== 0;
    esquerdo = (esquerdo << 1) & 0xff;
    if (transbordo) {
      esquerdo ^= 0x1d;
    }
    direito >>= 1;
  }

  return resultado;
}

function construirPolinomioGeradorReedSolomon(grau: number): Uint8Array {
  let polinomio = new Uint8Array([1]);

  for (let i = 0; i < grau; i += 1) {
    const raiz = (() => {
      let potencia = 1;
      for (let p = 0; p < i; p += 1) {
        potencia = multiplicarGf256(potencia, 2);
      }
      return potencia;
    })();

    const proximo = new Uint8Array(polinomio.length + 1);
    for (let j = 0; j < polinomio.length; j += 1) {
      const coeficiente = polinomio[j]!;
      proximo[j] = (proximo[j] ?? 0) ^ coeficiente;
      proximo[j + 1] = (proximo[j + 1] ?? 0) ^ multiplicarGf256(coeficiente, raiz);
    }
    polinomio = proximo;
  }

  return polinomio;
}

function calcularBytesCorrecaoReedSolomon(
  dadosBloco: Uint8Array,
  quantidadeBytesCorrecao: number,
): Uint8Array {
  const gerador = construirPolinomioGeradorReedSolomon(quantidadeBytesCorrecao);
  const resto = new Uint8Array(quantidadeBytesCorrecao);

  for (const byteEntrada of dadosBloco) {
    const fator = byteEntrada ^ resto[0]!;
    resto.copyWithin(0, 1);
    resto[quantidadeBytesCorrecao - 1] = 0;

    for (let j = 0; j < quantidadeBytesCorrecao; j += 1) {
      resto[j] = (resto[j] ?? 0) ^ multiplicarGf256(gerador[j + 1]!, fator);
    }
  }

  return resto;
}

function anexarBits(destino: number[], valor: number, quantidadeBits: number): void {
  for (let i = quantidadeBits - 1; i >= 0; i -= 1) {
    destino.push((valor >>> i) & 1);
  }
}

function codificarFluxoBytes(
  bytesUtf8: Uint8Array,
  especificacao: EspecificacaoVersaoQr,
): Uint8Array {
  const bits: number[] = [];

  // Indicador de Modo Byte = 0100; contagem de 8 bits para versões 1..9
  anexarBits(bits, 0b0100, 4);
  anexarBits(bits, bytesUtf8.length, 8);
  for (const b of bytesUtf8) {
    anexarBits(bits, b, 8);
  }

  const capacidadeBitsDados = especificacao.bytesDadosTotais * 8;
  const terminador = Math.min(4, capacidadeBitsDados - bits.length);
  anexarBits(bits, 0, terminador);

  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const codewordsDados = new Uint8Array(especificacao.bytesDadosTotais);
  for (let i = 0; i < bits.length / 8; i += 1) {
    let byte = 0;
    for (let b = 0; b < 8; b += 1) {
      byte = (byte << 1) | (bits[i * 8 + b] ?? 0);
    }
    codewordsDados[i] = byte;
  }

  const bytesPreenchimento = [0xec, 0x11] as const;
  let indicePad = 0;
  for (let i = bits.length / 8; i < especificacao.bytesDadosTotais; i += 1) {
    codewordsDados[i] = bytesPreenchimento[indicePad % 2]!;
    indicePad += 1;
  }

  const tamanhoBloco = especificacao.bytesDadosTotais / especificacao.quantidadeBlocos;
  const blocosDados: Uint8Array[] = [];
  const blocosCorrecao: Uint8Array[] = [];

  for (let b = 0; b < especificacao.quantidadeBlocos; b += 1) {
    const fatia = codewordsDados.slice(b * tamanhoBloco, (b + 1) * tamanhoBloco);
    blocosDados.push(fatia);
    blocosCorrecao.push(
      calcularBytesCorrecaoReedSolomon(fatia, especificacao.bytesCorrecaoPorBloco),
    );
  }

  const intercalado: number[] = [];
  for (let i = 0; i < tamanhoBloco; i += 1) {
    for (let b = 0; b < especificacao.quantidadeBlocos; b += 1) {
      intercalado.push(blocosDados[b]![i]!);
    }
  }
  for (let i = 0; i < especificacao.bytesCorrecaoPorBloco; i += 1) {
    for (let b = 0; b < especificacao.quantidadeBlocos; b += 1) {
      intercalado.push(blocosCorrecao[b]![i]!);
    }
  }

  return new Uint8Array(intercalado);
}

function calcularBitsFormatoNivelL(indiceMascara: number): number {
  const dados5Bits = (0b01 << 3) | indiceMascara;
  let resto = dados5Bits << 10;
  for (let i = 14; i >= 10; i -= 1) {
    if (((resto >>> i) & 1) !== 0) {
      resto ^= 0x537 << (i - 10);
    }
  }
  return ((dados5Bits << 10) | resto) ^ 0x5412;
}

function calcularBitsVersao(versao: number): number {
  let resto = versao << 12;
  for (let i = 17; i >= 12; i -= 1) {
    if (((resto >>> i) & 1) !== 0) {
      resto ^= 0x1f25 << (i - 12);
    }
  }
  return (versao << 12) | resto;
}

function aplicarMascaraPadraoZero(linha: number, coluna: number): boolean {
  return (linha + coluna) % 2 === 0;
}

export interface MatrizQrCodeGerada {
  readonly versao: number;
  readonly dimensao: number;
  readonly modulos: readonly (readonly boolean[])[];
}

/**
 * Gera a matriz booleana de módulos escuros de um QR Code ISO/IEC 18004 válido.
 */
export function gerarMatrizQrCode(conteudoTexto: string): MatrizQrCodeGerada {
  const textoLimpo = conteudoTexto.trim();
  if (!textoLimpo) {
    throw new ErroValidacaoDominio(
      "Informe um endereço ou conteúdo válido para gerar o QR Code.",
      "CONTEUDO_QRCODE_VAZIO",
    );
  }

  const bytesUtf8 = new TextEncoder().encode(textoLimpo);
  const especificacao = ESPECIFICACOES_VERSOES_NIVEL_L.find(
    (item) => bytesUtf8.length + 2 <= item.bytesDadosTotais,
  );

  if (!especificacao) {
    throw new ErroValidacaoDominio(
      "O endereço informado excede o comprimento máximo suportado pelo gerador de QR Code.",
      "CONTEUDO_QRCODE_MUITO_LONGO",
    );
  }

  const n = 17 + especificacao.versao * 4;
  const grade: boolean[][] = Array.from({ length: n }, () => Array<boolean>(n).fill(false));
  const ehModuloFuncao: boolean[][] = Array.from({ length: n }, () =>
    Array<boolean>(n).fill(false),
  );

  function definirModuloFuncao(linha: number, coluna: number, escuro: boolean) {
    if (linha < 0 || linha >= n || coluna < 0 || coluna >= n) {
      return;
    }
    grade[linha]![coluna] = escuro;
    ehModuloFuncao[linha]![coluna] = true;
  }

  function desenharPadraoLocalizador(centroLinha: number, centroColuna: number) {
    for (let dy = -4; dy <= 4; dy += 1) {
      for (let dx = -4; dx <= 4; dx += 1) {
        const distanciaChebyshev = Math.max(Math.abs(dx), Math.abs(dy));
        const escuro = distanciaChebyshev !== 2 && distanciaChebyshev !== 4;
        definirModuloFuncao(centroLinha + dy, centroColuna + dx, escuro);
      }
    }
  }

  desenharPadraoLocalizador(3, 3);
  desenharPadraoLocalizador(3, n - 4);
  desenharPadraoLocalizador(n - 4, 3);

  for (let i = 0; i < n; i += 1) {
    if (!ehModuloFuncao[6]![i]) {
      definirModuloFuncao(6, i, i % 2 === 0);
    }
    if (!ehModuloFuncao[i]![6]) {
      definirModuloFuncao(i, 6, i % 2 === 0);
    }
  }

  const centros = especificacao.centrosAlinhamento;
  for (let i = 0; i < centros.length; i += 1) {
    for (let j = 0; j < centros.length; j += 1) {
      const cantoFinder =
        (i === 0 && j === 0) ||
        (i === 0 && j === centros.length - 1) ||
        (i === centros.length - 1 && j === 0);
      if (cantoFinder) {
        continue;
      }

      const cl = centros[i]!;
      const cc = centros[j]!;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          definirModuloFuncao(cl + dy, cc + dx, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }
  }

  // Reservar áreas de formato e módulo escuro fixo
  for (let i = 0; i <= 8; i += 1) {
    if (i !== 6) {
      definirModuloFuncao(8, i, false);
      definirModuloFuncao(i, 8, false);
    }
  }
  for (let i = 0; i < 8; i += 1) {
    definirModuloFuncao(8, n - 1 - i, false);
  }
  for (let i = 0; i < 7; i += 1) {
    definirModuloFuncao(n - 1 - i, 8, false);
  }
  definirModuloFuncao(n - 8, 8, true);

  if (especificacao.versao >= 7) {
    const bitsVersao = calcularBitsVersao(especificacao.versao);
    for (let i = 0; i < 18; i += 1) {
      const escuro = ((bitsVersao >>> i) & 1) === 1;
      const a = n - 11 + (i % 3);
      const b = Math.floor(i / 3);
      definirModuloFuncao(a, b, escuro);
      definirModuloFuncao(b, a, escuro);
    }
  }

  const bytesFinais = codificarFluxoBytes(bytesUtf8, especificacao);
  let indiceBit = 0;
  const totalBits = bytesFinais.length * 8;

  for (let direita = n - 1; direita >= 1; direita -= 2) {
    if (direita === 6) {
      direita = 5;
    }

    const subindo = ((direita + 1) & 2) === 0;
    for (let passo = 0; passo < n; passo += 1) {
      const linha = subindo ? n - 1 - passo : passo;
      for (let deslocamento = 0; deslocamento < 2; deslocamento += 1) {
        const coluna = direita - deslocamento;
        if (!ehModuloFuncao[linha]![coluna]) {
          let escuro = false;
          if (indiceBit < totalBits) {
            const byteAtual = bytesFinais[indiceBit >>> 3]!;
            escuro = ((byteAtual >>> (7 - (indiceBit & 7))) & 1) === 1;
            indiceBit += 1;
          }
          if (aplicarMascaraPadraoZero(linha, coluna)) {
            escuro = !escuro;
          }
          grade[linha]![coluna] = escuro;
        }
      }
    }
  }

  // Gravar bits de formato definitivos (Nível L + Máscara 0)
  const bitsFormato = calcularBitsFormatoNivelL(0);
  const coordenadasCopia1: ReadonlyArray<readonly [number, number]> = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8],
  ];
  const coordenadasCopia2: ReadonlyArray<readonly [number, number]> = [
    [n - 1, 8],
    [n - 2, 8],
    [n - 3, 8],
    [n - 4, 8],
    [n - 5, 8],
    [n - 6, 8],
    [n - 7, 8],
    [8, n - 8],
    [8, n - 7],
    [8, n - 6],
    [8, n - 5],
    [8, n - 4],
    [8, n - 3],
    [8, n - 2],
    [8, n - 1],
  ];

  for (let indice = 0; indice < 15; indice += 1) {
    const bitEscuro = ((bitsFormato >>> (14 - indice)) & 1) === 1;
    const [l1, c1] = coordenadasCopia1[indice]!;
    const [l2, c2] = coordenadasCopia2[indice]!;
    grade[l1]![c1] = bitEscuro;
    grade[l2]![c2] = bitEscuro;
  }

  return {
    versao: especificacao.versao,
    dimensao: n,
    modulos: grade,
  };
}

export interface OpcoesRenderizacaoQrCodeSvg {
  readonly corModulos?: string;
  readonly corFundo?: string;
  readonly margemSilenciosaModulos?: number;
  readonly tituloAcessivel?: string;
}

/**
 * Converte um conteúdo textual/URL em um documento SVG vetorial nítido e pronto para impressão,
 * sem rastreadores externos nem dependências de rede.
 */
export function gerarSvgQrCode(
  conteudoTexto: string,
  opcoes?: OpcoesRenderizacaoQrCodeSvg,
): string {
  const matriz = gerarMatrizQrCode(conteudoTexto);
  const margem = opcoes?.margemSilenciosaModulos ?? 4;
  const corModulos = opcoes?.corModulos ?? "#181715";
  const corFundo = opcoes?.corFundo ?? "#ffffff";
  const tamanhoTotal = matriz.dimensao + margem * 2;
  const titulo = (opcoes?.tituloAcessivel ?? "Código QR de acesso rápido")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const segmentosCaminho: string[] = [];
  for (let linha = 0; linha < matriz.dimensao; linha += 1) {
    for (let coluna = 0; coluna < matriz.dimensao; coluna += 1) {
      if (matriz.modulos[linha]![coluna]) {
        segmentosCaminho.push(`M${coluna + margem},${linha + margem}h1v1h-1z`);
      }
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tamanhoTotal} ${tamanhoTotal}" shape-rendering="crispEdges" role="img" aria-label="${titulo}">`,
    `<title>${titulo}</title>`,
    `<rect width="${tamanhoTotal}" height="${tamanhoTotal}" fill="${corFundo}"/>`,
    `<path d="${segmentosCaminho.join("")}" fill="${corModulos}"/>`,
    `</svg>`,
  ].join("");
}
