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

export type ModoFundoEquipeEditorial = "transparente" | "fixo";

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
  readonly corLogoTitulo: string;
  readonly corLogoSubtitulo: string;
  readonly corEquipeTextoPrincipal: string;
  readonly corEquipeTextoSecundario: string;
  readonly corBottomSheetFundo: string;
  readonly corBottomSheetSuperficie: string;
  readonly corBottomSheetBorda: string;
  readonly corBottomSheetTextoPrincipal: string;
  readonly corBottomSheetTextoSecundario: string;
  readonly corBottomSheetDestaque: string;
  readonly corBottomSheetCtaFundo: string;
  readonly corBottomSheetCtaTexto: string;
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
  readonly corCtaBorda?: string;
  readonly corDestaqueSecundarioFundo?: string;
  readonly corDestaqueSecundarioTexto?: string;
  readonly corDestaqueSecundarioBorda?: string;
  readonly corSecundarioFundo?: string;
  readonly corSecundarioTexto?: string;
  readonly corLogoTitulo?: string;
  readonly corLogoSubtitulo?: string;
  readonly modoFundoEquipe?: ModoFundoEquipeEditorial;
  readonly corEquipeTextoPrincipal?: string;
  readonly corEquipeTextoSecundario?: string;
  readonly corBottomSheetFundo?: string;
  readonly corBottomSheetSuperficie?: string;
  readonly corBottomSheetBorda?: string;
  readonly corBottomSheetTextoPrincipal?: string;
  readonly corBottomSheetTextoSecundario?: string;
  readonly corBottomSheetDestaque?: string;
  readonly corBottomSheetCtaFundo?: string;
  readonly corBottomSheetCtaTexto?: string;
  readonly corBottomSheetFecharFundo?: string;
  readonly corBottomSheetFecharTexto?: string;
  readonly corCatalogoFundo?: string;
  readonly corCatalogoSuperficie?: string;
  readonly corCatalogoBorda?: string;
  readonly corCatalogoTextoPrincipal?: string;
  readonly corCatalogoTextoSecundario?: string;
  readonly corCardAcervoFundo?: string;
  readonly corCardAcervoBorda?: string;
  readonly corCardAcervoTexto?: string;
  readonly corCardAcervoPreco?: string;
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
    corLogoTitulo: "#f5f2eb",
    corLogoSubtitulo: "#d9d4c9",
    corEquipeTextoPrincipal: "#f5f2eb",
    corEquipeTextoSecundario: "#b8b3a8",
    corBottomSheetFundo: "#0f1110",
    corBottomSheetSuperficie: "#191c1a",
    corBottomSheetBorda: "rgba(255, 255, 255, 0.15)",
    corBottomSheetTextoPrincipal: "#f5f2eb",
    corBottomSheetTextoSecundario: "#b8b3a8",
    corBottomSheetDestaque: "#d9c8a9",
    corBottomSheetCtaFundo: "#f5f2eb",
    corBottomSheetCtaTexto: "#0f1110",
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
    corLogoTitulo: "#181715",
    corLogoSubtitulo: "#57534d",
    corEquipeTextoPrincipal: "#181715",
    corEquipeTextoSecundario: "#57534d",
    corBottomSheetFundo: "#f7f4ee",
    corBottomSheetSuperficie: "#efeae0",
    corBottomSheetBorda: "rgba(0, 0, 0, 0.12)",
    corBottomSheetTextoPrincipal: "#181715",
    corBottomSheetTextoSecundario: "#57534d",
    corBottomSheetDestaque: "#2b2925",
    corBottomSheetCtaFundo: "#181715",
    corBottomSheetCtaTexto: "#f7f4ee",
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
    corLogoTitulo: "#f8f1ec",
    corLogoSubtitulo: "#dfd2c8",
    corEquipeTextoPrincipal: "#f8f1ec",
    corEquipeTextoSecundario: "#cab9ad",
    corBottomSheetFundo: "#1f1815",
    corBottomSheetSuperficie: "#2c221e",
    corBottomSheetBorda: "rgba(255, 255, 255, 0.15)",
    corBottomSheetTextoPrincipal: "#f8f1ec",
    corBottomSheetTextoSecundario: "#cab9ad",
    corBottomSheetDestaque: "#e0b094",
    corBottomSheetCtaFundo: "#e0b094",
    corBottomSheetCtaTexto: "#1f1815",
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
    corLogoTitulo: "#f1f5f2",
    corLogoSubtitulo: "#cbd8d0",
    corEquipeTextoPrincipal: "#f1f5f2",
    corEquipeTextoSecundario: "#a8b8af",
    corBottomSheetFundo: "#0e1714",
    corBottomSheetSuperficie: "#16241f",
    corBottomSheetBorda: "rgba(255, 255, 255, 0.15)",
    corBottomSheetTextoPrincipal: "#f1f5f2",
    corBottomSheetTextoSecundario: "#a8b8af",
    corBottomSheetDestaque: "#c4d7cb",
    corBottomSheetCtaFundo: "#c4d7cb",
    corBottomSheetCtaTexto: "#0e1714",
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
    corLogoTitulo: "#f1f5f9",
    corLogoSubtitulo: "#cbd5e1",
    corEquipeTextoPrincipal: "#f1f5f9",
    corEquipeTextoSecundario: "#94a3b8",
    corBottomSheetFundo: "#0b1320",
    corBottomSheetSuperficie: "#131f33",
    corBottomSheetBorda: "rgba(255, 255, 255, 0.15)",
    corBottomSheetTextoPrincipal: "#f1f5f9",
    corBottomSheetTextoSecundario: "#94a3b8",
    corBottomSheetDestaque: "#60a5fa",
    corBottomSheetCtaFundo: "#60a5fa",
    corBottomSheetCtaTexto: "#0b1320",
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
    corLogoTitulo: "#f3f4f6",
    corLogoSubtitulo: "#d1d5db",
    corEquipeTextoPrincipal: "#f3f4f6",
    corEquipeTextoSecundario: "#9ca3af",
    corBottomSheetFundo: "#121417",
    corBottomSheetSuperficie: "#1c2024",
    corBottomSheetBorda: "rgba(255, 255, 255, 0.15)",
    corBottomSheetTextoPrincipal: "#f3f4f6",
    corBottomSheetTextoSecundario: "#9ca3af",
    corBottomSheetDestaque: "#f59e0b",
    corBottomSheetCtaFundo: "#f59e0b",
    corBottomSheetCtaTexto: "#121417",
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
    corLogoTitulo: "#1c1917",
    corLogoSubtitulo: "#57534e",
    corEquipeTextoPrincipal: "#1c1917",
    corEquipeTextoSecundario: "#57534e",
    corBottomSheetFundo: "#f9f8f5",
    corBottomSheetSuperficie: "#f1eee7",
    corBottomSheetBorda: "rgba(0, 0, 0, 0.12)",
    corBottomSheetTextoPrincipal: "#1c1917",
    corBottomSheetTextoSecundario: "#57534e",
    corBottomSheetDestaque: "#78350f",
    corBottomSheetCtaFundo: "#78350f",
    corBottomSheetCtaTexto: "#f9f8f5",
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
    corLogoTitulo: "#faf5f0",
    corLogoSubtitulo: "#e2d6cd",
    corEquipeTextoPrincipal: "#faf5f0",
    corEquipeTextoSecundario: "#c7b7ab",
    corBottomSheetFundo: "#1c1412",
    corBottomSheetSuperficie: "#291d1a",
    corBottomSheetBorda: "rgba(255, 255, 255, 0.15)",
    corBottomSheetTextoPrincipal: "#faf5f0",
    corBottomSheetTextoSecundario: "#c7b7ab",
    corBottomSheetDestaque: "#ea580c",
    corBottomSheetCtaFundo: "#ea580c",
    corBottomSheetCtaTexto: "#faf5f0",
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
