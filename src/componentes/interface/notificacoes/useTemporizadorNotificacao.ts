"use client";

import { useEffect, useRef } from "react";
import { notificar } from "./notificar";

export function useTemporizadorNotificacao(id: string, duracaoMs: number, pausado: boolean) {
  const restante = useRef(duracaoMs);

  useEffect(() => {
    if (pausado) return;
    const inicio = Date.now();
    const temporizador = setTimeout(() => notificar.dispensar(id), restante.current);
    return () => {
      clearTimeout(temporizador);
      restante.current = Math.max(0, restante.current - (Date.now() - inicio));
    };
  }, [id, pausado]);
}
