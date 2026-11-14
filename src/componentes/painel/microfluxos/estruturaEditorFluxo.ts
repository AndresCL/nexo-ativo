import type { DefinicaoMicrofluxo, EtapaMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import {
  alterarDestinoOpcaoEtapa,
  converterEtapaParaLivre,
} from "@/dominio/microfluxos/composicaoEtapaLivre";

export interface SaidaOpcaoEditor {
  readonly id: string;
  readonly rotulo: string;
  readonly opcaoId: string;
  readonly blocoId?: string;
  readonly destino?: string;
  readonly encerrar?: boolean;
  readonly desconectada?: boolean;
}
export interface ArestaEditorFluxo {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly sourceHandle: string;
  readonly label?: string;
  readonly opcaoId?: string;
  readonly blocoId?: string;
  readonly inferida?: boolean;
}

export function listarSaidasOpcoesEditor(etapa: EtapaMicrofluxo): readonly SaidaOpcaoEditor[] {
  const grupos =
    etapa.tipoEtapa === "etapa_livre"
      ? (etapa.blocos ?? []).flatMap((b) =>
          b.tipo === "escolha" && !b.multipla ? [{ blocoId: b.id, opcoes: b.opcoes }] : [],
        )
      : etapa.tipoEtapa === "selecao_unica"
        ? [{ blocoId: undefined, opcoes: etapa.opcoes ?? [] }]
        : [];
  return grupos.flatMap(({ blocoId, opcoes }) =>
    opcoes.map((opcao) => ({
      id: `opcao:${encodeURIComponent(blocoId ?? "")}:${encodeURIComponent(opcao.id)}`,
      rotulo: opcao.rotulo,
      opcaoId: opcao.id,
      blocoId,
      destino: opcao.proximaEtapaIdOpcional,
      encerrar: opcao.encerrarPercurso,
      desconectada: opcao.desconectada,
    })),
  );
}

const nomesModelo: Readonly<Record<string, string>> = {
  selecao_unica: "Pergunta de escolha",
  selecao_multipla: "Múltipla escolha",
  formulario_dinamico: "Formulário",
  entrada_curta: "Texto",
  coleta_contato: "Dados para retorno",
  selecao_catalogo: "Catálogo",
  selecao_produto: "Catálogo",
  selecao_servico: "Catálogo",
  selecao_profissional: "Equipe",
};
export function descreverTipoCardEtapa(etapa: EtapaMicrofluxo): { tipo: string; modelo?: string } {
  const livre = converterEtapaParaLivre(etapa);
  const modelo =
    etapa.modeloOrigem ?? (etapa.tipoEtapa !== "etapa_livre" ? etapa.tipoEtapa : undefined);
  if (livre.tipoEtapa !== "etapa_livre")
    return {
      tipo:
        nomesModelo[etapa.tipoEtapa] ??
        (etapa.tipoEtapa === "instrucao_pix_manual"
          ? "Pix"
          : etapa.tipoEtapa === "recomendacao_catalogo"
            ? "Recomendação"
            : "WhatsApp"),
    };
  const blocos = livre.blocos ?? [];
  const entradas = blocos.filter((b) => b.tipo !== "texto" && b.tipo !== "imagem");
  let tipo = "Etapa livre";
  if (entradas.length && entradas.every((b) => b.tipo === "campo"))
    tipo = entradas.every((b) => b.tipo === "campo" && b.finalidade)
      ? "Dados para retorno"
      : "Formulário";
  else if (entradas.length === 1) {
    const bloco = entradas[0]!;
    tipo =
      bloco.tipo === "escolha"
        ? bloco.multipla
          ? "Múltipla escolha"
          : "Pergunta de escolha"
        : bloco.tipo === "catalogo"
          ? "Catálogo"
          : bloco.tipo === "equipe"
            ? "Equipe"
            : "Campo";
  } else if (entradas.length > 1) tipo = "Composição mista";
  else if (blocos.length)
    tipo = blocos.every((b) => b.tipo === "texto")
      ? "Texto"
      : blocos.every((b) => b.tipo === "imagem")
        ? "Imagem"
        : "Conteúdo";
  return { tipo, modelo: modelo ? nomesModelo[modelo] : undefined };
}

export function obterEtapasConectadasInicio(fluxo: DefinicaoMicrofluxo): ReadonlySet<string> {
  const ids = new Set<string>();
  const fila = fluxo.etapaInicialId ? [fluxo.etapaInicialId] : [];
  for (let i = 0; i < fila.length; i++) {
    const id = fila[i]!;
    if (ids.has(id)) continue;
    const etapa = fluxo.etapas.find((e) => e.id === id);
    if (!etapa) continue;
    ids.add(id);
    if (!etapa.saidaPadraoDesconectada && etapa.proximaEtapaPadraoId)
      fila.push(etapa.proximaEtapaPadraoId);
    for (const saida of listarSaidasOpcoesEditor(etapa))
      if (!saida.desconectada && !saida.encerrar && saida.destino) fila.push(saida.destino);
  }
  return ids;
}

export function projetarArestasEditor(
  fluxo: DefinicaoMicrofluxo,
  inicio: string,
  conclusao: string,
  exibirConclusao: boolean,
): readonly ArestaEditorFluxo[] {
  const arestas: ArestaEditorFluxo[] = [];
  const conectadas = obterEtapasConectadasInicio(fluxo);
  if (fluxo.etapas.some((e) => e.id === fluxo.etapaInicialId))
    arestas.push({
      id: "entrada-fluxo",
      source: inicio,
      target: fluxo.etapaInicialId,
      sourceHandle: "inicio",
    });
  for (const etapa of fluxo.etapas) {
    const saidas = listarSaidasOpcoesEditor(etapa);
    if (!etapa.saidaPadraoDesconectada && etapa.proximaEtapaPadraoId)
      arestas.push({
        id: `padrao:${etapa.id}`,
        source: etapa.id,
        target: etapa.proximaEtapaPadraoId,
        sourceHandle: "padrao",
        label: saidas.length ? "Padrão" : undefined,
      });
    else if (!etapa.saidaPadraoDesconectada && exibirConclusao && etapa.finalizacaoExplicita)
      arestas.push({
        id: `fim:${etapa.id}`,
        source: etapa.id,
        target: conclusao,
        sourceHandle: "padrao",
      });
    else if (
      !etapa.saidaPadraoDesconectada &&
      exibirConclusao &&
      conectadas.has(etapa.id) &&
      (!saidas.length ||
        (etapa.tipoEtapa === "etapa_livre"
          ? etapa.blocos?.some((b) => b.tipo === "escolha" && !b.multipla && !b.obrigatorio)
          : !etapa.obrigatoria))
    )
      arestas.push({
        id: `fim:${etapa.id}`,
        source: etapa.id,
        target: conclusao,
        sourceHandle: "padrao",
        inferida: true,
      });
    for (const saida of saidas) {
      if (saida.desconectada) continue;
      const destino = saida.encerrar
        ? exibirConclusao
          ? conclusao
          : undefined
        : (saida.destino ??
          (!etapa.saidaPadraoDesconectada
            ? (etapa.proximaEtapaPadraoId ??
              (exibirConclusao && (etapa.finalizacaoExplicita || conectadas.has(etapa.id))
                ? conclusao
                : undefined))
            : undefined));
      if (destino)
        arestas.push({
          id: `${etapa.id}:${saida.id}`,
          source: etapa.id,
          target: destino,
          sourceHandle: saida.id,
          label: saida.rotulo,
          opcaoId: saida.opcaoId,
          blocoId: saida.blocoId,
          inferida: !saida.destino && !saida.encerrar,
        });
    }
  }
  return arestas;
}

export function conectarNoEditor(
  fluxo: DefinicaoMicrofluxo,
  conexao: { source: string | null; target: string | null; sourceHandle?: string | null },
  inicio: string,
  conclusao: string,
): DefinicaoMicrofluxo | null {
  const { source, target, sourceHandle } = conexao;
  if (!source || !target || source === conclusao || target === inicio || source === target)
    return null;
  if (source === inicio)
    return fluxo.etapas.some((e) => e.id === target) ? { ...fluxo, etapaInicialId: target } : null;
  if (target !== conclusao && !fluxo.etapas.some((e) => e.id === target)) return null;
  const etapa = fluxo.etapas.find((e) => e.id === source);
  if (!etapa) return null;
  const saida =
    sourceHandle && sourceHandle !== "padrao"
      ? listarSaidasOpcoesEditor(etapa).find((s) => s.id === sourceHandle)
      : undefined;
  if (sourceHandle && sourceHandle !== "padrao" && !saida) return null;
  const atualizada = saida
    ? alterarDestinoOpcaoEtapa(
        etapa,
        saida.opcaoId,
        target === conclusao ? undefined : target,
        saida.blocoId,
        target === conclusao,
      )
    : {
        ...etapa,
        proximaEtapaPadraoId: target === conclusao ? undefined : target,
        finalizacaoExplicita: target === conclusao,
        saidaPadraoDesconectada: false,
      };
  return { ...fluxo, etapas: fluxo.etapas.map((e) => (e.id === source ? atualizada : e)) };
}

export function desconectarArestaEditor(
  fluxo: DefinicaoMicrofluxo,
  aresta: { source: string; target: string; sourceHandle?: string | null },
  inicio: string,
): DefinicaoMicrofluxo {
  if (aresta.source === inicio) return { ...fluxo, etapaInicialId: "" };
  return {
    ...fluxo,
    etapas: fluxo.etapas.map((e) => {
      if (e.id !== aresta.source) return e;
      const opcao = listarSaidasOpcoesEditor(e).find((s) => s.id === aresta.sourceHandle);
      return opcao
        ? alterarDestinoOpcaoEtapa(e, opcao.opcaoId, undefined, opcao.blocoId, false, true)
        : {
            ...e,
            proximaEtapaPadraoId: undefined,
            finalizacaoExplicita: false,
            saidaPadraoDesconectada: true,
          };
    }),
  };
}
