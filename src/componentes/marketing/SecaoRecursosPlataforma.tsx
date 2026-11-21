import Image from "next/image";
import Link from "next/link";
import { ArrowRight, QrCode } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { RECURSOS_PLATAFORMA } from "./conteudoLanding";
import { RevelacaoScroll } from "./RevelacaoScroll";

/**
 * Grade enxuta de recursos + destaque Offline -> Online (Equipe e QR Code)
 * com revelação progressiva sóbria no scroll.
 */
export function SecaoRecursosPlataforma() {
  return (
    <section
      id="recursos"
      aria-labelledby="titulo-recursos"
      className="border-b border-neutral-200/80 bg-white py-18 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevelacaoScroll className="max-w-xl">
          <h2
            id="titulo-recursos"
            className="text-3xl font-bold tracking-tight text-mineral-950 sm:text-4xl"
          >
            Tudo o que você precisa, sem complicação.
          </h2>
          <p className="mt-2.5 text-sm text-neutral-600 sm:text-base">
            Atualize em segundos pelo painel, sem depender de agência ou WordPress.
          </p>
        </RevelacaoScroll>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RECURSOS_PLATAFORMA.map((recurso, indice) => (
            <RevelacaoScroll key={recurso.id} atrasoSegundos={indice * 0.04} className="h-full">
              <CartaoSuperficie className="h-full border border-neutral-200 bg-neutral-50/70 p-5 shadow-none transition-colors hover:border-neutral-300">
                <h3 className="text-base font-bold tracking-tight text-mineral-950">
                  {recurso.titulo}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                  {recurso.descricao}
                </p>
              </CartaoSuperficie>
            </RevelacaoScroll>
          ))}
        </div>

        {/* Destaque Equipe + QR Code */}
        <RevelacaoScroll atrasoSegundos={0.08} className="mt-12">
          <div className="grid items-center gap-8 overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                <QrCode className="h-3.5 w-3.5 text-mineral-950" aria-hidden="true" />
                Offline → Online
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-mineral-950 sm:text-3xl">
                Até 10 profissionais com cartão digital e QR Code próprios.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
                Use no balcão, na recepção ou no cartão da equipe. O cliente salva o contato na
                agenda (vCard) e acessa todo o seu catálogo na hora.
              </p>

              <div className="mt-7">
                <Botao
                  variante="operacional_secundario"
                  tamanho="padrao"
                  className="group border-neutral-300 bg-white text-mineral-950 hover:bg-neutral-100"
                  comoFilho
                >
                  <Link href="/criar-conta">
                    Criar cartões grátis
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </Botao>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/marketing/recepcao-offline-online.jpg"
                    alt="Cliente escaneando QR Code minimalista sobre balcão de recepção com smartphone"
                    fill
                    sizes="(max-width: 1024px) 100vw, 520px"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-mineral-950/65 via-transparent to-transparent"
                    aria-hidden="true"
                  />
                  <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between rounded-xl border border-white/15 bg-mineral-950/75 px-4 py-3 text-xs text-white backdrop-blur-md">
                    <span className="font-semibold">Cartão Digital + vCard + QR Code</span>
                    <span className="rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold text-mineral-950">
                      Incluso no Pro
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevelacaoScroll>
      </div>
    </section>
  );
}
