import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Clock } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { LogoNexoAtivo } from "@/componentes/interface/LogoNexoAtivo";
import {
  CLUSTERS_EDITORIAIS,
  formatarDataEditorialPtBr,
} from "@/dominio/conteudo/artigosEditoriais";
import { listarArtigosEditoriais } from "@/infraestrutura/conteudo/catalogoArtigos";

export const metadata: Metadata = {
  title: "Guias práticos de presença digital e atendimento comercial",
  description:
    "Conteúdos objetivos para PMEs e profissionais sobre qualificação de pedidos no WhatsApp, apresentação de serviços, portfólio e cartões digitais de equipe.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/blog",
    siteName: "Nexo Ativo",
    title: "Guias práticos | Nexo Ativo",
    description:
      "Conteúdos objetivos para PMEs e profissionais sobre qualificação de pedidos no WhatsApp, apresentação de serviços, portfólio e cartões digitais de equipe.",
  },
};

export default function PaginaIndiceBlog() {
  const artigos = listarArtigosEditoriais();

  return (
    <div className="flex min-h-dvh flex-col bg-marfim-100/60 text-mineral-950">
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link
            href="/"
            className="text-mineral-950 transition-opacity hover:opacity-80"
            aria-label="Nexo Ativo — Página inicial"
          >
            <LogoNexoAtivo tamanho="padrao" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <Botao
              variante="fantasma"
              tamanho="compacto"
              className="text-neutral-700 hover:bg-neutral-100 hover:text-mineral-950"
              comoFilho
            >
              <Link href="/entrar">Entrar</Link>
            </Botao>
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

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-mineral-600 transition-colors hover:text-mineral-950"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Voltar para a página inicial
          </Link>
        </div>

        <header className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-mineral-700 shadow-2xs ring-1 ring-neutral-200/80">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Guias Práticos
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-mineral-950 sm:text-5xl">
            Presença digital e atendimento comercial sem ruído
          </h1>
          <p className="mt-4 text-base leading-relaxed text-mineral-600 sm:text-lg">
            Roteiros diretos para PMEs e profissionais que querem apresentar melhor seus serviços no
            celular e receber pedidos de orçamento mais claros.
          </p>
        </header>

        <div className="mt-12 space-y-14">
          {CLUSTERS_EDITORIAIS.map((cluster) => {
            const artigosDoCluster = artigos.filter((artigo) => artigo.cluster === cluster.codigo);

            return (
              <section key={cluster.codigo} aria-labelledby={`cluster-${cluster.codigo}`}>
                <div className="border-b border-marfim-200 pb-4">
                  <h2
                    id={`cluster-${cluster.codigo}`}
                    className="font-serif text-2xl font-bold tracking-tight text-mineral-950 sm:text-3xl"
                  >
                    {cluster.titulo}
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-mineral-600">
                    {cluster.descricao}
                  </p>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-3">
                  {artigosDoCluster.map((artigo) => (
                    <Link
                      key={artigo.slug}
                      href={`/blog/${artigo.slug}`}
                      className="group block h-full"
                    >
                      <CartaoSuperficie
                        preenchimento="padrao"
                        className="flex h-full flex-col justify-between bg-white shadow-2xs transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-mineral-300 group-hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-xs text-mineral-500">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                              {artigo.tempoLeituraMinutos} min
                            </span>
                            <span aria-hidden="true">·</span>
                            <time dateTime={artigo.atualizadoEmIso}>
                              {formatarDataEditorialPtBr(artigo.atualizadoEmIso)}
                            </time>
                          </div>
                          <h3 className="mt-3 font-serif text-xl font-bold leading-snug text-mineral-950 group-hover:text-mineral-700">
                            {artigo.titulo}
                          </h3>
                          <p className="mt-2.5 text-sm leading-relaxed text-mineral-600">
                            {artigo.resumoCard}
                          </p>
                        </div>

                        <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-mineral-950">
                          Ler guia completo
                          <ArrowRight
                            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </div>
                      </CartaoSuperficie>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-neutral-200 bg-white py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 text-xs text-neutral-500 sm:px-8">
          <LogoNexoAtivo tamanho="compacto" className="text-mineral-950" />
          <nav aria-label="Links institucionais" className="flex flex-wrap items-center gap-5">
            <Link href="/" className="font-medium text-neutral-600 hover:text-mineral-950">
              Página inicial
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
