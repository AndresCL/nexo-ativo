export const VALORES_ANIMACAO_DESTAQUE = [
  "nenhuma",
  "brilho_interior",
  "halo_pulsante",
] as const;

export type AnimacaoDestaque = (typeof VALORES_ANIMACAO_DESTAQUE)[number];

export interface OpcaoAnimacaoDestaque {
  readonly valor: AnimacaoDestaque;
  readonly rotulo: string;
}

export const OPCOES_ANIMACAO_DESTAQUE: readonly OpcaoAnimacaoDestaque[] = [
  { valor: "nenhuma", rotulo: "Sem animação" },
  { valor: "brilho_interior", rotulo: "Brilho interior" },
  { valor: "halo_pulsante", rotulo: "Halo pulsante" },
];

const CLASSES_ANIMACAO_DESTAQUE: Readonly<Record<AnimacaoDestaque, string | undefined>> = {
  nenhuma: undefined,
  brilho_interior: "efeito-brilho-interior",
  halo_pulsante: "efeito-halo-pulsante",
};

export function resolverAnimacaoDestaque(
  animacaoDestaque?: AnimacaoDestaque,
  animarBordaDestaqueLegado?: boolean,
): AnimacaoDestaque {
  if (animacaoDestaque) {
    return animacaoDestaque;
  }
  return animarBordaDestaqueLegado ? "brilho_interior" : "nenhuma";
}

export function obterClasseAnimacaoDestaque(animacao: AnimacaoDestaque): string | undefined {
  return CLASSES_ANIMACAO_DESTAQUE[animacao];
}

