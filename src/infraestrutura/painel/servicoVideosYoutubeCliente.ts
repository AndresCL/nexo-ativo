"use client";

import type { ModoExibicaoVideos, VideoYoutubeItem } from "@/dominio/objetos-valor/videoYoutube";

export interface ConfiguracaoVideosYoutube {
  readonly videos: readonly VideoYoutubeItem[];
  readonly modoExibicaoVideos: ModoExibicaoVideos;
  readonly autoplayVideos?: boolean;
  readonly ocultarTituloVideos?: boolean;
}

export async function carregarConfiguracaoVideos(
  _organizacaoId: string,
): Promise<ConfiguracaoVideosYoutube> {
  const resposta = await fetch("/api/painel/videos", { cache: "no-store" });
  if (!resposta.ok) {
    throw new Error("Erro ao carregar vídeos");
  }
  return (await resposta.json()) as ConfiguracaoVideosYoutube;
}

export async function salvarConfiguracaoVideos(
  _organizacaoId: string,
  configuracao: ConfiguracaoVideosYoutube,
): Promise<void> {
  const resposta = await fetch("/api/painel/videos", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(configuracao),
  });
  if (!resposta.ok) {
    throw new Error("Erro ao salvar vídeos");
  }
}
