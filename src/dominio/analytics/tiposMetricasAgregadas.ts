import type { EntradaDadosMetricasCRO, ResumoMetricasCRO } from "./tiposMetricasCRO";
import { CalculadorMetricasCRO } from "./calculadorMetricasCRO";

export type TipoEventoTelemetriaAnonima =
  | "visualizacao_vitrine"
  | "visualizacao_cartao"
  | "clique_acao_home"
  | "abertura_microfluxo"
  | "avanco_etapa_microfluxo"
  | "conclusao_microfluxo"
  | "clique_whatsapp"
  | "clique_ligacao";

export type CanalOrigemTrafego =
  "instagram" | "cartao_equipe" | "qrcode" | "whatsapp" | "google" | "direto" | "permalink";

export interface MetricaCanalOrigem {
  readonly canal: CanalOrigemTrafego;
  readonly rotulo: string;
  readonly visualizacoes: number;
  readonly cliquesAcoesHome: number;
  readonly aberturasFluxo: number;
  readonly contatosWhatsapp: number;
  readonly taxaConversao: number; // % de contatos sobre visitas
}

export interface MetricaCartaoProfissional {
  readonly id: string;
  readonly nome: string;
  readonly visualizacoes: number;
  readonly cliquesAcoesHome: number;
  readonly fluxosIniciados: number;
  readonly contatosWhatsapp: number;
  readonly taxaConversao: number; // % contatos e ações sobre visitas
}

export interface MetricaGranularMicrofluxo {
  readonly id: string;
  readonly titulo: string;
  readonly aberturas: number;
  readonly conclusoes: number;
  readonly aberturasPermalink?: number;
  readonly porEtapa?: Readonly<Record<string, number>>;
}

export interface MetricaGranularProfissional {
  readonly id: string;
  readonly nome: string;
  readonly contatos: number;
  readonly solicitacoes: number;
}

export interface MetricasDiariasOrganizacao {
  readonly dataIso: string; // formato AAAA-MM-DD
  readonly visualizacoesVitrine: number;
  readonly visualizacoesCartao?: number;
  readonly sessoesUnicas?: number;
  readonly sessoesComCliqueAcao?: number;
  readonly cliquesAcoesHome?: number;
  readonly aberturasMicrofluxo: number;
  readonly conclusoesMicrofluxo: number;
  readonly cliquesWhatsapp: number;
  readonly cliquesLigacao?: number;
  readonly porCanal?: Readonly<
    Record<
      string,
      {
        readonly visualizacoes?: number;
        readonly cliquesAcoesHome?: number;
        readonly aberturasFluxo?: number;
        readonly contatosWhatsapp?: number;
      }
    >
  >;
  readonly porQrCode?: Readonly<
    Record<
      string,
      {
        readonly visualizacoes?: number;
        readonly aberturasFluxo?: number;
        readonly conclusoesFluxo?: number;
        readonly contatosWhatsapp?: number;
      }
    >
  >;
  readonly porCartao?: Readonly<
    Record<
      string,
      {
        readonly nome?: string;
        readonly visualizacoes?: number;
        readonly cliquesAcoesHome?: number;
        readonly fluxosIniciados?: number;
        readonly contatosWhatsapp?: number;
      }
    >
  >;
  readonly porMicrofluxo?: Readonly<
    Record<
      string,
      {
        readonly titulo: string;
        readonly aberturas: number;
        readonly conclusoes: number;
        readonly aberturasPermalink?: number;
        readonly porEtapa?: Readonly<Record<string, number>>;
      }
    >
  >;
  readonly porProfissional?: Readonly<
    Record<
      string,
      {
        readonly nome: string;
        readonly contatos: number;
        readonly solicitacoes: number;
      }
    >
  >;
  readonly atualizadoEmIso: string;
}

export interface MetricaQrCode {
  readonly codigo: string;
  readonly visualizacoes: number;
  readonly aberturasFluxo: number;
  readonly conclusoesFluxo: number;
  readonly contatosWhatsapp: number;
}

export interface ResumoMetricasPeriodo {
  readonly diasConsiderados: number;
  readonly totalVisualizacoes: number;
  readonly totalVisualizacoesCartoes: number;
  readonly totalSessoesUnicas?: number;
  readonly totalSessoesComCliqueAcao?: number;
  readonly possuiTelemetriaSessao?: boolean;
  readonly totalCliquesAcoesHome: number;
  readonly totalAberturasMicrofluxo: number;
  readonly totalConclusoesMicrofluxo: number;
  readonly totalCliquesWhatsapp: number;
  readonly totalCliquesLigacao: number;
  readonly taxaConversaoMicrofluxoPercentual: number; // Ex: 14.5%
  readonly taxaConversaoContatoPercentual: number; // Ex: 8.2%
  readonly metricasCRO?: ResumoMetricasCRO;
  readonly metricasPorCanal: readonly MetricaCanalOrigem[];
  readonly metricasPorQrCode: readonly MetricaQrCode[];
  readonly metricasPorCartao: readonly MetricaCartaoProfissional[];
  readonly metricasPorMicrofluxo: readonly MetricaGranularMicrofluxo[];
  readonly metricasPorProfissional: readonly MetricaGranularProfissional[];
  readonly historicoDiario: readonly MetricasDiariasOrganizacao[];
}

const ROTULOS_CANAL: Readonly<Record<CanalOrigemTrafego, string>> = {
  instagram: "Instagram (Bio & Campanhas)",
  cartao_equipe: "Cartões VIP da Equipe",
  qrcode: "QR Code (Balcão & Impressos)",
  whatsapp: "Compartilhamento WhatsApp",
  google: "Busca Google & Orgânico",
  direto: "Acesso Direto",
  permalink: "Permalink",
};

/**
 * Consolida de forma puramente matemática os indicadores do período especificado
 * sem cruzar nenhum dado pessoal (zero PII).
 */
export function consolidarResumoMetricas(
  metricasDiarias: readonly MetricasDiariasOrganizacao[],
  diasDesejados = 30,
  dadosComerciaisComplementares?: {
    leadsQualificados?: number;
    vendasConcluidas?: number;
    contatosTotais?: number;
  },
): ResumoMetricasPeriodo {
  const ordenadas = [...metricasDiarias].sort((a, b) => b.dataIso.localeCompare(a.dataIso));
  const selecionadas = ordenadas.slice(0, diasDesejados);

  let totalVisualizacoes = 0;
  let totalVisualizacoesCartoes = 0;
  let totalSessoesUnicas = 0;
  let totalSessoesComCliqueAcao = 0;
  let possuiTelemetriaSessao = false;
  let totalCliquesAcoesHome = 0;
  let totalAberturasMicrofluxo = 0;
  let totalConclusoesMicrofluxo = 0;
  let totalCliquesWhatsapp = 0;
  let totalCliquesLigacao = 0;

  const mapaCanais = new Map<
    CanalOrigemTrafego,
    {
      visualizacoes: number;
      cliquesAcoesHome: number;
      aberturasFluxo: number;
      contatosWhatsapp: number;
    }
  >([
    [
      "instagram",
      { visualizacoes: 0, cliquesAcoesHome: 0, aberturasFluxo: 0, contatosWhatsapp: 0 },
    ],
    [
      "cartao_equipe",
      { visualizacoes: 0, cliquesAcoesHome: 0, aberturasFluxo: 0, contatosWhatsapp: 0 },
    ],
    ["qrcode", { visualizacoes: 0, cliquesAcoesHome: 0, aberturasFluxo: 0, contatosWhatsapp: 0 }],
    ["whatsapp", { visualizacoes: 0, cliquesAcoesHome: 0, aberturasFluxo: 0, contatosWhatsapp: 0 }],
    ["google", { visualizacoes: 0, cliquesAcoesHome: 0, aberturasFluxo: 0, contatosWhatsapp: 0 }],
    [
      "permalink",
      { visualizacoes: 0, cliquesAcoesHome: 0, aberturasFluxo: 0, contatosWhatsapp: 0 },
    ],
    ["direto", { visualizacoes: 0, cliquesAcoesHome: 0, aberturasFluxo: 0, contatosWhatsapp: 0 }],
  ]);

  const mapaCartoes = new Map<
    string,
    {
      nome: string;
      visualizacoes: number;
      cliquesAcoesHome: number;
      fluxosIniciados: number;
      contatosWhatsapp: number;
    }
  >();

  const mapaMicrofluxos = new Map<
    string,
    {
      titulo: string;
      aberturas: number;
      conclusoes: number;
      aberturasPermalink: number;
      porEtapa?: Record<string, number>;
    }
  >();
  const mapaProfissionais = new Map<
    string,
    { nome: string; contatos: number; solicitacoes: number }
  >();

  for (const m of selecionadas) {
    totalVisualizacoes += m.visualizacoesVitrine || 0;
    totalVisualizacoesCartoes += m.visualizacoesCartao || 0;
    if (m.sessoesUnicas !== undefined || m.sessoesComCliqueAcao !== undefined) {
      possuiTelemetriaSessao = true;
      totalSessoesUnicas += m.sessoesUnicas || 0;
      totalSessoesComCliqueAcao += m.sessoesComCliqueAcao || 0;
    }
    totalCliquesAcoesHome += m.cliquesAcoesHome || 0;
    totalAberturasMicrofluxo += m.aberturasMicrofluxo || 0;
    totalConclusoesMicrofluxo += m.conclusoesMicrofluxo || 0;
    totalCliquesWhatsapp += m.cliquesWhatsapp || 0;
    totalCliquesLigacao += m.cliquesLigacao || 0;

    // Canais de tráfego
    if (m.porCanal) {
      for (const [canalKey, dados] of Object.entries(m.porCanal)) {
        const canal = canalKey as CanalOrigemTrafego;
        const atual = mapaCanais.get(canal) ?? {
          visualizacoes: 0,
          cliquesAcoesHome: 0,
          aberturasFluxo: 0,
          contatosWhatsapp: 0,
        };
        mapaCanais.set(canal, {
          visualizacoes: atual.visualizacoes + (dados.visualizacoes || 0),
          cliquesAcoesHome: atual.cliquesAcoesHome + (dados.cliquesAcoesHome || 0),
          aberturasFluxo: atual.aberturasFluxo + (dados.aberturasFluxo || 0),
          contatosWhatsapp: atual.contatosWhatsapp + (dados.contatosWhatsapp || 0),
        });
      }
    }

    // Cartões da equipe
    if (m.porCartao) {
      for (const [cartaoId, dados] of Object.entries(m.porCartao)) {
        const existente = mapaCartoes.get(cartaoId) ?? {
          nome: dados.nome || cartaoId,
          visualizacoes: 0,
          cliquesAcoesHome: 0,
          fluxosIniciados: 0,
          contatosWhatsapp: 0,
        };
        mapaCartoes.set(cartaoId, {
          nome: dados.nome || existente.nome,
          visualizacoes: existente.visualizacoes + (dados.visualizacoes || 0),
          cliquesAcoesHome: existente.cliquesAcoesHome + (dados.cliquesAcoesHome || 0),
          fluxosIniciados: existente.fluxosIniciados + (dados.fluxosIniciados || 0),
          contatosWhatsapp: existente.contatosWhatsapp + (dados.contatosWhatsapp || 0),
        });
      }
    }

    // Microfluxos individuais
    if (m.porMicrofluxo) {
      for (const [id, dados] of Object.entries(m.porMicrofluxo)) {
        const existente = mapaMicrofluxos.get(id) ?? {
          titulo: dados.titulo,
          aberturas: 0,
          conclusoes: 0,
          aberturasPermalink: 0,
          porEtapa: {},
        };
        const etapasAcumuladas: Record<string, number> = { ...(existente.porEtapa ?? {}) };
        if (dados.porEtapa) {
          for (const [etapaId, count] of Object.entries(dados.porEtapa)) {
            etapasAcumuladas[etapaId] = (etapasAcumuladas[etapaId] || 0) + Number(count || 0);
          }
        }
        mapaMicrofluxos.set(id, {
          titulo: dados.titulo || existente.titulo,
          aberturas: existente.aberturas + (dados.aberturas || 0),
          conclusoes: existente.conclusoes + (dados.conclusoes || 0),
          aberturasPermalink: existente.aberturasPermalink + (dados.aberturasPermalink || 0),
          porEtapa: etapasAcumuladas,
        });
      }
    }

    // Profissionais
    if (m.porProfissional) {
      for (const [id, dados] of Object.entries(m.porProfissional)) {
        const existente = mapaProfissionais.get(id) ?? {
          nome: dados.nome,
          contatos: 0,
          solicitacoes: 0,
        };
        mapaProfissionais.set(id, {
          nome: dados.nome || existente.nome,
          contatos: existente.contatos + (dados.contatos || 0),
          solicitacoes: existente.solicitacoes + (dados.solicitacoes || 0),
        });
      }
    }
  }

  const taxaConversaoMicrofluxoPercentual =
    totalAberturasMicrofluxo > 0
      ? Math.round((totalConclusoesMicrofluxo / totalAberturasMicrofluxo) * 1000) / 10
      : 0;

  const taxaConversaoContatoPercentual =
    totalVisualizacoes > 0
      ? Math.round((totalConclusoesMicrofluxo / totalVisualizacoes) * 1000) / 10
      : 0;

  // Atribuição de tráfego direto para acessos não atribuídos explicitamente a UTMs/canais específicos
  const somaVisualizacoesCanais = Array.from(mapaCanais.values()).reduce(
    (acc, c) => acc + c.visualizacoes,
    0,
  );
  if (totalVisualizacoes > somaVisualizacoesCanais) {
    const canalDireto = mapaCanais.get("direto") ?? {
      visualizacoes: 0,
      cliquesAcoesHome: 0,
      aberturasFluxo: 0,
      contatosWhatsapp: 0,
    };
    const diferencaVisitas = totalVisualizacoes - somaVisualizacoesCanais;
    const somaAberturasCanais = Array.from(mapaCanais.values()).reduce(
      (acc, c) => acc + c.aberturasFluxo,
      0,
    );
    const diferencaAberturas = Math.max(0, totalAberturasMicrofluxo - somaAberturasCanais);
    const somaWhatsappCanais = Array.from(mapaCanais.values()).reduce(
      (acc, c) => acc + c.contatosWhatsapp,
      0,
    );
    const diferencaWhatsapp = Math.max(0, totalCliquesWhatsapp - somaWhatsappCanais);

    mapaCanais.set("direto", {
      visualizacoes: canalDireto.visualizacoes + diferencaVisitas,
      cliquesAcoesHome: canalDireto.cliquesAcoesHome,
      aberturasFluxo: canalDireto.aberturasFluxo + diferencaAberturas,
      contatosWhatsapp: canalDireto.contatosWhatsapp + diferencaWhatsapp,
    });
  }

  const mapaQrCodes = new Map<
    string,
    { visualizacoes: number; aberturasFluxo: number; conclusoesFluxo: number; contatosWhatsapp: number }
  >();

  for (const metrica of selecionadas) {
    if (metrica.porQrCode) {
      for (const [codigo, dados] of Object.entries(metrica.porQrCode)) {
        const atual = mapaQrCodes.get(codigo) ?? {
          visualizacoes: 0,
          aberturasFluxo: 0,
          conclusoesFluxo: 0,
          contatosWhatsapp: 0,
        };
        mapaQrCodes.set(codigo, {
          visualizacoes: atual.visualizacoes + (dados.visualizacoes ?? 0),
          aberturasFluxo: atual.aberturasFluxo + (dados.aberturasFluxo ?? 0),
          conclusoesFluxo: atual.conclusoesFluxo + (dados.conclusoesFluxo ?? 0),
          contatosWhatsapp: atual.contatosWhatsapp + (dados.contatosWhatsapp ?? 0),
        });
      }
    }
  }

  const metricasPorQrCode: MetricaQrCode[] = Array.from(mapaQrCodes.entries())
    .map(([codigo, dados]) => ({ codigo, ...dados }))
    .sort((a, b) => b.visualizacoes - a.visualizacoes);

  // Consolidação de Canais
  const metricasPorCanal: MetricaCanalOrigem[] = Array.from(mapaCanais.entries()).map(
    ([canal, dados]) => {
      const taxaConversao =
        dados.visualizacoes > 0
          ? Math.round((dados.contatosWhatsapp / dados.visualizacoes) * 1000) / 10
          : 0;
      return {
        canal,
        rotulo: ROTULOS_CANAL[canal] || canal,
        visualizacoes: dados.visualizacoes,
        cliquesAcoesHome: dados.cliquesAcoesHome,
        aberturasFluxo: dados.aberturasFluxo,
        contatosWhatsapp: dados.contatosWhatsapp,
        taxaConversao,
      };
    },
  );

  // Consolidação de Cartões VIP
  const metricasPorCartao: MetricaCartaoProfissional[] = Array.from(mapaCartoes.entries()).map(
    ([id, dados]) => {
      const taxaConversao =
        dados.visualizacoes > 0
          ? Math.round(
            ((dados.contatosWhatsapp + dados.cliquesAcoesHome) / dados.visualizacoes) * 1000,
          ) / 10
          : 0;
      return {
        id,
        nome: dados.nome,
        visualizacoes: dados.visualizacoes,
        cliquesAcoesHome: dados.cliquesAcoesHome,
        fluxosIniciados: dados.fluxosIniciados,
        contatosWhatsapp: dados.contatosWhatsapp,
        taxaConversao,
      };
    },
  );

  const metricasPorMicrofluxo: MetricaGranularMicrofluxo[] = Array.from(
    mapaMicrofluxos.entries(),
  ).map(([id, val]) => ({
    id,
    titulo: val.titulo,
    aberturas: val.aberturas,
    conclusoes: val.conclusoes,
    aberturasPermalink: val.aberturasPermalink,
    porEtapa: val.porEtapa,
  }));

  const metricasPorProfissional: MetricaGranularProfissional[] = Array.from(
    mapaProfissionais.entries(),
  ).map(([id, val]) => ({
    id,
    nome: val.nome,
    contatos: val.contatos,
    solicitacoes: val.solicitacoes,
  }));

  const cliquesAcaoTotais = totalCliquesWhatsapp + totalAberturasMicrofluxo + totalCliquesAcoesHome;
  const contatosUnicos =
    dadosComerciaisComplementares?.contatosTotais !== undefined
      ? dadosComerciaisComplementares.contatosTotais
      : totalConclusoesMicrofluxo + totalCliquesWhatsapp;

  const visitantesOuSessoes = possuiTelemetriaSessao
    ? totalSessoesUnicas
    : totalVisualizacoes + totalVisualizacoesCartoes;

  const entradasCRO: EntradaDadosMetricasCRO = {
    visitantesOuSessoes,
    cliquesAcaoTotais,
    ...(possuiTelemetriaSessao
      ? { sessoesComCliqueAcao: totalSessoesComCliqueAcao }
      : { usandoContagemLegada: true }),
    contatosUnicos,
    leadsQualificados: dadosComerciaisComplementares?.leadsQualificados ?? 0,
    vendasConcluidas: dadosComerciaisComplementares?.vendasConcluidas ?? 0,
  };
  const metricasCRO = CalculadorMetricasCRO.consolidarResumo(entradasCRO);

  return {
    diasConsiderados: selecionadas.length || diasDesejados,
    totalVisualizacoes,
    totalVisualizacoesCartoes,
    totalSessoesUnicas,
    totalSessoesComCliqueAcao,
    possuiTelemetriaSessao,
    totalCliquesAcoesHome,
    totalAberturasMicrofluxo,
    totalConclusoesMicrofluxo,
    totalCliquesWhatsapp,
    totalCliquesLigacao,
    taxaConversaoMicrofluxoPercentual,
    taxaConversaoContatoPercentual,
    metricasCRO,
    metricasPorCanal,
    metricasPorQrCode,
    metricasPorCartao,
    metricasPorMicrofluxo,
    metricasPorProfissional,
    historicoDiario: selecionadas,
  };
}
