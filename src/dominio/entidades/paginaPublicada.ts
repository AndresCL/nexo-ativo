import type { ConfiguracaoAgendaVitrine } from "../agenda/tiposAgenda";
import type { CodigoPerfilPublicidade } from "../publicidade/tiposPerfilPublicidade";
import type { ConfiguracaoAvaliacoesGoogle } from "./avaliacoesGoogle";
import type { PosicionamentoEquipeVitrine } from "../editorial/posicionamentoEquipeVitrine";
import type {
  FaixaInicioExperiencias,
  PosicaoCabecalhoMarca,
} from "../editorial/faixaInicioExperiencias";
export type {
  FaixaInicioExperiencias,
  PosicaoCabecalhoMarca,
} from "../editorial/faixaInicioExperiencias";
import type { TamanhoCabecalhoMarca } from "../editorial/tamanhoCabecalhoMarca";
export type { TamanhoCabecalhoMarca } from "../editorial/tamanhoCabecalhoMarca";
import type { ConjuntoChamadasEditoriais } from "./chamadasEditoriais";
export type { ChamadaPrincipalEditorial } from "./chamadasEditoriais";
import {
  CATALOGO_PALETAS_EDITORIAIS,
  CATALOGO_TIPOGRAFIAS_EDITORIAIS,
  type CustomizacaoTokensEditorial,
  type DescritorPaletaEditorial,
  type DescritorTipografiaEditorial,
  type IdentificadorPaletaEditorial,
  type IdentificadorTipografiaEditorial,
  type ModoFundoEquipeEditorial,
  type TipoComposicaoEditorial,
} from "./composicaoEditorial";
import { PontoFocalMidia } from "../objetos-valor/pontoFocalMidia";
import {
  ehCorEscura,
  gerarPaletaEditorialAPartirDeCorPrimaria,
} from "../servicos/geradorPaletaEditorial";
import type {
  ConfiguracaoPostVitrine,
  DefinicaoMicrofluxo,
} from "../microfluxos/tiposMicrofluxo";
import { ordenarMicrofluxosPorPrioridadeEOrdem } from "../microfluxos/ordenacaoMicrofluxos";

export type {
  CustomizacaoTokensEditorial,
  IdentificadorPaletaEditorial,
  IdentificadorTipografiaEditorial,
  ModoFundoEquipeEditorial,
  TipoComposicaoEditorial,
} from "./composicaoEditorial";

/**
 * Disciplina editorial da Home: número enxuto de ações principais para preservar
 * hierarquia visual e evitar aparência de lista genérica de links.
 */
export const LIMITE_MAXIMO_ACOES_HOME = 5;

export type TipoRedeSocial =
  | "instagram"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "facebook"
  | "pinterest"
  | "behance"
  | "whatsapp"
  | "site";

export type TipoDestinoAcaoHome =
  | "microfluxo"
  | "agenda"
  | "publicacao_post"
  | "secao_produtos"
  | "secao_servicos"
  | "secao_portfolio"
  | "secao_equipe"
  | "secao_videos"
  | "link_externo"
  | "whatsapp"
  | "telefone";

export type IntensidadeVeloEscuro = "nenhum" | "suave" | "equilibrado" | "intenso";

export type TipoEfeitoCantosEditorial = "nenhum" | "dots" | "grade";
export type TomDotsCantosEditorial = "neutro" | "destaque" | "borda";
export type FormatoBordaLogotipo = "natural" | "suave" | "arredondado" | "circulo";

export type EspacamentoAcoesHome = "compacto" | "medio" | "amplo";

export interface CoordenadasPontoFocal {
  readonly xPercentual: number;
  readonly yPercentual: number;
}

import type { ConfiguracaoDegradadoEditorial } from "../objetos-valor/degradadoEditorial";

export interface MidiaFundoEditorial {
  readonly tipo: "imagem" | "video" | "degradado";
  readonly urlPrincipal: string;
  readonly urlMobileOpcional?: string;
  readonly urlPosterVideo?: string;
  readonly degradadoOpcional?: ConfiguracaoDegradadoEditorial;
  readonly textoAlternativo: string;
  readonly pontoFocalDesktop: CoordenadasPontoFocal;
  readonly pontoFocalMobile?: CoordenadasPontoFocal;
  readonly intensidadeVeloEscuro: IntensidadeVeloEscuro;
  readonly efeitoCantos?: TipoEfeitoCantosEditorial;
  readonly opacidadeDotsCantos?: number;
  readonly tomDotsCantos?: TomDotsCantosEditorial;
}

export interface IdentidadeMarcaEditorial {
  readonly nomeExibicao: string;
  readonly mostrarNomeExibicao?: boolean;
  readonly subtituloCurto?: string;
  readonly mostrarSubtituloCurto?: boolean;
  readonly alinhamentoCabecalho?: "esquerda" | "centro" | "direita";
  readonly tamanhoCabecalho?: TamanhoCabecalhoMarca;
  readonly posicaoCabecalho?: PosicaoCabecalhoMarca;
  readonly urlLogotipoOpcional?: string;
  readonly formatoBordaLogotipo?: FormatoBordaLogotipo;
  readonly cidadeEstado?: string;
  readonly urlMapaEnderecoOpcional?: string;
  readonly registroProfissionalOpcional?: string;
  readonly telefonePrincipalOpcional?: string;
  readonly celularOpcional?: string;
  readonly horarioFuncionamentoOpcional?: string;
}

export type TipoIconeAcaoHome = string;

export interface ConfiguracaoCtaAcervo {
  readonly tipoAcao: "whatsapp" | "microfluxo";
  readonly rotuloBotao?: string;
  readonly microfluxoId?: string;
}

export interface ItemAcaoHome {
  readonly posicionamentoEquipe?: PosicionamentoEquipeVitrine;
  readonly limiteAvataresEquipe?: number | null;
  readonly modoExibicaoColecao?: "modal_gaveta" | "carrossel" | "grade_2_colunas";
  readonly configuracaoCtaAcervo?: ConfiguracaoCtaAcervo;
  readonly configuracaoPost?: ConfiguracaoPostVitrine;
  readonly configuracaoAgenda?: ConfiguracaoAgendaVitrine;
  readonly id: string;
  readonly rotulo: string;
  readonly subtituloDiscreto?: string;
  readonly tituloSecao?: string;
  readonly rotuloCartaoOpcional?: string;
  readonly subtituloCartaoOpcional?: string;
  readonly tipoDestino: TipoDestinoAcaoHome;
  readonly destino: string;
  readonly destaquePrincipal?: boolean;
  readonly animarBordaDestaque?: boolean;
  readonly corBrilhoBorda?: string;
  readonly icone?: TipoIconeAcaoHome;
}

export interface LinkRedeSocial {
  readonly id: string;
  readonly rede: TipoRedeSocial;
  readonly url: string;
  readonly rotuloAcessivel?: string;
}

export interface DestaqueObraGaleria {
  readonly id: string;
  readonly tituloObra: string;
  readonly serieOuCategoria: string;
  readonly anoOuLocal?: string;
  readonly urlImagem: string;
  readonly textoAlternativo: string;
  readonly pontoFocal: CoordenadasPontoFocal;
  readonly destinoOpcional?: string;
}

export interface MetadadosSeoPublicos {
  readonly tituloSeo?: string;
  readonly descricaoSeo?: string;
  readonly urlImagemCompartilhamento?: string;
  readonly indexavel?: boolean;
}

export interface ConteudoPaginaPublicada extends ConjuntoChamadasEditoriais {
  readonly perfilPublicidade?: CodigoPerfilPublicidade;
  readonly avaliacoesGoogle?: ConfiguracaoAvaliacoesGoogle;
  readonly organizacaoId: string;
  readonly identificadorPublico: string;
  readonly publicado: boolean;
  readonly paginaAtiva: boolean;
  readonly versaoPublicada: number;
  readonly atualizadoEmIso: string;
  readonly composicaoVisual: TipoComposicaoEditorial;
  readonly espacamentoAcoes?: EspacamentoAcoesHome;
  readonly faixaInicioExperiencias?: FaixaInicioExperiencias;
  readonly paletaId: IdentificadorPaletaEditorial;
  readonly corPersonalizadaHex?: string;
  readonly customizacaoTokens?: CustomizacaoTokensEditorial;
  readonly tipografiaId: IdentificadorTipografiaEditorial;
  readonly identidade: IdentidadeMarcaEditorial;
  readonly midiaFundo: MidiaFundoEditorial;
  readonly acoesPrincipais: readonly ItemAcaoHome[];
  readonly redesSociais: readonly LinkRedeSocial[];
  readonly obrasDestaqueGaleria: readonly DestaqueObraGaleria[];
  readonly seo: MetadadosSeoPublicos;
}

export interface ContextoResolucaoMidiaHome {
  readonly modoMobile: boolean;
  readonly movimentoReduzido: boolean;
}

export interface MidiaHomeResolvida {
  readonly renderizarVideo: boolean;
  readonly urlVideo?: string;
  readonly urlImagemEstatica: string;
  readonly textoAlternativo: string;
  readonly posicaoObjetoCss: string;
  readonly intensidadeVeloEscuro: IntensidadeVeloEscuro;
  readonly efeitoCantos: TipoEfeitoCantosEditorial;
  readonly opacidadeDotsCantos?: number;
  readonly tomDotsCantos?: TomDotsCantosEditorial;
}

/**
 * Resolve de forma determinística qual recurso de mídia deve ser exibido na Home,
 * aplicando fallback obrigatório de imagem estática quando o visitante solicita
 * movimento reduzido ou quando o vídeo não possui suporte de reprodução automática.
 */
export function resolverMidiaEfetivaHome(
  midia: MidiaFundoEditorial,
  contexto: ContextoResolucaoMidiaHome,
): MidiaHomeResolvida {
  const coordenadasEscolhidas =
    contexto.modoMobile && midia.pontoFocalMobile
      ? midia.pontoFocalMobile
      : midia.pontoFocalDesktop;

  const pontoFocalValidado = PontoFocalMidia.criar(
    coordenadasEscolhidas.xPercentual,
    coordenadasEscolhidas.yPercentual,
  );

  const efeitoCantos: TipoEfeitoCantosEditorial = midia.efeitoCantos ?? "nenhum";
  const opacidadeDotsCantos: number | undefined = midia.opacidadeDotsCantos;
  const tomDotsCantos: TomDotsCantosEditorial | undefined = midia.tomDotsCantos;

  if (midia.tipo === "video") {
    const imagemFallbackSegura =
      (contexto.modoMobile && midia.urlMobileOpcional ? midia.urlMobileOpcional : undefined) ??
      midia.urlPosterVideo ??
      midia.urlMobileOpcional ??
      midia.urlPrincipal;

    if (contexto.movimentoReduzido || !midia.urlPosterVideo) {
      return {
        renderizarVideo: false,
        urlImagemEstatica: imagemFallbackSegura,
        textoAlternativo: midia.textoAlternativo,
        posicaoObjetoCss: pontoFocalValidado.gerarPosicaoObjetoCss(),
        intensidadeVeloEscuro: midia.intensidadeVeloEscuro,
        efeitoCantos,
        opacidadeDotsCantos,
        tomDotsCantos,
      };
    }

    return {
      renderizarVideo: true,
      urlVideo: midia.urlPrincipal,
      urlImagemEstatica: imagemFallbackSegura,
      textoAlternativo: midia.textoAlternativo,
      posicaoObjetoCss: pontoFocalValidado.gerarPosicaoObjetoCss(),
      intensidadeVeloEscuro: midia.intensidadeVeloEscuro,
      efeitoCantos,
      opacidadeDotsCantos,
      tomDotsCantos,
    };
  }

  const urlImagemEscolhida =
    contexto.modoMobile && midia.urlMobileOpcional ? midia.urlMobileOpcional : midia.urlPrincipal;

  return {
    renderizarVideo: false,
    urlImagemEstatica: urlImagemEscolhida,
    textoAlternativo: midia.textoAlternativo,
    posicaoObjetoCss: pontoFocalValidado.gerarPosicaoObjetoCss(),
    intensidadeVeloEscuro: midia.intensidadeVeloEscuro,
    efeitoCantos,
    opacidadeDotsCantos,
    tomDotsCantos,
  };
}

/**
 * Filtra ações válidas e garante o teto editorial de ações na Home.
 */
export function obterAcoesPrincipaisVisiveis(
  acoes: readonly ItemAcaoHome[],
): readonly ItemAcaoHome[] {
  return acoes.filter((acao) => acao.rotulo.trim().length > 0 && acao.destino.trim().length > 0);
}

export function obterDescritorPaletaEditorial(
  paletaId: IdentificadorPaletaEditorial,
): DescritorPaletaEditorial {
  return CATALOGO_PALETAS_EDITORIAIS[paletaId];
}

export function obterDescritorTipografiaEditorial(
  tipografiaId: IdentificadorTipografiaEditorial,
): DescritorTipografiaEditorial {
  return CATALOGO_TIPOGRAFIAS_EDITORIAIS[tipografiaId];
}

export function resolverPaletaEditorialEfetiva(
  paletaId: IdentificadorPaletaEditorial,
  corPersonalizadaHex?: string,
): DescritorPaletaEditorial {
  const paletaBase = obterDescritorPaletaEditorial(paletaId);

  if (
    corPersonalizadaHex &&
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(corPersonalizadaHex.trim())
  ) {
    return gerarPaletaEditorialAPartirDeCorPrimaria(
      corPersonalizadaHex,
      paletaBase.temaEscuro ? "escuro" : "claro",
    );
  }

  return paletaBase;
}

/**
 * Gera propriedades CSS customizadas para que qualquer composição editorial
 * se adapte à paleta selecionada e respeite eventuais overrides de tokens.
 */
export function gerarVariaveisCssPaletaEditorial(
  paletaId: IdentificadorPaletaEditorial,
  corPersonalizadaHex?: string,
  customizacaoTokens?: CustomizacaoTokensEditorial,
): Readonly<Record<string, string>> {
  const paleta = resolverPaletaEditorialEfetiva(paletaId, corPersonalizadaHex);

  const fundo = customizacaoTokens?.corFundoPrincipal || paleta.corFundoPrincipal;
  const superficie = customizacaoTokens?.corSuperficie || paleta.corSuperficie;
  const texto = customizacaoTokens?.corTextoPrincipal || paleta.corTextoPrincipal;
  const subtitulo = customizacaoTokens?.corTextoSecundario || paleta.corTextoSecundario;
  const destaque = customizacaoTokens?.corDestaque || paleta.corDestaque;
  const borda = customizacaoTokens?.corBorda || paleta.corBorda;
  const ctaFundo = customizacaoTokens?.corCtaFundo || paleta.corCtaFundo;
  const ctaTexto = customizacaoTokens?.corCtaTexto || paleta.corCtaTexto;
  const secundarioFundo = customizacaoTokens?.corSecundarioFundo || paleta.corSecundarioFundo;
  const secundarioTexto = customizacaoTokens?.corSecundarioTexto || paleta.corSecundarioTexto;
  const logoTitulo =
    customizacaoTokens?.corLogoTitulo ||
    customizacaoTokens?.corTextoPrincipal ||
    paleta.corLogoTitulo;
  const logoSubtitulo =
    customizacaoTokens?.corLogoSubtitulo ||
    customizacaoTokens?.corTextoSecundario ||
    paleta.corLogoSubtitulo;
  const modoFundoEquipe: ModoFundoEquipeEditorial =
    customizacaoTokens?.modoFundoEquipe ?? "transparente";
  const equipeFundo = modoFundoEquipe === "fixo" ? secundarioFundo : "transparent";
  const equipeTexto =
    customizacaoTokens?.corEquipeTextoPrincipal ||
    (modoFundoEquipe === "fixo"
      ? secundarioTexto
      : customizacaoTokens?.corTextoPrincipal || paleta.corEquipeTextoPrincipal);
  const equipeSubtitulo =
    customizacaoTokens?.corEquipeTextoSecundario ||
    (modoFundoEquipe === "fixo"
      ? `color-mix(in srgb, ${secundarioTexto} 78%, transparent)`
      : customizacaoTokens?.corTextoSecundario || paleta.corEquipeTextoSecundario);
  const brilhoBorda =
    customizacaoTokens?.corBrilhoBorda || paleta.corBrilhoBorda || destaque;

  return {
    "--editorial-fundo": fundo,
    "--editorial-superficie": superficie,
    "--editorial-texto": texto,
    "--editorial-titulo": texto,
    "--editorial-texto-secundario": subtitulo,
    "--editorial-subtitulo": subtitulo,
    "--editorial-destaque": destaque,
    "--editorial-vinheta": destaque,
    "--editorial-borda": borda,
    "--editorial-cta-fundo": ctaFundo,
    "--editorial-cta-texto": ctaTexto,
    "--editorial-secundario-fundo": secundarioFundo,
    "--editorial-secundario-texto": secundarioTexto,
    "--editorial-logo-titulo": logoTitulo,
    "--editorial-logo-subtitulo": logoSubtitulo,
    "--editorial-equipe-fundo": equipeFundo,
    "--editorial-equipe-texto": equipeTexto,
    "--editorial-equipe-subtitulo": equipeSubtitulo,
    "--editorial-brilho-borda": brilhoBorda,
  };
}

/**
 * Gera propriedades CSS customizadas isoladas para o escopo de Bottom Sheets,
 * permitindo personalizar fundo, superfícies, bordas, textos e CTA independentemente
 * da vitrine principal, mantendo fallback seguro para a paleta/tokens gerais.
 */
export function gerarVariaveisCssBottomSheetEditorial(
  paletaId: IdentificadorPaletaEditorial,
  corPersonalizadaHex?: string,
  customizacaoTokens?: CustomizacaoTokensEditorial,
): Readonly<Record<string, string>> {
  const paleta = resolverPaletaEditorialEfetiva(paletaId, corPersonalizadaHex);

  const fundo =
    customizacaoTokens?.corBottomSheetFundo ||
    customizacaoTokens?.corFundoPrincipal ||
    paleta.corBottomSheetFundo;
  const superficie =
    customizacaoTokens?.corBottomSheetSuperficie ||
    customizacaoTokens?.corSuperficie ||
    paleta.corBottomSheetSuperficie;
  const borda =
    customizacaoTokens?.corBottomSheetBorda ||
    customizacaoTokens?.corBorda ||
    paleta.corBottomSheetBorda;
  const texto =
    customizacaoTokens?.corBottomSheetTextoPrincipal ||
    customizacaoTokens?.corTextoPrincipal ||
    paleta.corBottomSheetTextoPrincipal;
  const subtitulo =
    customizacaoTokens?.corBottomSheetTextoSecundario ||
    customizacaoTokens?.corTextoSecundario ||
    paleta.corBottomSheetTextoSecundario;
  const destaque =
    customizacaoTokens?.corBottomSheetDestaque ||
    customizacaoTokens?.corDestaque ||
    paleta.corBottomSheetDestaque;
  const ctaFundo =
    customizacaoTokens?.corBottomSheetCtaFundo ||
    customizacaoTokens?.corCtaFundo ||
    paleta.corBottomSheetCtaFundo;
  const ctaTexto =
    customizacaoTokens?.corBottomSheetCtaTexto ||
    customizacaoTokens?.corCtaTexto ||
    paleta.corBottomSheetCtaTexto;
  const secundarioFundo = customizacaoTokens?.corSecundarioFundo || paleta.corSecundarioFundo;
  const secundarioTexto = customizacaoTokens?.corSecundarioTexto || paleta.corSecundarioTexto;
  const brilhoBorda =
    customizacaoTokens?.corBrilhoBorda || paleta.corBrilhoBorda || destaque;

  return {
    "--editorial-fundo": fundo,
    "--editorial-superficie": superficie,
    "--editorial-texto": texto,
    "--editorial-titulo": texto,
    "--editorial-texto-secundario": subtitulo,
    "--editorial-subtitulo": subtitulo,
    "--editorial-destaque": destaque,
    "--editorial-vinheta": destaque,
    "--editorial-borda": borda,
    "--editorial-cta-fundo": ctaFundo,
    "--editorial-cta-texto": ctaTexto,
    "--editorial-secundario-fundo": secundarioFundo,
    "--editorial-secundario-texto": secundarioTexto,
    "--editorial-brilho-borda": brilhoBorda,
  };
}

/**
 * Determina se o fundo efetivo do Bottom Sheet é escuro para adaptar
 * elementos sensíveis a contraste (como galerias e indicadores).
 */
export function resolverTemaEscuroBottomSheetEditorial(
  paletaId: IdentificadorPaletaEditorial,
  corPersonalizadaHex?: string,
  customizacaoTokens?: CustomizacaoTokensEditorial,
): boolean {
  const paleta = resolverPaletaEditorialEfetiva(paletaId, corPersonalizadaHex);
  const fundoEfetivo =
    customizacaoTokens?.corBottomSheetFundo ||
    customizacaoTokens?.corFundoPrincipal ||
    paleta.corBottomSheetFundo;
  return ehCorEscura(fundoEfetivo, paleta.temaEscuro);
}

/**
 * Verifica se a URL de imagem dispensa o otimizador raster do Next.js
 * SVGs, URLs locais e fotos de demonstração do Pexels, servidas diretamente pelo CDN.
 */
export function deveIgnorarOtimizadorImagem(urlImagem: string): boolean {
  const limpa = urlImagem.trim().toLowerCase();
  if (
    limpa.endsWith(".svg") ||
    limpa.startsWith("data:") ||
    limpa.startsWith("blob:") ||
    limpa.startsWith("http://localhost:") ||
    limpa.startsWith("http://127.0.0.1:")
  )
    return true;
  try {
    // O proxy do Next depende do acesso de rede do servidor ao Pexels.
    return new URL(limpa).hostname === "images.pexels.com";
  } catch {
    return false;
  }
}

/**
 * Constrói ou mescla as ações principais da vitrine a partir dos microfluxos configurados na organização,
 * garantindo que toda experiência com `ativoNaHome === true` tenha seu botão automaticamente
 * sincronizado e funcional na página inicial sem necessidade de amarrações manuais de URL.
 */
export function resolverAcoesVitrineComMicrofluxos(
  acoesHome: readonly ItemAcaoHome[],
  microfluxos: readonly DefinicaoMicrofluxo[],
): readonly ItemAcaoHome[] {
  const fluxosComBotaoHome = microfluxos.filter((m) => m.ativo);

  if (fluxosComBotaoHome.length === 0) {
    return acoesHome;
  }

  const fluxosOrdenados = ordenarMicrofluxosPorPrioridadeEOrdem(fluxosComBotaoHome);

  const acoesDosFluxos: ItemAcaoHome[] = fluxosOrdenados.map((m) => {
    const acaoExistente = acoesHome.find(
      (a) => a.destino === m.ancoraAcionamento || a.destino === `#${m.id}`,
    );

    let tipoDestino: TipoDestinoAcaoHome = "microfluxo";
    let destino = m.ancoraAcionamento || `#${m.id}`;

    if (m.tipoAcao === "link_externo") {
      tipoDestino = "link_externo";
      destino = m.urlDestinoOpcional?.trim() || "https://";
    } else if (m.tipoAcao === "agenda") {
      tipoDestino = "agenda";
      destino = `#agenda-${m.id}`;
    } else if (m.tipoAcao === "publicacao_post") {
      tipoDestino = "publicacao_post";
      destino = `#post-${m.id}`;
    } else if (m.tipoAcao === "secao_produtos") {
      tipoDestino = "secao_produtos";
      destino = "#produtos";
    } else if (m.tipoAcao === "secao_servicos") {
      tipoDestino = "secao_servicos";
      destino = "#servicos";
    } else if (m.tipoAcao === "secao_portfolio") {
      tipoDestino = "secao_portfolio";
      destino = "#portfolio";
    } else if (m.tipoAcao === "secao_equipe") {
      tipoDestino = "secao_equipe";
      destino = "#equipe";
    } else if (m.tipoAcao === "secao_videos") {
      tipoDestino = "secao_videos";
      destino = "#videos";
    } else if (m.tipoAcao === "whatsapp") {
      tipoDestino = "whatsapp";
      destino = m.urlDestinoOpcional?.trim().startsWith("http")
        ? m.urlDestinoOpcional.trim()
        : `https://wa.me/${(m.urlDestinoOpcional || "").replace(/\D/g, "")}`;
    } else if (m.tipoAcao === "telefone") {
      tipoDestino = "telefone";
      destino = m.urlDestinoOpcional?.trim().startsWith("tel:")
        ? m.urlDestinoOpcional.trim()
        : `tel:${(m.urlDestinoOpcional || "").replace(/[^\d+]/g, "")}`;
    }

    return {
      id: `acao-fluxo-${m.id}`,
      rotulo: m.rotuloBotaoHome?.trim() || acaoExistente?.rotulo?.trim() || m.titulo,
      subtituloDiscreto:
        m.subtituloBotaoHome?.trim() || acaoExistente?.subtituloDiscreto?.trim() || undefined,
      tipoDestino,
      ...(tipoDestino.startsWith("secao_")
        ? { tituloSecao: m.tituloSecao?.trim() || undefined }
        : {}),
      destino,
      icone: (m.iconeBotaoHome as TipoIconeAcaoHome) || acaoExistente?.icone || "automatico",
      destaquePrincipal: m.destaquePrimarioHome ?? acaoExistente?.destaquePrincipal ?? false,
      animarBordaDestaque: m.animarBordaDestaque ?? acaoExistente?.animarBordaDestaque ?? false,
      corBrilhoBorda: m.corBrilhoBorda ?? acaoExistente?.corBrilhoBorda,
      ...(tipoDestino === "secao_equipe" && m.posicionamentoEquipe
        ? { posicionamentoEquipe: m.posicionamentoEquipe }
        : {}),
      ...(tipoDestino === "secao_equipe" && m.limiteAvataresEquipe !== undefined
        ? { limiteAvataresEquipe: m.limiteAvataresEquipe }
        : {}),
      ...((tipoDestino === "secao_produtos" || tipoDestino === "secao_servicos") && m.modoExibicaoColecao
        ? { modoExibicaoColecao: m.modoExibicaoColecao }
        : {}),
      ...((tipoDestino === "secao_produtos" || tipoDestino === "secao_servicos") && m.configuracaoCtaAcervo
        ? { configuracaoCtaAcervo: m.configuracaoCtaAcervo }
        : {}),
      ...(tipoDestino === "publicacao_post" && m.configuracaoPost
        ? { configuracaoPost: m.configuracaoPost }
        : {}),
      ...(tipoDestino === "agenda" && m.configuracaoAgenda
        ? { configuracaoAgenda: m.configuracaoAgenda }
        : {}),
    };
  });

  const destinosDosFluxos = new Set(acoesDosFluxos.map((a) => a.destino));
  const rotulosDosFluxos = new Set(acoesDosFluxos.map((a) => a.rotulo.trim().toLowerCase()));

  const acoesExtrasNaoCobertas = acoesHome.filter(
    (a) =>
      !destinosDosFluxos.has(a.destino) &&
      !rotulosDosFluxos.has(a.rotulo.trim().toLowerCase()) &&
      (a.tipoDestino === "secao_produtos" ||
        a.tipoDestino === "secao_servicos" ||
        a.tipoDestino === "secao_portfolio" ||
        a.tipoDestino === "secao_equipe"),
  );

  return [...acoesDosFluxos, ...acoesExtrasNaoCobertas];
}
