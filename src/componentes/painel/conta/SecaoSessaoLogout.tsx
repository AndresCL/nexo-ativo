"use client";

import { LogOut } from "lucide-react";
import { BotaoEncerrarSessao } from "@/componentes/autenticacao/BotaoEncerrarSessao";

export function SecaoSessaoLogout() {
  return (
    <section
      aria-labelledby="titulo-sessao"
      className="rounded-2xl border border-marfim-200/80 bg-white p-6 shadow-2xs sm:p-8"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-mineral-700">
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 id="titulo-sessao" className="text-base font-semibold text-mineral-950">
            Sessão
          </h2>
          <p className="text-xs text-mineral-500">
            Encerre sua sessão com segurança neste dispositivo.
          </p>
        </div>
      </div>

      <div className="mt-5 max-w-xs">
        <BotaoEncerrarSessao />
      </div>
    </section>
  );
}

