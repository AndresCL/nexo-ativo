"use client";

import { useId, useMemo, useState } from "react";
import { Filter, Layers, Link2, Sparkles } from "lucide-react";
import type {
  MetricaGranularMicrofluxo,
  ResumoMetricasPeriodo,
} from "@/dominio/analytics/tiposMetricasAgregadas";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import type { ItemExperienciaPainel } from "@/infraestrutura/painel/leitorDesempenhoOrganizacaoServidor";
import { ConectorAbandonoFunil } from "./ConectorAbandonoFunil";

export interface PropriedadesDiagramaFunilCRO {
  readonly resumoMetricas: ResumoMetricasPeriodo;
  readonly experiencias?: readonly ItemExperienciaPainel[];
}

export function DiagramaFunilCRO({
  resumoMetricas,
  experiencias = [],
}: PropriedadesDiagramaFunilCRO) {
  const [experienciaIdSelecionada, setExperienciaIdSelecionada] = useState<string>("todas");
  const idSelect = useId();

  // Consolidação de métricas por microfluxo
  const mapaMetricasMicrofluxo = useMemo(() => {
    const mapa = new Map<string, MetricaGranularMicrofluxo>();
    for (const m of resumoMetricas.metricasPorMicrofluxo) {
      mapa.set(m.id, m);
    }
    return mapa;
  }, [resumoMetricas.metricasPorMicrofluxo]);

  const microfluxoSelecionado = useMemo(() => {
    if (experienciaIdSelecionada === "todas") return null;
    return mapaMetricasMicrofluxo.get(experienciaIdSelecionada) ?? null;
  }, [experienciaIdSelecionada, mapaMetricasMicrofluxo]);

  const definicaoExperienciaSelecionada = useMemo(() => {
    if (experienciaIdSelecionada === "todas") return null;
    return experiencias.find((e) => e.id === experienciaIdSelecionada) ?? null;
  }, [experienciaIdSelecionada, experiencias]);

  // Lista de experiências com aberturas ordenadas decrescentes para o seletor
  const listaOpcoesExperiencias = useMemo(() => {
    const itens = experiencias.map((exp) => {
      const metrica = mapaMetricasMicrofluxo.get(exp.id);
      return {
        id: exp.id,
        titulo: exp.titulo,
        aberturas: metrica?.aberturas ?? 0,
        conclusoes: metrica?.conclusoes ?? 0,
      };
    });
    return itens.sort((a, b) => b.aberturas - a.aberturas || a.titulo.localeCompare(b.titulo));
  }, [experiencias, mapaMetricasMicrofluxo]);

  // Construção dos estágios do funil:
  // - Modo Global: Macro estágios do negócio (Visitantes -> Cliques -> Contatos -> Qualificados -> Vendas)
  // - Modo Individual: Etapas reais do próprio microfluxo (sem permalink como degrau falso!)
  const etapas = useMemo(() => {
    if (experienciaIdSelecionada === "todas" || !microfluxoSelecionado) {
      return resumoMetricas.metricasCRO?.etapasFunil ?? [];
    }

    const topo = microfluxoSelecionado.aberturas;
    const conclusoes = microfluxoSelecionado.conclusoes;
    const taxaConclusao = topo > 0 ? Math.round((conclusoes / topo) * 1000) / 10 : 0;

    // Etapas reais cadastradas no fluxo pelo lojista
    const etapasCadastradas = definicaoExperienciaSelecionada?.etapas ?? [];
    const metricasEtapas = microfluxoSelecionado.porEtapa ?? {};

    // Se o fluxo tem etapas cadastradas, renderiza todas as etapas dinamicamente
    if (etapasCadastradas.length > 0) {
      const temTelemetriaEtapas = Object.keys(metricasEtapas).length > 0;

      const resultado = [
        {
          id: "inicio",
          nome: `1. Início: ${etapasCadastradas[0]?.titulo || "Início do percurso"}`,
          volume: topo,
          percentualSobreTopo: 100,
          percentualSobreEtapaAnterior: 100,
          detalhe: `Visitantes que iniciaram '${microfluxoSelecionado.titulo}'`,
          cor: "#0284C7",
        },
      ];

      let volumeAnterior = topo;

      for (let i = 1; i < etapasCadastradas.length; i++) {
        const etapa = etapasCadastradas[i]!;
        // Se há telemetria gravada para etapas, usa o volume real medido; caso contrário, usa o piso de conclusões
        const gravado = metricasEtapas[etapa.id];
        const volumeEtapa = temTelemetriaEtapas
          ? Math.min(topo, gravado !== undefined ? gravado : 0)
          : Math.min(topo, conclusoes);
        const pctTopo = topo > 0 ? Math.round((volumeEtapa / topo) * 1000) / 10 : 0;
        const pctAnterior =
          volumeAnterior > 0 ? Math.round((volumeEtapa / volumeAnterior) * 1000) / 10 : 0;

        resultado.push({
          id: etapa.id,
          nome: `${i + 1}. ${etapa.titulo}`,
          volume: volumeEtapa,
          percentualSobreTopo: pctTopo,
          percentualSobreEtapaAnterior: pctAnterior,
          detalhe: `${pctTopo}% dos que iniciaram alcançaram esta tela`,
          cor: i === etapasCadastradas.length - 1 ? "#10B981" : "#6366F1",
        });

        volumeAnterior = volumeEtapa;
      }

      // Adiciona o estágio final de Conclusão / Envio de Proposta
      resultado.push({
        id: "conclusao-final",
        nome: `${etapasCadastradas.length + 1}. Propostas Concluídas (CVR)`,
        volume: conclusoes,
        percentualSobreTopo: taxaConclusao,
        percentualSobreEtapaAnterior:
          volumeAnterior > 0 ? Math.round((conclusoes / volumeAnterior) * 1000) / 10 : 0,
        detalhe: `${taxaConclusao}% dos que iniciaram chegaram até o envio final`,
        cor: "#059669",
      });

      return resultado;
    }

    // Fluxo sem etapas detalhadas cadastradas: visão direta de abertura e conclusão
    return [
      {
        id: "aberturas",
        nome: "1. Aberturas do Percurso",
        volume: topo,
        percentualSobreTopo: 100,
        percentualSobreEtapaAnterior: 100,
        detalhe: `Visitantes que iniciaram '${microfluxoSelecionado.titulo}'`,
        cor: "#0284C7",
      },
      {
        id: "conclusoes",
        nome: "2. Propostas Concluídas (CVR)",
        volume: conclusoes,
        percentualSobreTopo: taxaConclusao,
        percentualSobreEtapaAnterior: taxaConclusao,
        detalhe: `${taxaConclusao}% dos que iniciaram chegaram até a conclusão`,
        cor: "#10B981",
      },
    ];
  }, [
    experienciaIdSelecionada,
    microfluxoSelecionado,
    definicaoExperienciaSelecionada,
    resumoMetricas.metricasCRO?.etapasFunil,
  ]);

  // Identifica a maior perda absoluta entre etapas consecutivas para destacar o maior gargalo
  const maiorPerda = useMemo(() => {
    let max = 0;
    for (let i = 0; i < etapas.length - 1; i++) {
      const perda = Math.max((etapas[i]?.volume ?? 0) - (etapas[i + 1]?.volume ?? 0), 0);
      if (perda > max) max = perda;
    }
    return max;
  }, [etapas]);

  // Taxa de conversão relevante para o badge de saúde
  const taxaAvaliada =
    experienciaIdSelecionada === "todas"
      ? (resumoMetricas.metricasCRO?.cvrContato.valorPercentual ?? 0)
      : microfluxoSelecionado && microfluxoSelecionado.aberturas > 0
        ? Math.round((microfluxoSelecionado.conclusoes / microfluxoSelecionado.aberturas) * 1000) / 10
        : 0;

  const saudeFunil =
    taxaAvaliada >= 15
      ? { rotulo: "Conversão de Alto Impacto", cor: "bg-emerald-50 text-emerald-800 border-emerald-200" }
      : taxaAvaliada > 0
        ? { rotulo: "Funil Ativo & Saudável", cor: "bg-sky-50 text-sky-800 border-sky-200" }
        : { rotulo: "Aguardando Interações", cor: "bg-marfim-100 text-mineral-600 border-marfim-300" };

  // Cálculo de Atribuição de Origem do Percurso (Permalink vs Vitrine)
  const infoOrigemPercurso = useMemo(() => {
    if (!microfluxoSelecionado || microfluxoSelecionado.aberturas === 0) return null;
    const total = microfluxoSelecionado.aberturas;
    const permalink = microfluxoSelecionado.aberturasPermalink ?? 0;
    const vitrine = Math.max(0, total - permalink);
    const pctPermalink = Math.round((permalink / total) * 1000) / 10;
    const pctVitrine = Math.round((vitrine / total) * 1000) / 10;
    return { total, permalink, vitrine, pctPermalink, pctVitrine };
  }, [microfluxoSelecionado]);

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Seção com Seletor de Modo (Todas Juntas vs Individual) */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white shadow-2xs">
              <Sparkles className="h-3 w-3" />
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-mineral-500 uppercase">
              Pipeline de Conversão
            </span>
          </div>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-mineral-950">
            Funil de Conversão & Retenção
          </h3>
          <p className="mt-0.5 text-xs text-mineral-600">
            {experienciaIdSelecionada === "todas"
              ? "Jornada completa desde a chegada na vitrine até a conclusão com a equipe."
              : `Retenção e abandonos do percurso: ${microfluxoSelecionado?.titulo}`}
          </p>
        </div>

        {/* Controles de Filtro e Badge de Saúde */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor Dinâmico de Experiência */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
            <Filter className="h-3.5 w-3.5 text-mineral-500" />
            <label htmlFor={idSelect} className="sr-only">
              Filtrar funil por percurso
            </label>
            <select
              id={idSelect}
              value={experienciaIdSelecionada}
              onChange={(e) => setExperienciaIdSelecionada(e.target.value)}
              className="cursor-pointer border-none bg-transparent text-xs font-semibold text-mineral-800 focus:outline-none"
            >
              <option value="todas">Todas as Experiências (Visão Geral)</option>
              {listaOpcoesExperiencias.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.titulo} ({item.aberturas} aberturas)
                </option>
              ))}
            </select>
          </div>

          <div
            className={combinarClasses(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-2xs",
              saudeFunil.cor,
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            <span>{saudeFunil.rotulo}</span>
          </div>
        </div>
      </div>

      {/* Card com os Estágios do Funil CRO */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-white p-5 shadow-xs sm:p-6 space-y-4">
        {/* Luz ambiente de fundo sutil */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-100/60 via-sky-100/30 to-transparent blur-3xl"
        />

        {/* Sub-cabeçalho com indicador de escopo */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-semibold text-mineral-700">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-600" />
            <span>
              {experienciaIdSelecionada === "todas"
                ? "Estágios Globais do Negócio"
                : `Funil Individual: ${microfluxoSelecionado?.titulo}`}
            </span>
          </div>
          <span className="text-[11px] font-normal text-mineral-500">
            {experienciaIdSelecionada === "todas"
              ? "Base: Visitantes Totais"
              : "Base: Aberturas do Percurso"}
          </span>
        </div>

        {/* Estágios Visuais com Conectores de Abandono */}
        <div className="space-y-1">
          {etapas.map((etapa, indice) => {
            const larguraBarra = `${Math.max(etapa.percentualSobreTopo, 3)}%`;
            const proximaEtapa = etapas[indice + 1];
            const perda = proximaEtapa ? Math.max(etapa.volume - proximaEtapa.volume, 0) : 0;
            const ehMaiorGargalo = perda === maiorPerda && maiorPerda > 0;

            return (
              <div key={etapa.id}>
                <div className="group relative rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-all hover:border-slate-200 hover:bg-slate-50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: etapa.cor }}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-bold text-mineral-900">{etapa.nome}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-extrabold tabular-nums text-mineral-950">
                        {etapa.volume.toLocaleString("pt-BR")}
                      </span>
                      <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-mineral-700 shadow-2xs">
                        {etapa.percentualSobreTopo}% do topo
                      </span>
                      {indice > 0 ? (
                        <span className="text-[10px] font-semibold text-mineral-500">
                          ({etapa.percentualSobreEtapaAnterior}% da anterior)
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Barra de Progresso do Estágio */}
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: larguraBarra,
                        backgroundColor: etapa.cor,
                      }}
                    />
                  </div>

                  <p className="mt-1.5 text-[11px] text-mineral-500">{etapa.detalhe}</p>
                </div>

                {/* Conector de Abandono entre este estágio e o próximo */}
                {proximaEtapa ? (
                  <ConectorAbandonoFunil
                    volumeAnterior={etapa.volume}
                    volumeAtual={proximaEtapa.volume}
                    ehMaiorGargalo={ehMaiorGargalo}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Atribuição de Origem do Percurso (Sem poluir os degraus do funil!) */}
        {infoOrigemPercurso ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-mineral-800">
              <Link2 className="h-3.5 w-3.5 text-indigo-600" />
              <span>Atribuição de Origem das {infoOrigemPercurso.total} Aberturas</span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-2.5 border border-slate-100 shadow-2xs">
                <span className="text-[11px] text-mineral-500 block">Via Link Direto (Permalink / Campanhas):</span>
                <span className="font-bold text-indigo-950 text-sm">
                  {infoOrigemPercurso.permalink} acessos ({infoOrigemPercurso.pctPermalink}%)
                </span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-100 shadow-2xs">
                <span className="text-[11px] text-mineral-500 block">Via Vitrine da Loja (Navegação):</span>
                <span className="font-bold text-sky-950 text-sm">
                  {infoOrigemPercurso.vitrine} acessos ({infoOrigemPercurso.pctVitrine}%)
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
