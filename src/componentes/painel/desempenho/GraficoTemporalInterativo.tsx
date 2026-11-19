"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { MetricasDiariasOrganizacao } from "@/dominio/analytics/tiposMetricasAgregadas";
import { CORES_METRICAS_DESEMPENHO } from "./coresMetricasDesempenho";

export interface PropriedadesGraficoTemporalInterativo {
  readonly historicoDiario: readonly MetricasDiariasOrganizacao[];
  readonly diaSelecionado: string | null;
  readonly aoSelecionarDia: (dataIso: string | null) => void;
}

interface ItemGraficoRecharts {
  readonly dataIso: string;
  readonly rotuloData: string;
  readonly dataCompleta: string;
  readonly visitas: number;
  readonly aberturas: number;
  readonly whatsapp: number;
}

export function GraficoTemporalInterativo({
  historicoDiario,
  diaSelecionado,
  aoSelecionarDia,
}: PropriedadesGraficoTemporalInterativo) {
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  // Ordena cronologicamente da data mais antiga para a mais recente
  const dadosCronologicos = useMemo(() => {
    return [...historicoDiario].reverse();
  }, [historicoDiario]);

  function formatarDataLegenda(dataIso: string) {
    if (!dataIso) return "";
    const [ano, mes, dia] = dataIso.split("-");
    if (!ano || !mes || !dia) return dataIso;
    const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }

  function formatarDataCompleta(dataIso: string) {
    if (!dataIso) return "";
    const [ano, mes, dia] = dataIso.split("-");
    if (!ano || !mes || !dia) return dataIso;
    const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
    return data.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const dadosFormatados: readonly ItemGraficoRecharts[] = useMemo(() => {
    return dadosCronologicos.map((dia) => ({
      dataIso: dia.dataIso,
      rotuloData: formatarDataLegenda(dia.dataIso),
      dataCompleta: formatarDataCompleta(dia.dataIso),
      visitas: dia.visualizacoesVitrine || 0,
      aberturas: dia.aberturasMicrofluxo || 0,
      whatsapp: dia.cliquesWhatsapp || 0,
    }));
  }, [dadosCronologicos]);

  const diaAtivoObjeto = useMemo(() => {
    if (!diaSelecionado) return null;
    return historicoDiario.find((d) => d.dataIso === diaSelecionado) ?? null;
  }, [historicoDiario, diaSelecionado]);

  if (dadosCronologicos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-marfim-300 bg-white p-8 text-center text-xs text-mineral-500 shadow-xs">
        <Calendar className="mb-2 h-6 w-6 text-mineral-400" />
        <p>Nenhuma métrica registrada no período selecionado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Banner de Drilldown de Dia Ativo */}
      <AnimatePresence>
        {diaSelecionado && diaAtivoObjeto ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50/90 px-4 py-2.5 text-xs text-indigo-950 shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="font-medium">
                Filtrando métricas do dia:{" "}
                <strong className="capitalize font-bold text-indigo-950">
                  {formatarDataCompleta(diaSelecionado)}
                </strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-[11px] text-indigo-800 font-semibold">
                {diaAtivoObjeto.visualizacoesVitrine} visitas · {diaAtivoObjeto.aberturasMicrofluxo}{" "}
                fluxos · {diaAtivoObjeto.cliquesWhatsapp} cliques no WhatsApp
              </span>
              <button
                type="button"
                onClick={() => aoSelecionarDia(null)}
                className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-2 py-1 text-[11px] font-bold text-indigo-950 transition-colors hover:bg-indigo-200"
              >
                <X className="h-3 w-3" />
                <span>Ver período completo</span>
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Cabeçalho da Seção (Fora do Card) */}
      <div className="flex flex-wrap items-end justify-between gap-4 text-xs">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-mineral-950">
            Histórico Diário & Interatividade por Dia
          </h3>
          <p className="mt-0.5 text-xs text-mineral-600">
            Clique em qualquer coluna do gráfico para isolar e filtrar o resultado daquele dia
            específico.
          </p>
        </div>

        {/* Legenda de cores */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-mineral-700">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-indigo-600 shadow-2xs" />
            <span>Visitas</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-sky-600 shadow-2xs" />
            <span>Fluxos Iniciados</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-violet-600 shadow-2xs" />
            <span>Cliques no WhatsApp</span>
          </span>
        </div>
      </div>

      {/* Área do Gráfico Interativo com Recharts BarChart */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/60 via-white to-white p-4 shadow-xs sm:p-6">
        {/* Seletor rápido de dias em chips / botões acessíveis para teclado e testes */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5 border-b border-indigo-100 pb-3 text-xs">
          <span className="font-semibold text-mineral-600 mr-1">Filtrar dia:</span>
          {dadosFormatados.map((d) => {
            const ativo = d.dataIso === diaSelecionado;
            return (
              <button
                key={d.dataIso}
                type="button"
                onClick={() => aoSelecionarDia(ativo ? null : d.dataIso)}
                className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-semibold transition-all ${
                  ativo
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "border border-indigo-200 bg-white text-indigo-950 hover:bg-indigo-50"
                }`}
              >
                {d.dataIso}
              </button>
            );
          })}
        </div>

        {/* Gráfico Recharts Responsivo */}
        {montado ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dadosFormatados as ItemGraficoRecharts[]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onClick={(estado) => {
                  const payloadAtivo = (
                    estado as {
                      activePayload?: readonly { payload?: ItemGraficoRecharts }[];
                    } | null
                  )?.activePayload;
                  if (payloadAtivo && payloadAtivo.length > 0) {
                    const clicado = payloadAtivo[0]?.payload;
                    if (clicado?.dataIso) {
                      if (diaSelecionado === clicado.dataIso) {
                        aoSelecionarDia(null);
                      } else {
                        aoSelecionarDia(clicado.dataIso);
                      }
                    }
                  }
                }}
                className="cursor-pointer"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0eee6" vertical={false} />
                <XAxis
                  dataKey="rotuloData"
                  tickLine={false}
                  axisLine={{ stroke: "#e7e5e4" }}
                  tick={{ fontSize: 11, fill: "#78716c", fontWeight: 500 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: "#e7e5e4" }}
                  tick={{ fontSize: 11, fill: "#78716c" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(79, 70, 229, 0.06)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0]?.payload as ItemGraficoRecharts | undefined;
                      if (!item) return null;
                      return (
                        <div className="rounded-xl border border-marfim-300 bg-white/95 backdrop-blur-sm p-3.5 shadow-xl text-xs min-w-[200px]">
                          <p className="font-bold text-mineral-950 capitalize border-b border-marfim-200 pb-1.5">
                            {item.dataCompleta}
                          </p>
                          <div className="mt-2 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-indigo-800">
                                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                                Visitas Vitrine:
                              </span>
                              <strong className="text-sm font-bold text-indigo-950">
                                {item.visitas}
                              </strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-sky-800">
                                <span className="h-2 w-2 rounded-full bg-sky-600" />
                                Fluxos Iniciados:
                              </span>
                              <strong className="text-sm font-bold text-sky-950">
                                {item.aberturas}
                              </strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-violet-800">
                                <span className="h-2 w-2 rounded-full bg-violet-600" />
                                Cliques no WhatsApp:
                              </span>
                              <strong className="text-sm font-bold text-violet-950">
                                {item.whatsapp}
                              </strong>
                            </div>
                          </div>
                          <p className="mt-2 text-[10px] text-mineral-500 italic border-t border-marfim-150 pt-1">
                            Clique para isolar este dia no painel
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Bar dataKey="visitas" name="Visitas" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {dadosFormatados.map((entry) => (
                    <Cell
                      key={`cell-v-${entry.dataIso}`}
                      fill={
                        entry.dataIso === diaSelecionado
                          ? CORES_METRICAS_DESEMPENHO.visualizacoes.selecionada
                          : CORES_METRICAS_DESEMPENHO.visualizacoes.principal
                      }
                      fillOpacity={diaSelecionado && entry.dataIso !== diaSelecionado ? 0.35 : 1}
                    />
                  ))}
                </Bar>

                <Bar
                  dataKey="aberturas"
                  name="Fluxos Iniciados"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                >
                  {dadosFormatados.map((entry) => (
                    <Cell
                      key={`cell-a-${entry.dataIso}`}
                      fill={
                        entry.dataIso === diaSelecionado
                          ? CORES_METRICAS_DESEMPENHO.aberturas.selecionada
                          : CORES_METRICAS_DESEMPENHO.aberturas.principal
                      }
                      fillOpacity={diaSelecionado && entry.dataIso !== diaSelecionado ? 0.35 : 1}
                    />
                  ))}
                </Bar>

                <Bar
                  dataKey="whatsapp"
                  name="Cliques no WhatsApp"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                >
                  {dadosFormatados.map((entry) => (
                    <Cell
                      key={`cell-w-${entry.dataIso}`}
                      fill={
                        entry.dataIso === diaSelecionado
                          ? CORES_METRICAS_DESEMPENHO.whatsapp.selecionada
                          : CORES_METRICAS_DESEMPENHO.whatsapp.principal
                      }
                      fillOpacity={diaSelecionado && entry.dataIso !== diaSelecionado ? 0.35 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 w-full animate-pulse rounded-xl bg-marfim-100" />
        )}
      </div>
    </div>
  );
}
