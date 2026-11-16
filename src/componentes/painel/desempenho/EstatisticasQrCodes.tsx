"use client";

import { QrCode } from "lucide-react";
import type { MetricaQrCode } from "@/dominio/analytics/tiposMetricasAgregadas";

export interface PropriedadesEstatisticasQrCodes {
  readonly qrCodes: readonly MetricaQrCode[];
}

function formatarRotuloQrCode(codigo: string): string {
  if (codigo === "vitrine") return "Vitrine Principal (Home)";
  if (codigo.startsWith("fluxo_")) return `Fluxo: ${codigo.replace("fluxo_", "")}`;
  if (codigo.startsWith("profissional_")) {
    return `Profissional: ${codigo.replace("profissional_", "")}`;
  }
  return codigo;
}

export function EstatisticasQrCodes({ qrCodes }: PropriedadesEstatisticasQrCodes) {
  const totalVisitas = qrCodes.reduce((acc, q) => acc + q.visualizacoes, 0);
  const totalFluxos = qrCodes.reduce((acc, q) => acc + q.aberturasFluxo, 0);
  const totalConversoes = qrCodes.reduce(
    (acc, q) => acc + q.conclusoesFluxo + q.contatosWhatsapp,
    0,
  );
  const taxaGeral =
    totalVisitas > 0 ? `${Math.round((totalConversoes / totalVisitas) * 1000) / 10}%` : "—";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-600 text-white shadow-2xs">
              <QrCode className="h-3 w-3" aria-hidden="true" />
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-mineral-500 uppercase">
              Materiais Impressos & Balcão
            </span>
          </div>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-mineral-950">
            Desempenho por QR Code
          </h3>
          <p className="mt-0.5 text-xs text-mineral-600">
            Compare visitas, fluxos iniciados e contatos no WhatsApp de cada QR Code gerado.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-marfim-200 bg-white p-5 shadow-xs space-y-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-marfim-200 bg-marfim-50/40 p-3.5">
            <p className="text-[11px] font-semibold text-mineral-500 uppercase">Visitas via QR</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-mineral-950">{totalVisitas}</p>
          </div>
          <div className="rounded-xl border border-marfim-200 bg-marfim-50/40 p-3.5">
            <p className="text-[11px] font-semibold text-mineral-500 uppercase">Fluxos Iniciados</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-mineral-950">{totalFluxos}</p>
          </div>
          <div className="rounded-xl border border-marfim-200 bg-marfim-50/40 p-3.5">
            <p className="text-[11px] font-semibold text-mineral-500 uppercase">Conversões</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-mineral-950">{totalConversoes}</p>
          </div>
          <div className="rounded-xl border border-marfim-200 bg-marfim-50/40 p-3.5">
            <p className="text-[11px] font-semibold text-mineral-500 uppercase">Taxa de Conversão</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-mineral-950">{taxaGeral}</p>
          </div>
        </div>

        {qrCodes.length === 0 ? (
          <p className="py-4 text-center text-xs text-mineral-500">
            Nenhum acesso via QR Code rastreado neste período ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-marfim-200 text-[11px] font-semibold text-mineral-500 uppercase">
                  <th className="py-2.5 pr-4">QR Code / Destino</th>
                  <th className="py-2.5 px-3 text-right">Visitas</th>
                  <th className="py-2.5 px-3 text-right">Fluxos</th>
                  <th className="py-2.5 px-3 text-right">Conversões</th>
                  <th className="py-2.5 pl-3 text-right">Taxa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-marfim-100">
                {qrCodes.map((qr) => {
                  const conversoes = qr.conclusoesFluxo + qr.contatosWhatsapp;
                  const taxa =
                    qr.visualizacoes > 0
                      ? `${Math.round((conversoes / qr.visualizacoes) * 1000) / 10}%`
                      : "—";
                  return (
                    <tr key={qr.codigo} className="text-mineral-800 hover:bg-marfim-50/50">
                      <td className="py-3 pr-4 font-medium text-mineral-950">
                        {formatarRotuloQrCode(qr.codigo)}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums">{qr.visualizacoes}</td>
                      <td className="py-3 px-3 text-right tabular-nums">{qr.aberturasFluxo}</td>
                      <td className="py-3 px-3 text-right tabular-nums">{conversoes}</td>
                      <td className="py-3 pl-3 text-right font-semibold tabular-nums">{taxa}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

