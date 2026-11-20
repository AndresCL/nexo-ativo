"use client";

import { useId, useMemo } from "react";
import { CheckCircle2, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import type {
  MetricasDiariasOrganizacao,
  ResumoMetricasPeriodo,
} from "@/dominio/analytics/tiposMetricasAgregadas";
import { CardIndicadorCRO, type ItemSparkline } from "./CardIndicadorCRO";

export interface PropriedadesGradeIndicadoresCRO {
  readonly resumoMetricas: ResumoMetricasPeriodo;
  readonly historicoCronologico: readonly MetricasDiariasOrganizacao[];
  readonly diaSelecionado: string | null;
  readonly mesSelecionado: string;
}

export function GradeIndicadoresCRO({
  resumoMetricas,
  historicoCronologico,
  diaSelecionado,
  mesSelecionado,
}: PropriedadesGradeIndicadoresCRO) {
  const idGradienteVisualizacoes = useId();
  const idGradienteCTR = useId();
  const idGradienteCVR = useId();
  const idGradienteFechamento = useId();

  function formatarDataCurta(dataIso: string) {
    if (!dataIso) return "";
    const partes = dataIso.split("-");
    if (partes.length < 3) return dataIso;
    return `${partes[2]}/${partes[1]}`;
  }

  // Sparkline de Audiência
  const dadosVisualizacoesSparkline = useMemo<readonly ItemSparkline[]>(() => {
    if (historicoCronologico.length === 0) {
      return [{ data: "Hoje", valor: resumoMetricas.totalVisualizacoes }];
    }
    return historicoCronologico.map((d) => ({
      data: formatarDataCurta(d.dataIso),
      valor: Number(d.visualizacoesVitrine || 0),
    }));
  }, [historicoCronologico, resumoMetricas.totalVisualizacoes]);

  // Sparkline de Cliques / Ações
  const dadosAcoesSparkline = useMemo<readonly ItemSparkline[]>(() => {
    if (historicoCronologico.length === 0) {
      return [{ data: "Hoje", valor: resumoMetricas.totalAberturasMicrofluxo + resumoMetricas.totalCliquesWhatsapp }];
    }
    return historicoCronologico.map((d) => ({
      data: formatarDataCurta(d.dataIso),
      valor: Number(d.aberturasMicrofluxo || 0) + Number(d.cliquesWhatsapp || 0),
    }));
  }, [historicoCronologico, resumoMetricas.totalAberturasMicrofluxo, resumoMetricas.totalCliquesWhatsapp]);

  // Sparkline de Conclusões
  const dadosConclusoesSparkline = useMemo<readonly ItemSparkline[]>(() => {
    if (historicoCronologico.length === 0) {
      return [{ data: "Hoje", valor: resumoMetricas.totalConclusoesMicrofluxo }];
    }
    return historicoCronologico.map((d) => ({
      data: formatarDataCurta(d.dataIso),
      valor: Number(d.conclusoesMicrofluxo || 0),
    }));
  }, [historicoCronologico, resumoMetricas.totalConclusoesMicrofluxo]);

  const cro = resumoMetricas.metricasCRO;

  const badgeTempo = diaSelecionado
    ? diaSelecionado
    : mesSelecionado === "todos"
      ? `${resumoMetricas.diasConsiderados} ${resumoMetricas.diasConsiderados === 1 ? "dia" : "dias"}`
      : mesSelecionado;

  return (
    <section aria-label="Indicadores principais de conversão CRO" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Audiência (Exposições / Visitas) */}
      <CardIndicadorCRO
        titulo="Audiência & Exposições"
        valorPrincipal={resumoMetricas.totalVisualizacoes.toLocaleString("pt-BR")}
        rotuloFormula={`${resumoMetricas.totalVisualizacoes.toLocaleString("pt-BR")} acessos na vitrine e cartões`}
        explicacao="Volume de pessoas e exposições recebidas na vitrine pública e nos cartões VIP dos consultores."
        badgeContexto={badgeTempo}
        icone={<Eye className="h-4 w-4" aria-hidden="true" />}
        corLinha="#4F46E5"
        gradienteId={idGradienteVisualizacoes}
        dadosSparkline={dadosVisualizacoesSparkline}
        alinhamentoTooltip="esquerda"
      />

      {/* Card 2: Interação / CTR (Taxa de cliques nas ações) */}
      <CardIndicadorCRO
        titulo="Interação · CTR"
        valorPrincipal={`${cro?.ctr.valorPercentual ?? 0}%`}
        rotuloFormula={cro?.ctr.rotuloFormula ?? "0 cliques / 0 exposições"}
        explicacao="Click-Through Rate: Porcentagem de exposições que geraram ação (WhatsApp, abertura de fluxo ou botões da vitrine)."
        badgeContexto="Interesse"
        icone={<MousePointerClick className="h-4 w-4" aria-hidden="true" />}
        corLinha="#0284C7"
        gradienteId={idGradienteCTR}
        dadosSparkline={dadosAcoesSparkline}
        alinhamentoTooltip="centro"
      />

      {/* Card 3: Captação / CVR (Taxa de conversão em oportunidade) */}
      <CardIndicadorCRO
        titulo="Captação · CVR"
        valorPrincipal={`${cro?.cvrContato.valorPercentual ?? 0}%`}
        rotuloFormula={cro?.cvrContato.rotuloFormula ?? "0 contatos / 0 visitantes"}
        explicacao="Conversion Rate a Contato: Porcentagem de visitantes que concluíram a jornada de contato ou formulário comercial."
        badgeContexto="Oportunidade"
        icone={<TrendingUp className="h-4 w-4" aria-hidden="true" />}
        corLinha="#8B5CF6"
        gradienteId={idGradienteCVR}
        dadosSparkline={dadosConclusoesSparkline}
        alinhamentoTooltip="centro"
      />

      {/* Card 4: Fechamento / Conversão a Venda (Win Rate) */}
      <CardIndicadorCRO
        titulo="Fechamento Comercial"
        valorPrincipal={`${cro?.conversaoVendaSobreContatos.valorPercentual ?? 0}%`}
        rotuloFormula={
          cro
            ? `${cro.conversaoVendaSobreContatos.rotuloFormula} (${cro.conversaoVendaSobreVisitantes.valorPercentual}% total)`
            : "0 vendas / 0 contatos"
        }
        explicacao="Conversão a Venda: Porcentagem de contatos e solicitações que terminaram em negócio fechado no CRM."
        badgeContexto={`${cro?.entradas.vendasConcluidas ?? 0} ${cro?.entradas.vendasConcluidas === 1 ? "venda" : "vendas"}`}
        icone={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
        corLinha="#10B981"
        gradienteId={idGradienteFechamento}
        dadosSparkline={dadosConclusoesSparkline}
        alinhamentoTooltip="direita"
      />
    </section>
  );
}
