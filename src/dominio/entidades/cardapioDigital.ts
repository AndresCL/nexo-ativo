import { ErroValidacaoDominio } from "../erros/errosDominio";

export const LIMITE_MAXIMO_CARDAPIOS_ORGANIZACAO = 8;
export const LIMITE_MAXIMO_PAGINAS_CARDAPIO = 20;
export const TAMANHO_MAXIMO_PDF_CARDAPIO_BYTES = 15 * 1024 * 1024; // 15 MB

export interface PaginaCardapio {
  readonly url: string;
  readonly largura: number;
  readonly altura: number;
  readonly ordem: number;
  readonly caminhoStorageOpcional?: string;
}

export interface CardapioOrganizacao {
  readonly id: string;
  readonly organizacaoId: string;
  readonly slug: string;
  readonly titulo: string;
  readonly subtituloOpcional?: string;
  readonly urlPdfOriginal?: string;
  readonly caminhoPdfStorageOpcional?: string;
  readonly paginas: readonly PaginaCardapio[];
  readonly ordemExibicao: number;
  readonly ativo: boolean;
  readonly atualizadoEmIso: string;
}

/**
 * Gera um slug limpo e URL-safe a partir do título do cardápio
 * (ex.: "Carta de Vinhos & Drinks" -> "carta-de-vinhos-drinks").
 */
export function gerarSlugCardapio(titulo: string, fallback = "cardapio"): string {
  const normalizado = titulo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return normalizado || fallback;
}

/**
 * Garante slug único entre os cardápios da mesma organização, acrescentando sufixo numérico se necessário.
 */
export function garantirSlugCardapioUnico(
  slugBase: string,
  cardapiosExistentes: readonly Pick<CardapioOrganizacao, "id" | "slug">[],
  idEmEdicao?: string,
): string {
  const usados = new Set(
    cardapiosExistentes
      .filter((item) => item.id !== idEmEdicao)
      .map((item) => item.slug.toLowerCase()),
  );

  if (!usados.has(slugBase)) {
    return slugBase;
  }

  for (let sufixo = 2; sufixo <= 99; sufixo++) {
    const candidato = `${slugBase}-${sufixo}`;
    if (!usados.has(candidato)) {
      return candidato;
    }
  }

  return `${slugBase}-${Date.now()}`;
}

export function ordenarPaginasCardapio(
  paginas: readonly PaginaCardapio[],
): readonly PaginaCardapio[] {
  return paginas
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
    .map((pagina, indice) => ({ ...pagina, ordem: indice }));
}

export function ordenarCardapiosAtivos(
  cardapios: readonly CardapioOrganizacao[],
): readonly CardapioOrganizacao[] {
  return cardapios
    .filter((item) => item.ativo && item.paginas.length > 0)
    .slice()
    .sort((a, b) => a.ordemExibicao - b.ordemExibicao || a.id.localeCompare(b.id))
    .map((item) => ({
      ...item,
      paginas: ordenarPaginasCardapio(item.paginas),
    }));
}

export function resolverCardapioInicial(
  cardapiosAtivos: readonly CardapioOrganizacao[],
  slugPreferido?: string | null,
): CardapioOrganizacao | null {
  if (cardapiosAtivos.length === 0) return null;
  if (slugPreferido?.trim()) {
    const alvo = slugPreferido.trim().toLowerCase();
    const encontrado = cardapiosAtivos.find((item) => item.slug.toLowerCase() === alvo);
    if (encontrado) return encontrado;
  }
  return cardapiosAtivos[0] ?? null;
}

export function validarLimiteCardapiosOrganizacao(
  cardapiosExistentes: readonly Pick<CardapioOrganizacao, "id">[],
  idEmEdicao?: string,
): void {
  const outros = cardapiosExistentes.filter((item) => item.id !== idEmEdicao).length;
  if (outros + 1 > LIMITE_MAXIMO_CARDAPIOS_ORGANIZACAO) {
    throw new ErroValidacaoDominio(
      `É possível cadastrar no máximo ${LIMITE_MAXIMO_CARDAPIOS_ORGANIZACAO} cardápios por organização.`,
      "LIMITE_CARDAPIOS_EXCEDIDO",
    );
  }
}

export function validarArquivoPdfCardapio(arquivo: Pick<File, "type" | "size" | "name">): void {
  const ehPdf =
    arquivo.type.toLowerCase() === "application/pdf" ||
    arquivo.name.toLowerCase().endsWith(".pdf");

  if (!ehPdf) {
    throw new ErroValidacaoDominio(
      "Envie um arquivo PDF válido.",
      "TIPO_ARQUIVO_CARDAPIO_INVALIDO",
    );
  }

  if (arquivo.size > TAMANHO_MAXIMO_PDF_CARDAPIO_BYTES) {
    throw new ErroValidacaoDominio(
      "O PDF excede o limite de 15 MB. Comprima o arquivo antes de enviar.",
      "TAMANHO_PDF_CARDAPIO_EXCEDIDO",
    );
  }
}

