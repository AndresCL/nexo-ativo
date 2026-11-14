"use client";

import { notificar } from "./notificar";

/** Só confirma a cópia depois que a área de transferência aceita o conteúdo. */
export async function copiarTextoComAviso(texto: string, mensagem = "Link copiado.") {
  try {
    if (!navigator.clipboard) throw new Error("Área de transferência indisponível.");
    await navigator.clipboard.writeText(texto);
    notificar.sucesso(mensagem);
    return true;
  } catch {
    notificar.erro("Não foi possível copiar. Tente novamente ou copie o texto manualmente.");
    return false;
  }
}
