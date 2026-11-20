"use client";

import {
  Copy,
  Globe,
  Info,
  Instagram,
  Link2,
  MessageCircle,
  QrCode,
  Search,
  Users,
} from "lucide-react";
import { copiarTextoComAviso } from "@/componentes/interface/notificacoes/copiarTextoComAviso";
import type {
  CanalOrigemTrafego,
  MetricaCanalOrigem,
  MetricaQrCode,
} from "@/dominio/analytics/tiposMetricasAgregadas";

export interface PropriedadesGraficoCanaisOrigem {
  readonly canais: readonly MetricaCanalOrigem[];
  readonly qrCodes?: readonly MetricaQrCode[];
  readonly identificadorOrganizacao?: string;
}

interface ConfiguracaoCanalVisual {
  readonly icone: typeof Instagram;
  readonly corBarra: string;
  readonly parametroUrl: string;
}

const CONFIG_CANAIS: Readonly<Record<CanalOrigemTrafego, ConfiguracaoCanalVisual>> = {
  instagram: {
    icone: Instagram,
    corBarra: "#E1306C",
    parametroUrl: "?origem=instagram",
  },
  cartao_equipe: {
    icone: Users,
    corBarra: "#6366F1",
    parametroUrl: "?origem=cartao_equipe",
  },
  qrcode: {
    icone: QrCode,
    corBarra: "#F59E0B",
    parametroUrl: "?utm_source=qrcode",
  },
  whatsapp: {
    icone: MessageCircle,
    corBarra: "#10B981",
    parametroUrl: "?origem=whatsapp",
  },
  google: {
    icone: Search,
    corBarra: "#0EA5E9",
    parametroUrl: "?origem=google",
  },
  permalink: {
    icone: Link2,
    corBarra: "#8B5CF6",
    parametroUrl: "",
  },
  direto: {
    icone: Globe,
    corBarra: "#64748B",
    parametroUrl: "",
  },
};

export function GraficoCanaisOrigem({
  canais,
  qrCodes: _qrCodes = [],
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
      {/* Cabeçalho Flat da Seção */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
            Canais de Origem
          </h3>
          <p className="mt-1 text-xs text-mineral-500">
            Acompanhe as visitas, os fluxos iniciados e os cliques no WhatsApp por canal.
          </p>
        </div>

        {/* Resumo Flat de Contatos WhatsApp Atribuídos */}
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-mineral-800 shadow-2xs">
          <MessageCircle className="h-3.5 w-3.5 text-mineral-800" aria-hidden="true" />
          <span className="font-bold tabular-nums text-mineral-950">
            {totalContatosWhatsApp}
          </span>
          <span className="text-[11px] font-medium text-mineral-500">
            {totalContatosWhatsApp === 1 ? "clique no WhatsApp" : "cliques no WhatsApp"}
          </span>
        </div>
      </div>

      {/* Card Branco Flat com Distribuição e Grid de Canais */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:p-6 space-y-4">
        {/* Barra de Distribuição Segmentada Tonal */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
            <span className="font-semibold text-mineral-900">Distribuição do Tráfego</span>
            <span className="font-medium tabular-nums text-mineral-500">
              {totalVisitas.toLocaleString("pt-BR")} acessos totais
            </span>
          </div>

          <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
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
                      backgroundColor: config.corBarra,
                    }}
                    title={`${canal.rotulo}: ${pct.toFixed(1)}%`}
                    className="h-full transition-all duration-500 motion-reduce:transition-none first:rounded-l-full last:rounded-r-full"
                  />
                );
              })
            ) : (
              <div className="h-full w-full bg-slate-100" />
            )}
          </div>
        </div>

        {/* Tabela Flat de Canais com Alinhamento Tabular */}
        <div className="pt-2">
          {/* Subcabeçalho da Tabela */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-2.5 text-[11px] font-medium text-mineral-400">
            <span className="min-w-0 flex-1">Canal de Origem</span>
            <div className="flex items-center gap-2 sm:gap-4 text-right shrink-0">
              <span className="w-12 sm:w-16 text-right">Visitas</span>
              <span className="w-10 sm:w-14 text-right">Fluxos</span>
              <span className="w-12 sm:w-16 text-right">WhatsApp</span>
              <span className="w-10 sm:w-14 text-right">% Share</span>
              <span className="w-7 text-center">Link</span>
            </div>
          </div>

          {/* Linhas da Tabela */}
          <div className="space-y-0.5 divide-y divide-slate-50 pt-1">
            {canais.map((canal) => {
              const config = CONFIG_CANAIS[canal.canal] ?? CONFIG_CANAIS.direto;
              const Icone = config.icone;
              const pctVisitas =
                totalVisitas > 0 ? Math.round((canal.visualizacoes / totalVisitas) * 100) : 0;

              return (
                <div
                  key={canal.canal}
                  className="flex items-center justify-between gap-2 sm:gap-4 rounded-xl px-2.5 py-2 transition-colors hover:bg-slate-50/70"
                >
                  {/* Indicador de Cor + Ícone + Nome do Canal */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className="h-4 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: config.corBarra }}
                      aria-hidden="true"
                    />
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200/60 bg-slate-100 text-mineral-700">
                      <Icone className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="truncate text-xs font-semibold text-mineral-950">
                      {canal.rotulo}
                    </span>
                  </div>

                  {/* Colunas Tabulares */}
                  <div className="flex items-center gap-2 sm:gap-4 text-right shrink-0">
                    <span className="w-12 sm:w-16 text-right text-xs font-bold tabular-nums text-mineral-950">
                      {canal.visualizacoes.toLocaleString("pt-BR")}
                    </span>
                    <span className="w-10 sm:w-14 text-right text-xs font-medium tabular-nums text-mineral-600">
                      {canal.aberturasFluxo.toLocaleString("pt-BR")}
                    </span>
                    <span className="w-12 sm:w-16 text-right text-xs font-medium tabular-nums text-mineral-600">
                      {canal.contatosWhatsapp.toLocaleString("pt-BR")}
                    </span>
                    <span className="w-10 sm:w-14 text-right text-xs font-semibold tabular-nums text-mineral-800">
                      {pctVisitas}%
                    </span>

                    {/* Botão de Cópia Discreto */}
                    <div className="w-7 flex items-center justify-center">
                      {config.parametroUrl ? (
                        <button
                          type="button"
                          onClick={() => copiarParametro(config.parametroUrl)}
                          aria-label={`Copiar link rastreado para ${canal.rotulo}`}
                          title={`Copiar link rastreado para ${canal.rotulo}`}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-mineral-400 transition-colors hover:border-slate-300 hover:text-mineral-950 cursor-pointer shadow-2xs"
                        >
                          <Copy className="h-3 w-3" aria-hidden="true" />
                        </button>
                      ) : (
                        <span className="h-6 w-6 block" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nota Informativa Flat */}
        <div className="flex items-start gap-2 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-mineral-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mineral-400" aria-hidden="true" />
          <p>
            <span className="font-semibold text-mineral-700">WhatsApp</span> indica cliques no botão
            de contato por canal. O percentual representa a participação no total de visitas.
          </p>
        </div>
      </div>
    </div>
  );
}
