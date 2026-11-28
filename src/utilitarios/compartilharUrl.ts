import { copiarTextoComAviso } from "@/componentes/interface/notificacoes/copiarTextoComAviso";

export interface DadosCompartilhamentoUrl {
  readonly titulo: string;
  readonly texto?: string;
  readonly url: string;
}

/**
 * Compartilha uma URL usando a Web Share API nativa (`navigator.share`).
 * Caso o navegador não suporte ou falhe por indisponibilidade, copia o link com aviso.
 */
export async function compartilharUrlComFallback({
  titulo,
  texto,
  url,
}: DadosCompartilhamentoUrl): Promise<void> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: titulo,
        ...(texto ? { text: texto } : {}),
        url,
      });
      return;
    } catch (erro) {
      if (erro instanceof Error && erro.name === "AbortError") {
        return;
      }
    }
  }

  await copiarTextoComAviso(url);
}

