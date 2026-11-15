import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { TransicaoEditorial } from "@/componentes/interface/TransicaoEditorial";

const PILARES_PRODUTO = [
  {
    titulo: "Vitrine digital",
    descricao: "Serviços, portfólio e equipe organizados para Desktop e Mobile.",
  },
  {
    titulo: "Microfluxos comerciais",
    descricao: "Perguntas rápidas que conduzem o visitante até o pedido certo.",
  },
  {
    titulo: "Painel de solicitações",
    descricao: "Receba leads qualificados e prontos para atendimento.",
  },
] as const;

/**
 * Seção principal ultra minimalista: foco total na clareza da proposta
 * e nos três pilares essenciais do Nexo Ativo.
 */
export function HeroLanding() {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 sm:px-10 sm:pt-28 sm:pb-24">
      <TransicaoEditorial className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl leading-[1.08] font-bold tracking-tight text-mineral-950 sm:text-6xl">
          Sua vitrine digital que transforma visitas em pedidos qualificados.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-mineral-600 sm:text-lg">
          Apresente serviços, portfólio e microfluxos comerciais em{" "}
          <strong className="font-semibold text-mineral-900">nexoativo.com.br</strong>.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Botao variante="operacional_primario" tamanho="amplo" comoFilho>
            <Link href="/criar-conta">
              Criar minha presença
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Botao>

          <a
            href="#planos"
            className="text-sm font-medium text-mineral-600 transition-colors hover:text-mineral-950"
          >
            Ver planos
          </a>
        </div>
      </TransicaoEditorial>

      <div className="mt-20 grid gap-8 border-t border-marfim-200/80 pt-10 sm:grid-cols-3">
        {PILARES_PRODUTO.map((pilar) => (
          <div key={pilar.titulo}>
            <h2 className="text-sm font-bold tracking-tight text-mineral-950">{pilar.titulo}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-mineral-600">{pilar.descricao}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
