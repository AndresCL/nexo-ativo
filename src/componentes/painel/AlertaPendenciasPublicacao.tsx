"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { PendenciaPublicacaoPagina } from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";

export interface PropriedadesAlertaPendenciasPublicacao {
  readonly pendencias: readonly PendenciaPublicacaoPagina[];
  readonly emailVerificado?: boolean;
  readonly exibirAtalhoAparencia?: boolean;
}

/** Exibe as pendências que bloqueiam a publicação da vitrine com atalhos diretos de correção. */
export function AlertaPendenciasPublicacao({
  pendencias,
  emailVerificado = true,
  exibirAtalhoAparencia = false,
}: PropriedadesAlertaPendenciasPublicacao) {
  if (pendencias.length === 0) {
    return null;
  }

  const possuiPendenciaAparencia = pendencias.some(
    (item) => item.codigo !== "EMAIL_NAO_VERIFICADO",
  );

  return (
    <CartaoSuperficie
      role="alert"
      preenchimento="compacto"
      className="rounded-2xl border-amber-300 bg-amber-50 text-amber-950 shadow-xs"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-amber-950">
              Conclua antes de publicar sua página:
            </p>
            <ul className="list-disc space-y-0.5 pl-4 text-xs font-medium text-amber-900">
              {pendencias.map((pendencia) => (
                <li key={pendencia.codigo}>{pendencia.mensagem}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!emailVerificado ? (
            <Botao variante="operacional_secundario" tamanho="compacto" comoFilho>
              <Link href="/verificar-email">Confirmar e-mail</Link>
            </Botao>
          ) : null}

          {exibirAtalhoAparencia && possuiPendenciaAparencia ? (
            <Botao variante="operacional_secundario" tamanho="compacto" comoFilho>
              <Link href="/painel/aparencia">Corrigir em Aparência</Link>
            </Botao>
          ) : null}
        </div>
      </div>
    </CartaoSuperficie>
  );
}

