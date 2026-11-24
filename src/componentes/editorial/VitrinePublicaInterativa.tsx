"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  construirUrlPublicaCartaoProfissional,
  type AcervoPublicoVitrine,
  type ProfissionalEquipe,
} from "@/dominio/entidades/catalogoConteudo";
import {
  gerarVariaveisCssPaletaEditorial,
  resolverAcoesVitrineComMicrofluxos,
  type ConfiguracaoCtaAcervo,
  type ConteudoPaginaPublicada,
  type ItemAcaoHome,
} from "@/dominio/entidades/paginaPublicada";
import type {
  ContextoOrigemMicrofluxo,
  DefinicaoMicrofluxo,
} from "@/dominio/microfluxos/tiposMicrofluxo";
import { usePreferenciaMovimentoReduzido } from "@/ganchos/usarPreferenciaMovimentoReduzido";
import { CURVA_EDITORIAL, DURACOES_SEGUNDOS } from "@/componentes/interface/constantesAnimacao";
import { CartaoDigitalProfissionalPublico } from "./CartaoDigitalProfissionalPublico";
import { TelaCarregamentoEditorial } from "./TelaCarregamentoEditorial";
import type { PortaSubmissaoSolicitacaoVisitante } from "@/aplicacao/portas/portasSolicitacoesComerciais";
import { obterOuDetectarOrigemSessao } from "@/infraestrutura/analytics/rastreadorSessaoOrigem";
import { ExecutorMicrofluxoVisitante } from "./ExecutorMicrofluxoVisitante";
import { GavetaEditorialPublica, type SecaoAcervoAberta } from "./GavetaEditorialPublica";
import { RenderizadorComposicaoEditorial } from "./RenderizadorComposicaoEditorial";
import { BlocoAvaliacoesGoogle } from "./avaliacoes/BlocoAvaliacoesGoogle";
import { identificarSecaoPorHash, resolverMicrofluxoPorDestino } from "./roteadorAcoesPublicas";
import { criarPreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";
import { restaurarFocoAcaoVitrine } from "./restaurarFocoAcaoVitrine";
import { ContextoApresentacaoEquipe } from "@/ganchos/contextoApresentacaoEquipe";
import { BottomSheetDetalhesItemAcervo } from "./acervo/BottomSheetDetalhesItemAcervo";
import { BottomSheetPostVitrine } from "./acervo/BottomSheetPostVitrine";
import { GavetaAgendamentoPublico } from "./agenda/GavetaAgendamentoPublico";
import type { ProdutoCatalogo, ServicoOrganizacao } from "@/dominio/entidades/catalogoConteudo";
import { abrirLinkExternoSeguro } from "@/utilitarios/navegacaoLinkExterno";
import { useAmbienteVitrine } from "./contextoAmbienteVitrine";

export interface PropriedadesVitrinePublicaInterativa {
  readonly pagina: ConteudoPaginaPublicada;
  readonly acervo: AcervoPublicoVitrine;
  readonly servicoSubmissao?: PortaSubmissaoSolicitacaoVisitante;
  readonly duracaoMinimaLoaderMs?: number;
  readonly alturaContidaPrevia?: boolean;
  readonly exibirAvaliacoesGoogle?: boolean;
}

export function VitrinePublicaInterativa({
  pagina,
  acervo,
  servicoSubmissao,
  duracaoMinimaLoaderMs = process.env.NODE_ENV === "test" ? 0 : 3000,
  alturaContidaPrevia = false,
  exibirAvaliacoesGoogle = true,
}: PropriedadesVitrinePublicaInterativa) {
  const {
    containerPortal,
    modoPrevia,
    sincronizarHistoricoNavegador,
    registrarEventoTelemetria,
    aoNavegarEmPrevia,
  } = useAmbienteVitrine();
  const estaContido = containerPortal !== null;
  const duracaoLoaderEfetiva = modoPrevia ? 0 : duracaoMinimaLoaderMs;
  const ultimaEntradaDireta = useRef<string | null>(null);
  const acionadorGaveta = useRef<HTMLButtonElement | null>(null);
  const previaEquipe = useMemo(
    () => criarPreviaEquipeVitrine(acervo.profissionais, pagina.organizacaoId),
    [acervo.profissionais, pagina.organizacaoId],
  );
  const [secaoAberta, setSecaoAberta] = useState<SecaoAcervoAberta>(null);
  const [tituloSecaoAberta, setTituloSecaoAberta] = useState<string | undefined>();
  const [configuracaoCtaSecaoAberta, setConfiguracaoCtaSecaoAberta] = useState<
    ConfiguracaoCtaAcervo | undefined
  >();
  const [itemDetalhado, setItemDetalhado] = useState<{
    tipo: "produtos" | "servicos";
    item: ProdutoCatalogo | ServicoOrganizacao;
    configuracaoCta?: ConfiguracaoCtaAcervo;
  } | null>(null);
  const [acaoPostAberta, setAcaoPostAberta] = useState<ItemAcaoHome | null>(null);
  const [acaoAgendaAberta, setAcaoAgendaAberta] = useState<ItemAcaoHome | null>(null);
  const [cartaoProfissionalAtivo, setCartaoProfissionalAtivo] = useState<ProfissionalEquipe | null>(
    null,
  );
  const movimentoReduzido = usePreferenciaMovimentoReduzido();
  const [microfluxoAtivo, setMicrofluxoAtivo] = useState<DefinicaoMicrofluxo | null>(null);
  const [contextoMicrofluxo, setContextoMicrofluxo] = useState<
    ContextoOrigemMicrofluxo | undefined
  >(undefined);
  const [loaderVisivel, setLoaderVisivel] = useState(() => duracaoLoaderEfetiva > 0);
  const [desvanecendoLoader, setDesvanecendoLoader] = useState(false);

  const variaveisPaleta = useMemo(
    () =>
      gerarVariaveisCssPaletaEditorial(
        pagina.paletaId,
        pagina.corPersonalizadaHex,
        pagina.customizacaoTokens,
      ),
    [pagina.paletaId, pagina.corPersonalizadaHex, pagina.customizacaoTokens],
  );

  useEffect(() => {
    if (!modoPrevia) {
      try {
        const dadosArmazenar = JSON.stringify({
          urlLogotipo: pagina.identidade.urlLogotipoOpcional ?? null,
          formatoBordaLogotipo: pagina.identidade.formatoBordaLogotipo ?? null,
          nomeCliente: pagina.identidade.nomeExibicao,
          variaveisCssPaleta: variaveisPaleta,
        });
        localStorage.setItem(`fluxo_marca_${pagina.identificadorPublico}`, dadosArmazenar);
        localStorage.setItem(`fluxo_marca_${pagina.organizacaoId}`, dadosArmazenar);
        sessionStorage.setItem(`fluxo_marca_${pagina.identificadorPublico}`, dadosArmazenar);
        sessionStorage.setItem(`fluxo_marca_${pagina.organizacaoId}`, dadosArmazenar);
      } catch {
        // Ignora indisponibilidade do storage no ambiente
      }
    }

    if (duracaoLoaderEfetiva <= 0) {
      setLoaderVisivel(false);
      return;
    }

    const timerDesvanecer = setTimeout(() => {
      setDesvanecendoLoader(true);
    }, duracaoLoaderEfetiva);

    const timerRemover = setTimeout(() => {
      setLoaderVisivel(false);
    }, duracaoLoaderEfetiva + 500);

    return () => {
      clearTimeout(timerDesvanecer);
      clearTimeout(timerRemover);
    };
  }, [
    duracaoLoaderEfetiva,
    modoPrevia,
    pagina.identificadorPublico,
    pagina.organizacaoId,
    pagina.identidade.nomeExibicao,
    pagina.identidade.urlLogotipoOpcional,
    pagina.identidade.formatoBordaLogotipo,
    variaveisPaleta,
  ]);

  const microfluxosDisponiveis = useMemo(() => {
    return (acervo.microfluxos ?? []).filter((m) => m.organizacaoId === pagina.organizacaoId);
  }, [acervo.microfluxos, pagina.organizacaoId]);

  useEffect(() => {
    const origem = obterOuDetectarOrigemSessao(pagina.organizacaoId);
    void registrarEventoTelemetria({
      organizacaoId: pagina.organizacaoId,
      tipoEvento: "visualizacao_vitrine",
      canalOrigem: origem.canalOrigem,
      ...(origem.qrCodeOrigem ? { qrCodeOrigem: origem.qrCodeOrigem } : {}),
      ...(origem.cartaoProfissionalId ? { cartaoProfissionalId: origem.cartaoProfissionalId } : {}),
    });
  }, [pagina.organizacaoId, registrarEventoTelemetria]);

  useEffect(() => {
    if (!sincronizarHistoricoNavegador) return;

    function sincronizarComHash() {
      const hashAtual = window.location.hash;
      const secao = identificarSecaoPorHash(hashAtual);
      if (secao) {
        ultimaEntradaDireta.current = null;
        setMicrofluxoAtivo(null);
        setAcaoAgendaAberta(null);
        setConfiguracaoCtaSecaoAberta(undefined);
        setSecaoAberta(secao);
        return;
      }

      if (hashAtual.startsWith("#agenda-")) {
        const idExperienciaAgenda = hashAtual.slice("#agenda-".length).split("?")[0] ?? "";
        const fluxoAgenda = microfluxosDisponiveis.find(
          (m) => m.id === idExperienciaAgenda && m.ativo && m.tipoAcao === "agenda",
        );
        if (fluxoAgenda) {
          setSecaoAberta(null);
          setMicrofluxoAtivo(null);
          setAcaoPostAberta(null);
          setAcaoAgendaAberta({
            id: `acao-fluxo-${fluxoAgenda.id}`,
            rotulo: fluxoAgenda.rotuloBotaoHome?.trim() || fluxoAgenda.titulo,
            subtituloDiscreto: fluxoAgenda.subtituloBotaoHome?.trim() || undefined,
            tipoDestino: "agenda",
            destino: `#agenda-${fluxoAgenda.id}`,
            ...(fluxoAgenda.configuracaoAgenda
              ? { configuracaoAgenda: fluxoAgenda.configuracaoAgenda }
              : {}),
          });
          return;
        }
      }

      const resolucaoFluxo = resolverMicrofluxoPorDestino(hashAtual, microfluxosDisponiveis);
      if (resolucaoFluxo) {
        const chaveEntrada = `${pagina.organizacaoId}/${resolucaoFluxo.microfluxo.id}/${hashAtual}`;
        if (ultimaEntradaDireta.current === chaveEntrada) return;
        ultimaEntradaDireta.current = chaveEntrada;
        setSecaoAberta(null);
        const origem = obterOuDetectarOrigemSessao(pagina.organizacaoId);
        const parametrosEntrada = new URLSearchParams(window.location.search);
        const profissional = acervo.profissionais.find(
          (p) =>
            p.ativo &&
            p.id ===
              (resolucaoFluxo.contextoOrigem?.profissionalPreSelecionadoId ??
                parametrosEntrada.get("consultor") ??
                parametrosEntrada.get("vendedor") ??
                origem.cartaoProfissionalId),
        );
        setContextoMicrofluxo(
          profissional ? { profissionalPreSelecionadoId: profissional.id } : undefined,
        );
        setMicrofluxoAtivo(resolucaoFluxo.microfluxo);
        void registrarEventoTelemetria({
          organizacaoId: pagina.organizacaoId,
          tipoEvento: "abertura_microfluxo",
          canalOrigem: origem.canalOrigem,
          ...(origem.qrCodeOrigem ? { qrCodeOrigem: origem.qrCodeOrigem } : {}),
          microfluxoId: resolucaoFluxo.microfluxo.id,
          microfluxoTitulo: resolucaoFluxo.microfluxo.titulo,
          ...(profissional ? { profissionalId: profissional.id } : {}),
          ...(origem.cartaoProfissionalId
            ? { cartaoProfissionalId: origem.cartaoProfissionalId }
            : {}),
        });
      } else if (ultimaEntradaDireta.current !== null) {
        ultimaEntradaDireta.current = null;
        setMicrofluxoAtivo(null);
        setContextoMicrofluxo(undefined);
      }
    }

    sincronizarComHash();
    window.addEventListener("hashchange", sincronizarComHash);
    return () => window.removeEventListener("hashchange", sincronizarComHash);
  }, [
    microfluxosDisponiveis,
    pagina.organizacaoId,
    acervo.profissionais,
    sincronizarHistoricoNavegador,
    registrarEventoTelemetria,
  ]);

  function abrirCartao(profissional: ProfissionalEquipe) {
    acionadorGaveta.current = null;
    setSecaoAberta(null);
    setCartaoProfissionalAtivo(profissional);
    if (sincronizarHistoricoNavegador && typeof window !== "undefined") {
      window.history.pushState(
        { tipo: "cartao_equipe", identificadorCartao: profissional.identificadorCartao },
        "",
        `/${pagina.identificadorPublico}/equipe/${profissional.identificadorCartao}`,
      );
    }
  }

  function fecharCartao() {
    setCartaoProfissionalAtivo(null);
    if (sincronizarHistoricoNavegador && typeof window !== "undefined") {
      if (window.history.state?.tipo === "cartao_equipe") {
        window.history.back();
      } else {
        window.history.replaceState(null, "", `/${pagina.identificadorPublico}`);
      }
    }
  }

  useEffect(() => {
    if (!sincronizarHistoricoNavegador) return;

    function tratarPopState(evento: PopStateEvent) {
      if (evento.state?.tipo === "cartao_equipe") {
        const profissional = acervo.profissionais.find(
          (p) => p.identificadorCartao === evento.state?.identificadorCartao,
        );
        if (profissional) {
          setCartaoProfissionalAtivo(profissional);
          return;
        }
      }
      setCartaoProfissionalAtivo(null);
    }

    window.addEventListener("popstate", tratarPopState);
    return () => window.removeEventListener("popstate", tratarPopState);
  }, [acervo.profissionais, sincronizarHistoricoNavegador]);

  function abrirExperienciaComContexto(
    tipoPreferencial: string,
    contexto: ContextoOrigemMicrofluxo,
  ) {
    const ativos = microfluxosDisponiveis.filter((m) => m.ativo);
    const escolhido =
      ativos.find((m) => m.id === tipoPreferencial) ??
      (contexto?.servicoPreSelecionadoId || contexto?.produtoPreSelecionadoId
        ? ativos.find((m) =>
            m.etapas.some((e) =>
              e.tipoEtapa === "etapa_livre"
                ? e.blocos?.some(
                    (b) =>
                      b.tipo === "catalogo" &&
                      (b.fonte === "ambos" ||
                        (contexto.servicoPreSelecionadoId && b.fonte === "servicos") ||
                        (contexto.produtoPreSelecionadoId && b.fonte === "produtos")),
                  )
                : e.tipoEtapa === "selecao_catalogo" &&
                  (e.fonteCatalogo === "ambos" ||
                    (contexto.servicoPreSelecionadoId && e.fonteCatalogo === "servicos") ||
                    (contexto.produtoPreSelecionadoId && e.fonteCatalogo === "produtos")),
            ),
          )
        : undefined);

    if (!escolhido) {
      return;
    }

    acionadorGaveta.current = null;
    setSecaoAberta(null);
    setContextoMicrofluxo(contexto);
    setMicrofluxoAtivo(escolhido);

    const origem = obterOuDetectarOrigemSessao(pagina.organizacaoId);
    void registrarEventoTelemetria({
      organizacaoId: pagina.organizacaoId,
      tipoEvento: "abertura_microfluxo",
      canalOrigem: origem.canalOrigem,
      ...(origem.qrCodeOrigem ? { qrCodeOrigem: origem.qrCodeOrigem } : {}),
      ...(origem.cartaoProfissionalId ? { cartaoProfissionalId: origem.cartaoProfissionalId } : {}),
      microfluxoId: escolhido.id,
      microfluxoTitulo: escolhido.titulo,
      ...(contexto?.profissionalPreSelecionadoId
        ? { profissionalId: contexto.profissionalPreSelecionadoId }
        : {}),
      ...(contexto?.produtoPreSelecionadoId
        ? { itemCatalogoId: contexto.produtoPreSelecionadoId }
        : {}),
      ...(contexto?.servicoPreSelecionadoId
        ? { itemCatalogoId: contexto.servicoPreSelecionadoId }
        : {}),
    });
  }

  function aoAcionarItemHome(acao: ItemAcaoHome, acionador?: HTMLButtonElement) {
    acionadorGaveta.current = acionador ?? null;
    const origem = obterOuDetectarOrigemSessao(pagina.organizacaoId);
    void registrarEventoTelemetria({
      organizacaoId: pagina.organizacaoId,
      tipoEvento: "clique_acao_home",
      canalOrigem: origem.canalOrigem,
      ...(origem.qrCodeOrigem ? { qrCodeOrigem: origem.qrCodeOrigem } : {}),
      ...(origem.cartaoProfissionalId ? { cartaoProfissionalId: origem.cartaoProfissionalId } : {}),
      acaoHomeId: acao.id,
      acaoHomeRotulo: acao.rotulo,
    });

    if (acao.tipoDestino === "secao_produtos" || acao.destino === "#produtos") {
      setMicrofluxoAtivo(null);
      setTituloSecaoAberta(acao.tituloSecao);
      setConfiguracaoCtaSecaoAberta(acao.configuracaoCtaAcervo);
      setSecaoAberta("produtos");
      return;
    }

    if (acao.tipoDestino === "secao_servicos" || acao.destino === "#servicos") {
      setMicrofluxoAtivo(null);
      setTituloSecaoAberta(acao.tituloSecao);
      setConfiguracaoCtaSecaoAberta(acao.configuracaoCtaAcervo);
      setSecaoAberta("servicos");
      return;
    }

    if (acao.tipoDestino === "secao_portfolio" || acao.destino === "#portfolio") {
      setMicrofluxoAtivo(null);
      setTituloSecaoAberta(acao.tituloSecao);
      setConfiguracaoCtaSecaoAberta(undefined);
      setSecaoAberta("portfolio");
      return;
    }

    if (acao.tipoDestino === "secao_equipe" || acao.destino === "#equipe") {
      setMicrofluxoAtivo(null);
      setTituloSecaoAberta(acao.tituloSecao);
      setConfiguracaoCtaSecaoAberta(undefined);
      setSecaoAberta("equipe");
      return;
    }

    if (acao.tipoDestino === "agenda" || acao.destino.startsWith("#agenda-")) {
      setMicrofluxoAtivo(null);
      setSecaoAberta(null);
      setAcaoPostAberta(null);
      setAcaoAgendaAberta(acao);

      const idExperienciaAgenda = acao.destino.startsWith("#agenda-")
        ? acao.destino.slice("#agenda-".length)
        : acao.id.replace(/^acao-fluxo-/, "");
      const fluxoAgenda = microfluxosDisponiveis.find((m) => m.id === idExperienciaAgenda);

      void registrarEventoTelemetria({
        organizacaoId: pagina.organizacaoId,
        tipoEvento: "abertura_microfluxo",
        canalOrigem: origem.canalOrigem,
        ...(origem.qrCodeOrigem ? { qrCodeOrigem: origem.qrCodeOrigem } : {}),
        ...(origem.cartaoProfissionalId
          ? { cartaoProfissionalId: origem.cartaoProfissionalId }
          : {}),
        microfluxoId: fluxoAgenda?.id ?? idExperienciaAgenda,
        microfluxoTitulo: fluxoAgenda?.titulo ?? acao.rotulo,
      });
      return;
    }

    if (acao.tipoDestino === "publicacao_post" || acao.destino.startsWith("#post-")) {
      setMicrofluxoAtivo(null);
      setSecaoAberta(null);
      setAcaoPostAberta(acao);

      const idExperienciaPost = acao.destino.startsWith("#post-")
        ? acao.destino.slice("#post-".length)
        : acao.id.replace(/^acao-fluxo-/, "");
      const fluxoPost = microfluxosDisponiveis.find((m) => m.id === idExperienciaPost);

      void registrarEventoTelemetria({
        organizacaoId: pagina.organizacaoId,
        tipoEvento: "abertura_microfluxo",
        canalOrigem: origem.canalOrigem,
        ...(origem.qrCodeOrigem ? { qrCodeOrigem: origem.qrCodeOrigem } : {}),
        ...(origem.cartaoProfissionalId
          ? { cartaoProfissionalId: origem.cartaoProfissionalId }
          : {}),
        microfluxoId: fluxoPost?.id ?? idExperienciaPost,
        microfluxoTitulo: fluxoPost?.titulo ?? acao.rotulo,
      });
      return;
    }

    if (acao.tipoDestino === "microfluxo") {
      const resolucaoFluxo = resolverMicrofluxoPorDestino(acao.destino, microfluxosDisponiveis);
      const fluxoAlvo = resolucaoFluxo?.microfluxo;

      if (fluxoAlvo) {
        setSecaoAberta(null);
        setContextoMicrofluxo(resolucaoFluxo?.contextoOrigem);
        setMicrofluxoAtivo(fluxoAlvo);

        void registrarEventoTelemetria({
          organizacaoId: pagina.organizacaoId,
          tipoEvento: "abertura_microfluxo",
          canalOrigem: origem.canalOrigem,
          ...(origem.qrCodeOrigem ? { qrCodeOrigem: origem.qrCodeOrigem } : {}),
          ...(origem.cartaoProfissionalId
            ? { cartaoProfissionalId: origem.cartaoProfissionalId }
            : {}),
          microfluxoId: fluxoAlvo.id,
          microfluxoTitulo: fluxoAlvo.titulo,
          ...(resolucaoFluxo?.contextoOrigem?.profissionalPreSelecionadoId
            ? { profissionalId: resolucaoFluxo.contextoOrigem.profissionalPreSelecionadoId }
            : {}),
          ...(resolucaoFluxo?.contextoOrigem?.produtoPreSelecionadoId
            ? { itemCatalogoId: resolucaoFluxo.contextoOrigem.produtoPreSelecionadoId }
            : {}),
          ...(resolucaoFluxo?.contextoOrigem?.servicoPreSelecionadoId
            ? { itemCatalogoId: resolucaoFluxo.contextoOrigem.servicoPreSelecionadoId }
            : {}),
        });
        return;
      }
    }

    if (acao.tipoDestino === "telefone") {
      const telefoneLimpo = acao.destino.replace(/[^\d+]/g, "");
      void registrarEventoTelemetria({
        organizacaoId: pagina.organizacaoId,
        tipoEvento: "clique_ligacao",
      });
      if (!sincronizarHistoricoNavegador) {
        aoNavegarEmPrevia?.(acao.destino, "telefone");
        return;
      }
      window.location.assign(`tel:${telefoneLimpo}`);
      return;
    }

    if (/^https?:\/\//i.test(acao.destino)) {
      abrirLinkExternoSeguro(acao.destino);
      return;
    }

    if (acao.destino.startsWith("#")) {
      if (!sincronizarHistoricoNavegador) {
        aoNavegarEmPrevia?.(acao.destino, "interno");
        return;
      }
      window.location.hash = acao.destino;
      return;
    }

    if (!sincronizarHistoricoNavegador) {
      aoNavegarEmPrevia?.(acao.destino, "interno");
      return;
    }
    window.location.assign(acao.destino);
  }

  const paginaComAcoesResolvidas = useMemo(() => {
    const acoesResolvidas = resolverAcoesVitrineComMicrofluxos(
      pagina.acoesPrincipais,
      microfluxosDisponiveis,
    );
    return {
      ...pagina,
      acoesPrincipais: acoesResolvidas,
    };
  }, [pagina, microfluxosDisponiveis]);

  const configuracaoCtaGavetaEfetiva = useMemo(() => {
    if (configuracaoCtaSecaoAberta) return configuracaoCtaSecaoAberta;
    if (secaoAberta !== "produtos" && secaoAberta !== "servicos") return undefined;
    const tipoAlvo = secaoAberta === "produtos" ? "secao_produtos" : "secao_servicos";
    return paginaComAcoesResolvidas.acoesPrincipais.find((a) => a.tipoDestino === tipoAlvo)
      ?.configuracaoCtaAcervo;
  }, [configuracaoCtaSecaoAberta, secaoAberta, paginaComAcoesResolvidas.acoesPrincipais]);

  return (
    <>
      {loaderVisivel ? (
        <TelaCarregamentoEditorial
          urlLogotipo={pagina.identidade.urlLogotipoOpcional}
          formatoBordaLogotipo={pagina.identidade.formatoBordaLogotipo}
          nomeCliente={pagina.identidade.nomeExibicao}
          desvanecendo={desvanecendoLoader}
          variaveisCssPaleta={variaveisPaleta}
        />
      ) : null}
      <ContextoApresentacaoEquipe.Provider value={!loaderVisivel}>
        <RenderizadorComposicaoEditorial
          previaEquipe={previaEquipe}
          videosYoutube={acervo.videos}
          modoExibicaoVideos={acervo.modoExibicaoVideos}
          autoplayVideos={acervo.autoplayVideos}
          ocultarTituloVideos={acervo.ocultarTituloVideos}
          produtos={acervo.produtos}
          servicos={acervo.servicos}
          pagina={paginaComAcoesResolvidas}
          modoMobileForcado
          alturaContidaPrevia={alturaContidaPrevia}
          aoAcionarItem={aoAcionarItemHome}
          aoSelecionarItemAcervo={(tipo, itemId) => {
            const acaoCorrespondente = paginaComAcoesResolvidas.acoesPrincipais.find(
              (a) => a.tipoDestino === (tipo === "produtos" ? "secao_produtos" : "secao_servicos"),
            );
            const configuracaoCta = acaoCorrespondente?.configuracaoCtaAcervo;

            if (tipo === "produtos") {
              const prod = acervo.produtos.find((p) => p.id === itemId);
              if (prod) setItemDetalhado({ tipo: "produtos", item: prod, configuracaoCta });
            } else {
              const serv = acervo.servicos.find((s) => s.id === itemId);
              if (serv) setItemDetalhado({ tipo: "servicos", item: serv, configuracaoCta });
            }
          }}
          complementoChamada={
            exibirAvaliacoesGoogle ? (
              <BlocoAvaliacoesGoogle
                key={paginaComAcoesResolvidas.avaliacoesGoogle?.identificadorLocal}
                pagina={paginaComAcoesResolvidas}
                previa={modoPrevia}
              />
            ) : undefined
          }
        />
      </ContextoApresentacaoEquipe.Provider>

      <ExecutorMicrofluxoVisitante
        aberto={microfluxoAtivo !== null}
        aoAlterarAbertura={(aberto) => {
          if (!aberto) {
            setMicrofluxoAtivo(null);
            setContextoMicrofluxo(undefined);
            ultimaEntradaDireta.current = null;
            if (sincronizarHistoricoNavegador && window.location.hash.startsWith("#experiencia=")) {
              window.history.replaceState(
                window.history.state,
                "",
                `${window.location.pathname}${window.location.search}`,
              );
            }
          }
        }}
        microfluxo={microfluxoAtivo}
        contextoOrigem={contextoMicrofluxo}
        pagina={pagina}
        acervo={acervo}
        servicoSubmissao={servicoSubmissao}
      />

      <GavetaEditorialPublica
        aoRetornarFoco={() => restaurarFocoAcaoVitrine(acionadorGaveta.current)}
        aberto={secaoAberta !== null}
        aoAlterarAbertura={(aberta) => {
          if (!aberta) {
            setSecaoAberta(null);
            setConfiguracaoCtaSecaoAberta(undefined);
          }
        }}
        secaoAberta={secaoAberta}
        tituloPersonalizado={tituloSecaoAberta}
        configuracaoCta={configuracaoCtaGavetaEfetiva}
        pagina={pagina}
        acervo={acervo}
        aoSolicitarExperiencia={abrirExperienciaComContexto}
        aoAbrirCartao={abrirCartao}
      />

      {/* Bottom Sheet Clean de Detalhes do Item (Produto ou Serviço) */}
      <BottomSheetDetalhesItemAcervo
        aberto={itemDetalhado !== null}
        aoFechar={() => setItemDetalhado(null)}
        pagina={pagina}
        item={itemDetalhado?.item ?? null}
        tipo={itemDetalhado?.tipo ?? "produtos"}
        configuracaoCta={itemDetalhado?.configuracaoCta}
        aoIniciarMicrofluxo={(microfluxoId, contextoItem) => {
          const fluxo = microfluxosDisponiveis.find((m) => m.id === microfluxoId);
          if (fluxo?.tipoAcao === "agenda") {
            setSecaoAberta(null);
            setAcaoPostAberta(null);
            setAcaoAgendaAberta({
              id: `acao-fluxo-${fluxo.id}`,
              rotulo: fluxo.rotuloBotaoHome?.trim() || fluxo.titulo,
              subtituloDiscreto: fluxo.subtituloBotaoHome?.trim() || undefined,
              tipoDestino: "agenda",
              destino: `#agenda-${fluxo.id}`,
              ...(fluxo.configuracaoAgenda ? { configuracaoAgenda: fluxo.configuracaoAgenda } : {}),
            });
            return;
          }
          if (fluxo) {
            setSecaoAberta(null);
            setContextoMicrofluxo({
              ...(contextoItem.produtoId ? { produtoPreSelecionadoId: contextoItem.produtoId } : {}),
              ...(contextoItem.servicoId ? { servicoPreSelecionadoId: contextoItem.servicoId } : {}),
            });
            setMicrofluxoAtivo(fluxo);
          }
        }}
      />

      {/* Bottom Sheet de Publicação / Post */}
      <BottomSheetPostVitrine
        aberto={acaoPostAberta !== null}
        aoFechar={() => setAcaoPostAberta(null)}
        pagina={pagina}
        acaoPost={acaoPostAberta}
        aoIniciarMicrofluxo={(microfluxoId) => {
          const fluxo = microfluxosDisponiveis.find((m) => m.id === microfluxoId);
          if (fluxo?.tipoAcao === "agenda") {
            setSecaoAberta(null);
            setAcaoAgendaAberta({
              id: `acao-fluxo-${fluxo.id}`,
              rotulo: fluxo.rotuloBotaoHome?.trim() || fluxo.titulo,
              subtituloDiscreto: fluxo.subtituloBotaoHome?.trim() || undefined,
              tipoDestino: "agenda",
              destino: `#agenda-${fluxo.id}`,
              ...(fluxo.configuracaoAgenda ? { configuracaoAgenda: fluxo.configuracaoAgenda } : {}),
            });
            return;
          }
          if (fluxo) {
            setSecaoAberta(null);
            setContextoMicrofluxo(undefined);
            setMicrofluxoAtivo(fluxo);
          }
        }}
      />

      {/* Bottom Sheet de Agenda / Agendamento */}
      <GavetaAgendamentoPublico
        aberto={acaoAgendaAberta !== null}
        aoFechar={() => setAcaoAgendaAberta(null)}
        aoRetornarFoco={() => restaurarFocoAcaoVitrine(acionadorGaveta.current)}
        pagina={pagina}
        acaoAgenda={acaoAgendaAberta}
      />

      <AnimatePresence>
        {cartaoProfissionalAtivo ? (
          <motion.div
            key={`cartao-slide-${cartaoProfissionalAtivo.id}`}
            initial={movimentoReduzido ? { opacity: 0 } : { x: "100%" }}
            animate={movimentoReduzido ? { opacity: 1 } : { x: 0 }}
            exit={movimentoReduzido ? { opacity: 0 } : { x: "100%" }}
            transition={{
              duration: DURACOES_SEGUNDOS.transicaoEtapa,
              ease: CURVA_EDITORIAL,
            }}
            className={
              estaContido
                ? "absolute inset-0 z-[60] overflow-y-auto bg-[var(--editorial-fundo)] shadow-2xl"
                : "fixed inset-0 z-[60] overflow-y-auto bg-[var(--editorial-fundo)] shadow-2xl"
            }
          >
            <CartaoDigitalProfissionalPublico
              paginaOrganizacao={pagina}
              profissional={cartaoProfissionalAtivo}
              servicosAtivos={acervo.servicos}
              acervo={acervo}
              urlPublicaCartao={construirUrlPublicaCartaoProfissional({
                urlBasePublica: typeof window !== "undefined" ? window.location.origin : "",
                identificadorOrganizacao: pagina.identificadorPublico,
                identificadorCartao: cartaoProfissionalAtivo.identificadorCartao,
              })}
              aoVoltar={fecharCartao}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
