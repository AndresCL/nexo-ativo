"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { notificar, type Notificacao } from "./notificar";
import { useTemporizadorNotificacao } from "./useTemporizadorNotificacao";

const APARENCIA = {
  sucesso: { icone: CheckCircle2, classe: "border-emerald-800 bg-emerald-700 text-white" },
  erro: { icone: AlertCircle, classe: "border-red-800 bg-red-700 text-white" },
  informacao: { icone: Info, classe: "border-sky-800 bg-sky-700 text-white" },
  aviso: { icone: TriangleAlert, classe: "border-amber-400 bg-amber-300 text-amber-950" },
} as const;

export function ToastNotificacao({ notificacao }: { readonly notificacao: Notificacao }) {
  const [ponteiroDentro, setPonteiroDentro] = useState(false);
  const [focoDentro, setFocoDentro] = useState(false);
  useTemporizadorNotificacao(notificacao.id, notificacao.duracaoMs, ponteiroDentro || focoDentro);
  const { icone: Icone, classe } = APARENCIA[notificacao.tipo];

  return (
    <li
      role={notificacao.tipo === "erro" || notificacao.tipo === "aviso" ? "alert" : "status"}
      aria-atomic="true"
      onPointerEnter={() => setPonteiroDentro(true)}
      onPointerLeave={() => setPonteiroDentro(false)}
      onFocusCapture={() => setFocoDentro(true)}
      onBlurCapture={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) setFocoDentro(false);
      }}
      className={combinarClasses(
        "animacao-suave-entrada pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-md shadow-black/15",
        classe,
      )}
    >
      <Icone className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm leading-relaxed whitespace-pre-line wrap-anywhere">
        {notificacao.mensagem}
      </p>
      <button
        type="button"
        aria-label="Fechar notificação"
        onClick={() => notificar.dispensar(notificacao.id)}
        className="-m-1 flex min-h-8 min-w-8 shrink-0 items-center justify-center rounded-md text-current opacity-80 transition hover:bg-black/10 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-current"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  );
}
