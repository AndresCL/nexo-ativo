"use client";

import { useSyncExternalStore } from "react";

const CONSULTA_MOVIMENTO_REDUZIDO = "(prefers-reduced-motion: reduce)";

function observarPreferencia(aoAlterar: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => {};
  const consulta = window.matchMedia(CONSULTA_MOVIMENTO_REDUZIDO);
  consulta.addEventListener("change", aoAlterar);
  return () => consulta.removeEventListener("change", aoAlterar);
}

function obterPreferencia(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia(CONSULTA_MOVIMENTO_REDUZIDO).matches
  );
}

function obterPreferenciaNoServidor(): boolean {
  return false;
}

/**
 * Retorna verdadeiro quando o visitante configurou preferência de movimento reduzido
 * no sistema operacional. Mantém o prefixo técnico obrigatório "use" exigido pelo React.
 */
export function usePreferenciaMovimentoReduzido(): boolean {
  // A primeira renderização do navegador deve corresponder ao HTML do servidor.
  return useSyncExternalStore(observarPreferencia, obterPreferencia, obterPreferenciaNoServidor);
}
