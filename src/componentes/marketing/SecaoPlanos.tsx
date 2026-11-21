"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Check, MessageSquare } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { CATALOGO_PLANOS_FLUXO } from "@/dominio/assinaturas/tiposAssinaturaAsaas";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import { RevelacaoScroll } from "./RevelacaoScroll";

const ESTILO_BRILHO_CTA_ESCURO = {
  "--editorial-brilho-borda": "rgba(255, 255, 255, 0.24)",
} as CSSProperties;

/**
 * Seção de planos alimentada diretamente por CATALOGO_PLANOS_FLUXO.
 */
export function SecaoPlanos() {
  const planoPro = CATALOGO_PLANOS_FLUXO.pro;
  const planoEmpresarial = CATALOGO_PLANOS_FLUXO.personalizado;

  const valorProMensal = ValorMonetarioCentavos.deCentavos(
    planoPro.mensalidadeCentavos,
  ).formatarMoedaBrasileira();

  function abrirChatCrisp() {
    if (typeof window !== "undefined") {
      window.$crisp = window.$crisp || [];
      window.$crisp.push(["do", "chat:show"]);
      window.$crisp.push(["do", "chat:open"]);
    }
  }

  return (
    <section
      id="planos"
      aria-labelledby="titulo-planos"
      className="border-b border-neutral-200/80 bg-white py-18 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevelacaoScroll className="mx-auto max-w-xl text-center">
          <h2
            id="titulo-planos"
            className="text-3xl font-bold tracking-tight text-mineral-950 sm:text-4xl"
          >
            Preço simples. Sem surpresas.
          </h2>
          <p className="mt-2.5 text-sm text-neutral-600 sm:text-base">
            Comece grátis no modo rascunho. Assine só quando publicar.
          </p>
        </RevelacaoScroll>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-12">
          {/* Plano Pro */}
          <RevelacaoScroll atrasoSegundos={0.05} className="lg:col-span-7">
            <CartaoSuperficie className="flex h-full flex-col justify-between border-2 border-mineral-950 bg-white p-7 shadow-none">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-2xl font-bold tracking-tight text-mineral-950">
                    Plano {planoPro.nome}
                  </h3>
                  <span className="rounded-full bg-mineral-950 px-3 py-1 text-[11px] font-semibold text-white">
                    Até {planoPro.limiteProfissionaisAtivos} profissionais
                  </span>
                </div>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold tracking-tight text-mineral-950">
                    {valorProMensal}
                  </span>
                  <span className="text-sm font-medium text-neutral-500">/mês</span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Cancele quando quiser · Prévia privada gratuita antes de pagar
                </p>

                <ul className="mt-6 space-y-2.5">
                  {planoPro.destaques.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-700">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-mineral-950"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 space-y-4">
                <Botao
                  variante="operacional_primario"
                  tamanho="amplo"
                  style={ESTILO_BRILHO_CTA_ESCURO}
                  className="efeito-brilho-interior group w-full bg-mineral-950 text-white hover:bg-mineral-800"
                  comoFilho
                >
                  <Link href="/criar-conta">
                    <span className="relative z-10 inline-flex items-center gap-2">
                      Começar grátis
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </Botao>
              </div>
            </CartaoSuperficie>
          </RevelacaoScroll>

          {/* Plano Empresarial */}
          <RevelacaoScroll atrasoSegundos={0.12} className="lg:col-span-5">
            <CartaoSuperficie className="flex h-full flex-col justify-between border border-neutral-200 bg-neutral-50/70 p-7 shadow-none">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-bold tracking-tight text-mineral-950">
                    {planoEmpresarial.nome}
                  </h3>
                  <span className="rounded-full border border-neutral-300 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-neutral-700">
                    Sob medida
                  </span>
                </div>

                <div className="mt-5">
                  <span className="text-3xl font-bold tracking-tight text-mineral-950">
                    Sob consulta
                  </span>
                  <p className="mt-1 text-xs text-neutral-500">Para redes e múltiplas unidades</p>
                </div>

                <ul className="mt-6 space-y-2.5">
                  {planoEmpresarial.destaques.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-700">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-neutral-700"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Botao
                  type="button"
                  onClick={abrirChatCrisp}
                  variante="operacional_secundario"
                  tamanho="amplo"
                  className="group w-full border-neutral-300 bg-white font-semibold text-mineral-950 transition-colors hover:bg-neutral-100"
                >
                  <span className="inline-flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-neutral-600" aria-hidden="true" />
                    Falar sobre projeto
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Botao>
              </div>
            </CartaoSuperficie>
          </RevelacaoScroll>
        </div>
      </div>
    </section>
  );
}
