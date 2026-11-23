"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type FinalConnectionState,
  type OnConnectEnd,
  type ReactFlowProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CheckCircle2, Plus, Trash2, X } from "lucide-react";
import type {
  CampoUniversalFormulario,
  DefinicaoMicrofluxo,
  EtapaMicrofluxo,
  TipoEtapaMicrofluxo,
  TipoPrimitivoCampo,
} from "@/dominio/microfluxos/tiposMicrofluxo";
import {
  converterEtapaParaLivre,
  criarEtapaDadosRetorno,
  obterOpcoesDeSaida,
} from "@/dominio/microfluxos/composicaoEtapaLivre";
import { EditorComposicaoEtapa } from "./EditorComposicaoEtapa";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { ComponenteNoEtapaFluxo, type TipoNoFluxo } from "./ComponenteNoEtapaFluxo";
import { ConectorFluxoInterativo } from "./ConectorFluxoInterativo";

import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import { EditorConclusaoMicrofluxo } from "./EditorConclusaoMicrofluxo";
import {
  ComponenteNoConclusaoFluxo,
  type TipoNoConclusaoFluxo,
} from "./ComponenteNoConclusaoFluxo";

import { ComponenteNoInicioFluxo, type TipoNoInicioFluxo } from "./ComponenteNoInicioFluxo";
import {
  conectarNoEditor,
  desconectarArestaEditor,
  descreverTipoCardEtapa,
  listarSaidasOpcoesEditor,
  projetarArestasEditor,
  type ArestaEditorFluxo,
} from "./estruturaEditorFluxo";

type TipoNoEditorFluxo = TipoNoFluxo | TipoNoConclusaoFluxo | TipoNoInicioFluxo;

const nodeTypes = {
  inicioFluxo: ComponenteNoInicioFluxo,
  conclusaoFluxo: ComponenteNoConclusaoFluxo,
  etapaFluxo: ComponenteNoEtapaFluxo,
};

const edgeTypes = {
  conectorFluxo: ConectorFluxoInterativo,
};

export interface PropriedadesCanvasEditorVisualFluxos {
  readonly fluxo: DefinicaoMicrofluxo;
  readonly aoSalvarFluxo: (fluxoAtualizado: DefinicaoMicrofluxo) => void;
  readonly podeEditar: boolean;
  readonly fluxos: readonly DefinicaoMicrofluxo[];
  readonly profissionais: readonly ProfissionalEquipe[];
  readonly identificadorPublico: string;
  readonly permiteFinanceiro: boolean;
}

function gerarIdEtapa(tipo: TipoEtapaMicrofluxo): string {
  return `etapa-${tipo.replace(/_/g, "-")}-${crypto.randomUUID()}`;
}

export function CanvasEditorVisualFluxos({
  fluxo,
  aoSalvarFluxo,
  podeEditar,
  fluxos,
  profissionais,
  identificadorPublico,
  permiteFinanceiro,
}: PropriedadesCanvasEditorVisualFluxos) {
  const [etapaSelecionadaId, setEtapaSelecionadaId] = useState<string | null>(
    fluxo.etapaInicialId || null,
  );

  // A finalização é uma projeção visual do estado terminal existente, sem novo nó persistido.
  const idConclusao = useMemo(() => {
    let id = "@conclusao";
    while (fluxo.etapas.some((etapa) => etapa.id === id)) id += "_";
    return id;
  }, [fluxo.etapas]);
  const conclusaoSelecionada = etapaSelecionadaId === idConclusao;
  const idInicio = useMemo(() => {
    let id = "@inicio";
    while (fluxo.etapas.some((etapa) => etapa.id === id)) id += "_";
    return id;
  }, [fluxo.etapas]);
  const exibirConclusao = Boolean(
    fluxo.conclusao ||
    conclusaoSelecionada ||
    (fluxo.etapas.length && fluxo.etapaInicialId) ||
    fluxo.etapas.some(
      (e) => e.finalizacaoExplicita || listarSaidasOpcoesEditor(e).some((s) => s.encerrar),
    ),
  );

  const posicoesEtapas = useMemo(() => {
    const niveis = new Map<string, number>();
    const pendencias = new Map(fluxo.etapas.map((etapa) => [etapa.id, 0]));
    const destinos = new Map(
      fluxo.etapas.map((etapa) => [
        etapa.id,
        [
          ...new Set([
            ...(etapa.proximaEtapaPadraoId ? [etapa.proximaEtapaPadraoId] : []),
            ...obterOpcoesDeSaida(etapa).flatMap((opcao) =>
              !opcao.encerrarPercurso && opcao.proximaEtapaIdOpcional
                ? [opcao.proximaEtapaIdOpcional]
                : [],
            ),
          ]),
        ].filter((id) => pendencias.has(id)),
      ]),
    );
    for (const saidas of destinos.values())
      for (const id of saidas) pendencias.set(id, pendencias.get(id)! + 1);
    const fila = fluxo.etapas
      .filter((etapa) => pendencias.get(etapa.id) === 0)
      .map((etapa) => etapa.id);
    for (const id of fila) niveis.set(id, 0);
    for (let indice = 0; indice < fila.length; indice++) {
      const id = fila[indice]!;
      for (const destino of destinos.get(id) ?? []) {
        niveis.set(destino, Math.max(niveis.get(destino) ?? 0, niveis.get(id)! + 1));
        pendencias.set(destino, pendencias.get(destino)! - 1);
        if (pendencias.get(destino) === 0) fila.push(destino);
      }
    }
    const grupos = new Map<number, string[]>();
    fluxo.etapas.forEach((etapa, indice) => {
      const nivel = niveis.get(etapa.id) ?? indice;
      grupos.set(nivel, [...(grupos.get(nivel) ?? []), etapa.id]);
    });
    const posicoes = new Map<string, { x: number; y: number }>();
    let y = 190;
    for (const [, ids] of [...grupos.entries()].sort(([a], [b]) => a - b)) {
      ids.forEach((id, indice) => {
        const etapa = fluxo.etapas.find((e) => e.id === id);
        if (etapa?.posicaoCanvas) {
          posicoes.set(id, { x: etapa.posicaoCanvas.x, y: etapa.posicaoCanvas.y });
        } else {
          posicoes.set(id, { x: 180 + (indice - (ids.length - 1) / 2) * 360, y });
        }
      });
      y +=
        Math.max(
          210,
          ...ids.map(
            (id) =>
              280 + listarSaidasOpcoesEditor(fluxo.etapas.find((e) => e.id === id)!).length * 40,
          ),
        ) + 60;
    }
    return posicoes;
  }, [fluxo.etapas]);

  // Converter etapas para nós (Nodes) do React Flow
  const nosIniciais: TipoNoEditorFluxo[] = useMemo(() => {
    const etapas: TipoNoFluxo[] = fluxo.etapas.map((etapa, index) => {
      const saidas = listarSaidasOpcoesEditor(etapa);
      const temOpcaoDesconectada = saidas.some((s) => !s.conectada);
      const temSaidaPadraoDesconectada = Boolean(etapa.saidaPadraoDesconectada);
      const possuiPendencia = temOpcaoDesconectada || temSaidaPadraoDesconectada;

      return {
        id: etapa.id,
        type: "etapaFluxo",
        position: posicoesEtapas.get(etapa.id)!,
        data: {
          id: etapa.id,
          indice: index + 1,
          tipoEtapa: etapa.tipoEtapa,
          rotuloTipo: descreverTipoCardEtapa(etapa).tipo,
          rotuloModelo: descreverTipoCardEtapa(etapa).modelo,
          saidas,
          titulo: etapa.titulo,
          subtituloOpcional: etapa.subtituloOpcional,
          ehInicial: etapa.id === fluxo.etapaInicialId,
          selecionado: etapa.id === etapaSelecionadaId,
          quantidadeOpcoes: etapa.opcoes?.length ?? 0,
          quantidadeCampos:
            etapa.tipoEtapa === "etapa_livre"
              ? (etapa.blocos?.length ?? 0)
              : (etapa.campos?.length ?? 0),
          possuiPendencia,
        },
      };
    });
    return [
      {
        id: idInicio,
        type: "inicioFluxo",
        position: { x: 212, y: 20 },
        data: {},
        deletable: false,
      },
      ...etapas,
      ...(exibirConclusao
        ? [
          {
            id: idConclusao,
            type: "conclusaoFluxo" as const,
            position: {
              x: 180,
              y:
                Math.max(
                  0,
                  ...fluxo.etapas.map(
                    (etapa) =>
                      (posicoesEtapas.get(etapa.id)?.y ?? 0) +
                      280 +
                      listarSaidasOpcoesEditor(etapa).length * 40,
                  ),
                ) + 80,
            },
            deletable: false,
            data: {
              titulo: fluxo.mensagemConfirmacaoTitulo || "Conclusão da experiência",
              descricao: fluxo.conclusao
                ? `${fluxo.conclusao.acoes.length} ${fluxo.conclusao.acoes.length === 1 ? "ação" : "ações"} de continuação`
                : "Configurar mensagem, resumo e ações",
              selecionado: conclusaoSelecionada,
            },
          },
        ]
        : []),
    ];
  }, [
    fluxo.etapas,
    fluxo.etapaInicialId,
    fluxo.mensagemConfirmacaoTitulo,
    fluxo.conclusao,
    etapaSelecionadaId,
    idConclusao,
    conclusaoSelecionada,
    posicoesEtapas,
    idInicio,
    exibirConclusao,
  ]);

  const removerConector = useCallback(
    (aresta: ArestaEditorFluxo) => {
      if (!podeEditar) return;
      aoSalvarFluxo(desconectarArestaEditor(fluxo, aresta, idInicio));
    },
    [aoSalvarFluxo, fluxo, podeEditar, idInicio],
  );

  const arestasIniciais: Edge[] = useMemo(
    () =>
      projetarArestasEditor(fluxo, idInicio, idConclusao, exibirConclusao).map((aresta) => ({
        ...aresta,
        type: "conectorFluxo",
        reconnectable: "target" as const,
        deletable: true,
        animated: !aresta.inferida,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: aresta.target === idConclusao ? "#047857" : aresta.opcaoId ? "#a68c62" : "#0f1110",
        },
        style: {
          stroke:
            aresta.target === idConclusao ? "#047857" : aresta.opcaoId ? "#a68c62" : "#0f1110",
          strokeWidth: 2,
          strokeDasharray: aresta.inferida ? "4 4" : undefined,
        },
        data: {
          opcaoId: aresta.opcaoId,
          blocoId: aresta.blocoId,
          ehCondicional: Boolean(aresta.opcaoId),
          onExcluirConector: podeEditar ? () => removerConector(aresta) : undefined,
        },
      })),
    [fluxo, idInicio, idConclusao, exibirConclusao, podeEditar, removerConector],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(nosIniciais);
  const [edges, setEdges, onEdgesChange] = useEdgesState(arestasIniciais);
  const [instanciaCanvas, setInstanciaCanvas] =
    useState<ReactFlowInstance<TipoNoEditorFluxo> | null>(null);
  const areaCanvasRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!instanciaCanvas) return;
    const frame = requestAnimationFrame(() => {
      void instanciaCanvas.fitView({ padding: 0.3, duration: 180, maxZoom: 1 });
    });
    return () => cancelAnimationFrame(frame);
  }, [nodes.length, instanciaCanvas]);

  useEffect(() => {
    setNodes(nosIniciais);
  }, [nosIniciais, setNodes]);

  useEffect(() => {
    setEdges(arestasIniciais);
  }, [arestasIniciais, setEdges]);

  const onNodeDragStop: NonNullable<ReactFlowProps<TipoNoEditorFluxo>["onNodeDragStop"]> = useCallback(
    (_event, node) => {
      if (!podeEditar || node.id === idInicio || node.id === idConclusao) return;
      const etapaAlvo = fluxo.etapas.find((e) => e.id === node.id);
      if (!etapaAlvo) return;

      const etapasAtualizadas = fluxo.etapas.map((etapa) =>
        etapa.id === node.id
          ? {
              ...etapa,
              posicaoCanvas: {
                x: Math.round(node.position.x),
                y: Math.round(node.position.y),
              },
            }
          : etapa,
      );

      aoSalvarFluxo({
        ...fluxo,
        etapas: etapasAtualizadas,
      });
    },
    [aoSalvarFluxo, fluxo, idInicio, idConclusao, podeEditar],
  );

  const onConnect = useCallback(
    (conexao: Connection) => {
      if (!podeEditar) return;
      const atualizado = conectarNoEditor(fluxo, conexao, idInicio, idConclusao);
      if (atualizado) aoSalvarFluxo(atualizado);
    },
    [aoSalvarFluxo, fluxo, podeEditar, idInicio, idConclusao],
  );

  const onReconnect = useCallback(
    (anterior: Edge, nova: Connection) => {
      if (!podeEditar) return;
      const semAnterior = desconectarArestaEditor(fluxo, anterior, idInicio);
      const atualizado = conectarNoEditor(semAnterior, nova, idInicio, idConclusao);
      if (atualizado) aoSalvarFluxo(atualizado);
    },
    [aoSalvarFluxo, fluxo, podeEditar, idInicio, idConclusao],
  );

  // O React Flow conecta diretamente nos handles. Ao soltar no restante do
  // card, preservamos a saída arrastada e usamos a entrada daquele card.
  const conexaoAoSoltarNoCard = useCallback(
    (evento: MouseEvent | TouchEvent, estado: FinalConnectionState): Connection | null => {
      if (estado.isValid || estado.fromHandle?.type !== "source" || !estado.fromNode) {
        return null;
      }
      const ponto = "changedTouches" in evento ? evento.changedTouches[0] : evento;
      if (!ponto) return null;
      const elemento = document.elementFromPoint(ponto.clientX, ponto.clientY);
      const no = elemento?.closest(".react-flow__node");
      const destino = no?.getAttribute("data-id");
      if (!no || !destino || !areaCanvasRef.current?.contains(no)) return null;
      return {
        source: estado.fromNode.id,
        sourceHandle: estado.fromHandle.id ?? null,
        target: destino,
        targetHandle: null,
      };
    },
    [],
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (evento, estado) => {
      const conexao = conexaoAoSoltarNoCard(evento, estado);
      if (conexao) onConnect(conexao);
    },
    [conexaoAoSoltarNoCard, onConnect],
  );

  const onReconnectEnd: NonNullable<ReactFlowProps["onReconnectEnd"]> = useCallback(
    (evento, anterior, ponta, estado) => {
      if (ponta !== "target") return;
      const conexao = conexaoAoSoltarNoCard(evento, estado);
      if (conexao) onReconnect(anterior, conexao);
    },
    [conexaoAoSoltarNoCard, onReconnect],
  );

  const onEdgesDelete = useCallback(
    (removidas: Edge[]) => {
      if (!podeEditar || !removidas.length) return;
      aoSalvarFluxo(
        removidas.reduce(
          (atual, aresta) => desconectarArestaEditor(atual, aresta, idInicio),
          fluxo,
        ),
      );
    },
    [aoSalvarFluxo, fluxo, podeEditar, idInicio],
  );

  const etapaSelecionada = useMemo(() => {
    const etapa = fluxo.etapas.find((e) => e.id === etapaSelecionadaId);
    return etapa ? converterEtapaParaLivre(etapa) : null;
  }, [fluxo.etapas, etapaSelecionadaId]);

  function adicionarNovaEtapa(tipo: TipoEtapaMicrofluxo) {
    if (!podeEditar) return;

    const novoId = gerarIdEtapa(tipo);

    const novaEtapa: EtapaMicrofluxo = {
      id: novoId,
      tipoEtapa: tipo,
      saidaPadraoDesconectada: true,
      titulo:
        tipo === "etapa_livre"
          ? "Nova etapa"
          : tipo === "formulario_dinamico"
            ? "Preencha as informações"
            : tipo === "selecao_catalogo"
              ? "Selecione o item desejado"
              : tipo === "selecao_profissional"
                ? "Com qual de nossos especialistas você deseja falar?"
                : tipo === "coleta_contato"
                  ? "Onde podemos entrar em contato?"
                  : "Qual é o seu objetivo?",
      subtituloOpcional:
        tipo === "formulario_dinamico"
          ? "Informe os dados para darmos continuidade ao atendimento."
          : tipo === "selecao_profissional"
            ? "Escolha um consultor para atendimento personalizado."
            : "Escolha uma das opções abaixo para prosseguir.",
      obrigatoria: true,
      ...(tipo === "formulario_dinamico"
        ? {
          campos: [
            {
              id: `campo-1`,
              rotulo: "Informação principal",
              tipo: "texto_curto" as TipoPrimitivoCampo,
              obrigatorio: true,
              placeholder: "Digite aqui...",
            },
          ],
        }
        : {}),
      ...(tipo === "selecao_unica" || tipo === "selecao_multipla"
        ? {
          opcoes: [
            { id: "opt-1", rotulo: "Opção A" },
            { id: "opt-2", rotulo: "Opção B" },
          ],
        }
        : {}),
      ...(tipo === "selecao_catalogo" ? { fonteCatalogo: "produtos" } : {}),
    };

    const novoFluxo: DefinicaoMicrofluxo = {
      ...fluxo,
      etapas: [
        ...fluxo.etapas,
        tipo === "coleta_contato"
          ? { ...criarEtapaDadosRetorno(novoId), saidaPadraoDesconectada: true }
          : converterEtapaParaLivre(novaEtapa),
      ],
    };

    aoSalvarFluxo(novoFluxo);
    setEtapaSelecionadaId(novoId);
  }

  function removerEtapa(idRemover: string) {
    if (!podeEditar) return;
    const etapas = fluxo.etapas
      .filter((e) => e.id !== idRemover)
      .map((etapa) => ({
        ...etapa,
        saidaPadraoDesconectada:
          etapa.proximaEtapaPadraoId === idRemover ? true : etapa.saidaPadraoDesconectada,
        proximaEtapaPadraoId:
          etapa.proximaEtapaPadraoId === idRemover ? undefined : etapa.proximaEtapaPadraoId,
        opcoes: etapa.opcoes?.map((o) =>
          o.proximaEtapaIdOpcional === idRemover
            ? { ...o, proximaEtapaIdOpcional: undefined, desconectada: true }
            : o,
        ),
        blocos: etapa.blocos?.map((b) =>
          b.tipo === "escolha"
            ? {
              ...b,
              opcoes: b.opcoes.map((o) =>
                o.proximaEtapaIdOpcional === idRemover
                  ? { ...o, proximaEtapaIdOpcional: undefined, desconectada: true }
                  : o,
              ),
            }
            : b,
        ),
      }));
    aoSalvarFluxo({
      ...fluxo,
      etapas,
      etapaInicialId: fluxo.etapaInicialId === idRemover ? "" : fluxo.etapaInicialId,
      ...(fluxo.conclusao
        ? {
          conclusao: {
            ...fluxo.conclusao,
            resumo: {
              ...fluxo.conclusao.resumo,
              campos: fluxo.conclusao.resumo.campos.filter((c) => c.etapaId !== idRemover),
            },
            camposWhatsapp: fluxo.conclusao.camposWhatsapp.filter((c) => c.etapaId !== idRemover),
          },
        }
        : {}),
    });
    setEtapaSelecionadaId(null);
  }

  function atualizarCampoEtapaSelecionada<K extends keyof EtapaMicrofluxo>(
    campo: K,
    valor: EtapaMicrofluxo[K],
  ) {
    if (!podeEditar || !etapaSelecionada) return;

    const etapasNovas = fluxo.etapas.map((e) => {
      if (e.id === etapaSelecionada.id) {
        return { ...converterEtapaParaLivre(e), [campo]: valor };
      }
      return e;
    });

    aoSalvarFluxo({
      ...fluxo,
      etapas: etapasNovas,
    });
  }

  function adicionarCampoNaEtapaSelecionada() {
    if (!podeEditar || !etapaSelecionada) return;
    const camposAtuais = etapaSelecionada.campos ?? [];
    const novoCampo: CampoUniversalFormulario = {
      id: `campo-${Date.now().toString(36).slice(-4)}`,
      rotulo: `Campo ${camposAtuais.length + 1}`,
      tipo: "texto_curto",
      obrigatorio: true,
      placeholder: "Digite aqui...",
    };
    atualizarCampoEtapaSelecionada("campos", [...camposAtuais, novoCampo]);
  }

  function atualizarCampoDinamico(campoId: string, parcial: Partial<CampoUniversalFormulario>) {
    if (!podeEditar || !etapaSelecionada?.campos) return;
    const novosCampos = etapaSelecionada.campos.map((c) =>
      c.id === campoId ? { ...c, ...parcial } : c,
    );
    atualizarCampoEtapaSelecionada("campos", novosCampos);
  }

  function removerCampoDinamico(campoId: string) {
    if (!podeEditar || !etapaSelecionada?.campos) return;
    const novosCampos = etapaSelecionada.campos.filter((c) => c.id !== campoId);
    atualizarCampoEtapaSelecionada("campos", novosCampos);
  }

  function adicionarOpcaoNaEtapaSelecionada() {
    if (!podeEditar || !etapaSelecionada) return;
    const opcoesAtuais = etapaSelecionada.opcoes ?? [];
    const novaOpcao = {
      id: `opt-${Date.now().toString(36).slice(-4)}`,
      rotulo: `Opção ${String.fromCharCode(65 + opcoesAtuais.length)}`,
    };
    atualizarCampoEtapaSelecionada("opcoes", [...opcoesAtuais, novaOpcao]);
  }

  function removerOpcaoNaEtapaSelecionada(opcaoId: string) {
    if (!podeEditar || !etapaSelecionada?.opcoes || etapaSelecionada.opcoes.length <= 1) return;
    const novasOpcoes = etapaSelecionada.opcoes.filter((o) => o.id !== opcaoId);
    atualizarCampoEtapaSelecionada("opcoes", novasOpcoes);
  }

  return (
    <div className="flex h-[660px] w-full flex-col overflow-hidden rounded-2xl border border-marfim-200 bg-white shadow-xs">
      {/* Barra de Ferramentas Superior Compacta (docked fixa no topo, nunca sobrepõe) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-marfim-200 bg-gradient-to-b from-sky-50/60 to-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold tracking-wider text-mineral-600 uppercase">
            Adicionar:
          </span>

          <button
            type="button"
            onClick={() => adicionarNovaEtapa("etapa_livre")}
            disabled={!podeEditar}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-100 disabled:opacity-50"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            <span>Etapa livre</span>
          </button>
          <details className="relative">
            <summary className="flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded-lg border border-marfim-300 bg-white px-3 text-xs font-semibold transition hover:bg-marfim-50 [&::-webkit-details-marker]:hidden">
              Modelos de etapa
            </summary>
            <div className="absolute left-0 top-full z-30 mt-1 w-52 space-y-1 rounded-md border border-marfim-300 bg-white p-2 shadow-lg">
              {(
                [
                  ["selecao_unica", "Pergunta de escolha"],
                  ["coleta_contato", "Dados para retorno"],
                  ["selecao_catalogo", "Seleção de catálogo"],
                  ["selecao_profissional", "Seleção de equipe"],
                ] as const
              ).map(([tipo, nome]) => (
                <button
                  key={tipo}
                  type="button"
                  disabled={!podeEditar}
                  onClick={(evento) => {
                    adicionarNovaEtapa(tipo);
                    evento.currentTarget.closest("details")?.removeAttribute("open");
                  }}
                  className="block w-full rounded px-2 py-2 text-left text-xs hover:bg-marfim-100"
                >
                  {nome}
                </button>
              ))}
            </div>
          </details>
          <button
            type="button"
            onClick={() => {
              if (!exibirConclusao && !fluxo.conclusao)
                aoSalvarFluxo({
                  ...fluxo,
                  conclusao: {
                    acoes: [],
                    resumo: { ativo: false, campos: [], incluirDemonstrativo: false },
                    camposWhatsapp: [],
                  },
                });
              setEtapaSelecionadaId(idConclusao);
            }}
            aria-pressed={conclusaoSelecionada}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
          >
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            <span>Finalização</span>
          </button>
        </div>

        <span className="hidden text-[11px] text-mineral-500 sm:inline">
          Cada resposta pode ter seu próprio caminho. Arraste a saída até o card de destino.
        </span>
      </div>

      {/* Área Central: Canvas + Painel Lateral */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Canvas Visual do React Flow */}
        <div ref={areaCanvasRef} className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onInit={setInstanciaCanvas}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectEnd={onConnectEnd}
            onReconnect={onReconnect}
            onReconnectEnd={onReconnectEnd}
            onEdgesDelete={onEdgesDelete}
            onNodeDragStop={onNodeDragStop}
            deleteKeyCode={["Backspace", "Delete"]}
            onNodeClick={(_event, node) =>
              setEtapaSelecionadaId(node.id === idInicio ? null : node.id)
            }
            nodesConnectable={podeEditar}
            connectionRadius={32}
            edgesReconnectable={podeEditar}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            className="bg-marfim-50"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#dcd3c2" />
            <Controls className="!border-marfim-300 !bg-white !shadow-sm" />
          </ReactFlow>
        </div>

        {/* Painel Lateral de Configuração da Caixa Selecionada */}
        {conclusaoSelecionada ? (
          <aside
            aria-label="Configurações da finalização"
            className="absolute inset-0 z-20 overflow-y-auto bg-white p-4 shadow-md sm:relative sm:inset-auto sm:w-96 sm:shrink-0 sm:border-l sm:border-marfim-200"
          >
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setEtapaSelecionadaId(null)}
                aria-label="Fechar painel de finalização"
                className="rounded-md p-2 text-mineral-500 hover:bg-marfim-100"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <EditorConclusaoMicrofluxo
              integrado
              fluxo={fluxo}
              fluxos={fluxos}
              profissionais={profissionais}
              identificadorPublico={identificadorPublico}
              podeEditar={podeEditar}
              permiteFinanceiro={permiteFinanceiro}
              aoAlterar={aoSalvarFluxo}
            />
          </aside>
        ) : etapaSelecionada ? (
          <aside className="absolute inset-0 z-20 overflow-y-auto bg-white p-4 shadow-md sm:relative sm:inset-auto sm:w-96 sm:shrink-0 sm:border-l sm:border-marfim-200">
            <div className="flex items-start justify-between border-b border-marfim-200 pb-3">
              <div>
                <span className="inline-block rounded bg-marfim-100 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-mineral-700 uppercase">
                  {descreverTipoCardEtapa(etapaSelecionada).tipo}
                </span>
                <h3 className="mt-1 text-base font-bold tracking-tight text-mineral-950">
                  {etapaSelecionada.titulo || "Propriedades da Caixa"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setEtapaSelecionadaId(null)}
                className="rounded-md p-1 text-mineral-500 hover:bg-marfim-100 hover:text-mineral-900"
                aria-label="Fechar painel de edição"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <CampoFormulario
                rotulo="Título / Pergunta principal"
                value={etapaSelecionada.titulo}
                disabled={!podeEditar}
                onChange={(e) => atualizarCampoEtapaSelecionada("titulo", e.target.value)}
                placeholder="Ex.: Selecione o tipo de atendimento"
              />

              <CampoFormulario
                rotulo="Subtítulo ou instrução de apoio"
                value={etapaSelecionada.subtituloOpcional ?? ""}
                disabled={!podeEditar}
                onChange={(e) =>
                  atualizarCampoEtapaSelecionada("subtituloOpcional", e.target.value)
                }
                placeholder="Ex.: Resposta em até 1 dia útil"
              />

              {etapaSelecionada.tipoEtapa === "etapa_livre" ? (
                <>
                  <EditorComposicaoEtapa
                    blocos={etapaSelecionada.blocos ?? []}
                    etapas={fluxo.etapas}
                    etapaId={etapaSelecionada.id}
                    podeEditar={podeEditar}
                    permiteFinanceiro={permiteFinanceiro}
                    aoAlterar={(blocos) => atualizarCampoEtapaSelecionada("blocos", blocos)}
                  />
                  <label className="block text-xs">
                    Caminho padrão da etapa
                    <select
                      className="mt-1 w-full rounded border border-marfim-300 bg-white p-2"
                      value={
                        etapaSelecionada.finalizacaoExplicita
                          ? idConclusao
                          : (etapaSelecionada.proximaEtapaPadraoId ?? "")
                      }
                      disabled={!podeEditar}
                      onChange={(e) => {
                        const atualizado = e.target.value
                          ? conectarNoEditor(
                            fluxo,
                            {
                              source: etapaSelecionada.id,
                              target: e.target.value,
                              sourceHandle: "padrao",
                            },
                            idInicio,
                            idConclusao,
                          )
                          : desconectarArestaEditor(
                            fluxo,
                            { source: etapaSelecionada.id, target: "", sourceHandle: "padrao" },
                            idInicio,
                          );
                        if (atualizado) aoSalvarFluxo(atualizado);
                      }}
                    >
                      <option value="">Sem conexão definida</option>
                      <option value={idConclusao}>Finalização</option>
                      {fluxo.etapas
                        .filter((e) => e.id !== etapaSelecionada.id)
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.titulo}
                          </option>
                        ))}
                    </select>
                  </label>
                </>
              ) : null}
              {etapaSelecionada.tipoEtapa === "selecao_catalogo" ? (
                <div className="rounded-lg border border-marfim-300 bg-marfim-50 p-3">
                  <p className="font-semibold text-mineral-950">Fonte de Itens:</p>
                  <p className="mt-1 text-mineral-600">
                    Esta caixa puxa automaticamente os itens ativos do seu{" "}
                    <strong>Catálogo</strong>.
                  </p>
                </div>
              ) : null}

              {etapaSelecionada.tipoEtapa === "selecao_profissional" ? (
                <div className="rounded-lg border border-marfim-300 bg-marfim-50 p-3">
                  <p className="font-semibold text-mineral-950">Seleção de Equipe:</p>
                  <p className="mt-1 text-mineral-600">
                    Esta caixa exibe automaticamente os consultores ativos cadastrados em{" "}
                    <strong>Equipe</strong> e direciona o retorno ao WhatsApp do especialista
                    escolhido.
                  </p>
                </div>
              ) : null}

              {/* Gerenciador Universal de Campos Dinâmicos (Formulário) */}
              {etapaSelecionada.tipoEtapa !== "etapa_livre" &&
                (etapaSelecionada.tipoEtapa === "formulario_dinamico" || etapaSelecionada.campos) ? (
                <div className="space-y-3 border-t border-marfim-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-mineral-950">Campos do Formulário:</span>
                    <button
                      type="button"
                      onClick={adicionarCampoNaEtapaSelecionada}
                      disabled={!podeEditar}
                      className="inline-flex items-center gap-1 rounded border border-marfim-300 bg-marfim-50 px-2 py-1 text-[11px] font-medium text-mineral-800 hover:bg-marfim-100"
                    >
                      <Plus className="h-3 w-3" aria-hidden="true" />
                      <span>Adicionar Campo</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(etapaSelecionada.campos ?? []).map((campo, idx) => (
                      <div
                        key={campo.id}
                        className="space-y-2 rounded-lg border border-marfim-300 bg-marfim-50/60 p-2.5"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[10px] font-semibold tracking-wider text-mineral-500 uppercase">
                            Campo #{idx + 1}
                          </span>
                          {(etapaSelecionada.campos?.length ?? 0) > 1 ? (
                            <button
                              type="button"
                              onClick={() => removerCampoDinamico(campo.id)}
                              disabled={!podeEditar}
                              className="rounded p-1 text-mineral-400 hover:bg-red-50 hover:text-alerta-erro"
                              title="Remover campo"
                            >
                              <Trash2 className="h-3 w-3" aria-hidden="true" />
                            </button>
                          ) : null}
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-mineral-700">
                            Rótulo / Pergunta
                          </label>
                          <input
                            type="text"
                            value={campo.rotulo}
                            disabled={!podeEditar}
                            onChange={(e) =>
                              atualizarCampoDinamico(campo.id, { rotulo: e.target.value })
                            }
                            placeholder="Ex.: Serviço ou item de interesse"
                            className="mt-1 w-full rounded border border-marfim-300 bg-white px-2 py-1 text-xs text-mineral-950"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-mineral-700">
                              Tipo de Dado
                            </label>
                            <select
                              value={campo.tipo}
                              disabled={!podeEditar}
                              onChange={(e) =>
                                atualizarCampoDinamico(campo.id, {
                                  tipo: e.target.value as TipoPrimitivoCampo,
                                })
                              }
                              className="mt-1 w-full rounded border border-marfim-300 bg-white px-1.5 py-1 text-xs text-mineral-950"
                            >
                              <option value="texto_curto">Texto Curto</option>
                              <option value="texto_longo">Texto Longo</option>
                              <option value="numero">Número</option>
                              <option value="moeda">Moeda (R$)</option>
                              <option value="data">Data</option>
                              <option value="email">E-mail</option>
                              <option value="telefone">Telefone</option>
                              <option value="booleano">Sim / Não</option>
                              <option value="selecao_unica">Seleção Única</option>
                              <option value="selecao_multipla">Múltipla Seleção</option>
                            </select>
                          </div>

                          {campo.tipo === "numero" ? (
                            <div>
                              <label className="block text-[11px] font-medium text-mineral-700">
                                Sufixo (unidade)
                              </label>
                              <input
                                type="text"
                                value={campo.sufixoVisual ?? ""}
                                disabled={!podeEditar}
                                onChange={(e) =>
                                  atualizarCampoDinamico(campo.id, { sufixoVisual: e.target.value })
                                }
                                placeholder="ex: km, m²"
                                className="mt-1 w-full rounded border border-marfim-300 bg-white px-2 py-1 text-xs text-mineral-950"
                              />
                            </div>
                          ) : (
                            <div>
                              <label className="block text-[11px] font-medium text-mineral-700">
                                Placeholder
                              </label>
                              <input
                                type="text"
                                value={campo.placeholder ?? ""}
                                disabled={!podeEditar}
                                onChange={(e) =>
                                  atualizarCampoDinamico(campo.id, { placeholder: e.target.value })
                                }
                                placeholder="Dica no campo..."
                                className="mt-1 w-full rounded border border-marfim-300 bg-white px-2 py-1 text-xs text-mineral-950"
                              />
                            </div>
                          )}
                        </div>

                        {campo.tipo === "selecao_unica" || campo.tipo === "selecao_multipla" ? (
                          <div>
                            <label className="block text-[11px] font-medium text-mineral-700">
                              Opções (separadas por vírgula)
                            </label>
                            <input
                              type="text"
                              value={campo.opcoesCustomizadas?.join(", ") ?? ""}
                              disabled={!podeEditar}
                              onChange={(e) => {
                                const lista = e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean);
                                atualizarCampoDinamico(campo.id, { opcoesCustomizadas: lista });
                              }}
                              placeholder="Opção 1, Opção 2, Opção 3"
                              className="mt-1 w-full rounded border border-marfim-300 bg-white px-2 py-1 text-xs text-mineral-950"
                            />
                          </div>
                        ) : null}

                        <label className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            checked={campo.obrigatorio}
                            disabled={!podeEditar}
                            onChange={(e) =>
                              atualizarCampoDinamico(campo.id, { obrigatorio: e.target.checked })
                            }
                            className="h-3.5 w-3.5 accent-mineral-950"
                          />
                          <span className="text-[11px] text-mineral-800">
                            Preenchimento obrigatório
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Gerenciador de Opções (para Pergunta de Seleção) */}
              {etapaSelecionada.tipoEtapa !== "etapa_livre" && etapaSelecionada.opcoes ? (
                <div className="space-y-2.5 border-t border-marfim-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-mineral-950">Opções desta etapa:</span>
                    <button
                      type="button"
                      onClick={adicionarOpcaoNaEtapaSelecionada}
                      disabled={!podeEditar}
                      className="inline-flex items-center gap-1 rounded border border-marfim-300 bg-marfim-50 px-2 py-1 text-[11px] font-medium text-mineral-800 hover:bg-marfim-100"
                    >
                      <Plus className="h-3 w-3" aria-hidden="true" />
                      <span>Adicionar Opção</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {etapaSelecionada.opcoes.map((opcao, idx) => (
                      <div
                        key={opcao.id}
                        className="flex flex-wrap items-center gap-2 rounded-md border border-marfim-200 bg-marfim-50/50 p-2"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-marfim-200 text-[10px] font-bold text-mineral-700">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={opcao.rotulo}
                          disabled={!podeEditar}
                          onChange={(e) => {
                            const novasOpcoes = etapaSelecionada.opcoes!.map((opt, i) =>
                              i === idx ? { ...opt, rotulo: e.target.value } : opt,
                            );
                            atualizarCampoEtapaSelecionada("opcoes", novasOpcoes);
                          }}
                          placeholder={`Opção ${idx + 1}`}
                          className="flex-1 rounded border border-marfim-300 bg-white px-2 py-1 text-xs text-mineral-950 focus:border-mineral-950 focus:outline-none"
                        />
                        {etapaSelecionada.opcoes!.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removerOpcaoNaEtapaSelecionada(opcao.id)}
                            disabled={!podeEditar}
                            className="rounded p-1 text-mineral-400 hover:bg-red-50 hover:text-alerta-erro"
                            title="Remover opção"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        ) : null}
                        {etapaSelecionada.tipoEtapa === "selecao_unica" ? (
                          <label className="w-full text-[11px] font-medium text-mineral-700">
                            Destino da opção {idx + 1}
                            <select
                              className="mt-1 w-full rounded border border-marfim-300 bg-white px-2 py-1 text-xs"
                              value={opcao.proximaEtapaIdOpcional ?? ""}
                              disabled={!podeEditar}
                              onChange={(e) =>
                                atualizarCampoEtapaSelecionada(
                                  "opcoes",
                                  etapaSelecionada.opcoes!.map((atual) =>
                                    atual.id === opcao.id
                                      ? {
                                        ...atual,
                                        proximaEtapaIdOpcional: e.target.value || undefined,
                                      }
                                      : atual,
                                  ),
                                )
                              }
                            >
                              <option value="">Seguir caminho padrão</option>
                              {fluxo.etapas
                                .filter((etapa) => etapa.id !== etapaSelecionada.id)
                                .map((etapa) => (
                                  <option key={etapa.id} value={etapa.id}>
                                    {etapa.titulo}
                                  </option>
                                ))}
                            </select>
                          </label>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Definir como Etapa Inicial desta jornada */}
              <div className="border-t border-marfim-200 pt-3">
                <label className="flex cursor-pointer items-center gap-2.5 rounded-md border border-marfim-200 bg-marfim-50/60 p-2.5 transition hover:bg-marfim-100">
                  <input
                    type="checkbox"
                    checked={etapaSelecionada.id === fluxo.etapaInicialId}
                    disabled={!podeEditar || etapaSelecionada.id === fluxo.etapaInicialId}
                    onChange={() =>
                      aoSalvarFluxo({ ...fluxo, etapaInicialId: etapaSelecionada.id })
                    }
                    className="h-4 w-4 accent-mineral-950"
                  />
                  <div className="text-xs">
                    <span className="font-medium text-mineral-900 block">
                      Definir como Etapa Inicial
                    </span>
                    <span className="text-[11px] text-mineral-500">
                      O visitante inicia a jornada por esta caixa
                    </span>
                  </div>
                </label>
              </div>

              {fluxo.etapas.length > 0 ? (
                <div className="border-t border-marfim-200 pt-3">
                  <Botao
                    variante="fantasma"
                    tamanho="compacto"
                    onClick={() => removerEtapa(etapaSelecionada.id)}
                    disabled={!podeEditar}
                    className="w-full text-alerta-erro hover:bg-red-50 hover:text-alerta-erro"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Remover esta caixa</span>
                  </Botao>
                </div>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
