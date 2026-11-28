export const NIVEIS_DESTAQUE_VITRINE = ["primario", "secundario", "terciario"] as const;

export type NivelDestaqueVitrine = (typeof NIVEIS_DESTAQUE_VITRINE)[number];

export type ValorExibicaoDestaqueExperiencia = "oculta" | NivelDestaqueVitrine;

export interface OpcaoExibicaoDestaqueExperiencia {
  readonly valor: ValorExibicaoDestaqueExperiencia;
  readonly rotulo: string;
}

export const OPCOES_EXIBICAO_DESTAQUE_EXPERIENCIA: readonly OpcaoExibicaoDestaqueExperiencia[] = [
  { valor: "oculta", rotulo: "Oculta" },
  { valor: "terciario", rotulo: "Visível (Padrão)" },
  { valor: "primario", rotulo: "Destaque primário" },
  { valor: "secundario", rotulo: "Destaque secundário" },
];

/**
 * Resolve o nível de destaque de forma retrocompatível com o campo legado booleano.
 */
export function resolverNivelDestaqueVitrine(
  nivelDestaque?: NivelDestaqueVitrine | null,
  destaquePrimarioLegado?: boolean | null,
): NivelDestaqueVitrine {
  if (
    nivelDestaque === "primario" ||
    nivelDestaque === "secundario" ||
    nivelDestaque === "terciario"
  ) {
    return nivelDestaque;
  }
  return destaquePrimarioLegado === true ? "primario" : "terciario";
}

export function resolverValorExibicaoDestaque(
  ativo: boolean,
  nivelDestaque?: NivelDestaqueVitrine | null,
  destaquePrimarioLegado?: boolean | null,
): ValorExibicaoDestaqueExperiencia {
  if (!ativo) return "oculta";
  return resolverNivelDestaqueVitrine(nivelDestaque, destaquePrimarioLegado);
}

export function ehDestaqueVisualVitrine(nivel: NivelDestaqueVitrine): boolean {
  return nivel === "primario" || nivel === "secundario";
}

