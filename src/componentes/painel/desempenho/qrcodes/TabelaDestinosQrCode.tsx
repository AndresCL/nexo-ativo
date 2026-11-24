"use client";

import type { MetricaQrCode } from "@/dominio/analytics/tiposMetricasAgregadas";
import { formatarRotuloQrCode } from "@/dominio/analytics/resumoQrCodeEOrigem";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesTabelaDestinosQrCode {
  readonly qrCodes: readonly MetricaQrCode[];
  readonly destinoSelecionado: string;
  readonly aoSelecionarDestino: (codigo: string) => void;
}

export function TabelaDestinosQrCode({
  qrCodes,
  destinoSelecionado,
  aoSelecionarDestino,
}: PropriedadesTabelaDestinosQrCode) {
  if (qrCodes.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-mineral-500">
        Nenhum acesso via QR Code rastreado neste período ainda.
      </p>
    );
  }

  return (
    <div className="pt-2 space-y-2">
      {qrCodes.map((qr) => {
        const conversoes = qr.conclusoesFluxo + qr.contatosWhatsapp;
        const taxa =
          qr.visualizacoes > 0
            ? `${Math.round((conversoes / qr.visualizacoes) * 1000) / 10}%`
            : "—";
        const selecionado = destinoSelecionado === qr.codigo;

        return (
          <button
            key={qr.codigo}
            type="button"
            onClick={() => aoSelecionarDestino(selecionado ? "todos" : qr.codigo)}
            className={combinarClasses(
              "w-full rounded-xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer",
              selecionado
                ? "border-mineral-900/20 bg-slate-50/90"
                : "border-slate-200/80 bg-white hover:bg-slate-50/60",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-mineral-950 break-words">
                {formatarRotuloQrCode(qr.codigo)}
              </span>
              {selecionado ? (
                <span className="shrink-0 rounded-full bg-mineral-950 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                  Ativo
                </span>
              ) : null}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div>
                <div className="text-[10px] font-medium text-mineral-400">Leituras</div>
                <div className="mt-0.5 text-xs font-bold tabular-nums text-mineral-950">
                  {qr.visualizacoes.toLocaleString("pt-BR")}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-medium text-mineral-400">Fluxos</div>
                <div className="mt-0.5 text-xs font-medium tabular-nums text-mineral-700">
                  {qr.aberturasFluxo.toLocaleString("pt-BR")}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-medium text-mineral-400">Conversões</div>
                <div className="mt-0.5 text-xs font-bold tabular-nums text-mineral-900">
                  {conversoes.toLocaleString("pt-BR")}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-medium text-mineral-400">Taxa</div>
                <div className="mt-0.5 text-xs font-semibold tabular-nums text-mineral-900">
                  {taxa}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

