"use client";

import { Send } from "lucide-react";
import { compartilharUrlComFallback } from "@/utilitarios/compartilharUrl";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { useAmbienteVitrine } from "./contextoAmbienteVitrine";

export interface PropriedadesBotaoCompartilharVitrine {
  readonly identificadorPublico: string;
  readonly nomeExibicao: string;
  readonly subtituloCurto?: string;
  readonly className?: string;
  readonly classeIcone?: string;
}

function resolverUrlPublicaVitrine(
  identificadorPublico: string,
  modoPrevia: boolean,
): string {
  if (typeof window === "undefined") {
    return `/${identificadorPublico}`;
  }

  if (modoPrevia || window.location.pathname.startsWith("/painel")) {
    return `${window.location.origin}/${identificadorPublico}`;
  }

  return window.location.href;
}

export function BotaoCompartilharVitrine({
  identificadorPublico,
  nomeExibicao,
  subtituloCurto,
  className,
  classeIcone = "h-5 w-5",
}: PropriedadesBotaoCompartilharVitrine) {
  const { modoPrevia } = useAmbienteVitrine();

  async function handleCompartilhar() {
    const url = resolverUrlPublicaVitrine(identificadorPublico, modoPrevia);
    await compartilharUrlComFallback({
      titulo: nomeExibicao,
      texto: subtituloCurto || `Confira a vitrine de ${nomeExibicao}`,
      url,
    });
  }

  return (
    <button
      type="button"
      onClick={handleCompartilhar}
      aria-label={`Compartilhar ${nomeExibicao}`}
      title="Compartilhar"
      className={combinarClasses(
        "inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--editorial-texto-secundario)] transition-colors duration-150 hover:text-[var(--editorial-texto)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--editorial-texto)]",
        className,
      )}
    >
      <Send className={classeIcone} strokeWidth={1.7} aria-hidden="true" />
    </button>
  );
}
