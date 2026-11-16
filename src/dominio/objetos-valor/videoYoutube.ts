export type ModoExibicaoVideos = "carrossel" | "fila";

export interface VideoYoutubeItem {
  readonly id: string;
  readonly url: string;
  readonly titulo?: string;
}

const PADRAO_ID_YOUTUBE = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extrai o identificador de 11 caracteres de um vídeo do YouTube a partir de
 * URLs padrão (watch?v=), encurtadas (youtu.be/), shorts ou embed.
 */
export function extrairIdVideoYoutube(entrada: string): string | null {
  const valor = entrada.trim();
  if (!valor) return null;

  if (PADRAO_ID_YOUTUBE.test(valor)) {
    return valor;
  }

  try {
    const url = new URL(valor.startsWith("http") ? valor : `https://${valor}`);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
      return PADRAO_ID_YOUTUBE.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const paramV = url.searchParams.get("v");
      if (paramV && PADRAO_ID_YOUTUBE.test(paramV)) {
        return paramV;
      }

      const segmentos = url.pathname.split("/").filter(Boolean);
      const prefixos = new Set(["embed", "shorts", "live", "v"]);
      const prefixo = segmentos[0];
      const id = segmentos[1];
      if (prefixo && id && prefixos.has(prefixo)) {
        return PADRAO_ID_YOUTUBE.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Constrói a URL de incorporação (iframe) do YouTube a partir de uma URL ou ID.
 */
export function construirUrlEmbedYoutube(
  urlOuId: string,
  opcoes?: { readonly autoplay?: boolean },
): string | null {
  const id = extrairIdVideoYoutube(urlOuId);
  if (!id) return null;
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    playsinline: "1",
  });
  if (opcoes?.autoplay) {
    params.set("autoplay", "1");
    params.set("mute", "1");
  }
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

/**
 * Retorna a URL da imagem de capa (thumbnail) de um vídeo do YouTube.
 */
export function construirUrlThumbnailYoutube(urlOuId: string): string | null {
  const id = extrairIdVideoYoutube(urlOuId);
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
