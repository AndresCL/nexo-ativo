"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export interface OpcoesUseRevalidarAoFocarAba {
  /** Intervalo mínimo em milissegundos entre revalidações automáticas (padrão: 15s). */
  readonly intervaloMinimoMs?: number;
  readonly habilitado?: boolean;
}

/**
 * Revalida os Server Components da rota atual quando o usuário retorna para a aba
 * (ex.: voltando do checkout externo do Asaas), com proteção contra rajadas de Alt-Tab.
 */
export function useRevalidarAoFocarAba({
  intervaloMinimoMs = 15_000,
  habilitado = true,
}: OpcoesUseRevalidarAoFocarAba = {}): void {
  const router = useRouter();
  const ultimaRevalidacaoMsRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!habilitado || typeof window === "undefined") {
      return;
    }

    function tentarRevalidar() {
      if (document.visibilityState === "hidden") {
        return;
      }

      const agora = Date.now();
      if (agora - ultimaRevalidacaoMsRef.current < intervaloMinimoMs) {
        return;
      }

      ultimaRevalidacaoMsRef.current = agora;
      router.refresh();
    }

    function aoMudarVisibilidade() {
      if (document.visibilityState === "visible") {
        tentarRevalidar();
      }
    }

    window.addEventListener("focus", tentarRevalidar);
    document.addEventListener("visibilitychange", aoMudarVisibilidade);

    return () => {
      window.removeEventListener("focus", tentarRevalidar);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
    };
  }, [habilitado, intervaloMinimoMs, router]);
}

