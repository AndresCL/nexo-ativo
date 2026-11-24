const PADRAO_NAVEGADOR_INTERNO =
  /Instagram|FBAN|FBAV|FB_IAB|WhatsApp|Line\/|TikTok|BytedanceWebview/i;

const PADRAO_DISPOSITIVO_MOVEL = /Android|iPhone|iPad|iPod|Mobi/i;

const PADRAO_URL_APP_NATIVO =
  /^https?:\/\/(www\.)?(maps\.google\.|google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|waze\.com|wa\.me|api\.whatsapp\.com)/i;

export function ehNavegadorInternoSocial(userAgent: string): boolean {
  return PADRAO_NAVEGADOR_INTERNO.test(userAgent);
}

export function deveAbrirNaMesmaJanela(url: string, userAgent: string): boolean {
  if (ehNavegadorInternoSocial(userAgent)) {
    return true;
  }
  return PADRAO_DISPOSITIVO_MOVEL.test(userAgent) && PADRAO_URL_APP_NATIVO.test(url);
}

/**
 * Abre um link externo evitando telas em branco ao retornar de apps nativos
 * (como Google Maps e WhatsApp) ou do navegador interno do Instagram/Facebook.
 */
export function abrirLinkExternoSeguro(url: string): void {
  if (typeof window === "undefined" || !url) return;

  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";

  if (deveAbrirNaMesmaJanela(url, userAgent)) {
    window.location.assign(url);
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

