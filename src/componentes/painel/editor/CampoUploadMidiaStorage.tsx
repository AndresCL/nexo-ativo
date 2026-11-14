"use client";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import { useId, useRef, useState, type ChangeEvent } from "react";
import { Trash2, Upload } from "lucide-react";
import type { PortaUploadMidiaEditorial } from "@/aplicacao/portas/portasEditorAparencia";
import {
  TIPOS_MIME_IMAGEM_PERMITIDOS,
  TIPOS_MIME_VIDEO_PERMITIDOS,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { Botao } from "@/componentes/interface/Botao";

export interface PropriedadesCampoUploadMidiaStorage {
  readonly organizacaoId: string;
  readonly rotulo: string;
  readonly textoAuxiliar?: string;
  readonly categoria: "imagem" | "video";
  readonly valorUrl: string;
  readonly obrigatorio?: boolean;
  readonly desabilitado?: boolean;
  readonly servicoUpload: PortaUploadMidiaEditorial;
  readonly aoAlterarUrl: (novaUrl: string) => void;
}

export function CampoUploadMidiaStorage({
  organizacaoId,
  rotulo,
  textoAuxiliar,
  categoria,
  valorUrl,
  obrigatorio = false,
  desabilitado = false,
  servicoUpload,
  aoAlterarUrl,
}: PropriedadesCampoUploadMidiaStorage) {
  const idBase = useId();
  const idCampoTexto = `${idBase}-url`;
  const idEntradaArquivo = `${idBase}-arquivo`;
  const referenciaEntradaArquivo = useRef<HTMLInputElement | null>(null);

  const [enviando, setEnviando] = useState(false);
  const [progressoPercentual, setProgressoPercentual] = useState<number>(0);

  const tiposAceitos =
    categoria === "video"
      ? TIPOS_MIME_VIDEO_PERMITIDOS.join(",")
      : TIPOS_MIME_IMAGEM_PERMITIDOS.join(",");

  async function aoEscolherArquivo(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) {
      return;
    }

    setEnviando(true);
    setProgressoPercentual(0);

    try {
      const resultado = await servicoUpload.enviarMidia({
        organizacaoId,
        arquivo,
        categoria,
        aoAtualizarProgresso: (percentual) => setProgressoPercentual(percentual),
      });

      aoAlterarUrl(resultado.urlPublica);
      notificar.sucesso("Arquivo enviado com sucesso.");
    } catch (erro) {
      const mensagem =
        erro instanceof Error
          ? erro.message
          : "Não foi possível enviar o arquivo. Verifique o formato e o tamanho.";
      notificar.erro(mensagem);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-marfim-300 bg-white p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={idCampoTexto} className="text-sm font-medium text-mineral-950">
          {rotulo}
          {obrigatorio ? (
            <span className="ml-1 text-destaque-terraco" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>

        <div className="flex items-center gap-2">
          <input
            ref={referenciaEntradaArquivo}
            id={idEntradaArquivo}
            type="file"
            accept={tiposAceitos}
            disabled={desabilitado || enviando}
            onChange={aoEscolherArquivo}
            className="sr-only"
          />
          <Botao
            variante="operacional_secundario"
            tamanho="compacto"
            carregando={enviando}
            textoCarregando={`Enviando (${progressoPercentual}%)`}
            disabled={desabilitado}
            onClick={() => referenciaEntradaArquivo.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{categoria === "video" ? "Enviar vídeo" : "Enviar imagem"}</span>
          </Botao>

          {!obrigatorio && valorUrl ? (
            <Botao
              variante="fantasma"
              tamanho="compacto"
              disabled={desabilitado || enviando}
              aria-label={`Remover ${rotulo.toLowerCase()}`}
              onClick={() => {
                aoAlterarUrl("");
              }}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </Botao>
          ) : null}
        </div>
      </div>

      {textoAuxiliar ? <p className="text-xs text-mineral-600">{textoAuxiliar}</p> : null}

      <input
        id={idCampoTexto}
        type="text"
        value={valorUrl}
        disabled={desabilitado || enviando}
        placeholder={
          categoria === "video"
            ? "Envie um MP4/WebM até 25 MB ou cole o endereço do vídeo"
            : "Envie WebP/JPEG/PNG/AVIF até 8 MB ou informe o endereço da imagem"
        }
        onChange={(evento) => {
          aoAlterarUrl(evento.target.value);
        }}
        className="min-h-10 w-full rounded-md border border-marfim-300 bg-marfim-50/50 px-3 py-2 text-xs text-mineral-900 placeholder:text-mineral-500 focus:border-mineral-950 focus:bg-white focus:outline-none disabled:opacity-60"
      />

      {enviando ? (
        <div
          role="progressbar"
          aria-valuenow={progressoPercentual}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso do envio de mídia"
          className="h-1.5 w-full overflow-hidden rounded-full bg-marfim-200"
        >
          <div
            style={{ width: `${progressoPercentual}%` }}
            className="h-full bg-mineral-950 transition-all duration-150"
          />
        </div>
      ) : null}
    </div>
  );
}
