export interface OpcoesOtimizacaoImagemUpload {
  readonly larguraMaximaPx?: number;
  readonly alturaMaximaPx?: number;
  readonly qualidade?: number;
}

const TIPOS_OTIMIZAVEIS = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

const LARGURA_MAXIMA_PADRAO_PX = 1600;
const ALTURA_MAXIMA_PADRAO_PX = 1600;
const QUALIDADE_WEBP_PADRAO = 0.82;

export function calcularDimensoesProporcionais(
  larguraOriginal: number,
  alturaOriginal: number,
  larguraMaxima: number,
  alturaMaxima: number,
): { largura: number; altura: number; foiRedimensionada: boolean } {
  if (larguraOriginal <= 0 || alturaOriginal <= 0) {
    return { largura: larguraOriginal, altura: alturaOriginal, foiRedimensionada: false };
  }

  const escala = Math.min(1, larguraMaxima / larguraOriginal, alturaMaxima / alturaOriginal);
  if (escala >= 1) {
    return { largura: larguraOriginal, altura: alturaOriginal, foiRedimensionada: false };
  }

  return {
    largura: Math.max(1, Math.round(larguraOriginal * escala)),
    altura: Math.max(1, Math.round(alturaOriginal * escala)),
    foiRedimensionada: true,
  };
}

function substituirExtensaoPorWebp(nomeArquivo: string): string {
  const semExtensao = nomeArquivo.replace(/\.[^.]+$/, "");
  return `${semExtensao || "imagem"}.webp`;
}

function carregarElementoImagem(urlObjeto: string): Promise<HTMLImageElement> {
  return new Promise((resolver, rejeitar) => {
    const imagem = new Image();
    imagem.onload = () => resolver(imagem);
    imagem.onerror = () => rejeitar(new Error("Falha ao decodificar imagem para otimização."));
    imagem.src = urlObjeto;
  });
}

function exportarCanvasParaWebp(
  canvas: HTMLCanvasElement,
  qualidade: number,
): Promise<Blob | null> {
  return new Promise((resolver) => {
    canvas.toBlob((blob) => resolver(blob), "image/webp", qualidade);
  });
}

/**
 * Redimensiona e comprime imagens raster (JPEG, PNG, WebP) no navegador para WebP
 * antes do envio ao Storage. Retorna o arquivo original se o ambiente não suportar
 * canvas ou se a versão otimizada não reduzir o tamanho.
 */
export async function otimizarImagemParaUpload(
  arquivo: File,
  opcoes?: OpcoesOtimizacaoImagemUpload,
): Promise<File> {
  const tipoNormalizado = arquivo.type.trim().toLowerCase();
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    !TIPOS_OTIMIZAVEIS.has(tipoNormalizado)
  ) {
    return arquivo;
  }

  const larguraMaxima = opcoes?.larguraMaximaPx ?? LARGURA_MAXIMA_PADRAO_PX;
  const alturaMaxima = opcoes?.alturaMaximaPx ?? ALTURA_MAXIMA_PADRAO_PX;
  const qualidade = opcoes?.qualidade ?? QUALIDADE_WEBP_PADRAO;

  const urlObjeto = URL.createObjectURL(arquivo);

  try {
    const imagem = await carregarElementoImagem(urlObjeto);
    const { largura, altura, foiRedimensionada } = calcularDimensoesProporcionais(
      imagem.naturalWidth,
      imagem.naturalHeight,
      larguraMaxima,
      alturaMaxima,
    );

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;

    const contexto = canvas.getContext("2d");
    if (!contexto) {
      return arquivo;
    }

    contexto.drawImage(imagem, 0, 0, largura, altura);

    const blobOtimizado = await exportarCanvasParaWebp(canvas, qualidade);
    if (!blobOtimizado || blobOtimizado.type !== "image/webp") {
      return arquivo;
    }

    if (!foiRedimensionada && blobOtimizado.size >= arquivo.size) {
      return arquivo;
    }

    return new File([blobOtimizado], substituirExtensaoPorWebp(arquivo.name), {
      type: "image/webp",
      lastModified: arquivo.lastModified,
    });
  } catch {
    return arquivo;
  } finally {
    URL.revokeObjectURL(urlObjeto);
  }
}

