import { ErroIdentificadorReservado, ErroValidacaoDominio } from "../erros/errosDominio";

export const COMPRIMENTO_MINIMO_IDENTIFICADOR = 3;
export const COMPRIMENTO_MAXIMO_IDENTIFICADOR = 48;

const EXPRESSAO_IDENTIFICADOR_VALIDO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Conjunto imutável de slugs protegidos que não podem ser registrados por organizações,
 * preservando as rotas estáticas do sistema (autenticação, painel, fundador e API).
 */
export const IDENTIFICADORES_RESERVADOS: ReadonlySet<string> = new Set([
  "admin",
  "administracao",
  "ajuda",
  "api",
  "app",
  "assinatura",
  "assinaturas",
  "autenticacao",
  "blog",
  "c",
  "cadastro",
  "catalogo",
  "configuracoes",
  "contato",
  "convite",
  "criar-conta",
  "dashboard",
  "desempenho",
  "docs",
  "entrar",
  "equipe",
  "erro",
  "experiencia",
  "experiencias",
  "favicon",
  "fluxo",
  "fundador",
  "indisponivel",
  "inicio",
  "login",
  "logout",
  "painel",
  "planos",
  "portfolio",
  "precos",
  "privacidade",
  "recuperar-senha",
  "redefinir-senha",
  "robots",
  "sair",
  "seguranca",
  "sitemap",
  "sobre",
  "status",
  "suporte",
  "termos",
  "verificar-email",
  "webhooks",
]);

export function normalizarSugestaoIdentificador(textoBruto: string): string {
  return textoBruto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, COMPRIMENTO_MAXIMO_IDENTIFICADOR)
    .replace(/-+$/g, "");
}

/**
 * Objeto de valor que representa o identificador público (slug) de uma organização ou cartão.
 */
export class IdentificadorPublico {
  private readonly valor: string;

  private constructor(valorLimpo: string) {
    if (valorLimpo.length < COMPRIMENTO_MINIMO_IDENTIFICADOR) {
      throw new ErroValidacaoDominio(
        `O endereço público deve ter pelo menos ${COMPRIMENTO_MINIMO_IDENTIFICADOR} caracteres.`,
        "IDENTIFICADOR_MUITO_CURTO",
      );
    }

    if (valorLimpo.length > COMPRIMENTO_MAXIMO_IDENTIFICADOR) {
      throw new ErroValidacaoDominio(
        `O endereço público deve ter no máximo ${COMPRIMENTO_MAXIMO_IDENTIFICADOR} caracteres.`,
        "IDENTIFICADOR_MUITO_LONGO",
      );
    }

    if (!EXPRESSAO_IDENTIFICADOR_VALIDO.test(valorLimpo)) {
      throw new ErroValidacaoDominio(
        "Use apenas letras minúsculas sem acento, números e hífens simples entre palavras.",
        "FORMATO_IDENTIFICADOR_INVALIDO",
      );
    }

    if (IDENTIFICADORES_RESERVADOS.has(valorLimpo)) {
      throw new ErroIdentificadorReservado(valorLimpo);
    }

    this.valor = valorLimpo;
  }

  public static criar(valorInformado: string): IdentificadorPublico {
    return new IdentificadorPublico(valorInformado.trim());
  }

  public obterValor(): string {
    return this.valor;
  }

  public igualA(outro: IdentificadorPublico): boolean {
    return this.valor === outro.valor;
  }
}

export function ehIdentificadorPublicoValido(valorInformado: string): boolean {
  try {
    IdentificadorPublico.criar(valorInformado);
    return true;
  } catch {
    return false;
  }
}
