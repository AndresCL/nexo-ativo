export type ModalidadeCalculoComercial =
  | "sem_calculo"
  | "valor_fixo"
  | "base_mais_adicionais"
  | "quantidade_vezes_preco"
  | "faixa_configurada";

export const DESCRITORES_MODALIDADES_CALCULO_COMERCIAL: Readonly<
  Record<
    ModalidadeCalculoComercial,
    {
      readonly nome: string;
      readonly descricao: string;
    }
  >
> = {
  sem_calculo: {
    nome: "Sem cálculo de valor no fluxo",
    descricao: "Conduz o visitante sem exibir estimativa financeira durante as etapas.",
  },
  valor_fixo: {
    nome: "Valor fixo",
    descricao:
      "Exibe um valor fechado em reais (do item selecionado no catálogo ou valor base configurado).",
  },
  base_mais_adicionais: {
    nome: "Valor base + adicionais selecionados",
    descricao:
      "Soma o valor base às frentes ou opções adicionais escolhidas pelo visitante no percurso.",
  },
  quantidade_vezes_preco: {
    nome: "Quantidade × preço unitário",
    descricao:
      "Permite ao visitante informar a quantidade inteira (unidades, diárias, m²) e multiplica pelo preço unitário em centavos.",
  },
  faixa_configurada: {
    nome: "Faixa estimada configurada",
    descricao:
      "Apresenta um intervalo claro entre valor mínimo e valor máximo estimado para o escopo.",
  },
};

export interface RegraCalculoComercialMicrofluxo {
  readonly modalidade: ModalidadeCalculoComercial;
  readonly rotuloBase?: string;
  readonly valorBaseCentavos?: number;
  readonly minimoFaixaCentavos?: number;
  readonly maximoFaixaCentavos?: number;
  readonly unidadeQuantidade?: string;
  readonly quantidadeMinima?: number;
  readonly quantidadeMaxima?: number;
  readonly observacaoTransparencia?: string;
}

export interface LinhaDemonstrativoCalculoComercial {
  readonly id: string;
  readonly rotulo: string;
  readonly quantidade: number;
  readonly valorUnitarioCentavos: number;
  readonly subtotalCentavos: number;
}

export interface DemonstrativoCalculoComercialImutavel {
  readonly modalidade: Exclude<ModalidadeCalculoComercial, "sem_calculo">;
  readonly moeda: "BRL";
  readonly linhas: readonly LinhaDemonstrativoCalculoComercial[];
  readonly totalCentavos?: number;
  readonly minimoCentavos?: number;
  readonly maximoCentavos?: number;
  readonly resumoFormatado: string;
  readonly observacaoTransparencia?: string;
  readonly versaoMicrofluxo: number | null;
  readonly calculadoEmIso: string;
}
