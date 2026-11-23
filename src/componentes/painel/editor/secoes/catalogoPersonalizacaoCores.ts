import type {
  CustomizacaoTokensEditorial,
  DescritorPaletaEditorial,
} from "@/dominio/entidades/composicaoEditorial";

export type ChaveCorTokenEditorial = Exclude<
  keyof CustomizacaoTokensEditorial,
  "modoFundoEquipe" | "corBrilhoBorda"
>;

export type IdentificadorGrupoCorEditorial =
  | "identidade_logo"
  | "base_vitrine"
  | "botoes_acoes"
  | "equipe"
  | "bottom_sheets";

export interface DescritorCampoCorEditorial {
  readonly chave: ChaveCorTokenEditorial;
  readonly rotulo: string;
  readonly descricao: string;
  readonly obterPadrao: (
    paleta: DescritorPaletaEditorial,
    tokens?: CustomizacaoTokensEditorial,
  ) => string;
}

export interface DescritorGrupoCorEditorial {
  readonly id: IdentificadorGrupoCorEditorial;
  readonly titulo: string;
  readonly descricao: string;
  readonly campos: readonly DescritorCampoCorEditorial[];
}

export const GRUPOS_PERSONALIZACAO_CORES_EDITORIAL: readonly DescritorGrupoCorEditorial[] = [
  {
    id: "identidade_logo",
    titulo: "Identidade & Logo",
    descricao: "Cores independentes do título e subtítulo exibidos ao lado do logotipo.",
    campos: [
      {
        chave: "corLogoTitulo",
        rotulo: "Título da Logo",
        descricao: "Nome da marca exibido no cabeçalho",
        obterPadrao: (paleta, tokens) => tokens?.corTextoPrincipal || paleta.corLogoTitulo,
      },
      {
        chave: "corLogoSubtitulo",
        rotulo: "Subtítulo da Logo",
        descricao: "Subtítulo curto abaixo do nome da marca",
        obterPadrao: (paleta, tokens) => tokens?.corTextoSecundario || paleta.corLogoSubtitulo,
      },
    ],
  },
  {
    id: "base_vitrine",
    titulo: "Base & Textos da Vitrine",
    descricao: "Fundo geral, superfícies, bordas e hierarquia de textos da página.",
    campos: [
      {
        chave: "corDestaque",
        rotulo: "Destaques e etiquetas",
        descricao: "Sobretítulo, tags e selos de foco",
        obterPadrao: (paleta) => paleta.corDestaque,
      },
      {
        chave: "corTextoPrincipal",
        rotulo: "Título Principal",
        descricao: "Nome da marca e títulos da vitrine",
        obterPadrao: (paleta) => paleta.corTextoPrincipal,
      },
      {
        chave: "corTextoSecundario",
        rotulo: "Subtítulo & Apoio",
        descricao: "Descrições de apoio e legendas",
        obterPadrao: (paleta) => paleta.corTextoSecundario,
      },
      {
        chave: "corFundoPrincipal",
        rotulo: "Fundo Geral",
        descricao: "Base de fundo da vitrine",
        obterPadrao: (paleta) => paleta.corFundoPrincipal,
      },
      {
        chave: "corSuperficie",
        rotulo: "Fundo dos cartões",
        descricao: "Superfície dos blocos e botões de apoio",
        obterPadrao: (paleta) => paleta.corSuperficie,
      },
      {
        chave: "corBorda",
        rotulo: "Bordas & Linhas",
        descricao: "Contornos de cartões e divisores",
        obterPadrao: (paleta) => paleta.corBorda,
      },
    ],
  },
  {
    id: "botoes_acoes",
    titulo: "Botões & Ações",
    descricao: "Cores do botão principal de conversão e dos botões de canais secundários.",
    campos: [
      {
        chave: "corCtaFundo",
        rotulo: "Botão principal (Fundo)",
        descricao: "Fundo da ação principal de conversão",
        obterPadrao: (paleta) => paleta.corCtaFundo,
      },
      {
        chave: "corCtaTexto",
        rotulo: "Botão principal (Texto)",
        descricao: "Cor do texto dentro do botão principal",
        obterPadrao: (paleta) => paleta.corCtaTexto,
      },
      {
        chave: "corSecundarioFundo",
        rotulo: "Botões Secundários (Fundo)",
        descricao: "Fundo dos botões de canais secundários",
        obterPadrao: (paleta) => paleta.corSecundarioFundo,
      },
      {
        chave: "corSecundarioTexto",
        rotulo: "Botões Secundários (Texto)",
        descricao: "Texto e ícones dos botões secundários",
        obterPadrao: (paleta) => paleta.corSecundarioTexto,
      },
    ],
  },
  {
    id: "equipe",
    titulo: "Equipe",
    descricao: "Aparência do bloco da equipe na vitrine: fundo transparente ou fixo e textos.",
    campos: [
      {
        chave: "corEquipeTextoPrincipal",
        rotulo: "Título da Equipe",
        descricao: "Título principal e seta do bloco da equipe",
        obterPadrao: (paleta, tokens) =>
          tokens?.modoFundoEquipe === "fixo"
            ? tokens.corSecundarioTexto || paleta.corSecundarioTexto
            : tokens?.corTextoPrincipal || paleta.corEquipeTextoPrincipal,
      },
      {
        chave: "corEquipeTextoSecundario",
        rotulo: "Subtítulo da Equipe",
        descricao: "Texto auxiliar exibido abaixo do título da equipe",
        obterPadrao: (paleta, tokens) =>
          tokens?.modoFundoEquipe === "fixo"
            ? tokens.corSecundarioTexto || paleta.corSecundarioTexto
            : tokens?.corTextoSecundario || paleta.corEquipeTextoSecundario,
      },
    ],
  },
  {
    id: "bottom_sheets",
    titulo: "Bottom Sheets (Gavetas e Modais)",
    descricao:
      "Cores independentes para gavetas de produtos, serviços, equipe, posts, avaliações e formulários.",
    campos: [
      {
        chave: "corBottomSheetFundo",
        rotulo: "Fundo do Bottom Sheet",
        descricao: "Cor de fundo principal da gaveta aberta",
        obterPadrao: (paleta, tokens) => tokens?.corFundoPrincipal || paleta.corBottomSheetFundo,
      },
      {
        chave: "corBottomSheetSuperficie",
        rotulo: "Cartões e Campos do Bottom Sheet",
        descricao: "Fundo de cartões internos, campos de formulário e rodapé fixo",
        obterPadrao: (paleta, tokens) => tokens?.corSuperficie || paleta.corBottomSheetSuperficie,
      },
      {
        chave: "corBottomSheetBorda",
        rotulo: "Bordas do Bottom Sheet",
        descricao: "Linhas divisórias e contornos internos da gaveta",
        obterPadrao: (paleta, tokens) => tokens?.corBorda || paleta.corBottomSheetBorda,
      },
      {
        chave: "corBottomSheetTextoPrincipal",
        rotulo: "Textos Principais do Bottom Sheet",
        descricao: "Títulos, nomes de itens/equipe, negritos, links e texto digitado",
        obterPadrao: (paleta, tokens) =>
          tokens?.corTextoPrincipal || paleta.corBottomSheetTextoPrincipal,
      },
      {
        chave: "corBottomSheetTextoSecundario",
        rotulo: "Textos Secundários do Bottom Sheet",
        descricao: "Descrições, resumos, categorias, datas, cargos e legendas",
        obterPadrao: (paleta, tokens) =>
          tokens?.corTextoSecundario || paleta.corBottomSheetTextoSecundario,
      },
      {
        chave: "corBottomSheetDestaque",
        rotulo: "Destaques do Bottom Sheet",
        descricao: "Preços em destaque, citações e bordas de foco/seleção",
        obterPadrao: (paleta, tokens) => tokens?.corDestaque || paleta.corBottomSheetDestaque,
      },
      {
        chave: "corBottomSheetCtaFundo",
        rotulo: "Botão Principal do Bottom Sheet (Fundo)",
        descricao: "Fundo dos botões de ação dentro das gavetas",
        obterPadrao: (paleta, tokens) => tokens?.corCtaFundo || paleta.corBottomSheetCtaFundo,
      },
      {
        chave: "corBottomSheetCtaTexto",
        rotulo: "Botão Principal do Bottom Sheet (Texto)",
        descricao: "Cor do texto dos botões de ação dentro das gavetas",
        obterPadrao: (paleta, tokens) => tokens?.corCtaTexto || paleta.corBottomSheetCtaTexto,
      },
    ],
  },
];

