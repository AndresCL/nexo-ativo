"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import {
  construirUrlEmbedYoutube,
  construirUrlThumbnailYoutube,
  type ModoExibicaoVideos,
  type VideoYoutubeItem,
} from "@/dominio/objetos-valor/videoYoutube";
import { combinarClasses } from "@/utilitarios/combinarClasses";

interface PropriedadesSecaoVideosYoutube {
  readonly videos: readonly VideoYoutubeItem[];
  readonly modoExibicao?: ModoExibicaoVideos;
  readonly autoplay?: boolean;
  readonly tituloSecao?: string;
}

function CartaoVideoYoutube({
  video,
  indice,
  autoplay,
  larguraCheia = false,
  estaTocando,
  aoIniciarReproducao,
}: {
  readonly video: VideoYoutubeItem;
  readonly indice: number;
  readonly autoplay?: boolean;
  readonly larguraCheia?: boolean;
  readonly estaTocando: boolean;
  readonly aoIniciarReproducao: () => void;
}) {
  const urlEmbed = construirUrlEmbedYoutube(video.url, {
    autoplay: autoplay || estaTocando,
  });
  const urlThumbnail = construirUrlThumbnailYoutube(video.url);

  if (!urlEmbed) return null;

  const rotuloTitulo = video.titulo || `Vídeo ${indice + 1}`;

  return (
    <article
      role="group"
      aria-roledescription="slide"
      aria-label={rotuloTitulo}
      className={combinarClasses(
        "space-y-1.5 transition-all select-none",
        larguraCheia
          ? "w-full"
          : "w-[82%] sm:w-[85%] shrink-0 snap-start"
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[var(--editorial-borda)] bg-black shadow-md">
        {estaTocando ? (
          <iframe
            src={urlEmbed}
            title={rotuloTitulo}
            className="h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={aoIniciarReproducao}
            aria-label={`Reproduzir ${rotuloTitulo}`}
            className="group relative h-full w-full cursor-pointer focus:outline-hidden"
          >
            {urlThumbnail ? (
              <Image
                src={urlThumbnail}
                alt=""
                fill
                sizes="(max-width: 640px) 85vw, 600px"
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-stone-900" />
            )}

            {/* Degradê sutil para contraste */}
            <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/15" />

            {/* Botão de play editorial premium */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-black/60 text-white shadow-lg backdrop-blur-xs transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                <Play className="ml-0.5 h-5 w-5 fill-white stroke-none" aria-hidden="true" />
              </span>
            </div>
          </button>
        )}
      </div>

      {video.titulo ? (
        <p className="line-clamp-1 px-1 text-xs font-medium text-texto-secundario">
          {video.titulo}
        </p>
      ) : null}
    </article>
  );
}

export function SecaoVideosYoutube({
  videos,
  modoExibicao = "carrossel",
  autoplay = false,
  tituloSecao,
}: PropriedadesSecaoVideosYoutube) {
  const [videoEmReproducaoId, setVideoEmReproducaoId] = useState<string | null>(null);

  const videosValidos = videos.filter((v) => construirUrlEmbedYoutube(v.url) !== null);
  if (videosValidos.length === 0) return null;

  const ehModoFila = modoExibicao === "fila" || videosValidos.length === 1;

  return (
    <section className="w-full space-y-3" aria-label={tituloSecao || "Vídeos"}>
      {tituloSecao ? (
        <h2 className="px-1 text-sm font-semibold tracking-tight text-texto-primario">
          {tituloSecao}
        </h2>
      ) : null}

      {ehModoFila ? (
        <div className="space-y-4">
          {videosValidos.map((video, indice) => (
            <CartaoVideoYoutube
              key={video.id}
              video={video}
              indice={indice}
              autoplay={autoplay}
              larguraCheia
              estaTocando={videoEmReproducaoId === video.id}
              aoIniciarReproducao={() => setVideoEmReproducaoId(video.id)}
            />
          ))}
        </div>
      ) : (
        <div
          role="region"
          aria-roledescription="carrossel"
          aria-label="Carrossel de vídeos"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1.5 pt-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-scrollbar]:hidden"
        >
          {videosValidos.map((video, indice) => (
            <CartaoVideoYoutube
              key={video.id}
              video={video}
              indice={indice}
              autoplay={autoplay}
              larguraCheia={false}
              estaTocando={videoEmReproducaoId === video.id}
              aoIniciarReproducao={() => setVideoEmReproducaoId(video.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
