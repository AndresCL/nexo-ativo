"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import {
  resolverCardapioInicial,
  type CardapioOrganizacao,
  type PaginaCardapio,
} from "@/dominio/entidades/cardapioDigital";
import {
  gerarVariaveisCssPaletaEditorial,
  obterAcoesPrincipaisVisiveis,
  type ConteudoPaginaPublicada,
} from "@/dominio/entidades/paginaPublicada";
import { CabecalhoCardapioVitrine } from "./CabecalhoCardapioVitrine";
import { LightboxZoomPagina } from "./LightboxZoomPagina";
import { ListaPaginasCardapio } from "./ListaPaginasCardapio";
import { SeletorAbasCardapio } from "./SeletorAbasCardapio";

interface PropriedadesVisualizadorCardapioTelaCheia {
  readonly pagina: ConteudoPaginaPublicada;
  readonly cardapios: readonly CardapioOrganizacao[];
  readonly slugInicial?: string;
}

export function VisualizadorCardapioTelaCheia({
  pagina,
  cardapios,
  slugInicial,
}: PropriedadesVisualizadorCardapioTelaCheia) {
  const inicial = resolverCardapioInicial(cardapios, slugInicial);
  const [cardapioAtivo, setCardapioAtivo] = useState<CardapioOrganizacao | null>(inicial);
  const [zoomAtual, setZoomAtual] = useState<{
    pagina: PaginaCardapio;
    indice: number;
  } | null>(null);

  const variaveisTema = gerarVariaveisCssPaletaEditorial(
    pagina.paletaId,
    pagina.corPersonalizadaHex,
    pagina.customizacaoTokens,
  ) as CSSProperties;

  const hrefVoltar = `/${pagina.identificadorPublico}`;
  const acaoWhatsapp = obterAcoesPrincipaisVisiveis(pagina.acoesPrincipais).find(
    (acao) => acao.tipoDestino === "whatsapp" && acao.destino.trim().length > 0,
  );

  function selecionarCardapio(proximo: CardapioOrganizacao) {
    setCardapioAtivo(proximo);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("cardapio", proximo.slug);
      window.history.replaceState({}, "", url.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div
      style={variaveisTema}
      className="min-h-dvh w-full bg-[var(--editorial-fundo)] text-[var(--editorial-texto)]"
    >
      <CabecalhoCardapioVitrine
        hrefVoltar={hrefVoltar}
        nomeMarca={pagina.identidade.nomeExibicao}
        urlLogotipo={pagina.identidade.urlLogotipoOpcional}
        urlPdfDownload={cardapioAtivo?.urlPdfOriginal}
        urlWhatsapp={acaoWhatsapp?.destino}
      />

      <SeletorAbasCardapio
        cardapios={cardapios}
        cardapioAtivoId={cardapioAtivo?.id ?? ""}
        aoSelecionar={selecionarCardapio}
      />

      {cardapioAtivo ? (
        <main className="pb-10">
          <div className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-5">
            <h1 className="text-lg font-bold tracking-tight text-[var(--editorial-texto)]">
              {cardapioAtivo.titulo}
            </h1>
            {cardapioAtivo.subtituloOpcional ? (
              <p className="mt-1 text-xs text-[var(--editorial-texto-secundario)]">
                {cardapioAtivo.subtituloOpcional}
              </p>
            ) : null}
          </div>

          <ListaPaginasCardapio
            tituloCardapio={cardapioAtivo.titulo}
            paginas={cardapioAtivo.paginas}
            aoAbrirZoom={(itemPagina, indice) => setZoomAtual({ pagina: itemPagina, indice })}
          />
        </main>
      ) : (
        <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
          <UtensilsCrossed
            className="h-10 w-10 text-[var(--editorial-texto-secundario)] opacity-60"
            aria-hidden="true"
          />
          <h1 className="mt-3 text-base font-semibold text-[var(--editorial-texto)]">
            Cardápio em breve
          </h1>
          <p className="mt-1 text-xs text-[var(--editorial-texto-secundario)]">
            Este estabelecimento ainda não publicou páginas de cardápio.
          </p>
          <Link
            href={hrefVoltar}
            className="mt-4 inline-flex items-center rounded-full bg-[var(--editorial-destaque)] px-4 py-2 text-xs font-semibold text-[var(--editorial-texto-sobre-destaque)]"
          >
            Voltar para a vitrine
          </Link>
        </main>
      )}

      <LightboxZoomPagina
        pagina={zoomAtual?.pagina ?? null}
        rotuloPagina={
          zoomAtual && cardapioAtivo
            ? `${cardapioAtivo.titulo} — Página ${zoomAtual.indice + 1}`
            : ""
        }
        aoFechar={() => setZoomAtual(null)}
      />
    </div>
  );
}
