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
  | "cards_acervo_home"
  | "equipe"
  | "bottom_sheets"
  | "catalogo_tela_cheia";

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
    descricao:
      "Cores do botão principal, do botão secundário (com bordas) e dos cards terciários da vitrine.",
    campos: [
      {
        chave: "corCtaFundo",
        rotulo: "Botão principal (Fundo)",
        descricao: "Fundo do destaque primário de conversão",
        obterPadrao: (paleta) => paleta.corCtaFundo,
      },
      {
        chave: "corCtaBorda",
        rotulo: "Botão principal (Borda)",
        descricao: "Contorno opcional do botão principal",
        obterPadrao: (paleta, tokens) => tokens?.corCtaFundo || paleta.corCtaFundo,
      },
      {
        chave: "corCtaTexto",
        rotulo: "Botão principal (Texto)",
        descricao: "Cor do texto e ícone do destaque primário",
        obterPadrao: (paleta) => paleta.corCtaTexto,
      },
      {
        chave: "corDestaqueSecundarioFundo",
        rotulo: "Botão secundário (Fundo)",
        descricao: "Fundo do botão de destaque secundário",
        obterPadrao: (paleta) => paleta.corSecundarioFundo,
      },
      {
        chave: "corDestaqueSecundarioBorda",
        rotulo: "Botão secundário (Borda)",
        descricao: "Contorno do botão de destaque secundário",
        obterPadrao: (paleta) => paleta.corCtaFundo,
      },
      {
        chave: "corDestaqueSecundarioTexto",
        rotulo: "Botão secundário (Texto)",
        descricao: "Cor do texto e ícone do botão secundário",
        obterPadrao: (paleta) => paleta.corSecundarioTexto,
      },
      {
        chave: "corSecundarioFundo",
        rotulo: "Cards terciários (Fundo)",
        descricao: "Fundo dos cards padrão (100% e 50%) da vitrine",
        obterPadrao: (paleta) => paleta.corSecundarioFundo,
      },
      {
        chave: "corSecundarioTexto",
        rotulo: "Cards terciários (Texto)",
        descricao: "Texto e ícones dos cards padrão da vitrine",
        obterPadrao: (paleta) => paleta.corSecundarioTexto,
      },
    ],
  },
  {
    id: "cards_acervo_home",
    titulo: "Cards de Produtos & Serviços (Home)",
    descricao:
      "Cores independentes para os cards compactos de produtos e serviços exibidos na vitrine principal.",
    campos: [
      {
        chave: "corCardAcervoFundo",
        rotulo: "Fundo do Card",
        descricao: "Cor de fundo dos cards de produtos e serviços na Home",
        obterPadrao: (paleta, tokens) => tokens?.corSuperficie || paleta.corSuperficie,
      },
      {
        chave: "corCardAcervoBorda",
        rotulo: "Borda do Card",
        descricao: "Contorno opcional dos cards de produtos e serviços na Home",
        obterPadrao: (paleta, tokens) => tokens?.corBorda || paleta.corBorda,
      },
      {
        chave: "corCardAcervoTexto",
        rotulo: "Título do Item",
        descricao: "Cor do nome do produto ou serviço exibido no card",
        obterPadrao: (paleta, tokens) => tokens?.corTextoPrincipal || paleta.corTextoPrincipal,
      },
      {
        chave: "corCardAcervoPreco",
        rotulo: "Preço & Apoio",
        descricao: "Cor do preço e prazo/duração exibidos no card",
        obterPadrao: (paleta, tokens) => tokens?.corTextoSecundario || paleta.corTextoSecundario,
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
      {
        chave: "corBottomSheetFecharFundo",
        rotulo: "Botão Fechar do Bottom Sheet (Fundo)",
        descricao: "Fundo do botão X flutuante para fechar a gaveta",
        obterPadrao: (paleta, tokens) =>
          tokens?.corBottomSheetSuperficie ||
          tokens?.corSuperficie ||
          paleta.corBottomSheetSuperficie,
      },
      {
        chave: "corBottomSheetFecharTexto",
        rotulo: "Botão Fechar do Bottom Sheet (Ícone X)",
        descricao: "Cor do ícone X para fechar a gaveta",
        obterPadrao: (paleta, tokens) =>
          tokens?.corBottomSheetTextoPrincipal ||
          tokens?.corTextoPrincipal ||
          paleta.corBottomSheetTextoPrincipal,
      },
    ],
  },
  {
    id: "catalogo_tela_cheia",
    titulo: "Catálogo em Tela Cheia (Ver todos)",
    descricao:
      "Cores independentes para a tela completa de produtos e serviços com busca, filtros e ordenação.",
    campos: [
      {
        chave: "corCatalogoFundo",
        rotulo: "Fundo do Catálogo",
        descricao: "Fundo principal da tela cheia e do cabeçalho fixo",
        obterPadrao: (paleta, tokens) =>
          tokens?.corBottomSheetFundo ||
          tokens?.corFundoPrincipal ||
          paleta.corBottomSheetFundo,
      },
      {
        chave: "corCatalogoSuperficie",
        rotulo: "Cartões, Busca & Controles",
        descricao: "Fundo dos cards, campo de busca, ordenação e chips inativos",
        obterPadrao: (paleta, tokens) =>
          tokens?.corBottomSheetSuperficie ||
          tokens?.corSuperficie ||
          paleta.corBottomSheetSuperficie,
      },
      {
        chave: "corCatalogoBorda",
        rotulo: "Bordas & Divisores",
        descricao: "Linhas do cabeçalho, cartões, busca e filtros",
        obterPadrao: (paleta, tokens) =>
          tokens?.corBottomSheetBorda ||
          tokens?.corBorda ||
          paleta.corBottomSheetBorda,
      },
      {
        chave: "corCatalogoTextoPrincipal",
        rotulo: "Textos Principais & Chip Ativo",
        descricao: "Título, nomes dos itens, preços e destaque do filtro ativo",
        obterPadrao: (paleta, tokens) =>
          tokens?.corBottomSheetTextoPrincipal ||
          tokens?.corTextoPrincipal ||
          paleta.corBottomSheetTextoPrincipal,
      },
      {
        chave: "corCatalogoTextoSecundario",
        rotulo: "Textos Secundários",
        descricao: "Contador, placeholder da busca, resumos e rótulos de apoio",
        obterPadrao: (paleta, tokens) =>
          tokens?.corBottomSheetTextoSecundario ||
          tokens?.corTextoSecundario ||
          paleta.corBottomSheetTextoSecundario,
      },
    ],
  },
];

