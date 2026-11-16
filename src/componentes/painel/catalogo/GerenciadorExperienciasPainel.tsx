"use client";

import { AvisoRecursoRestrito } from "@/componentes/painel/AvisosPublicidade";
import { usePoliticaPublicidade } from "@/componentes/painel/ProvedorPoliticaPublicidade";
import { copiarTextoComAviso } from "@/componentes/interface/notificacoes/copiarTextoComAviso";
import { construirCaminhoExperiencia } from "@/dominio/microfluxos/conclusaoMicrofluxo";
import { notificar } from "@/componentes/interface/notificacoes/notificar";

import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import Link from "next/link";
import { AcoesPublicacaoPagina } from "@/componentes/painel/AcoesPublicacaoPagina";
import { usePublicacaoPagina } from "@/ganchos/usePublicacaoPagina";
import * as Dialogo from "@radix-ui/react-dialog";
import { useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Link2,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Star,
  Workflow,
  X,
  Trash2,
} from "lucide-react";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import {
  type DefinicaoMicrofluxo,
  type EtapaMicrofluxo,
  type TipoAcaoVitrine,
} from "@/dominio/microfluxos/tiposMicrofluxo";
import {
  definirDestaqueExclusivoMicrofluxo,
  ordenarMicrofluxosPorPrioridadeEOrdem,
  reordenarPosicaoMicrofluxo,
} from "@/dominio/microfluxos/ordenacaoMicrofluxos";
import { avaliarIntegridadeGrafoMicrofluxo } from "@/dominio/microfluxos/validadorGrafoMicrofluxo";
import { servicoCatalogoConteudoCliente } from "@/infraestrutura/painel/servicoCatalogoConteudoCliente";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { CanvasEditorVisualFluxos } from "../microfluxos/CanvasEditorVisualFluxos";
import { SeletorIconeAcaoPopover } from "../editor/SeletorIconeAcaoPopover";
import { TituloExperienciaEditavel } from "./TituloExperienciaEditavel";
import { ConfiguracaoEquipeVitrine } from "./ConfiguracaoEquipeVitrine";
import { OpcaoOcultarTituloVideosExperiencia } from "./OpcaoOcultarTituloVideosExperiencia";

const DESCRITORES_TIPO_ACAO: Record<TipoAcaoVitrine, { rotulo: string; iconeBadge: string }> = {
  microfluxo: {
    rotulo: "Percurso guiado",
    iconeBadge: "Jornada",
  },
  link_externo: {
    rotulo: "Link externo",
    iconeBadge: "Link",
  },
  secao_produtos: {
    rotulo: "Produtos",
    iconeBadge: "Produtos",
  },
  secao_servicos: {
    rotulo: "Serviços",
    iconeBadge: "Serviços",
  },
  secao_portfolio: {
    rotulo: "Portfólio",
    iconeBadge: "Portfólio",
  },
  secao_equipe: {
    rotulo: "Equipe",
    iconeBadge: "Equipe",
  },
  secao_videos: {
    rotulo: "Vídeos do YouTube",
    iconeBadge: "Vídeos",
  },
  whatsapp: {
    rotulo: "WhatsApp",
    iconeBadge: "WhatsApp",
  },
  telefone: {
    rotulo: "Telefone",
    iconeBadge: "Telefone",
  },
};

function sincronizarEtapaPixManualNoGrafo(
  etapasAtuais: readonly EtapaMicrofluxo[],
  habilitarPix: boolean,
  dadosPix: {
    readonly chavePix: string;
    readonly nomeRecebedor: string;
    readonly valorReferenciaTexto: string;
    readonly instrucaoComprovante: string;
  },
): readonly EtapaMicrofluxo[] {
  const idPix = "etapa-pix-manual";
  const semPix = etapasAtuais.filter(
    (e) => e.id !== idPix && e.tipoEtapa !== "instrucao_pix_manual",
  );
  const etapaContato =
    semPix.find((e) => e.tipoEtapa === "coleta_contato") ?? semPix[semPix.length - 1];

  if (!etapaContato) {
    return etapasAtuais;
  }

  if (!habilitarPix) {
    return semPix.map((etapa) => {
      if (etapa.proximaEtapaPadraoId === idPix) {
        return {
          ...etapa,
          proximaEtapaPadraoId: etapaContato.id,
        };
      }
      return etapa;
    });
  }

  const novaEtapaPix: EtapaMicrofluxo = {
    id: idPix,
    tipoEtapa: "instrucao_pix_manual",
    titulo: "Sinal ou pagamento via Pix direto",
    subtituloOpcional: "Transfira diretamente para a chave Pix oficial do estabelecimento.",
    obrigatoria: false,
    proximaEtapaPadraoId: etapaContato.id,
    configuracaoPixManual: {
      chavePix: dadosPix.chavePix.trim(),
      nomeRecebedor: dadosPix.nomeRecebedor.trim(),
      ...(dadosPix.valorReferenciaTexto.trim()
        ? { valorReferenciaTexto: dadosPix.valorReferenciaTexto.trim() }
        : {}),
      instrucaoComprovante:
        dadosPix.instrucaoComprovante.trim() ||
        "Apresente ou envie o comprovante após concluir sua solicitação.",
    },
  };

  const reconectadas = semPix.map((etapa) => {
    if (etapa.id !== etapaContato.id && etapa.proximaEtapaPadraoId === etapaContato.id) {
      return {
        ...etapa,
        proximaEtapaPadraoId: idPix,
      };
    }
    return etapa;
  });

  const indiceContato = reconectadas.findIndex((e) => e.id === etapaContato.id);
  return [
    ...reconectadas.slice(0, indiceContato),
    novaEtapaPix,
    ...reconectadas.slice(indiceContato),
  ];
}

export interface PropriedadesGerenciadorExperienciasPainel {
  readonly profissionais?: readonly ProfissionalEquipe[];
  readonly quantidadeProfissionaisAtivos?: number;
  readonly organizacaoId: string;
  readonly identificadorPublico: string;
  readonly microfluxosIniciais: readonly DefinicaoMicrofluxo[];
  readonly versaoPublicadaInicial: number | null;
  readonly podeEditarConteudo: boolean;
  readonly podePublicarPagina: boolean;
  readonly servicoCatalogo?: ServicoCatalogoConteudoPorta;
}

export function GerenciadorExperienciasPainel({
  quantidadeProfissionaisAtivos,
  profissionais = [],
  organizacaoId,
  identificadorPublico,
  microfluxosIniciais,
  versaoPublicadaInicial,
  podeEditarConteudo,
  podePublicarPagina,
  servicoCatalogo = servicoCatalogoConteudoCliente,
}: PropriedadesGerenciadorExperienciasPainel) {
  const politicaPublicidade = usePoliticaPublicidade();
  const [microfluxos, setMicrofluxos] = useState<readonly DefinicaoMicrofluxo[]>(() =>
    ordenarMicrofluxosPorPrioridadeEOrdem(microfluxosIniciais),
  );
  const [fluxoSelecionadoId, setFluxoSelecionadoId] = useState<string>(() => {
    const ordenados = ordenarMicrofluxosPorPrioridadeEOrdem(microfluxosIniciais);
    return ordenados[0]?.id ?? "";
  });

  const [busca, setBusca] = useState("");
  const [filtroVisibilidade, setFiltroVisibilidade] = useState<
    "todas" | "visiveis" | "ocultas" | "destaque"
  >("todas");
  // Preserve os índices da lista completa para reordenar mesmo durante uma busca.
  const experienciasFiltradas = microfluxos
    .map((fluxo, idx) => ({ fluxo, idx }))
    .filter(({ fluxo }) => {
      const termo = busca.trim().toLocaleLowerCase("pt-BR");
      const correspondeBusca =
        `${fluxo.titulo} ${fluxo.rotuloBotaoHome ?? ""} ${fluxo.descricaoCurta}`
          .toLocaleLowerCase("pt-BR")
          .includes(termo);
      const correspondeSituacao =
        filtroVisibilidade === "todas" ||
        (filtroVisibilidade === "visiveis"
          ? fluxo.ativo
          : filtroVisibilidade === "ocultas"
            ? !fluxo.ativo
            : fluxo.ativo && fluxo.destaquePrimarioHome);
      return correspondeBusca && correspondeSituacao;
    });

  const [rascunhoSalvo, setRascunhoSalvo] = useState(microfluxos);
  const [idFluxoExcluir, setIdFluxoExcluir] = useState<string | null>(null);
  const botaoCancelarExclusao = useRef<HTMLButtonElement>(null);
  const botaoNovaExperiencia = useRef<HTMLButtonElement>(null);
  const fluxoParaExcluir = microfluxos.find((fluxo) => fluxo.id === idFluxoExcluir);

  const alteradas = microfluxos.filter(
    (fluxo) =>
      JSON.stringify(fluxo) !==
      JSON.stringify(rascunhoSalvo.find((salvo) => salvo.id === fluxo.id)),
  );
  const idsExcluidos = rascunhoSalvo
    .filter((salvo) => !microfluxos.some((fluxo) => fluxo.id === salvo.id))
    .map((salvo) => salvo.id);
  const haAlteracoesPendentes = alteradas.length > 0 || idsExcluidos.length > 0;
  const fluxoAtual = microfluxos.find((m) => m.id === fluxoSelecionadoId) ?? microfluxos[0];
  const etapaPixExistente = fluxoAtual?.etapas.find((e) => e.tipoEtapa === "instrucao_pix_manual");
  const inconsistenciasGrafo = fluxoAtual ? avaliarIntegridadeGrafoMicrofluxo(fluxoAtual) : [];
  const grafoIntegro = inconsistenciasGrafo.length === 0;

  const controle = usePublicacaoPagina({
    versaoPublicadaInicial,
    podeSalvarRascunho: podeEditarConteudo,
    podePublicarPagina,
    haAlteracoesNaoSalvas: haAlteracoesPendentes,
    salvarRascunho: async () => {
      await servicoCatalogo.salvarRascunhoExperiencias(organizacaoId, alteradas, idsExcluidos);
      setRascunhoSalvo(microfluxos);
    },
    validarPublicacao: () => {
      for (const fluxo of microfluxos.filter((f) => f.ativo)) {
        const problemas = avaliarIntegridadeGrafoMicrofluxo(fluxo);
        if (problemas.length) {
          setFluxoSelecionadoId(fluxo.id);
          throw new Error(
            `Revise “${fluxo.titulo}” antes de publicar: ${problemas.map((p) => p.mensagem).join(" ")}`,
          );
        }
      }
    },
    publicarPagina: () => servicoCatalogo.publicarPagina(organizacaoId),
  });
  const podeAlterar = podeEditarConteudo && !controle.ocupado;
  const versaoPublicada = controle.versaoPublicada;

  function moverCard(indiceOrigem: number, direcao: -1 | 1) {
    if (!podeAlterar) return;
    setMicrofluxos(reordenarPosicaoMicrofluxo(microfluxos, indiceOrigem, direcao));
  }

  function alterarExibicao(valor: string) {
    if (!podeAlterar || !fluxoAtual) return;
    const atualizada = microfluxos.map((fluxo) =>
      fluxo.id === fluxoAtual.id
        ? { ...fluxo, ativo: valor !== "oculta", ativoNaHome: valor !== "oculta" }
        : fluxo,
    );
    setMicrofluxos(
      definirDestaqueExclusivoMicrofluxo(atualizada, fluxoAtual.id, valor === "destaque"),
    );
  }

  function criarNovoFluxo() {
    if (!podeAlterar) return;
    const novoId = `experiencia-${crypto.randomUUID()}`;
    const numero = microfluxos.length + 1;
    const novoFluxo: DefinicaoMicrofluxo = {
      id: novoId,
      organizacaoId,
      tipoAcao: "microfluxo",
      ancoraAcionamento: `#${novoId}`,
      titulo: `Nova experiência ${numero}`,
      descricaoCurta: "Percurso interativo personalizado.",
      textoBotaoConclusao: "Concluir experiência",
      mensagemConfirmacaoTitulo: "Experiência concluída",
      mensagemConfirmacaoCorpo: "Obrigado por concluir este percurso.",
      etapaInicialId: "",
      etapas: [],
      ativo: false,
      ativoNaHome: false,
      destaquePrimarioHome: false,
      ordemHome: microfluxos.length,
      rotuloBotaoHome: `Nova experiência ${numero}`,
      atualizadoEmIso: new Date().toISOString(),
    };

    setMicrofluxos((lista) => {
      const atualizada = [...lista, novoFluxo];
      return ordenarMicrofluxosPorPrioridadeEOrdem(atualizada);
    });
    setFluxoSelecionadoId(novoId);
    setBusca("");
    setFiltroVisibilidade("todas");
  }

  function confirmarExclusaoFluxo() {
    if (!podeAlterar || !fluxoParaExcluir) return;
    const restantes = microfluxos.filter((m) => m.id !== fluxoParaExcluir.id);
    const ordenados = ordenarMicrofluxosPorPrioridadeEOrdem(restantes);
    setMicrofluxos(ordenados);
    setFluxoSelecionadoId(ordenados[0]?.id ?? "");
    setIdFluxoExcluir(null);
    notificar.informacao(
      `Exclusão de “${fluxoParaExcluir.titulo}” pendente. Clique em “Publicar página” para removê-la da página pública. Recarregar sem salvar ou publicar cancela esta alteração.`,
    );
  }

  function atualizarFluxoSelecionado(
    atualizador: (atual: DefinicaoMicrofluxo) => DefinicaoMicrofluxo,
  ) {
    if (!podeAlterar || !fluxoAtual) return;

    setMicrofluxos((lista) =>
      lista.map((item) => (item.id === fluxoAtual.id ? atualizador(item) : item)),
    );
  }

  function atualizarEtapaFluxo(
    etapaId: string,
    atualizador: (etapa: EtapaMicrofluxo) => EtapaMicrofluxo,
  ) {
    atualizarFluxoSelecionado((atual) => ({
      ...atual,
      etapas: atual.etapas.map((etapa) => (etapa.id === etapaId ? atualizador(etapa) : etapa)),
    }));
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-marfim-200/80 pb-6">
        <div className="space-y-1">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
            Sua vitrine · Experiências
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
              Experiências Interativas
            </h1>
            {versaoPublicada !== null ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
                Vitrine v{versaoPublicada}
              </span>
            ) : null}
          </div>
          <p className="text-xs leading-relaxed text-mineral-500">
            Organize as opções e os percursos exibidos na sua página.
          </p>
        </div>
        <AcoesPublicacaoPagina
          controle={controle}
          identificadorPublico={identificadorPublico}
          exibirSalvarRascunho
          orientacao="Publicar página salva as alterações pendentes antes de atualizar a vitrine."
        />
      </header>

      <section
        aria-label="Resumo das experiências"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {[
          {
            rotulo: "Experiências",
            quantidade: microfluxos.length,
            icone: Compass,
            cor: "border-indigo-200 from-indigo-50/80 text-indigo-950",
            iconeCor: "bg-indigo-600",
          },
          {
            rotulo: "Visíveis",
            quantidade: microfluxos.filter((f) => f.ativo).length,
            icone: Check,
            cor: "border-emerald-200 from-emerald-50/80 text-emerald-950",
            iconeCor: "bg-emerald-600",
          },
          {
            rotulo: "Percursos guiados",
            quantidade: microfluxos.filter((f) => !f.tipoAcao || f.tipoAcao === "microfluxo")
              .length,
            icone: Workflow,
            cor: "border-sky-200 from-sky-50/80 text-sky-950",
            iconeCor: "bg-sky-600",
          },
          {
            rotulo: "Ocultas",
            quantidade: microfluxos.filter((f) => !f.ativo).length,
            icone: EyeOff,
            cor: "border-violet-200 from-violet-50/80 text-violet-950",
            iconeCor: "bg-violet-600",
          },
        ].map((item) => (
          <div
            key={item.rotulo}
            className={combinarClasses(
              "rounded-2xl border bg-gradient-to-b via-white to-white p-4 shadow-xs sm:p-5",
              item.cor,
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold">{item.rotulo}</p>
              <span
                className={combinarClasses(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white",
                  item.iconeCor,
                )}
              >
                <item.icone className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold tabular-nums">{item.quantidade}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-mineral-950">Suas experiências</h2>
          <p className="mt-1 text-xs text-mineral-500">
            Selecione para editar. Use as setas para definir a ordem na vitrine.
          </p>
        </div>

        <Botao
          type="button"
          variante="operacional_secundario"
          tamanho="compacto"
          ref={botaoNovaExperiencia}
          onClick={criarNovoFluxo}
          disabled={!podeAlterar}
          className="inline-flex items-center gap-1.5 rounded-lg border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Nova experiência</span>
        </Botao>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-marfim-200 bg-white p-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mineral-400"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Buscar experiências"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar título ou descrição…"
            className="min-h-10 w-full rounded-lg border border-marfim-200 bg-white py-2 pr-3 pl-9 text-xs focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <select
          aria-label="Filtrar experiências por exibição"
          value={filtroVisibilidade}
          onChange={(e) => setFiltroVisibilidade(e.target.value as typeof filtroVisibilidade)}
          className="min-h-10 min-w-0 rounded-lg border border-marfim-200 bg-white px-3 py-2 text-xs text-mineral-700 focus:border-indigo-400 focus:outline-none"
        >
          <option value="todas">Todas as experiências</option>
          <option value="visiveis">Visíveis</option>
          <option value="ocultas">Ocultas</option>
          <option value="destaque">Em destaque</option>
        </select>
      </div>
      {microfluxos.length > 0 && experienciasFiltradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-marfim-200 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-mineral-900">Nenhuma experiência encontrada</p>
          <button
            type="button"
            className="mt-2 min-h-10 rounded-lg px-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
            onClick={() => {
              setBusca("");
              setFiltroVisibilidade("todas");
            }}
          >
            Limpar filtros
          </button>
        </div>
      ) : null}

      <div
        role="tablist"
        aria-label="Experiências da vitrine"
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4 min-[100rem]:grid-cols-5 min-[120rem]:grid-cols-6"
      >
        {experienciasFiltradas.map(({ fluxo, idx }) => {
          const selecionada = fluxo.id === fluxoAtual?.id;
          const nomeExibicao = fluxo.rotuloBotaoHome?.trim() || fluxo.titulo;
          const ehDestaque = fluxo.destaquePrimarioHome === true;
          const IconeExibicao = ehDestaque ? Star : fluxo.ativo ? Eye : EyeOff;
          const tipoAcao = fluxo.tipoAcao ?? "microfluxo";
          const ehMicrofluxo = tipoAcao === "microfluxo";
          const podeMoverEsquerda =
            podeAlterar && !ehDestaque && idx > (microfluxos[0]?.destaquePrimarioHome ? 1 : 0);
          const podeMoverDireita = podeAlterar && !ehDestaque && idx < microfluxos.length - 1;

          return (
            <div
              key={fluxo.id}
              role="tab"
              id={`aba-experiencia-${fluxo.id}`}
              tabIndex={
                selecionada ||
                (!experienciasFiltradas.some(({ fluxo: item }) => item.id === fluxoAtual?.id) &&
                  fluxo.id === experienciasFiltradas[0]?.fluxo.id)
                  ? 0
                  : -1
              }
              aria-controls="editor-experiencia-selecionada"
              aria-selected={selecionada}
              onClick={() => {
                setFluxoSelecionadoId(fluxo.id);
              }}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return;
                const indice = experienciasFiltradas.findIndex(
                  ({ fluxo: item }) => item.id === fluxo.id,
                );
                const proximoIndice =
                  e.key === "ArrowRight"
                    ? (indice + 1) % experienciasFiltradas.length
                    : e.key === "ArrowLeft"
                      ? (indice - 1 + experienciasFiltradas.length) % experienciasFiltradas.length
                      : e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? experienciasFiltradas.length - 1
                          : null;
                if (proximoIndice !== null) {
                  const destino = experienciasFiltradas[proximoIndice]?.fluxo;
                  if (!destino) return;
                  e.preventDefault();
                  setFluxoSelecionadoId(destino.id);
                  document.getElementById(`aba-experiencia-${destino.id}`)?.focus();
                  return;
                }
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFluxoSelecionadoId(fluxo.id);
                }
              }}
              className={combinarClasses(
                "group relative flex min-h-28 min-w-0 cursor-pointer flex-col items-start justify-between gap-3 rounded-2xl border bg-gradient-to-b p-4 text-left text-mineral-800 shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500",
                selecionada
                  ? "border-indigo-300 from-indigo-50/80 to-white ring-1 ring-indigo-100"
                  : "border-marfim-200 from-white to-white hover:border-indigo-200 hover:from-indigo-50/30",
              )}
            >
              <div className="flex w-full items-center gap-1.5 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-[10px] font-bold tabular-nums text-indigo-700">
                  {idx + 1}º
                </span>
                <span className="line-clamp-2 min-w-0 text-sm font-semibold" title={nomeExibicao}>
                  {nomeExibicao}
                </span>
              </div>

              <div className="mt-0.5 flex w-full flex-wrap items-center justify-between gap-x-1 gap-y-2">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-[10px]">
                  <span
                    className={combinarClasses(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold",
                      ehDestaque
                        ? "border-violet-200 bg-violet-50 text-violet-800"
                        : fluxo.ativo
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-marfim-200 bg-marfim-50 text-mineral-500",
                    )}
                  >
                    <IconeExibicao className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {ehDestaque ? "Em destaque" : fluxo.ativo ? "Visível" : "Oculta"}
                  </span>

                  <span className="text-mineral-400">·</span>

                  {ehMicrofluxo ? (
                    <span className={combinarClasses("text-mineral-500")}>
                      {fluxo.etapas.length} etapas
                    </span>
                  ) : (
                    <span
                      className={combinarClasses(
                        "inline-flex items-center gap-1",
                        "text-mineral-600",
                      )}
                    >
                      {tipoAcao === "link_externo" ? (
                        <Globe className="h-2.5 w-2.5" />
                      ) : tipoAcao === "whatsapp" ? (
                        <MessageCircle className="h-2.5 w-2.5" />
                      ) : tipoAcao === "telefone" ? (
                        <Phone className="h-2.5 w-2.5" />
                      ) : (
                        <Compass className="h-2.5 w-2.5" />
                      )}
                      {DESCRITORES_TIPO_ACAO[tipoAcao]?.iconeBadge ?? "Link"}
                    </span>
                  )}
                </div>

                <div
                  className="ml-auto flex shrink-0 items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {ehMicrofluxo ? (
                    <button
                      type="button"
                      aria-label={`Copiar permalink de ${nomeExibicao}`}
                      title={`Copiar link da versão publicada de ${nomeExibicao}`}
                      onClick={() =>
                        void copiarTextoComAviso(
                          new URL(
                            construirCaminhoExperiencia(identificadorPublico, fluxo.id),
                            window.location.origin,
                          ).href,
                          "Permalink da experiência copiado.",
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded border border-marfim-200 bg-white text-mineral-500 transition hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <Link2 className="h-3 w-3" aria-hidden="true" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    title={
                      ehDestaque
                        ? "A experiência em destaque permanece na primeira posição"
                        : "Mover para a esquerda"
                    }
                    aria-label={`Mover ${nomeExibicao} para a esquerda`}
                    disabled={!podeMoverEsquerda}
                    onClick={(e) => {
                      e.stopPropagation();
                      moverCard(idx, -1);
                    }}
                    className={combinarClasses(
                      "h-7 w-7 rounded flex items-center justify-center transition cursor-pointer disabled:cursor-not-allowed",
                      "border border-marfim-200 bg-white text-mineral-500 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-25",
                    )}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    title={
                      ehDestaque
                        ? "A experiência em destaque permanece na primeira posição"
                        : "Mover para a direita"
                    }
                    aria-label={`Mover ${nomeExibicao} para a direita`}
                    disabled={!podeMoverDireita}
                    onClick={(e) => {
                      e.stopPropagation();
                      moverCard(idx, 1);
                    }}
                    className={combinarClasses(
                      "h-7 w-7 rounded flex items-center justify-center transition cursor-pointer disabled:cursor-not-allowed",
                      "border border-marfim-200 bg-white text-mineral-500 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-25",
                    )}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Visual Unificado */}
      {fluxoAtual ? (
        <fieldset
          id="editor-experiencia-selecionada"
          aria-label={`Configuração de ${fluxoAtual.titulo}`}
          disabled={!podeAlterar}
          className="min-w-0 space-y-4"
        >
          {!experienciasFiltradas.some(({ fluxo }) => fluxo.id === fluxoAtual.id) ? (
            <p className="flex flex-wrap items-center gap-2 px-1 text-xs text-mineral-500">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
              Editando:{" "}
              <span className="font-semibold text-mineral-900">
                {fluxoAtual.rotuloBotaoHome || fluxoAtual.titulo}
              </span>
            </p>
          ) : null}
          <div className="space-y-4 rounded-2xl border border-marfim-200 bg-gradient-to-b from-indigo-50/30 via-white to-white p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex w-full min-w-0 flex-auto items-center gap-3 sm:w-auto sm:flex-1">
                {fluxoAtual.tipoAcao !== "secao_equipe" ? (
                  <SeletorIconeAcaoPopover
                    key={fluxoAtual.id}
                    compacto
                    valorSelecionado={fluxoAtual.iconeBotaoHome ?? "automatico"}
                    disabled={!podeAlterar}
                    aoSelecionar={(iconeId) =>
                      atualizarFluxoSelecionado((atual) => ({ ...atual, iconeBotaoHome: iconeId }))
                    }
                  />
                ) : null}
                <div className="min-w-0 flex-1 space-y-1">
                  {fluxoAtual.tipoAcao === "secao_equipe" ? (
                    <p className="text-[11px] font-medium text-mineral-600">Título na vitrine</p>
                  ) : null}
                  <TituloExperienciaEditavel
                    key={fluxoAtual.id}
                    valor={
                      fluxoAtual.tipoAcao === "secao_equipe"
                        ? fluxoAtual.rotuloBotaoHome || fluxoAtual.titulo
                        : fluxoAtual.titulo
                    }
                    rotuloCampo={
                      fluxoAtual.tipoAcao === "secao_equipe" ? "Título na vitrine" : undefined
                    }
                    placeholder={
                      fluxoAtual.tipoAcao === "secao_equipe"
                        ? "Ex.: Converse com nossa equipe"
                        : undefined
                    }
                    limiteCaracteres={fluxoAtual.tipoAcao === "secao_equipe" ? 80 : undefined}
                    disabled={!podeAlterar}
                    aoAlterar={(titulo) =>
                      atualizarFluxoSelecionado((atual) => ({
                        ...atual,
                        titulo,
                        rotuloBotaoHome: titulo,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-end gap-2.5">
                <label className="space-y-1 text-xs font-medium text-mineral-700">
                  <span className="block">Exibição</span>
                  <select
                    aria-label="Exibição"
                    value={
                      !fluxoAtual.ativo
                        ? "oculta"
                        : fluxoAtual.destaquePrimarioHome
                          ? "destaque"
                          : "visivel"
                    }
                    onChange={(evento) => alterarExibicao(evento.target.value)}
                    className="min-h-10 rounded-lg border border-marfim-200 bg-white px-3 text-sm text-mineral-950"
                  >
                    <option value="oculta">Oculta</option>
                    <option value="visivel">Visível</option>
                    <option value="destaque">Em destaque</option>
                  </select>
                </label>

                {fluxoAtual.destaquePrimarioHome ? (
                  <label className="flex cursor-pointer items-center gap-2 pb-2 text-xs font-medium text-mineral-800">
                    <input
                      type="checkbox"
                      disabled={!podeAlterar}
                      checked={Boolean(fluxoAtual.animarBordaDestaque)}
                      onChange={(e) => {
                        const marcado = e.target.checked;
                        atualizarFluxoSelecionado((f) => ({
                          ...f,
                          animarBordaDestaque: marcado,
                        }));
                      }}
                      className="h-4 w-4 rounded border-marfim-300 accent-mineral-900"
                    />
                    <span>Brilho na borda</span>
                  </label>
                ) : null}
                <details key={fluxoAtual.id} className="relative">
                  <summary
                    aria-label="Mais opções da experiência"
                    className="flex min-h-10 min-w-10 cursor-pointer list-none items-center justify-center rounded-md text-mineral-600 hover:bg-marfim-100 [&::-webkit-details-marker]:hidden"
                  >
                    <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                  </summary>
                  <div className="absolute right-0 z-30 mt-1 w-52 rounded-lg border border-marfim-200 bg-white p-1 shadow-lg">
                    <button
                      type="button"
                      disabled={!podeAlterar}
                      onClick={(evento) => {
                        if (!podeAlterar) return;
                        evento.currentTarget.closest("details")?.removeAttribute("open");
                        setIdFluxoExcluir(fluxoAtual.id);
                      }}
                      className="flex min-h-10 w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Excluir experiência
                    </button>
                  </div>
                </details>
              </div>
            </div>

            <div className="grid gap-3 pt-3 border-t border-marfim-200 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="tipo-acao-vitrine"
                  className="block text-[11px] font-semibold text-mineral-700 uppercase tracking-wider"
                >
                  Tipo de Ação na Vitrine
                </label>
                <select
                  id="tipo-acao-vitrine"
                  value={
                    fluxoAtual.tipoAcao === "secao_servicos" ||
                    fluxoAtual.tipoAcao === "secao_portfolio"
                      ? "microfluxo"
                      : (fluxoAtual.tipoAcao ?? "microfluxo")
                  }
                  disabled={!podeAlterar}
                  onChange={(e) => {
                    const novoTipo = e.target.value as TipoAcaoVitrine;
                    atualizarFluxoSelecionado((atual) => ({
                      ...atual,
                      tipoAcao: novoTipo,
                      ...(novoTipo === "secao_equipe" ? { urlDestinoOpcional: "#equipe" } : {}),
                    }));
                  }}
                  className="mt-1 w-full rounded-lg border border-marfim-200 bg-white px-2.5 py-1.5 text-xs text-mineral-950 focus:border-indigo-400 focus:outline-none"
                >
                  {Object.entries(DESCRITORES_TIPO_ACAO)
                    .filter(([valor]) => valor !== "secao_servicos" && valor !== "secao_portfolio")
                    .map(([valor, descritor]) => (
                      <option key={valor} value={valor}>
                        {descritor.rotulo}
                      </option>
                    ))}
                </select>
                {fluxoAtual.tipoAcao === "secao_videos" ? (
                  <OpcaoOcultarTituloVideosExperiencia organizacaoId={organizacaoId} />
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="subtitulo-vitrine-experiencia"
                  className="block text-[11px] font-semibold text-mineral-700 uppercase tracking-wider"
                >
                  {fluxoAtual.tipoAcao === "secao_equipe"
                    ? "Subtítulo na vitrine (opcional)"
                    : "Subtítulo do botão na vitrine (apoio na Home)"}
                </label>
                <input
                  id="subtitulo-vitrine-experiencia"
                  aria-label={
                    fluxoAtual.tipoAcao === "secao_equipe"
                      ? "Subtítulo na vitrine"
                      : "Subtítulo discreto do botão"
                  }
                  type="text"
                  value={fluxoAtual.subtituloBotaoHome ?? ""}
                  disabled={!podeAlterar}
                  onChange={(e) =>
                    atualizarFluxoSelecionado((atual) => ({
                      ...atual,
                      subtituloBotaoHome: e.target.value,
                    }))
                  }
                  placeholder={
                    fluxoAtual.tipoAcao === "secao_equipe"
                      ? "Ex.: Encontre quem pode ajudar você"
                      : "Ex.: Primeira parcela para 150 dias e aprovação rápida"
                  }
                  className="mt-1 w-full rounded-lg border border-marfim-200 bg-white px-2.5 py-1.5 text-xs text-mineral-950 placeholder:text-mineral-400 focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </div>

            {fluxoAtual.tipoAcao === "secao_produtos" || fluxoAtual.tipoAcao === "secao_servicos" ? (
              <>
                <div className="rounded-xl border border-marfim-200 bg-white p-3.5 space-y-2">
                  <label className="block text-[11px] font-semibold text-mineral-700 uppercase tracking-wider">
                    Modo de Exibição na Vitrine
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "carrossel", rotulo: "Carrossel Swipe", desc: "Deslize horizontal moderno com evidência" },
                      { id: "grade_2_colunas", rotulo: "2 por Linha (Grid)", desc: "Grade de 2 colunas direto na Home" },
                      { id: "modal_gaveta", rotulo: "Gaveta / Modal", desc: "Botão na Home abrindo painel completo" },
                    ].map((opcao) => {
                      const selecionado = (fluxoAtual.modoExibicaoColecao ?? "modal_gaveta") === opcao.id;
                      return (
                        <button
                          key={opcao.id}
                          type="button"
                          disabled={!podeAlterar}
                          onClick={() =>
                            atualizarFluxoSelecionado((atual) => ({
                              ...atual,
                              modoExibicaoColecao: opcao.id as "modal_gaveta" | "carrossel" | "grade_2_colunas",
                            }))
                          }
                          className={combinarClasses(
                            "flex flex-col text-left p-2.5 rounded-lg border transition text-xs cursor-pointer",
                            selecionado
                              ? "border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium ring-1 ring-indigo-500"
                              : "border-marfim-200 hover:bg-marfim-50 text-mineral-700",
                          )}
                        >
                          <span className="font-semibold text-mineral-900">{opcao.rotulo}</span>
                          <span className="text-[10px] text-mineral-500 mt-0.5">{opcao.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-marfim-200 bg-white p-3.5 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-mineral-700 uppercase tracking-wider">
                      Ação Principal nos Detalhes do Item (CTA)
                    </label>
                    <p className="text-[11px] text-mineral-500 mt-0.5">
                      Define o que acontece quando o visitante toca no botão de ação dentro dos detalhes de um item.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: "whatsapp", rotulo: "WhatsApp Direto", desc: "Abre conversa já com o nome do item" },
                      { id: "microfluxo", rotulo: "Iniciar Outra Experiência", desc: "Abre percurso (simulação, agendamento, etc.)" },
                    ].map((opcao) => {
                      const tipoCtaAtual = fluxoAtual.configuracaoCtaAcervo?.tipoAcao ?? "whatsapp";
                      const selecionado = tipoCtaAtual === opcao.id;
                      return (
                        <button
                          key={opcao.id}
                          type="button"
                          disabled={!podeAlterar}
                          onClick={() =>
                            atualizarFluxoSelecionado((atual) => ({
                              ...atual,
                              configuracaoCtaAcervo: {
                                ...(atual.configuracaoCtaAcervo ?? { tipoAcao: "whatsapp" }),
                                tipoAcao: opcao.id as "whatsapp" | "microfluxo",
                              },
                            }))
                          }
                          className={combinarClasses(
                            "flex flex-col text-left p-2.5 rounded-lg border transition text-xs cursor-pointer",
                            selecionado
                              ? "border-emerald-600 bg-emerald-50/50 text-emerald-950 font-medium ring-1 ring-emerald-500"
                              : "border-marfim-200 hover:bg-marfim-50 text-mineral-700",
                          )}
                        >
                          <span className="font-semibold text-mineral-900">{opcao.rotulo}</span>
                          <span className="text-[10px] text-mineral-500 mt-0.5">{opcao.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {fluxoAtual.configuracaoCtaAcervo?.tipoAcao === "microfluxo" ? (
                    <div>
                      <label
                        htmlFor="seletor-experiencia-cta"
                        className="block text-[11px] font-semibold text-mineral-700 uppercase tracking-wider"
                      >
                        Experiência Vinculada
                      </label>
                      <select
                        id="seletor-experiencia-cta"
                        disabled={!podeAlterar}
                        value={fluxoAtual.configuracaoCtaAcervo?.microfluxoId ?? ""}
                        onChange={(e) =>
                          atualizarFluxoSelecionado((atual) => ({
                            ...atual,
                            configuracaoCtaAcervo: {
                              tipoAcao: "microfluxo",
                              rotuloBotao: atual.configuracaoCtaAcervo?.rotuloBotao,
                              microfluxoId: e.target.value,
                            },
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-marfim-200 bg-white px-2.5 py-1.5 text-xs text-mineral-950 focus:border-indigo-400 focus:outline-none"
                      >
                        <option value="">Selecione a experiência a ser iniciada...</option>
                        {microfluxos
                          .filter((m) => m.id !== fluxoAtual.id && m.tipoAcao === "microfluxo")
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.titulo}
                            </option>
                          ))}
                      </select>
                    </div>
                  ) : null}

                  <div>
                    <label
                      htmlFor="rotulo-personalizado-cta"
                      className="block text-[11px] font-semibold text-mineral-700 uppercase tracking-wider"
                    >
                      Texto do Botão (Opcional)
                    </label>
                    <input
                      id="rotulo-personalizado-cta"
                      type="text"
                      disabled={!podeAlterar}
                      maxLength={50}
                      value={fluxoAtual.configuracaoCtaAcervo?.rotuloBotao ?? ""}
                      placeholder={
                        fluxoAtual.configuracaoCtaAcervo?.tipoAcao === "microfluxo"
                          ? "Ex.: Simular financiamento deste item"
                          : "Ex.: Tenho interesse neste item"
                      }
                      onChange={(e) =>
                        atualizarFluxoSelecionado((atual) => ({
                          ...atual,
                          configuracaoCtaAcervo: {
                            tipoAcao: atual.configuracaoCtaAcervo?.tipoAcao ?? "whatsapp",
                            microfluxoId: atual.configuracaoCtaAcervo?.microfluxoId,
                            rotuloBotao: e.target.value,
                          },
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-marfim-200 bg-white px-2.5 py-1.5 text-xs text-mineral-950 placeholder:text-mineral-400 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            ) : null}
            {fluxoAtual.tipoAcao?.startsWith("secao_") ? (
              <CampoFormulario
                rotulo="Título da seção (opcional)"
                textoAuxiliar="Exibido no modal e no painel do celular. Em branco, usamos o título padrão."
                maxLength={100}
                value={fluxoAtual.tituloSecao ?? ""}
                disabled={!podeAlterar}
                placeholder={
                  fluxoAtual.tipoAcao === "secao_produtos"
                    ? "Ex.: Nossos produtos"
                    : fluxoAtual.tipoAcao === "secao_portfolio"
                      ? "Ex.: Nossos projetos"
                      : fluxoAtual.tipoAcao === "secao_servicos"
                        ? "Ex.: Como podemos ajudar"
                        : "Ex.: Conheça os especialistas"
                }
                onChange={(evento) =>
                  atualizarFluxoSelecionado((atual) => ({
                    ...atual,
                    tituloSecao: evento.target.value,
                  }))
                }
              />
            ) : null}

            {fluxoAtual.tipoAcao === "secao_equipe" ? (
              <ConfiguracaoEquipeVitrine
                valor={fluxoAtual.posicionamentoEquipe}
                limiteAvatares={fluxoAtual.limiteAvataresEquipe}
                aoAlterarLimiteAvatares={(limiteAvataresEquipe) =>
                  atualizarFluxoSelecionado((atual) => ({ ...atual, limiteAvataresEquipe }))
                }
                disabled={!podeAlterar}
                quantidadeProfissionais={quantidadeProfissionaisAtivos}
                aoAlterar={(posicionamentoEquipe) =>
                  atualizarFluxoSelecionado((atual) => ({ ...atual, posicionamentoEquipe }))
                }
              />
            ) : null}

            {/* Campos específicos por Tipo de Ação */}
            {fluxoAtual.tipoAcao === "link_externo" ? (
              <div className="pt-2">
                <label
                  htmlFor="url-destino-externo"
                  className="block text-[11px] font-semibold text-mineral-700 uppercase tracking-wider"
                >
                  URL de Destino Externo
                </label>
                <div className="relative mt-1">
                  <Globe className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-mineral-400" />
                  <input
                    id="url-destino-externo"
                    type="url"
                    value={fluxoAtual.urlDestinoOpcional ?? ""}
                    disabled={!podeAlterar}
                    onChange={(e) =>
                      atualizarFluxoSelecionado((atual) => ({
                        ...atual,
                        urlDestinoOpcional: e.target.value,
                      }))
                    }
                    placeholder="https://exemplo.com.br/estoque"
                    className="w-full rounded-lg border border-marfim-200 bg-white pl-8 pr-2.5 py-1.5 text-xs text-mineral-950 placeholder:text-mineral-400 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-mineral-500">
                  O visitante será direcionado para este link ao clicar no botão na vitrine da Home.
                </p>
              </div>
            ) : fluxoAtual.tipoAcao === "whatsapp" ? (
              <div className="pt-2">
                <label
                  htmlFor="url-destino-whatsapp"
                  className="block text-[11px] font-semibold text-mineral-700 uppercase tracking-wider"
                >
                  Número ou Link do WhatsApp
                </label>
                <div className="relative mt-1">
                  <MessageCircle className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-mineral-400" />
                  <input
                    id="url-destino-whatsapp"
                    type="text"
                    value={fluxoAtual.urlDestinoOpcional ?? ""}
                    disabled={!podeAlterar}
                    onChange={(e) =>
                      atualizarFluxoSelecionado((atual) => ({
                        ...atual,
                        urlDestinoOpcional: e.target.value,
                      }))
                    }
                    placeholder="5522981038549 ou https://wa.me/5522981038549"
                    className="w-full rounded-lg border border-marfim-200 bg-white pl-8 pr-2.5 py-1.5 text-xs text-mineral-950 placeholder:text-mineral-400 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-mineral-500">
                  Abre o aplicativo ou WhatsApp Web diretamente ao clicar na vitrine.
                </p>
              </div>
            ) : fluxoAtual.tipoAcao === "telefone" ? (
              <div className="pt-2">
                <label
                  htmlFor="url-destino-telefone"
                  className="block text-[11px] font-semibold text-mineral-700 uppercase tracking-wider"
                >
                  Telefone para Discagem Direta
                </label>
                <div className="relative mt-1">
                  <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-mineral-400" />
                  <input
                    id="url-destino-telefone"
                    type="tel"
                    value={fluxoAtual.urlDestinoOpcional ?? ""}
                    disabled={!podeAlterar}
                    onChange={(e) =>
                      atualizarFluxoSelecionado((atual) => ({
                        ...atual,
                        urlDestinoOpcional: e.target.value,
                      }))
                    }
                    placeholder="(22) 2645-8888 ou 2226458888"
                    className="w-full rounded-lg border border-marfim-200 bg-white pl-8 pr-2.5 py-1.5 text-xs text-mineral-950 placeholder:text-mineral-400 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-mineral-500">
                  Inicia uma chamada telefônica direta ao tocar no botão.
                </p>
              </div>
            ) : fluxoAtual.tipoAcao === "secao_equipe" ? (
              <Link
                href="/painel/equipe"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-xs font-semibold text-indigo-700 hover:text-indigo-900"
              >
                Gerenciar equipe
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            ) : null}
          </div>

          {!grafoIntegro ? (
            <details className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <summary className="cursor-pointer font-medium">
                Conexões pendentes para publicar
              </summary>
              <p className="mt-2">
                Você pode salvar o rascunho e continuar a montagem depois. Conecte o Início à
                primeira etapa e defina os caminhos.
              </p>
              <ul className="mt-2 space-y-1.5">
                {inconsistenciasGrafo.map((prob, idx) => (
                  <li key={`${prob.codigo}-${idx}`}>{prob.mensagem}</li>
                ))}
              </ul>
            </details>
          ) : null}

          {!fluxoAtual.tipoAcao ||
          fluxoAtual.tipoAcao === "microfluxo" ||
          fluxoAtual.tipoAcao === "secao_servicos" ||
          fluxoAtual.tipoAcao === "secao_portfolio" ? (
            <>
              <CanvasEditorVisualFluxos
                key={fluxoAtual.id}
                fluxo={fluxoAtual}
                aoSalvarFluxo={(atualizado) => atualizarFluxoSelecionado(() => atualizado)}
                podeEditar={podeAlterar}
                fluxos={microfluxos}
                profissionais={profissionais}
                identificadorPublico={identificadorPublico}
                permiteFinanceiro={politicaPublicidade.permiteCalculoComercial()}
              />

              {/* Configurações Adicionais e Atalhos de Apoio */}
              <details className="rounded-2xl border border-marfim-200 bg-white p-5 text-xs text-mineral-700 shadow-xs">
                <summary className="cursor-pointer font-semibold text-mineral-900">
                  Configurações Adicionais (Instrução Pix e Cálculo Comercial)
                </summary>

                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  {/* Atalho de Pix Manual */}
                  <div className="space-y-3 rounded-lg border border-marfim-200 bg-marfim-50/50 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-mineral-900">
                        Instrução de Pix Manual
                      </span>
                      <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-mineral-800">
                        <input
                          type="checkbox"
                          aria-label="Incluir instrução de Pix manual"
                          checked={Boolean(etapaPixExistente)}
                          disabled={!podeAlterar || !politicaPublicidade.permiteEtapaPixManual()}
                          onChange={(e) => {
                            const habilitar = e.target.checked;
                            atualizarFluxoSelecionado((atual) => ({
                              ...atual,
                              etapas: sincronizarEtapaPixManualNoGrafo(atual.etapas, habilitar, {
                                chavePix:
                                  etapaPixExistente?.configuracaoPixManual?.chavePix ??
                                  "contato@estabelecimento.com.br",
                                nomeRecebedor:
                                  etapaPixExistente?.configuracaoPixManual?.nomeRecebedor ??
                                  identificadorPublico,
                                valorReferenciaTexto:
                                  etapaPixExistente?.configuracaoPixManual?.valorReferenciaTexto ??
                                  "",
                                instrucaoComprovante:
                                  etapaPixExistente?.configuracaoPixManual?.instrucaoComprovante ??
                                  "Envie o comprovante pelo WhatsApp após finalizar sua solicitação.",
                              }),
                            }));
                          }}
                          className="h-3.5 w-3.5 rounded border-marfim-300 text-mineral-900"
                        />
                        <span>Habilitar Pix Direto</span>
                      </label>
                    </div>

                    {!politicaPublicidade.permiteEtapaPixManual() ? (
                      <AvisoRecursoRestrito mensagem="instruções de Pix não podem ser publicadas. Remova a etapa de Pix para publicar." />
                    ) : null}

                    {etapaPixExistente?.configuracaoPixManual ? (
                      <div className="space-y-2">
                        <CampoFormulario
                          id="pix-manual-chave"
                          rotulo="Chave Pix (CNPJ, e-mail, celular ou aleatória)"
                          value={etapaPixExistente.configuracaoPixManual.chavePix}
                          disabled={!podeAlterar}
                          onChange={(e) =>
                            atualizarEtapaFluxo(etapaPixExistente.id, (atual) => ({
                              ...atual,
                              configuracaoPixManual: {
                                ...atual.configuracaoPixManual!,
                                chavePix: e.target.value,
                              },
                            }))
                          }
                        />

                        <CampoFormulario
                          id="pix-manual-recebedor"
                          rotulo="Nome do favorecido"
                          value={etapaPixExistente.configuracaoPixManual.nomeRecebedor}
                          disabled={!podeAlterar}
                          onChange={(e) =>
                            atualizarEtapaFluxo(etapaPixExistente.id, (atual) => ({
                              ...atual,
                              configuracaoPixManual: {
                                ...atual.configuracaoPixManual!,
                                nomeRecebedor: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    ) : (
                      <p className="text-[11px] text-mineral-600">
                        Você também pode adicionar uma caixa de Pix diretamente pelo Editor Visual
                        acima.
                      </p>
                    )}
                  </div>
                </div>
              </details>
            </>
          ) : null}
        </fieldset>
      ) : (
        <div className="rounded-2xl border border-dashed border-marfim-200 bg-white px-6 py-12 text-center">
          <h2 className="text-base font-semibold text-mineral-950">
            Nenhuma experiência no rascunho
          </h2>
          <p className="mt-2 text-sm text-mineral-600">
            Use “Nova experiência” para adicionar uma opção à sua página.
          </p>
        </div>
      )}
      <Dialogo.Root
        open={fluxoParaExcluir !== undefined}
        onOpenChange={(aberto) => {
          if (!aberto) setIdFluxoExcluir(null);
        }}
      >
        <Dialogo.Portal>
          <Dialogo.Overlay className="fixed inset-0 z-50 bg-mineral-950/30 backdrop-blur-sm" />
          <Dialogo.Content
            role="alertdialog"
            onOpenAutoFocus={(evento) => {
              evento.preventDefault();
              botaoCancelarExclusao.current?.focus();
            }}
            onCloseAutoFocus={(evento) => {
              evento.preventDefault();
              const destino =
                document.getElementById(`aba-experiencia-${fluxoSelecionadoId}`) ??
                botaoNovaExperiencia.current;
              destino?.focus();
            }}
            className="fixed top-1/2 left-1/2 z-50 w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-marfim-200 bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <Dialogo.Close
                aria-label="Fechar confirmação"
                className="rounded-lg p-1.5 text-mineral-500 hover:bg-marfim-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Dialogo.Close>
            </div>
            <Dialogo.Title className="text-lg font-semibold tracking-tight text-mineral-950">
              Excluir experiência?
            </Dialogo.Title>
            <Dialogo.Description className="mt-2 break-words text-sm leading-relaxed text-mineral-600">
              A experiência “{fluxoParaExcluir?.titulo}” será removida desta edição. Salvar o
              rascunho mantém a exclusão no painel. Para removê-la da página pública, clique em
              “Publicar página”.
            </Dialogo.Description>
            <p className="mt-3 text-xs leading-relaxed text-mineral-500">
              Se recarregar a página sem salvar ou publicar, a experiência continuará no rascunho.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-marfim-100 pt-4">
              <Dialogo.Close asChild>
                <Botao
                  ref={botaoCancelarExclusao}
                  variante="operacional_secundario"
                  tamanho="compacto"
                  className="rounded-lg border-marfim-200 bg-white hover:bg-marfim-50"
                >
                  Cancelar
                </Botao>
              </Dialogo.Close>
              <Botao
                tamanho="compacto"
                className="rounded-lg bg-red-600 text-white hover:bg-red-700"
                disabled={!podeAlterar}
                onClick={confirmarExclusaoFluxo}
              >
                Excluir experiência
              </Botao>
            </div>
          </Dialogo.Content>
        </Dialogo.Portal>
      </Dialogo.Root>
    </div>
  );
}
