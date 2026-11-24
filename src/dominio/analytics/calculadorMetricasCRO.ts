import type {
  EntradaDadosMetricasCRO,
  EtapaFunilCRO,
  MetricaTaxaExplicada,
  ResumoMetricasCRO,
} from "./tiposMetricasCRO";

/**
 * Utilitário puro para arredondar percentuais com até 1 casa decimal.
 */
export function arredondarTaxaPercentual(valor: number): number {
  return Math.round(valor * 10) / 10;
}

/**
 * Calcula uma taxa com proteção estrita contra divisão por zero e formatação legível.
 */
export function calcularTaxaExplicada(
  numerador: number,
  denominador: number,
  unidadeNumerador: string,
  unidadeDenominador: string,
  explicacao: string,
): MetricaTaxaExplicada {
  const numSeguro = Math.max(0, Number(numerador || 0));
  const denSeguro = Math.max(0, Number(denominador || 0));

  const valorPercentual =
    denSeguro > 0 ? arredondarTaxaPercentual((numSeguro / denSeguro) * 100) : 0;

  const rotuloFormula = `${numSeguro.toLocaleString("pt-BR")} ${unidadeNumerador} / ${denSeguro.toLocaleString("pt-BR")} ${unidadeDenominador}`;

  return {
    valorPercentual,
    numerador: numSeguro,
    denominador: denSeguro,
    rotuloFormula,
    explicacao,
  };
}

/**
 * Calculador puro de Métricas de CRO (Conversion Rate Optimization).
 * Responde de forma explícita e auditada à pergunta: "Porcentagem de quê em relação a quê?"
 */
export class CalculadorMetricasCRO {
  /**
   * Métrica 1 — CTR: Taxa de cliques de intenção.
   * Responde: "As pessoas clicam na ação que oferecemos?"
   * Fórmula: Cliques em ações / Exposições
   */
  public static calcularCTR(cliques: number, exposicoes: number): MetricaTaxaExplicada {
    return calcularTaxaExplicada(
      cliques,
      exposicoes,
      cliques === 1 ? "clique" : "cliques",
      exposicoes === 1 ? "exposição" : "exposições",
      "Mede interação e interesse gerado pelos botões e chamadas de ação da vitrine.",
    );
  }

  /**
   * Métrica 2 — CVR a Contato: Taxa de conversão em oportunidade.
   * Responde: "Que proporção de visitantes completa a ação de virar contato comercial?"
   * Fórmula: Contatos únicos / Visitantes ou sessões elegíveis
   */
  public static calcularCVRContato(contatos: number, visitantes: number): MetricaTaxaExplicada {
    return calcularTaxaExplicada(
      contatos,
      visitantes,
      contatos === 1 ? "contato" : "contatos",
      visitantes === 1 ? "visitante" : "visitantes",
      "Mede a captação efetiva de pessoas interessadas a partir da audiência da vitrine.",
    );
  }

  /**
   * Métrica 3 — Taxa de Leads Qualificados.
   * Responde: "Quantos contatos têm potencial comercial real?"
   * Fórmula: Leads qualificados / Contatos únicos
   */
  public static calcularTaxaLeadsQualificados(
    qualificados: number,
    contatos: number,
  ): MetricaTaxaExplicada {
    return calcularTaxaExplicada(
      qualificados,
      contatos,
      qualificados === 1 ? "qualificado" : "qualificados",
      contatos === 1 ? "contato" : "contatos",
      "Mede a qualidade dos contatos gerados que possuem perfil e interesse comercial real.",
    );
  }

  /**
   * Métrica 4 — Conversão a Venda (Win Rate Comercial).
   * Responde: "Quantos contatos terminaram comprando?"
   * Fórmula: Vendas concluídas / Contatos únicos
   */
  public static calcularConversaoVendaSobreContatos(
    vendas: number,
    contatos: number,
  ): MetricaTaxaExplicada {
    return calcularTaxaExplicada(
      vendas,
      contatos,
      vendas === 1 ? "venda" : "vendas",
      contatos === 1 ? "contato" : "contatos",
      "Mede a eficiência do fechamento comercial sobre os contatos captados.",
    );
  }

  /**
   * Métrica 4b — Conversão Global de Visitantes em Venda.
   * Responde: "Qual a proporção de cada visitante que entra na vitrine e termina comprando?"
   * Fórmula: Vendas concluídas / Visitantes
   */
  public static calcularConversaoVendaSobreVisitantes(
    vendas: number,
    visitantes: number,
  ): MetricaTaxaExplicada {
    return calcularTaxaExplicada(
      vendas,
      visitantes,
      vendas === 1 ? "venda" : "vendas",
      visitantes === 1 ? "visitante" : "visitantes",
      "Mede a conversão de ponta a ponta, do primeiro acesso ao fechamento do negócio.",
    );
  }

  /**
   * Consolida o conjunto completo das 4 métricas CRO a partir dos dados de entrada.
   */
  public static consolidarResumo(dados: EntradaDadosMetricasCRO): ResumoMetricasCRO {
    const ctr =
      dados.sessoesComCliqueAcao !== undefined
        ? calcularTaxaExplicada(
            dados.sessoesComCliqueAcao,
            dados.visitantesOuSessoes,
            dados.sessoesComCliqueAcao === 1 ? "sessão com clique" : "sessões com clique",
            dados.visitantesOuSessoes === 1 ? "sessão" : "sessões",
            "Mede a proporção de sessões únicas que interagiram com botões e chamadas de ação da vitrine.",
          )
        : this.calcularCTR(dados.cliquesAcaoTotais, dados.visitantesOuSessoes);

    return {
      entradas: dados,
      ctr,
      cvrContato: this.calcularCVRContato(dados.contatosUnicos, dados.visitantesOuSessoes),
      taxaLeadsQualificados: this.calcularTaxaLeadsQualificados(
        dados.leadsQualificados,
        dados.contatosUnicos,
      ),
      conversaoVendaSobreContatos: this.calcularConversaoVendaSobreContatos(
        dados.vendasConcluidas,
        dados.contatosUnicos,
      ),
      conversaoVendaSobreVisitantes: this.calcularConversaoVendaSobreVisitantes(
        dados.vendasConcluidas,
        dados.visitantesOuSessoes,
      ),
      etapasFunil: this.construirEtapasFunil(dados),
    };
  }

  /**
   * Gera os dados ordenados para o funil visual CRO multi-estágio.
   */
  public static construirEtapasFunil(dados: EntradaDadosMetricasCRO): readonly EtapaFunilCRO[] {
    const topo = Math.max(0, dados.visitantesOuSessoes);
    const usandoSessoesUnicas = dados.sessoesComCliqueAcao !== undefined;
    const volumeInteracoes = usandoSessoesUnicas
      ? Math.max(0, dados.sessoesComCliqueAcao!)
      : Math.max(0, dados.cliquesAcaoTotais);

    function calcPct(parte: number, base: number): number {
      if (base <= 0 || parte <= 0) return 0;
      return arredondarTaxaPercentual((parte / base) * 100);
    }

    const detalheInteracoes = usandoSessoesUnicas
      ? `Sessões únicas que clicaram (${dados.cliquesAcaoTotais.toLocaleString("pt-BR")} cliques totais)`
      : dados.usandoContagemLegada
        ? "Contagem legada de cliques totais (pode incluir múltiplos cliques por visita)"
        : "Interações em botões, WhatsApp e aberturas de fluxo";

    return [
      {
        id: "visitantes",
        nome: "1. Audiência & Visitantes",
        volume: topo,
        percentualSobreTopo: topo > 0 ? 100 : 0,
        percentualSobreEtapaAnterior: topo > 0 ? 100 : 0,
        detalhe: usandoSessoesUnicas
          ? "Sessões únicas na vitrine ou cartões VIP"
          : "Pessoas que acessaram a vitrine ou cartões VIP",
        cor: "#4F46E5", // Indigo
      },
      {
        id: "interacoes",
        nome: "2. Cliques de Ação (CTR)",
        volume: volumeInteracoes,
        percentualSobreTopo: calcPct(volumeInteracoes, topo),
        percentualSobreEtapaAnterior: calcPct(volumeInteracoes, topo),
        detalhe: detalheInteracoes,
        cor: "#0284C7", // Sky
      },
      {
        id: "contatos",
        nome: "3. Contatos Gerados (CVR)",
        volume: dados.contatosUnicos,
        percentualSobreTopo: calcPct(dados.contatosUnicos, topo),
        percentualSobreEtapaAnterior: calcPct(dados.contatosUnicos, volumeInteracoes),
        detalhe: "Formulários submetidos e conversas iniciadas",
        cor: "#8B5CF6", // Violet
      },
      {
        id: "qualificados",
        nome: "4. Leads Qualificados",
        volume: dados.leadsQualificados,
        percentualSobreTopo: calcPct(dados.leadsQualificados, topo),
        percentualSobreEtapaAnterior: calcPct(dados.leadsQualificados, dados.contatosUnicos),
        detalhe: "Contatos com real potencial comercial confirmados no CRM",
        cor: "#F59E0B", // Amber
      },
      {
        id: "vendas",
        nome: "5. Vendas Fechadas",
        volume: dados.vendasConcluidas,
        percentualSobreTopo: calcPct(dados.vendasConcluidas, topo),
        percentualSobreEtapaAnterior: calcPct(dados.vendasConcluidas, dados.leadsQualificados),
        detalhe: "Negócios concluídos com sucesso pela equipe",
        cor: "#10B981", // Emerald
      },
    ];
  }
}

