"use client";

import type { RegistroAuditoria } from "@/dominio/entidades/autenticacaoEOrganizacao";

export interface PropriedadesTabelaAuditoriaFundador {
  readonly auditoria: readonly RegistroAuditoria[];
}

export function TabelaAuditoriaFundador({ auditoria }: PropriedadesTabelaAuditoriaFundador) {
  return (
    <section aria-label="Trilha de auditoria" className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-marfim-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-marfim-200 bg-marfim-50 text-[11px] font-semibold tracking-wider text-mineral-600 uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">
                Data / Hora
              </th>
              <th scope="col" className="px-4 py-3">
                Ação
              </th>
              <th scope="col" className="px-4 py-3">
                Executor
              </th>
              <th scope="col" className="px-4 py-3">
                Organização Alvo
              </th>
              <th scope="col" className="px-4 py-3">
                Detalhes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-marfim-200">
            {auditoria.map((reg) => (
              <tr key={reg.id} className="hover:bg-marfim-50/50">
                <td className="px-4 py-3 font-mono text-mineral-700">{reg.criadoEmIso}</td>
                <td className="px-4 py-3 font-medium text-mineral-950">{reg.acao}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-mineral-600">
                  {reg.atorUsuarioId}
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-mineral-600">
                  {reg.organizacaoAlvoId ?? "—"}
                </td>
                <td className="px-4 py-3 text-[11px] text-mineral-700">
                  {JSON.stringify(reg.detalhes)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

