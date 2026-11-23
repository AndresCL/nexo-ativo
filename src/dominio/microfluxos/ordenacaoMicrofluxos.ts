import type { DefinicaoMicrofluxo } from "./tiposMicrofluxo";

/**
 * Ordena determinística e estavelmente uma lista de microfluxos por `ordemHome`:
 * 1. Garante unicidade do destaque visual (`destaquePrimarioHome === true`), sem alterar a posição.
 * 2. Ordena crescentemente por `ordemHome` (desempate determinístico por `id`).
 * 3. Normaliza as propriedades `ordemHome` para uma sequência contínua (0, 1, 2, ...).
 */
export function ordenarMicrofluxosPorPrioridadeEOrdem(
  microfluxos: readonly DefinicaoMicrofluxo[],
): DefinicaoMicrofluxo[] {
  if (microfluxos.length <= 1) {
    return microfluxos.map((m, idx) => ({ ...m, ordemHome: idx }));
  }

  let destaqueEncontrado = false;
  const normalizados = microfluxos.map((fluxo) => {
    if (fluxo.destaquePrimarioHome === true) {
      if (!destaqueEncontrado) {
        destaqueEncontrado = true;
        return { ...fluxo, destaquePrimarioHome: true };
      }
      return { ...fluxo, destaquePrimarioHome: false };
    }
    return fluxo;
  });

  normalizados.sort((a, b) => (a.ordemHome ?? 0) - (b.ordemHome ?? 0) || a.id.localeCompare(b.id));

  return normalizados.map((item, idx) => ({
    ...item,
    ordemHome: idx,
  }));
}

/**
 * Move um microfluxo para cima/antes (-1) ou para baixo/depois (+1) livremente,
 * reindexando `ordemHome` (0, 1, 2, ...).
 */
export function reordenarPosicaoMicrofluxo(
  microfluxos: readonly DefinicaoMicrofluxo[],
  indiceOrigem: number,
  direcao: -1 | 1,
): DefinicaoMicrofluxo[] {
  const listaOrdenada = ordenarMicrofluxosPorPrioridadeEOrdem(microfluxos);

  if (indiceOrigem < 0 || indiceOrigem >= listaOrdenada.length) {
    return listaOrdenada;
  }

  const indiceDestino = indiceOrigem + direcao;

  if (indiceDestino < 0 || indiceDestino >= listaOrdenada.length) {
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
 * Define ou remove o destaque visual exclusivo de um microfluxo, preservando sua posição atual.
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
