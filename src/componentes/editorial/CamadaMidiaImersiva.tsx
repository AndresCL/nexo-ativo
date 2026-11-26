"use client";

import { construirCssDegradadoEditorial } from "@/dominio/objetos-valor/degradadoEditorial";

import Image from "next/image";
import { useEffect, useRef } from "react";
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
  nenhum: "bg-transparent",
  suave:
    "bg-gradient-to-t from-black/52 via-black/28 to-black/25 @5xl:bg-[linear-gradient(105deg,rgba(10,12,11,0.51)_0%,rgba(10,12,11,0.29)_48%,rgba(10,12,11,0.47)_100%)]",
  equilibrado:
    "bg-gradient-to-t from-black/72 via-black/42 to-black/38 @5xl:bg-[linear-gradient(105deg,rgba(10,12,11,0.70)_0%,rgba(10,12,11,0.40)_46%,rgba(10,12,11,0.66)_100%)]",
  intenso:
    "bg-gradient-to-t from-black/88 via-black/58 to-black/52 @5xl:bg-[linear-gradient(105deg,rgba(10,12,11,0.86)_0%,rgba(10,12,11,0.56)_50%,rgba(10,12,11,0.82)_100%)]",
};

const GRADIENTES_TEMA_CLARO: Readonly<Record<IntensidadeVeloEscuro, string>> = {
  nenhum: "bg-transparent",
  suave:
    "bg-gradient-to-t from-[#f7f4ee]/52 via-[#f7f4ee]/20 to-[#f7f4ee]/12 @5xl:bg-[linear-gradient(105deg,rgba(247,244,238,0.52)_0%,rgba(247,244,238,0.17)_50%,rgba(247,244,238,0.49)_100%)]",
  equilibrado:
    "bg-gradient-to-t from-[#f7f4ee]/72 via-[#f7f4ee]/34 to-[#f7f4ee]/20 @5xl:bg-[linear-gradient(105deg,rgba(247,244,238,0.70)_0%,rgba(247,244,238,0.28)_50%,rgba(247,244,238,0.66)_100%)]",
  intenso:
    "bg-gradient-to-t from-[#f7f4ee]/88 via-[#f7f4ee]/50 to-[#f7f4ee]/32 @5xl:bg-[linear-gradient(105deg,rgba(247,244,238,0.86)_0%,rgba(247,244,238,0.44)_50%,rgba(247,244,238,0.82)_100%)]",
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
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  if (midia.tipo === "degradado") {
    return (
      <div
        className={combinarClasses(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className,
        )}
        style={{ background: construirCssDegradadoEditorial(midia.degradadoOpcional) }}
        aria-hidden="true"
      >
        <div className={combinarClasses("absolute inset-0", classeVelo)} />
        <EfeitoCantosEditorial
          tipo={midiaResolvida.efeitoCantos}
          temaEscuro={paleta.temaEscuro}
          opacidadePercentual={midiaResolvida.opacidadeDotsCantos}
          tom={midiaResolvida.tomDotsCantos}
        />
      </div>
    );
  }

  const exibirVideo = Boolean(midiaResolvida.renderizarVideo && midiaResolvida.urlVideo);
  const exibirImagem = Boolean(
    !exibirVideo &&
      midiaResolvida.urlImagemEstatica &&
      midiaResolvida.urlImagemEstatica.trim() &&
      !midiaResolvida.urlImagemEstatica.includes("imersivo-arquitetura-luz"),
  );
  const temMidiaVisual = exibirVideo || exibirImagem;

  return (
    <div
      className={combinarClasses(
        "pointer-events-none absolute inset-0 overflow-hidden bg-[var(--editorial-fundo)]",
        className,
      )}
      aria-hidden={false}
    >
      {temMidiaVisual ? (
        <div className="relative w-full overflow-hidden">
          {exibirVideo && midiaResolvida.urlVideo ? (
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
              className="block h-auto w-full transition-opacity duration-700 ease-out opacity-100"
            >
              <source src={midiaResolvida.urlVideo} type="video/mp4" />
            </video>
          ) : exibirImagem && midiaResolvida.urlImagemEstatica ? (
            <Image
              src={midiaResolvida.urlImagemEstatica}
              alt={midiaResolvida.textoAlternativo || "Fotografia de apresentação editorial"}
              width={1600}
              height={900}
              priority
              fetchPriority="high"
              sizes="100vw"
              unoptimized={deveIgnorarOtimizadorImagem(midiaResolvida.urlImagemEstatica)}
              className="block h-auto w-full opacity-100"
            />
          ) : null}

          <div aria-hidden="true" className={combinarClasses("absolute inset-0", classeVelo)} />
          {classeVeloRetratoSuperior ? (
            <div
              aria-hidden="true"
              className={combinarClasses("absolute inset-0", classeVeloRetratoSuperior)}
            />
          ) : null}
          <div
            aria-hidden="true"
            data-testid="fade-inferior-midia-editorial"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--editorial-fundo) 55%, transparent) 55%, var(--editorial-fundo) 100%)",
            }}
          />
        </div>
      ) : (
        <div aria-hidden="true" className={combinarClasses("absolute inset-0", classeVelo)} />
      )}

      <EfeitoCantosEditorial
        tipo={midiaResolvida.efeitoCantos}
        temaEscuro={paleta.temaEscuro}
        opacidadePercentual={midiaResolvida.opacidadeDotsCantos}
        tom={midiaResolvida.tomDotsCantos}
      />
    </div>
  );
}
