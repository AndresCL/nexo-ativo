"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { BarraProgressoHorizontalDiscreta } from "@/componentes/interface/BarraProgressoHorizontalDiscreta";
import {
  deveIgnorarOtimizadorImagem,
  type FormatoBordaLogotipo,
} from "@/dominio/entidades/paginaPublicada";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { obterClasseBordaLogotipo } from "./IdentidadeETituloEditorial";

export interface PropriedadesTelaCarregamentoEditorial {
  readonly urlLogotipo?: string | null;
  readonly formatoBordaLogotipo?: FormatoBordaLogotipo;
  readonly nomeCliente?: string;
  readonly corDestaqueClasse?: string;
  readonly className?: string;
  readonly desvanecendo?: boolean;
  readonly variaveisCssPaleta?: Readonly<Record<string, string>>;
}

/**
 * Tela de carregamento editorial elegante com a identidade do cliente centralizada
 * e uma pequena barra de progresso horizontal infinita abaixo do logotipo.
 */
export function TelaCarregamentoEditorial({
  urlLogotipo,
  formatoBordaLogotipo,
  nomeCliente,
  corDestaqueClasse,
  className,
  desvanecendo = false,
  variaveisCssPaleta,
}: PropriedadesTelaCarregamentoEditorial) {
  const estiloContêiner: CSSProperties = {
    ...(variaveisCssPaleta as CSSProperties | undefined),
  };

  const classeBorda = obterClasseBordaLogotipo(formatoBordaLogotipo);
  const ehCirculo = formatoBordaLogotipo === "circulo";

  return (
    <div
      role="status"
      aria-label={nomeCliente ? `Carregando ${nomeCliente}...` : "Carregando..."}
      style={estiloContêiner}
      className={combinarClasses(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--editorial-fundo,#0f1110)] text-[var(--editorial-texto,#ffffff)] text-center select-none transition-opacity duration-500",
        desvanecendo ? "pointer-events-none opacity-0" : "opacity-100",
        className,
      )}
    >
      {urlLogotipo ? (
        ehCirculo ? (
          <div className="relative mb-5 h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-full overflow-hidden shadow-lg shadow-black/20">
            <Image
              src={urlLogotipo}
              alt={nomeCliente ? `Marca de ${nomeCliente}` : "Marca"}
              fill
              sizes="(max-width: 640px) 56px, 64px"
              priority
              loading="eager"
              unoptimized={deveIgnorarOtimizadorImagem(urlLogotipo)}
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className={combinarClasses(
              "relative mb-5 flex shrink-0 items-center justify-center",
              classeBorda,
            )}
          >
            <Image
              src={urlLogotipo}
              alt={nomeCliente ? `Marca de ${nomeCliente}` : "Marca"}
              width={255}
              height={58}
              priority
              loading="eager"
              unoptimized={deveIgnorarOtimizadorImagem(urlLogotipo)}
              className="h-10 max-h-14 w-auto max-w-[220px] object-contain drop-shadow-md sm:h-12"
            />
          </div>
        )
      ) : nomeCliente ? (
        <p className="mb-4 text-base font-medium tracking-wider text-current/90 sm:text-lg">
          {nomeCliente}
        </p>
      ) : null}

      <BarraProgressoHorizontalDiscreta
        variante="em_linha"
        corDestaqueClasse={corDestaqueClasse}
        className="h-0.5 w-28 sm:w-32"
      />
    </div>
  );
}
