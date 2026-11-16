import type { CSSProperties } from "react";
import { gerarVariaveisCssPaletaEditorial } from "@/dominio/entidades/paginaPublicada";
import { TransicaoEditorial } from "@/componentes/interface/TransicaoEditorial";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { BarraRedesSociaisDiscreta } from "./BarraRedesSociaisDiscreta";
import { CamadaMidiaImersiva } from "./CamadaMidiaImersiva";
import type { PropriedadesComposicaoEditorial } from "./ComposicaoImersiva";
import { CabecalhoMarcaDiscreta } from "./IdentidadeETituloEditorial";
import { NavegacaoAcoesHome } from "./NavegacaoAcoesHome";
import { RodapeEditorial } from "./RodapeEditorial";
import { BlocoEquipeAposHero } from "./BlocoEquipeAposHero";

/**
 * Composição Retrato Editorial:
 * Preserva a zona superior central onde o rosto do profissional está enquadrado
 * via PontoFocalMidia, concentrando título e convites comerciais no terço inferior.
 */
export function ComposicaoRetratoEditorial({
  pagina,
  modoMobileForcado = false,
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

  return (
    <section
      data-composicao="retrato_editorial"
      suppressHydrationWarning
      aria-label={`Retrato editorial de ${pagina.identidade.nomeExibicao}`}
      style={variaveisPaleta}
      className={combinarClasses(
        "@container animacao-suave-entrada relative isolate flex w-full flex-col justify-between overflow-hidden bg-[var(--editorial-fundo)] text-[var(--editorial-texto)]",
        alturaContidaPrevia ? "min-h-[44rem]" : "min-h-dvh",
      )}
    >
      <CamadaMidiaImersiva
        midia={pagina.midiaFundo}
        paletaId={pagina.paletaId}
        modoMobile={modoMobileForcado}
        estiloEnquadramento="retrato_preservado"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-5 py-4 @3xl:px-10 @5xl:px-14 @5xl:py-11">
        <TransicaoEditorial>
          <CabecalhoMarcaDiscreta
            identidade={pagina.identidade}
            tipografiaId={pagina.tipografiaId}
          />
        </TransicaoEditorial>

        {/* Reserva calculada de respiro visual para valorizar o retrato sem empurrar botões excessivamente */}
        <div
          data-testid="respiro-enquadramento-retrato"
          aria-hidden="true"
          className="min-h-24 flex-1 sm:min-h-36 @5xl:min-h-56"
        />

        <div className="border-t border-white/14 pt-4 sm:pt-6 @5xl:grid @5xl:grid-cols-12 @5xl:items-end @5xl:gap-12 @5xl:pt-8">
          <TransicaoEditorial atrasoSegundos={0.06} className="@5xl:col-span-7">
            {complementoChamada}
            <BlocoEquipeAposHero
              acoes={pagina.acoesPrincipais}
              previaEquipe={previaEquipe}
              aoAcionarItem={aoAcionarItem}
            />
            <BarraRedesSociaisDiscreta redes={pagina.redesSociais} className="mt-4" />
          </TransicaoEditorial>

          <TransicaoEditorial atrasoSegundos={0.12} className="mt-7 @5xl:col-span-5 @5xl:mt-0">
            <NavegacaoAcoesHome
              acoes={pagina.acoesPrincipais}
              previaEquipe={previaEquipe}
              videosYoutube={videosYoutube}
              modoExibicaoVideos={modoExibicaoVideos}
              autoplayVideos={autoplayVideos}
              ocultarTituloVideos={ocultarTituloVideos}
              produtos={produtos}
              servicos={servicos}
              paletaId={pagina.paletaId}
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
