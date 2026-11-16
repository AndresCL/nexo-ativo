export type DirecaoDegradadoEditorial =
  | "esquerda_direita"
  | "direita_esquerda"
  | "cima_baixo"
  | "baixo_cima"
  | "diagonal_superior_esquerda"
  | "diagonal_superior_direita"
  | "diagonal_inferior_esquerda"
  | "diagonal_inferior_direita";

export interface ConfiguracaoDegradadoEditorial {
  readonly corInicial: string;
  readonly corFinal: string;
  readonly direcao?: DirecaoDegradadoEditorial;
  readonly anguloGraus?: number;
}

export const DEGRADADO_EDITORIAL_PADRAO: ConfiguracaoDegradadoEditorial = {
  corInicial: "#0f172a",
  corFinal: "#312e81",
  anguloGraus: 135,
};

export const OPCOES_DIRECAO_DEGRADADO: readonly {
  readonly valor: DirecaoDegradadoEditorial;
  readonly rotulo: string;
  readonly css: string;
}[] = [
  { valor: "esquerda_direita", rotulo: "Esquerda → Direita", css: "to right" },
  { valor: "direita_esquerda", rotulo: "Direita → Esquerda", css: "to left" },
  { valor: "cima_baixo", rotulo: "Acima → Abaixo", css: "to bottom" },
  { valor: "baixo_cima", rotulo: "Abaixo → Acima", css: "to top" },
  { valor: "diagonal_superior_esquerda", rotulo: "Diagonal ↘", css: "to bottom right" },
  { valor: "diagonal_superior_direita", rotulo: "Diagonal ↙", css: "to bottom left" },
  { valor: "diagonal_inferior_esquerda", rotulo: "Diagonal ↗", css: "to top right" },
  { valor: "diagonal_inferior_direita", rotulo: "Diagonal ↖", css: "to top left" },
];

export function construirCssDegradadoEditorial(
  config?: Partial<ConfiguracaoDegradadoEditorial>,
): string {
  const corInicial = config?.corInicial || DEGRADADO_EDITORIAL_PADRAO.corInicial;
  const corFinal = config?.corFinal || DEGRADADO_EDITORIAL_PADRAO.corFinal;
  if (typeof config?.anguloGraus === "number") {
    return `linear-gradient(${config.anguloGraus}deg, ${corInicial}, ${corFinal})`;
  }
  const direcao = config?.direcao;
  const opcao = direcao ? OPCOES_DIRECAO_DEGRADADO.find((o) => o.valor === direcao) : undefined;
  const direcaoCss = opcao?.css ?? `${DEGRADADO_EDITORIAL_PADRAO.anguloGraus ?? 135}deg`;
  return `linear-gradient(${direcaoCss}, ${corInicial}, ${corFinal})`;
}

