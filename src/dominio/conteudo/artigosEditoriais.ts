import type { EntradaRotaSitemap } from "@/dominio/servicos/construtorSitemap";
import { normalizarUrlBaseSitemap } from "@/dominio/servicos/construtorSitemap";

export type ClusterEditorial = "atendimento-whatsapp" | "presenca-comercial";

export interface InformacaoClusterEditorial {
  readonly codigo: ClusterEditorial;
  readonly titulo: string;
  readonly descricao: string;
}

export interface SecaoArtigoEditorial {
  readonly subtitulo: string;
  readonly paragrafos: readonly string[];
  readonly pontosChave?: readonly string[];
}

export interface ImagemCapaEditorial {
  readonly url: string;
  readonly alt: string;
}

export interface ArtigoEditorial {
  readonly slug: string;
  readonly titulo: string;
  readonly descricaoSeo: string;
  readonly resumoCard: string;
  readonly imagemCapa: ImagemCapaEditorial;
  readonly cluster: ClusterEditorial;
  readonly rotuloCluster: string;
  readonly publicadoEmIso: string;
  readonly atualizadoEmIso: string;
  readonly tempoLeituraMinutos: number;
  readonly slugsRelacionados: readonly string[];
  readonly introducao: readonly string[];
  readonly secoes: readonly SecaoArtigoEditorial[];
  readonly conclusao: string;
  readonly ctaTitulo: string;
  readonly ctaDescricao: string;
  readonly ctaRotulo: string;
  readonly ctaHref: string;
}

export const CLUSTERS_EDITORIAIS: readonly InformacaoClusterEditorial[] = [
  {
    codigo: "atendimento-whatsapp",
    titulo: "Atendimento e Orçamentos no WhatsApp",
    descricao:
      "Como organizar o primeiro contato para receber pedidos mais claros, economizar tempo da equipe e responder com mais precisão.",
  },
  {
    codigo: "presenca-comercial",
    titulo: "Apresentação Comercial e Equipe",
    descricao:
      "Como reunir serviços, portfólio, vídeos e cartões digitais de equipe em uma experiência pensada para o celular.",
  },
];

/**
 * Resolve artigos relacionados priorizando os slugs explícitos do cluster,
 * evitando links quebrados, duplicatas e autorreferência.
 */
export function resolverArtigosRelacionados(
  artigoAtual: ArtigoEditorial,
  todosArtigos: readonly ArtigoEditorial[],
  limite = 3,
): readonly ArtigoEditorial[] {
  const porSlug = new Map(todosArtigos.map((artigo) => [artigo.slug, artigo]));
  const selecionados: ArtigoEditorial[] = [];
  const slugsIncluidos = new Set<string>([artigoAtual.slug]);

  for (const slug of artigoAtual.slugsRelacionados) {
    if (selecionados.length >= limite) {
      break;
    }
    const candidato = porSlug.get(slug);
    if (candidato && !slugsIncluidos.has(candidato.slug)) {
      selecionados.push(candidato);
      slugsIncluidos.add(candidato.slug);
    }
  }

  for (const candidato of todosArtigos) {
    if (selecionados.length >= limite) {
      break;
    }
    if (candidato.cluster === artigoAtual.cluster && !slugsIncluidos.has(candidato.slug)) {
      selecionados.push(candidato);
      slugsIncluidos.add(candidato.slug);
    }
  }

  return selecionados;
}

/**
 * Converte a lista de artigos publicados em entradas para o sitemap (incluindo o índice `/blog`),
 * utilizando sempre datas reais de atualização.
 */
export function construirEntradasSitemapArtigos(
  artigos: readonly ArtigoEditorial[],
): readonly EntradaRotaSitemap[] {
  if (artigos.length === 0) {
    return [];
  }

  const dataMaisRecente = artigos
    .map((artigo) => artigo.atualizadoEmIso)
    .sort()
    .at(-1);

  return [
    { caminho: "/blog", atualizadoEmIso: dataMaisRecente },
    ...artigos.map((artigo) => ({
      caminho: `/blog/${artigo.slug}`,
      atualizadoEmIso: artigo.atualizadoEmIso,
    })),
  ];
}

export function construirJsonLdArtigo(
  artigo: ArtigoEditorial,
  urlBasePublica: string,
): Record<string, unknown> {
  const base = normalizarUrlBaseSitemap(urlBasePublica);
  const urlArtigo = `${base}/blog/${artigo.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: artigo.titulo,
        description: artigo.descricaoSeo,
        image: [`${base}${artigo.imagemCapa.url}`],
        inLanguage: "pt-BR",
        datePublished: artigo.publicadoEmIso,
        dateModified: artigo.atualizadoEmIso,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": urlArtigo,
        },
        author: {
          "@type": "Organization",
          name: "Nexo Ativo",
          url: base,
        },
        publisher: {
          "@type": "Organization",
          name: "Nexo Ativo",
          url: base,
          logo: {
            "@type": "ImageObject",
            url: `${base}/logo-nexo-ativo.png`,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Início",
            item: base,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guias",
            item: `${base}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: artigo.titulo,
            item: urlArtigo,
          },
        ],
      },
    ],
  };
}

/**
 * Serializa JSON-LD escapando `<` para impedir fechamento indevido de `<script>`.
 */
export function serializarJsonLdArtigoSeguro(
  artigo: ArtigoEditorial,
  urlBasePublica: string,
): string {
  return JSON.stringify(construirJsonLdArtigo(artigo, urlBasePublica)).replace(/</g, "\\u003c");
}

export function formatarDataEditorialPtBr(iso: string): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  if (!ano || !mes || !dia) {
    return iso;
  }
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(data);
}

