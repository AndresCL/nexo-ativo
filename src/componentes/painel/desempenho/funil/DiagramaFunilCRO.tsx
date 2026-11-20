"use client";

import { useMemo, useState } from "react";
import { Filter, GitFork, Layers, Link2 } from "lucide-react";
import type {
  MetricaGranularMicrofluxo,
  ResumoMetricasPeriodo,
} from "@/dominio/analytics/tiposMetricasAgregadas";
import type { ItemExperienciaPainel } from "@/infraestrutura/painel/leitorDesempenhoOrganizacaoServidor";
import { ConectorAbandonoFunil } from "./ConectorAbandonoFunil";
import { TooltipInformativo } from "@/componentes/interface/TooltipInformativo";
import { analisarTopologiaFunil } from "@/dominio/microfluxos/analisadorTopologiaFunil";
import {
  calcularEstagiosFunilRamificado,
  type EstagioFunilCalculado,
} from "@/dominio/analytics/calculadorFunilRamificado";

export interface PropriedadesDiagramaFunilCRO {
  readonly resumoMetricas: ResumoMetricasPeriodo;
  readonly experiencias?: readonly ItemExperienciaPainel[];
}

export function DiagramaFunilCRO({
  resumoMetricas,
  experiencias = [],
}: PropriedadesDiagramaFunilCRO) {
  const [experienciaIdSelecionada, setExperienciaIdSelecionada] = useState<string>("todas");

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

  // Topologia do grafo da experiência selecionada (Padrão 1 Seguro)
  const topologia = useMemo(() => {
    if (
      !definicaoExperienciaSelecionada?.etapas ||
      definicaoExperienciaSelecionada.etapas.length === 0
    ) {
      return { nos: [], temRamificacoes: false };
    }
    return analisarTopologiaFunil(
      definicaoExperienciaSelecionada.etapas,
      definicaoExperienciaSelecionada.etapaInicialId,
    );
  }, [definicaoExperienciaSelecionada]);

  // Estágios individuais do percurso selecionado com cálculo ramificado blindado
  const estagiosIndividuais = useMemo<readonly EstagioFunilCalculado[]>(() => {
    if (experienciaIdSelecionada === "todas" || !microfluxoSelecionado) {
      return [];
    }

    const etapasCadastradas = definicaoExperienciaSelecionada?.etapas ?? [];
    if (etapasCadastradas.length === 0) {
      const topo = microfluxoSelecionado.aberturas;
      const conclusoes = microfluxoSelecionado.conclusoes;
      const taxaConclusao = topo > 0 ? Math.round((conclusoes / topo) * 1000) / 10 : 0;
      return [
        {
          tipo: "linear",
          id: "aberturas",
          nome: "1. Aberturas do Percurso",
          volume: topo,
          percentualSobreTopo: 100,
          percentualSobreEtapaAnterior: 100,
          detalhe: `Visitantes que iniciaram '${microfluxoSelecionado.titulo}'`,
          cor: "#4F46E5",
        },
        {
          tipo: "linear",
          id: "conclusoes",
          nome: "2. Propostas Concluídas (CVR)",
          volume: conclusoes,
          percentualSobreTopo: taxaConclusao,
          percentualSobreEtapaAnterior: taxaConclusao,
          detalhe: `${taxaConclusao}% dos que iniciaram chegaram até a conclusão`,
          cor: "#10B981",
        },
      ];
    }

    return calcularEstagiosFunilRamificado({
      topologia,
      topo: microfluxoSelecionado.aberturas,
      conclusoes: microfluxoSelecionado.conclusoes,
      metricasEtapas: microfluxoSelecionado.porEtapa ?? {},
      tituloMicrofluxo: microfluxoSelecionado.titulo,
    });
  }, [experienciaIdSelecionada, microfluxoSelecionado, definicaoExperienciaSelecionada, topologia]);

  // Estágios exibidos: Globais do negócio ou Individuais da experiência com Padrão 1 Seguro
  const estagios = useMemo<readonly EstagioFunilCalculado[]>(() => {
    if (experienciaIdSelecionada === "todas" || !microfluxoSelecionado) {
      const globais = resumoMetricas.metricasCRO?.etapasFunil ?? [];
      return globais.map((g) => ({
        tipo: "linear" as const,
        id: g.id,
        nome: g.nome,
        volume: g.volume,
        percentualSobreTopo: g.percentualSobreTopo,
        percentualSobreEtapaAnterior: g.percentualSobreEtapaAnterior,
        detalhe: g.detalhe,
        cor: g.cor,
      }));
    }
    return estagiosIndividuais;
  }, [
    experienciaIdSelecionada,
    microfluxoSelecionado,
    resumoMetricas.metricasCRO?.etapasFunil,
    estagiosIndividuais,
  ]);

  // Identifica a maior perda absoluta entre etapas para destacar o maior gargalo real
  const maiorPerda = useMemo(() => {
    let max = 0;
    for (let i = 0; i < estagios.length - 1; i++) {
      const etapa = estagios[i]!;
      const proxima = estagios[i + 1]!;
      const perda =
        etapa.tipo === "ramificado"
          ? etapa.desistenciasNaDecisao
          : Math.max(etapa.volume - proxima.volume, 0);
      if (perda > max) max = perda;
    }
    return max;
  }, [estagios]);

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
      {/* Cabeçalho da Seção Flat com Seletor de Percurso */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
            Funil de Conversão & Retenção
          </h3>
          <p className="mt-1 text-xs text-mineral-500">
            {experienciaIdSelecionada === "todas"
              ? "Jornada completa desde a chegada na vitrine até a conclusão com a equipe."
              : `Retenção e rotas do percurso: ${microfluxoSelecionado?.titulo}`}
          </p>
        </div>

        {/* Seletor Dinâmico de Experiência (Flat) */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-2xs">
          <Filter className="h-3.5 w-3.5 text-mineral-500" />
          <label htmlFor="filtro-funil-percurso" className="sr-only">
            Filtrar funil por percurso
          </label>
          <select
            id="filtro-funil-percurso"
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
      </div>

      {/* Card com os Estágios Detalhados do Funil CRO */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:p-6 space-y-3">
        {/* Sub-cabeçalho Tabular Flat Padronizado */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="h-4 w-4 text-mineral-700 shrink-0" />
            <span className="font-semibold text-mineral-900 truncate">
              {experienciaIdSelecionada === "todas"
                ? "Estágios Globais do Negócio"
                : `Funil Individual: ${microfluxoSelecionado?.titulo}`}
            </span>
          </div>

          <div className="flex items-center gap-4 text-right text-[11px] font-medium text-mineral-400 shrink-0">
            <span className="w-14 sm:w-16 text-right">Volume</span>
            <span className="w-14 sm:w-16 text-right">% Topo</span>
            <span className="w-14 sm:w-16 text-right">vs. Anterior</span>
          </div>
        </div>

        {/* Estágios Visuais Alinhados Tabularmente */}
        <div className="space-y-0.5">
          {estagios.map((etapa, indice) => {
            const larguraBarra = `${Math.max(etapa.percentualSobreTopo, 3)}%`;
            const proximaEtapa = estagios[indice + 1];

            if (etapa.tipo === "ramificado") {
              const ehMaiorGargalo = etapa.desistenciasNaDecisao === maiorPerda && maiorPerda > 0;

              return (
                <div key={etapa.id}>
                  <div className="rounded-xl px-3 py-2 transition-colors hover:bg-slate-50/70">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="text-xs font-bold text-mineral-950 truncate">
                          {etapa.nome}
                        </span>
                        {etapa.detalhe ? (
                          <TooltipInformativo
                            texto={etapa.detalhe}
                            tamanhoIcone={12}
                            alinhamento="centro"
                          />
                        ) : null}
                        <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700 shrink-0">
                          Decisão de Rota
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-right shrink-0">
                        <span className="w-14 sm:w-16 text-right font-bold tabular-nums text-xs text-mineral-950">
                          {etapa.volume.toLocaleString("pt-BR")}
                        </span>
                        <span className="w-14 sm:w-16 text-right font-semibold tabular-nums text-xs text-mineral-800">
                          {etapa.percentualSobreTopo}%
                        </span>
                        <span className="w-14 sm:w-16 text-right font-medium tabular-nums text-xs text-mineral-400">
                          {indice > 0 ? `${etapa.percentualSobreEtapaAnterior}%` : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progresso Fina Flat com Cor do Estágio */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: larguraBarra, backgroundColor: etapa.cor || "#4F46E5" }}
                      />
                    </div>

                    {/* Sub-rotas alternativas dentro do nó de decisão */}
                    {etapa.rotas.length > 0 ? (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-mineral-600">
                          <GitFork className="h-3 w-3 text-mineral-500" />
                          <span>Distribuição das Rotas:</span>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {etapa.rotas.map((rota) => {
                            const larguraRota = `${Math.max(rota.percentualSobreDecisao, 2)}%`;
                            return (
                              <div
                                key={rota.opcaoId}
                                className="rounded-lg border border-slate-200/70 bg-slate-50/50 p-2.5 space-y-1"
                              >
                                <div className="flex items-start justify-between gap-1.5">
                                  <span className="text-[11px] font-semibold text-mineral-900 leading-tight">
                                    {rota.rotuloOpcao}
                                  </span>
                                  <span className="text-[11px] font-bold tabular-nums text-mineral-950 shrink-0">
                                    {rota.volume.toLocaleString("pt-BR")}
                                  </span>
                                </div>

                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                  <div
                                    className="h-full rounded-full bg-slate-700 transition-all duration-500"
                                    style={{ width: larguraRota }}
                                  />
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-mineral-500">
                                  <span>{rota.percentualSobreTopo}% do topo</span>
                                  <span className="font-medium text-mineral-600">
                                    ({rota.percentualSobreDecisao}% desta decisão)
                                  </span>
                                </div>

                                {rota.etapasInternas.length > 0 ? (
                                  <div className="pt-1 border-t border-slate-200/60 text-[10px] text-mineral-600">
                                    <span className="text-mineral-400">Passo da rota: </span>
                                    {rota.etapasInternas.map((e) => e.titulo).join(" → ")}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Conector de Abandono da Decisão Compacto */}
                  {proximaEtapa ? (
                    <ConectorAbandonoFunil
                      volumeAnterior={etapa.volume}
                      volumeAtual={etapa.volumeAvancoTotal}
                      ehMaiorGargalo={ehMaiorGargalo}
                    />
                  ) : null}
                </div>
              );
            }

            // Estágio Linear Simples Alinhado Tabularmente
            const perda = proximaEtapa ? Math.max(etapa.volume - proximaEtapa.volume, 0) : 0;
            const ehMaiorGargalo = perda === maiorPerda && maiorPerda > 0;

            return (
              <div key={etapa.id}>
                <div className="rounded-xl px-3 py-2 transition-colors hover:bg-slate-50/70">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-xs font-bold text-mineral-950 truncate">
                        {etapa.nome}
                      </span>
                      {etapa.detalhe ? (
                        <TooltipInformativo
                          texto={etapa.detalhe}
                          tamanhoIcone={12}
                          alinhamento="centro"
                        />
                      ) : null}
                    </div>

                    <div className="flex items-center gap-4 text-right shrink-0">
                      <span className="w-14 sm:w-16 text-right font-bold tabular-nums text-xs text-mineral-950">
                        {etapa.volume.toLocaleString("pt-BR")}
                      </span>
                      <span className="w-14 sm:w-16 text-right font-semibold tabular-nums text-xs text-mineral-800">
                        {etapa.percentualSobreTopo}%
                      </span>
                      <span className="w-14 sm:w-16 text-right font-medium tabular-nums text-xs text-mineral-400">
                        {indice > 0 ? `${etapa.percentualSobreEtapaAnterior}%` : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progresso Fina Flat com Cor do Estágio */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: larguraBarra, backgroundColor: etapa.cor || "#4F46E5" }}
                    />
                  </div>
                </div>

                {/* Conector de Abandono Compacto */}
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

        {/* Atribuição de Origem do Percurso */}
        {infoOrigemPercurso ? (
          <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-mineral-800">
              <Link2 className="h-3.5 w-3.5 text-mineral-700" />
              <span>Atribuição de Origem das {infoOrigemPercurso.total} Aberturas</span>
            </div>
            <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3 border border-slate-200/80">
                <span className="text-[11px] text-mineral-500 block">
                  Via Link Direto (Permalink / Campanhas):
                </span>
                <span className="font-bold text-mineral-950 text-sm tabular-nums">
                  {infoOrigemPercurso.permalink} acessos ({infoOrigemPercurso.pctPermalink}%)
                </span>
              </div>
              <div className="rounded-lg bg-white p-3 border border-slate-200/80">
                <span className="text-[11px] text-mineral-500 block">
                  Via Vitrine da Loja (Navegação):
                </span>
                <span className="font-bold text-mineral-950 text-sm tabular-nums">
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
