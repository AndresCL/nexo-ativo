import type { CSSProperties } from "react";
import { gerarVariaveisCssPaletaEditorial } from "@/dominio/entidades/paginaPublicada";
import {
  obterClasseRespiroAberturaExperiencias,
  obterDescritorFaixaInicioExperiencias,
} from "@/dominio/editorial/faixaInicioExperiencias";
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
  const descritorFaixa = obterDescritorFaixaInicioExperiencias(pagina.faixaInicioExperiencias);
  const classeRespiroAbertura = obterClasseRespiroAberturaExperiencias(
    pagina.faixaInicioExperiencias,
    { alturaContidaPrevia },
  );

  return (
    <section
      data-composicao="retrato_editorial"
      data-faixa-inicio={descritorFaixa.codigo}
      suppressHydrationWarning
      aria-label={`Retrato editorial de ${pagina.identidade.nomeExibicao}`}
      style={variaveisPaleta}
      className={combinarClasses(
        "@container animacao-suave-entrada relative isolate flex w-full flex-col overflow-hidden bg-[var(--editorial-fundo)] text-[var(--editorial-texto)]",
        alturaContidaPrevia ? "min-h-[44rem]" : "min-h-svh",
      )}
    >
      <CamadaMidiaImersiva
        midia={pagina.midiaFundo}
        paletaId={pagina.paletaId}
        modoMobile={modoMobileForcado}
        estiloEnquadramento="retrato_preservado"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 py-4 @3xl:px-10 @5xl:px-14 @5xl:py-11">
        <TransicaoEditorial className="shrink-0">
          <CabecalhoMarcaDiscreta
            identidade={pagina.identidade}
            tipografiaId={pagina.tipografiaId}
          />
        </TransicaoEditorial>

        <div
          data-testid="palco-experiencias-vitrine"
          className={combinarClasses(
            "flex w-full flex-col pb-10 @5xl:flex-1 @5xl:pb-0",
            classeRespiroAbertura,
          )}
        >
          {(pagina.avaliacoesGoogle?.posicao ?? "topo") === "topo" && complementoChamada ? (
            <TransicaoEditorial atrasoSegundos={0.06} className="w-full min-w-0 max-w-7xl mx-auto mb-2">
              {complementoChamada}
            </TransicaoEditorial>
          ) : null}

          <div
            className={combinarClasses(
              "border-t border-white/14 pt-4 sm:pt-6 @5xl:flex-1 @5xl:grid @5xl:grid-cols-12 @5xl:items-end @5xl:gap-12 @5xl:pt-8",
              descritorFaixa.classeAlinhamentoDesktop,
            )}
          >
            <TransicaoEditorial atrasoSegundos={0.06} className="hidden @5xl:col-span-7 @5xl:block">
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
                espacamentoAcoes={pagina.espacamentoAcoes}
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

          {(pagina.avaliacoesGoogle?.posicao ?? "topo") === "rodape" && complementoChamada ? (
            <TransicaoEditorial atrasoSegundos={0.14} className="w-full min-w-0 max-w-7xl mx-auto mt-4">
              {complementoChamada}
            </TransicaoEditorial>
          ) : null}
        </div>

        <RodapeEditorial
          identidade={pagina.identidade}
          className="mt-auto shrink-0 border-t border-[var(--editorial-borda)]/40 pt-4"
        />
      </div>
    </section>
  );
}
