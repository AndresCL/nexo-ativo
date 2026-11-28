import {
  LIMITE_MAXIMO_PAGINAS_CARDAPIO,
  validarArquivoPdfCardapio,
} from "@/dominio/entidades/cardapioDigital";
import { ErroValidacaoDominio } from "@/dominio/erros/errosDominio";

export interface PaginaPdfConvertida {
  readonly arquivo: File;
  readonly largura: number;
  readonly altura: number;
  readonly numeroPagina: number;
}

export interface OpcoesConversaoPdf {
  readonly larguraMaximaPx?: number;
  readonly qualidadeWebp?: number;
  readonly limitePaginas?: number;
  readonly aoProgredir?: (paginaAtual: number, totalPaginas: number) => void;
}

const LARGURA_MAXIMA_PADRAO_PX = 1600;
const QUALIDADE_WEBP_PADRAO = 0.84;

function exportarCanvasParaWebp(
  canvas: HTMLCanvasElement,
  qualidade: number,
): Promise<Blob> {
  return new Promise((resolver, rejeitar) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolver(blob);
          return;
        }
        rejeitar(new Error("Não foi possível exportar a página do PDF como imagem."));
      },
      "image/webp",
      qualidade,
    );
  });
}

/**
 * Converte um arquivo PDF em imagens WebP otimizadas no navegador usando `pdfjs-dist`
 * carregado sob demanda (sem impactar o bundle inicial nem exigir processamento no servidor).
 */
export async function converterPdfParaImagensWebp(
  arquivoPdf: File,
  opcoes?: OpcoesConversaoPdf,
): Promise<readonly PaginaPdfConvertida[]> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new ErroValidacaoDominio(
      "A conversão de PDF só pode ser executada no navegador.",
      "AMBIENTE_CONVERSAO_PDF_INVALIDO",
    );
  }

  validarArquivoPdfCardapio(arquivoPdf);

  const larguraMaxima = opcoes?.larguraMaximaPx ?? LARGURA_MAXIMA_PADRAO_PX;
  const qualidade = opcoes?.qualidadeWebp ?? QUALIDADE_WEBP_PADRAO;
  const limitePaginas = opcoes?.limitePaginas ?? LIMITE_MAXIMO_PAGINAS_CARDAPIO;

  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }

  const buffer = await arquivoPdf.arrayBuffer();
  const tarefaCarregamento = pdfjs.getDocument({ data: buffer });
  const documento = await tarefaCarregamento.promise;

  try {
    if (documento.numPages === 0) {
      throw new ErroValidacaoDominio("O PDF enviado não contém páginas.", "PDF_VAZIO");
    }

    if (documento.numPages > limitePaginas) {
      throw new ErroValidacaoDominio(
        `O PDF possui ${documento.numPages} páginas. O limite atual é de ${limitePaginas} páginas por cardápio.`,
        "LIMITE_PAGINAS_PDF_EXCEDIDO",
      );
    }

    const resultados: PaginaPdfConvertida[] = [];

    for (let numeroPagina = 1; numeroPagina <= documento.numPages; numeroPagina++) {
      opcoes?.aoProgredir?.(numeroPagina, documento.numPages);

      const pagina = await documento.getPage(numeroPagina);
      const viewportBase = pagina.getViewport({ scale: 1 });
      const escala = Math.min(2.5, Math.max(1, larguraMaxima / viewportBase.width));
      const viewport = pagina.getViewport({ scale: escala });

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));

      const contexto = canvas.getContext("2d");
      if (!contexto) {
        throw new Error("Não foi possível inicializar o canvas para renderizar o PDF.");
      }

      await pagina.render({ canvas, canvasContext: contexto, viewport }).promise;
      const blob = await exportarCanvasParaWebp(canvas, qualidade);

      const arquivoImagem = new File([blob], `pagina-${numeroPagina}.webp`, {
        type: "image/webp",
        lastModified: Date.now(),
      });

      resultados.push({
        arquivo: arquivoImagem,
        largura: canvas.width,
        altura: canvas.height,
        numeroPagina,
      });

      pagina.cleanup();
    }

    return resultados;
  } finally {
    await tarefaCarregamento.destroy();
  }
}

