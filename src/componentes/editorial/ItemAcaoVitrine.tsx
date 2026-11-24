"use client";

import type { CSSProperties, ReactNode } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import type {
  ItemAcaoHome,
  ModoFundoEquipeEditorial,
  TipoIconeAcaoHome,
} from "@/dominio/entidades/paginaPublicada";
import { MAPA_ICONES_POR_ID } from "@/dominio/entidades/catalogoIconesEditorial";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import {
  obterClasseAnimacaoDestaque,
  resolverAnimacaoDestaque,
} from "@/dominio/microfluxos/animacaoDestaque";
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

function ehDestinoExterno(destino: string): boolean {
  return /^https?:\/\//i.test(destino);
}

export function renderizarIconeAcao(acao: ItemAcaoHome): ReactNode {
  const iconeEscolhido: TipoIconeAcaoHome = acao.icone ?? "automatico";

  if (iconeEscolhido !== "automatico" && MAPA_ICONES_POR_ID[iconeEscolhido]) {
    const item = MAPA_ICONES_POR_ID[iconeEscolhido]!;
    return item.componente({ className: "h-4 w-4 shrink-0", "aria-hidden": true });
  }

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
  if (acao.tipoDestino === "publicacao_post") {
    return MAPA_ICONES_POR_ID["comunicado"]?.componente({
      className: "h-4 w-4 shrink-0",
      "aria-hidden": true,
    });
  }
  if (acao.tipoDestino === "agenda") {
    return MAPA_ICONES_POR_ID["agendamento"]?.componente({
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

export interface PropriedadesItemAcaoVitrine {
  readonly acao: ItemAcaoHome;
  readonly ehDestaque: boolean;
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
}

export function ItemAcaoVitrine({
  acao,
  ehDestaque,
  aoAcionarItem,
  aoSelecionarItemAcervo,
  previaEquipe,
  modoFundoEquipe,
  videosYoutube = [],
  modoExibicaoVideos = "carrossel",
  autoplayVideos = false,
  ocultarTituloVideos = false,
  produtos = [],
  servicos = [],
}: PropriedadesItemAcaoVitrine) {
  if (previaEquipe && ehAcaoEquipe(acao)) {
    const visibilidade = obterVisibilidadeEquipe(acao.posicionamentoEquipe, "lista_acoes");
    if (!visibilidade.mobile && !visibilidade.desktop) return null;
    return (
      <AcaoEquipeVitrine
        acao={acao}
        previa={previaEquipe}
        destaque={ehDestaque}
        modoFundo={modoFundoEquipe}
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
    <div className="relative z-10 flex w-full items-center justify-between">
      <div
        className={combinarClasses(
          "flex items-center gap-3",
          ehDestaque ? "w-full justify-center" : "",
        )}
      >
        {iconeItem ? (
          <div
            className={combinarClasses(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110",
              ehDestaque
                ? "rounded-full bg-white/15 text-current"
                : "bg-black/5 text-current dark:bg-white/10",
            )}
          >
            {iconeItem}
          </div>
        ) : null}

        {ehDestaque ? (
          <span className="truncate text-sm font-semibold tracking-wide">{acao.rotulo}</span>
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
    </div>
  );

  const animacaoDestaque = ehDestaque
    ? resolverAnimacaoDestaque(acao.animacaoDestaque, acao.animarBordaDestaque)
    : "nenhuma";
  const classesAnimacaoDestaque = obterClasseAnimacaoDestaque(animacaoDestaque);
  const estiloBrilho = acao.corBrilhoBorda
    ? ({ "--editorial-brilho-borda": acao.corBrilhoBorda } as CSSProperties)
    : undefined;

  const elementoBotao = aoAcionarItem ? (
    <button
      type="button"
      data-acao-home-id={acao.id}
      style={estiloBrilho}
      onClick={(evento) => aoAcionarItem(acao, evento.currentTarget)}
      className={combinarClasses(classesBaseItem, classesAnimacaoDestaque)}
    >
      {conteudoInterno}
    </button>
  ) : (
    <a
      href={acao.destino}
      style={estiloBrilho}
      {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={combinarClasses(classesBaseItem, classesAnimacaoDestaque)}
    >
      {conteudoInterno}
    </a>
  );

  if (ehDestaque && acao.subtituloDiscreto) {
    return (
      <div className="flex w-full flex-col items-center gap-1.5">
        {elementoBotao}
        <p className="px-2 text-center text-xs font-medium text-[var(--editorial-texto-secundario)] opacity-80">
          {acao.subtituloDiscreto}
        </p>
      </div>
    );
  }

  return <div className="w-full">{elementoBotao}</div>;
}

