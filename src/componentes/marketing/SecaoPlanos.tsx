import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import { combinarClasses } from "@/utilitarios/combinarClasses";

/**
 * Seção de planos com transparência de valores e recursos inclusos.
 */
export function SecaoPlanos() {
  const valorPlanoUnico = ValorMonetarioCentavos.deCentavos(8700).formatarMoedaBrasileira();

  const planos = [
    {
      nome: "Completo",
      descricao: "Tudo incluso para autônomos, clínicas, escritórios e operações comerciais.",
      valor: valorPlanoUnico,
      destaque: true,
      itens: [
        "Vitrine digital completa (Desktop e Mobile)",
        "Catálogo de serviços e portfólio completo",
        "Microfluxos comerciais interativos",
        "Painel de solicitações e métricas",
        "Múltiplos membros e cartões profissionais",
        "Gestão centralizada de marca e vitrine",
      ],
    },
  ] as const;

  return (
    <section
      id="planos"
      aria-labelledby="titulo-planos"
      className="border-t border-marfim-200/80 bg-white py-16 lg:py-20"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-mineral-500 uppercase">
            Planos transparentes
          </p>
          <h2
            id="titulo-planos"
            className="mt-2 text-3xl font-bold tracking-tight text-mineral-950 sm:text-4xl"
          >
            Escolha o formato ideal para o seu momento.
          </h2>
          <p className="mt-3 text-sm text-mineral-600 sm:text-base">
            Sem taxas escondidas. Comece configurando sua presença e publique quando estiver pronto.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl">
          {planos.map((plano) => (
            <CartaoSuperficie
              key={plano.nome}
              className={combinarClasses(
                "flex flex-col justify-between p-7",
                plano.destaque
                  ? "border-mineral-950 bg-white shadow-sm"
                  : "border-marfim-200 bg-marfim-50/40",
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-bold tracking-tight text-mineral-950">
                    {plano.nome}
                  </h3>
                  {plano.destaque ? (
                    <span className="rounded-full bg-mineral-950 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      Para equipes
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-sm text-mineral-600">{plano.descricao}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-mineral-950">
                    {plano.valor}
                  </span>
                  <span className="text-xs font-medium text-mineral-500">/mês</span>
                </div>

                <ul className="mt-6 space-y-2.5">
                  {plano.itens.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-mineral-700">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-mineral-700"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Botao
                  variante={plano.destaque ? "operacional_primario" : "operacional_secundario"}
                  tamanho="amplo"
                  className="w-full"
                  comoFilho
                >
                  <Link href="/criar-conta">
                    Começar com {plano.nome}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Botao>
              </div>
            </CartaoSuperficie>
          ))}
        </div>
      </div>
    </section>
  );
}

