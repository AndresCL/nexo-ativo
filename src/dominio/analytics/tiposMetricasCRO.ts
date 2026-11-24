/**
 * Tipos e contratos estritos para análise de conversão (CRO) e funis de marketing digital.
 * Segue a regra: "Antes de calcular uma taxa, defina: porcentagem de quê em relação a quê".
 */

export interface MetricaTaxaExplicada {
  /** Percentual arredondado (ex: 15 para 15% ou 12.5 para 12.5%) */
  readonly valorPercentual: number;
  /** O numerador da operação matemática */
  readonly numerador: number;
  /** O denominador / população elegível */
  readonly denominador: number;
  /** Rótulo legível da fórmula (ex: "150 cliques / 1.000 exposições") */
  readonly rotuloFormula: string;
  /** Explicação concisa da finalidade da métrica */
  readonly explicacao: string;
}

export interface EntradaDadosMetricasCRO {
  /** Total de visitantes ou sessões elegíveis expostas à vitrine/conteúdo */
  readonly visitantesOuSessoes: number;
  /** Total de cliques nas chamadas de ação (WhatsApp, botões de ação e aberturas de fluxo) */
  readonly cliquesAcaoTotais: number;
  /** Sessões únicas que realizaram ao menos um clique de ação (quando telemetria de sessão está ativa) */
  readonly sessoesComCliqueAcao?: number;
  /** Indica se o período usa apenas contagem legada (sem deduplicação de sessão) */
  readonly usandoContagemLegada?: boolean;
  /** Total de contatos comerciais únicos gerados (formulários enviados ou conversas iniciadas) */
  readonly contatosUnicos: number;
  /** Contatos que atenderam aos critérios comerciais (em atendimento, proposta enviada ou concluída) */
  readonly leadsQualificados: number;
  /** Contatos que terminaram comprando (vendas fechadas/concluídas) */
  readonly vendasConcluidas: number;
  /** Total de contatos novos ainda aguardando retorno */
  readonly contatosNovos?: number;
  /** Total de contatos arquivados */
  readonly contatosArquivados?: number;
}

export interface ResumoMetricasCRO {
  /** Dados brutos de contagem que deram origem às métricas */
  readonly entradas: EntradaDadosMetricasCRO;
  /** Métrica 1 — CTR: Tasa de clics (Interação: cliques / exposições) */
  readonly ctr: MetricaTaxaExplicada;
  /** Métrica 2 — CVR a Contato: Tasa de conversión (Captação: contatos / visitantes) */
  readonly cvrContato: MetricaTaxaExplicada;
  /** Métrica 3 — Tasa de Leads Cualificados (Qualidade: qualificados / contatos) */
  readonly taxaLeadsQualificados: MetricaTaxaExplicada;
  /** Métrica 4 — Conversión a Venta (Fechamento: vendas / contatos) */
  readonly conversaoVendaSobreContatos: MetricaTaxaExplicada;
  /** Métrica 4b — Conversión Total de Visitantes a Venta (Visão Global: vendas / visitantes) */
  readonly conversaoVendaSobreVisitantes: MetricaTaxaExplicada;
  /** Estágios do funil visual ordenados */
  readonly etapasFunil: readonly EtapaFunilCRO[];
}

export interface EtapaFunilCRO {
  readonly id: string;
  readonly nome: string;
  readonly volume: number;
  readonly percentualSobreTopo: number;
  readonly percentualSobreEtapaAnterior: number;
  readonly detalhe: string;
  readonly cor: string;
}

