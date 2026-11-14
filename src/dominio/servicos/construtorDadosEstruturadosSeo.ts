import type { ConteudoPaginaPublicada } from "../entidades/paginaPublicada";

export interface ResumoMetadadosSeoResolvidos {
  readonly titulo: string;
  readonly descricao: string;
  readonly urlCanonica: string;
  readonly urlImagemCompartilhamento: string;
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

  const urlImagemCompartilhamento = pagina.seo.urlImagemCompartilhamento?.trim()
    ? resolverUrlAbsoluta(pagina.seo.urlImagemCompartilhamento.trim(), baseNormalizada)
    : `${urlCanonica}/opengraph-image`;

  const indexavel = pagina.seo.indexavel === true && pagina.publicado && pagina.paginaAtiva;

  return {
    titulo,
    descricao,
    urlCanonica,
    urlImagemCompartilhamento,
    indexavel,
  };
}

export interface DadosEstruturadosJsonLd {
  readonly "@context": "https://schema.org";
  readonly "@type": "ProfessionalService";
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly image: string;
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
    image: metadados.urlImagemCompartilhamento,
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
