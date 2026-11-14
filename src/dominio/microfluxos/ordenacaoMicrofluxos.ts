import type { DefinicaoMicrofluxo } from "./tiposMicrofluxo";

/**
 * Ordena determinística e prioritariamente uma lista de microfluxos:
 * 1. O microfluxo com `destaquePrimarioHome === true` fica SEMPRE em 1º lugar (índice 0).
 * 2. Em caso de múltiplos itens marcados com destaque (dados legados), o primeiro prevalece.
 * 3. Os demais microfluxos são ordenados crescentemente por `ordemHome`.
 * 4. Normaliza as propriedades `ordemHome` para uma sequência contínua (0, 1, 2, ...).
 */
export function ordenarMicrofluxosPorPrioridadeEOrdem(
  microfluxos: readonly DefinicaoMicrofluxo[],
): DefinicaoMicrofluxo[] {
  if (microfluxos.length <= 1) {
    return microfluxos.map((m, idx) => ({ ...m, ordemHome: idx }));
  }

  const indiceDestaque = microfluxos.findIndex((m) => m.destaquePrimarioHome === true);

  let destaque: DefinicaoMicrofluxo | null = null;
  const restantes: DefinicaoMicrofluxo[] = [];

  microfluxos.forEach((fluxo, idx) => {
    if (idx === indiceDestaque) {
      destaque = { ...fluxo, destaquePrimarioHome: true };
    } else {
      restantes.push({
        ...fluxo,
        ...(fluxo.destaquePrimarioHome ? { destaquePrimarioHome: false } : {}),
      });
    }
  });

  restantes.sort((a, b) => (a.ordemHome ?? 0) - (b.ordemHome ?? 0) || a.id.localeCompare(b.id));

  const resultadoFinal = destaque ? [destaque, ...restantes] : restantes;

  return resultadoFinal.map((item, idx) => ({
    ...item,
    ordemHome: idx,
  }));
}

/**
 * Move um microfluxo para a esquerda/antes (-1) ou para a direita/depois (+1).
 * Regras:
 * - O item destacado na posição 0 nunca pode ser movido de lugar (fica fixo no topo).
 * - Nenhum outro item pode se mover para a posição 0 enquanto houver um item destacado.
 * - Troca as posições e reindexa `ordemHome` (0, 1, 2, ...).
 */
export function reordenarPosicaoMicrofluxo(
  microfluxos: readonly DefinicaoMicrofluxo[],
  indiceOrigem: number,
  direcao: -1 | 1,
): DefinicaoMicrofluxo[] {
  const listaOrdenada = ordenarMicrofluxosPorPrioridadeEOrdem(microfluxos);
  const temDestaqueNoTopo = listaOrdenada[0]?.destaquePrimarioHome === true;
  const indiceMinimoMovel = temDestaqueNoTopo ? 1 : 0;

  if (indiceOrigem < indiceMinimoMovel || indiceOrigem >= listaOrdenada.length) {
    return listaOrdenada;
  }

  const indiceDestino = indiceOrigem + direcao;

  if (indiceDestino < indiceMinimoMovel || indiceDestino >= listaOrdenada.length) {
    return listaOrdenada;
  }

  const copia = [...listaOrdenada];
  const [removido] = copia.splice(indiceOrigem, 1);
  if (!removido) {
    return listaOrdenada;
  }

  copia.splice(indiceDestino, 0, removido);

  return copia.map((item, idx) => ({
    ...item,
    ordemHome: idx,
  }));
}

/**
 * Define ou remove o destaque prioritário de um microfluxo com garantia de unicidade comercial.
 * Ao marcar como destaque:
 * - O fluxo alvo ganha `destaquePrimarioHome: true`.
 * - Qualquer outro fluxo perde o destaque prioritário.
 * - O fluxo destacado é imediatamente promovido ao topo (índice 0).
 */
export function definirDestaqueExclusivoMicrofluxo(
  microfluxos: readonly DefinicaoMicrofluxo[],
  fluxoId: string,
  destaque: boolean,
): DefinicaoMicrofluxo[] {
  const listaAtualizada = microfluxos.map((fluxo) => {
    if (fluxo.id === fluxoId) {
      return {
        ...fluxo,
        destaquePrimarioHome: destaque,
      };
    }
    if (destaque && fluxo.destaquePrimarioHome) {
      return {
        ...fluxo,
        destaquePrimarioHome: false,
      };
    }
    return fluxo;
  });

  return ordenarMicrofluxosPorPrioridadeEOrdem(listaAtualizada);
}
