import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { CANAIS_DISTRIBUICAO } from "./conteudoLanding";
import { IconeCanalDistribuicao } from "./IconeCanalDistribuicao";
import { PreviaVitrineHero } from "./PreviaVitrineHero";
import { RevelacaoScroll } from "./RevelacaoScroll";
import { TituloDigitadoHero } from "./TituloDigitadoHero";

const GARANTIAS_ENTRADA = [
  "Grátis no modo rascunho",
  "Sem cartão de crédito",
  "Até 10 profissionais no Pro",
] as const;

const ESTILO_BRILHO_CTA_ESCURO = {
  "--editorial-brilho-borda": "rgba(255, 255, 255, 0.24)",
} as CSSProperties;

/**
 * Hero moderno com fechamento digitado, CTA com brilho fluido real do app
 * e revelação progressiva sóbria.
 */
export function HeroLanding() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-200/80 bg-white">
      <div className="mx-auto max-w-6xl px-5 pt-12 pb-16 sm:px-8 sm:pt-18 sm:pb-24 lg:pt-22">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <TituloDigitadoHero
              textoFixo="Crie o microsite que une visual premium, qualificação de leads e "
              textoDigitado="métricas em tempo real."
              className="text-4xl leading-[1.08] font-bold tracking-tight text-mineral-950 sm:text-5xl lg:text-[3.25rem]"
            />

            <RevelacaoScroll atrasoSegundos={0.08} distanciaY={8}>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-neutral-600 sm:text-lg">
                Serviços, portfólio, equipe e atendimento guiado em uma vitrine pensada para
                converter e mostrar o que realmente gera clientes.
              </p>
            </RevelacaoScroll>

            <RevelacaoScroll atrasoSegundos={0.16} distanciaY={8}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Botao
                  variante="operacional_primario"
                  tamanho="amplo"
                  style={ESTILO_BRILHO_CTA_ESCURO}
                  className="efeito-brilho-interior group bg-mineral-950 text-white hover:bg-mineral-800"
                  comoFilho
                >
                  <Link href="/criar-conta">
                    <span className="relative z-10 inline-flex items-center gap-2">
                      Criar minha vitrine grátis
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </Botao>

                <Botao
                  variante="operacional_secundario"
                  tamanho="amplo"
                  className="border-neutral-300 bg-white text-mineral-950 hover:bg-neutral-100"
                  comoFilho
                >
                  <a href="#microfluxos">Ver na prática</a>
                </Botao>
              </div>

              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-neutral-500">
                {GARANTIAS_ENTRADA.map((garantia) => (
                  <li key={garantia} className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-mineral-950" aria-hidden="true" />
                    <span>{garantia}</span>
                  </li>
                ))}
              </ul>
            </RevelacaoScroll>
          </div>

          <div className="lg:col-span-6 lg:pb-6">
            <PreviaVitrineHero />
          </div>
        </div>

        {/* Faixa de canais: apenas ícones pretos limpos com destaque visual elegante */}
        <div className="mt-14 border-t border-neutral-200/80 pt-8 sm:mt-18">
          <RevelacaoScroll distanciaY={8}>
            <p className="text-center text-sm font-semibold tracking-tight text-neutral-600 sm:text-base">
              Um único endereço para todos os seus canais
            </p>
          </RevelacaoScroll>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-11">
            {CANAIS_DISTRIBUICAO.map((canal, indice) => (
              <RevelacaoScroll
                key={canal.id}
                atrasoSegundos={indice * 0.07}
                distanciaY={12}
                duracaoSegundos={0.65}
              >
                <span
                  role="img"
                  aria-label={canal.rotulo}
                  title={canal.rotulo}
                  className="inline-flex text-mineral-950 transition-transform duration-300 hover:-translate-y-1 hover:text-black"
                >
                  <IconeCanalDistribuicao canal={canal.id} className="h-7 w-7 text-mineral-950 sm:h-8 sm:w-8" />
                </span>
              </RevelacaoScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
