"use client";

import Image from "next/image";
import { useState } from "react";
import type { CoordenadasPontoFocal } from "@/dominio/entidades/paginaPublicada";
import { deveIgnorarOtimizadorImagem } from "@/dominio/entidades/paginaPublicada";
import { PontoFocalMidia } from "@/dominio/objetos-valor/pontoFocalMidia";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export type TamanhoAvatarProfissional = "compacto" | "medio" | "grande" | "destaque";

export interface PropriedadesAvatarProfissional {
  readonly urlFoto?: string;
  readonly nome: string;
  readonly pontoFocal?: CoordenadasPontoFocal;
  readonly tamanho?: TamanhoAvatarProfissional;
  readonly formato?: "circular" | "arredondado";
  readonly className?: string;
  readonly prioridade?: boolean;
}

const MAPA_CLASSES_TAMANHO: Record<
  TamanhoAvatarProfissional,
  { container: string; sizes: string; texto: string }
> = {
  compacto: {
    container: "h-10 w-10",
    sizes: "40px",
    texto: "text-xs font-semibold",
  },
  medio: {
    container: "h-14 w-14",
    sizes: "56px",
    texto: "text-sm font-semibold",
  },
  grande: {
    container: "h-16 w-16 sm:h-20 sm:w-20",
    sizes: "(max-width: 640px) 64px, 80px",
    texto: "text-base font-semibold",
  },
  destaque: {
    container: "h-24 w-24 sm:h-28 sm:w-28",
    sizes: "(max-width: 640px) 96px, 112px",
    texto: "text-xl font-bold",
  },
};

function extrairIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0];
  if (!primeira) return "—";
  if (partes.length === 1) return primeira.slice(0, 2).toUpperCase();
  const ultima = partes[partes.length - 1];
  return `${primeira[0] ?? ""}${ultima?.[0] ?? ""}`.toUpperCase();
}

export function AvatarProfissional(propriedades: PropriedadesAvatarProfissional) {
  return <AvatarComEstado key={propriedades.urlFoto ?? ""} {...propriedades} />;
}

function AvatarComEstado({
  urlFoto,
  nome,
  pontoFocal,
  tamanho = "medio",
  formato = "circular",
  className,
  prioridade = false,
}: PropriedadesAvatarProfissional) {
  const [falhaFoto, setFalhaFoto] = useState(false);
  const configTamanho = MAPA_CLASSES_TAMANHO[tamanho] ?? MAPA_CLASSES_TAMANHO.medio;
  const posicaoFoto = pontoFocal
    ? PontoFocalMidia.criar(pontoFocal.xPercentual, pontoFocal.yPercentual).gerarPosicaoObjetoCss()
    : "50% 50%";
  const ehLogo = urlFoto ? urlFoto.includes("logo") : false;

  return (
    <span
      aria-label={`Foto de perfil de ${nome}`}
      className={combinarClasses(
        "relative inline-block shrink-0 overflow-hidden border border-white/20 bg-white/10 select-none",
        formato === "circular" ? "rounded-full" : "rounded-2xl",
        configTamanho.container,
        className,
      )}
    >
      {urlFoto && !falhaFoto ? (
        <Image
          src={urlFoto}
          alt={nome}
          fill
          priority={prioridade}
          sizes={configTamanho.sizes}
          unoptimized={deveIgnorarOtimizadorImagem(urlFoto)}
          style={{ objectPosition: posicaoFoto }}
          className={ehLogo ? "object-contain p-2" : "object-cover"}
          onError={() => setFalhaFoto(true)}
        />
      ) : (
        <span
          className={combinarClasses(
            "flex h-full w-full items-center justify-center tracking-wider text-white/90",
            configTamanho.texto,
          )}
        >
          {extrairIniciais(nome)}
        </span>
      )}
    </span>
  );
}
