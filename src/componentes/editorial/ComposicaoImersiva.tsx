import type { CSSProperties, ReactNode } from "react";
import {
  gerarVariaveisCssPaletaEditorial,
  type ConteudoPaginaPublicada,
} from "@/dominio/entidades/paginaPublicada";
import {
  obterClasseRespiroAberturaExperiencias,
  obterDescritorFaixaInicioExperiencias,
  resolverPosicaoCabecalhoMarca,
} from "@/dominio/editorial/faixaInicioExperiencias";
import {
  blocoSistemaEstaVisivel,
  marcaEstaFixaNoTopo,
} from "@/dominio/editorial/ordemBlocosVitrine";
import { TransicaoEditorial } from "@/componentes/interface/TransicaoEditorial";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { CamadaMidiaImersiva } from "./CamadaMidiaImersiva";
import { CabecalhoMarcaDiscreta } from "./IdentidadeETituloEditorial";
import { ListaBlocosVitrine } from "./ListaBlocosVitrine";
import { RodapeEditorial } from "./RodapeEditorial";
import type { PreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";
import type { ManipuladorAcaoHome } from "./AcaoEquipeVitrine";
import { BlocoEquipeAposHero } from "./BlocoEquipeAposHero";
import type { ModoExibicaoVideos, VideoYoutubeItem } from "@/dominio/objetos-valor/videoYoutube";
import type { ProdutoCatalogo, ServicoOrganizacao } from "@/dominio/entidades/catalogoConteudo";

export interface PropriedadesComposicaoEditorial {
  readonly complementoChamada?: ReactNode;
  readonly pagina: ConteudoPaginaPublicada;
  readonly modoMobileForcado?: boolean;
  readonly aoAcionarItem?: ManipuladorAcaoHome;
  readonly aoSelecionarItemAcervo?: (tipo: "produtos" | "servicos", itemId: string) => void;
  readonly previaEquipe?: PreviaEquipeVitrine;
  readonly videosYoutube?: readonly VideoYoutubeItem[];
  readonly modoExibicaoVideos?: ModoExibicaoVideos;
  readonly autoplayVideos?: boolean;
  readonly ocultarTituloVideos?: boolean;
  readonly produtos?: readonly ProdutoCatalogo[];
  readonly servicos?: readonly ServicoOrganizacao[];
  readonly alturaContidaPrevia?: boolean;
}

export function ComposicaoImersiva({
  pagina,
  modoMobileForcado = false,
  aoAcionarItem,
  aoSelecionarItemAcervo,
  alturaContidaPrevia = false,
  complementoChamada,
  previaEquipe,
  videosYoutube,
  modoExibicaoVideos,
  autoplayVideos,
  ocultarTituloVideos,
  produtos,
  servicos,
}: PropriedadesComposicaoEditorial) {
  const variaveisPaleta = gerarVariaveisCssPaletaEditorial(
    pagina.paletaId,
    pagina.corPersonalizadaHex,
    pagina.customizacaoTokens,
  ) as CSSProperties;
  const descritorFaixa = obterDescritorFaixaInicioExperiencias(pagina.faixaInicioExperiencias);
  const posicaoCabecalho = resolverPosicaoCabecalhoMarca(pagina.identidade.posicaoCabecalho);
  const marcaNoTopo =
    marcaEstaFixaNoTopo(pagina.identidade) && blocoSistemaEstaVisivel("bloco:marca", pagina);
  const classeRespiroAbertura = obterClasseRespiroAberturaExperiencias(
    pagina.faixaInicioExperiencias,
    { alturaContidaPrevia, marcaNoTopo },
  );

  return (
    <section
      data-composicao="imersivo"
      data-faixa-inicio={descritorFaixa.codigo}
      data-posicao-cabecalho={posicaoCabecalho}
      suppressHydrationWarning
      aria-label={`Apresentação editorial de ${pagina.identidade.nomeExibicao}`}
      style={variaveisPaleta}
      className={combinarClasses(
        "@container animacao-suave-entrada relative isolate flex w-full flex-col overflow-hidden bg-[var(--editorial-fundo)] text-[var(--editorial-texto)]",
        alturaContidaPrevia ? "min-h-[44rem]" : "min-h-dvh",
      )}
    >
      <CamadaMidiaImersiva
        midia={pagina.midiaFundo}
        paletaId={pagina.paletaId}
        modoMobile={modoMobileForcado}
        estiloEnquadramento="tela_cheia"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] @3xl:px-10 @5xl:px-14 @5xl:py-6">
        {marcaNoTopo ? (
          <TransicaoEditorial className="shrink-0">
            <CabecalhoMarcaDiscreta
              identidade={pagina.identidade}
              tipografiaId={pagina.tipografiaId}
              varianteEspacamento="faixa_topo"
            />
          </TransicaoEditorial>
        ) : null}

        <div
          data-testid="palco-experiencias-vitrine"
          className={combinarClasses(
            "flex w-full flex-col pb-10 @5xl:flex-1 @5xl:pb-0",
            classeRespiroAbertura,
          )}
        >
          <div
            className={combinarClasses(
              "grid items-center gap-5 @5xl:flex-1 @5xl:grid-cols-12 @5xl:gap-x-12 @5xl:gap-y-4 @5xl:py-4",
              descritorFaixa.classeAlinhamentoDesktop,
            )}
          >
            <TransicaoEditorial atrasoSegundos={0.06} className="hidden @5xl:col-span-7 @5xl:block">
              <BlocoEquipeAposHero
                acoes={pagina.acoesPrincipais}
                previaEquipe={previaEquipe}
                modoFundoEquipe={pagina.customizacaoTokens?.modoFundoEquipe}
                aoAcionarItem={aoAcionarItem}
              />
            </TransicaoEditorial>

            <TransicaoEditorial atrasoSegundos={0.12} className="min-w-0 @5xl:col-span-5 @5xl:col-start-8">
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
        </div>

        <RodapeEditorial
          identidade={pagina.identidade}
          className="mt-auto shrink-0 border-t border-[var(--editorial-borda)]/50 pt-4.5"
        />
      </div>
    </section>
  );
}
