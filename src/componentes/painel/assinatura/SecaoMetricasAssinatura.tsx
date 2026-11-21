"use client";

import { CreditCard, Users, Wallet } from "lucide-react";

export interface PropriedadesSecaoMetricasAssinatura {
  readonly estaSemPlanoAtivo: boolean;
  readonly nomePlano: string;
  readonly rotuloSituacao: string;
  readonly mensalidadeFormatada: string;
  readonly apoioMensalidade: string;
  readonly limiteProfissionais: number;
}

export function SecaoMetricasAssinatura({
  estaSemPlanoAtivo,
  nomePlano,
  rotuloSituacao,
  mensalidadeFormatada,
  apoioMensalidade,
  limiteProfissionais,
}: PropriedadesSecaoMetricasAssinatura) {
  const metricas = [
    {
      rotulo: "Plano atual",
      valor: estaSemPlanoAtivo ? "Sem plano ativo" : nomePlano,
      apoio: estaSemPlanoAtivo ? "Modo Rascunho · Prévia liberada" : rotuloSituacao,
      icone: CreditCard,
    },
    {
      rotulo: "Mensalidade",
      valor: mensalidadeFormatada,
      apoio: apoioMensalidade,
      icone: Wallet,
    },
    {
      rotulo: "Profissionais ativos",
      valor: `Até ${limiteProfissionais}`,
      apoio: estaSemPlanoAtivo ? "Limite gratuito" : "Limite incluído no seu plano",
      icone: Users,
    },
  ];

  return (
    <section aria-label="Resumo da assinatura" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {metricas.map((item) => (
        <div
          key={item.rotulo}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs sm:p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-mineral-600">{item.rotulo}</p>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200/60 bg-slate-100 text-mineral-800">
              <item.icone className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 break-words text-xl font-extrabold tracking-tight tabular-nums text-mineral-950 sm:text-2xl">
            {item.valor}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-mineral-500">{item.apoio}</p>
        </div>
      ))}
    </section>
  );
}

