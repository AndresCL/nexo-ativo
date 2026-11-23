export const TAMANHOS_REDES_SOCIAIS = ["pequeno", "medio", "grande"] as const;

export type TamanhoRedesSociais = (typeof TAMANHOS_REDES_SOCIAIS)[number];

export const TAMANHO_REDES_SOCIAIS_PADRAO: TamanhoRedesSociais = "pequeno";

export interface DescritorTamanhoRedesSociais {
  readonly codigo: TamanhoRedesSociais;
  readonly nome: string;
}

export const CATALOGO_TAMANHOS_REDES_SOCIAIS: Readonly<
  Record<TamanhoRedesSociais, DescritorTamanhoRedesSociais>
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
};

export const LISTA_TAMANHOS_REDES_SOCIAIS: readonly DescritorTamanhoRedesSociais[] =
  TAMANHOS_REDES_SOCIAIS.map((codigo) => CATALOGO_TAMANHOS_REDES_SOCIAIS[codigo]);

export function ehTamanhoRedesSociaisValido(valor: unknown): valor is TamanhoRedesSociais {
  return (
    typeof valor === "string" &&
    (TAMANHOS_REDES_SOCIAIS as readonly string[]).includes(valor)
  );
}

export function resolverTamanhoRedesSociais(valor?: TamanhoRedesSociais): TamanhoRedesSociais {
  return ehTamanhoRedesSociaisValido(valor) ? valor : TAMANHO_REDES_SOCIAIS_PADRAO;
}
