import type { CanalOrigemTrafego } from "@/dominio/analytics/tiposMetricasAgregadas";

export interface AtribuicaoOrigemSessao {
  readonly canalOrigem: CanalOrigemTrafego;
  readonly cartaoProfissionalId?: string;
}

const CHAVE_STORAGE_PREFIXO = "fluxo_atribuicao_origem_";

/**
 * Detecta a origem do visitante respeitando estritamente a privacidade (zero cookies persistentes).
 * Armazena temporariamente na sessionStorage da aba atual para manter a atribuição consistente
 * durante toda a navegação e conversão do microfluxo.
 */
export function obterOuDetectarOrigemSessao(organizacaoId: string): AtribuicaoOrigemSessao {
  if (typeof window === "undefined") {
    return { canalOrigem: "direto" };
  }

  const chave = `${CHAVE_STORAGE_PREFIXO}${organizacaoId}`;

  const entradaPermalink = /^#experiencia=e-[a-zA-Z0-9_-]+(?:\?|$)/.test(window.location.hash);

  try {
    const gravado = window.sessionStorage.getItem(chave);
    if (gravado) {
      const parsed = JSON.parse(gravado) as AtribuicaoOrigemSessao;
      if (parsed && parsed.canalOrigem && !entradaPermalink) {
        return parsed;
      }
    }
  } catch {
    // sessionStorage indisponível ou bloqueado
  }

  // 1. Analisa parâmetros da URL e Hash
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash || "";
  const hashParams = hash.includes("?")
    ? new URLSearchParams(hash.slice(hash.indexOf("?") + 1))
    : null;

  const origemParam =
    searchParams.get("origem") ??
    hashParams?.get("origem") ??
    searchParams.get("utm_source") ??
    hashParams?.get("utm_source");

  const consultorParam =
    searchParams.get("consultor") ??
    hashParams?.get("consultor") ??
    searchParams.get("vendedor") ??
    hashParams?.get("vendedor");

  let canal: CanalOrigemTrafego = "direto";
  const cartaoId: string | undefined =
    consultorParam && /^[a-zA-Z0-9_-]{1,120}$/.test(consultorParam) ? consultorParam : undefined;

  if (entradaPermalink || origemParam === "permalink") {
    canal = "permalink";
  } else if (origemParam === "cartao_equipe" || consultorParam) {
    canal = "cartao_equipe";
  } else if (
    origemParam === "instagram" ||
    origemParam === "ig" ||
    origemParam?.toLowerCase().includes("instagram")
  ) {
    canal = "instagram";
  } else if (
    origemParam === "whatsapp" ||
    origemParam === "wa" ||
    origemParam?.toLowerCase().includes("whatsapp")
  ) {
    canal = "whatsapp";
  } else if (origemParam === "google") {
    canal = "google";
  } else {
    // 2. Se não houver parâmetro explícito, verifica o cabeçalho referrer do navegador
    const referrer = (document.referrer || "").toLowerCase();
    if (referrer.includes("instagram.com") || referrer.includes("l.instagram.com")) {
      canal = "instagram";
    } else if (referrer.includes("whatsapp.com") || referrer.includes("wa.me")) {
      canal = "whatsapp";
    } else if (
      referrer.includes("google.com") ||
      referrer.includes("google.com.br") ||
      referrer.includes("android-app://com.google.android.googlequicksearchbox")
    ) {
      canal = "google";
    }
  }

  const resultado: AtribuicaoOrigemSessao = {
    canalOrigem: canal,
    ...(cartaoId ? { cartaoProfissionalId: cartaoId } : {}),
  };

  try {
    window.sessionStorage.setItem(chave, JSON.stringify(resultado));
  } catch {
    // Silencioso
  }

  return resultado;
}

/**
 * Permite definir ou atualizar explicitamente a atribuição de origem na sessão atual
 * (por exemplo, quando o visitante acessa diretamente o Cartão VIP de um consultor).
 */
export function gravarAtribuicaoOrigem(
  organizacaoId: string,
  atribuicao: AtribuicaoOrigemSessao,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const chave = `${CHAVE_STORAGE_PREFIXO}${organizacaoId}`;
  try {
    window.sessionStorage.setItem(chave, JSON.stringify(atribuicao));
  } catch {
    // Silencioso
  }
}
