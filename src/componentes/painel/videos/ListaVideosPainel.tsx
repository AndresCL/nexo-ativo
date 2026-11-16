"use client";

import { ArrowDown, ArrowUp, Trash2, Video } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import {
  construirUrlEmbedYoutube,
  type VideoYoutubeItem,
} from "@/dominio/objetos-valor/videoYoutube";

interface PropriedadesListaVideosPainel {
  readonly videos: readonly VideoYoutubeItem[];
  readonly aoMover: (indice: number, direcao: "cima" | "baixo") => void;
  readonly aoRemover: (id: string) => void;
}

export function ListaVideosPainel({
  videos,
  aoMover,
  aoRemover,
}: PropriedadesListaVideosPainel) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-marfim-300 bg-marfim-50/50 p-10 text-center">
        <Video className="mb-3 h-8 w-8 text-mineral-400" aria-hidden="true" />
        <p className="text-sm font-medium text-mineral-900">Nenhum vídeo adicionado ainda</p>
        <p className="mt-1 text-xs text-mineral-600">
          Adicione 1 ou mais links do YouTube acima para exibir na sua vitrine.
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
            className="flex flex-col gap-4 rounded-2xl border border-marfim-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              {urlEmbed ? (
                <div className="aspect-video w-36 shrink-0 overflow-hidden rounded-xl border border-marfim-200 bg-black">
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

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-mineral-900">
                  {video.titulo || `Vídeo ${indice + 1}`}
                </p>
                <p className="truncate text-xs text-mineral-500">{video.url}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 self-end sm:self-center">
              <Botao
                type="button"
                variante="fantasma"
                disabled={indice === 0}
                onClick={() => aoMover(indice, "cima")}
                aria-label="Mover vídeo para cima"
              >
                <ArrowUp className="h-4 w-4" />
              </Botao>
              <Botao
                type="button"
                variante="fantasma"
                disabled={indice === videos.length - 1}
                onClick={() => aoMover(indice, "baixo")}
                aria-label="Mover vídeo para baixo"
              >
                <ArrowDown className="h-4 w-4" />
              </Botao>
              <Botao
                type="button"
                variante="fantasma"
                onClick={() => aoRemover(video.id)}
                aria-label="Remover vídeo"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Botao>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

