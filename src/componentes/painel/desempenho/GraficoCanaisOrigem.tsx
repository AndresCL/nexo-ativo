"use client";

import {
  Copy,
  Link2,
  Globe,
  Info,
  Instagram,
  MessageCircle,
  QrCode,
  Search,
  Share2,
} from "lucide-react";
import { copiarTextoComAviso } from "@/componentes/interface/notificacoes/copiarTextoComAviso";
import type {
  CanalOrigemTrafego,
  MetricaCanalOrigem,
  MetricaQrCode,
} from "@/dominio/analytics/tiposMetricasAgregadas";
import { CORES_METRICAS_DESEMPENHO } from "./coresMetricasDesempenho";

export interface PropriedadesGraficoCanaisOrigem {
  readonly canais: readonly MetricaCanalOrigem[];
  readonly qrCodes?: readonly MetricaQrCode[];
  readonly identificadorOrganizacao?: string;
}

interface ConfiguracaoCanalVisual {
  readonly icone: typeof Instagram;
  readonly fundoAcento: string;
  readonly corAcento: string;
  readonly fundoIcone?: string;
  readonly corIcone?: string;
  readonly parametroUrl: string;
}

const CONFIG_CANAIS: Readonly<Record<CanalOrigemTrafego, ConfiguracaoCanalVisual>> = {
  instagram: {
    icone: Instagram,
    fundoAcento: "#FCE7F3",
    corAcento: "#BE185D",
    parametroUrl: "?origem=instagram",
  },
  cartao_equipe: {
    icone: QrCode,
    fundoAcento: "#E0E7FF",
    corAcento: CORES_METRICAS_DESEMPENHO.visualizacoes.principal,
    parametroUrl: "?origem=cartao_equipe",
  },
  qrcode: {
    icone: QrCode,
    fundoAcento: "#FEF3C7",
    corAcento: "#B45309",
    parametroUrl: "?utm_source=qrcode",
  },
  whatsapp: {
    icone: MessageCircle,
    fundoAcento: "#EDE9FE",
    corAcento: CORES_METRICAS_DESEMPENHO.whatsapp.principal,
    fundoIcone: "#DCFCE7",
    corIcone: "#15803D",
    parametroUrl: "?origem=whatsapp",
  },
  google: {
    icone: Search,
    fundoAcento: "#E0F2FE",
    corAcento: "#0369A1",
    parametroUrl: "?origem=google",
  },
  permalink: {
    icone: Link2,
    fundoAcento: "#e0f2fe",
    corAcento: "#0284c7",
    parametroUrl: "",
  },
  direto: {
    icone: Globe,
    fundoAcento: "#E2E8F0",
    corAcento: "#475569",
    parametroUrl: "",
  },
};

export function GraficoCanaisOrigem({
  canais,
  qrCodes = [],
  identificadorOrganizacao,
}: PropriedadesGraficoCanaisOrigem) {
  const totalVisitas = canais.reduce((acc, c) => acc + c.visualizacoes, 0);
  const totalContatosWhatsApp = canais.reduce((acc, c) => acc + c.contatosWhatsapp, 0);

  function copiarParametro(parametro: string) {
    if (typeof window === "undefined" || !parametro) return;
    const baseSlug = identificadorOrganizacao ? `/${identificadorOrganizacao}` : "";
    const urlCompleta = `${window.location.origin}${baseSlug}${parametro}`;
    void copiarTextoComAviso(urlCompleta, "Link rastreado copiado.");
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Seção (Fora do Card) */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white shadow-2xs">
              <Share2 className="h-3 w-3" aria-hidden="true" />
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-mineral-500 uppercase">
              Atribuição & Origem
            </span>
          </div>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-mineral-950">
            Canais de Origem
          </h3>
          <p className="mt-0.5 text-xs text-mineral-600">
            Acompanhe as visitas, os fluxos iniciados e os cliques no WhatsApp por canal.
          </p>
        </div>

        {/* Resumo dos cliques atribuídos aos canais */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-mineral-700">
          <MessageCircle className="h-3.5 w-3.5 text-green-700" aria-hidden="true" />
          <span className="text-xs font-semibold tabular-nums text-mineral-950">
            {totalContatosWhatsApp}
          </span>
          <span className="text-[11px] font-medium">
            {totalContatosWhatsApp === 1 ? "clique no WhatsApp" : "cliques no WhatsApp"}
          </span>
        </div>
      </div>

      {/* Card com Distribuição e Lista de Canais */}
      <div className="overflow-hidden rounded-2xl border border-marfim-300 bg-white p-4 shadow-xs sm:p-6">
        {/* Barra de Distribuição Segmentada Visual (Traffic Share Bar) */}
        <div className="relative space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-mineral-700">
            <span className="font-semibold text-mineral-900">Distribuição do Tráfego</span>
            <span className="text-xs font-semibold tabular-nums text-mineral-700">
              {totalVisitas} acessos totais
            </span>
          </div>

          <div className="flex h-2 w-full overflow-hidden rounded-full bg-marfim-100">
            {totalVisitas > 0 ? (
              canais.map((canal) => {
                const config = CONFIG_CANAIS[canal.canal] ?? CONFIG_CANAIS.direto;
                const pct = (canal.visualizacoes / totalVisitas) * 100;
                if (pct <= 0) return null;
                return (
                  <div
                    key={canal.canal}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: config.corAcento,
                    }}
                    title={`${canal.rotulo}: ${pct.toFixed(1)}%`}
                    className="h-full transition-all duration-500 motion-reduce:transition-none first:rounded-l-full last:rounded-r-full"
                  />
                );
              })
            ) : (
              <div className="h-full w-full bg-marfim-100" />
            )}
          </div>
        </div>

        {/* A participação acompanha a cor do segmento de cada canal */}
        <div className="mt-4 divide-y divide-marfim-200/80 rounded-xl border border-marfim-200 bg-white">
          {canais.map((canal) => {
            const config = CONFIG_CANAIS[canal.canal] ?? CONFIG_CANAIS.direto;
            const Icone = config.icone;
            const pctVisitas =
              totalVisitas > 0 ? Math.round((canal.visualizacoes / totalVisitas) * 100) : 0;

            return (
              <div
                key={canal.canal}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3.5 py-3 transition-colors hover:bg-marfim-50/60"
              >
                {/* Ícone + Nome do Canal */}
                <div className="flex min-w-0 flex-1 basis-44 items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: config.fundoIcone ?? config.fundoAcento,
                      color: config.corIcone ?? config.corAcento,
                    }}
                  >
                    <Icone className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs leading-snug font-semibold text-mineral-950">
                      {canal.rotulo}
                    </span>
                    <span className="mt-0.5 block text-[11px] tabular-nums text-mineral-500">
                      {canal.visualizacoes} visitas · {canal.aberturasFluxo} fluxos
                    </span>
                  </div>
                </div>

                {/* Métricas e Botão de Cópia */}
                <div className="ml-auto flex shrink-0 items-center gap-2.5">
                  {/* Cliques no botão de contato via WhatsApp */}
                  <div
                    className="text-right"
                    aria-label={`${canal.contatosWhatsapp} cliques no WhatsApp via ${canal.rotulo}`}
                  >
                    <span className="text-sm font-semibold tabular-nums text-mineral-950">
                      {canal.contatosWhatsapp}
                    </span>
                    <span className="ml-1 text-[10px] font-medium text-mineral-700">WhatsApp</span>
                  </div>

                  {/* % do Tráfego */}
                  <span
                    className="min-w-[42px] rounded-md px-1.5 py-0.5 text-center text-[10px] font-semibold tabular-nums"
                    style={{ backgroundColor: config.fundoAcento, color: config.corAcento }}
                    aria-label={`${pctVisitas}% das visitas via ${canal.rotulo}`}
                  >
                    {pctVisitas}%
                  </span>

                  {/* Botão de Cópia Discreto */}
                  {config.parametroUrl ? (
                    <button
                      type="button"
                      onClick={() => copiarParametro(config.parametroUrl)}
                      aria-label={`Copiar link rastreado para ${canal.rotulo}`}
                      title={`Copiar link rastreado para ${canal.rotulo}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-marfim-300 bg-white text-mineral-500 transition-all hover:border-marfim-400 hover:text-mineral-900"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : (
                    <div className="h-7 w-7" aria-hidden="true" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-mineral-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <p>
            <span className="font-semibold text-mineral-700">WhatsApp</span> indica cliques no botão
            de contato por canal. O percentual representa a participação no total de visitas.
            Permalink reúne entradas pelos links diretos das experiências.
          </p>
        </div>
      </div>
    </div>
  );
}
