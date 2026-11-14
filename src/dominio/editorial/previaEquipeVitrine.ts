import type { ProfissionalEquipe } from "../entidades/catalogoConteudo";

export type AvatarPreviaEquipe = Pick<
  ProfissionalEquipe,
  "id" | "nomeCompleto" | "urlFotoPerfil" | "pontoFocalFoto"
>;

export interface PreviaEquipeVitrine {
  readonly total: number;
  readonly avatares: readonly AvatarPreviaEquipe[];
}

function calcularHash(texto: string): number {
  let hash = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    hash = Math.imul(hash ^ texto.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

/** Mesma equipe e organização produzem a mesma ordem no servidor, navegador e prévia. */
export function criarPreviaEquipeVitrine(
  profissionais: readonly ProfissionalEquipe[],
  organizacaoId: string,
): PreviaEquipeVitrine {
  const unicos = new Map(
    profissionais.filter((p) => p.ativo && p.organizacaoId === organizacaoId).map((p) => [p.id, p]),
  );
  const ids = [...unicos.keys()].sort();
  const semente = JSON.stringify([organizacaoId, ids]);
  const ordenados = [...unicos.values()].sort(
    (a, b) =>
      calcularHash(`${semente}:${a.id}`) - calcularHash(`${semente}:${b.id}`) ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );

  return {
    total: unicos.size,
    avatares: ordenados.map(({ id, nomeCompleto, urlFotoPerfil, pontoFocalFoto }) => ({
      id,
      nomeCompleto,
      ...(urlFotoPerfil ? { urlFotoPerfil } : {}),
      pontoFocalFoto,
    })),
  };
}
