"use client";

import { useState, type ChangeEvent } from "react";
import { FileText, ImagePlus, Loader2 } from "lucide-react";
import {
  LIMITE_MAXIMO_PAGINAS_CARDAPIO,
  type PaginaCardapio,
} from "@/dominio/entidades/cardapioDigital";
import {
  enviarPaginaCardapioStorage,
  enviarPdfOriginalCardapioStorage,
} from "@/infraestrutura/cardapio/servicoCardapioCliente";
import { converterPdfParaImagensWebp } from "@/utilitarios/converterPdfParaImagens";
import { otimizarImagemParaUpload } from "@/utilitarios/otimizarImagemUpload";

export interface ResultadoUploadCardapio {
  readonly paginas: readonly PaginaCardapio[];
  readonly urlPdfOriginal?: string;
  readonly caminhoPdfStorageOpcional?: string;
  readonly substituirExistentes: boolean;
}

interface PropriedadesUploadPaginasCardapio {
  readonly organizacaoId: string;
  readonly cardapioId: string;
  readonly quantidadeAtual: number;
  readonly aoConcluirUpload: (resultado: ResultadoUploadCardapio) => void;
  readonly aoErro: (mensagem: string) => void;
}

function lerDimensoesImagem(arquivo: File): Promise<{ largura: number; altura: number }> {
  return new Promise((resolver) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolver({
        largura: Math.max(1, img.naturalWidth || 1200),
        altura: Math.max(1, img.naturalHeight || 1600),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolver({ largura: 1200, altura: 1600 });
    };
    img.src = url;
  });
}

export function UploadPaginasCardapio({
  organizacaoId,
  cardapioId,
  quantidadeAtual,
  aoConcluirUpload,
  aoErro,
}: PropriedadesUploadPaginasCardapio) {
  const [progressoTexto, setProgressoTexto] = useState<string | null>(null);

  async function tratarSelecaoArquivos(evento: ChangeEvent<HTMLInputElement>) {
    const lista = evento.target.files;
    evento.target.value = "";
    if (!lista || lista.length === 0) return;

    const arquivos = Array.from(lista);
    const primeiro = arquivos[0];
    const ehPdf =
      primeiro &&
      (primeiro.type === "application/pdf" || primeiro.name.toLowerCase().endsWith(".pdf"));

    try {
      if (ehPdf && primeiro) {
        setProgressoTexto("Lendo PDF...");
        const convertidas = await converterPdfParaImagensWebp(primeiro, {
          aoProgredir: (atual, total) => setProgressoTexto(`Convertendo página ${atual} de ${total}...`),
        });

        setProgressoTexto("Enviando PDF original...");
        const pdfEnviado = await enviarPdfOriginalCardapioStorage(
          organizacaoId,
          cardapioId,
          primeiro,
        );

        const paginasEnviadas: PaginaCardapio[] = [];
        for (let i = 0; i < convertidas.length; i++) {
          const item = convertidas[i]!;
          setProgressoTexto(`Enviando página ${i + 1} de ${convertidas.length}...`);
          const upload = await enviarPaginaCardapioStorage(
            organizacaoId,
            cardapioId,
            item.arquivo,
            i,
          );
          paginasEnviadas.push({
            url: upload.url,
            largura: item.largura,
            altura: item.altura,
            ordem: i,
            caminhoStorageOpcional: upload.caminhoStorage,
          });
        }

        aoConcluirUpload({
          paginas: paginasEnviadas,
          urlPdfOriginal: pdfEnviado.url,
          caminhoPdfStorageOpcional: pdfEnviado.caminhoStorage,
          substituirExistentes: true,
        });
        return;
      }

      const vagasRestantes = LIMITE_MAXIMO_PAGINAS_CARDAPIO - quantidadeAtual;
      if (vagasRestantes <= 0) {
        aoErro(`Limite de ${LIMITE_MAXIMO_PAGINAS_CARDAPIO} páginas atingido.`);
        return;
      }

      const selecionadas = arquivos.slice(0, vagasRestantes);
      const novasPaginas: PaginaCardapio[] = [];

      for (let i = 0; i < selecionadas.length; i++) {
        const bruto = selecionadas[i]!;
        setProgressoTexto(`Otimizando e enviando imagem ${i + 1} de ${selecionadas.length}...`);
        const otimizado = await otimizarImagemParaUpload(bruto, {
          larguraMaximaPx: 1600,
          alturaMaximaPx: 2400,
          qualidade: 0.84,
        });
        const { largura, altura } = await lerDimensoesImagem(otimizado);
        const upload = await enviarPaginaCardapioStorage(
          organizacaoId,
          cardapioId,
          otimizado,
          quantidadeAtual + i,
        );
        novasPaginas.push({
          url: upload.url,
          largura,
          altura,
          ordem: quantidadeAtual + i,
          caminhoStorageOpcional: upload.caminhoStorage,
        });
      }

      aoConcluirUpload({
        paginas: novasPaginas,
        substituirExistentes: false,
      });
    } catch (erro) {
      aoErro(erro instanceof Error ? erro.message : "Não foi possível processar o arquivo.");
    } finally {
      setProgressoTexto(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-borda-sutil bg-superficie-elevada px-3.5 py-2 text-xs font-semibold text-texto-primario transition-colors hover:bg-superficie-hover">
          <FileText className="h-4 w-4" aria-hidden="true" />
          <span>Enviar PDF (até 15 MB)</span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            disabled={Boolean(progressoTexto)}
            onChange={tratarSelecaoArquivos}
            className="sr-only"
          />
        </label>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-borda-sutil bg-superficie-elevada px-3.5 py-2 text-xs font-semibold text-texto-primario transition-colors hover:bg-superficie-hover">
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          <span>Adicionar imagens</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={Boolean(progressoTexto)}
            onChange={tratarSelecaoArquivos}
            className="sr-only"
          />
        </label>
      </div>

      {progressoTexto ? (
        <div className="flex items-center gap-2 text-xs text-texto-secundario">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          <span>{progressoTexto}</span>
        </div>
      ) : (
        <p className="text-[11px] text-texto-secundario">
          O PDF é convertido automaticamente em páginas leves (WebP) para abrir instantaneamente no
          Instagram e no celular.
        </p>
      )}
    </div>
  );
}

