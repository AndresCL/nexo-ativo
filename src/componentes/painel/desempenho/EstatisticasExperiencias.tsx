"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckSquare, Square } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-mineral-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-600 text-white">
              <BarChart3 className="h-3 w-3" aria-hidden="true" />
            </span>
            Percursos individuais
          </div>
          <h2
            id="titulo-estatisticas-experiencias"
            className="mt-1 text-2xl font-bold tracking-tight text-mineral-950"
          >
            Desempenho por experiência
          </h2>
          <p className="text-xs text-mineral-600">
            Compare a evolução temporal e analise o funil de cada percurso no mesmo gráfico.
          </p>
        </div>

        {/* Ações rápidas de seleção */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-mineral-500">Filtrar gráfico:</span>
          <button
            type="button"
            onClick={selecionarTodas}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-medium text-mineral-700 hover:bg-slate-50 hover:text-mineral-900"
          >
            Todas ({itens.length})
          </button>
          {itens.length > 3 && (
            <button
              type="button"
              onClick={selecionarTop3}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-medium text-mineral-700 hover:bg-slate-50 hover:text-mineral-900"
            >
              Top 3
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/50 to-white p-4 shadow-xs sm:p-6">
        {/* Cards de Resumo Consolidado para a seleção atual */}
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Aberturas", resumoAtivo.aberturas, "border-sky-100 text-sky-800"],
            ["Conclusões", resumoAtivo.conclusoes, "border-emerald-100 text-emerald-800"],
            ["Taxa de conclusão", resumoAtivo.taxa, "border-slate-200 text-slate-800"],
            ["Via permalink", resumoAtivo.permalink, "border-indigo-100 text-indigo-800"],
          ].map(([rotulo, valor, classes]) => (
            <div key={rotulo} className={`rounded-xl border bg-white p-4 ${classes}`}>
              <dt className="text-xs font-medium">{rotulo}</dt>
              <dd className="mt-2 text-2xl font-bold tabular-nums">{valor}</dd>
            </div>
          ))}
        </dl>

        {/* Controles de métrica do gráfico */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="text-xs font-semibold text-mineral-700">
            Comparação temporal: {rotulosMetrica[metricaSelecionada]}
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100/70 p-0.5 text-xs">
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
                className={`rounded-md px-3 py-1 font-medium transition-all ${metricaSelecionada === tipo
                    ? "bg-white text-mineral-950 shadow-xs"
                    : "text-mineral-600 hover:text-mineral-900"
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
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(value) => {
                    const item = itens.find((i) => i.id === value);
                    return item?.titulo ?? value;
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

        <p className="text-xs text-mineral-500">
          As aberturas via permalink fazem parte do total de aberturas. Essa identificação começa com
          os novos acessos; o histórico anterior não é reclassificado.
        </p>

        {/* Tabela com integração visual e controle de seleção */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-mineral-700">
            <span>Tabela detalhada de experiências</span>
            <span className="text-[11px] font-normal text-mineral-500">
              Clique em uma linha para adicionar/remover do gráfico
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">
                Comparação das experiências no período selecionado
              </caption>
              <thead className="border-b border-sky-100 bg-sky-50/70 text-mineral-700">
                <tr>
                  <th scope="col" className="w-10 px-3 py-3 text-center">
                    No gráfico
                  </th>
                  {[
                    "Experiência",
                    "Aberturas",
                    "Conclusões",
                    "Via permalink",
                    "Taxa de conclusão",
                  ].map((rotulo) => (
                    <th key={rotulo} scope="col" className="px-4 py-3">
                      {rotulo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itens.map((item) => {
                  const ativa = selecionadas.has(item.id);
                  const cor = mapaCores.get(item.id);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => alternarExperiencia(item.id)}
                      className={`cursor-pointer transition-colors ${ativa ? "bg-sky-50/50 hover:bg-sky-50/80" : "hover:bg-slate-50 opacity-70"
                        }`}
                    >
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-block h-3.5 w-3.5 rounded border ${ativa ? "border-transparent" : "border-slate-300 bg-white"
                            }`}
                          style={{ backgroundColor: ativa ? cor?.borda : undefined }}
                          aria-label={ativa ? "Ativa no gráfico" : "Desativada no gráfico"}
                        />
                      </td>
                      <th scope="row" className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: cor?.borda }}
                            aria-hidden="true"
                          />
                          <span className={ativa ? "text-mineral-950 font-semibold" : "text-mineral-700"}>
                            {item.titulo}
                          </span>
                        </div>
                      </th>
                      <td className="px-4 py-3 tabular-nums text-sky-800">{item.aberturas}</td>
                      <td className="px-4 py-3 tabular-nums text-emerald-800">{item.conclusoes}</td>
                      <td className="px-4 py-3 tabular-nums text-indigo-800">
                        {item.aberturasPermalink ?? 0}
                      </td>
                      <td className="px-4 py-3 tabular-nums font-medium">
                        {item.aberturas > 0
                          ? `${((item.conclusoes / item.aberturas) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`
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
