"use client";

import { construirCssDegradadoEditorial } from "@/dominio/objetos-valor/degradadoEditorial";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import {
  deveIgnorarOtimizadorImagem,
  gerarVariaveisCssPaletaEditorial,
  type DestaqueObraGaleria,
} from "@/dominio/entidades/paginaPublicada";
import {
  blocoSistemaEstaVisivel,
  marcaEstaFixaNoTopo,
} from "@/dominio/editorial/ordemBlocosVitrine";
import { PontoFocalMidia } from "@/dominio/objetos-valor/pontoFocalMidia";
import { TransicaoEditorial } from "@/componentes/interface/TransicaoEditorial";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import type { PropriedadesComposicaoEditorial } from "./ComposicaoImersiva";
import { CabecalhoMarcaDiscreta } from "./IdentidadeETituloEditorial";
import { ListaBlocosVitrine } from "./ListaBlocosVitrine";
import { RodapeEditorial } from "./RodapeEditorial";
import { BlocoEquipeAposHero } from "./BlocoEquipeAposHero";

function obterAcervoCuradoria(
  obras: readonly DestaqueObraGaleria[],
  fallbackMidia: PropriedadesComposicaoEditorial["pagina"]["midiaFundo"],
  nomeExibicao: string,
): readonly DestaqueObraGaleria[] {
  if (obras.length > 0) {
    return obras;
  }

  return [
    {
      id: "obra-principal-fallback",
      tituloObra: nomeExibicao,
      serieOuCategoria: "Acervo Principal",
      urlImagem: fallbackMidia.urlPosterVideo ?? fallbackMidia.urlPrincipal,
      textoAlternativo: fallbackMidia.textoAlternativo,
      pontoFocal: fallbackMidia.pontoFocalDesktop,
    },
  ];
}

/**
 * Composição Galeria Editorial:
 * Inspirada em catálogos de exposição. Destaca uma obra emoldurada por vez com legenda
 * curatorial numerada, sem transformar a Home em uma grade comercial poluída.
 */
export function ComposicaoGaleriaEditorial({
  pagina,
  aoAcionarItem,
  alturaContidaPrevia = false,
  complementoChamada,
  previaEquipe,
  videosYoutube,
  modoExibicaoVideos,
  autoplayVideos,
  ocultarTituloVideos,
  produtos,
  servicos,
  aoSelecionarItemAcervo,
}: PropriedadesComposicaoEditorial) {
  const variaveisPaleta = gerarVariaveisCssPaletaEditorial(
    pagina.paletaId,
    pagina.corPersonalizadaHex,
    pagina.customizacaoTokens,
  ) as CSSProperties;
  const acervo = obterAcervoCuradoria(
    pagina.obrasDestaqueGaleria,
    pagina.midiaFundo,
    pagina.identidade.nomeExibicao,
  );

  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const obraAtiva = acervo[indiceAtivo] ?? acervo[0]!;
  const posicaoObraCss = PontoFocalMidia.criar(
    obraAtiva.pontoFocal.xPercentual,
    obraAtiva.pontoFocal.yPercentual,
  ).gerarPosicaoObjetoCss();

  const marcaNoTopo =
    marcaEstaFixaNoTopo(pagina.identidade) && blocoSistemaEstaVisivel("bloco:marca", pagina);

  return (
    <section
      data-composicao="galeria_editorial"
      aria-label={`Galeria editorial de ${pagina.identidade.nomeExibicao}`}
      style={variaveisPaleta}
      className={combinarClasses(
        "@container animacao-suave-entrada relative isolate flex w-full flex-col justify-between overflow-hidden bg-[var(--editorial-fundo)] text-[var(--editorial-texto)]",
        alturaContidaPrevia ? "min-h-[44rem]" : "min-h-dvh",
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-6 pt-7 pb-[max(1.75rem,env(safe-area-inset-bottom,0px))] @3xl:px-10 @5xl:px-14 @5xl:py-10">
        {marcaNoTopo ? (
          <TransicaoEditorial>
            <CabecalhoMarcaDiscreta
              identidade={pagina.identidade}
              tipografiaId={pagina.tipografiaId}
            />
          </TransicaoEditorial>
        ) : null}

        <div className="my-8 grid items-center gap-8 @5xl:my-10 @5xl:grid-cols-12 @5xl:gap-12">
          <TransicaoEditorial atrasoSegundos={0.05} className="@5xl:col-span-7">
            <figure className="overflow-hidden rounded-xs border border-current/12 bg-[var(--editorial-superficie)] p-3 @3xl:p-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {pagina.midiaFundo.tipo === "degradado" ? (
                  <div
                    className="h-full w-full"
                    style={{
                      background: construirCssDegradadoEditorial(
                        pagina.midiaFundo.degradadoOpcional,
                      ),
                    }}
                  />
                ) : (
                  <Image
                    src={obraAtiva.urlImagem}
                    alt={obraAtiva.textoAlternativo}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    unoptimized={deveIgnorarOtimizadorImagem(obraAtiva.urlImagem)}
                    className="object-cover transition-opacity duration-300"
                    style={{ objectPosition: posicaoObraCss }}
                  />
                )}
              </div>

              <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-xs">
                <div>
                  <span className="font-medium text-[var(--editorial-texto)]">
                    {String(indiceAtivo + 1).padStart(2, "0")} /{" "}
                    {String(acervo.length).padStart(2, "0")} — {obraAtiva.tituloObra}
                  </span>
                  <span className="ml-2 text-[var(--editorial-texto-secundario)]">
                    {obraAtiva.serieOuCategoria}
                  </span>
                </div>
                {obraAtiva.anoOuLocal ? (
                  <span className="text-[11px] tracking-[0.14em] text-[var(--editorial-texto-secundario)] uppercase">
                    {obraAtiva.anoOuLocal}
                  </span>
                ) : null}
              </figcaption>
            </figure>

            {acervo.length > 1 ? (
              <div
                role="group"
                aria-label="Selecionar obra em exposição"
                className="mt-3 flex flex-wrap items-center justify-center gap-2 @5xl:justify-start"
              >
                {acervo.map((obra, indice) => {
                  const selecionada = indice === indiceAtivo;
                  return (
                    <button
                      key={obra.id}
                      type="button"
                      aria-pressed={selecionada}
                      onClick={() => setIndiceAtivo(indice)}
                      className={combinarClasses(
                        "min-h-11 rounded-xs px-3 py-1.5 text-xs tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--editorial-texto)]",
                        selecionada
                          ? "bg-[var(--editorial-texto)] font-medium text-[var(--editorial-fundo)]"
                          : "border border-current/18 text-[var(--editorial-texto-secundario)] hover:text-[var(--editorial-texto)]",
                      )}
                    >
                      {String(indice + 1).padStart(2, "0")} · {obra.tituloObra}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </TransicaoEditorial>

          <TransicaoEditorial
            atrasoSegundos={0.1}
            className="flex min-w-0 flex-col justify-between gap-7 @5xl:col-span-5"
          >
            <BlocoEquipeAposHero
              acoes={pagina.acoesPrincipais}
              previaEquipe={previaEquipe}
              modoFundoEquipe={pagina.customizacaoTokens?.modoFundoEquipe}
              aoAcionarItem={aoAcionarItem}
            />

            <ListaBlocosVitrine
              pagina={pagina}
              complementoChamada={complementoChamada}
              previaEquipe={previaEquipe}
              videosYoutube={videosYoutube}
              modoExibicaoVideos={modoExibicaoVideos}
              autoplayVideos={autoplayVideos}
              ocultarTituloVideos={ocultarTituloVideos}
              produtos={produtos}
              servicos={servicos}
              aoAcionarItem={aoAcionarItem}
              aoSelecionarItemAcervo={aoSelecionarItemAcervo}
            />
          </TransicaoEditorial>
        </div>

        <RodapeEditorial
          identidade={pagina.identidade}
          className="mt-8 border-t border-[var(--editorial-borda)]/40 pt-4"
        />
      </div>
    </section>
  );
}
