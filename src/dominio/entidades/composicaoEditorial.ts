/**
 * As três composições editoriais oficiais do lançamento.
 * O antigo estilo Institucional independente foi descartado por sobreposição com o Imersivo.
 */
export type TipoComposicaoEditorial = "imersivo" | "retrato_editorial" | "galeria_editorial";

export type IdentificadorPaletaEditorial =
  | "noite_mineral"
  | "marfim_editorial"
  | "argila_quente"
  | "floresta_profunda"
  | "safira_corporativo"
  | "titanio_onix"
  | "linho_areia"
  | "terracota_nobre";

export type IdentificadorTipografiaEditorial =
  "classico_editorial" | "contemporaneo_minimalista" | "galeria_arquitetonica";

export interface DescritorComposicaoEditorial {
  readonly codigo: TipoComposicaoEditorial;
  readonly nome: string;
  readonly resumoParaCliente: string;
  readonly segmentosRecomendados: readonly string[];
  readonly oculta?: boolean;
}

export interface DescritorPaletaEditorial {
  readonly codigo: IdentificadorPaletaEditorial;
  readonly nome: string;
  readonly corFundoPrincipal: string;
  readonly corSuperficie: string;
  readonly corTextoPrincipal: string;
  readonly corTextoSecundario: string;
  readonly corDestaque: string;
  readonly corBorda: string;
  readonly corCtaFundo: string;
  readonly corCtaTexto: string;
  readonly corSecundarioFundo: string;
  readonly corSecundarioTexto: string;
  readonly corBrilhoBorda?: string;
  readonly temaEscuro: boolean;
}

export interface CustomizacaoTokensEditorial {
  readonly corFundoPrincipal?: string;
  readonly corSuperficie?: string;
  readonly corTextoPrincipal?: string;
  readonly corTextoSecundario?: string;
  readonly corDestaque?: string;
  readonly corBorda?: string;
  readonly corCtaFundo?: string;
  readonly corCtaTexto?: string;
  readonly corSecundarioFundo?: string;
  readonly corSecundarioTexto?: string;
  readonly corBrilhoBorda?: string;
}

export interface DescritorTipografiaEditorial {
  readonly codigo: IdentificadorTipografiaEditorial;
  readonly nome: string;
  readonly descricao: string;
  readonly classeTitulo: string;
  readonly classeCorpo: string;
}

export const CATALOGO_COMPOSICOES_EDITORIAIS: Readonly<
  Record<TipoComposicaoEditorial, DescritorComposicaoEditorial>
> = {
  imersivo: {
    codigo: "imersivo",
    nome: "Imersivo",
    resumoParaCliente:
      "Fotografia ou vídeo ocupando toda a tela, com título expressivo e ações discretas.",
    segmentosRecomendados: [
      "Arquitetura",
      "Imobiliárias",
      "Hotelaria",
      "Concessionárias",
      "Fotografia",
    ],
  },
  retrato_editorial: {
    codigo: "retrato_editorial",
    nome: "Retrato Editorial",
    oculta: true,
    resumoParaCliente:
      "Você como protagonista, preservando o enquadramento do retrato e sua especialidade.",
    segmentosRecomendados: ["Advogados", "Médicos", "Dentistas", "Consultores", "Corretores"],
  },
  galeria_editorial: {
    codigo: "galeria_editorial",
    nome: "Galeria Editorial",
    oculta: true,
    resumoParaCliente:
      "Apresentação inspirada em exposições para destacar obras, projetos e séries visuais.",
    segmentosRecomendados: [
      "Estúdios de Arquitetura",
      "Fotógrafos",
      "Designers",
      "Organizadores de Eventos",
    ],
  },
};

export function obterComposicoesEditoriaisAtivas(): readonly DescritorComposicaoEditorial[] {
  return Object.values(CATALOGO_COMPOSICOES_EDITORIAIS).filter((composicao) => !composicao.oculta);
}

export const CATALOGO_PALETAS_EDITORIAIS: Readonly<
  Record<IdentificadorPaletaEditorial, DescritorPaletaEditorial>
> = {
  noite_mineral: {
    codigo: "noite_mineral",
    nome: "Noite Mineral",
    corFundoPrincipal: "#0f1110",
    corSuperficie: "#191c1a",
    corTextoPrincipal: "#f5f2eb",
    corTextoSecundario: "#b8b3a8",
    corDestaque: "#d9c8a9",
    corBorda: "rgba(255, 255, 255, 0.15)",
    corCtaFundo: "#f5f2eb",
    corCtaTexto: "#0f1110",
    corSecundarioFundo: "rgba(0, 0, 0, 0.4)",
    corSecundarioTexto: "#f5f2eb",
    temaEscuro: true,
  },
  marfim_editorial: {
    codigo: "marfim_editorial",
    nome: "Marfim Editorial",
    corFundoPrincipal: "#f7f4ee",
    corSuperficie: "#efeae0",
    corTextoPrincipal: "#181715",
    corTextoSecundario: "#57534d",
    corDestaque: "#2b2925",
    corBorda: "rgba(0, 0, 0, 0.12)",
    corCtaFundo: "#181715",
    corCtaTexto: "#f7f4ee",
    corSecundarioFundo: "rgba(255, 255, 255, 0.7)",
    corSecundarioTexto: "#181715",
    temaEscuro: false,
  },
  argila_quente: {
    codigo: "argila_quente",
    nome: "Argila Quente",
    corFundoPrincipal: "#1f1815",
    corSuperficie: "#2c221e",
    corTextoPrincipal: "#f8f1ec",
    corTextoSecundario: "#cab9ad",
    corDestaque: "#e0b094",
    corBorda: "rgba(255, 255, 255, 0.15)",
    corCtaFundo: "#e0b094",
    corCtaTexto: "#1f1815",
    corSecundarioFundo: "rgba(0, 0, 0, 0.4)",
    corSecundarioTexto: "#f8f1ec",
    temaEscuro: true,
  },
  floresta_profunda: {
    codigo: "floresta_profunda",
    nome: "Floresta Profunda",
    corFundoPrincipal: "#0e1714",
    corSuperficie: "#16241f",
    corTextoPrincipal: "#f1f5f2",
    corTextoSecundario: "#a8b8af",
    corDestaque: "#c4d7cb",
    corBorda: "rgba(255, 255, 255, 0.15)",
    corCtaFundo: "#c4d7cb",
    corCtaTexto: "#0e1714",
    corSecundarioFundo: "rgba(0, 0, 0, 0.4)",
    corSecundarioTexto: "#f1f5f2",
    temaEscuro: true,
  },
  safira_corporativo: {
    codigo: "safira_corporativo",
    nome: "Safira Corporativo",
    corFundoPrincipal: "#0b1320",
    corSuperficie: "#131f33",
    corTextoPrincipal: "#f1f5f9",
    corTextoSecundario: "#94a3b8",
    corDestaque: "#60a5fa",
    corBorda: "rgba(255, 255, 255, 0.15)",
    corCtaFundo: "#60a5fa",
    corCtaTexto: "#0b1320",
    corSecundarioFundo: "rgba(0, 0, 0, 0.4)",
    corSecundarioTexto: "#f1f5f9",
    temaEscuro: true,
  },
  titanio_onix: {
    codigo: "titanio_onix",
    nome: "Titânio & Ônix",
    corFundoPrincipal: "#121417",
    corSuperficie: "#1c2024",
    corTextoPrincipal: "#f3f4f6",
    corTextoSecundario: "#9ca3af",
    corDestaque: "#f59e0b",
    corBorda: "rgba(255, 255, 255, 0.15)",
    corCtaFundo: "#f59e0b",
    corCtaTexto: "#121417",
    corSecundarioFundo: "rgba(0, 0, 0, 0.4)",
    corSecundarioTexto: "#f3f4f6",
    temaEscuro: true,
  },
  linho_areia: {
    codigo: "linho_areia",
    nome: "Linho & Areia",
    corFundoPrincipal: "#f9f8f5",
    corSuperficie: "#f1eee7",
    corTextoPrincipal: "#1c1917",
    corTextoSecundario: "#57534e",
    corDestaque: "#78350f",
    corBorda: "rgba(0, 0, 0, 0.12)",
    corCtaFundo: "#78350f",
    corCtaTexto: "#f9f8f5",
    corSecundarioFundo: "rgba(255, 255, 255, 0.7)",
    corSecundarioTexto: "#1c1917",
    temaEscuro: false,
  },
  terracota_nobre: {
    codigo: "terracota_nobre",
    nome: "Terracota Nobre",
    corFundoPrincipal: "#1c1412",
    corSuperficie: "#291d1a",
    corTextoPrincipal: "#faf5f0",
    corTextoSecundario: "#c7b7ab",
    corDestaque: "#ea580c",
    corBorda: "rgba(255, 255, 255, 0.15)",
    corCtaFundo: "#ea580c",
    corCtaTexto: "#faf5f0",
    corSecundarioFundo: "rgba(0, 0, 0, 0.4)",
    corSecundarioTexto: "#faf5f0",
    temaEscuro: true,
  },
};

export const CATALOGO_TIPOGRAFIAS_EDITORIAIS: Readonly<
  Record<IdentificadorTipografiaEditorial, DescritorTipografiaEditorial>
> = {
  classico_editorial: {
    codigo: "classico_editorial",
    nome: "Executivo Corporativo",
    descricao:
      "Design sóbrio, imponente e moderno, ideal para bancas de advocacia e consultorias corporativas.",
    classeTitulo: "font-interface font-bold tracking-tight",
    classeCorpo: "font-interface",
  },
  contemporaneo_minimalista: {
    codigo: "contemporaneo_minimalista",
    nome: "Impacto Moderno (Sans)",
    descricao:
      "Tipografia geométrica de alta legibilidade e peso marcante para concessionárias e empresas comerciais.",
    classeTitulo: "font-interface font-extrabold tracking-tight",
    classeCorpo: "font-interface",
  },
  galeria_arquitetonica: {
    codigo: "galeria_arquitetonica",
    nome: "Estúdio & Arquitetura",
    descricao:
      "Elegância minimalista contemporânea com proporções precisas para iluminação, design e interiores.",
    classeTitulo: "font-interface font-light tracking-wide uppercase",
    classeCorpo: "font-interface",
  },
};
