export interface ConfiguracaoAvaliacoesGoogle {
  readonly habilitado: boolean;
  readonly identificadorLocal?: string;
  readonly modoExibicao: "resumo" | "carrossel";
}

export interface AtribuicaoAvaliacoesGoogle {
  readonly nome: string;
  readonly url?: string;
}

export interface EstabelecimentoGoogle {
  readonly identificadorLocal: string;
  readonly nome: string;
  readonly endereco: string;
  readonly urlGoogleMaps: string;
  readonly atribuicoes: readonly AtribuicaoAvaliacoesGoogle[];
}

export interface AvaliacaoGoogle {
  readonly id: string;
  readonly autor: string;
  readonly urlAutor?: string;
  readonly urlFotoAutor?: string;
  readonly nota: number;
  readonly texto: string;
  readonly publicadaEmIso?: string;
  readonly descricaoData?: string;
  readonly urlAvaliacao?: string;
}

export interface ResumoAvaliacoesGoogle extends EstabelecimentoGoogle {
  readonly notaMedia?: number;
  readonly totalAvaliacoes: number;
  readonly avaliacoes: readonly AvaliacaoGoogle[];
}

export const CONFIGURACAO_AVALIACOES_GOOGLE_PADRAO: ConfiguracaoAvaliacoesGoogle = {
  habilitado: false,
  modoExibicao: "resumo",
};

export function construirUrlLocalGoogle(identificadorLocal: string): string {
  return `https://www.google.com/maps/search/?api=1&query=Estabelecimento&query_place_id=${encodeURIComponent(identificadorLocal)}`;
}

/**
 * Constrói a URL direta oficial do Google para o cliente abrir a caixa de avaliação.
 */
export function construirUrlAvaliacaoGoogle(identificadorLocal: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(identificadorLocal)}`;
}

export function hidratarConfiguracaoAvaliacoesGoogle(
  valor: unknown,
): ConfiguracaoAvaliacoesGoogle | undefined {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return undefined;
  const dados = valor as Record<string, unknown>;
  return {
    habilitado: dados.habilitado === true,
    modoExibicao: dados.modoExibicao === "carrossel" ? "carrossel" : "resumo",
    ...(typeof dados.identificadorLocal === "string"
      ? { identificadorLocal: dados.identificadorLocal.trim() }
      : {}),
  };
}
