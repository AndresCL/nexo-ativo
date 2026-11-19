import type { ResumoDireitosPlano } from "./autenticacaoEOrganizacao";
import type { CoordenadasPontoFocal } from "./paginaPublicada";
import { ErroValidacaoDominio } from "../erros/errosDominio";
import type { DefinicaoMicrofluxo } from "../microfluxos/tiposMicrofluxo";
import { IdentificadorPublico } from "../objetos-valor/identificadorPublico";
import { ValorMonetarioCentavos } from "../objetos-valor/valorMonetarioCentavos";
import type { VideoYoutubeItem } from "../objetos-valor/videoYoutube";

export type ModoExibicaoVideos = "carrossel" | "fila";

export type ModoExibicaoItensVitrine = "modal_gaveta" | "carrossel" | "grade_2_colunas";

export type DisponibilidadeProdutoCatalogo = "disponivel" | "sob_encomenda" | "esgotado";

export interface MidiaItemCatalogo {
  readonly url: string;
  readonly textoAlternativo?: string;
  readonly pontoFocal?: CoordenadasPontoFocal;
}

export function obterListaImagensMidia(
  principal?: MidiaItemCatalogo | null,
  lista?: readonly MidiaItemCatalogo[],
): readonly MidiaItemCatalogo[] {
  const validas = (lista ?? []).filter((item) => item.url.trim().length > 0);
  if (validas.length > 0) return validas;
  if (principal && principal.url.trim().length > 0) return [principal];
  return [];
}

export interface ServicoOrganizacao {
  readonly id: string;
  readonly organizacaoId: string;
  readonly nome: string;
  readonly resumo: string;
  readonly categoria: string;
  readonly precoBaseCentavos?: number;
  readonly rotuloPrecoOpcional?: string;
  readonly prazoOuDuracao?: string;
  readonly urlImagemOpcional?: string;
  readonly pontoFocalImagem?: CoordenadasPontoFocal;
  readonly imagens?: readonly MidiaItemCatalogo[];
  readonly ordemExibicao: number;
  readonly ativo: boolean;
  readonly atualizadoEmIso: string;
}

export interface ProdutoCatalogo {
  readonly id: string;
  readonly organizacaoId: string;
  readonly nome: string;
  readonly resumo: string;
  readonly categoria: string;
  readonly precoCentavos?: number;
  readonly rotuloPrecoOpcional?: string;
  readonly disponibilidade: DisponibilidadeProdutoCatalogo;
  readonly especificacoesCurtas: readonly string[];
  readonly urlImagemPrincipal?: string;
  readonly textoAlternativoImagem?: string;
  readonly pontoFocalImagem?: CoordenadasPontoFocal;
  readonly imagens?: readonly MidiaItemCatalogo[];
  readonly ordemExibicao: number;
  readonly ativo: boolean;
  readonly atualizadoEmIso: string;
}

export interface ProjetoPortfolio {
  readonly id: string;
  readonly organizacaoId: string;
  readonly titulo: string;
  readonly categoriaOuSerie: string;
  readonly anoOuLocal?: string;
  readonly resumoEditorial: string;
  readonly urlImagemCapa: string;
  readonly textoAlternativoCapa: string;
  readonly pontoFocalCapa: CoordenadasPontoFocal;
  readonly imagens?: readonly MidiaItemCatalogo[];
  readonly destaqueVitrine: boolean;
  readonly ordemExibicao: number;
  readonly ativo: boolean;
  readonly atualizadoEmIso: string;
}

export interface ProfissionalEquipe {
  readonly id: string;
  readonly organizacaoId: string;
  readonly identificadorCartao: string;
  readonly nomeCompleto: string;
  readonly cargoOuEspecialidade: string;
  readonly registroProfissionalOpcional?: string;
  readonly minibiografia: string;
  readonly urlFotoPerfil?: string;
  readonly pontoFocalFoto: CoordenadasPontoFocal;
  readonly emailContatoOpcional?: string;
  readonly whatsappOpcional?: string;
  readonly linkedinOpcional?: string;
  readonly instagramOpcional?: string;
  readonly aceitaSolicitacoesDiretas: boolean;
  readonly exibirAcoesVitrineNoCartao?: boolean;
  readonly ordemExibicao: number;
  readonly ativo: boolean;
  readonly atualizadoEmIso: string;
}

export interface AcervoPublicoVitrine {
  readonly servicos: readonly ServicoOrganizacao[];
  readonly produtos: readonly ProdutoCatalogo[];
  readonly projetosPortfolio: readonly ProjetoPortfolio[];
  readonly profissionais: readonly ProfissionalEquipe[];
  readonly microfluxos?: readonly DefinicaoMicrofluxo[];
  readonly videos?: readonly VideoYoutubeItem[];
  readonly modoExibicaoVideos?: ModoExibicaoVideos;
  readonly autoplayVideos?: boolean;
  readonly ocultarTituloVideos?: boolean;
  readonly modoExibicaoProdutos?: ModoExibicaoItensVitrine;
  readonly modoExibicaoServicos?: ModoExibicaoItensVitrine;
}

export function criarAcervoPublicoVazio(): AcervoPublicoVitrine {
  return {
    servicos: [],
    produtos: [],
    projetosPortfolio: [],
    profissionais: [],
    microfluxos: [],
    videos: [],
    modoExibicaoVideos: "carrossel",
  };
}

/**
 * Formata de maneira consistente a apresentação comercial de preço de um serviço ou produto,
 * utilizando `ValorMonetarioCentavos` quando há valor numérico definido.
 */
export function formatarApresentacaoPrecoItem(opcoes: {
  readonly centavos?: number;
  readonly rotuloOpcional?: string;
  readonly textoPadraoSemValor?: string;
}): string {
  const textoPadrao = opcoes.textoPadraoSemValor ?? "Sob consulta";

  if (typeof opcoes.centavos !== "number") {
    return opcoes.rotuloOpcional?.trim() || textoPadrao;
  }

  const valorFormatado = ValorMonetarioCentavos.deCentavos(
    opcoes.centavos,
  ).formatarMoedaBrasileira();

  if (opcoes.rotuloOpcional?.trim()) {
    return `${opcoes.rotuloOpcional.trim()} ${valorFormatado}`;
  }

  return valorFormatado;
}

/**
 * Ordena itens de catálogo por `ordemExibicao` crescente e desempata de forma determinística.
 */
export function ordenarItensAtivosCatalogo<
  T extends { readonly id: string; readonly ativo: boolean; readonly ordemExibicao: number },
>(itens: readonly T[]): readonly T[] {
  return itens
    .filter((item) => item.ativo)
    .slice()
    .sort((a, b) => a.ordemExibicao - b.ordemExibicao || a.id.localeCompare(b.id));
}

/**
 * Garante o cumprimento da cota de profissionais ativos permitida pelo plano da organização
 * (Plano Pro: até 10 profissionais; Empresarial: sob medida).
 */
export function validarLimiteProfissionaisPlano(parametros: {
  readonly profissionaisExistentes: readonly ProfissionalEquipe[];
  readonly resumoDireitosPlano: ResumoDireitosPlano;
  readonly idProfissionalEmEdicao?: string;
  readonly seraAtivo: boolean;
}): void {
  if (!parametros.seraAtivo) {
    return;
  }

  const ativosOutros = parametros.profissionaisExistentes.filter(
    (item) => item.ativo && item.id !== parametros.idProfissionalEmEdicao,
  ).length;

  if (ativosOutros + 1 > parametros.resumoDireitosPlano.limiteProfissionaisAtivos) {
    const limite = parametros.resumoDireitosPlano.limiteProfissionaisAtivos;
    throw new ErroValidacaoDominio(
      limite <= 1
        ? "Seu plano atual contempla 1 perfil profissional ativo. Para cadastrar equipe com múltiplos cartões digitais, contrate o Plano Pro."
        : `Seu plano atual contempla até ${limite} profissionais ativos simultaneamente.`,
      "LIMITE_PROFISSIONAIS_EXCEDIDO",
    );
  }
}

/**
 * Valida o slug do cartão digital individual e impede duplicidade entre profissionais ativos
 * da mesma organização.
 */
export function validarIdentificadorCartaoProfissional(parametros: {
  readonly identificadorCartao: string;
  readonly profissionaisExistentes: readonly ProfissionalEquipe[];
  readonly idProfissionalEmEdicao?: string;
}): string {
  const validado = IdentificadorPublico.criar(parametros.identificadorCartao).obterValor();

  const conflito = parametros.profissionaisExistentes.some(
    (item) =>
      item.id !== parametros.idProfissionalEmEdicao &&
      item.identificadorCartao === validado &&
      item.ativo,
  );

  if (conflito) {
    throw new ErroValidacaoDominio(
      "Outro integrante ativo da equipe já utiliza este endereço de cartão digital.",
      "IDENTIFICADOR_CARTAO_DUPLICADO",
    );
  }

  return validado;
}

/**
 * Constrói o endereço público canônico do cartão digital individual de um especialista.
 */
export function construirUrlPublicaCartaoProfissional(parametros: {
  readonly urlBasePublica: string;
  readonly identificadorOrganizacao: string;
  readonly identificadorCartao: string;
}): string {
  const baseSemBarra = parametros.urlBasePublica.replace(/\/+$/, "");
  return `${baseSemBarra}/${parametros.identificadorOrganizacao}/equipe/${parametros.identificadorCartao}`;
}

/**
 * Converte texto digitado pelo usuário (ex.: "1.250,50", "850", "850,9") em inteiro seguro
 * de centavos sem usar ponto flutuante IEEE 754. Retorna `undefined` se o campo estiver em branco.
 */
export function converterTextoMoedaParaCentavos(textoBruto: string): number | undefined {
  const limpo = textoBruto.replace(/[R$\s]/gi, "").trim();
  if (!limpo) {
    return undefined;
  }

  // Normaliza separadores brasileiros ("1.250,50") ou simples ("1250.50")
  const possuiVirgula = limpo.includes(",");
  const padraoCanonica = possuiVirgula ? limpo.replace(/\./g, "").replace(",", ".") : limpo;

  if (!/^\d+(?:\.\d{1,2})?$/.test(padraoCanonica)) {
    throw new ErroValidacaoDominio(
      "Informe um valor monetário válido (ex.: 850 ou 1.250,00), ou deixe em branco para 'Sob consulta'.",
      "FORMATO_VALOR_MONETARIO_INVALIDO",
    );
  }

  const [parteInteiraTexto, parteCentavosTexto = ""] = padraoCanonica.split(".");
  const reaisInteiros = Number(parteInteiraTexto);
  const centavosFracao = Number(parteCentavosTexto.padEnd(2, "0"));
  const totalCentavos = reaisInteiros * 100 + centavosFracao;

  return ValorMonetarioCentavos.deCentavos(totalCentavos).obterCentavos();
}

export function formatarCentavosParaCampoMoeda(centavos?: number): string {
  if (typeof centavos !== "number") {
    return "";
  }
  const reais = Math.floor(centavos / 100);
  const resto = String(centavos % 100).padStart(2, "0");
  return `${reais},${resto}`;
}
