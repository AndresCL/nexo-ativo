"use client";

import { useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import {
  consolidarResumoMetricas,
  type ResumoMetricasPeriodo,
} from "@/dominio/analytics/tiposMetricasAgregadas";
import {
  gerarRelatorioDesempenhoParaIA,
  obterRotuloPeriodoRelatorio,
} from "@/dominio/analytics/formatadorRelatorioDesempenhoIA";
import type { Organizacao } from "@/dominio/entidades/autenticacaoEOrganizacao";
import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import type { ItemExperienciaPainel } from "@/infraestrutura/painel/leitorDesempenhoOrganizacaoServidor";
import { BotaoCopiarRelatorioIA } from "./BotaoCopiarRelatorioIA";
import { GradeIndicadoresCRO } from "./indicadores/GradeIndicadoresCRO";
import { DiagramaFunilCRO } from "./funil/DiagramaFunilCRO";
import { GraficoTemporalInterativo } from "./GraficoTemporalInterativo";
import { GraficoCanaisOrigem } from "./GraficoCanaisOrigem";
import { EstatisticasExperiencias } from "./EstatisticasExperiencias";
import { FunilDesempenhoQrCodes } from "./qrcodes/FunilDesempenhoQrCodes";
import { TabelaPerformanceEquipe } from "./equipe/TabelaPerformanceEquipe";
import {
  NavegacaoAbasDesempenho,
  type IdAbaDesempenho,
} from "./compartilhado/NavegacaoAbasDesempenho";

export type { ItemExperienciaPainel };

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
  const [abaAtiva, setAbaAtiva] = useState<IdAbaDesempenho>("visao_geral");

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
    <div className="min-w-0 max-w-full space-y-6 overflow-x-clip">
      {/* Cabeçalho Editorial com Seletor de Período e Cópia para IA */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-marfim-200/80 pb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
            Desempenho & Conversão
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-mineral-600">
            Acompanhe a interação (CTR), captação (CVR), qualificação de leads e fechamento comercial.
          </p>
        </div>

        {/* Controles do Período e Exportação para IA */}
        <div className="flex max-w-full flex-wrap items-center gap-2.5">
          <BotaoCopiarRelatorioIA
            descricaoEscopo={obterRotuloPeriodoRelatorio(mesSelecionado, diaSelecionado)}
            gerarTexto={() =>
              gerarRelatorioDesempenhoParaIA({
                nomeOrganizacao: organizacao.nome,
                mesSelecionado,
                diaSelecionado,
                resumoGeral: resumoMetricas,
                metricasAtivas,
                historicoAtivo: diaSelecionado
                  ? historicoDoMes.filter((d) => d.dataIso === diaSelecionado)
                  : historicoDoMes,
                experiencias,
                profissionais,
              })
            }
          />

          <div className="flex max-w-full items-center gap-2.5 rounded-xl border border-marfim-300 bg-white px-3.5 py-2 shadow-xs transition-all hover:border-marfim-400">
            <Calendar className="h-4 w-4 shrink-0 text-mineral-600" aria-hidden="true" />
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
              className="max-w-full cursor-pointer border-none bg-transparent text-xs font-semibold text-mineral-900 focus:outline-none"
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
        </div>
      </header>

      {/* Navegação por Abas: do Geral ao Particular */}
      <NavegacaoAbasDesempenho abaAtiva={abaAtiva} aoSelecionarAba={setAbaAtiva} />

      {abaAtiva === "visao_geral" ? (
        <div className="min-w-0 space-y-8">
          {/* 1. Indicadores de Conversão CRO */}
          <GradeIndicadoresCRO
            resumoMetricas={metricasAtivas}
            historicoCronologico={historicoCronologico}
            diaSelecionado={diaSelecionado}
            mesSelecionado={mesSelecionado}
          />

          {/* 2. Histórico Diário & Interatividade por Dia */}
          <section aria-labelledby="titulo-grafico-temporal" className="min-w-0">
            <GraficoTemporalInterativo
              historicoDiario={historicoDoMes}
              diaSelecionado={diaSelecionado}
              aoSelecionarDia={setDiaSelecionado}
            />
          </section>

          {/* 3. Funil de Conversão & Retenção em largura total */}
          <div className="min-w-0">
            <DiagramaFunilCRO resumoMetricas={metricasAtivas} experiencias={experiencias} />
          </div>
        </div>
      ) : null}

      {abaAtiva === "aquisicao" ? (
        <div className="min-w-0 space-y-8">
          <GraficoCanaisOrigem
            canais={metricasAtivas.metricasPorCanal}
            qrCodes={metricasAtivas.metricasPorQrCode}
            identificadorOrganizacao={organizacao.identificadorPublico}
          />
          <FunilDesempenhoQrCodes qrCodes={metricasAtivas.metricasPorQrCode} />
        </div>
      ) : null}

      {abaAtiva === "experiencias" ? (
        <div className="min-w-0">
          <EstatisticasExperiencias
            experiencias={experiencias}
            metricas={metricasAtivas.metricasPorMicrofluxo}
            historico={
              diaSelecionado
                ? historicoDoMes.filter((d) => d.dataIso === diaSelecionado)
                : historicoDoMes
            }
          />
        </div>
      ) : null}

      {abaAtiva === "equipe" ? (
        <div className="min-w-0">
          <TabelaPerformanceEquipe
            profissionais={profissionais}
            metricasPorCartao={metricasAtivas.metricasPorCartao}
            metricasPorProfissional={metricasAtivas.metricasPorProfissional}
            identificadorOrganizacao={organizacao.identificadorPublico}
          />
        </div>
      ) : null}
    </div>
  );
}
