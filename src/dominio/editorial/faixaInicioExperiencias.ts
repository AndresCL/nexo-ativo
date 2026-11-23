export const FAIXAS_INICIO_EXPERIENCIAS = ["alto", "centro", "baixo"] as const;

export type FaixaInicioExperiencias = (typeof FAIXAS_INICIO_EXPERIENCIAS)[number];

export const FAIXA_INICIO_EXPERIENCIAS_PADRAO: FaixaInicioExperiencias = "baixo";

export interface DescritorFaixaInicioExperiencias {
  readonly codigo: FaixaInicioExperiencias;
  readonly nome: string;
  readonly resumo: string;
  readonly classeRespiroViewport: string;
  readonly classeRespiroPrevia: string;
  readonly classeAlinhamentoDesktop: string;
  readonly classePreviaAlinhamento: string;
}

export const CATALOGO_FAIXAS_INICIO_EXPERIENCIAS: Readonly<
  Record<FaixaInicioExperiencias, DescritorFaixaInicioExperiencias>
> = {
  alto: {
    codigo: "alto",
    nome: "Alto",
    resumo: "Começa logo abaixo da área da marca. Ideal para vitrines com muitos blocos.",
    classeRespiroViewport: "pt-0",
    classeRespiroPrevia: "pt-0",
    classeAlinhamentoDesktop: "@5xl:content-start",
    classePreviaAlinhamento: "justify-start",
  },
  centro: {
    codigo: "centro",
    nome: "Centro",
    resumo: "Equilíbrio entre a mídia de fundo e o início dos botões e conteúdos.",
    classeRespiroViewport: "pt-[clamp(4rem,18svh,11rem)] @5xl:pt-0",
    classeRespiroPrevia: "pt-28 @5xl:pt-0",
    classeAlinhamentoDesktop: "@5xl:content-center",
    classePreviaAlinhamento: "justify-center",
  },
  baixo: {
    codigo: "baixo",
    nome: "Baixo",
    resumo: "Valoriza a foto ou vídeo na primeira dobra e inicia os blocos mais abaixo.",
    classeRespiroViewport: "pt-[clamp(9rem,34svh,20rem)] @5xl:pt-0",
    classeRespiroPrevia: "pt-56 @5xl:pt-0",
    classeAlinhamentoDesktop: "@5xl:content-end",
    classePreviaAlinhamento: "justify-end",
  },
};

export const LISTA_FAIXAS_INICIO_EXPERIENCIAS: readonly DescritorFaixaInicioExperiencias[] =
  FAIXAS_INICIO_EXPERIENCIAS.map((codigo) => CATALOGO_FAIXAS_INICIO_EXPERIENCIAS[codigo]);

export function ehFaixaInicioExperienciasValida(
  valor: unknown,
): valor is FaixaInicioExperiencias {
  return (
    typeof valor === "string" &&
    (FAIXAS_INICIO_EXPERIENCIAS as readonly string[]).includes(valor)
  );
}

export function resolverFaixaInicioExperiencias(
  valor?: FaixaInicioExperiencias,
): FaixaInicioExperiencias {
  return ehFaixaInicioExperienciasValida(valor) ? valor : FAIXA_INICIO_EXPERIENCIAS_PADRAO;
}

export function obterDescritorFaixaInicioExperiencias(
  valor?: FaixaInicioExperiencias,
): DescritorFaixaInicioExperiencias {
  return CATALOGO_FAIXAS_INICIO_EXPERIENCIAS[resolverFaixaInicioExperiencias(valor)];
}

export function obterClasseRespiroAberturaExperiencias(
  valor: FaixaInicioExperiencias | undefined,
  opcoes?: { readonly alturaContidaPrevia?: boolean },
): string {
  const descritor = obterDescritorFaixaInicioExperiencias(valor);
  return opcoes?.alturaContidaPrevia
    ? descritor.classeRespiroPrevia
    : descritor.classeRespiroViewport;
}

