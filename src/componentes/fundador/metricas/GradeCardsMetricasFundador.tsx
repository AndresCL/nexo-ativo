"use client";

import { AlertTriangle, Building2, CheckCircle2, Mail, TrendingUp } from "lucide-react";
import type { MetricasOperacionaisFundador } from "@/dominio/fundador/tiposPainelFundador";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesGradeCardsMetricasFundador {
  readonly metricas: MetricasOperacionaisFundador;
}

export function GradeCardsMetricasFundador({ metricas }: PropriedadesGradeCardsMetricasFundador) {
  const mrrBrutoCentavos = metricas.receitaMensalRecorrenteCentavos;
  const mrrLiquidoCentavos =
    metricas.receitaMensalRecorrenteLiquidaCentavos ?? mrrBrutoCentavos;
  const taxasAsaasCentavos =
    metricas.taxasAsaasMensaisCentavos ?? Math.max(0, mrrBrutoCentavos - mrrLiquidoCentavos);

  const valorMrrLiquidoFormatado =
    ValorMonetarioCentavos.deCentavos(mrrLiquidoCentavos).formatarMoedaBrasileira();
  const apoioMrr =
    taxasAsaasCentavos > 0
      ? `Bruto ${ValorMonetarioCentavos.deCentavos(mrrBrutoCentavos).formatarMoedaBrasileira()} · Taxas Asaas ${ValorMonetarioCentavos.deCentavos(taxasAsaasCentavos).formatarMoedaBrasileira()}`
      : "Valor líquido de assinaturas ativas";

  const cartoes = [
    {
      titulo: "MRR Líquido",
      valor: valorMrrLiquidoFormatado,
      apoio: apoioMrr,
      icone: TrendingUp,
      cor: "border-emerald-200 from-emerald-50/80 text-emerald-950",
      iconeCor: "bg-emerald-600",
    },
    {
      titulo: "Organizações Totais",
      valor: String(metricas.totalOrganizacoes),
      apoio: "Cadastradas no Nexo Ativo",
      icone: Building2,
      cor: "border-indigo-200 from-indigo-50/80 text-indigo-950",
      iconeCor: "bg-indigo-600",
    },
    {
      titulo: "Assinaturas Ativas",
      valor: String(metricas.assinaturasAtivas),
      apoio: "Em situação regular",
      icone: CheckCircle2,
      cor: "border-sky-200 from-sky-50/80 text-sky-950",
      iconeCor: "bg-sky-600",
    },
    {
      titulo: "Inadimplentes / Atrasadas",
      valor: String(metricas.assinaturasInadimplentes),
      apoio: "Exigem acompanhamento",
      icone: AlertTriangle,
      cor: "border-amber-200 from-amber-50/80 text-amber-950",
      iconeCor: "bg-amber-600",
    },
    {
      titulo: "E-mails Enviados (Mês)",
      valor: String(metricas.totalEmailsEnviadosMesAtual ?? 0),
      apoio: `${metricas.emailsSolicitacoesMesAtual ?? 0} leads · ${metricas.emailsAutenticacaoMesAtual ?? 0} auth${metricas.anoMesReferenciaEmail ? ` (${metricas.anoMesReferenciaEmail})` : ""}`,
      icone: Mail,
      cor: "border-violet-200 from-violet-50/80 text-violet-950",
      iconeCor: "bg-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {cartoes.map((item) => (
        <div
          key={item.titulo}
          className={combinarClasses(
            "rounded-2xl border bg-gradient-to-b via-white to-white p-4 shadow-xs sm:p-5",
            item.cor,
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold">{item.titulo}</p>
            <span
              className={combinarClasses(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white",
                item.iconeCor,
              )}
            >
              <item.icone className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 break-words text-lg font-extrabold tracking-tight sm:text-xl">
            {item.valor}
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-mineral-500">{item.apoio}</p>
        </div>
      ))}
    </div>
  );
}

