import type { ConteudoPaginaPublicada } from "../entidades/paginaPublicada";

export interface ResumoMetadadosSeoResolvidos {
  readonly titulo: string;
  readonly descricao: string;
  readonly urlCanonica: string;
  /**
   * URL absoluta de imagem raster própria da organização para compartilhamento social.
   * Quando indefinida, a rota deve deixar o Next.js injetar automaticamente a rota com hash
   * gerada pelo arquivo `opengraph-image.tsx`.
   */
  readonly urlImagemCompartilhamento?: string;
  readonly indexavel: boolean;
}

function normalizarUrlBase(urlBasePublica: string): string {
  return urlBasePublica.replace(/\/+$/, "");
}

function resolverUrlAbsoluta(urlOuCaminho: string, urlBaseNormalizada: string): string {
  if (/^https?:\/\//i.test(urlOuCaminho)) {
    return urlOuCaminho;
  }
  const caminhoComBarra = urlOuCaminho.startsWith("/") ? urlOuCaminho : `/${urlOuCaminho}`;
  return `${urlBaseNormalizada}${caminhoComBarra}`;
}

/**
 * Valida se uma URL de imagem pode ser consumida por crawlers sociais (WhatsApp, Facebook, X):
 * descarta strings vazias, data/blob URIs, SVGs e placeholders genéricos.
 */
function ehUrlImagemCompartilhavelRaster(urlBruta: string | undefined): urlBruta is string {
  const limpa = urlBruta?.trim();
  if (!limpa) {
    return false;
  }

  const minuscula = limpa.toLowerCase();
  if (
    minuscula.startsWith("data:") ||
    minuscula.startsWith("blob:") ||
    minuscula.includes("imersivo-arquitetura-luz")
  ) {
    return false;
  }

  const caminhoSemQuery = minuscula.split(/[?#]/)[0] ?? "";
  if (caminhoSemQuery.endsWith(".svg")) {
    return false;
  }

  return /^https?:\/\//i.test(limpa) || limpa.startsWith("/");
}

/**
 * Resolve a imagem de compartilhamento priorizando sempre os dados reais da organização:
 * 1) Imagem de compartilhamento configurada explicitamente em SEO;
 * 2) Mídia de capa da vitrine (imagem principal ou pôster do vídeo);
 * 3) Logotipo raster da organização.
 */
export function resolverUrlImagemCompartilhamentoUsuario(
  pagina: ConteudoPaginaPublicada,
  urlBaseNormalizada: string,
): string | undefined {
  const imagemMidiaCapa =
    pagina.midiaFundo.tipo === "imagem"
      ? pagina.midiaFundo.urlPrincipal
      : pagina.midiaFundo.tipo === "video"
        ? pagina.midiaFundo.urlPosterVideo
        : undefined;

  const candidatas = [
    pagina.seo.urlImagemCompartilhamento,
    imagemMidiaCapa,
    pagina.identidade.urlLogotipoOpcional,
  ];

  for (const candidata of candidatas) {
    if (ehUrlImagemCompartilhavelRaster(candidata)) {
      return resolverUrlAbsoluta(candidata.trim(), urlBaseNormalizada);
    }
  }

  return undefined;
}

export function construirResumoMetadadosSeo(
  pagina: ConteudoPaginaPublicada,
  urlBasePublica: string,
): ResumoMetadadosSeoResolvidos {
  const baseNormalizada = normalizarUrlBase(urlBasePublica);
  const urlCanonica = `${baseNormalizada}/${pagina.identificadorPublico}`;

  const subtituloMarca = pagina.identidade.subtituloCurto
    ? ` — ${pagina.identidade.subtituloCurto}`
    : "";
  const tituloPadrao = `${pagina.identidade.nomeExibicao}${subtituloMarca}`;
  const titulo = (pagina.seo.tituloSeo?.trim() || tituloPadrao).slice(0, 75);

  const descricaoPadrao =
    pagina.chamadaEditorial.descricaoCurta?.trim() ||
    pagina.chamadaEditorial.tituloPrincipal.trim();
  const descricao = (pagina.seo.descricaoSeo?.trim() || descricaoPadrao).slice(0, 165);

  const urlImagemCompartilhamento = resolverUrlImagemCompartilhamentoUsuario(
    pagina,
    baseNormalizada,
  );

  const indexavel = pagina.seo.indexavel === true && pagina.publicado && pagina.paginaAtiva;

  return {
    titulo,
    descricao,
    urlCanonica,
    ...(urlImagemCompartilhamento ? { urlImagemCompartilhamento } : {}),
    indexavel,
  };
}

export interface DadosEstruturadosJsonLd {
  readonly "@context": "https://schema.org";
  readonly "@type": "ProfessionalService";
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly image?: string;
  readonly areaServed?: string;
  readonly sameAs?: readonly string[];
}

export function construirObjetoJsonLdPaginaPublicada(
  pagina: ConteudoPaginaPublicada,
  urlBasePublica: string,
): DadosEstruturadosJsonLd {
  const metadados = construirResumoMetadadosSeo(pagina, urlBasePublica);

  const perfisExternos = pagina.redesSociais
    .map((item) => item.url.trim())
    .filter((url) => /^https?:\/\//i.test(url));

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: pagina.identidade.nomeExibicao,
    description: metadados.descricao,
    url: metadados.urlCanonica,
    ...(metadados.urlImagemCompartilhamento ? { image: metadados.urlImagemCompartilhamento } : {}),
    ...(pagina.identidade.cidadeEstado ? { areaServed: pagina.identidade.cidadeEstado } : {}),
    ...(perfisExternos.length > 0 ? { sameAs: perfisExternos } : {}),
  };
}

/**
 * Serializa o JSON-LD escapando `<` para impedir injeção de fechamento de `<script>`.
 */
export function serializarJsonLdSeguro(
  pagina: ConteudoPaginaPublicada,
  urlBasePublica: string,
): string {
  const objeto = construirObjetoJsonLdPaginaPublicada(pagina, urlBasePublica);
  return JSON.stringify(objeto).replace(/</g, "\\u003c");
}
