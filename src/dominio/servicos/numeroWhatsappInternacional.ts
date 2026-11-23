const DDI_BRASIL = "55";
const TAMANHO_MINIMO_INTERNACIONAL = 8;
const TAMANHO_MAXIMO_E164 = 15;

/**
 * Normaliza um número digitado livremente para o formato exigido pelo wa.me
 * (somente dígitos, com DDI).
 *
 * Regras:
 * - "+" ou "00" no início indica DDI explícito: é respeitado como está.
 * - Sem prefixo, números nacionais brasileiros (10 ou 11 dígitos) recebem o DDI 55.
 * - Sem prefixo e com 12+ dígitos, assume-se que o DDI já foi informado.
 *
 * Retorna null quando o número é inválido (vazio, curto ou acima do limite E.164).
 */
export function normalizarNumeroWhatsappInternacional(
  numeroBruto: string | null | undefined,
): string | null {
  if (!numeroBruto) return null;

  const texto = numeroBruto.trim();
  const temDdiExplicito = texto.startsWith("+") || texto.replace(/\D/g, "").startsWith("00");
  let digitos = texto.replace(/\D/g, "");

  if (temDdiExplicito) {
    digitos = digitos.replace(/^00/, "");
  } else if (digitos.length <= 11) {
    digitos = `${DDI_BRASIL}${digitos.replace(/^0+/, "")}`;
  }

  if (digitos.length < TAMANHO_MINIMO_INTERNACIONAL || digitos.length > TAMANHO_MAXIMO_E164) {
    return null;
  }

  return digitos;
}

export interface OpcaoDdiPais {
  readonly regiao: string;
  readonly nome: string;
  readonly ddi: string;
}

/** Países oferecidos no seletor de DDI (código ISO 3166-1 alpha-2 em `regiao`). */
export const OPCOES_DDI_PAISES: readonly OpcaoDdiPais[] = [
  { regiao: "BR", nome: "Brasil", ddi: "55" },
  { regiao: "PT", nome: "Portugal", ddi: "351" },
  { regiao: "US", nome: "Estados Unidos / Canadá", ddi: "1" },
  { regiao: "AR", nome: "Argentina", ddi: "54" },
  { regiao: "UY", nome: "Uruguai", ddi: "598" },
  { regiao: "PY", nome: "Paraguai", ddi: "595" },
  { regiao: "CL", nome: "Chile", ddi: "56" },
  { regiao: "CO", nome: "Colômbia", ddi: "57" },
  { regiao: "PE", nome: "Peru", ddi: "51" },
  { regiao: "BO", nome: "Bolívia", ddi: "591" },
  { regiao: "EC", nome: "Equador", ddi: "593" },
  { regiao: "VE", nome: "Venezuela", ddi: "58" },
  { regiao: "MX", nome: "México", ddi: "52" },
  { regiao: "ES", nome: "Espanha", ddi: "34" },
  { regiao: "FR", nome: "França", ddi: "33" },
  { regiao: "IT", nome: "Itália", ddi: "39" },
  { regiao: "DE", nome: "Alemanha", ddi: "49" },
  { regiao: "GB", nome: "Reino Unido", ddi: "44" },
  { regiao: "CH", nome: "Suíça", ddi: "41" },
  { regiao: "NL", nome: "Países Baixos", ddi: "31" },
  { regiao: "BE", nome: "Bélgica", ddi: "32" },
  { regiao: "IE", nome: "Irlanda", ddi: "353" },
  { regiao: "AO", nome: "Angola", ddi: "244" },
  { regiao: "MZ", nome: "Moçambique", ddi: "258" },
  { regiao: "CV", nome: "Cabo Verde", ddi: "238" },
  { regiao: "ZA", nome: "África do Sul", ddi: "27" },
  { regiao: "AE", nome: "Emirados Árabes", ddi: "971" },
  { regiao: "JP", nome: "Japão", ddi: "81" },
  { regiao: "CN", nome: "China", ddi: "86" },
  { regiao: "IN", nome: "Índia", ddi: "91" },
  { regiao: "AU", nome: "Austrália", ddi: "61" },
];

export const DDI_PADRAO = DDI_BRASIL;

/**
 * Resolve o DDI padrão a partir do locale do navegador (ex.: "pt-PT" → "351").
 * Cai para o Brasil (55) se o locale for ausente, inválido ou sem correspondência.
 */
export function obterDdiPadraoPorLocale(locale: string | null | undefined): string {
  if (!locale) return DDI_PADRAO;
  try {
    const regiao = new Intl.Locale(locale).maximize().region;
    const opcao = OPCOES_DDI_PAISES.find((o) => o.regiao === regiao);
    return opcao?.ddi ?? DDI_PADRAO;
  } catch {
    return DDI_PADRAO;
  }
}

/** Compõe o valor armazenado "+DDI número" a partir do DDI e do número nacional. */
export function comporNumeroComDdi(ddi: string, numeroNacional: string): string {
  const digitos = numeroNacional.replace(/\D/g, "").replace(/^0+/, "");
  return digitos ? `+${ddi.replace(/\D/g, "")}${digitos}` : "";
}

function encontrarOpcaoDdiPorPrefixo(digitos: string): OpcaoDdiPais | undefined {
  return [...OPCOES_DDI_PAISES]
    .sort((a, b) => b.ddi.length - a.ddi.length)
    .find((opcao) => digitos.startsWith(opcao.ddi));
}

/**
 * Separa um valor armazenado em DDI + número nacional.
 * Valores com prefixo explícito ("+" ou "00") têm o DDI extraído mesmo durante digitação parcial.
 * Valores legados sem "+" seguem as mesmas regras de `normalizarNumeroWhatsappInternacional`.
 */
export function separarDdiENumero(valor: string | null | undefined): {
  readonly ddi: string | null;
  readonly numeroNacional: string;
} {
  const texto = (valor ?? "").trim();
  const digitosBrutos = texto.replace(/\D/g, "");
  if (!digitosBrutos) {
    return { ddi: null, numeroNacional: "" };
  }

  const temPrefixoMais = texto.startsWith("+");
  const temPrefixoDuploZero = !temPrefixoMais && digitosBrutos.startsWith("00");
  if (temPrefixoMais || temPrefixoDuploZero) {
    const digitosSemPrefixo = temPrefixoMais
      ? texto.slice(1).replace(/\D/g, "")
      : digitosBrutos.replace(/^00/, "");
    const escolhido = encontrarOpcaoDdiPorPrefixo(digitosSemPrefixo);
    if (escolhido) {
      return {
        ddi: escolhido.ddi,
        numeroNacional: digitosSemPrefixo.slice(escolhido.ddi.length),
      };
    }
    return { ddi: null, numeroNacional: digitosSemPrefixo };
  }

  const normalizado = normalizarNumeroWhatsappInternacional(valor);
  if (!normalizado) {
    return { ddi: null, numeroNacional: digitosBrutos };
  }
  const escolhido = encontrarOpcaoDdiPorPrefixo(normalizado);
  if (!escolhido) return { ddi: null, numeroNacional: normalizado };
  return { ddi: escolhido.ddi, numeroNacional: normalizado.slice(escolhido.ddi.length) };
}

/** Monta o link wa.me com mensagem opcional; null se o número for inválido. */
export function montarLinkWhatsapp(
  numeroBruto: string | null | undefined,
  mensagem?: string,
): string | null {
  const numero = normalizarNumeroWhatsappInternacional(numeroBruto);
  if (!numero) return null;
  return mensagem
    ? `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
    : `https://wa.me/${numero}`;
}

