import type { EtapaExperienciaPainel } from "@/infraestrutura/painel/leitorDesempenhoOrganizacaoServidor";

export interface RotaTopologica {
  readonly opcaoId: string;
  readonly rotuloOpcao: string;
  readonly etapaIdInicial?: string;
  readonly etapas: readonly { readonly id: string; readonly titulo: string }[];
  readonly encerraPercurso?: boolean;
}

export interface NoTopologiaLinear {
  readonly tipo: "linear";
  readonly id: string;
  readonly titulo: string;
}

export interface NoTopologiaRamificado {
  readonly tipo: "ramificado";
  readonly id: string;
  readonly titulo: string;
  readonly rotas: readonly RotaTopologica[];
  readonly destinoReencontroId: string | null;
}

export type NoTopologiaFunil = NoTopologiaLinear | NoTopologiaRamificado;

export interface TopologiaFunil {
  readonly nos: readonly NoTopologiaFunil[];
  readonly temRamificacoes: boolean;
}

/**
 * Determina o destino padrão de avanço da etapa. Se não houver proximaEtapaPadraoId
 * explícito, utiliza a próxima etapa na ordem do array (fallback para etapas sequenciais).
 */
function obterProximoDestinoPadrao(
  etapa: EtapaExperienciaPainel,
  etapas: readonly EtapaExperienciaPainel[],
): string | null {
  if (etapa.proximaEtapaPadraoId) return etapa.proximaEtapaPadraoId;
  const idx = etapas.findIndex((e) => e.id === etapa.id);
  if (idx >= 0 && idx < etapas.length - 1) {
    return etapas[idx + 1]!.id;
  }
  return null;
}

/**
 * Encontra todos os IDs de etapas alcançáveis a partir de uma etapa inicial.
 */
function obterIdsAlcancaveis(
  etapaIdInicial: string,
  mapaEtapas: ReadonlyMap<string, EtapaExperienciaPainel>,
  etapas: readonly EtapaExperienciaPainel[],
): Set<string> {
  const visitados = new Set<string>();
  const fila: string[] = [etapaIdInicial];

  while (fila.length > 0) {
    const atualId = fila.shift()!;
    if (visitados.has(atualId)) continue;
    visitados.add(atualId);

    const etapa = mapaEtapas.get(atualId);
    if (!etapa) continue;

    const destinoPadrao = obterProximoDestinoPadrao(etapa, etapas);
    if (destinoPadrao && !visitados.has(destinoPadrao)) {
      fila.push(destinoPadrao);
    }

    for (const opcao of etapa.opcoes ?? []) {
      if (opcao.proximaEtapaIdOpcional && !visitados.has(opcao.proximaEtapaIdOpcional)) {
        fila.push(opcao.proximaEtapaIdOpcional);
      }
    }
  }

  return visitados;
}

/**
 * Identifica o primeiro nó de convergência comum alcançável por todas as rotas ativas.
 */
function encontrarPontoReencontroComum(
  destinosRotas: readonly string[],
  mapaEtapas: ReadonlyMap<string, EtapaExperienciaPainel>,
  ordemLinearEtapas: readonly string[],
  etapas: readonly EtapaExperienciaPainel[],
): string | null {
  if (destinosRotas.length === 0) return null;

  // Coleta o conjunto de nós alcançáveis por cada destino inicial de rota
  const conjuntosAlcancaveis = destinosRotas.map((destinoId) =>
    obterIdsAlcancaveis(destinoId, mapaEtapas, etapas),
  );

  const primeiroConjunto = conjuntosAlcancaveis[0];
  if (!primeiroConjunto) return null;

  // Interseção: nós presentes em TODOS os caminhos das rotas
  const intersecao = new Set<string>();
  for (const id of primeiroConjunto) {
    if (conjuntosAlcancaveis.every((conjunto) => conjunto.has(id))) {
      intersecao.add(id);
    }
  }

  if (intersecao.size === 0) return null;

  // O ponto de reencontro mais próximo é o primeiro nó da interseção na ordem da experiência
  for (const id of ordemLinearEtapas) {
    if (intersecao.has(id)) {
      return id;
    }
  }

  return Array.from(intersecao)[0] ?? null;
}

/**
 * Percorre os passos de uma rota individual até encontrar o ponto de reencontro ou o fim.
 */
function extrairEtapasDaRota(
  etapaIdInicial: string,
  pontoReencontroId: string | null,
  mapaEtapas: ReadonlyMap<string, EtapaExperienciaPainel>,
  etapas: readonly EtapaExperienciaPainel[],
): readonly { readonly id: string; readonly titulo: string }[] {
  const etapasRota: { readonly id: string; readonly titulo: string }[] = [];
  const visitados = new Set<string>();
  let atualId: string | null = etapaIdInicial;

  while (atualId && atualId !== pontoReencontroId && !visitados.has(atualId)) {
    visitados.add(atualId);
    const etapa = mapaEtapas.get(atualId);
    if (!etapa) break;

    etapasRota.push({ id: etapa.id, titulo: etapa.titulo });

    // Avança pela saída padrão da etapa da rota
    atualId = obterProximoDestinoPadrao(etapa, etapas);
  }

  return etapasRota;
}

/**
 * Analisador puro que decompõe o DAG de um microfluxo em nós lineares e blocos ramificados.
 * Respeita SRP e é 100% determinístico para qualquer topologia de grafo.
 */
export function analisarTopologiaFunil(
  etapas: readonly EtapaExperienciaPainel[],
  etapaInicialIdOpcional?: string,
): TopologiaFunil {
  if (etapas.length === 0) {
    return { nos: [], temRamificacoes: false };
  }

  const mapaEtapas = new Map<string, EtapaExperienciaPainel>();
  const ordemIds: string[] = [];
  for (const etapa of etapas) {
    mapaEtapas.set(etapa.id, etapa);
    ordemIds.push(etapa.id);
  }

  const etapaInicialId =
    etapaInicialIdOpcional && mapaEtapas.has(etapaInicialIdOpcional)
      ? etapaInicialIdOpcional
      : etapas[0]!.id;

  const nos: NoTopologiaFunil[] = [];
  const visitadosNaEspinha = new Set<string>();
  let temRamificacoes = false;

  let atualId: string | null = etapaInicialId;

  while (atualId && !visitadosNaEspinha.has(atualId)) {
    visitadosNaEspinha.add(atualId);
    const etapaAtual = mapaEtapas.get(atualId);
    if (!etapaAtual) break;

    // Detecta opções com desvio (que apontam para etapas diferentes da saída padrão)
    const opcoes = etapaAtual.opcoes ?? [];
    const opcoesComDesvio = opcoes.filter(
      (o) =>
        Boolean(o.encerrarPercurso) ||
        (Boolean(o.proximaEtapaIdOpcional) &&
          o.proximaEtapaIdOpcional !== etapaAtual.proximaEtapaPadraoId),
    );

    if (opcoesComDesvio.length > 0) {
      // Nó Ramificado!
      temRamificacoes = true;

      // Destinos iniciais de cada rota
      const destinosValidos = opcoes
        .map((o) => o.proximaEtapaIdOpcional ?? etapaAtual.proximaEtapaPadraoId)
        .filter((id): id is string => Boolean(id) && mapaEtapas.has(id!));

      const reencontroId = encontrarPontoReencontroComum(
        destinosValidos,
        mapaEtapas,
        ordemIds,
        etapas,
      );

      const rotas: RotaTopologica[] = opcoes.map((opcao) => {
        const destinoInicial = opcao.proximaEtapaIdOpcional ?? etapaAtual.proximaEtapaPadraoId;
        const encerraPercurso = Boolean(opcao.encerrarPercurso);

        if (encerraPercurso || !destinoInicial || destinoInicial === reencontroId) {
          return {
            opcaoId: opcao.id,
            rotuloOpcao: opcao.rotulo,
            etapaIdInicial: destinoInicial,
            etapas: [],
            encerraPercurso,
          };
        }

        const etapasDaRota = extrairEtapasDaRota(destinoInicial, reencontroId, mapaEtapas, etapas);
        // Marca as etapas internas da rota como visitadas para não duplicá-las na espinha
        for (const e of etapasDaRota) {
          visitadosNaEspinha.add(e.id);
        }

        return {
          opcaoId: opcao.id,
          rotuloOpcao: opcao.rotulo,
          etapaIdInicial: destinoInicial,
          etapas: etapasDaRota,
          encerraPercurso: false,
        };
      });

      nos.push({
        tipo: "ramificado",
        id: etapaAtual.id,
        titulo: etapaAtual.titulo,
        rotas,
        destinoReencontroId: reencontroId,
      });

      // A espinha dorsal continua a partir do ponto de reencontro
      atualId = reencontroId;
    } else {
      // Nó Linear simples
      nos.push({
        tipo: "linear",
        id: etapaAtual.id,
        titulo: etapaAtual.titulo,
      });

      atualId = obterProximoDestinoPadrao(etapaAtual, etapas);
    }
  }

  return {
    nos,
    temRamificacoes,
  };
}
