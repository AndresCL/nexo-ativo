import { Inbox, Layers, Sparkles } from "lucide-react";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";

const PASSOS_FUNCIONAMENTO = [
  {
    numero: "01",
    titulo: "Estruture seu catálogo e serviços",
    descricao:
      "Cadastre serviços, portfólio, equipe e cartões digitais em um painel limpo, sem depender de terceiros.",
    icone: <Layers className="h-5 w-5 text-mineral-700" aria-hidden="true" />,
  },
  {
    numero: "02",
    titulo: "Publique sua vitrine",
    descricao:
      "Sua marca ganha uma apresentação responsiva com navegação fluida para Desktop e Mobile.",
    icone: <Sparkles className="h-5 w-5 text-mineral-700" aria-hidden="true" />,
  },
  {
    numero: "03",
    titulo: "Receba solicitações qualificadas",
    descricao:
      "Microfluxos interativos conduzem o visitante e entregam pedidos organizados direto no seu painel.",
    icone: <Inbox className="h-5 w-5 text-mineral-700" aria-hidden="true" />,
  },
] as const;

/**
 * Explica o fluxo operacional do Nexo Ativo em três etapas objetivas.
 */
export function SecaoComoFunciona() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="titulo-como-funciona"
      className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:py-20"
    >
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-mineral-500 uppercase">
          Fluxo de trabalho
        </p>
        <h2
          id="titulo-como-funciona"
          className="mt-2 text-3xl font-bold tracking-tight text-mineral-950 sm:text-4xl"
        >
          Do rascunho à operação comercial em minutos.
        </h2>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {PASSOS_FUNCIONAMENTO.map((passo) => (
          <CartaoSuperficie key={passo.numero} className="border-marfim-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-marfim-100">
                {passo.icone}
              </span>
              <span className="text-xs font-bold tracking-widest text-mineral-400">
                {passo.numero}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-bold tracking-tight text-mineral-950">
              {passo.titulo}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-mineral-600">{passo.descricao}</p>
          </CartaoSuperficie>
        ))}
      </div>
    </section>
  );
}

