"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Compass, GalleryHorizontal, Rows3 } from "lucide-react";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import { CabecalhoPublicacaoRapidaAcervo } from "@/componentes/painel/catalogo/CabecalhoPublicacaoRapidaAcervo";
import { usePublicacaoPagina } from "@/ganchos/usePublicacaoPagina";
import { servicoCatalogoConteudoCliente } from "@/infraestrutura/painel/servicoCatalogoConteudoCliente";
import type { ModoExibicaoVideos, VideoYoutubeItem } from "@/dominio/objetos-valor/videoYoutube";
import {
  carregarConfiguracaoVideos,
  salvarConfiguracaoVideos,
} from "@/infraestrutura/painel/servicoVideosYoutubeCliente";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { FormularioVideoYoutube } from "./FormularioVideoYoutube";
import { ListaVideosPainel } from "./ListaVideosPainel";

interface PropriedadesGerenciadorVideosPainel {
  readonly organizacaoId: string;
  readonly identificadorPublico?: string;
  readonly versaoPublicadaInicial?: number | null;
  readonly podePublicarPagina?: boolean;
  readonly videosIniciais?: readonly VideoYoutubeItem[];
  readonly modoExibicaoInicial?: ModoExibicaoVideos;
  readonly autoplayInicial?: boolean;
  readonly ocultarTituloInicial?: boolean;
}

export function GerenciadorVideosPainel({
  organizacaoId,
  identificadorPublico = "",
  versaoPublicadaInicial = null,
  podePublicarPagina = true,
  videosIniciais = [],
  modoExibicaoInicial = "carrossel",
  autoplayInicial = false,
  ocultarTituloInicial = false,
}: PropriedadesGerenciadorVideosPainel) {
  const [videos, setVideos] = useState<readonly VideoYoutubeItem[]>(videosIniciais);
  const [modoExibicao, setModoExibicao] = useState<ModoExibicaoVideos>(modoExibicaoInicial);
  const [autoplay, setAutoplay] = useState(autoplayInicial);
  const [ocultarTitulo, setOcultarTitulo] = useState(ocultarTituloInicial);
  const [salvando, setSalvando] = useState(false);

  const controlePublicacao = usePublicacaoPagina({
    versaoPublicadaInicial,
    podePublicarPagina,
    bloqueado: salvando,
    revisaoConteudoSalvo: videos,
    publicarPagina: () => servicoCatalogoConteudoCliente.publicarPagina(organizacaoId),
  });

  async function persistir(
    novosVideos: readonly VideoYoutubeItem[],
    novoModo: ModoExibicaoVideos,
    novoAutoplay = autoplay,
    novoOcultarTitulo = ocultarTitulo,
  ) {
    setSalvando(true);
    try {
      await salvarConfiguracaoVideos(organizacaoId, {
        videos: novosVideos,
        modoExibicaoVideos: novoModo,
        autoplayVideos: novoAutoplay,
        ocultarTituloVideos: novoOcultarTitulo,
      });
      notificar.sucesso("Configuração de vídeos salva.");
    } catch {
      notificar.erro("Erro ao salvar os vídeos.");
    } finally {
      setSalvando(false);
    }
  }

  function lidarComAdicionar(video: VideoYoutubeItem) {
    const atualizados = [...videos, video];
    setVideos(atualizados);
    void persistir(atualizados, modoExibicao);
  }

  function lidarComRemover(id: string) {
    const atualizados = videos.filter((v) => v.id !== id);
    setVideos(atualizados);
    void persistir(atualizados, modoExibicao);
  }

  function lidarComMover(indice: number, direcao: "cima" | "baixo") {
    const destino = direcao === "cima" ? indice - 1 : indice + 1;
    if (destino < 0 || destino >= videos.length) return;

    const copia = [...videos];
    const [item] = copia.splice(indice, 1);
    if (!item) return;
    copia.splice(destino, 0, item);
    setVideos(copia);
    void persistir(copia, modoExibicao);
  }

  function lidarComTrocaModo(novoModo: ModoExibicaoVideos) {
    setModoExibicao(novoModo);
    void persistir(videos, novoModo);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <CabecalhoPublicacaoRapidaAcervo
        aparencia="clara"
        controle={controlePublicacao}
        titulo="Vídeos do YouTube"
        subtitulo="Adicione 1 ou mais vídeos do YouTube e escolha como eles serão exibidos na vitrine."
        identificadorPublico={identificadorPublico}
      />

      <div className="flex justify-end">
        <Link
          href="/painel/experiencias"
          className="inline-flex items-center gap-2 rounded-xl border border-marfim-200 bg-white px-3.5 py-2 text-xs font-medium text-mineral-800 shadow-xs transition hover:bg-marfim-50"
        >
          <Compass className="h-4 w-4" aria-hidden="true" />
          Organizar nas experiências
        </Link>
      </div>

      <section className="rounded-2xl border border-marfim-200 bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-mineral-900">
            Formato de exibição na vitrine
          </h2>
          {salvando ? (
            <span className="text-xs text-mineral-500">Salvando...</span>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => lidarComTrocaModo("carrossel")}
            className={combinarClasses(
              "flex items-start gap-3 rounded-xl border p-4 text-left transition",
              modoExibicao === "carrossel"
                ? "border-mineral-900 bg-marfim-50"
                : "border-marfim-200 hover:bg-marfim-50/60",
            )}
          >
            <GalleryHorizontal className="mt-0.5 h-5 w-5 shrink-0 text-mineral-900" />
            <div>
              <p className="text-sm font-semibold text-mineral-900">Carrossel</p>
              <p className="mt-0.5 text-xs text-mineral-600">
                Mostra um vídeo por vez com pequenos círculos embaixo para trocar.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => lidarComTrocaModo("fila")}
            className={combinarClasses(
              "flex items-start gap-3 rounded-xl border p-4 text-left transition",
              modoExibicao === "fila"
                ? "border-mineral-900 bg-marfim-50"
                : "border-marfim-200 hover:bg-marfim-50/60",
            )}
          >
            <Rows3 className="mt-0.5 h-5 w-5 shrink-0 text-mineral-900" />
            <div>
              <p className="text-sm font-semibold text-mineral-900">Em fila</p>
              <p className="mt-0.5 text-xs text-mineral-600">
                Exibe todos os vídeos empilhados, um acima do outro.
              </p>
            </div>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-6 border-t border-marfim-200 pt-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-mineral-800">
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(e) => {
                const marcado = e.target.checked;
                setAutoplay(marcado);
                void persistir(videos, modoExibicao, marcado, ocultarTitulo);
              }}
              className="h-4 w-4 rounded border-marfim-300 accent-mineral-900"
            />
            <span>Reprodução automática (Autoplay)</span>
          </label>
        </div>
      </section>

      <FormularioVideoYoutube aoAdicionar={lidarComAdicionar} />

      <ListaVideosPainel
        videos={videos}
        aoMover={lidarComMover}
        aoRemover={lidarComRemover}
      />
    </div>
  );
}
