"use client";

import { useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import {
  consolidarResumoMetricas,
  type ResumoMetricasPeriodo,
} from "@/dominio/analytics/tiposMetricasAgregadas";
import type { Organizacao } from "@/dominio/entidades/autenticacaoEOrganizacao";
import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import { GradeIndicadoresCRO } from "./indicadores/GradeIndicadoresCRO";
import { DiagramaFunilCRO } from "./funil/DiagramaFunilCRO";
import { GraficoTemporalInterativo } from "./GraficoTemporalInterativo";
import { GraficoCanaisOrigem } from "./GraficoCanaisOrigem";
import { EstatisticasExperiencias } from "./EstatisticasExperiencias";
import { FunilDesempenhoQrCodes } from "./qrcodes/FunilDesempenhoQrCodes";
import { TabelaPerformanceEquipe } from "./equipe/TabelaPerformanceEquipe";

export interface ItemExperienciaPainel {
  readonly id: string;
  readonly titulo: string;
  readonly etapas?: readonly { readonly id: string; readonly titulo: string }[];
}

export interface PropriedadesPainelDesempenhoPrincipal {
  readonly organizacao: Organizacao;
  readonly resumoMetricas: ResumoMetricasPeriodo;
  readonly profissionais?: readonly ProfissionalEquipe[];
  readonly experiencias?: readonly ItemExperienciaPainel[];
}

export function PainelDesempenhoPrincipal({
  organizacao,
  resumoMetricas,
  profissionais = [],
  experiencias = [],
}: PropriedadesPainelDesempenhoPrincipal) {
  const [mesSelecionado, setMesSelecionado] = useState<string>("todos");
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

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
        return consolidarResumoMetricas([diaObj], 1, {
          leadsQualificados: resumoMetricas.metricasCRO?.entradas.leadsQualificados,
          vendasConcluidas: resumoMetricas.metricasCRO?.entradas.vendasConcluidas,
        });
      }
    }

    if (mesSelecionado === "todos") {
      return resumoMetricas;
    }

    return consolidarResumoMetricas(historicoDoMes, 31, {
      leadsQualificados: resumoMetricas.metricasCRO?.entradas.leadsQualificados,
      vendasConcluidas: resumoMetricas.metricasCRO?.entradas.vendasConcluidas,
    });
  }, [resumoMetricas, historicoDoMes, diaSelecionado, mesSelecionado]);

  // Histórico ordenado cronologicamente para sparklines e gráficos
  const historicoCronologico = useMemo(() => {
    return [...historicoDoMes].reverse();
  }, [historicoDoMes]);

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
            Acompanhe a interação (CTR), captação (CVR), qualificação de leads e fechamento comercial.
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

      {/* Indicadores de Conversão CRO com Fórmulas e Sparklines */}
      <GradeIndicadoresCRO
        resumoMetricas={metricasAtivas}
        historicoCronologico={historicoCronologico}
        diaSelecionado={diaSelecionado}
        mesSelecionado={mesSelecionado}
      />

      {/* Histórico Diário & Interatividade por Dia */}
      <section aria-labelledby="titulo-grafico-temporal">
        <GraficoTemporalInterativo
          historicoDiario={historicoDoMes}
          diaSelecionado={diaSelecionado}
          aoSelecionarDia={setDiaSelecionado}
        />
      </section>

      {/* Grid: Funil CRO Completo (Global vs Por Experiência) & Canais de Origem */}
      <section className="grid gap-6 lg:grid-cols-2">
        <DiagramaFunilCRO resumoMetricas={metricasAtivas} experiencias={experiencias} />
        <GraficoCanaisOrigem
          canais={metricasAtivas.metricasPorCanal}
          qrCodes={metricasAtivas.metricasPorQrCode}
          identificadorOrganizacao={organizacao.identificadorPublico}
        />
      </section>

      {/* Métricas Individuais por Percurso / Microfluxo */}
      <EstatisticasExperiencias
        experiencias={experiencias}
        metricas={metricasAtivas.metricasPorMicrofluxo}
        historico={
          diaSelecionado
            ? historicoDoMes.filter((d) => d.dataIso === diaSelecionado)
            : historicoDoMes
        }
      />

      {/* Desempenho por QR Code com Funil Físico Dedicado e Filtro por Destino */}
      <FunilDesempenhoQrCodes qrCodes={metricasAtivas.metricasPorQrCode} />

      {/* Performance dos Membros da Equipe & Cartões VIP */}
      <TabelaPerformanceEquipe
        profissionais={profissionais}
        metricasPorCartao={metricasAtivas.metricasPorCartao}
        metricasPorProfissional={metricasAtivas.metricasPorProfissional}
        identificadorOrganizacao={organizacao.identificadorPublico}
      />
    </div>
  );
}
