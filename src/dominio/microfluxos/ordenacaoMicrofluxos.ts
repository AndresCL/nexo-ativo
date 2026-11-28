import type { DefinicaoMicrofluxo } from "./tiposMicrofluxo";
import {
  resolverNivelDestaqueVitrine,
  type NivelDestaqueVitrine,
} from "./nivelDestaqueVitrine";

/**
 * Ordena determinística e estavelmente uma lista de microfluxos por `ordemHome`:
 * 1. Garante unicidade independente do destaque primário e do destaque secundário, sem alterar a posição.
 * 2. Mantém `destaquePrimarioHome` sincronizado com `nivelDestaqueHome === "primario"` (retrocompatibilidade).
 * 3. Ordena crescentemente por `ordemHome` (desempate determinístico por `id`).
 * 4. Normaliza as propriedades `ordemHome` para uma sequência contínua (0, 1, 2, ...).
 */
export function ordenarMicrofluxosPorPrioridadeEOrdem(
  microfluxos: readonly DefinicaoMicrofluxo[],
): DefinicaoMicrofluxo[] {
  let primarioEncontrado = false;
  let secundarioEncontrado = false;

  const normalizados = microfluxos.map((fluxo) => {
    const nivel = resolverNivelDestaqueVitrine(fluxo.nivelDestaqueHome, fluxo.destaquePrimarioHome);

    if (nivel === "primario") {
      if (!primarioEncontrado) {
        primarioEncontrado = true;
        return { ...fluxo, nivelDestaqueHome: "primario" as const, destaquePrimarioHome: true };
      }
      return { ...fluxo, nivelDestaqueHome: "terciario" as const, destaquePrimarioHome: false };
    }

    if (nivel === "secundario") {
      if (!secundarioEncontrado) {
        secundarioEncontrado = true;
        return { ...fluxo, nivelDestaqueHome: "secundario" as const, destaquePrimarioHome: false };
      }
      return { ...fluxo, nivelDestaqueHome: "terciario" as const, destaquePrimarioHome: false };
    }

    if (fluxo.destaquePrimarioHome || fluxo.nivelDestaqueHome !== undefined) {
      return { ...fluxo, nivelDestaqueHome: "terciario" as const, destaquePrimarioHome: false };
    }

    return fluxo;
  });

  if (normalizados.length <= 1) {
    return normalizados.map((m, idx) => ({ ...m, ordemHome: idx }));
  }

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
 * Define o nível de destaque de um microfluxo (`primario`, `secundario` ou `terciario`),
 * garantindo unicidade independente de `primario` e `secundario`, preservando sua posição atual.
 */
export function definirNivelDestaqueMicrofluxo(
  microfluxos: readonly DefinicaoMicrofluxo[],
  fluxoId: string,
  nivel: NivelDestaqueVitrine,
): DefinicaoMicrofluxo[] {
  const listaAtualizada = microfluxos.map((fluxo) => {
    if (fluxo.id === fluxoId) {
      return {
        ...fluxo,
        nivelDestaqueHome: nivel,
        destaquePrimarioHome: nivel === "primario",
      };
    }

    const nivelAtual = resolverNivelDestaqueVitrine(
      fluxo.nivelDestaqueHome,
      fluxo.destaquePrimarioHome,
    );
    if ((nivel === "primario" || nivel === "secundario") && nivelAtual === nivel) {
      return {
        ...fluxo,
        nivelDestaqueHome: "terciario" as const,
        destaquePrimarioHome: false,
      };
    }

    return fluxo;
  });

  return ordenarMicrofluxosPorPrioridadeEOrdem(listaAtualizada);
}

/**
 * Define ou remove o destaque visual exclusivo de um microfluxo, preservando sua posição atual.
 */
export function definirDestaqueExclusivoMicrofluxo(
  microfluxos: readonly DefinicaoMicrofluxo[],
  fluxoId: string,
  destaque: boolean,
): DefinicaoMicrofluxo[] {
  return definirNivelDestaqueMicrofluxo(microfluxos, fluxoId, destaque ? "primario" : "terciario");
}
