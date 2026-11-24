"use client";

import { useMemo, useState } from "react";
import { Filter, Layers } from "lucide-react";
import type { MetricaQrCode } from "@/dominio/analytics/tiposMetricasAgregadas";
import {
  calcularResumoQrCode,
  formatarRotuloQrCode,
} from "@/dominio/analytics/resumoQrCodeEOrigem";
import { TooltipInformativo } from "@/componentes/interface/TooltipInformativo";
import { ItemMetricaLinhaResponsiva } from "@/componentes/painel/desempenho/compartilhado/ItemMetricaLinhaResponsiva";
import { TabelaDestinosQrCode } from "./TabelaDestinosQrCode";

export interface PropriedadesFunilDesempenhoQrCodes {
  readonly qrCodes: readonly MetricaQrCode[];
}

export function FunilDesempenhoQrCodes({ qrCodes }: PropriedadesFunilDesempenhoQrCodes) {
  const [destinoSelecionado, setDestinoSelecionado] = useState<string>("todos");

  // Consolidação geral de todos os QR Codes
  const totalVisitas = qrCodes.reduce((acc, q) => acc + q.visualizacoes, 0);
  const totalFluxos = qrCodes.reduce((acc, q) => acc + q.aberturasFluxo, 0);
  const totalConclusoes = qrCodes.reduce((acc, q) => acc + q.conclusoesFluxo, 0);
  const totalWhatsapp = qrCodes.reduce((acc, q) => acc + q.contatosWhatsapp, 0);
  const totalConversoes = totalConclusoes + totalWhatsapp;

  // Filtra QR Code específico ou mantém todos
  const itemAtivo = useMemo(() => {
    if (destinoSelecionado === "todos") return null;
    return qrCodes.find((q) => q.codigo === destinoSelecionado) ?? null;
  }, [destinoSelecionado, qrCodes]);

  // Números do contexto atual (geral ou filtrado por destino)
  const contexto = useMemo(() => {
    if (itemAtivo) {
      const resumo = calcularResumoQrCode(itemAtivo);
      return {
        visitas: resumo.visitas,
        fluxos: resumo.fluxos,
        conclusoes: resumo.conclusoes,
        whatsapp: resumo.whatsapp,
        conversoes: resumo.conversoes,
        taxa: resumo.taxaConversao,
        rotulo: resumo.rotulo,
        ehFluxoDireto: resumo.ehFluxoDireto,
      };
    }

    const taxaGeral =
      totalVisitas > 0 ? Math.round((totalConversoes / totalVisitas) * 1000) / 10 : 0;

    return {
      visitas: totalVisitas,
      fluxos: totalFluxos,
      conclusoes: totalConclusoes,
      whatsapp: totalWhatsapp,
      conversoes: totalConversoes,
      taxa: taxaGeral,
      rotulo: "Todos os QR Codes (Balcão & Impressos)",
      ehFluxoDireto: false,
    };
  }, [itemAtivo, totalVisitas, totalFluxos, totalConclusoes, totalWhatsapp, totalConversoes]);

  // Estágios do Funil Dedicado de QR Code com denominação e porcentagens rigorosas
  const etapas = useMemo(() => {
    const topo = Math.max(contexto.visitas, 0);

    function calcPct(valor: number, base: number) {
      if (base <= 0 || valor <= 0) return 0;
      return Math.round((valor / base) * 1000) / 10;
    }

    // Se for destino que leva direto para um fluxo específico
    if (contexto.ehFluxoDireto) {
      return [
        {
          id: "leituras",
          nome: "1. Leituras Físicas do QR Code",
          volume: topo,
          percentualSobreTopo: topo > 0 ? 100 : 0,
          percentualSobreEtapaAnterior: topo > 0 ? 100 : 0,
          detalhe: "Usuários que escanearam e abriram a experiência no local",
          cor: "#D97706", // Amber 600
        },
        {
          id: "conclusoes",
          nome: "2. Propostas Concluídas no Fluxo",
          volume: contexto.conclusoes,
          percentualSobreTopo: calcPct(contexto.conclusoes, topo),
          percentualSobreEtapaAnterior: calcPct(contexto.conclusoes, topo),
          detalhe: "Formulários preenchidos e enviados até a etapa final",
          cor: "#10B981", // Emerald 500
        },
        {
          id: "whatsapp",
          nome: "3. Contatos Gerados via WhatsApp",
          volume: contexto.whatsapp,
          percentualSobreTopo: calcPct(contexto.whatsapp, topo),
          percentualSobreEtapaAnterior: calcPct(contexto.whatsapp, topo),
          detalhe: "Conversas diretas iniciadas no balcão / material impresso",
          cor: "#7C3AED", // Violet 600
        },
      ];
    }

    // Se for Vitrine Geral ou Visão Consolidada
    return [
      {
        id: "leituras",
        nome: "1. Leituras Físicas do QR Code",
        volume: topo,
        percentualSobreTopo: topo > 0 ? 100 : 0,
        percentualSobreEtapaAnterior: topo > 0 ? 100 : 0,
        detalhe: "Acessos originados de materiais impressos, placas ou balcão",
        cor: "#D97706", // Amber 600
      },
      {
        id: "fluxos",
        nome: "2. Engajamento em Microfluxos",
        volume: contexto.fluxos,
        percentualSobreTopo: calcPct(contexto.fluxos, topo),
        percentualSobreEtapaAnterior: calcPct(contexto.fluxos, topo),
        detalhe: `${calcPct(contexto.fluxos, topo)}% das leituras iniciaram um percurso`,
        cor: "#0284C7", // Sky 600
      },
      {
        id: "conversoes",
        nome: "3. Conversões Comerciais",
        volume: contexto.conversoes,
        percentualSobreTopo: calcPct(contexto.conversoes, topo),
        percentualSobreEtapaAnterior: calcPct(contexto.conversoes, contexto.fluxos || topo),
        detalhe: `${contexto.conclusoes} propostas concluídas + ${contexto.whatsapp} contatos no WhatsApp`,
        cor: "#10B981", // Emerald 500
      },
    ];
  }, [contexto]);

  return (
    <section aria-labelledby="titulo-funil-qrcodes" className="space-y-4">
      {/* Cabeçalho com Filtro de Destino */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="titulo-funil-qrcodes"
            className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl"
          >
            Desempenho por QR Code
          </h2>
          <p className="mt-1 text-xs text-mineral-500">
            Funil físico de conversão: da leitura no balcão até a geração de contato.
          </p>
        </div>

        {/* Filtro por Destino do QR Code */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-2xs">
          <Filter className="h-3.5 w-3.5 text-mineral-500" />
          <label htmlFor="filtro-destino-qrcode" className="sr-only">
            Filtrar destino do QR Code
          </label>
          <select
            id="filtro-destino-qrcode"
            value={destinoSelecionado}
            onChange={(e) => setDestinoSelecionado(e.target.value)}
            className="cursor-pointer border-none bg-transparent text-xs font-semibold text-mineral-800 focus:outline-none"
          >
            <option value="todos">Todos os Destinos ({qrCodes.length})</option>
            {qrCodes.map((qr) => (
              <option key={qr.codigo} value={qr.codigo}>
                {formatarRotuloQrCode(qr.codigo)} ({qr.visualizacoes} visitas)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:p-6 space-y-4">
        {/* Sub-cabeçalho com Destino Ativo e Taxa */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-mineral-700" />
            <span className="font-semibold text-mineral-900">{contexto.rotulo}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs shadow-2xs">
            <span className="text-[11px] font-medium text-mineral-500">Taxa de Conversão:</span>
            <span className="font-bold tabular-nums text-mineral-950">{contexto.taxa}%</span>
          </div>
        </div>

        {/* Estágios do Funil de QR Code Responsivos */}
        <div className="divide-y divide-slate-100">
          {etapas.map((etapa, indice) => (
            <ItemMetricaLinhaResponsiva
              key={etapa.id}
              corIndicador={etapa.cor}
              percentualBarra={etapa.percentualSobreTopo}
              titulo={
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <span>{etapa.nome}</span>
                  {etapa.detalhe ? (
                    <TooltipInformativo
                      texto={etapa.detalhe}
                      tamanhoIcone={12}
                      alinhamento="centro"
                    />
                  ) : null}
                </span>
              }
              metricas={[
                {
                  rotulo: "Volume",
                  valor: etapa.volume.toLocaleString("pt-BR"),
                  destaque: "forte",
                },
                {
                  rotulo: "% Topo",
                  valor: `${etapa.percentualSobreTopo}%`,
                  destaque: "medio",
                },
                {
                  rotulo: "vs. Anterior",
                  valor: indice > 0 ? `${etapa.percentualSobreEtapaAnterior}%` : "—",
                  destaque: "suave",
                },
              ]}
            />
          ))}
        </div>

        {/* Lista Responsiva de Destinos de QR Code */}
        <TabelaDestinosQrCode
          qrCodes={qrCodes}
          destinoSelecionado={destinoSelecionado}
          aoSelecionarDestino={setDestinoSelecionado}
        />
      </div>
    </section>
  );
}

