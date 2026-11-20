"use client";

import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { BotaoEncerrarSessao } from "@/componentes/autenticacao/BotaoEncerrarSessao";

export interface PropriedadesMenuRodapeUsuario {
  readonly emailUsuario?: string | null;
  readonly aoClicarLink?: () => void;
}

export function MenuRodapeUsuario({
  emailUsuario,
  aoClicarLink,
}: PropriedadesMenuRodapeUsuario) {
  return (
    <div className="flex flex-col gap-2">
      <Link
        href="/painel/conta"
        onClick={aoClicarLink}
        className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/70 p-2.5 transition-colors hover:border-indigo-300 hover:bg-white shadow-2xs"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100 transition-colors">
            <User className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-mineral-900 group-hover:text-indigo-950">
              Minha conta
            </p>
            {emailUsuario ? (
              <p className="truncate text-[11px] text-mineral-500">{emailUsuario}</p>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="pt-0.5">
        <BotaoEncerrarSessao />
      </div>
    </div>
  );
}

