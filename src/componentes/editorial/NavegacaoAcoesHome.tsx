"use client";

import type { ReactNode } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import {
  obterAcoesPrincipaisVisiveis,
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
import { AcaoEquipeVitrine, type ManipuladorAcaoHome } from "./AcaoEquipeVitrine";

export interface PropriedadesNavegacaoAcoesHome {
  readonly acoes: readonly ItemAcaoHome[];
  readonly paletaId: IdentificadorPaletaEditorial;
  readonly aoAcionarItem?: ManipuladorAcaoHome;
  readonly previaEquipe?: PreviaEquipeVitrine;
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
  paletaId: _paletaId,
  aoAcionarItem,
  className,
  previaEquipe,
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

  return (
    <nav
      aria-label="Ações principais"
      data-testid="navegacao-acoes-home"
      className={combinarClasses(
        "mx-auto flex w-full max-w-sm flex-col items-center gap-2.5 @5xl:mx-0 @5xl:ml-auto @5xl:max-w-xs @5xl:items-end",
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
        const externo = ehDestinoExterno(acao.destino);

        const classesBaseItem = combinarClasses(
          "group flex min-h-13 w-full items-center justify-between gap-3 rounded-xl px-5 py-3 text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--editorial-texto)] hover:scale-[1.01]",
          ehDestaque
            ? "border border-[var(--editorial-borda)] bg-[var(--editorial-cta-fundo)] text-[var(--editorial-cta-texto)] shadow-lg shadow-black/20 hover:opacity-95"
            : "border border-[var(--editorial-borda)] bg-[var(--editorial-secundario-fundo)] text-[var(--editorial-secundario-texto)] shadow-md backdrop-blur-md hover:border-white/40",
        );

        const iconeItem = renderizarIconeAcao(acao);

        const conteudoInterno = (
          <>
            <div className="flex items-center gap-3">
              {iconeItem ? (
                <div
                  className={combinarClasses(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110",
                    ehDestaque
                      ? "bg-white/15 text-current"
                      : "bg-black/5 text-current dark:bg-white/10",
                  )}
                >
                  {iconeItem}
                </div>
              ) : null}

              <span className="flex flex-col items-start">
                <span className="text-sm font-medium tracking-wide">{acao.rotulo}</span>
                {acao.subtituloDiscreto ? (
                  <span
                    className={combinarClasses(
                      "mt-0.5 text-[11px]",
                      ehDestaque ? "opacity-78" : "text-[var(--editorial-texto-secundario)]",
                    )}
                  >
                    {acao.subtituloDiscreto}
                  </span>
                ) : null}
              </span>
            </div>

            <ChevronRight
              aria-hidden="true"
              className="h-5 w-5 shrink-0 opacity-70 transition-transform duration-200 group-hover:translate-x-1 group-hover:opacity-100"
            />
          </>
        );

        if (aoAcionarItem) {
          return (
            <button
              key={acao.id}
              type="button"
              data-acao-home-id={acao.id}
              onClick={(evento) => aoAcionarItem(acao, evento.currentTarget)}
              className={classesBaseItem}
            >
              {conteudoInterno}
            </button>
          );
        }

        return (
          <a
            key={acao.id}
            href={acao.destino}
            {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={classesBaseItem}
          >
            {conteudoInterno}
          </a>
        );
      })}
    </nav>
  );
}
