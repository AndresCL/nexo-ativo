"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ExternalLink,
  Eye,
  MessageCircle,
  MousePointerClick,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import {
  consolidarResumoMetricas,
  type ResumoMetricasPeriodo,
} from "@/dominio/analytics/tiposMetricasAgregadas";
import type { Organizacao } from "@/dominio/entidades/autenticacaoEOrganizacao";
import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { TooltipInformativo } from "@/componentes/interface/TooltipInformativo";
import { EstatisticasExperiencias } from "./EstatisticasExperiencias";
import { GraficoTemporalInterativo } from "./GraficoTemporalInterativo";
import { DiagramaFunilInterativo } from "./DiagramaFunilInterativo";
import { GraficoCanaisOrigem } from "./GraficoCanaisOrigem";
import { CORES_METRICAS_DESEMPENHO } from "./coresMetricasDesempenho";
import { consolidarDesempenhoEquipe } from "@/dominio/analytics/consolidarDesempenhoEquipe";

export interface PropriedadesPainelDesempenhoPrincipal {
  readonly organizacao: Organizacao;
  readonly resumoMetricas: ResumoMetricasPeriodo;
  readonly profissionais?: readonly ProfissionalEquipe[];
  readonly experiencias?: readonly { readonly id: string; readonly titulo: string }[];
}

/**
 * Mini-gráfico Sparkline em Recharts com gradiente suave e tooltip interativo.
 */
function RechartsKpiSparkline({
  dados,
  corLinha,
  gradienteId,
}: {
  readonly dados: readonly { data: string; valor: number }[];
  readonly corLinha: string;
  readonly gradienteId: string;
}) {
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  if (!montado) {
    return <div className="h-10 w-full rounded bg-marfim-100/60 animate-pulse" />;
  }

  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={dados as { data: string; valor: number }[]}
          margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradienteId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={corLinha} stopOpacity="0.35" />
              <stop offset="100%" stopColor={corLinha} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <RechartsTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0]?.payload as { data: string; valor: number } | undefined;
                if (!item) return null;
                return (
                  <div className="rounded-lg border border-marfim-300 bg-white/95 px-2 py-1 shadow-md text-[10px]">
                    <span className="font-semibold text-mineral-700">{item.data}:</span>{" "}
                    <strong className="text-mineral-950 font-bold">{item.valor}</strong>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="valor"
            stroke={corLinha}
            strokeWidth={2}
            fill={`url(#${gradienteId})`}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PainelDesempenhoPrincipal({
  organizacao,
  resumoMetricas,
  profissionais = [],
  experiencias = [],
}: PropriedadesPainelDesempenhoPrincipal) {
  const [mesSelecionado, setMesSelecionado] = useState<string>("todos");
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  const idGradienteVisualizacoes = useId();
  const idGradienteAberturas = useId();
  const idGradienteConclusoes = useId();
  const idGradienteWhatsapp = useId();

  // Extrai lista única de Ano-Mês ordenados decrescentes
  const mesesDisponiveis = useMemo(() => {
    const conjunto = new Set<string>();
    for (const d of resumoMetricas.historicoDiario) {
      if (d.dataIso && d.dataIso.length >= 7) {
        conjunto.add(d.dataIso.slice(0, 7)); // formato "AAAA-MM"
      }
    }
    return Array.from(conjunto).sort((a, b) => b.localeCompare(a));
  }, [resumoMetricas.historicoDiario]);

  // Histórico filtrado pelo mês
  const historicoDoMes = useMemo(() => {
    if (mesSelecionado === "todos") {
      return resumoMetricas.historicoDiario;
    }
    return resumoMetricas.historicoDiario.filter((d) => d.dataIso.startsWith(mesSelecionado));
  }, [resumoMetricas.historicoDiario, mesSelecionado]);

  // Métricas do período ou do dia específico selecionado
  const metricasAtivas = useMemo(() => {
    if (diaSelecionado) {
      const diaObj = historicoDoMes.find((d) => d.dataIso === diaSelecionado);
      if (diaObj) {
        return consolidarResumoMetricas([diaObj], 1);
      }
    }

    if (mesSelecionado === "todos") {
      return resumoMetricas;
    }

    return consolidarResumoMetricas(historicoDoMes, 31);
  }, [resumoMetricas, historicoDoMes, diaSelecionado, mesSelecionado]);

  // Histórico ordenado cronologicamente para sparklines Recharts
  const historicoCronologico = useMemo(() => {
    return [...historicoDoMes].reverse();
  }, [historicoDoMes]);

  function formatarDataCurta(dataIso: string) {
    if (!dataIso) return "";
    const partes = dataIso.split("-");
    if (partes.length < 3) return dataIso;
    return `${partes[2]}/${partes[1]}`;
  }

  const dadosVisualizacoesSparkline = useMemo(() => {
    if (historicoCronologico.length === 0) {
      return [{ data: "Hoje", valor: metricasAtivas.totalVisualizacoes }];
    }
    return historicoCronologico.map((d) => ({
      data: formatarDataCurta(d.dataIso),
      valor: d.visualizacoesVitrine || 0,
    }));
  }, [historicoCronologico, metricasAtivas.totalVisualizacoes]);

  const dadosAberturasSparkline = useMemo(() => {
    if (historicoCronologico.length === 0) {
      return [{ data: "Hoje", valor: metricasAtivas.totalAberturasMicrofluxo }];
    }
    return historicoCronologico.map((d) => ({
      data: formatarDataCurta(d.dataIso),
      valor: d.aberturasMicrofluxo || 0,
    }));
  }, [historicoCronologico, metricasAtivas.totalAberturasMicrofluxo]);

  const dadosConclusoesSparkline = useMemo(() => {
    if (historicoCronologico.length === 0) {
      return [{ data: "Hoje", valor: metricasAtivas.totalConclusoesMicrofluxo }];
    }
    return historicoCronologico.map((d) => ({
      data: formatarDataCurta(d.dataIso),
      valor: d.conclusoesMicrofluxo || 0,
    }));
  }, [historicoCronologico, metricasAtivas.totalConclusoesMicrofluxo]);

  const dadosWhatsappSparkline = useMemo(() => {
    if (historicoCronologico.length === 0) {
      return [{ data: "Hoje", valor: metricasAtivas.totalCliquesWhatsapp }];
    }
    return historicoCronologico.map((d) => ({
      data: formatarDataCurta(d.dataIso),
      valor: d.cliquesWhatsapp || 0,
    }));
  }, [historicoCronologico, metricasAtivas.totalCliquesWhatsapp]);

  const pctInteresse =
    metricasAtivas.totalVisualizacoes > 0
      ? Math.min(
          100,
          Math.round(
            (metricasAtivas.totalAberturasMicrofluxo / metricasAtivas.totalVisualizacoes) * 100,
          ),
        )
      : 0;

  const membrosEquipeConsolidados = useMemo(
    () =>
      consolidarDesempenhoEquipe(
        profissionais,
        metricasAtivas.metricasPorCartao,
        metricasAtivas.metricasPorProfissional,
      ),
    [profissionais, metricasAtivas.metricasPorCartao, metricasAtivas.metricasPorProfissional],
  );

  return (
    <div className="space-y-8">
      {/* Cabeçalho Editorial com Seletor de Período */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-marfim-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] font-semibold tracking-[0.2em] text-mineral-500 uppercase">
              Analytics Editorial Privado · {organizacao.nome}
            </p>
          </div>
          <h1 className="mt-1.5 text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
            Desempenho & Conversão
          </h1>
          <p className="mt-1 text-xs text-mineral-600">
            Acompanhe o funil de aquisição, canais de tráfego e o rendimento individual dos
            consultores.
          </p>
        </div>

        {/* Seletor de Ano / Mês */}
        <div className="flex items-center gap-2.5 rounded-xl border border-marfim-300 bg-white px-3.5 py-2 shadow-xs transition-all hover:border-marfim-400">
          <Calendar className="h-4 w-4 text-mineral-600" aria-hidden="true" />
          <label htmlFor="seletor-periodo-metricas" className="sr-only">
            Filtrar período
          </label>
          <select
            id="seletor-periodo-metricas"
            value={mesSelecionado}
            onChange={(e) => {
              setMesSelecionado(e.target.value);
              setDiaSelecionado(null);
            }}
            className="cursor-pointer border-none bg-transparent text-xs font-semibold text-mineral-900 focus:outline-none"
          >
            <option value="todos">Últimos 30 dias (visão recente)</option>
            {mesesDisponiveis.map((mes) => {
              const [ano, mesNumero] = mes.split("-");
              const nomeMes = new Date(Number(ano), Number(mesNumero) - 1, 1).toLocaleDateString(
                "pt-BR",
                { month: "long", year: "numeric" },
              );
              return (
                <option key={mes} value={mes}>
                  {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}
                </option>
              );
            })}
          </select>
        </div>
      </header>

      {/* Indicadores com cores consistentes entre ícones, métricas e gráficos */}
      <section
        aria-label="Indicadores principais"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Card 1: Visualizações */}
        <div className="relative rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/80 via-white to-white p-5 shadow-xs transition-all hover:z-20 hover:border-indigo-300 hover:shadow-sm focus-within:z-20">
          <div className="flex items-center justify-between text-indigo-900">
            <div className="flex items-center gap-1.5">
              <TooltipInformativo
                alinhamento="esquerda"
                texto="Acessos e visualizações recebidas na vitrine pública da loja e nos cartões VIP da equipe no período selecionado."
              />
              <span className="text-xs font-bold">Visualizações Vitrine</span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
              <Eye className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-extrabold tabular-nums text-indigo-950">
              {metricasAtivas.totalVisualizacoes}
            </p>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-900">
              {diaSelecionado
                ? diaSelecionado
                : mesSelecionado === "todos"
                  ? `${metricasAtivas.diasConsiderados} ${metricasAtivas.diasConsiderados === 1 ? "dia" : "dias"}`
                  : mesSelecionado}
            </span>
          </div>

          <div className="mt-3 pt-2 border-t border-indigo-100">
            <RechartsKpiSparkline
              dados={dadosVisualizacoesSparkline}
              corLinha={CORES_METRICAS_DESEMPENHO.visualizacoes.principal}
              gradienteId={idGradienteVisualizacoes}
            />
          </div>
        </div>

        {/* Card 2: Microfluxos Iniciados */}
        <div className="relative rounded-2xl border border-sky-200 bg-gradient-to-b from-sky-50/80 via-white to-white p-5 shadow-xs transition-all hover:z-20 hover:border-sky-300 hover:shadow-sm focus-within:z-20">
          <div className="flex items-center justify-between text-sky-800">
            <div className="flex items-center gap-1.5">
              <TooltipInformativo
                alinhamento="esquerda"
                texto="Quantas vezes visitantes abriram uma jornada interativa (simulação, avaliação de veículo, agendamento ou catálogo)."
              />
              <span className="text-xs font-bold">Microfluxos Iniciados</span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white shadow-2xs">
              <MousePointerClick className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-extrabold tabular-nums text-sky-950">
              {metricasAtivas.totalAberturasMicrofluxo}
            </p>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
              {pctInteresse}% das visitas
            </span>
          </div>

          <div className="mt-3 pt-2 border-t border-sky-100">
            <RechartsKpiSparkline
              dados={dadosAberturasSparkline}
              corLinha={CORES_METRICAS_DESEMPENHO.aberturas.principal}
              gradienteId={idGradienteAberturas}
            />
          </div>
        </div>

        {/* Card 3: Conclusões do Funil */}
        <div className="relative rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/80 via-white to-white p-5 shadow-xs transition-all hover:z-20 hover:border-emerald-300 hover:shadow-sm focus-within:z-20">
          <div className="flex items-center justify-between text-emerald-800">
            <div className="flex items-center gap-1.5">
              <TooltipInformativo
                alinhamento="centro"
                texto="Solicitações e propostas concluídas até a última etapa do fluxo com dados do cliente enviados."
              />
              <span className="text-xs font-bold">Conclusões Comerciais</span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-extrabold tabular-nums text-emerald-950">
              {metricasAtivas.totalConclusoesMicrofluxo}
            </p>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              {metricasAtivas.taxaConversaoMicrofluxoPercentual}% no fluxo
            </span>
          </div>

          <div className="mt-3 pt-2 border-t border-emerald-100">
            <RechartsKpiSparkline
              dados={dadosConclusoesSparkline}
              corLinha={CORES_METRICAS_DESEMPENHO.conclusoes.principal}
              gradienteId={idGradienteConclusoes}
            />
          </div>
        </div>

        {/* Card 4: Contatos no WhatsApp */}
        <div className="relative rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50/80 via-white to-white p-5 shadow-xs transition-all hover:z-20 hover:border-violet-300 hover:shadow-sm focus-within:z-20">
          <div className="flex items-center justify-between text-violet-900">
            <div className="flex items-center gap-1.5">
              <TooltipInformativo
                alinhamento="direita"
                texto="Cliques diretos para iniciar conversa no WhatsApp comercial da loja ou de consultores da equipe."
              />
              <span className="text-xs font-bold">Contatos no WhatsApp</span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white shadow-2xs">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-extrabold tabular-nums text-violet-950">
              {metricasAtivas.totalCliquesWhatsapp}
            </p>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-900">
              Cliques diretos
            </span>
          </div>

          <div className="mt-3 pt-2 border-t border-violet-100">
            <RechartsKpiSparkline
              dados={dadosWhatsappSparkline}
              corLinha={CORES_METRICAS_DESEMPENHO.whatsapp.principal}
              gradienteId={idGradienteWhatsapp}
            />
          </div>
        </div>
      </section>

      {/* Gráfico Temporal Interativo com Drilldown por Dia Clicado */}
      <section aria-labelledby="titulo-grafico-temporal">
        <GraficoTemporalInterativo
          historicoDiario={historicoDoMes}
          diaSelecionado={diaSelecionado}
          aoSelecionarDia={setDiaSelecionado}
        />
      </section>

      {/* Grid: Funil de Conversão & Canais de Origem */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Funil Visual Hiper-Moderno */}
        <DiagramaFunilInterativo resumoMetricas={metricasAtivas} />

        {/* Canais de Origem e Aquisição */}
        <GraficoCanaisOrigem
          canais={metricasAtivas.metricasPorCanal}
          identificadorOrganizacao={organizacao.identificadorPublico}
        />
      </section>

      <EstatisticasExperiencias
        experiencias={experiencias}
        metricas={metricasAtivas.metricasPorMicrofluxo}
        historico={
          diaSelecionado
            ? historicoDoMes.filter((d) => d.dataIso === diaSelecionado)
            : historicoDoMes
        }
      />

      {/* Performance dos Membros da Equipe & Cartões VIP */}
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
                    const urlCartao = `/${organizacao.identificadorPublico}/equipe/${item.identificadorCartao}`;

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

      {/* Tabela de Detalhamento Diário */}
      <section aria-labelledby="titulo-tabela-diaria" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="titulo-tabela-diaria" className="text-xl font-bold text-mineral-950">
              Registro Diário Detalhado
            </h2>
            <p className="text-xs text-mineral-600">
              Histórico diário auditado sem cruzamento de cookies ou dados pessoais de visitantes.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-sky-100 bg-gradient-to-r from-indigo-50/70 to-sky-50/70 text-[11px] font-bold tracking-wider text-mineral-600 uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Data
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center">
                    Visualizações
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center">
                    Aberturas de Fluxo
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center">
                    Conclusões
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    WhatsApp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historicoDoMes.map((dia) => {
                  const estaSelecionado = diaSelecionado === dia.dataIso;
                  return (
                    <tr
                      key={dia.dataIso}
                      onClick={() => setDiaSelecionado(estaSelecionado ? null : dia.dataIso)}
                      className={combinarClasses(
                        "cursor-pointer transition-colors",
                        estaSelecionado ? "bg-indigo-50/90 font-medium" : "hover:bg-sky-50/70",
                      )}
                    >
                      <td className="px-5 py-3.5 font-mono font-medium text-mineral-900">
                        {dia.dataIso}
                        {estaSelecionado ? (
                          <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-900">
                            Dia Filtrado
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-indigo-900">
                        {dia.visualizacoesVitrine}
                      </td>
                      <td className="px-4 py-3.5 text-center font-medium text-sky-900">
                        {dia.aberturasMicrofluxo}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-emerald-900">
                        {dia.conclusoesMicrofluxo}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-violet-900">
                        {dia.cliquesWhatsapp}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
