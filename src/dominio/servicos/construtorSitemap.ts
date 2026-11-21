import type { MetadataRoute } from "next";

export interface EntradaRotaSitemap {
  readonly caminho: string;
  readonly atualizadoEmIso?: string;
}

/**
 * Datas reais da última revisão substantiva das rotas institucionais públicas.
 * Atualize somente quando houver alteração significativa de conteúdo ou estrutura,
 * conforme recomendação do Google Search Central para `<lastmod>`.
 */
export const ROTAS_INSTITUCIONAIS_SITEMAP: readonly EntradaRotaSitemap[] = [
  { caminho: "/", atualizadoEmIso: "2026-11-21" },
  { caminho: "/privacidade", atualizadoEmIso: "2026-11-21" },
  { caminho: "/termos", atualizadoEmIso: "2026-11-21" },
];

/**
 * Rotas privadas, administrativas, de API e autenticação bloqueadas para rastreamento.
 * Vitrines públicas (`/[identificadorOrganizacao]`) permanecem liberadas para que o
 * Googlebot leia a diretiva `<meta name="robots">` configurada por cada organização.
 */
export const CAMINHOS_BLOQUEADOS_ROBOTS: readonly string[] = [
  "/painel",
  "/fundador",
  "/api",
  "/entrar",
  "/criar-conta",
  "/recuperar-senha",
  "/redefinir-senha",
  "/verificar-email",
];

export function normalizarUrlBaseSitemap(urlBasePublica: string): string {
  return urlBasePublica.trim().replace(/\/+$/, "");
}

function normalizarCaminhoRelativo(caminhoBruto: string): string {
  const limpo = caminhoBruto.trim();
  if (!limpo || limpo === "/") {
    return "/";
  }
  const comBarraInicial = limpo.startsWith("/") ? limpo : `/${limpo}`;
  return comBarraInicial.replace(/\/+$/, "") || "/";
}

function resolverDataValida(isoOpcional?: string): Date | undefined {
  if (!isoOpcional?.trim()) {
    return undefined;
  }
  const data = new Date(isoOpcional);
  return Number.isNaN(data.getTime()) ? undefined : data;
}

/**
 * Constrói a lista normalizada e deduplicada de entradas do sitemap institucional/editorial.
 */
export function construirEntradasSitemap(
  urlBasePublica: string,
  rotasAdicionais: readonly EntradaRotaSitemap[] = [],
): MetadataRoute.Sitemap {
  const urlBase = normalizarUrlBaseSitemap(urlBasePublica);
  const todasRotas = [...ROTAS_INSTITUCIONAIS_SITEMAP, ...rotasAdicionais];
  const urlsVistas = new Set<string>();
  const entradas: MetadataRoute.Sitemap = [];

  for (const rota of todasRotas) {
    const caminhoNormalizado = normalizarCaminhoRelativo(rota.caminho);
    const urlCompleta = caminhoNormalizado === "/" ? urlBase : `${urlBase}${caminhoNormalizado}`;

    if (urlsVistas.has(urlCompleta)) {
      continue;
    }
    urlsVistas.add(urlCompleta);

    const lastModified = resolverDataValida(rota.atualizadoEmIso);
    entradas.push(lastModified ? { url: urlCompleta, lastModified } : { url: urlCompleta });
  }

  return entradas;
}

/**
 * Constrói a configuração padronizada de `robots.txt` apontando para o sitemap oficial.
 */
export function construirConfiguracaoRobots(urlBasePublica: string): MetadataRoute.Robots {
  const urlBase = normalizarUrlBaseSitemap(urlBasePublica);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...CAMINHOS_BLOQUEADOS_ROBOTS],
    },
    sitemap: `${urlBase}/sitemap.xml`,
  };
}

