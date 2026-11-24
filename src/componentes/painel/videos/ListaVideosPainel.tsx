"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2, Video } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import {
  construirUrlEmbedYoutube,
  type VideoYoutubeItem,
} from "@/dominio/objetos-valor/videoYoutube";

interface PropriedadesListaVideosPainel {
  readonly videos: readonly VideoYoutubeItem[];
  readonly aoEditar: (video: VideoYoutubeItem) => void;
  readonly aoMover: (indice: number, direcao: "cima" | "baixo") => void;
  readonly aoRemover: (id: string) => void;
}

export function ListaVideosPainel({
  videos,
  aoEditar,
  aoMover,
  aoRemover,
}: PropriedadesListaVideosPainel) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-2xs">
        <Video className="mb-3 h-8 w-8 text-mineral-400" aria-hidden="true" />
        <p className="text-sm font-semibold text-mineral-950">Nenhum vídeo adicionado ainda</p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-mineral-500">
          Clique em “Novo vídeo” para adicionar um link do YouTube na sua vitrine.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {videos.map((video, indice) => {
        const urlEmbed = construirUrlEmbedYoutube(video.url);
        return (
          <li
            key={video.id}
            className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3.5">
              {urlEmbed ? (
                <div className="aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-black shadow-xs">
                  <iframe
                    src={urlEmbed}
                    title={video.titulo ?? `Vídeo ${indice + 1}`}
                    className="h-full w-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : null}

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-mineral-950">
                  {video.titulo || `Vídeo ${indice + 1}`}
                </p>
                <p className="truncate text-[11px] text-mineral-500">{video.url}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 self-end sm:self-center">
              <Botao
                type="button"
                variante="fantasma"
                tamanho="compacto"
                onClick={() => aoEditar(video)}
                aria-label="Editar vídeo"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Botao>
              <Botao
                type="button"
                variante="fantasma"
                tamanho="compacto"
                disabled={indice === 0}
                onClick={() => aoMover(indice, "cima")}
                aria-label="Mover vídeo para cima"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Botao>
              <Botao
                type="button"
                variante="fantasma"
                tamanho="compacto"
                disabled={indice === videos.length - 1}
                onClick={() => aoMover(indice, "baixo")}
                aria-label="Mover vídeo para baixo"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </Botao>
              <Botao
                type="button"
                variante="fantasma"
                tamanho="compacto"
                onClick={() => aoRemover(video.id)}
                aria-label="Remover vídeo"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Botao>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

