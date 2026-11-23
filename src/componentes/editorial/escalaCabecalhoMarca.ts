import {
  resolverTamanhoCabecalhoMarca,
  type TamanhoCabecalhoMarca,
} from "@/dominio/editorial/tamanhoCabecalhoMarca";

export interface EscalaVisualCabecalhoMarca {
  readonly codigo: TamanhoCabecalhoMarca;
  readonly classeGapContainer: string;
  readonly classeLogoCirculo: string;
  readonly sizesLogoCirculo: string;
  readonly classeLogoLivreComTexto: string;
  readonly classeLogoLivreSemTexto: string;
  readonly larguraImagemLivre: number;
  readonly alturaImagemLivre: number;
  readonly classeDivisor: string;
  readonly classeTitulo: string;
  readonly classeSubtitulo: string;
}

const ESCALAS_VISUAIS_CABECALHO_MARCA: Readonly<
  Record<TamanhoCabecalhoMarca, EscalaVisualCabecalhoMarca>
> = {
  pequeno: {
    codigo: "pequeno",
    classeGapContainer: "gap-3",
    classeLogoCirculo: "h-12 w-12 @xl:h-14 @xl:w-14",
    sizesLogoCirculo: "(max-width: 640px) 48px, 56px",
    classeLogoLivreComTexto:
      "h-12 max-h-14 w-auto max-w-[140px] object-contain @xl:max-w-[255px]",
    classeLogoLivreSemTexto:
      "h-12 max-h-14 w-auto max-w-[140px] object-contain @xl:max-w-[255px]",
    larguraImagemLivre: 255,
    alturaImagemLivre: 58,
    classeDivisor: "h-6 @xl:h-7",
    classeTitulo: "text-base @xl:text-lg @5xl:text-xl",
    classeSubtitulo: "text-[10px] @xl:text-[11px]",
  },
  medio: {
    codigo: "medio",
    classeGapContainer: "gap-3.5",
    classeLogoCirculo: "h-14 w-14 @xl:h-16 @xl:w-16",
    sizesLogoCirculo: "(max-width: 640px) 56px, 64px",
    classeLogoLivreComTexto:
      "h-14 max-h-14 w-auto max-w-[150px] object-contain @xl:h-16 @xl:max-h-16 @xl:max-w-[240px]",
    classeLogoLivreSemTexto:
      "h-14 max-h-14 w-auto max-w-[200px] object-contain @xl:h-16 @xl:max-h-16 @xl:max-w-[300px]",
    larguraImagemLivre: 300,
    alturaImagemLivre: 72,
    classeDivisor: "h-8 @xl:h-9",
    classeTitulo: "text-lg @xl:text-xl @5xl:text-2xl",
    classeSubtitulo: "text-[11px] @xl:text-xs",
  },
  grande: {
    codigo: "grande",
    classeGapContainer: "gap-4",
    classeLogoCirculo: "h-16 w-16 @xl:h-20 @xl:w-20",
    sizesLogoCirculo: "(max-width: 640px) 64px, 80px",
    classeLogoLivreComTexto:
      "h-16 max-h-16 w-auto max-w-[160px] object-contain @xl:h-20 @xl:max-h-20 @xl:max-w-[270px]",
    classeLogoLivreSemTexto:
      "h-16 max-h-16 w-auto max-w-[240px] object-contain @xl:h-20 @xl:max-h-20 @xl:max-w-[360px]",
    larguraImagemLivre: 360,
    alturaImagemLivre: 88,
    classeDivisor: "h-10 @xl:h-11",
    classeTitulo: "text-xl @xl:text-2xl @5xl:text-3xl",
    classeSubtitulo: "text-xs @xl:text-[13px]",
  },
  extra_grande: {
    codigo: "extra_grande",
    classeGapContainer: "gap-4 @xl:gap-5",
    classeLogoCirculo: "h-20 w-20 @xl:h-24 @xl:w-24",
    sizesLogoCirculo: "(max-width: 640px) 80px, 96px",
    classeLogoLivreComTexto:
      "h-20 max-h-20 w-auto max-w-[175px] object-contain @xl:h-24 @xl:max-h-24 @xl:max-w-[300px]",
    classeLogoLivreSemTexto:
      "h-20 max-h-20 w-auto max-w-[280px] object-contain @xl:h-24 @xl:max-h-24 @xl:max-w-[420px]",
    larguraImagemLivre: 420,
    alturaImagemLivre: 104,
    classeDivisor: "h-12 @xl:h-14",
    classeTitulo: "text-2xl @xl:text-3xl @5xl:text-[2.25rem]",
    classeSubtitulo: "text-[13px] @xl:text-sm",
  },
};

export function obterEscalaVisualCabecalhoMarca(
  valor?: TamanhoCabecalhoMarca,
): EscalaVisualCabecalhoMarca {
  return ESCALAS_VISUAIS_CABECALHO_MARCA[resolverTamanhoCabecalhoMarca(valor)];
}

