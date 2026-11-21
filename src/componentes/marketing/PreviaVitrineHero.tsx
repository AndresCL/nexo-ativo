import { CheckCircle2 } from "lucide-react";
import { VITRINE_HERO_FICTICIA } from "./conteudoLanding";
import { MockupVitrineReal } from "./MockupVitrineReal";
import { RevelacaoScroll } from "./RevelacaoScroll";

/**
 * Prévia fiel da vitrine real do Nexo Ativo no Hero, com entrada suave
 * seguida do selo discreto de qualificação.
 */
export function PreviaVitrineHero() {
  return (
    <div className="relative mx-auto flex w-full max-w-md items-center justify-center lg:justify-end">
      <RevelacaoScroll atrasoSegundos={0.12} distanciaY={14} duracaoSegundos={0.55}>
        <MockupVitrineReal dados={VITRINE_HERO_FICTICIA} />
      </RevelacaoScroll>

      {/* Cartão flutuante discreto de pedido qualificado */}
      <RevelacaoScroll
        atrasoSegundos={0.32}
        distanciaY={10}
        duracaoSegundos={0.45}
        className="hidden sm:block sm:w-56 lg:absolute lg:bottom-8 lg:-left-10"
      >
        <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-[0_18px_40px_-15px_rgba(15,17,16,0.2)]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-neutral-500">Novo pedido</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-alerta-sucesso/10 px-2 py-0.5 text-[10px] font-semibold text-alerta-sucesso">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Qualificado
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold text-mineral-950">Reforma residencial</p>
          <p className="mt-0.5 text-[11px] text-neutral-500">Origem: Bio · Pronto no WhatsApp</p>
        </div>
      </RevelacaoScroll>
    </div>
  );
}
