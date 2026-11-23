"use client";

import {
  obterAcoesPrincipaisVisiveis,
  type EspacamentoAcoesHome,
  type IdentificadorPaletaEditorial,
  type ItemAcaoHome,
  type ModoFundoEquipeEditorial,
} from "@/dominio/entidades/paginaPublicada";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import {
  ehAcaoEquipe,
  obterVisibilidadeEquipe,
} from "@/dominio/editorial/posicionamentoEquipeVitrine";
import type { PreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";
import type { ModoExibicaoVideos, VideoYoutubeItem } from "@/dominio/objetos-valor/videoYoutube";
import type { ProdutoCatalogo, ServicoOrganizacao } from "@/dominio/entidades/catalogoConteudo";
import { AcaoEquipeVitrine, type ManipuladorAcaoHome } from "./AcaoEquipeVitrine";
import { ItemAcaoVitrine, renderizarIconeAcao } from "./ItemAcaoVitrine";

export { renderizarIconeAcao };

export interface PropriedadesNavegacaoAcoesHome {
  readonly acoes: readonly ItemAcaoHome[];
  readonly espacamentoAcoes?: EspacamentoAcoesHome;
  readonly paletaId: IdentificadorPaletaEditorial;
  readonly aoAcionarItem?: ManipuladorAcaoHome;
  readonly aoSelecionarItemAcervo?: (tipo: "produtos" | "servicos", itemId: string) => void;
  readonly previaEquipe?: PreviaEquipeVitrine;
  readonly modoFundoEquipe?: ModoFundoEquipeEditorial;
  readonly videosYoutube?: readonly VideoYoutubeItem[];
  readonly modoExibicaoVideos?: ModoExibicaoVideos;
  readonly autoplayVideos?: boolean;
  readonly ocultarTituloVideos?: boolean;
  readonly produtos?: readonly ProdutoCatalogo[];
  readonly servicos?: readonly ServicoOrganizacao[];
  readonly className?: string;
}

export function NavegacaoAcoesHome({
  acoes,
  espacamentoAcoes = "medio",
  paletaId: _paletaId,
  aoAcionarItem,
  aoSelecionarItemAcervo,
  className,
  previaEquipe,
  modoFundoEquipe,
  videosYoutube = [],
  modoExibicaoVideos = "carrossel",
  autoplayVideos = false,
  ocultarTituloVideos = false,
  produtos = [],
  servicos = [],
}: PropriedadesNavegacaoAcoesHome) {
  const acoesVisiveis = obterAcoesPrincipaisVisiveis(acoes).filter(
    (acao) => !ehAcaoEquipe(acao) || previaEquipe?.total !== 0,
  );
  const temAcaoDesktop = acoesVisiveis.some(
    (acao) =>
      !previaEquipe ||
      !ehAcaoEquipe(acao) ||
      obterVisibilidadeEquipe(acao.posicionamentoEquipe, "lista_acoes").desktop,
  );

  if (acoesVisiveis.length === 0) {
    return null;
  }

  const classeGap =
    espacamentoAcoes === "medio"
      ? "gap-4"
      : espacamentoAcoes === "amplo"
        ? "gap-6"
        : "gap-2.5";

  return (
    <nav
      aria-label="Ações principais"
      data-testid="navegacao-acoes-home"
      className={combinarClasses(
        "mx-auto flex w-full max-w-sm flex-col items-center @5xl:mx-0 @5xl:ml-auto @5xl:max-w-xs @5xl:items-end",
        classeGap,
        className,
        !temAcaoDesktop && "@5xl:hidden",
      )}
    >
      {previaEquipe
        ? acoesVisiveis
            .filter(
              (acao) =>
                ehAcaoEquipe(acao) &&
                obterVisibilidadeEquipe(acao.posicionamentoEquipe, "antes_acoes").mobile,
            )
            .map((acao) => (
              <AcaoEquipeVitrine
                key={`antes-${acao.id}`}
                acao={acao}
                previa={previaEquipe}
                destaque={acao.destaquePrincipal}
                modoFundo={modoFundoEquipe}
                aoAcionarItem={aoAcionarItem}
                className="@5xl:hidden"
              />
            ))
        : null}
      {acoesVisiveis.map((acao, indice) => (
        <ItemAcaoVitrine
          key={acao.id}
          acao={acao}
          ehDestaque={acao.destaquePrincipal ?? indice === 0}
          aoAcionarItem={aoAcionarItem}
          aoSelecionarItemAcervo={aoSelecionarItemAcervo}
          previaEquipe={previaEquipe}
          modoFundoEquipe={modoFundoEquipe}
          videosYoutube={videosYoutube}
          modoExibicaoVideos={modoExibicaoVideos}
          autoplayVideos={autoplayVideos}
          ocultarTituloVideos={ocultarTituloVideos}
          produtos={produtos}
          servicos={servicos}
        />
      ))}
    </nav>
  );
}
