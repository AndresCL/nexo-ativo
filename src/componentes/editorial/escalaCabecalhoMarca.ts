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
    classeLogoCirculo: "h-16 w-16 @xl:h-[4.5rem] @xl:w-[4.5rem]",
    sizesLogoCirculo: "(max-width: 640px) 64px, 72px",
    classeLogoLivreComTexto:
      "h-16 max-h-16 w-auto max-w-[170px] object-contain @xl:h-[4.5rem] @xl:max-h-[4.5rem] @xl:max-w-[270px]",
    classeLogoLivreSemTexto:
      "h-16 max-h-16 w-auto max-w-[230px] object-contain @xl:h-[4.5rem] @xl:max-h-[4.5rem] @xl:max-w-[340px]",
    larguraImagemLivre: 340,
    alturaImagemLivre: 76,
    classeDivisor: "h-9 @xl:h-10",
    classeTitulo: "text-xl @xl:text-2xl @5xl:text-[1.75rem]",
    classeSubtitulo: "text-xs @xl:text-[13px]",
  },
  grande: {
    codigo: "grande",
    classeGapContainer: "gap-4 @xl:gap-5",
    classeLogoCirculo: "h-20 w-20 @xl:h-24 @xl:w-24",
    sizesLogoCirculo: "(max-width: 640px) 80px, 96px",
    classeLogoLivreComTexto:
      "h-20 max-h-20 w-auto max-w-[190px] object-contain @xl:h-24 @xl:max-h-24 @xl:max-w-[310px]",
    classeLogoLivreSemTexto:
      "h-20 max-h-20 w-auto max-w-[280px] object-contain @xl:h-24 @xl:max-h-24 @xl:max-w-[420px]",
    larguraImagemLivre: 420,
    alturaImagemLivre: 104,
    classeDivisor: "h-12 @xl:h-14",
    classeTitulo: "text-2xl @xl:text-3xl @5xl:text-[2.25rem]",
    classeSubtitulo: "text-[13px] @xl:text-sm",
  },
  extra_grande: {
    codigo: "extra_grande",
    classeGapContainer: "gap-4 @xl:gap-6",
    classeLogoCirculo: "h-[6.5rem] w-[6.5rem] @xl:h-[7.5rem] @xl:w-[7.5rem]",
    sizesLogoCirculo: "(max-width: 640px) 104px, 120px",
    classeLogoLivreComTexto:
      "h-[6.5rem] max-h-[6.5rem] w-auto max-w-[220px] object-contain @xl:h-[7.5rem] @xl:max-h-[7.5rem] @xl:max-w-[360px]",
    classeLogoLivreSemTexto:
      "h-[6.5rem] max-h-[6.5rem] w-auto max-w-[320px] object-contain @xl:h-[7.5rem] @xl:max-h-[7.5rem] @xl:max-w-[500px]",
    larguraImagemLivre: 500,
    alturaImagemLivre: 128,
    classeDivisor: "h-14 @xl:h-16",
    classeTitulo: "text-3xl @xl:text-4xl @5xl:text-[2.75rem]",
    classeSubtitulo: "text-sm @xl:text-base",
  },
};

export function obterEscalaVisualCabecalhoMarca(
  valor?: TamanhoCabecalhoMarca,
): EscalaVisualCabecalhoMarca {
  return ESCALAS_VISUAIS_CABECALHO_MARCA[resolverTamanhoCabecalhoMarca(valor)];
}

