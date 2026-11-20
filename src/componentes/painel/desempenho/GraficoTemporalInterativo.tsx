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

const CORES_GRAFICO_FLAT = {
  visitas: "#4F46E5", // Índigo
  aberturas: "#0284C7", // Azul Celeste
  whatsapp: "#10B981", // Esmeralda
} as const;

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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-xs text-mineral-500 shadow-2xs">
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
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-mineral-900 shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-mineral-950 animate-pulse" />
              <span className="font-medium text-mineral-700">
                Filtrando métricas do dia:{" "}
                <strong className="capitalize font-bold text-mineral-950">
                  {formatarDataCompleta(diaSelecionado)}
                </strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-[11px] font-semibold text-mineral-600">
                {diaAtivoObjeto.visualizacoesVitrine} visitas · {diaAtivoObjeto.aberturasMicrofluxo}{" "}
                fluxos · {diaAtivoObjeto.cliquesWhatsapp} cliques no WhatsApp
              </span>
              <button
                type="button"
                onClick={() => aoSelecionarDia(null)}
                className="inline-flex items-center gap-1 rounded-md bg-mineral-950 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-neutral-800 shadow-2xs cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>Ver período completo</span>
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Cabeçalho da Seção */}
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

        {/* Legenda de cores Flat */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-mineral-700">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#4F46E5]" />
            <span>Visitas</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#0284C7]" />
            <span>Fluxos Iniciados</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#10B981]" />
            <span>Cliques no WhatsApp</span>
          </span>
        </div>
      </div>

      {/* Área do Gráfico Flat em Card Branco Sólido */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs sm:p-6">
        {/* Seletor rápido de dias em chips / botões acessíveis para teclado e testes */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3 text-xs">
          <span className="font-semibold text-mineral-500 mr-1">Filtrar dia:</span>
          {dadosFormatados.map((d) => {
            const ativo = d.dataIso === diaSelecionado;
            return (
              <button
                key={d.dataIso}
                type="button"
                onClick={() => aoSelecionarDia(ativo ? null : d.dataIso)}
                className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                  ativo
                    ? "bg-mineral-950 text-white shadow-2xs"
                    : "border border-slate-200 bg-white text-mineral-800 hover:bg-slate-50 hover:border-slate-300"
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="rotuloData"
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0]?.payload as ItemGraficoRecharts | undefined;
                      if (!item) return null;
                      return (
                        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-md text-xs min-w-[200px]">
                          <p className="font-bold text-mineral-950 capitalize border-b border-slate-100 pb-1.5">
                            {item.dataCompleta}
                          </p>
                          <div className="mt-2 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-mineral-700">
                                <span className="h-2 w-2 rounded-full bg-[#4F46E5]" />
                                Visitas Vitrine:
                              </span>
                              <strong className="text-sm font-bold tabular-nums text-mineral-950">
                                {item.visitas}
                              </strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-mineral-700">
                                <span className="h-2 w-2 rounded-full bg-[#0284C7]" />
                                Fluxos Iniciados:
                              </span>
                              <strong className="text-sm font-bold tabular-nums text-mineral-950">
                                {item.aberturas}
                              </strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-mineral-700">
                                <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                                Cliques no WhatsApp:
                              </span>
                              <strong className="text-sm font-bold tabular-nums text-mineral-950">
                                {item.whatsapp}
                              </strong>
                            </div>
                          </div>
                          <p className="mt-2 text-[10px] text-mineral-400 italic border-t border-slate-100 pt-1">
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
                      fill={CORES_GRAFICO_FLAT.visitas}
                      fillOpacity={diaSelecionado && entry.dataIso !== diaSelecionado ? 0.25 : 1}
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
                      fill={CORES_GRAFICO_FLAT.aberturas}
                      fillOpacity={diaSelecionado && entry.dataIso !== diaSelecionado ? 0.25 : 1}
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
                      fill={CORES_GRAFICO_FLAT.whatsapp}
                      fillOpacity={diaSelecionado && entry.dataIso !== diaSelecionado ? 0.25 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 w-full animate-pulse rounded-xl bg-slate-100" />
        )}
      </div>
    </div>
  );
}
