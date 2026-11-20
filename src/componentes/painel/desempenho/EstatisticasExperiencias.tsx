"use client";

import { useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TooltipInformativo } from "@/componentes/interface/TooltipInformativo";
import type {
  MetricaGranularMicrofluxo,
  MetricasDiariasOrganizacao,
} from "@/dominio/analytics/tiposMetricasAgregadas";
import { obterCorExperiencia } from "./paletaCoresExperiencias";

export type MetricaComparativaTipo = "aberturas" | "conclusoes" | "permalink" | "taxa";

export interface PropriedadesEstatisticasExperiencias {
  readonly experiencias: readonly { readonly id: string; readonly titulo: string }[];
  readonly metricas: readonly MetricaGranularMicrofluxo[];
  readonly historico: readonly MetricasDiariasOrganizacao[];
}

export function EstatisticasExperiencias({
  experiencias,
  metricas,
  historico,
}: PropriedadesEstatisticasExperiencias) {
  const [montado, setMontado] = useState(false);
  const [metricaSelecionada, setMetricaSelecionada] = useState<MetricaComparativaTipo>("aberturas");

  useEffect(() => setMontado(true), []);

  // Consolidação de todas as experiências disponíveis e suas métricas totais
  const itens = useMemo(() => {
    const mapa = new Map<string, MetricaGranularMicrofluxo>();
    for (const m of metricas) {
      mapa.set(m.id, m);
    }
    for (const exp of experiencias) {
      if (!mapa.has(exp.id)) {
        mapa.set(exp.id, {
          id: exp.id,
          titulo: exp.titulo,
          aberturas: 0,
          conclusoes: 0,
          aberturasPermalink: 0,
        });
      }
    }
    return [...mapa.values()].sort(
      (a, b) => b.aberturas - a.aberturas || a.titulo.localeCompare(b.titulo),
    );
  }, [experiencias, metricas]);

  // IDs selecionados para exibição comparativa no gráfico
  const [selecionadas, setSelecionadas] = useState<Set<string>>(() => {
    // Por padrão seleciona até as 3 com maior movimento ou a primeira
    const iniciais = itens.slice(0, 3).map((item) => item.id);
    return new Set(iniciais);
  });

  // Atualiza seleção caso experiências mudem e o conjunto fique vazio
  useEffect(() => {
    if (selecionadas.size === 0 && itens.length > 0) {
      setSelecionadas(new Set(itens.slice(0, 3).map((i) => i.id)));
    }
  }, [itens, selecionadas.size]);

  const alternarExperiencia = (id: string) => {
    setSelecionadas((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(id)) {
        // Se já tem mais de uma, permite desmarcar. Se só tem ela, mantém para não ficar vazio.
        if (proximo.size > 1) {
          proximo.delete(id);
        }
      } else {
        proximo.add(id);
      }
      return proximo;
    });
  };

  const selecionarTodas = () => {
    setSelecionadas(new Set(itens.map((i) => i.id)));
  };

  const selecionarTop3 = () => {
    setSelecionadas(new Set(itens.slice(0, 3).map((i) => i.id)));
  };

  // Mapa de cores atribuídas a cada experiência para consistência na UI (chips, linhas, tabela)
  const mapaCores = useMemo(() => {
    const map = new Map<string, ReturnType<typeof obterCorExperiencia>>();
    itens.forEach((item, index) => {
      map.set(item.id, obterCorExperiencia(index));
    });
    return map;
  }, [itens]);

  // Resumo consolidado baseado no subconjunto de experiências atualmente selecionadas
  const resumoAtivo = useMemo(() => {
    const filtrados = itens.filter((i) => selecionadas.has(i.id));
    const aberturas = filtrados.reduce((acc, curr) => acc + curr.aberturas, 0);
    const conclusoes = filtrados.reduce((acc, curr) => acc + curr.conclusoes, 0);
    const permalink = filtrados.reduce((acc, curr) => acc + (curr.aberturasPermalink ?? 0), 0);
    const taxa =
      aberturas > 0
        ? `${((conclusoes / aberturas) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`
        : "—";

    return { aberturas, conclusoes, permalink, taxa, quantidade: filtrados.length };
  }, [itens, selecionadas]);

  // Preparação dos dados para a linha temporal com Recharts
  const dadosGrafico = useMemo(() => {
    const ordenado = [...historico].sort((a, b) => a.dataIso.localeCompare(b.dataIso));

    return ordenado.map((dia) => {
      const ponto: Record<string, string | number> = {
        data: dia.dataIso,
      };

      for (const item of itens) {
        if (!selecionadas.has(item.id)) continue;

        const dadosItem = dia.porMicrofluxo?.[item.id];
        const aberturas = dadosItem?.aberturas ?? 0;
        const conclusoes = dadosItem?.conclusoes ?? 0;
        const permalink = dadosItem?.aberturasPermalink ?? 0;

        let valor = 0;
        if (metricaSelecionada === "aberturas") valor = aberturas;
        else if (metricaSelecionada === "conclusoes") valor = conclusoes;
        else if (metricaSelecionada === "permalink") valor = permalink;
        else if (metricaSelecionada === "taxa") {
          valor = aberturas > 0 ? Number(((conclusoes / aberturas) * 100).toFixed(1)) : 0;
        }

        ponto[item.id] = valor;
      }

      return ponto;
    });
  }, [historico, itens, selecionadas, metricaSelecionada]);

  if (itens.length === 0) {
    return (
      <section aria-labelledby="titulo-estatisticas-experiencias" className="space-y-4">
        <div>
          <h2 id="titulo-estatisticas-experiencias" className="text-2xl font-bold tracking-tight text-mineral-950">
            Desempenho por experiência
          </h2>
          <p className="text-xs text-mineral-600">
            Compare os percursos e acompanhe a evolução de cada experiência no período selecionado.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-mineral-500">
          Crie uma experiência para acompanhar seu desempenho aqui.
        </div>
      </section>
    );
  }

  const rotulosMetrica: Record<MetricaComparativaTipo, string> = {
    aberturas: "Aberturas",
    conclusoes: "Conclusões",
    permalink: "Via permalink",
    taxa: "Taxa de conclusão (%)",
  };

  return (
    <section aria-labelledby="titulo-estatisticas-experiencias" className="space-y-4">
      {/* Cabeçalho da seção */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="titulo-estatisticas-experiencias"
            className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl"
          >
            Desempenho por experiência
          </h2>
          <p className="mt-1 text-xs text-mineral-500">
            Compare a evolução temporal e analise o funil de cada percurso no mesmo gráfico.
          </p>
        </div>

        {/* Ações rápidas de seleção */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-medium text-mineral-500 mr-1">Filtrar gráfico:</span>
          <button
            type="button"
            onClick={selecionarTodas}
            aria-pressed={selecionadas.size === itens.length}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
              selecionadas.size === itens.length
                ? "border-mineral-950 bg-mineral-950 text-white"
                : "border-slate-200 bg-white text-mineral-700 hover:border-slate-300 hover:text-mineral-950"
            }`}
          >
            Todas ({itens.length})
          </button>
          {itens.length > 3 && (
            <button
              type="button"
              onClick={selecionarTop3}
              aria-pressed={selecionadas.size === 3}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
                selecionadas.size === 3
                  ? "border-mineral-950 bg-mineral-950 text-white"
                  : "border-slate-200 bg-white text-mineral-700 hover:border-slate-300 hover:text-mineral-950"
              }`}
            >
              Top 3
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:p-6">
        {/* Cards de Resumo Consolidado para a seleção atual */}
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Aberturas", resumoAtivo.aberturas.toLocaleString("pt-BR"), null],
            ["Conclusões", resumoAtivo.conclusoes.toLocaleString("pt-BR"), null],
            ["Taxa de conclusão", resumoAtivo.taxa, null],
            [
              "Via permalink",
              resumoAtivo.permalink.toLocaleString("pt-BR"),
              "Acessos diretos por link exclusivo da experiência (fazem parte do total de aberturas).",
            ],
          ].map(([rotulo, valor, tooltip]) => (
            <div
              key={rotulo as string}
              className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 transition-colors hover:bg-slate-50/80"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-mineral-500">
                <dt>{rotulo as string}</dt>
                {tooltip ? (
                  <TooltipInformativo texto={tooltip as string} tamanhoIcone={12} alinhamento="centro" />
                ) : null}
              </div>
              <dd className="mt-1.5 text-2xl font-bold tabular-nums text-mineral-950">{valor}</dd>
            </div>
          ))}
        </dl>

        {/* Controles de métrica do gráfico */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="text-xs font-semibold text-mineral-800">
            Comparação temporal: {rotulosMetrica[metricaSelecionada]}
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 text-xs">
            {(
              [
                ["aberturas", "Aberturas"],
                ["conclusoes", "Conclusões"],
                ["taxa", "Taxa %"],
                ["permalink", "Permalink"],
              ] as const
            ).map(([tipo, rotulo]) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setMetricaSelecionada(tipo)}
                aria-pressed={metricaSelecionada === tipo}
                className={`rounded-md px-3 py-1 font-medium transition-all cursor-pointer ${
                  metricaSelecionada === tipo
                    ? "bg-mineral-950 text-white shadow-2xs"
                    : "text-mineral-600 hover:text-mineral-950"
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>

        {/* Gráfico Unificado */}
        <div
          role="img"
          aria-label={`Comparação de ${rotulosMetrica[metricaSelecionada]} entre experiências`}
          className="h-72 min-w-0"
        >
          {montado && dadosGrafico.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosGrafico} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="data"
                  tickFormatter={(data: string) => `${data.slice(8, 10)}/${data.slice(5, 7)}`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={metricaSelecionada === "taxa"}
                  tick={{ fontSize: 11 }}
                  unit={metricaSelecionada === "taxa" ? "%" : undefined}
                />
                <Tooltip
                  labelFormatter={(data) => String(data).split("-").reverse().join("/")}
                  formatter={(val, name) => {
                    const item = itens.find((i) => i.id === name);
                    const nomeFormatado = item?.titulo ?? name;
                    const valorFormatado =
                      metricaSelecionada === "taxa" ? `${val}%` : val;
                    return [valorFormatado, nomeFormatado];
                  }}
                />
                {itens
                  .filter((item) => selecionadas.has(item.id))
                  .map((item) => (
                    <Line
                      key={item.id}
                      type="monotone"
                      dataKey={item.id}
                      name={item.id}
                      stroke={mapaCores.get(item.id)?.borda ?? "#0284c7"}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-mineral-500">
              Nenhuma atividade registrada neste período.
            </p>
          )}
        </div>

        {/* Legenda Flat Interativa (Chips com Cor da Linha) */}
        {itens.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-mineral-400 mr-1">No gráfico:</span>
            {itens.map((item) => {
              const ativa = selecionadas.has(item.id);
              const cor = mapaCores.get(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => alternarExperiencia(item.id)}
                  aria-pressed={ativa}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-all cursor-pointer ${
                    ativa
                      ? "border-slate-300 bg-slate-50 text-mineral-950 shadow-2xs"
                      : "border-slate-200/60 bg-white text-mineral-400 hover:text-mineral-700 opacity-60"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: ativa ? cor?.borda : "#94a3b8" }}
                    aria-hidden="true"
                  />
                  <span>{item.titulo}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tabela com integração visual e controle de seleção */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-mineral-900">
            <span>Tabela detalhada de experiências</span>
            <span className="text-[11px] font-normal text-mineral-500">
              Clique em uma linha para adicionar/remover do gráfico
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">
                Comparação das experiências no período selecionado
              </caption>
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-medium text-mineral-500">
                <tr>
                  <th scope="col" className="w-12 px-3 py-2.5 text-center">
                    No gráfico
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Experiência
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right">
                    Aberturas
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right">
                    Conclusões
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right">
                    Via permalink
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right">
                    Taxa de conclusão
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {itens.map((item) => {
                  const ativa = selecionadas.has(item.id);
                  const cor = mapaCores.get(item.id);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => alternarExperiencia(item.id)}
                      className={`cursor-pointer transition-colors ${
                        ativa ? "bg-slate-50/70 hover:bg-slate-100/60" : "hover:bg-slate-50/50 opacity-60"
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-block h-3.5 w-3.5 rounded border transition-colors ${
                            ativa ? "border-transparent" : "border-slate-300 bg-white"
                          }`}
                          style={{ backgroundColor: ativa ? cor?.borda : undefined }}
                          aria-label={ativa ? "Ativa no gráfico" : "Desativada no gráfico"}
                        />
                      </td>
                      <th scope="row" className="px-4 py-2.5 font-medium">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-3.5 w-1 shrink-0 rounded-full"
                            style={{ backgroundColor: cor?.borda }}
                            aria-hidden="true"
                          />
                          <span
                            className={
                              ativa
                                ? "text-mineral-950 font-semibold"
                                : "text-mineral-600 font-normal"
                            }
                          >
                            {item.titulo}
                          </span>
                        </div>
                      </th>
                      <td className="px-4 py-2.5 text-right font-bold tabular-nums text-mineral-950">
                        {item.aberturas.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium tabular-nums text-mineral-700">
                        {item.conclusoes.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium tabular-nums text-mineral-700">
                        {(item.aberturasPermalink ?? 0).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-mineral-800">
                        {item.aberturas > 0
                          ? `${((item.conclusoes / item.aberturas) * 100).toLocaleString("pt-BR", {
                              maximumFractionDigits: 1,
                            })}%`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
