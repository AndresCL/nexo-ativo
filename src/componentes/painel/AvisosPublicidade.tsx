"use client";

import { TriangleAlert } from "lucide-react";
import type { AvisoPublicidade } from "@/dominio/publicidade/tiposPerfilPublicidade";
import { usarPoliticaPublicidade } from "./ProvedorPoliticaPublicidade";

/** Exibe os avisos do perfil de publicidade para a área indicada, quando houver. */
export function AvisosPublicidade({
  areas,
}: {
  readonly areas: readonly AvisoPublicidade["area"][];
}) {
  const politica = usarPoliticaPublicidade();
  const avisos = politica.avisos().filter((aviso) => areas.includes(aviso.area));

  if (avisos.length === 0) {
    return null;
  }

  return (
    <div
      role="note"
      className="space-y-1 rounded-md border border-amber-300 bg-amber-50 px-3.5 py-3 text-xs text-amber-950"
    >
      {avisos.map((aviso) => (
        <p key={aviso.mensagem} className="flex items-start gap-2">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{aviso.mensagem}</span>
        </p>
      ))}
    </div>
  );
}

/** Aviso padronizado de recurso indisponível no perfil de publicidade da organização. */
export function AvisoRecursoRestrito({ mensagem }: { readonly mensagem: string }) {
  const politica = usarPoliticaPublicidade();

  return (
    <div
      role="note"
      className="rounded-md border border-amber-300 bg-amber-50 px-3.5 py-3 text-xs text-amber-950"
    >
      <span className="font-semibold">{politica.rotulo}:</span> {mensagem}
    </div>
  );
}
