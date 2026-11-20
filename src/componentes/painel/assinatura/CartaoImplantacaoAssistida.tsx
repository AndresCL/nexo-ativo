"use client";

import { MessageCircle, Sparkles } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import { CATALOGO_PLANOS_FLUXO } from "@/dominio/assinaturas/tiposAssinaturaAsaas";

export interface PropriedadesCartaoImplantacaoAssistida {
  readonly organizacaoNome: string;
  readonly contratouImplantacao: boolean;
  readonly podeGerenciar: boolean;
  readonly contratando: boolean;
  readonly aoContratar: () => void;
}

function abrirChatCrisp() {
  if (typeof window !== "undefined") {
    window.$crisp = window.$crisp || [];
    window.$crisp.push(["do", "chat:show"]);
    window.$crisp.push(["do", "chat:open"]);
  }
}

export function CartaoImplantacaoAssistida({
  organizacaoNome: _organizacaoNome,
  contratouImplantacao,
  podeGerenciar,
  contratando,
  aoContratar,
}: PropriedadesCartaoImplantacaoAssistida) {
  const valorImplantacao = ValorMonetarioCentavos.deCentavos(
    CATALOGO_PLANOS_FLUXO.pro.valorImplantacaoAssistidaCentavos ?? 0,
  ).formatarMoedaBrasileira();

  return (
    <CartaoSuperficie className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 border border-violet-200 text-violet-700">
              <Sparkles className="h-4 w-4 text-violet-600" aria-hidden="true" />
            </span>
            <h3 className="text-base font-bold tracking-tight text-mineral-950">
              Implantação Editorial Assistida (Opcional)
            </h3>
            {contratouImplantacao ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                Contratada
              </span>
            ) : null}
          </div>
          <p className="text-xs leading-relaxed text-mineral-600">
            Nossa equipe de design e curadoria configura sua página, organiza seu portfólio e
            estrutura seus microfluxos comerciais sobre o seu painel.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
          {!contratouImplantacao ? (
            <div className="sm:text-right">
              <p className="text-[11px] font-medium text-mineral-500">Investimento único</p>
              <p className="text-xl font-extrabold text-mineral-950">
                {valorImplantacao} <span className="text-xs font-normal text-mineral-500">(Plano Pro)</span>
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            {contratouImplantacao ? (
              <Botao
                type="button"
                variante="editorial_principal"
                className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold px-4 py-2"
                onClick={abrirChatCrisp}
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                <span>Falar com Curadoria no Chat →</span>
              </Botao>
            ) : (
              <>
                <Botao
                  variante="editorial_principal"
                  className="bg-mineral-950 text-white hover:bg-mineral-900 rounded-lg text-xs font-semibold px-4 py-2"
                  disabled={!podeGerenciar || contratando}
                  onClick={aoContratar}
                >
                  {contratando ? "Gerando fatura..." : `Contratar Implantação (${valorImplantacao}) →`}
                </Botao>
                <button
                  type="button"
                  onClick={abrirChatCrisp}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-mineral-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-mineral-500" aria-hidden="true" />
                  <span>Ajuda no Chat</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </CartaoSuperficie>
  );
}


