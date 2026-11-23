"use client";

import type { ReactNode } from "react";
import {
  obterAcoesPrincipaisVisiveis,
  type ConteudoPaginaPublicada,
  type ItemAcaoHome,
} from "@/dominio/entidades/paginaPublicada";
import {
  blocoSistemaEstaVisivel,
  marcaEstaFixaNoTopo,
  obterIdBlocoExperiencia,
  resolverOrdemBlocosVitrine,
} from "@/dominio/editorial/ordemBlocosVitrine";
import {
  ehAcaoEquipe,
  obterVisibilidadeEquipe,
} from "@/dominio/editorial/posicionamentoEquipeVitrine";
import type { PreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";
import type { ModoExibicaoVideos, VideoYoutubeItem } from "@/dominio/objetos-valor/videoYoutube";
import type { ProdutoCatalogo, ServicoOrganizacao } from "@/dominio/entidades/catalogoConteudo";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { AcaoEquipeVitrine, type ManipuladorAcaoHome } from "./AcaoEquipeVitrine";
import { BarraRedesSociaisDiscreta } from "./BarraRedesSociaisDiscreta";
import { CabecalhoMarcaDiscreta } from "./IdentidadeETituloEditorial";
import { ItemAcaoVitrine } from "./ItemAcaoVitrine";

export interface PropriedadesListaBlocosVitrine {
  readonly pagina: ConteudoPaginaPublicada;
  readonly complementoChamada?: ReactNode;
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

export function ListaBlocosVitrine({
  pagina,
  complementoChamada,
  aoAcionarItem,
  aoSelecionarItemAcervo,
  previaEquipe,
  videosYoutube = [],
  modoExibicaoVideos = "carrossel",
  autoplayVideos = false,
  ocultarTituloVideos = false,
  produtos = [],
  servicos = [],
  className,
}: PropriedadesListaBlocosVitrine) {
  const acoesVisiveis = obterAcoesPrincipaisVisiveis(pagina.acoesPrincipais).filter(
    (acao) => !ehAcaoEquipe(acao) || previaEquipe?.total !== 0,
  );

  const mapaAcoesPorBloco = new Map<string, ItemAcaoHome>();
  const idsAcoes: string[] = [];
  for (const acao of acoesVisiveis) {
    const idBloco = obterIdBlocoExperiencia(acao.id);
    if (!mapaAcoesPorBloco.has(idBloco)) {
      mapaAcoesPorBloco.set(idBloco, acao);
      idsAcoes.push(idBloco);
    }
  }

  const marcaNoFluxo =
    !marcaEstaFixaNoTopo(pagina.identidade) && blocoSistemaEstaVisivel("bloco:marca", pagina);
  const avaliacoesVisiveis =
    Boolean(complementoChamada) && blocoSistemaEstaVisivel("bloco:avaliacoes_google", pagina);
  const redesVisiveis = blocoSistemaEstaVisivel("bloco:redes_sociais", pagina);

  const idsDisponiveis: string[] = [
    ...(marcaNoFluxo ? ["bloco:marca"] : []),
    ...idsAcoes,
    ...(avaliacoesVisiveis ? ["bloco:avaliacoes_google"] : []),
    ...(redesVisiveis ? ["bloco:redes_sociais"] : []),
  ];

  const ordemResolvida = resolverOrdemBlocosVitrine(pagina.ordemBlocosVitrine, idsDisponiveis);

  if (ordemResolvida.length === 0) {
    return null;
  }

  const classeGap =
    pagina.espacamentoAcoes === "medio"
      ? "gap-4"
      : pagina.espacamentoAcoes === "amplo"
        ? "gap-6"
        : "gap-2.5";

  const temDestaqueExplicito = acoesVisiveis.some((a) => a.destaquePrincipal === true);
  let primeiroIndiceAcao = 0;

  return (
    <div
      data-testid="lista-blocos-vitrine"
      className={combinarClasses("flex w-full min-w-0 flex-col items-center @5xl:items-end", classeGap, className)}
    >
      {previaEquipe
        ? acoesVisiveis
            .filter(
              (acao) =>
                ehAcaoEquipe(acao) &&
                obterVisibilidadeEquipe(acao.posicionamentoEquipe, "antes_acoes").mobile,
            )
            .map((acao) => (
              <div
                key={`antes-${acao.id}`}
                className="mx-auto w-full max-w-sm @5xl:hidden"
              >
                <AcaoEquipeVitrine
                  acao={acao}
                  previa={previaEquipe}
                  destaque={acao.destaquePrincipal}
                  modoFundo={pagina.customizacaoTokens?.modoFundoEquipe}
                  aoAcionarItem={aoAcionarItem}
                />
              </div>
            ))
        : null}

      {ordemResolvida.map((idBloco) => {
        if (idBloco === "bloco:marca") {
          return (
            <div key={idBloco} className="w-full" data-bloco-vitrine="bloco:marca">
              <CabecalhoMarcaDiscreta
                identidade={pagina.identidade}
                tipografiaId={pagina.tipografiaId}
                varianteEspacamento="slot_experiencias"
              />
            </div>
          );
        }

        if (idBloco === "bloco:avaliacoes_google") {
          return (
            <div
              key={idBloco}
              data-bloco-vitrine="bloco:avaliacoes_google"
              className="flex w-full min-w-0 justify-center @5xl:justify-end"
            >
              {complementoChamada}
            </div>
          );
        }

        if (idBloco === "bloco:redes_sociais") {
          return (
            <div key={idBloco} className="w-full" data-bloco-vitrine="bloco:redes_sociais">
              <BarraRedesSociaisDiscreta
                redes={pagina.redesSociais}
                tamanho={pagina.tamanhoRedesSociais}
                alinharCentroNoMobile={false}
                className="justify-center @5xl:justify-end"
              />
            </div>
          );
        }

        const acao = mapaAcoesPorBloco.get(idBloco);
        if (!acao) return null;
        const indiceAtual = primeiroIndiceAcao++;
        const ehDestaque =
          acao.destaquePrincipal ?? (!temDestaqueExplicito && indiceAtual === 0);

        return (
          <div
            key={idBloco}
            data-bloco-vitrine={idBloco}
            className="mx-auto w-full max-w-sm @5xl:mx-0 @5xl:ml-auto @5xl:max-w-xs"
          >
            <ItemAcaoVitrine
              acao={acao}
              ehDestaque={ehDestaque}
              aoAcionarItem={aoAcionarItem}
              aoSelecionarItemAcervo={aoSelecionarItemAcervo}
              previaEquipe={previaEquipe}
              modoFundoEquipe={pagina.customizacaoTokens?.modoFundoEquipe}
              videosYoutube={videosYoutube}
              modoExibicaoVideos={modoExibicaoVideos}
              autoplayVideos={autoplayVideos}
              ocultarTituloVideos={ocultarTituloVideos}
              produtos={produtos}
              servicos={servicos}
            />
          </div>
        );
      })}
    </div>
  );
}

