"use client";

import { LogOut } from "lucide-react";
import { BotaoEncerrarSessao } from "@/componentes/autenticacao/BotaoEncerrarSessao";

export function SecaoSessaoLogout() {
  return (
    <section
      aria-labelledby="titulo-sessao"
      className="rounded-2xl border border-marfim-200/90 bg-white p-5 shadow-2xs sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="titulo-sessao" className="text-sm font-semibold text-mineral-950">
            Sessão
          </h2>
          <p className="mt-0.5 text-xs text-mineral-500">
            Encerre sua sessão com segurança neste dispositivo.
          </p>
        </div>

        <div className="shrink-0">
          <BotaoEncerrarSessao />
        </div>
      </div>
    </section>
  );
}

