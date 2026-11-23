export const FAIXAS_INICIO_EXPERIENCIAS = ["alto", "centro", "baixo", "extra_baixo"] as const;

export type FaixaInicioExperiencias = (typeof FAIXAS_INICIO_EXPERIENCIAS)[number];

export const FAIXA_INICIO_EXPERIENCIAS_PADRAO: FaixaInicioExperiencias = "baixo";

export const POSICOES_CABECALHO_MARCA = ["topo", "acima_experiencias"] as const;

export type PosicaoCabecalhoMarca = (typeof POSICOES_CABECALHO_MARCA)[number];

export const POSICAO_CABECALHO_MARCA_PADRAO: PosicaoCabecalhoMarca = "topo";

export interface DescritorPosicaoCabecalhoMarca {
  readonly codigo: PosicaoCabecalhoMarca;
  readonly nome: string;
  readonly resumo: string;
}

export const CATALOGO_POSICOES_CABECALHO_MARCA: Readonly<
  Record<PosicaoCabecalhoMarca, DescritorPosicaoCabecalhoMarca>
> = {
  topo: {
    codigo: "topo",
    nome: "Fixa no topo",
    resumo: "Reserva o espaço superior da tela para logo, nome e subtítulo.",
  },
  acima_experiencias: {
    codigo: "acima_experiencias",
    nome: "Acima das experiências",
    resumo: "Libera o topo para a foto ou vídeo e posiciona a marca logo acima dos blocos.",
  },
};

export const LISTA_POSICOES_CABECALHO_MARCA: readonly DescritorPosicaoCabecalhoMarca[] =
  POSICOES_CABECALHO_MARCA.map((codigo) => CATALOGO_POSICOES_CABECALHO_MARCA[codigo]);

export interface DescritorFaixaInicioExperiencias {
  readonly codigo: FaixaInicioExperiencias;
  readonly nome: string;
  readonly resumo: string;
  readonly classeRespiroViewport: string;
  readonly classeRespiroPrevia: string;
  readonly classeRespiroSemMarcaTopoViewport: string;
  readonly classeRespiroSemMarcaTopoPrevia: string;
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
    classeRespiroSemMarcaTopoViewport: "pt-10 @5xl:pt-0",
    classeRespiroSemMarcaTopoPrevia: "pt-10 @5xl:pt-0",
    classeAlinhamentoDesktop: "@5xl:content-start",
    classePreviaAlinhamento: "justify-start",
  },
  centro: {
    codigo: "centro",
    nome: "Centro",
    resumo: "Equilíbrio entre a mídia de fundo e o início dos botões e conteúdos.",
    classeRespiroViewport: "pt-[clamp(4rem,18svh,11rem)] @5xl:pt-0",
    classeRespiroPrevia: "pt-28 @5xl:pt-0",
    classeRespiroSemMarcaTopoViewport: "pt-[clamp(6rem,24svh,14rem)] @5xl:pt-0",
    classeRespiroSemMarcaTopoPrevia: "pt-40 @5xl:pt-0",
    classeAlinhamentoDesktop: "@5xl:content-center",
    classePreviaAlinhamento: "justify-center",
  },
  baixo: {
    codigo: "baixo",
    nome: "Baixo",
    resumo: "Valoriza a foto ou vídeo na primeira dobra e inicia os blocos mais abaixo.",
    classeRespiroViewport: "pt-[clamp(9rem,34svh,20rem)] @5xl:pt-0",
    classeRespiroPrevia: "pt-56 @5xl:pt-0",
    classeRespiroSemMarcaTopoViewport: "pt-[clamp(11rem,42svh,24rem)] @5xl:pt-0",
    classeRespiroSemMarcaTopoPrevia: "pt-72 @5xl:pt-0",
    classeAlinhamentoDesktop: "@5xl:content-end",
    classePreviaAlinhamento: "justify-end pb-1.5",
  },
  extra_baixo: {
    codigo: "extra_baixo",
    nome: "Extra baixo",
    resumo: "Destaca ao máximo a foto ou vídeo na abertura e posiciona os blocos no rodapé da tela.",
    classeRespiroViewport: "pt-[clamp(14rem,52svh,30rem)] @5xl:pt-0",
    classeRespiroPrevia: "pt-80 @5xl:pt-0",
    classeRespiroSemMarcaTopoViewport: "pt-[clamp(17rem,62svh,36rem)] @5xl:pt-0",
    classeRespiroSemMarcaTopoPrevia: "pt-96 @5xl:pt-0",
    classeAlinhamentoDesktop: "@5xl:content-end",
    classePreviaAlinhamento: "justify-end pb-0",
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

export function ehPosicaoCabecalhoMarcaValida(valor: unknown): valor is PosicaoCabecalhoMarca {
  return (
    typeof valor === "string" &&
    (POSICOES_CABECALHO_MARCA as readonly string[]).includes(valor)
  );
}

export function resolverPosicaoCabecalhoMarca(
  valor?: PosicaoCabecalhoMarca,
): PosicaoCabecalhoMarca {
  return ehPosicaoCabecalhoMarcaValida(valor) ? valor : POSICAO_CABECALHO_MARCA_PADRAO;
}

export function obterDescritorFaixaInicioExperiencias(
  valor?: FaixaInicioExperiencias,
): DescritorFaixaInicioExperiencias {
  return CATALOGO_FAIXAS_INICIO_EXPERIENCIAS[resolverFaixaInicioExperiencias(valor)];
}

export function obterClasseRespiroAberturaExperiencias(
  valor: FaixaInicioExperiencias | undefined,
  opcoes?: {
    readonly alturaContidaPrevia?: boolean;
    readonly marcaNoTopo?: boolean;
  },
): string {
  const descritor = obterDescritorFaixaInicioExperiencias(valor);
  const marcaNoTopo = opcoes?.marcaNoTopo ?? true;

  if (!marcaNoTopo) {
    return opcoes?.alturaContidaPrevia
      ? descritor.classeRespiroSemMarcaTopoPrevia
      : descritor.classeRespiroSemMarcaTopoViewport;
  }

  return opcoes?.alturaContidaPrevia
    ? descritor.classeRespiroPrevia
    : descritor.classeRespiroViewport;
}
