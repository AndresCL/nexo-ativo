"use client";

import { useEffect, useState } from "react";

export function usarValorComDebounce<T>(valor: T, atrasoMs = 200): T {
  const [valorDebounced, setValorDebounced] = useState<T>(valor);

  useEffect(() => {
    if (typeof valor === "string" && valor.length === 0) {
      setValorDebounced(valor);
      return;
    }

    const temporizador = setTimeout(() => {
      setValorDebounced(valor);
    }, atrasoMs);

    return () => clearTimeout(temporizador);
  }, [valor, atrasoMs]);

  return valorDebounced;
}

