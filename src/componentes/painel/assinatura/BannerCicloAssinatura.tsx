"use client";

import { CreditCard, ExternalLink } from "lucide-react";
import type { EstadoCicloAssinatura } from "@/dominio/assinaturas/mapeadorCicloAssinatura";
import { Botao } from "@/componentes/interface/Botao";

export interface PropriedadesBannerCicloAssinatura {
  readonly estadoCiclo: EstadoCicloAssinatura;
  readonly podeGerenciar: boolean;
  readonly processando: boolean;
  readonly aoSolicitarReativacao: (evento: React.MouseEvent<HTMLButtonElement>) => void;
}

function formatarData(dataIso: string): string {
  return dataIso.replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, "$3/$2/$1");
}

export function BannerCicloAssinatura({
  estadoCiclo,
  podeGerenciar,
  processando,
  aoSolicitarReativacao,
}: PropriedadesBannerCicloAssinatura) {
  if (estadoCiclo.tipo === "reativacao_pendente" && estadoCiclo.urlCheckout) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50/70 p-5 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-sm font-bold text-amber-950">
              Reativação solicitada · Aguardando pagamento da fatura
            </h2>
          </div>
          <p className="text-xs text-amber-900/80 leading-relaxed max-w-2xl">
            Uma nova fatura foi gerada para reativar sua assinatura Pro. Efetue o pagamento para restabelecer as renovações automáticas sem perder a continuidade dos seus recursos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={estadoCiclo.urlCheckout}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 shadow-2xs"
          >
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            <span>Pagar / Acessar Fatura →</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
          </a>
          <button
            type="button"
            disabled={!podeGerenciar || processando}
            onClick={aoSolicitarReativacao}
            className="inline-flex min-h-10 items-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100/50"
          >
            Alterar dados cadastrais
          </button>
        </div>
      </div>
    );
  }

  if (estadoCiclo.tipo === "cancelada_com_acesso" && estadoCiclo.vigenciaAteIso) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50/70 p-5 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
            <h2 className="text-sm font-bold text-amber-950">
              Assinatura cancelada · Acesso Pro garantido até {formatarData(estadoCiclo.vigenciaAteIso)}
            </h2>
          </div>
          <p className="text-xs text-amber-900/80 leading-relaxed max-w-2xl">
            Sua assinatura foi cancelada e não haverá novas cobranças automáticas. Sua vitrine pública e todos os recursos do Plano Pro permanecem 100% ativos até o encerramento do ciclo já pago em {formatarData(estadoCiclo.vigenciaAteIso)}.
          </p>
        </div>
        <Botao
          variante="editorial_principal"
          className="shrink-0 bg-mineral-950 text-white hover:bg-mineral-900 rounded-lg text-xs font-semibold px-4 py-2"
          disabled={!podeGerenciar || processando}
          onClick={aoSolicitarReativacao}
        >
          Restabelecer Renovação Automática →
        </Botao>
      </div>
    );
  }

  if (estadoCiclo.tipo === "aguardando_primeiro_pagamento") {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-sm font-bold text-amber-950">
              Assinatura gerada · Aguardando confirmação do pagamento
            </h2>
          </div>
          <p className="text-xs text-amber-900/80 max-w-2xl leading-relaxed">
            Sua cobrança do Plano Pro já foi emitida. Assim que o pagamento for identificado (Pix é imediato, boleto em até 1 dia útil), sua vitrine será ativada automaticamente.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {estadoCiclo.urlCheckout ? (
            <a
              href={estadoCiclo.urlCheckout}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 shadow-2xs"
            >
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              <span>Pagar / Acessar Fatura →</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            </a>
          ) : null}
          <button
            type="button"
            disabled={!podeGerenciar || processando}
            onClick={aoSolicitarReativacao}
            className="inline-flex min-h-10 items-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100/50"
          >
            Alterar dados cadastrais
          </button>
        </div>
      </div>
    );
  }

  if (estadoCiclo.tipo === "avaliacao_inicial" || estadoCiclo.tipo === "encerrada_sem_acesso") {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            <h2 className="text-sm font-bold text-mineral-950">
              Sua vitrine está no modo gratuito de avaliação (Rascunho)
            </h2>
          </div>
          <p className="text-xs text-mineral-600 max-w-2xl leading-relaxed">
            Você pode cadastrar identidade, serviços, produtos e testar a prévia privada livremente. A publicação oficial no link público requer o Plano Pro.
          </p>
        </div>
        <Botao
          variante="editorial_principal"
          className="shrink-0 bg-mineral-950 text-white hover:bg-mineral-900 rounded-lg text-xs font-semibold px-4 py-2"
          disabled={!podeGerenciar || processando}
          onClick={aoSolicitarReativacao}
        >
          Contratar Plano Pro (R$ 87/mês) →
        </Botao>
      </div>
    );
  }

  return null;
}
