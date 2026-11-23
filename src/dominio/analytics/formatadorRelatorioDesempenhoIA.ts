import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import { analisarTopologiaFunil } from "@/dominio/microfluxos/analisadorTopologiaFunil";
import type { ItemExperienciaPainel } from "@/infraestrutura/painel/leitorDesempenhoOrganizacaoServidor";
import {
  calcularEstagiosFunilRamificado,
  type EstagioFunilCalculado,
} from "./calculadorFunilRamificado";
import { consolidarDesempenhoEquipe } from "./consolidarDesempenhoEquipe";
import { calcularOrigemPercurso, calcularResumoQrCode } from "./resumoQrCodeEOrigem";
import {
  consolidarResumoMetricas,
  type MetricaGranularMicrofluxo,
  type MetricasDiariasOrganizacao,
  type ResumoMetricasPeriodo,
} from "./tiposMetricasAgregadas";

export interface EntradaRelatorioDesempenhoIA {
  readonly nomeOrganizacao: string;
  readonly mesSelecionado: string;
  readonly diaSelecionado: string | null;
  readonly resumoGeral: ResumoMetricasPeriodo;
  readonly metricasAtivas: ResumoMetricasPeriodo;
  readonly historicoAtivo: readonly MetricasDiariasOrganizacao[];
  readonly experiencias: readonly ItemExperienciaPainel[];
  readonly profissionais: readonly ProfissionalEquipe[];
  readonly dataGeracaoIso?: string;
}

function formatarDataPtBr(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-");
  if (!ano || !mes || !dia) return dataIso;
  return `${dia}/${mes}/${ano}`;
}

function formatarMesPtBr(anoMes: string): string {
  const [ano, mes] = anoMes.split("-");
  if (!ano || !mes) return anoMes;
  const nome = new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

function formatarPct(valor: number): string {
  return `${Number.isInteger(valor) ? valor : valor.toFixed(1)}%`;
}

function obterIntervaloDatas(historico: readonly MetricasDiariasOrganizacao[]): {
  readonly inicio: string | null;
  readonly fim: string | null;
  readonly totalDias: number;
} {
  const datas = historico
    .map((d) => d.dataIso)
    .filter((data) => Boolean(data))
    .sort((a, b) => a.localeCompare(b));
  if (datas.length === 0) {
    return { inicio: null, fim: null, totalDias: 0 };
  }
  return {
    inicio: datas[0]!,
    fim: datas[datas.length - 1]!,
    totalDias: datas.length,
  };
}

export function obterRotuloPeriodoRelatorio(
  mesSelecionado: string,
  diaSelecionado: string | null,
): string {
  if (diaSelecionado) return `Dia ${formatarDataPtBr(diaSelecionado)}`;
  if (mesSelecionado === "todos") return "Visão geral (todo o histórico carregado)";
  return formatarMesPtBr(mesSelecionado);
}

function formatarSecaoIndicadoresETotais(
  metricasAtivas: ResumoMetricasPeriodo,
  resumoGeral: ResumoMetricasPeriodo,
  ehRecorteFiltrado: boolean,
): string {
  const linhas: string[] = ["## 1. Indicadores CRO & Totais do Período"];
  const cro = metricasAtivas.metricasCRO;

  if (cro) {
    linhas.push(`- **CTR (Interação):** ${formatarPct(cro.ctr.valorPercentual)} (${cro.ctr.rotuloFormula})`);
    linhas.push(
      `- **CVR a Contato (Captação):** ${formatarPct(cro.cvrContato.valorPercentual)} (${cro.cvrContato.rotuloFormula})`,
    );

    if (!ehRecorteFiltrado) {
      linhas.push(
        `- **Leads Qualificados:** ${formatarPct(cro.taxaLeadsQualificados.valorPercentual)} (${cro.taxaLeadsQualificados.rotuloFormula})`,
      );
      linhas.push(
        `- **Conversão a Venda (sobre contatos):** ${formatarPct(cro.conversaoVendaSobreContatos.valorPercentual)} (${cro.conversaoVendaSobreContatos.rotuloFormula})`,
      );
      linhas.push(
        `- **Conversão a Venda (sobre visitantes):** ${formatarPct(cro.conversaoVendaSobreVisitantes.valorPercentual)} (${cro.conversaoVendaSobreVisitantes.rotuloFormula})`,
      );
    }
  }

  linhas.push(
    `- **Totais de Telemetria:** Vitrine: ${metricasAtivas.totalVisualizacoes} | Cartões VIP: ${metricasAtivas.totalVisualizacoesCartoes} | Ações da Home: ${metricasAtivas.totalCliquesAcoesHome} | Fluxos Abertos: ${metricasAtivas.totalAberturasMicrofluxo} | Fluxos Concluídos: ${metricasAtivas.totalConclusoesMicrofluxo} | Cliques WhatsApp: ${metricasAtivas.totalCliquesWhatsapp} | Cliques Ligação: ${metricasAtivas.totalCliquesLigacao}`,
  );

  if (ehRecorteFiltrado && resumoGeral.metricasCRO) {
    const { leadsQualificados, vendasConcluidas } = resumoGeral.metricasCRO.entradas;
    linhas.push(
      `- **CRM Acumulado Geral (sem filtro de data):** Leads qualificados: ${leadsQualificados} | Vendas concluídas: ${vendasConcluidas}`,
    );
  }

  return linhas.join("\n");
}

function formatarSecaoFunilGlobal(metricasAtivas: ResumoMetricasPeriodo, ehRecorteFiltrado: boolean): string {
  const etapas = metricasAtivas.metricasCRO?.etapasFunil ?? [];
  if (etapas.length === 0) {
    return "## 2. Funil CRO Global\n- Sem dados de funil no período.";
  }

  const etapasFiltradas = ehRecorteFiltrado
    ? etapas.filter((e) => e.id !== "qualificados" && e.id !== "vendas")
    : etapas;

  const linhas: string[] = ["## 2. Funil CRO Global"];
  etapasFiltradas.forEach((etapa, idx) => {
    const anterior = idx > 0 ? etapasFiltradas[idx - 1] : null;
    const perda = anterior ? Math.max(anterior.volume - etapa.volume, 0) : null;
    const sufixoPerda = perda !== null ? ` | perda etapa anterior: -${perda}` : "";
    linhas.push(
      `- **${etapa.nome}:** ${etapa.volume} (${formatarPct(etapa.percentualSobreTopo)} do topo | ${formatarPct(etapa.percentualSobreEtapaAnterior)} da etapa anterior${sufixoPerda})`,
    );
  });

  return linhas.join("\n");
}

function formatarEstagiosExperiencia(estagios: readonly EstagioFunilCalculado[]): string[] {
  const linhas: string[] = [];
  for (const estagio of estagios) {
    if (estagio.tipo === "linear") {
      linhas.push(
        `  - ${estagio.nome}: ${estagio.volume} (${formatarPct(estagio.percentualSobreTopo)} do topo | ${formatarPct(estagio.percentualSobreEtapaAnterior)} da anterior)`,
      );
    } else {
      linhas.push(
        `  - ${estagio.nome} [decisão ramificada]: ${estagio.volume} (${formatarPct(estagio.percentualSobreTopo)} do topo | avançaram: ${estagio.volumeAvancoTotal} | desistências na decisão: ${estagio.desistenciasNaDecisao} / ${formatarPct(estagio.percentualDesistenciaDecisao)})`,
      );
      for (const rota of estagio.rotas) {
        const sufixoEncerra = rota.encerraPercurso ? " [encerra percurso]" : "";
        linhas.push(
          `    - Rota "${rota.rotuloOpcao}": ${rota.volume} (${formatarPct(rota.percentualSobreDecisao)} da decisão)${sufixoEncerra}`,
        );
        for (const interna of rota.etapasInternas) {
          linhas.push(
            `      - ${interna.titulo}: ${interna.volume} (${formatarPct(interna.percentualSobreAnterior)} da anterior)`,
          );
        }
      }
    }
  }
  return linhas;
}

function formatarSecaoExperiencias(
  metricasPorMicrofluxo: readonly MetricaGranularMicrofluxo[],
  experiencias: readonly ItemExperienciaPainel[],
): string {
  const mapaMetricas = new Map<string, MetricaGranularMicrofluxo>();
  for (const m of metricasPorMicrofluxo) {
    mapaMetricas.set(m.id, m);
  }
  const mapaDefinicoes = new Map<string, ItemExperienciaPainel>();
  for (const exp of experiencias) {
    mapaDefinicoes.set(exp.id, exp);
  }

  const todosIds = new Set<string>([...mapaMetricas.keys(), ...mapaDefinicoes.keys()]);
  const ativas: Array<{ metrica: MetricaGranularMicrofluxo; definicao?: ItemExperienciaPainel }> = [];
  const inativas: string[] = [];

  for (const id of todosIds) {
    const metrica = mapaMetricas.get(id);
    const definicao = mapaDefinicoes.get(id);
    if (metrica && (metrica.aberturas > 0 || metrica.conclusoes > 0)) {
      ativas.push({ metrica, definicao });
    } else {
      inativas.push(definicao?.titulo ?? metrica?.titulo ?? id);
    }
  }

  ativas.sort(
    (a, b) =>
      b.metrica.aberturas - a.metrica.aberturas ||
      a.metrica.titulo.localeCompare(b.metrica.titulo),
  );

  const linhas: string[] = ["## 3. Funis Individuais por Experiência / Microfluxo"];

  if (ativas.length === 0) {
    linhas.push("- Nenhuma experiência teve atividade no período.");
  } else {
    for (const { metrica, definicao } of ativas) {
      const taxaConclusao =
        metrica.aberturas > 0
          ? Math.round((metrica.conclusoes / metrica.aberturas) * 1000) / 10
          : 0;
      const origem = calcularOrigemPercurso(metrica.aberturas, metrica.aberturasPermalink);
      const textoOrigem = origem
        ? ` | Origem: Vitrine ${origem.vitrine} (${formatarPct(origem.pctVitrine)}) vs Permalink ${origem.permalink} (${formatarPct(origem.pctPermalink)})`
        : "";

      linhas.push(
        `### ${definicao?.titulo ?? metrica.titulo}`,
        `- Aberturas: ${metrica.aberturas} | Conclusões: ${metrica.conclusoes} (${formatarPct(taxaConclusao)})${textoOrigem}`,
      );

      if (definicao?.etapas && definicao.etapas.length > 0) {
        const topologia = analisarTopologiaFunil(definicao.etapas, definicao.etapaInicialId);
        const estagios = calcularEstagiosFunilRamificado({
          topologia,
          topo: metrica.aberturas,
          conclusoes: metrica.conclusoes,
          metricasEtapas: metrica.porEtapa ?? {},
          tituloMicrofluxo: definicao.titulo,
        });
        linhas.push(...formatarEstagiosExperiencia(estagios));
      }
    }
  }

  if (inativas.length > 0) {
    linhas.push(`- *Sem atividade no período (${inativas.length}):* ${inativas.join(", ")}`);
  }

  return linhas.join("\n");
}

function formatarSecaoCanais(metricasAtivas: ResumoMetricasPeriodo): string {
  const ativos = metricasAtivas.metricasPorCanal.filter(
    (c) =>
      c.visualizacoes > 0 ||
      c.cliquesAcoesHome > 0 ||
      c.aberturasFluxo > 0 ||
      c.contatosWhatsapp > 0,
  );
  const inativos = metricasAtivas.metricasPorCanal
    .filter((c) => !ativos.includes(c))
    .map((c) => c.rotulo);

  const linhas: string[] = ["## 4. Canais de Origem"];
  if (ativos.length === 0) {
    linhas.push("- Sem tráfego atribuído a canais no período.");
  } else {
    linhas.push("| Canal | Visitas | Ações Home | Fluxos Abertos | WhatsApp | Conversão |");
    linhas.push("| --- | ---: | ---: | ---: | ---: | ---: |");
    for (const c of ativos) {
      linhas.push(
        `| ${c.rotulo} | ${c.visualizacoes} | ${c.cliquesAcoesHome} | ${c.aberturasFluxo} | ${c.contatosWhatsapp} | ${formatarPct(c.taxaConversao)} |`,
      );
    }
  }

  if (inativos.length > 0) {
    linhas.push(`- *Canais sem atividade:* ${inativos.join(", ")}`);
  }

  return linhas.join("\n");
}

function formatarSecaoQrCodes(metricasAtivas: ResumoMetricasPeriodo): string {
  const resumos = metricasAtivas.metricasPorQrCode
    .map(calcularResumoQrCode)
    .filter((q) => q.visitas > 0 || q.fluxos > 0 || q.conclusoes > 0 || q.whatsapp > 0);

  const linhas: string[] = ["## 5. QR Codes (Consolidado + Todos os Destinos)"];
  if (resumos.length === 0) {
    linhas.push("- Nenhuma leitura de QR Code no período.");
    return linhas.join("\n");
  }

  const totalVisitas = resumos.reduce((acc, q) => acc + q.visitas, 0);
  const totalFluxos = resumos.reduce((acc, q) => acc + q.fluxos, 0);
  const totalConclusoes = resumos.reduce((acc, q) => acc + q.conclusoes, 0);
  const totalWhatsapp = resumos.reduce((acc, q) => acc + q.whatsapp, 0);
  const totalConversoes = totalConclusoes + totalWhatsapp;
  const taxaGeral =
    totalVisitas > 0 ? Math.round((totalConversoes / totalVisitas) * 1000) / 10 : 0;

  linhas.push(
    `- **Total Consolidado:** Leituras: ${totalVisitas} | Fluxos: ${totalFluxos} | Conclusões: ${totalConclusoes} | WhatsApp: ${totalWhatsapp} | Conversões totais: ${totalConversoes} (${formatarPct(taxaGeral)})`,
  );
  linhas.push("| Destino QR | Leituras | Fluxos | Conclusões | WhatsApp | Conversões | Taxa |");
  linhas.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const q of resumos) {
    linhas.push(
      `| ${q.rotulo} | ${q.visitas} | ${q.fluxos} | ${q.conclusoes} | ${q.whatsapp} | ${q.conversoes} | ${formatarPct(q.taxaConversao)} |`,
    );
  }

  return linhas.join("\n");
}

function formatarSecaoEquipe(
  profissionais: readonly ProfissionalEquipe[],
  metricasAtivas: ResumoMetricasPeriodo,
  ehRecorteFiltrado: boolean,
): string {
  const consolidado = consolidarDesempenhoEquipe(
    profissionais,
    metricasAtivas.metricasPorCartao,
    metricasAtivas.metricasPorProfissional,
  );

  const linhas: string[] = ["## 6. Performance da Equipe & Cartões VIP"];
  if (consolidado.length === 0) {
    linhas.push("- Nenhum profissional cadastrado.");
    return linhas.join("\n");
  }

  if (ehRecorteFiltrado) {
    linhas.push(
      "- *Nota:* em recortes de mês/dia, os fluxos atribuídos refletem apenas telemetria do período (solicitações do CRM não são particionadas por data).",
    );
  }

  linhas.push("| Profissional | Cargo | Visitas Cartão | Ações Cartão | Fluxos Atribuídos | WhatsApp | Ações/Visita |");
  linhas.push("| --- | --- | ---: | ---: | ---: | ---: | ---: |");
  for (const m of consolidado) {
    const media = m.acoesPorVisita !== null ? m.acoesPorVisita.toFixed(2) : "—";
    linhas.push(
      `| ${m.nome} | ${m.cargo} | ${m.visualizacoes} | ${m.cliquesAcoes} | ${m.fluxos} | ${m.contatos} | ${media} |`,
    );
  }

  return linhas.join("\n");
}

function formatarSecaoTemporal(
  historicoAtivo: readonly MetricasDiariasOrganizacao[],
  historicoCompleto: readonly MetricasDiariasOrganizacao[],
): string {
  const blocos: string[] = [];

  if (historicoAtivo.length > 0 && historicoAtivo.length <= 31) {
    const diasComAtividade = [...historicoAtivo]
      .filter(
        (d) =>
          (d.visualizacoesVitrine || 0) > 0 ||
          (d.visualizacoesCartao || 0) > 0 ||
          (d.cliquesAcoesHome || 0) > 0 ||
          (d.aberturasMicrofluxo || 0) > 0 ||
          (d.conclusoesMicrofluxo || 0) > 0 ||
          (d.cliquesWhatsapp || 0) > 0 ||
          (d.cliquesLigacao || 0) > 0,
      )
      .sort((a, b) => a.dataIso.localeCompare(b.dataIso));

    if (diasComAtividade.length > 0) {
      const linhas: string[] = [
        "## 7. Evolução Diária (dias com atividade no período)",
        "| Data | Vitrine | Cartões | Ações Home | Fluxos Abertos | Concluídos | WhatsApp | Ligações |",
        "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
      ];
      for (const d of diasComAtividade) {
        linhas.push(
          `| ${d.dataIso} | ${d.visualizacoesVitrine || 0} | ${d.visualizacoesCartao || 0} | ${d.cliquesAcoesHome || 0} | ${d.aberturasMicrofluxo || 0} | ${d.conclusoesMicrofluxo || 0} | ${d.cliquesWhatsapp || 0} | ${d.cliquesLigacao || 0} |`,
        );
      }
      blocos.push(linhas.join("\n"));
    }
  }

  const porMes = new Map<string, MetricasDiariasOrganizacao[]>();
  for (const d of historicoCompleto) {
    if (d.dataIso && d.dataIso.length >= 7) {
      const chave = d.dataIso.slice(0, 7);
      const lista = porMes.get(chave) ?? [];
      lista.push(d);
      porMes.set(chave, lista);
    }
  }

  if (porMes.size > 1) {
    const mesesOrdenados = Array.from(porMes.keys()).sort((a, b) => a.localeCompare(b));
    const linhas: string[] = [
      "## Contexto Histórico — Evolução Mensal (somente telemetria)",
      "| Mês | Dias | Vitrine | Cartões | Ações | Fluxos Abertos | Concluídos | WhatsApp | CTR | CVR Contato |",
      "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ];
    for (const mes of mesesOrdenados) {
      const diasMes = porMes.get(mes)!;
      const resumoMes = consolidarResumoMetricas(diasMes, 31);
      const ctr = resumoMes.metricasCRO ? formatarPct(resumoMes.metricasCRO.ctr.valorPercentual) : "—";
      const cvr = resumoMes.metricasCRO
        ? formatarPct(resumoMes.metricasCRO.cvrContato.valorPercentual)
        : "—";
      linhas.push(
        `| ${mes} | ${diasMes.length} | ${resumoMes.totalVisualizacoes} | ${resumoMes.totalVisualizacoesCartoes} | ${resumoMes.totalCliquesAcoesHome} | ${resumoMes.totalAberturasMicrofluxo} | ${resumoMes.totalConclusoesMicrofluxo} | ${resumoMes.totalCliquesWhatsapp} | ${ctr} | ${cvr} |`,
      );
    }
    blocos.push(linhas.join("\n"));
  }

  return blocos.join("\n\n");
}

/**
 * Gera um relatório completo em Markdown enxuto dos dados de Desempenho & Conversão,
 * sem dados pessoais (zero PII), pronto para análise em ferramentas de IA.
 */
export function gerarRelatorioDesempenhoParaIA(entrada: EntradaRelatorioDesempenhoIA): string {
  const ehRecorteFiltrado = entrada.mesSelecionado !== "todos" || entrada.diaSelecionado !== null;
  const rotuloPeriodo = obterRotuloPeriodoRelatorio(
    entrada.mesSelecionado,
    entrada.diaSelecionado,
  );
  const intervalo = obterIntervaloDatas(entrada.historicoAtivo);
  const textoIntervalo =
    intervalo.inicio && intervalo.fim
      ? `${formatarDataPtBr(intervalo.inicio)} a ${formatarDataPtBr(intervalo.fim)} (${intervalo.totalDias} ${intervalo.totalDias === 1 ? "dia" : "dias"} com registro)`
      : "sem registros diários";

  const cabecalho = [
    `# Relatório de Desempenho & Conversão — ${entrada.nomeOrganizacao}`,
    `- **Recorte selecionado:** ${rotuloPeriodo}`,
    `- **Intervalo real dos dados:** ${textoIntervalo}`,
    `- **Privacidade:** telemetria agregada anônima (zero dados pessoais / PII).`,
    "",
    "### Notas metodológicas",
    "- CTR = (cliques em WhatsApp + ações da home + aberturas de fluxos) / exposições totais.",
    "- Cliques (ex.: WhatsApp e ações do cartão) são contagens de eventos: uma mesma visita pode gerar múltiplos cliques.",
    "- Leads qualificados e vendas concluídas vêm do CRM como acumulado geral (sem particionamento por dia/mês).",
  ].join("\n");

  const secoes = [
    cabecalho,
    formatarSecaoIndicadoresETotais(
      entrada.metricasAtivas,
      entrada.resumoGeral,
      ehRecorteFiltrado,
    ),
    formatarSecaoFunilGlobal(entrada.metricasAtivas, ehRecorteFiltrado),
    formatarSecaoExperiencias(entrada.metricasAtivas.metricasPorMicrofluxo, entrada.experiencias),
    formatarSecaoCanais(entrada.metricasAtivas),
    formatarSecaoQrCodes(entrada.metricasAtivas),
    formatarSecaoEquipe(entrada.profissionais, entrada.metricasAtivas, ehRecorteFiltrado),
    formatarSecaoTemporal(entrada.historicoAtivo, entrada.resumoGeral.historicoDiario),
  ].filter((secao) => secao.trim().length > 0);

  return secoes.join("\n\n");
}

