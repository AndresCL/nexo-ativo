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
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white shadow-2xs">
              <Users className="h-3 w-3" />
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-mineral-500 uppercase">
              Ranking Comercial
            </span>
          </div>
          <h2
            id="titulo-performance-equipe"
            className="mt-1 text-2xl font-bold tracking-tight text-mineral-950"
          >
            Performance da Equipe & Cartões VIP
          </h2>
          <p className="text-xs text-mineral-600">
            Acompanhe visitas aos cartões, cliques nas ações e no WhatsApp de cada consultor.
          </p>
        </div>

        <Link
          href="/painel/equipe"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-mineral-900 shadow-2xs transition-all hover:bg-sky-50 hover:border-sky-300"
        >
          <UserPlus className="h-3.5 w-3.5 text-mineral-600" />
          <span>Gerenciar Equipe</span>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {membrosEquipeConsolidados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-sky-100 bg-gradient-to-r from-indigo-50/70 to-sky-50/70 text-[11px] font-bold tracking-wider text-mineral-600 uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <TooltipInformativo
                        alinhamento="esquerda"
                        texto="Membro da equipe com link público e QR Code exclusivo para distribuição e atendimento."
                      />
                      <span>Consultor / Cartão VIP</span>
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <TooltipInformativo
                        alinhamento="centro"
                        texto="Acessos à página individual do consultor (via QR Code físico, bio de redes sociais ou envio direto)."
                      />
                      <span>Visitas Cartão</span>
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <TooltipInformativo
                        alinhamento="centro"
                        texto="Cliques nas ações do cartão, como abrir a vitrine da loja, salvar o contato e iniciar uma experiência."
                      />
                      <span>Ações do Cartão</span>
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <TooltipInformativo
                        alinhamento="centro"
                        texto="Microfluxos interativos iniciados no cartão somados a solicitações comerciais atribuídas ao consultor."
                      />
                      <span>Fluxos Atribuídos</span>
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <TooltipInformativo
                        alinhamento="centro"
                        texto="Cliques no botão do WhatsApp a partir do cartão deste consultor. Uma visita pode gerar vários cliques."
                      />
                      <span>Contatos WhatsApp</span>
                    </div>
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
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
              <tbody className="divide-y divide-slate-100">
                {membrosEquipeConsolidados.map((item, index) => {
                  const urlCartao = `/${identificadorOrganizacao}/equipe/${item.identificadorCartao}`;

                  return (
                    <tr key={item.id} className="group transition-colors hover:bg-sky-50/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* Posição no Ranking */}
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-mineral-700">
                            {index + 1}
                          </span>

                          {/* Avatar ou Inicial */}
                          {item.avatarUrl ? (
                            <img
                              src={item.avatarUrl}
                              alt={item.nome}
                              className="h-9 w-9 rounded-xl object-cover shadow-2xs"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-600 text-sm font-bold text-white shadow-xs">
                              {item.nome.charAt(0)}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-mineral-950">{item.nome}</span>
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

                      <td className="px-4 py-4 text-center text-sm font-bold text-indigo-900">
                        {item.visualizacoes}
                      </td>

                      <td className="px-4 py-4 text-center text-sm font-bold text-indigo-900">
                        {item.cliquesAcoes}
                      </td>

                      <td className="px-4 py-4 text-center text-sm font-bold text-sky-900">
                        {item.fluxos}
                      </td>

                      <td className="px-4 py-4 text-center text-sm font-extrabold text-violet-900">
                        {item.contatos}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span
                          className={combinarClasses(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold shadow-2xs",
                            item.acoesPorVisita !== null && item.acoesPorVisita >= 1
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              : item.acoesPorVisita !== null && item.acoesPorVisita > 0
                                ? "bg-sky-100 text-sky-900 border border-sky-200"
                                : "bg-slate-100 text-mineral-600",
                          )}
                        >
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-mineral-600 shadow-2xs">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-mineral-950">
              Nenhum consultor cadastrado na equipe
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-mineral-600">
              Cadastre os membros da sua equipe para que cada um receba um Cartão VIP com QR Code
              e link rastreável exclusivo.
            </p>
            <Link
              href="/painel/equipe"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Primeiro Membro</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

