"use client";

import { useState } from "react";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import { CabecalhoPublicacaoRapidaAcervo } from "@/componentes/painel/catalogo/CabecalhoPublicacaoRapidaAcervo";
import { usePublicacaoPagina } from "@/ganchos/usePublicacaoPagina";
import { servicoCatalogoConteudoCliente } from "@/infraestrutura/painel/servicoCatalogoConteudoCliente";
import type { ModoExibicaoVideos, VideoYoutubeItem } from "@/dominio/objetos-valor/videoYoutube";
import { salvarConfiguracaoVideos } from "@/infraestrutura/painel/servicoVideosYoutubeCliente";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
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
  const [ocultarTitulo] = useState(ocultarTituloInicial);
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
    <div className="space-y-6">
      <CabecalhoPublicacaoRapidaAcervo
        aparencia="clara"
        controle={controlePublicacao}
        titulo="Vídeos do YouTube"
        subtitulo="Adicione 1 ou mais vídeos do YouTube e escolha como eles serão exibidos na vitrine."
        identificadorPublico={identificadorPublico}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="min-w-0 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-mineral-950">
              Novo vídeo
            </h2>
            <p className="mt-1 text-xs text-mineral-500">
              Informe o link do YouTube e título para exibir na sua vitrine.
            </p>
          </div>

          <CartaoSuperficie className="min-w-0 rounded-2xl bg-white p-5 shadow-2xs sm:p-6">
            <FormularioVideoYoutube
              aoAdicionar={lidarComAdicionar}
              salvando={salvando}
            />
          </CartaoSuperficie>
        </div>

        <section aria-labelledby="titulo-lista-videos" className="min-w-0 space-y-4">
          <div>
            <h2 id="titulo-lista-videos" className="text-base font-semibold text-mineral-950">
              Seus vídeos{" "}
              <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-mineral-800">
                {videos.length}
              </span>
            </h2>
            <p className="mt-1 text-xs text-mineral-500">
              Organize a ordem dos vídeos exibidos na sua vitrine.
            </p>
          </div>

          {/* Configuração Geral de Exibição na Vitrine */}
          <CartaoSuperficie className="space-y-3 rounded-2xl bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-mineral-950">
                Formato de exibição na vitrine
              </label>
              {salvando ? (
                <span className="text-[11px] text-mineral-500 animate-pulse">Salvando...</span>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => lidarComTrocaModo("carrossel")}
                className={combinarClasses(
                  "flex flex-col rounded-xl border p-3 text-left transition-all cursor-pointer",
                  modoExibicao === "carrossel"
                    ? "border-mineral-950 bg-mineral-950 text-white shadow-xs"
                    : "border-neutral-200 bg-white text-mineral-900 hover:border-neutral-300 hover:bg-neutral-50",
                )}
              >
                <span className="text-xs font-semibold">Carrossel</span>
                <span
                  className={combinarClasses(
                    "mt-0.5 text-[10px]",
                    modoExibicao === "carrossel" ? "text-white/70" : "text-mineral-500",
                  )}
                >
                  1 vídeo por vez
                </span>
              </button>

              <button
                type="button"
                onClick={() => lidarComTrocaModo("fila")}
                className={combinarClasses(
                  "flex flex-col rounded-xl border p-3 text-left transition-all cursor-pointer",
                  modoExibicao === "fila"
                    ? "border-mineral-950 bg-mineral-950 text-white shadow-xs"
                    : "border-neutral-200 bg-white text-mineral-900 hover:border-neutral-300 hover:bg-neutral-50",
                )}
              >
                <span className="text-xs font-semibold">Em fila</span>
                <span
                  className={combinarClasses(
                    "mt-0.5 text-[10px]",
                    modoExibicao === "fila" ? "text-white/70" : "text-mineral-500",
                  )}
                >
                  Empilhados verticalmente
                </span>
              </button>
            </div>

            <label className="flex cursor-pointer items-center gap-2 pt-1 text-xs text-mineral-800">
              <input
                type="checkbox"
                checked={autoplay}
                onChange={(e) => {
                  const marcado = e.target.checked;
                  setAutoplay(marcado);
                  void persistir(videos, modoExibicao, marcado, ocultarTitulo);
                }}
                className="h-4 w-4 rounded border-neutral-300 accent-mineral-950"
              />
              <span>Reprodução automática (Autoplay silencioso)</span>
            </label>
          </CartaoSuperficie>

          <ListaVideosPainel
            videos={videos}
            aoMover={lidarComMover}
            aoRemover={lidarComRemover}
          />
        </section>
      </div>
    </div>
  );
}
