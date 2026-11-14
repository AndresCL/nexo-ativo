import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { TransicaoEditorial } from "@/componentes/interface/TransicaoEditorial";
import { ValidadorEnderecoPublico } from "@/componentes/interface/ValidadorEnderecoPublico";
import { CATALOGO_COMPOSICOES_EDITORIAIS } from "@/dominio/entidades/composicaoEditorial";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";

export default function PaginaApresentacaoInicial() {
  const composicoes = Object.values(CATALOGO_COMPOSICOES_EDITORIAIS);
  const valorPlanoPro = ValorMonetarioCentavos.deCentavos(9700).formatarMoedaBrasileira();
  const valorPlanoEquipe = ValorMonetarioCentavos.deCentavos(19700).formatarMoedaBrasileira();

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-between px-6 py-10 sm:px-10 lg:py-14">
      <header className="flex items-center justify-between">
        <span className="font-editorial text-2xl tracking-wide text-marfim-100">Fluxo</span>
        <nav aria-label="Acesso rápido" className="flex items-center gap-3">
          <Botao variante="editorial_contorno" tamanho="compacto" comoFilho>
            <Link href="/entrar">Entrar</Link>
          </Botao>
        </nav>
      </header>

      <section className="my-14 grid items-center gap-12 lg:grid-cols-12">
        <TransicaoEditorial className="lg:col-span-7">
          <p className="text-xs tracking-[0.24em] text-destaque-dourado uppercase">
            Presença Digital Editorial &amp; Microfluxos
          </p>
          <h1 className="mt-4 font-editorial text-4xl leading-[1.08] font-light text-marfim-50 sm:text-6xl">
            A sofisticação de uma apresentação autoral com condução comercial real.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-mineral-300">
            Projetado para profissionais autônomos, clínicas, escritórios, estúdios e equipes
            comerciais que precisam apresentar seu trabalho com elegância e converter interesse em
            solicitações qualificadas.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Botao variante="editorial_principal" tamanho="amplo" comoFilho>
              <Link href="/criar-conta">
                Criar presença editorial
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Botao>
            <span className="text-xs text-mineral-300">
              Planos a partir de {valorPlanoPro}/mês · Equipe {valorPlanoEquipe}/mês
            </span>
          </div>
        </TransicaoEditorial>

        <TransicaoEditorial atrasoSegundos={0.1} className="lg:col-span-5">
          <CartaoSuperficie className="border-marfim-300 bg-marfim-50 text-mineral-950">
            <h2 className="font-editorial text-2xl font-medium text-mineral-950">
              Simule seu endereço editorial
            </h2>
            <p className="mt-1 mb-5 text-xs leading-relaxed text-mineral-700">
              Verifique o padrão de endereço público que representará sua marca ou atuação.
            </p>
            <ValidadorEnderecoPublico />
          </CartaoSuperficie>
        </TransicaoEditorial>
      </section>

      <section aria-labelledby="titulo-composicoes" className="border-t border-marfim-100/12 pt-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2
              id="titulo-composicoes"
              className="text-xs tracking-[0.2em] text-mineral-300 uppercase"
            >
              Três composições editoriais compartilhadas
            </h2>
            <p className="mt-2 font-editorial text-3xl font-light text-marfim-50">
              Alterne entre Desktop, Mobile e estilos sem perder conteúdo.
            </p>
          </div>
        </div>

        <div className="mb-10 grid gap-6 sm:grid-cols-3">
          {composicoes.map((composicao) => (
            <div key={composicao.codigo} className="border-l border-marfim-100/20 pl-4">
              <h3 className="font-editorial text-xl text-marfim-100">{composicao.nome}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-mineral-300">
                {composicao.resumoParaCliente}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
