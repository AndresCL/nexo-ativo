"use client";

import type { ReactNode } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import {
  obterAcoesPrincipaisVisiveis,
  type EspacamentoAcoesHome,
  type IdentificadorPaletaEditorial,
  type ItemAcaoHome,
  type TipoIconeAcaoHome,
} from "@/dominio/entidades/paginaPublicada";
import { MAPA_ICONES_POR_ID } from "@/dominio/entidades/catalogoIconesEditorial";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import {
  ehAcaoEquipe,
  obterVisibilidadeEquipe,
} from "@/dominio/editorial/posicionamentoEquipeVitrine";
import type { PreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";
import type { ModoExibicaoVideos, VideoYoutubeItem } from "@/dominio/objetos-valor/videoYoutube";
import type { ProdutoCatalogo, ServicoOrganizacao } from "@/dominio/entidades/catalogoConteudo";
import { AcaoEquipeVitrine, type ManipuladorAcaoHome } from "./AcaoEquipeVitrine";
import { SecaoVideosYoutube } from "./SecaoVideosYoutube";
import { SecaoColecaoAcervoHome } from "./acervo/SecaoColecaoAcervoHome";

export interface PropriedadesNavegacaoAcoesHome {
  readonly acoes: readonly ItemAcaoHome[];
  readonly espacamentoAcoes?: EspacamentoAcoesHome;
  readonly paletaId: IdentificadorPaletaEditorial;
  readonly aoAcionarItem?: ManipuladorAcaoHome;
  readonly aoSelecionarItemAcervo?: (tipo: "produtos" | "servicos", itemId: string) => void;
  readonly previaEquipe?: PreviaEquipeVitrine;
  readonly videosYoutube?: readonly VideoYoutubeItem[];
  readonly modoExibicaoVideos?: ModoExibicaoVideos;
  readonly autoplayVideos?: boolean;
  readonly ocultarTituloVideos?: boolean;
  readonly produtos?: readonly ProdutoCatalogo[];
  readonly servicos?: readonly ServicoOrganizacao[];
  readonly className?: string;
}

function ehDestinoExterno(destino: string): boolean {
  return /^https?:\/\//i.test(destino);
}

export function renderizarIconeAcao(acao: ItemAcaoHome): ReactNode {
  const iconeEscolhido: TipoIconeAcaoHome = acao.icone ?? "automatico";

  if (iconeEscolhido !== "automatico" && MAPA_ICONES_POR_ID[iconeEscolhido]) {
    const item = MAPA_ICONES_POR_ID[iconeEscolhido]!;
    return item.componente({ className: "h-4 w-4 shrink-0", "aria-hidden": true });
  }

  // Dedução inteligente se estiver em "automatico"
  if (acao.tipoDestino === "whatsapp") {
    return MAPA_ICONES_POR_ID["whatsapp"]?.componente({
      className: "h-4 w-4 shrink-0",
      "aria-hidden": true,
    });
  }
  if (acao.tipoDestino === "telefone") {
    return MAPA_ICONES_POR_ID["telefone"]?.componente({
      className: "h-4 w-4 shrink-0",
      "aria-hidden": true,
    });
  }
  if (acao.tipoDestino === "secao_produtos") {
    return MAPA_ICONES_POR_ID["produtos"]?.componente({
      className: "h-4 w-4 shrink-0",
      "aria-hidden": true,
    });
  }
  if (acao.tipoDestino === "secao_servicos") {
    return MAPA_ICONES_POR_ID["servicos"]?.componente({
      className: "h-4 w-4 shrink-0",
      "aria-hidden": true,
    });
  }
  if (acao.tipoDestino === "secao_portfolio") {
    return MAPA_ICONES_POR_ID["portfolio"]?.componente({
      className: "h-4 w-4 shrink-0",
      "aria-hidden": true,
    });
  }
  if (acao.tipoDestino === "secao_equipe") {
    return MAPA_ICONES_POR_ID["equipe"]?.componente({
      className: "h-4 w-4 shrink-0",
      "aria-hidden": true,
    });
  }
  if (acao.tipoDestino === "link_externo") {
    return MAPA_ICONES_POR_ID["link"]?.componente({
      className: "h-4 w-4 shrink-0",
      "aria-hidden": true,
    });
  }
  if (acao.tipoDestino === "microfluxo") {
    if (/conectar|falar|consultor/i.test(acao.destino + acao.rotulo)) {
      return MAPA_ICONES_POR_ID["conectar"]?.componente({
        className: "h-4 w-4 shrink-0",
        "aria-hidden": true,
      });
    }
    if (/catalogo|estoque|veiculo|produto/i.test(acao.destino + acao.rotulo)) {
      return MAPA_ICONES_POR_ID["catalogo"]?.componente({
        className: "h-4 w-4 shrink-0",
        "aria-hidden": true,
      });
    }
    if (/planejar|orcamento|estimativa/i.test(acao.destino + acao.rotulo)) {
      return MAPA_ICONES_POR_ID["cotacao"]?.componente({
        className: "h-4 w-4 shrink-0",
        "aria-hidden": true,
      });
    }
    return <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />;
  }

  return null;
}

/**
 * Regra editorial oficial da Home:
 * - Mobile (< 64rem de contêiner): opções empilhadas e centralizadas horizontalmente,
 *   com alvo mínimo de toque >= 48px.
 * - Desktop (@5xl >= 64rem de contêiner): ações concisas alinhadas à direita.
 */
export function NavegacaoAcoesHome({
  acoes,
  espacamentoAcoes = "padrao",
  paletaId: _paletaId,
  aoAcionarItem,
  aoSelecionarItemAcervo,
  className,
  previaEquipe,
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
        : "gap-2.5"; // "compacto" ou padrão (o tamanho original do produto)

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
              aoAcionarItem={aoAcionarItem}
              className="@5xl:hidden"
            />
          ))
        : null}
      {acoesVisiveis.map((acao, indice) => {
        const ehDestaque = acao.destaquePrincipal ?? indice === 0;
        if (previaEquipe && ehAcaoEquipe(acao)) {
          const visibilidade = obterVisibilidadeEquipe(acao.posicionamentoEquipe, "lista_acoes");
          if (!visibilidade.mobile && !visibilidade.desktop) return null;
          return (
            <AcaoEquipeVitrine
              key={acao.id}
              acao={acao}
              previa={previaEquipe}
              destaque={ehDestaque}
              aoAcionarItem={aoAcionarItem}
              className={
                visibilidade.mobile
                  ? visibilidade.desktop
                    ? undefined
                    : "@5xl:hidden"
                  : "hidden @5xl:flex"
              }
            />
          );
        }
        if (acao.tipoDestino === "secao_produtos") {
          const modo = acao.modoExibicaoColecao ?? "modal_gaveta";
          if (modo !== "modal_gaveta") {
            return (
              <SecaoColecaoAcervoHome
                key={acao.id}
                tipo="produtos"
                tituloSecao={acao.tituloSecao || acao.rotulo}
                modo={modo}
                produtos={produtos}
                aoAbrirGavetaDetalhe={(tipoItem, itemId) => {
                  if (itemId && aoSelecionarItemAcervo) {
                    aoSelecionarItemAcervo(tipoItem, itemId);
                  } else {
                    aoAcionarItem?.(acao);
                  }
                }}
              />
            );
          }
        }
        if (acao.tipoDestino === "secao_servicos") {
          const modo = acao.modoExibicaoColecao ?? "modal_gaveta";
          if (modo !== "modal_gaveta") {
            return (
              <SecaoColecaoAcervoHome
                key={acao.id}
                tipo="servicos"
                tituloSecao={acao.tituloSecao || acao.rotulo}
                modo={modo}
                servicos={servicos}
                aoAbrirGavetaDetalhe={(tipoItem, itemId) => {
                  if (itemId && aoSelecionarItemAcervo) {
                    aoSelecionarItemAcervo(tipoItem, itemId);
                  } else {
                    aoAcionarItem?.(acao);
                  }
                }}
              />
            );
          }
        }
        if (acao.tipoDestino === "secao_videos") {
          if (videosYoutube.length === 0) return null;
          return (
            <SecaoVideosYoutube
              key={acao.id}
              videos={videosYoutube}
              modoExibicao={modoExibicaoVideos}
              autoplay={autoplayVideos}
              tituloSecao={ocultarTituloVideos ? undefined : acao.tituloSecao || acao.rotulo}
            />
          );
        }
        const externo = ehDestinoExterno(acao.destino);

        const classesBaseItem = combinarClasses(
          "group flex w-full items-center justify-between gap-3 px-5 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--editorial-texto)] hover:scale-[1.01]",
          ehDestaque
            ? "h-12 min-h-12 py-2 rounded-full bg-[var(--editorial-cta-fundo)] text-[var(--editorial-cta-texto)] shadow-lg shadow-black/20 hover:opacity-95 justify-center"
            : "min-h-13 py-3 rounded-xl bg-[var(--editorial-secundario-fundo)] text-[var(--editorial-secundario-texto)] shadow-md backdrop-blur-md",
        );

        const iconeItem = renderizarIconeAcao(acao);

        const conteudoInterno = (
          <>
            <div className={combinarClasses("flex items-center gap-3", ehDestaque ? "justify-center" : "")}>
              {iconeItem ? (
                <div
                  className={combinarClasses(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110",
                    ehDestaque
                      ? "bg-white/15 text-current rounded-full"
                      : "bg-black/5 text-current dark:bg-white/10",
                  )}
                >
                  {iconeItem}
                </div>
              ) : null}

              {ehDestaque ? (
                <span className="text-sm font-semibold tracking-wide truncate">{acao.rotulo}</span>
              ) : (
                <span className="flex flex-col items-start">
                  <span className="text-sm font-medium tracking-wide">{acao.rotulo}</span>
                  {acao.subtituloDiscreto ? (
                    <span className="mt-0.5 text-[11px] text-[var(--editorial-texto-secundario)]">
                      {acao.subtituloDiscreto}
                    </span>
                  ) : null}
                </span>
              )}
            </div>

            {!ehDestaque ? (
              <ChevronRight
                aria-hidden="true"
                className="h-5 w-5 shrink-0 opacity-70 transition-transform duration-200 group-hover:translate-x-1 group-hover:opacity-100"
              />
            ) : null}
          </>
        );

        const temBordaAnimada = ehDestaque && acao.animarBordaDestaque === true;

        const elementoBotao = aoAcionarItem ? (
          <button
            type="button"
            data-acao-home-id={acao.id}
            onClick={(evento) => aoAcionarItem(acao, evento.currentTarget)}
            className={combinarClasses(classesBaseItem, temBordaAnimada ? "relative z-10 !border-transparent" : undefined)}
          >
            {conteudoInterno}
          </button>
        ) : (
          <a
            href={acao.destino}
            {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={combinarClasses(classesBaseItem, temBordaAnimada ? "relative z-10 !border-transparent" : undefined)}
          >
            {conteudoInterno}
          </a>
        );

        const elementoPrincipalComBorda = temBordaAnimada ? (
          <div className="animacao-brilho-borda-container w-full rounded-full">
            <div className="animacao-brilho-borda-feixe" aria-hidden="true" />
            {elementoBotao}
          </div>
        ) : (
          elementoBotao
        );

        if (ehDestaque && acao.subtituloDiscreto) {
          return (
            <div key={acao.id} className="flex w-full flex-col items-center gap-1.5">
              {elementoPrincipalComBorda}
              <p className="text-center text-xs font-medium text-[var(--editorial-texto-secundario)] opacity-80 px-2">
                {acao.subtituloDiscreto}
              </p>
            </div>
          );
        }

        return <div key={acao.id} className="w-full">{elementoPrincipalComBorda}</div>;
      })}
    </nav>
  );
}
