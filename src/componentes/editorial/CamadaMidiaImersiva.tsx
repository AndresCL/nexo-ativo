"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  deveIgnorarOtimizadorImagem,
  obterDescritorPaletaEditorial,
  resolverMidiaEfetivaHome,
  type IdentificadorPaletaEditorial,
  type IntensidadeVeloEscuro,
  type MidiaFundoEditorial,
} from "@/dominio/entidades/paginaPublicada";
import { usePreferenciaMovimentoReduzido } from "@/ganchos/usarPreferenciaMovimentoReduzido";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { EfeitoCantosEditorial } from "./EfeitoCantosEditorial";

export interface PropriedadesCamadaMidiaImersiva {
  readonly midia: MidiaFundoEditorial;
  readonly paletaId: IdentificadorPaletaEditorial;
  readonly modoMobile?: boolean;
  readonly estiloEnquadramento?: "tela_cheia" | "retrato_preservado";
  readonly className?: string;
}

const GRADIENTES_TEMA_ESCURO: Readonly<Record<IntensidadeVeloEscuro, string>> = {
  suave:
    "bg-gradient-to-t from-black/88 via-black/48 to-black/42 @5xl:bg-[linear-gradient(105deg,rgba(10,12,11,0.85)_0%,rgba(10,12,11,0.48)_48%,rgba(10,12,11,0.78)_100%)]",
  equilibrado:
    "bg-gradient-to-t from-black/95 via-black/60 to-black/52 @5xl:bg-[linear-gradient(105deg,rgba(10,12,11,0.92)_0%,rgba(10,12,11,0.55)_46%,rgba(10,12,11,0.88)_100%)]",
  intenso:
    "bg-gradient-to-t from-black/98 via-black/72 to-black/65 @5xl:bg-[linear-gradient(105deg,rgba(10,12,11,0.96)_0%,rgba(10,12,11,0.68)_50%,rgba(10,12,11,0.94)_100%)]",
};

const GRADIENTES_TEMA_CLARO: Readonly<Record<IntensidadeVeloEscuro, string>> = {
  suave:
    "bg-gradient-to-t from-[#f7f4ee]/88 via-[#f7f4ee]/35 to-[#f7f4ee]/20 @5xl:bg-[linear-gradient(105deg,rgba(247,244,238,0.86)_0%,rgba(247,244,238,0.28)_50%,rgba(247,244,238,0.82)_100%)]",
  equilibrado:
    "bg-gradient-to-t from-[#f7f4ee]/94 via-[#f7f4ee]/50 to-[#f7f4ee]/28 @5xl:bg-[linear-gradient(105deg,rgba(247,244,238,0.92)_0%,rgba(247,244,238,0.42)_50%,rgba(247,244,238,0.88)_100%)]",
  intenso:
    "bg-gradient-to-t from-[#f7f4ee]/97 via-[#f7f4ee]/66 to-[#f7f4ee]/40 @5xl:bg-[linear-gradient(105deg,rgba(247,244,238,0.96)_0%,rgba(247,244,238,0.58)_50%,rgba(247,244,238,0.94)_100%)]",
};

export function CamadaMidiaImersiva({
  midia,
  paletaId,
  modoMobile = false,
  estiloEnquadramento = "tela_cheia",
  className,
}: PropriedadesCamadaMidiaImersiva) {
  const movimentoReduzido = usePreferenciaMovimentoReduzido();
  const paleta = obterDescritorPaletaEditorial(paletaId);
  const [midiaPronta, setMidiaPronta] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Garante visibilidade suave mesmo se o evento de load não disparar por cache
    const temporizadorSeguranca = setTimeout(() => {
      setMidiaPronta(true);
    }, 450);
    return () => clearTimeout(temporizadorSeguranca);
  }, [midia]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Força atributos nativos do DOM para contornar restrições estritas de autoplay no Safari/Chrome
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    const iniciarReproducao = async () => {
      try {
        await video.play();
      } catch {
        // Falhas não bloqueiam a renderização
      }
    };

    iniciarReproducao();
  }, [midia.urlPrincipal]);

  const midiaResolvida = resolverMidiaEfetivaHome(midia, {
    modoMobile,
    movimentoReduzido,
  });

  const classeVelo = paleta.temaEscuro
    ? GRADIENTES_TEMA_ESCURO[midiaResolvida.intensidadeVeloEscuro]
    : GRADIENTES_TEMA_CLARO[midiaResolvida.intensidadeVeloEscuro];

  const classeVeloRetratoSuperior =
    estiloEnquadramento === "retrato_preservado"
      ? paleta.temaEscuro
        ? "bg-[radial-gradient(circle_at_50%_26%,transparent_20%,rgba(12,10,9,0.58)_76%)]"
        : "bg-[radial-gradient(circle_at_50%_26%,transparent_20%,rgba(247,244,238,0.65)_78%)]"
      : null;

  return (
    <div
      className={combinarClasses(
        "pointer-events-none absolute inset-0 overflow-hidden bg-[var(--editorial-fundo)]",
        className,
      )}
      aria-hidden={false}
    >
      {midiaResolvida.renderizarVideo && midiaResolvida.urlVideo ? (
        <video
          ref={videoRef}
          data-testid="video-fundo-editorial"
          poster={midiaResolvida.urlImagemEstatica}
          aria-label={midiaResolvida.textoAlternativo}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src={midiaResolvida.urlVideo}
          className="h-full w-full object-cover transition-opacity duration-700 ease-out opacity-100"
          style={{ objectPosition: midiaResolvida.posicaoObjetoCss }}
        >
          <source src={midiaResolvida.urlVideo} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={midiaResolvida.urlImagemEstatica}
          alt={midiaResolvida.textoAlternativo}
          fill
          priority
          sizes="100vw"
          unoptimized={deveIgnorarOtimizadorImagem(midiaResolvida.urlImagemEstatica)}
          onLoad={() => setMidiaPronta(true)}
          className={combinarClasses(
            "object-cover transition-opacity duration-700 ease-out",
            midiaPronta ? "opacity-100" : "opacity-0",
          )}
          style={{ objectPosition: midiaResolvida.posicaoObjetoCss }}
        />
      )}

      <div aria-hidden="true" className={combinarClasses("absolute inset-0", classeVelo)} />
      {classeVeloRetratoSuperior ? (
        <div
          aria-hidden="true"
          className={combinarClasses("absolute inset-0", classeVeloRetratoSuperior)}
        />
      ) : null}

      <EfeitoCantosEditorial tipo={midiaResolvida.efeitoCantos} temaEscuro={paleta.temaEscuro} />
    </div>
  );
}
