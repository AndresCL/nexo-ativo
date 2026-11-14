"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useStore } from "zustand";
import { estadoNotificacoes } from "./notificar";
import { ToastNotificacao } from "./ToastNotificacao";

/** Um único ponto de exibição, compartilhado entre todas as rotas e preservado na navegação. */
export function CentralNotificacoes() {
  const [destino, setDestino] = useState<HTMLElement | null>(null);
  const itens = useStore(estadoNotificacoes, (estado) => estado.itens);
  useEffect(() => setDestino(document.body), []);

  if (!destino) return null;
  return createPortal(
    <section
      aria-label="Notificações"
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed top-[calc(1rem+env(safe-area-inset-top,0px))] left-1/2 z-[100] w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2"
    >
      <ol className="flex max-h-[calc(100dvh-2rem-env(safe-area-inset-top,0px))] flex-col gap-3 overflow-y-auto overscroll-contain p-2">
        {itens.map((notificacao) => (
          <ToastNotificacao key={notificacao.id} notificacao={notificacao} />
        ))}
      </ol>
    </section>,
    destino,
  );
}
