"use client";

import { useId, useMemo, useState } from "react";
import { Filter, Layers, QrCode } from "lucide-react";
import type { MetricaQrCode } from "@/dominio/analytics/tiposMetricasAgregadas";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesFunilDesempenhoQrCodes {
  readonly qrCodes: readonly MetricaQrCode[];
}

function formatarRotuloQrCode(codigo: string): string {
  if (codigo === "vitrine") return "Vitrine Principal (Home)";
  if (codigo.startsWith("fluxo_")) return `Fluxo: ${codigo.replace("fluxo_", "")}`;
  if (codigo.startsWith("profissional_")) {
    return `Profissional: ${codigo.replace("profissional_", "")}`;
  }
  return codigo;
}

export function FunilDesempenhoQrCodes({ qrCodes }: PropriedadesFunilDesempenhoQrCodes) {
  const [destinoSelecionado, setDestinoSelecionado] = useState<string>("todos");
  const idSelect = useId();

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
      const conv = itemAtivo.conclusoesFluxo + itemAtivo.contatosWhatsapp;
      const taxa =
        itemAtivo.visualizacoes > 0
          ? Math.round((conv / itemAtivo.visualizacoes) * 1000) / 10
          : 0;
      return {
        visitas: itemAtivo.visualizacoes,
        fluxos: itemAtivo.aberturasFluxo,
        conclusoes: itemAtivo.conclusoesFluxo,
        whatsapp: itemAtivo.contatosWhatsapp,
        conversoes: conv,
        taxa,
        rotulo: formatarRotuloQrCode(itemAtivo.codigo),
        ehFluxoDireto: itemAtivo.codigo.startsWith("fluxo_"),
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
          percentualSobreTopo: 100,
          percentualSobreEtapaAnterior: 100,
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
        percentualSobreTopo: 100,
        percentualSobreEtapaAnterior: 100,
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
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-600 text-white shadow-2xs">
              <QrCode className="h-3 w-3" aria-hidden="true" />
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-mineral-500 uppercase">
              Materiais Impressos & Balcão
            </span>
          </div>
          <h2
            id="titulo-funil-qrcodes"
            className="mt-1 text-2xl font-bold tracking-tight text-mineral-950"
          >
            Desempenho por QR Code
          </h2>
          <p className="mt-0.5 text-xs text-mineral-600">
            Funil físico de conversão: da leitura no balcão até a geração de contato.
          </p>
        </div>

        {/* Filtro por Destino do QR Code */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
            <Filter className="h-3.5 w-3.5 text-mineral-500" />
            <label htmlFor={idSelect} className="sr-only">
              Filtrar destino do QR Code
            </label>
            <select
              id={idSelect}
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
      </div>

      <div className="rounded-2xl border border-amber-200/80 bg-white p-5 shadow-xs sm:p-6 space-y-5">
        {/* Sub-cabeçalho com Destino Ativo e Taxa */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-xs font-semibold text-mineral-700">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-600" />
            <span>{contexto.rotulo}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 shadow-2xs">
            Taxa de Conversão: {contexto.taxa}%
          </span>
        </div>

        {/* Estágios do Funil de QR Code */}
        <div className="space-y-3">
          {etapas.map((etapa, indice) => {
            const larguraBarra = `${Math.max(etapa.percentualSobreTopo, 3)}%`;

            return (
              <div
                key={etapa.id}
                className="group relative rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-all hover:border-slate-200 hover:bg-slate-50"
              >
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
            );
          })}
        </div>

        {/* Tabela de Destinos de QR Code */}
        {qrCodes.length > 0 ? (
          <div className="pt-2">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-amber-100 bg-amber-50/50 text-[11px] font-bold text-mineral-600 uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Destino do QR Code
                    </th>
                    <th scope="col" className="px-3 py-3 text-right">
                      Leituras Físicas
                    </th>
                    <th scope="col" className="px-3 py-3 text-right">
                      Fluxos Iniciados
                    </th>
                    <th scope="col" className="px-3 py-3 text-right">
                      Conclusões + WhatsApp
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Taxa de Conversão
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {qrCodes.map((qr) => {
                    const conversoes = qr.conclusoesFluxo + qr.contatosWhatsapp;
                    const taxa =
                      qr.visualizacoes > 0
                        ? `${Math.round((conversoes / qr.visualizacoes) * 1000) / 10}%`
                        : "—";
                    const selecionado = destinoSelecionado === qr.codigo;

                    return (
                      <tr
                        key={qr.codigo}
                        onClick={() =>
                          setDestinoSelecionado(selecionado ? "todos" : qr.codigo)
                        }
                        className={combinarClasses(
                          "cursor-pointer transition-colors",
                          selecionado
                            ? "bg-amber-50 font-medium"
                            : "hover:bg-slate-50 text-mineral-800",
                        )}
                      >
                        <td className="px-4 py-3 font-medium text-mineral-950">
                          {formatarRotuloQrCode(qr.codigo)}
                          {selecionado ? (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                              Filtrado
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">{qr.visualizacoes}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{qr.aberturasFluxo}</td>
                        <td className="px-3 py-3 text-right tabular-nums font-bold text-emerald-800">
                          {conversoes}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-bold text-amber-900">
                          {taxa}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="py-4 text-center text-xs text-mineral-500">
            Nenhum acesso via QR Code rastreado neste período ainda.
          </p>
        )}
      </div>
    </section>
  );
}

