"use client";

import Image from "next/image";
import Link from "next/link";
import { copiarTextoComAviso } from "@/componentes/interface/notificacoes/copiarTextoComAviso";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  Send,
  UserPlus,
} from "lucide-react";
import { IconeWhatsapp } from "@/componentes/interface/IconeWhatsapp";
import { TransicaoColapsavel } from "@/componentes/interface/TransicaoColapsavel";
import { montarLinkWhatsapp } from "@/dominio/servicos/numeroWhatsappInternacional";
import type {
  AcervoPublicoVitrine,
  ProfissionalEquipe,
  ServicoOrganizacao,
} from "@/dominio/entidades/catalogoConteudo";
import {
  deveIgnorarOtimizadorImagem,
  gerarVariaveisCssPaletaEditorial,
  obterDescritorTipografiaEditorial,
  resolverAcoesVitrineComMicrofluxos,
  type ConfiguracaoCtaAcervo,
  type ConteudoPaginaPublicada,
  type ItemAcaoHome,
} from "@/dominio/entidades/paginaPublicada";
import { obterClasseBordaLogotipo } from "./IdentidadeETituloEditorial";
import type {
  ContextoOrigemMicrofluxo,
  DefinicaoMicrofluxo,
} from "@/dominio/microfluxos/tiposMicrofluxo";
import { gravarAtribuicaoOrigem } from "@/infraestrutura/analytics/rastreadorSessaoOrigem";
import { contextualizarAcoesParaCartao } from "@/dominio/editorial/contextualizadorAcoesCartao";
import {
  criarBlobVCard,
  gerarConteudoVCard,
  gerarNomeArquivoVCard,
} from "@/dominio/servicos/geradorVCardProfissional";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { AvatarProfissional } from "./AvatarProfissional";
import { CamadaMidiaImersiva } from "./CamadaMidiaImersiva";
import { ExecutorMicrofluxoVisitante } from "./ExecutorMicrofluxoVisitante";
import { GavetaEditorialPublica, type SecaoAcervoAberta } from "./GavetaEditorialPublica";
import { BottomSheetPostVitrine } from "./acervo/BottomSheetPostVitrine";
import { renderizarIconeAcao } from "./NavegacaoAcoesHome";
import { RodapeEditorial } from "./RodapeEditorial";
import { identificarSecaoPorHash, resolverMicrofluxoPorDestino } from "./roteadorAcoesPublicas";
import { useAmbienteVitrine } from "./contextoAmbienteVitrine";

export interface PropriedadesCartaoDigitalProfissionalPublico {
  readonly paginaOrganizacao: ConteudoPaginaPublicada;
  readonly profissional: ProfissionalEquipe;
  readonly servicosAtivos?: readonly ServicoOrganizacao[];
  readonly acervo?: AcervoPublicoVitrine;
  readonly urlPublicaCartao: string;
  readonly aoVoltar?: () => void;
}

export function CartaoDigitalProfissionalPublico({
  paginaOrganizacao,
  profissional,
  servicosAtivos,
  acervo,
  urlPublicaCartao,
  aoVoltar,
}: PropriedadesCartaoDigitalProfissionalPublico) {
  const {
    containerPortal,
    modoPrevia,
    sincronizarHistoricoNavegador,
    registrarEventoTelemetria,
    aoNavegarEmPrevia,
  } = useAmbienteVitrine();
  const estaContido = containerPortal !== null;
  const [contatoSalvo, setContatoSalvo] = useState(false);
  const [acordeaoAcoesAberto, setAcordeaoAcoesAberto] = useState(true);
  const ultimaVisualizacaoRegistrada = useRef<string | null>(null);
  const [secaoAberta, setSecaoAberta] = useState<SecaoAcervoAberta>(null);
  const [tituloSecaoAberta, setTituloSecaoAberta] = useState<string | undefined>();
  const [configuracaoCtaSecaoAberta, setConfiguracaoCtaSecaoAberta] = useState<
    ConfiguracaoCtaAcervo | undefined
  >();
  const [acaoPostAberta, setAcaoPostAberta] = useState<ItemAcaoHome | null>(null);
  const [microfluxoAtivo, setMicrofluxoAtivo] = useState<DefinicaoMicrofluxo | null>(null);
  const [contextoMicrofluxo, setContextoMicrofluxo] = useState<
    ContextoOrigemMicrofluxo | undefined
  >(undefined);

  const acervoConsolidado: AcervoPublicoVitrine = useMemo(() => {
    if (acervo) {
      return acervo;
    }
    return {
      servicos: servicosAtivos ?? [],
      produtos: [],
      projetosPortfolio: [],
      profissionais: [profissional],
      microfluxos: [],
    };
  }, [acervo, profissional, servicosAtivos]);

  const microfluxosDisponiveis = useMemo(() => {
    return acervoConsolidado.microfluxos ?? [];
  }, [acervoConsolidado.microfluxos]);

  const primeiroNome =
    profissional.nomeCompleto.trim().split(/\s+/)[0] ?? profissional.nomeCompleto;

  const acoesResolvidasParaCartao = useMemo(() => {
    const acoesDosFluxos = resolverAcoesVitrineComMicrofluxos(
      paginaOrganizacao.acoesPrincipais,
      microfluxosDisponiveis,
    );

    const destinosDosFluxos = new Set(acoesDosFluxos.map((a) => a.destino));
    const acoesFixasExtras = paginaOrganizacao.acoesPrincipais.filter(
      (a) =>
        !destinosDosFluxos.has(a.destino) &&
        !acoesDosFluxos.some((f) => f.destino.startsWith("#") && a.destino === f.destino),
    );

    return [...acoesDosFluxos, ...acoesFixasExtras];
  }, [paginaOrganizacao.acoesPrincipais, microfluxosDisponiveis]);

  const acoesContextualizadas = useMemo(() => {
    return contextualizarAcoesParaCartao(acoesResolvidasParaCartao, {
      nomeCompleto: profissional.nomeCompleto,
      primeiroNome,
      cargoOuEspecialidade: profissional.cargoOuEspecialidade,
      whatsapp: profissional.whatsappOpcional,
      nomeOrganizacao: paginaOrganizacao.identidade.nomeExibicao,
    });
  }, [
    acoesResolvidasParaCartao,
    paginaOrganizacao.identidade.nomeExibicao,
    primeiroNome,
    profissional.cargoOuEspecialidade,
    profissional.nomeCompleto,
    profissional.whatsappOpcional,
  ]);

  const configuracaoCtaGavetaEfetiva = useMemo(() => {
    if (configuracaoCtaSecaoAberta) return configuracaoCtaSecaoAberta;
    if (secaoAberta !== "produtos" && secaoAberta !== "servicos") return undefined;
    const tipoAlvo = secaoAberta === "produtos" ? "secao_produtos" : "secao_servicos";
    return acoesResolvidasParaCartao.find((a) => a.tipoDestino === tipoAlvo)
      ?.configuracaoCtaAcervo;
  }, [configuracaoCtaSecaoAberta, secaoAberta, acoesResolvidasParaCartao]);

  const urlWhatsappLimpa = montarLinkWhatsapp(
    profissional.whatsappOpcional,
    `Olá ${profissional.nomeCompleto.split(" ")[0]}, vi seu cartão digital na ${paginaOrganizacao.identidade.nomeExibicao} e gostaria de atendimento!`,
  );

  // Se o CTA de WhatsApp direto do consultor já estiver ativo no topo, desduplica as ações da vitrine
  const acoesSemDuplicidadeWhatsapp = useMemo(() => {
    if (!urlWhatsappLimpa) return acoesContextualizadas;
    return acoesContextualizadas.filter((acao) => {
      const rotuloNormalizado = acao.rotulo.toLowerCase();
      const destino = acao.destino.toLowerCase();
      return !(
        rotuloNormalizado.includes("whatsapp") ||
        rotuloNormalizado.includes("falar comigo") ||
        acao.tipoDestino === "whatsapp" ||
        acao.tipoDestino === "secao_equipe" ||
        destino === "#equipe"
      );
    });
  }, [acoesContextualizadas, urlWhatsappLimpa]);

  const variaveisPaleta = gerarVariaveisCssPaletaEditorial(
    paginaOrganizacao.paletaId,
    paginaOrganizacao.corPersonalizadaHex,
    paginaOrganizacao.customizacaoTokens,
  ) as CSSProperties;
  const tipografia = obterDescritorTipografiaEditorial(paginaOrganizacao.tipografiaId);

  // Registrar telemetria de visualização do cartão e persistir atribuição na sessão
  useEffect(() => {
    const chaveVisualizacao = `${paginaOrganizacao.organizacaoId}/${profissional.id}`;
    // StrictMode repete os efeitos em desenvolvimento, mas não representa outra visita.
    if (ultimaVisualizacaoRegistrada.current === chaveVisualizacao) return;
    ultimaVisualizacaoRegistrada.current = chaveVisualizacao;

    const params = new URLSearchParams(window.location.search);
    const qrCodeOrigem =
      params.get("utm_source") === "qrcode"
        ? (params.get("utm_content") ?? `profissional_${profissional.identificadorCartao}`)
        : undefined;

    if (!modoPrevia) {
      gravarAtribuicaoOrigem(paginaOrganizacao.organizacaoId, {
        canalOrigem: "cartao_equipe",
        cartaoProfissionalId: profissional.id,
        ...(qrCodeOrigem ? { qrCodeOrigem } : {}),
      });
    }

    void registrarEventoTelemetria({
      organizacaoId: paginaOrganizacao.organizacaoId,
      tipoEvento: "visualizacao_cartao",
      canalOrigem: "cartao_equipe",
      ...(qrCodeOrigem ? { qrCodeOrigem } : {}),
      cartaoProfissionalId: profissional.id,
      cartaoProfissionalNome: profissional.nomeCompleto,
      profissionalId: profissional.id,
      profissionalNome: profissional.nomeCompleto,
    });
  }, [
    paginaOrganizacao.organizacaoId,
    profissional.id,
    profissional.identificadorCartao,
    profissional.nomeCompleto,
    modoPrevia,
    registrarEventoTelemetria,
  ]);

  // Sincronizar hash da URL para abrir gavetas ou microfluxos diretamente
  useEffect(() => {
    if (!sincronizarHistoricoNavegador) return;

    function sincronizarComHash() {
      const hashAtual = window.location.hash;
      const secao = identificarSecaoPorHash(hashAtual);
      if (secao) {
        setMicrofluxoAtivo(null);
        setSecaoAberta(secao);
        return;
      }

      const resolucao = resolverMicrofluxoPorDestino(hashAtual, microfluxosDisponiveis);
      if (resolucao) {
        setSecaoAberta(null);
        setContextoMicrofluxo({
          profissionalPreSelecionadoId: profissional.id,
          ...resolucao.contextoOrigem,
        });
        setMicrofluxoAtivo(resolucao.microfluxo);
      }
    }

    if (window.location.hash) {
      sincronizarComHash();
    }

    window.addEventListener("hashchange", sincronizarComHash);
    return () => window.removeEventListener("hashchange", sincronizarComHash);
  }, [microfluxosDisponiveis, profissional.id, sincronizarHistoricoNavegador]);

  async function handleCompartilhar() {
    const dadosCompartilhamento = {
      title: `${profissional.nomeCompleto} — ${paginaOrganizacao.identidade.nomeExibicao}`,
      text: `${profissional.cargoOuEspecialidade} na ${paginaOrganizacao.identidade.nomeExibicao}. Contato direto:`,
      url: urlPublicaCartao,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(dadosCompartilhamento);
        return;
      } catch (erro) {
        if (erro instanceof Error && erro.name === "AbortError") return;
      }
    }

    await copiarTextoComAviso(urlPublicaCartao);
  }

  function handleSalvarContato() {
    void registrarEventoTelemetria({
      organizacaoId: paginaOrganizacao.organizacaoId,
      tipoEvento: "clique_acao_home",
      canalOrigem: "cartao_equipe",
      cartaoProfissionalId: profissional.id,
      cartaoProfissionalNome: profissional.nomeCompleto,
      profissionalId: profissional.id,
      profissionalNome: profissional.nomeCompleto,
      acaoHomeRotulo: "Salvar Contato na Agenda (vCard)",
    });

    try {
      const conteudoVCard = gerarConteudoVCard({
        nomeCompleto: profissional.nomeCompleto,
        cargoOuEspecialidade: profissional.cargoOuEspecialidade,
        nomeOrganizacao: paginaOrganizacao.identidade.nomeExibicao,
        registroProfissionalOpcional: profissional.registroProfissionalOpcional,
        minibiografia: profissional.minibiografia,
        telefoneWhatsappOpcional: profissional.whatsappOpcional,
        emailContatoOpcional: profissional.emailContatoOpcional,
        urlPublicaCartao,
        urlFotoPerfil: profissional.urlFotoPerfil,
        instagramOpcional: profissional.instagramOpcional,
        linkedinOpcional: profissional.linkedinOpcional,
      });

      const blob = criarBlobVCard(conteudoVCard);
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlBlob;
      link.download = gerarNomeArquivoVCard(profissional.nomeCompleto);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);

      setContatoSalvo(true);
      setTimeout(() => setContatoSalvo(false), 2600);
    } catch {
      // Fallback para download via rota HTTP do servidor
      window.location.assign(
        `/${paginaOrganizacao.identificadorPublico}/equipe/${profissional.identificadorCartao}/contato.vcf`,
      );
    }
  }

  function abrirExperienciaComContexto(
    tipoPreferencial: string,
    contexto: ContextoOrigemMicrofluxo,
  ) {
    const ativos = microfluxosDisponiveis.filter((m) => m.ativo);
    const escolhido =
      ativos.find((m) => m.id === tipoPreferencial) ??
      (contexto?.servicoPreSelecionadoId || contexto?.produtoPreSelecionadoId
        ? ativos.find((m) =>
            m.etapas.some(
              (e) =>
                e.tipoEtapa === "selecao_catalogo" &&
                (e.fonteCatalogo === "ambos" ||
                  (contexto.servicoPreSelecionadoId && e.fonteCatalogo === "servicos") ||
                  (contexto.produtoPreSelecionadoId && e.fonteCatalogo === "produtos")),
            ),
          )
        : undefined);

    if (!escolhido) {
      return;
    }

    setSecaoAberta(null);
    setContextoMicrofluxo({
      profissionalPreSelecionadoId: profissional.id,
      ...contexto,
    });
    setMicrofluxoAtivo(escolhido);

    void registrarEventoTelemetria({
      organizacaoId: paginaOrganizacao.organizacaoId,
      tipoEvento: "abertura_microfluxo",
      canalOrigem: "cartao_equipe",
      cartaoProfissionalId: profissional.id,
      cartaoProfissionalNome: profissional.nomeCompleto,
      profissionalId: profissional.id,
      microfluxoId: escolhido.id,
      microfluxoTitulo: escolhido.titulo,
      ...(contexto?.produtoPreSelecionadoId
        ? { itemCatalogoId: contexto.produtoPreSelecionadoId }
        : {}),
      ...(contexto?.servicoPreSelecionadoId
        ? { itemCatalogoId: contexto.servicoPreSelecionadoId }
        : {}),
    });
  }

  function aoAcionarAcaoHome(acao: ItemAcaoHome) {
    void registrarEventoTelemetria({
      organizacaoId: paginaOrganizacao.organizacaoId,
      tipoEvento: "clique_acao_home",
      canalOrigem: "cartao_equipe",
      cartaoProfissionalId: profissional.id,
      cartaoProfissionalNome: profissional.nomeCompleto,
      acaoHomeId: acao.id,
      acaoHomeRotulo: acao.rotulo,
    });

    if (
      acao.tipoDestino === "whatsapp" ||
      (acao.rotulo === "Falar comigo no WhatsApp" && urlWhatsappLimpa)
    ) {
      void registrarEventoTelemetria({
        organizacaoId: paginaOrganizacao.organizacaoId,
        tipoEvento: "clique_whatsapp",
        canalOrigem: "cartao_equipe",
        cartaoProfissionalId: profissional.id,
        cartaoProfissionalNome: profissional.nomeCompleto,
        profissionalId: profissional.id,
        profissionalNome: profissional.nomeCompleto,
      });
      window.open(urlWhatsappLimpa!, "_blank", "noopener,noreferrer");
      return;
    }

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

    if (acao.tipoDestino === "publicacao_post" || acao.destino.startsWith("#post-")) {
      setMicrofluxoAtivo(null);
      setSecaoAberta(null);
      setAcaoPostAberta(acao);

      const idExperienciaPost = acao.destino.startsWith("#post-")
        ? acao.destino.slice("#post-".length)
        : acao.id.replace(/^acao-fluxo-/, "");
      const fluxoPost = microfluxosDisponiveis.find((m) => m.id === idExperienciaPost);

      void registrarEventoTelemetria({
        organizacaoId: paginaOrganizacao.organizacaoId,
        tipoEvento: "abertura_microfluxo",
        canalOrigem: "cartao_equipe",
        cartaoProfissionalId: profissional.id,
        cartaoProfissionalNome: profissional.nomeCompleto,
        profissionalId: profissional.id,
        microfluxoId: fluxoPost?.id ?? idExperienciaPost,
        microfluxoTitulo: fluxoPost?.titulo ?? acao.rotulo,
      });
      return;
    }

    if (acao.tipoDestino === "microfluxo") {
      const resolucao = resolverMicrofluxoPorDestino(acao.destino, microfluxosDisponiveis);
      const fluxoAlvo = resolucao?.microfluxo;

      if (fluxoAlvo) {
        setSecaoAberta(null);
        setContextoMicrofluxo({
          profissionalPreSelecionadoId: profissional.id,
          ...resolucao?.contextoOrigem,
        });
        setMicrofluxoAtivo(fluxoAlvo);

        void registrarEventoTelemetria({
          organizacaoId: paginaOrganizacao.organizacaoId,
          tipoEvento: "abertura_microfluxo",
          canalOrigem: "cartao_equipe",
          cartaoProfissionalId: profissional.id,
          cartaoProfissionalNome: profissional.nomeCompleto,
          profissionalId: profissional.id,
          microfluxoId: fluxoAlvo.id,
          microfluxoTitulo: fluxoAlvo.titulo,
        });
        return;
      }
    }

    if (/^https?:\/\//i.test(acao.destino)) {
      window.open(acao.destino, "_blank", "noopener,noreferrer");
      return;
    }

    if (!sincronizarHistoricoNavegador) {
      aoNavegarEmPrevia?.(acao.destino, "interno");
      return;
    }

    window.location.assign(acao.destino);
  }

  function renderizarLinkAcaoHome(acao: ItemAcaoHome, indice: number) {
    const ehDestaque = acao.destaquePrincipal ?? indice === 0;
    const ehExterno = /^https?:\/\//i.test(acao.destino);

    const classesBotao = combinarClasses(
      "group flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--editorial-texto)]",
      ehDestaque
        ? "border border-[var(--editorial-borda)] bg-[var(--editorial-cta-fundo)] text-[var(--editorial-cta-texto)] shadow-lg shadow-black/20 hover:opacity-95"
        : "border border-[var(--editorial-borda)] bg-[var(--editorial-secundario-fundo)] text-[var(--editorial-secundario-texto)] shadow-md backdrop-blur-md hover:border-white/40",
    );

    const iconeItem = renderizarIconeAcao(acao);

    const conteudoAcao = (
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
            <span className="text-xs sm:text-sm font-semibold tracking-wide">{acao.rotulo}</span>
            {acao.subtituloDiscreto ? (
              <span
                className={combinarClasses(
                  "mt-0.5 text-[11px]",
                  ehDestaque ? "opacity-80" : "text-[var(--editorial-texto-secundario)]",
                )}
              >
                {acao.subtituloDiscreto}
              </span>
            ) : null}
          </span>
        </div>
        <ChevronRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 opacity-70 transition-transform duration-200 group-hover:translate-x-1 group-hover:opacity-100"
        />
      </>
    );

    if (ehExterno) {
      return (
        <a
          key={acao.id}
          href={acao.destino}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => aoAcionarAcaoHome(acao)}
          className={classesBotao}
        >
          {conteudoAcao}
        </a>
      );
    }

    return (
      <button
        key={acao.id}
        type="button"
        onClick={() => aoAcionarAcaoHome(acao)}
        className={classesBotao}
      >
        {conteudoAcao}
      </button>
    );
  }

  return (
    <main
      style={variaveisPaleta}
      data-testid="cartao-digital-profissional"
      className={combinarClasses(
        "relative isolate min-h-dvh overflow-x-hidden overflow-y-auto bg-[var(--editorial-fundo)] text-[var(--editorial-texto)] selection:bg-white selection:text-black",
        tipografia.classeCorpo,
      )}
    >
      {/* Camada de Mídia Imersiva da Home */}
      <CamadaMidiaImersiva
        midia={paginaOrganizacao.midiaFundo}
        paletaId={paginaOrganizacao.paletaId}
        estiloEnquadramento="tela_cheia"
        className={estaContido ? "absolute inset-0" : "fixed inset-0"}
      />

      {/* Conteúdo Centralizado e Responsivo (Web em 2 colunas com botões na lateral / Mobile fluindo naturalmente) */}
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-between px-4 py-3 sm:px-6 sm:py-4 lg:max-w-6xl xl:max-w-7xl lg:px-12 lg:py-6">
        {/* Cabeçalho Superior com Marca e Ações Rápidas */}
        <header className="flex shrink-0 items-center justify-between gap-3 pb-2">
          {aoVoltar ? (
            <button
              type="button"
              onClick={aoVoltar}
              className="group inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-white/90 transition-colors hover:text-white cursor-pointer"
            >
              <ChevronLeft
                className="h-4 w-4 sm:h-5 sm:w-5 -ml-1 text-white/70 transition-transform group-hover:-translate-x-0.5 group-hover:text-white"
                aria-hidden="true"
              />
              <span className="max-w-[200px] truncate sm:max-w-xs">
                {paginaOrganizacao.identidade.nomeExibicao}
              </span>
            </button>
          ) : (
            <Link
              href={`/${paginaOrganizacao.identificadorPublico}?origem=cartao_equipe&consultor=${profissional.id}`}
              onClick={() => {
                void registrarEventoTelemetria({
                  organizacaoId: paginaOrganizacao.organizacaoId,
                  tipoEvento: "clique_acao_home",
                  canalOrigem: "cartao_equipe",
                  cartaoProfissionalId: profissional.id,
                  cartaoProfissionalNome: profissional.nomeCompleto,
                  acaoHomeRotulo: "Acesso à Apresentação da Loja",
                });
              }}
              className="group inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              <ChevronLeft
                className="h-4 w-4 sm:h-5 sm:w-5 -ml-1 text-white/70 transition-transform group-hover:-translate-x-0.5 group-hover:text-white"
                aria-hidden="true"
              />
              <span className="max-w-[200px] truncate sm:max-w-xs">
                {paginaOrganizacao.identidade.nomeExibicao}
              </span>
            </Link>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSalvarContato}
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 cursor-pointer"
              aria-label="Salvar contato no celular"
              title="Salvar contato na agenda do celular (vCard)"
            >
              {contatoSalvo ? (
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" aria-hidden="true" />
              ) : (
                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/90" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={handleCompartilhar}
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 cursor-pointer"
              aria-label="Compartilhar este cartão"
              title="Compartilhar este cartão"
            >
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/90" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Miolo Central: Em Web vira Grid de 2 Colunas (Lateral como a Home). Em Mobile flui naturalmente */}
        <div className="my-auto w-full py-4 sm:py-6 lg:py-8">
          <div className="grid w-full gap-8 sm:gap-10 lg:grid-cols-12 lg:items-center lg:gap-10 xl:gap-16">
            {/* Coluna da Esquerda: Identidade, Perfil e Contato Direto do Consultor */}
            <section
              className={combinarClasses(
                "flex flex-col items-center text-center",
                (profissional.exibirAcoesVitrineNoCartao ?? true) &&
                  acoesSemDuplicidadeWhatsapp &&
                  acoesSemDuplicidadeWhatsapp.length > 0
                  ? "lg:col-span-7 lg:items-start lg:text-left"
                  : "lg:col-span-12",
              )}
            >
              {/* Bloco de Identidade: Logo da Loja | Avatar do Consultor */}
              <div
                className={combinarClasses(
                  "flex items-center justify-center gap-3.5 sm:gap-5",
                  (profissional.exibirAcoesVitrineNoCartao ?? true) &&
                    acoesSemDuplicidadeWhatsapp &&
                    acoesSemDuplicidadeWhatsapp.length > 0
                    ? "lg:justify-start"
                    : "lg:justify-center",
                )}
              >
                {paginaOrganizacao.identidade.urlLogotipoOpcional ? (
                  paginaOrganizacao.identidade.formatoBordaLogotipo === "circulo" ? (
                    <>
                      <div className="relative h-11 w-11 sm:h-14 sm:w-14 lg:h-16 lg:w-16 shrink-0 rounded-full overflow-hidden shadow-sm">
                        <Image
                          src={paginaOrganizacao.identidade.urlLogotipoOpcional}
                          alt={paginaOrganizacao.identidade.nomeExibicao}
                          fill
                          priority
                          sizes="(max-width: 640px) 44px, (max-width: 1024px) 56px, 64px"
                          unoptimized={deveIgnorarOtimizadorImagem(
                            paginaOrganizacao.identidade.urlLogotipoOpcional,
                          )}
                          className="object-cover"
                        />
                      </div>
                      <div
                        aria-hidden="true"
                        className="h-11 w-px shrink-0 bg-white/25 sm:h-14 lg:h-16"
                      />
                    </>
                  ) : (
                    <>
                      <div
                        className={combinarClasses(
                          "relative h-11 w-24 shrink-0 sm:h-14 sm:w-28 lg:h-16 lg:w-32",
                          obterClasseBordaLogotipo(
                            paginaOrganizacao.identidade.formatoBordaLogotipo,
                          ),
                        )}
                      >
                        <Image
                          src={paginaOrganizacao.identidade.urlLogotipoOpcional}
                          alt={paginaOrganizacao.identidade.nomeExibicao}
                          fill
                          priority
                          sizes="(max-width: 640px) 88px, (max-width: 1024px) 112px, 128px"
                          unoptimized={deveIgnorarOtimizadorImagem(
                            paginaOrganizacao.identidade.urlLogotipoOpcional,
                          )}
                          className="object-contain filter drop-shadow-md"
                        />
                      </div>
                      <div
                        aria-hidden="true"
                        className="h-11 w-px shrink-0 bg-white/25 sm:h-14 lg:h-16"
                      />
                    </>
                  )
                ) : null}

                {/* Foto de Perfil Destacada */}
                <AvatarProfissional
                  urlFoto={profissional.urlFotoPerfil ?? paginaOrganizacao.midiaFundo.urlPrincipal}
                  nome={profissional.nomeCompleto}
                  pontoFocal={profissional.pontoFocalFoto}
                  tamanho="grande"
                  formato="circular"
                  prioridade
                />
              </div>

              <div className="mt-3 space-y-0.5 sm:mt-4 sm:space-y-1">
                <h1
                  className={combinarClasses(
                    "text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl",
                    tipografia.classeTitulo,
                  )}
                >
                  {profissional.nomeCompleto}
                </h1>

                <p className="text-xs font-medium text-white/85 sm:text-sm lg:text-base">
                  {profissional.cargoOuEspecialidade}
                </p>

                {profissional.registroProfissionalOpcional ? (
                  <p className="text-[11px] text-white/60 sm:text-xs">
                    {profissional.registroProfissionalOpcional}
                  </p>
                ) : null}
              </div>

              {profissional.minibiografia ? (
                <p
                  className={combinarClasses(
                    "mx-auto mt-2 max-w-md text-xs leading-relaxed text-white/80 sm:text-sm",
                    (profissional.exibirAcoesVitrineNoCartao ?? true) &&
                      acoesSemDuplicidadeWhatsapp &&
                      acoesSemDuplicidadeWhatsapp.length > 0
                      ? "lg:mx-0 lg:max-w-lg"
                      : "lg:max-w-lg",
                  )}
                >
                  {profissional.minibiografia}
                </p>
              ) : null}

              {/* Botões de Ação Direta do Consultor */}
              <div className="mt-3.5 sm:mt-5 w-full max-w-md space-y-2">
                {/* Botão de Destaque Unificado: WhatsApp Direto do Consultor */}
                {urlWhatsappLimpa ? (
                  <a
                    href={urlWhatsappLimpa}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      void registrarEventoTelemetria({
                        organizacaoId: paginaOrganizacao.organizacaoId,
                        tipoEvento: "clique_whatsapp",
                        canalOrigem: "cartao_equipe",
                        cartaoProfissionalId: profissional.id,
                        cartaoProfissionalNome: profissional.nomeCompleto,
                        profissionalId: profissional.id,
                        profissionalNome: profissional.nomeCompleto,
                      });
                    }}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-4 py-2.5 text-white shadow-lg shadow-green-950/30 transition-all duration-200 hover:bg-[#20bd5a] hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <IconeWhatsapp
                      className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-white"
                      aria-hidden="true"
                    />
                    <span className="flex flex-col items-center text-center">
                      <span className="text-xs sm:text-sm font-bold leading-tight">
                        Falar comigo no WhatsApp
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-medium text-white/90">
                        Atendimento direto com {profissional.nomeCompleto}
                      </span>
                    </span>
                  </a>
                ) : null}

                {/* Botões Secundários: E-mail, LinkedIn & Redes do Consultor */}
                {profissional.emailContatoOpcional ||
                profissional.linkedinOpcional ||
                profissional.instagramOpcional ? (
                  <div
                    className={combinarClasses(
                      "grid w-full gap-2 pt-0.5",
                      [
                        profissional.emailContatoOpcional,
                        profissional.linkedinOpcional,
                        profissional.instagramOpcional,
                      ].filter(Boolean).length > 1
                        ? "grid-cols-2"
                        : "grid-cols-1",
                    )}
                  >
                    {profissional.emailContatoOpcional ? (
                      <a
                        href={`mailto:${profissional.emailContatoOpcional}`}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/20 active:scale-[0.99]"
                      >
                        <Mail className="h-4 w-4 text-white/80" aria-hidden="true" />
                        <span>E-mail</span>
                      </a>
                    ) : null}

                    {profissional.linkedinOpcional ? (
                      <a
                        href={profissional.linkedinOpcional}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/20 active:scale-[0.99]"
                      >
                        <ArrowUpRight className="h-4 w-4 text-white/80" aria-hidden="true" />
                        <span>LinkedIn</span>
                      </a>
                    ) : null}

                    {profissional.instagramOpcional ? (
                      <a
                        href={profissional.instagramOpcional}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={combinarClasses(
                          "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/20 active:scale-[0.99]",
                          profissional.emailContatoOpcional && profissional.linkedinOpcional
                            ? "col-span-2"
                            : "",
                        )}
                      >
                        <span>Instagram</span>
                        <ArrowUpRight className="h-4 w-4 text-white/80" aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </section>

            {/* Coluna da Direita (Web): Ações e Apresentação da Loja/Empresa (Dispostas na lateral como a Home) */}
            {(profissional.exibirAcoesVitrineNoCartao ?? true) &&
            acoesSemDuplicidadeWhatsapp &&
            acoesSemDuplicidadeWhatsapp.length > 0 ? (
              <aside className="w-full lg:col-span-5 lg:flex lg:flex-col lg:justify-center border-t border-[var(--editorial-borda)]/40 pt-6 lg:border-t-0 lg:pt-0">
                <button
                  type="button"
                  aria-expanded={acordeaoAcoesAberto}
                  aria-controls="painel-acoes-cartao-profissional"
                  onClick={() => setAcordeaoAcoesAberto((atual) => !atual)}
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg py-1 text-center transition-opacity hover:opacity-85 lg:justify-between lg:text-left cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-semibold tracking-wide text-[var(--editorial-subtitulo)]">
                    Escolha como prefere continuar
                  </span>
                  <ChevronDown
                    className={combinarClasses(
                      "h-4 w-4 shrink-0 text-[var(--editorial-subtitulo)] transition-transform duration-200",
                      acordeaoAcoesAberto ? "rotate-180" : "rotate-0",
                    )}
                    aria-hidden="true"
                  />
                </button>
                <TransicaoColapsavel aberto={acordeaoAcoesAberto}>
                  <div
                    id="painel-acoes-cartao-profissional"
                    className="w-full space-y-2 lg:space-y-2.5"
                  >
                    {acoesSemDuplicidadeWhatsapp.map((acao, indice) =>
                      renderizarLinkAcaoHome(acao, indice),
                    )}
                  </div>
                </TransicaoColapsavel>
              </aside>
            ) : null}
          </div>
        </div>

        {/* Rodapé da Loja no final do conteúdo */}
        <RodapeEditorial
          identidade={paginaOrganizacao.identidade}
          className="shrink-0 border-t border-white/15 pt-4 sm:pt-6 text-white/70"
        />
      </div>

      {/* Gaveta Modal do Acervo (Abre sem sair da página do consultor) */}
      <GavetaEditorialPublica
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
        whatsappFallbackOpcional={profissional.whatsappOpcional}
        pagina={paginaOrganizacao}
        acervo={acervoConsolidado}
        aoSolicitarExperiencia={abrirExperienciaComContexto}
        consultorPadraoId={profissional.id}
      />

      {/* Bottom Sheet de Publicação / Post */}
      <BottomSheetPostVitrine
        aberto={acaoPostAberta !== null}
        aoFechar={() => setAcaoPostAberta(null)}
        pagina={paginaOrganizacao}
        acaoPost={acaoPostAberta}
        whatsappFallbackOpcional={profissional.whatsappOpcional}
        aoIniciarMicrofluxo={(microfluxoId) => {
          const fluxo = microfluxosDisponiveis.find((m) => m.id === microfluxoId);
          if (fluxo) {
            setSecaoAberta(null);
            setContextoMicrofluxo({ profissionalPreSelecionadoId: profissional.id });
            setMicrofluxoAtivo(fluxo);
          }
        }}
      />

      {/* Executor do Microfluxo (Abre interativamente com o consultor pré-selecionado) */}
      <ExecutorMicrofluxoVisitante
        aberto={microfluxoAtivo !== null}
        aoAlterarAbertura={(aberto) => {
          if (!aberto) {
            setMicrofluxoAtivo(null);
            setContextoMicrofluxo(undefined);
          }
        }}
        microfluxo={microfluxoAtivo}
        contextoOrigem={contextoMicrofluxo}
        pagina={paginaOrganizacao}
        acervo={acervoConsolidado}
      />
    </main>
  );
}
