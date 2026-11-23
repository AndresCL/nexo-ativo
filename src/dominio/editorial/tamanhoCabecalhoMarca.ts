export const TAMANHOS_CABECALHO_MARCA = [
  "pequeno",
  "medio",
  "grande",
  "extra_grande",
] as const;

export type TamanhoCabecalhoMarca = (typeof TAMANHOS_CABECALHO_MARCA)[number];

export const TAMANHO_CABECALHO_MARCA_PADRAO: TamanhoCabecalhoMarca = "pequeno";

export interface DescritorTamanhoCabecalhoMarca {
  readonly codigo: TamanhoCabecalhoMarca;
  readonly nome: string;
}

export const CATALOGO_TAMANHOS_CABECALHO_MARCA: Readonly<
  Record<TamanhoCabecalhoMarca, DescritorTamanhoCabecalhoMarca>
> = {
  pequeno: {
    codigo: "pequeno",
    nome: "Pequeno",
  },
  medio: {
    codigo: "medio",
    nome: "Médio",
  },
  grande: {
    codigo: "grande",
    nome: "Grande",
  },
  extra_grande: {
    codigo: "extra_grande",
    nome: "Extra grande",
  },
};

export const LISTA_TAMANHOS_CABECALHO_MARCA: readonly DescritorTamanhoCabecalhoMarca[] =
  TAMANHOS_CABECALHO_MARCA.map((codigo) => CATALOGO_TAMANHOS_CABECALHO_MARCA[codigo]);

export function ehTamanhoCabecalhoMarcaValido(valor: unknown): valor is TamanhoCabecalhoMarca {
  return (
    typeof valor === "string" &&
    (TAMANHOS_CABECALHO_MARCA as readonly string[]).includes(valor)
  );
}

export function resolverTamanhoCabecalhoMarca(
  valor?: TamanhoCabecalhoMarca,
): TamanhoCabecalhoMarca {
  return ehTamanhoCabecalhoMarcaValido(valor) ? valor : TAMANHO_CABECALHO_MARCA_PADRAO;
}

