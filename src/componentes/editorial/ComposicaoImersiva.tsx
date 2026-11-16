import type { CSSProperties, ReactNode } from "react";
import {
  gerarVariaveisCssPaletaEditorial,
  type ConteudoPaginaPublicada,
} from "@/dominio/entidades/paginaPublicada";
import { TransicaoEditorial } from "@/componentes/interface/TransicaoEditorial";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { BarraRedesSociaisDiscreta } from "./BarraRedesSociaisDiscreta";
import { CamadaMidiaImersiva } from "./CamadaMidiaImersiva";
import { CabecalhoMarcaDiscreta } from "./IdentidadeETituloEditorial";
import { NavegacaoAcoesHome } from "./NavegacaoAcoesHome";
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

  return (
    <section
      data-composicao="imersivo"
      suppressHydrationWarning
      aria-label={`Apresentação editorial de ${pagina.identidade.nomeExibicao}`}
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
        estiloEnquadramento="tela_cheia"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-5 py-4 @3xl:px-10 @5xl:px-14 @5xl:py-6">
        <TransicaoEditorial className="shrink-0">
          <CabecalhoMarcaDiscreta
            identidade={pagina.identidade}
            tipografiaId={pagina.tipografiaId}
          />
        </TransicaoEditorial>

        <div aria-hidden="true" className="min-h-6 flex-1 @5xl:hidden sm:min-h-12" />

        <div className="grid items-center gap-5 @5xl:flex-1 @5xl:content-center @5xl:grid-cols-12 @5xl:gap-x-12 @5xl:gap-y-4 @5xl:py-4">
          <TransicaoEditorial atrasoSegundos={0.06} className="@5xl:col-span-7">
            {complementoChamada}
            <BlocoEquipeAposHero
              acoes={pagina.acoesPrincipais}
              previaEquipe={previaEquipe}
              aoAcionarItem={aoAcionarItem}
            />
          </TransicaoEditorial>

          <TransicaoEditorial atrasoSegundos={0.12} className="@5xl:col-span-5">
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
              className="@5xl:max-w-sm"
            />
          </TransicaoEditorial>

          {pagina.redesSociais && pagina.redesSociais.length > 0 ? (
            <TransicaoEditorial
              atrasoSegundos={0.12}
              className="-mt-2 @5xl:col-span-5 @5xl:col-start-8 @5xl:mt-0"
            >
              <BarraRedesSociaisDiscreta
                redes={pagina.redesSociais}
                alinharCentroNoMobile={false}
                className="justify-center @5xl:justify-end"
              />
            </TransicaoEditorial>
          ) : null}
        </div>

        <RodapeEditorial
          identidade={pagina.identidade}
          className="mt-10 shrink-0 border-t border-[var(--editorial-borda)]/50 pt-4.5 @5xl:mt-0"
        />
      </div>
    </section>
  );
}
