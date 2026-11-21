import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { LogoNexoAtivo } from "@/componentes/interface/LogoNexoAtivo";
import {
  formatarDataEditorialPtBr,
  resolverArtigosRelacionados,
  serializarJsonLdArtigoSeguro,
} from "@/dominio/conteudo/artigosEditoriais";
import {
  buscarArtigoEditorialPorSlug,
  listarArtigosEditoriais,
} from "@/infraestrutura/conteudo/catalogoArtigos";
import { lerConfiguracaoAmbientePublico } from "@/validacoes/ambiente";

interface PropriedadesPaginaArtigo {
  readonly params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return listarArtigosEditoriais().map((artigo) => ({
    slug: artigo.slug,
  }));
}

export async function generateMetadata({ params }: PropriedadesPaginaArtigo): Promise<Metadata> {
  const { slug } = await params;
  const artigo = buscarArtigoEditorialPorSlug(slug);

  if (!artigo) {
    return {
      title: "Guia não encontrado",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: artigo.titulo,
    description: artigo.descricaoSeo,
    alternates: {
      canonical: `/blog/${artigo.slug}`,
    },
    openGraph: {
      type: "article",
      locale: "pt_BR",
      url: `/blog/${artigo.slug}`,
      siteName: "Nexo Ativo",
      title: artigo.titulo,
      description: artigo.descricaoSeo,
      publishedTime: artigo.publicadoEmIso,
      modifiedTime: artigo.atualizadoEmIso,
    },
  };
}

export default async function PaginaArtigoEditorial({ params }: PropriedadesPaginaArtigo) {
  const { slug } = await params;
  const artigo = buscarArtigoEditorialPorSlug(slug);

  if (!artigo) {
    notFound();
  }

  const todosArtigos = listarArtigosEditoriais();
  const relacionados = resolverArtigosRelacionados(artigo, todosArtigos, 3);
  const { urlBasePublica } = lerConfiguracaoAmbientePublico();
  const jsonLdSeguro = serializarJsonLdArtigoSeguro(artigo, urlBasePublica);

  return (
    <div className="flex min-h-dvh flex-col bg-marfim-100/60 text-mineral-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro }} />

      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link
            href="/"
            className="text-mineral-950 transition-opacity hover:opacity-80"
            aria-label="Nexo Ativo — Página inicial"
          >
            <LogoNexoAtivo tamanho="padrao" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-xs font-medium text-neutral-600 transition-colors hover:text-mineral-950 sm:text-sm"
            >
              Todos os guias
            </Link>
            <Botao
              variante="operacional_primario"
              tamanho="compacto"
              className="bg-mineral-950 text-white hover:bg-mineral-800"
              comoFilho
            >
              <Link href="/criar-conta">
                Começar grátis
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Botao>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <nav aria-label="Trilha de navegação" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-mineral-500">
          <Link href="/" className="transition-colors hover:text-mineral-950">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog" className="transition-colors hover:text-mineral-950">
            Guias
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-mineral-800">{artigo.rotuloCluster}</span>
        </nav>

        <article>
          <CartaoSuperficie preenchimento="amplo" className="space-y-8 bg-white shadow-xs">
            <header className="border-b border-marfim-200 pb-6">
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-mineral-500">
                <span className="rounded-full bg-marfim-100 px-3 py-1 font-semibold text-mineral-800">
                  {artigo.rotuloCluster}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {artigo.tempoLeituraMinutos} min de leitura
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Atualizado em{" "}
                  <time dateTime={artigo.atualizadoEmIso}>
                    {formatarDataEditorialPtBr(artigo.atualizadoEmIso)}
                  </time>
                </span>
              </div>

              <h1 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight text-mineral-950 sm:text-4xl">
                {artigo.titulo}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-mineral-600">
                {artigo.descricaoSeo}
              </p>
            </header>

            <div className="space-y-4 text-base leading-relaxed text-mineral-800">
              {artigo.introducao.map((paragrafo, indice) => (
                <p key={indice}>{paragrafo}</p>
              ))}
            </div>

            <div className="space-y-8">
              {artigo.secoes.map((secao) => (
                <section key={secao.subtitulo} className="space-y-3">
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-mineral-950">
                    {secao.subtitulo}
                  </h2>
                  {secao.paragrafos.map((paragrafo, indice) => (
                    <p key={indice} className="text-base leading-relaxed text-mineral-800">
                      {paragrafo}
                    </p>
                  ))}
                  {secao.pontosChave && secao.pontosChave.length > 0 ? (
                    <ul className="mt-3 space-y-2.5 rounded-xl bg-marfim-100/70 p-4 sm:p-5">
                      {secao.pontosChave.map((ponto) => (
                        <li
                          key={ponto}
                          className="flex items-start gap-2.5 text-sm leading-relaxed text-mineral-800"
                        >
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-mineral-700"
                            aria-hidden="true"
                          />
                          <span>{ponto}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            <section className="border-t border-marfim-200 pt-6">
              <h2 className="font-serif text-xl font-bold text-mineral-950">Em resumo</h2>
              <p className="mt-2 text-base leading-relaxed text-mineral-700">{artigo.conclusao}</p>
            </section>

            <aside className="rounded-2xl bg-mineral-950 p-6 text-white sm:p-8">
              <h2 className="font-serif text-2xl font-bold tracking-tight">{artigo.ctaTitulo}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-marfim-200">
                {artigo.ctaDescricao}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Botao
                  variante="operacional_primario"
                  tamanho="padrao"
                  className="bg-white text-mineral-950 hover:bg-marfim-100"
                  comoFilho
                >
                  <Link href={artigo.ctaHref}>
                    {artigo.ctaRotulo}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Botao>
                <Link
                  href="/"
                  className="text-xs font-medium text-marfim-200 underline-offset-4 hover:text-white hover:underline"
                >
                  Ver como o Nexo Ativo funciona
                </Link>
              </div>
            </aside>
          </CartaoSuperficie>
        </article>

        {relacionados.length > 0 ? (
          <section aria-labelledby="titulo-relacionados" className="mt-12">
            <div className="flex items-center justify-between gap-4">
              <h2
                id="titulo-relacionados"
                className="font-serif text-2xl font-bold tracking-tight text-mineral-950"
              >
                Continue lendo
              </h2>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-xs font-semibold text-mineral-700 hover:text-mineral-950"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Ver todos os guias
              </Link>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {relacionados.map((relacionado) => (
                <Link
                  key={relacionado.slug}
                  href={`/blog/${relacionado.slug}`}
                  className="group block h-full"
                >
                  <CartaoSuperficie
                    preenchimento="padrao"
                    className="flex h-full flex-col justify-between bg-white shadow-2xs transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-mineral-300 group-hover:shadow-md"
                  >
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-mineral-500">
                        {relacionado.rotuloCluster}
                      </span>
                      <h3 className="mt-2 font-serif text-lg font-bold leading-snug text-mineral-950 group-hover:text-mineral-700">
                        {relacionado.titulo}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-mineral-600">
                        {relacionado.resumoCard}
                      </p>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-mineral-950">
                      Ler guia
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </CartaoSuperficie>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <footer className="border-t border-neutral-200 bg-white py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-5 text-xs text-neutral-500 sm:px-8">
          <LogoNexoAtivo tamanho="compacto" className="text-mineral-950" />
          <nav aria-label="Links institucionais" className="flex flex-wrap items-center gap-5">
            <Link href="/" className="font-medium text-neutral-600 hover:text-mineral-950">
              Página inicial
            </Link>
            <Link href="/blog" className="font-medium text-neutral-600 hover:text-mineral-950">
              Guias
            </Link>
            <Link
              href="/privacidade"
              className="font-medium text-neutral-600 hover:text-mineral-950"
            >
              Privacidade
            </Link>
            <Link href="/termos" className="font-medium text-neutral-600 hover:text-mineral-950">
              Termos de Uso
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
