import { Inbox, Layers, QrCode } from "lucide-react";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { RevelacaoScroll } from "./RevelacaoScroll";

const PASSOS_FUNCIONAMENTO = [
  {
    numero: "01",
    titulo: "Crie grátis",
    descricao: "Entre em menos de 1 minuto no modo rascunho, sem cadastrar cartão.",
    icone: <Layers className="h-5 w-5 text-mineral-950" aria-hidden="true" />,
  },
  {
    numero: "02",
    titulo: "Personalize",
    descricao: "Adicione serviços, fotos, equipe e seus microfluxos em um painel simples.",
    icone: <Inbox className="h-5 w-5 text-mineral-950" aria-hidden="true" />,
  },
  {
    numero: "03",
    titulo: "Compartilhe",
    descricao: "Divulgue na bio, WhatsApp, Google e QR Codes e receba conversas com contexto claro.",
    icone: <QrCode className="h-5 w-5 text-mineral-950" aria-hidden="true" />,
  },
] as const;

/**
 * Fluxo operacional do Nexo Ativo em três etapas diretas com stagger sutil.
 */
export function SecaoComoFunciona() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="titulo-como-funciona"
      className="border-b border-neutral-200/80 bg-neutral-50 py-18 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevelacaoScroll className="max-w-xl">
          <h2
            id="titulo-como-funciona"
            className="text-3xl font-bold tracking-tight text-mineral-950 sm:text-4xl"
          >
            No ar em 3 passos.
          </h2>
        </RevelacaoScroll>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {PASSOS_FUNCIONAMENTO.map((passo, indice) => (
            <RevelacaoScroll key={passo.numero} atrasoSegundos={indice * 0.06} className="h-full">
              <CartaoSuperficie className="h-full border border-neutral-200 bg-white p-6 shadow-none">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                    {passo.icone}
                  </span>
                  <span className="text-sm font-bold tracking-wider text-neutral-400">
                    {passo.numero}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-mineral-950">
                  {passo.titulo}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{passo.descricao}</p>
              </CartaoSuperficie>
            </RevelacaoScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
