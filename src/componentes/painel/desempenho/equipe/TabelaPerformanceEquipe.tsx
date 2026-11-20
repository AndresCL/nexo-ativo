"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Plus, UserPlus, Users } from "lucide-react";
import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import type {
  MetricaCartaoProfissional,
  MetricaGranularProfissional,
} from "@/dominio/analytics/tiposMetricasAgregadas";
import { consolidarDesempenhoEquipe } from "@/dominio/analytics/consolidarDesempenhoEquipe";
import { TooltipInformativo } from "@/componentes/interface/TooltipInformativo";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesTabelaPerformanceEquipe {
  readonly profissionais: readonly ProfissionalEquipe[];
  readonly metricasPorCartao: readonly MetricaCartaoProfissional[];
  readonly metricasPorProfissional: readonly MetricaGranularProfissional[];
  readonly identificadorOrganizacao: string;
}

export function TabelaPerformanceEquipe({
  profissionais,
  metricasPorCartao,
  metricasPorProfissional,
  identificadorOrganizacao,
}: PropriedadesTabelaPerformanceEquipe) {
  const membrosEquipeConsolidados = useMemo(
    () =>
      consolidarDesempenhoEquipe(
        profissionais,
        metricasPorCartao,
        metricasPorProfissional,
      ),
    [profissionais, metricasPorCartao, metricasPorProfissional],
  );

  return (
    <section aria-labelledby="titulo-performance-equipe" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="titulo-performance-equipe"
            className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl"
          >
            Performance da Equipe & Cartões VIP
          </h2>
          <p className="mt-1 text-xs text-mineral-500">
            Acompanhe visitas aos cartões, cliques nas ações e no WhatsApp de cada consultor.
          </p>
        </div>

        <Link
          href="/painel/equipe"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-mineral-900 shadow-2xs transition-colors hover:border-slate-300 hover:text-mineral-950"
        >
          <UserPlus className="h-3.5 w-3.5 text-mineral-600" />
          <span>Gerenciar Equipe</span>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        {membrosEquipeConsolidados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-medium text-mineral-500">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <TooltipInformativo
                        alinhamento="esquerda"
                        texto="Membro da equipe com link público e QR Code exclusivo para distribuição e atendimento."
                      />
                      <span>Consultor / Cartão VIP</span>
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <TooltipInformativo
                        alinhamento="centro"
                        texto="Acessos à página individual do consultor (via QR Code físico, bio de redes sociais ou envio direto)."
                      />
                      <span>Visitas Cartão</span>
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <TooltipInformativo
                        alinhamento="centro"
                        texto="Cliques nas ações do cartão, como abrir a vitrine da loja, salvar o contato e iniciar uma experiência."
                      />
                      <span>Ações do Cartão</span>
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <TooltipInformativo
                        alinhamento="centro"
                        texto="Microfluxos interativos iniciados no cartão somados a solicitações comerciais atribuídas ao consultor."
                      />
                      <span>Fluxos Atribuídos</span>
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <TooltipInformativo
                        alinhamento="centro"
                        texto="Cliques no botão do WhatsApp a partir do cartão deste consultor. Uma visita pode gerar vários cliques."
                      />
                      <span>Contatos WhatsApp</span>
                    </div>
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <TooltipInformativo
                        alinhamento="direita"
                        texto="Média de cliques no WhatsApp e nas ações do cartão por visita. Uma visita pode gerar vários cliques. Sem visitas registradas, a média não é calculada."
                      />
                      <span>Ações por visita</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {membrosEquipeConsolidados.map((item, index) => {
                  const urlCartao = `/${identificadorOrganizacao}/equipe/${item.identificadorCartao}`;

                  return (
                    <tr key={item.id} className="group transition-colors hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Posição no Ranking */}
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-200/60 bg-slate-50 text-[10px] font-bold text-mineral-700">
                            {index + 1}
                          </span>

                          {/* Avatar ou Inicial */}
                          {item.avatarUrl ? (
                            <img
                              src={item.avatarUrl}
                              alt={item.nome}
                              className="h-8 w-8 rounded-lg object-cover shadow-2xs"
                            />
                          ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-100 text-xs font-bold text-mineral-800">
                              {item.nome.charAt(0)}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-mineral-950">{item.nome}</span>
                              <a
                                href={urlCartao}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Abrir cartão VIP individual"
                                className="text-mineral-400 opacity-0 transition-opacity hover:text-mineral-900 group-hover:opacity-100"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            <p className="text-[11px] text-mineral-500">{item.cargo}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right text-xs font-bold tabular-nums text-mineral-950">
                        {item.visualizacoes.toLocaleString("pt-BR")}
                      </td>

                      <td className="px-4 py-3.5 text-right text-xs font-medium tabular-nums text-mineral-700">
                        {item.cliquesAcoes.toLocaleString("pt-BR")}
                      </td>

                      <td className="px-4 py-3.5 text-right text-xs font-medium tabular-nums text-mineral-700">
                        {item.fluxos.toLocaleString("pt-BR")}
                      </td>

                      <td className="px-4 py-3.5 text-right text-xs font-bold tabular-nums text-mineral-950">
                        {item.contatos.toLocaleString("pt-BR")}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center rounded-md border border-slate-200/70 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-mineral-800">
                          {item.acoesPorVisita === null
                            ? "—"
                            : item.acoesPorVisita.toLocaleString("pt-BR", {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 2,
                              })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-mineral-600 shadow-2xs">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-mineral-950">
              Nenhum consultor cadastrado na equipe
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-mineral-500">
              Cadastre os membros da sua equipe para que cada um receba um Cartão VIP com QR Code
              e link rastreável exclusivo.
            </p>
            <Link
              href="/painel/equipe"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-mineral-950 bg-mineral-950 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-mineral-900"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Adicionar Primeiro Membro</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

