import { describe, expect, it } from "vitest";
import { gerarRelatorioDesempenhoParaIA } from "@/dominio/analytics/formatadorRelatorioDesempenhoIA";
import {
  consolidarResumoMetricas,
  type MetricasDiariasOrganizacao,
} from "@/dominio/analytics/tiposMetricasAgregadas";
import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import type { ItemExperienciaPainel } from "@/infraestrutura/painel/leitorDesempenhoOrganizacaoServidor";

const HISTORICO_EXEMPLO: readonly MetricasDiariasOrganizacao[] = [
  {
    dataIso: "2026-10-15",
    visualizacoesVitrine: 100,
    visualizacoesCartao: 20,
    cliquesAcoesHome: 15,
    aberturasMicrofluxo: 30,
    conclusoesMicrofluxo: 10,
    cliquesWhatsapp: 12,
    cliquesLigacao: 2,
    porCanal: {
      instagram: { visualizacoes: 70, cliquesAcoesHome: 10, aberturasFluxo: 20, contatosWhatsapp: 8 },
      qrcode: { visualizacoes: 30, cliquesAcoesHome: 5, aberturasFluxo: 10, contatosWhatsapp: 4 },
    },
    porQrCode: {
      vitrine: { visualizacoes: 20, aberturasFluxo: 6, conclusoesFluxo: 3, contatosWhatsapp: 2 },
      fluxo_diagnostico: {
        visualizacoes: 10,
        aberturasFluxo: 10,
        conclusoesFluxo: 4,
        contatosWhatsapp: 2,
      },
    },
    porCartao: {
      "prof-1": {
        nome: "Ana Silva",
        visualizacoes: 20,
        cliquesAcoesHome: 6,
        fluxosIniciados: 4,
        contatosWhatsapp: 5,
      },
    },
    porMicrofluxo: {
      "exp-1": {
        titulo: "Diagnóstico Patrimonial",
        aberturas: 30,
        conclusoes: 10,
        aberturasPermalink: 12,
        porEtapa: {
          "etapa-1": 30,
          "etapa-a": 18,
          "etapa-b": 7,
        },
      },
    },
    atualizadoEmIso: "2026-10-15T23:00:00.000Z",
  },
  {
    dataIso: "2026-11-10",
    visualizacoesVitrine: 150,
    visualizacoesCartao: 30,
    cliquesAcoesHome: 25,
    aberturasMicrofluxo: 40,
    conclusoesMicrofluxo: 16,
    cliquesWhatsapp: 18,
    cliquesLigacao: 1,
    porCanal: {
      instagram: { visualizacoes: 110, cliquesAcoesHome: 18, aberturasFluxo: 30, contatosWhatsapp: 14 },
    },
    porQrCode: {
      vitrine: { visualizacoes: 15, aberturasFluxo: 5, conclusoesFluxo: 2, contatosWhatsapp: 3 },
    },
    porMicrofluxo: {
      "exp-1": {
        titulo: "Diagnóstico Patrimonial",
        aberturas: 40,
        conclusoes: 16,
        aberturasPermalink: 10,
      },
    },
    atualizadoEmIso: "2026-11-10T23:00:00.000Z",
  },
];

const EXPERIENCIAS_EXEMPLO: readonly ItemExperienciaPainel[] = [
  {
    id: "exp-1",
    titulo: "Diagnóstico Patrimonial",
    etapaInicialId: "etapa-1",
    etapas: [
      {
        id: "etapa-1",
        titulo: "Perfil do Cliente",
        opcoes: [
          { id: "op-a", rotulo: "Pessoa Física", proximaEtapaIdOpcional: "etapa-a" },
          { id: "op-b", rotulo: "Empresa", proximaEtapaIdOpcional: "etapa-b" },
        ],
      },
      { id: "etapa-a", titulo: "Patrimônio PF" },
      { id: "etapa-b", titulo: "Estrutura Societária" },
    ],
  },
  {
    id: "exp-2",
    titulo: "Consultoria Tributária",
  },
];

const PROFISSIONAIS_EXEMPLO: readonly ProfissionalEquipe[] = [
  {
    id: "prof-1",
    organizacaoId: "org-1",
    identificadorCartao: "ana-silva",
    nomeCompleto: "Ana Silva",
    cargoOuEspecialidade: "Sócia",
    minibiografia: "Especialista em direito patrimonial.",
    pontoFocalFoto: { xPercentual: 50, yPercentual: 30 },
    aceitaSolicitacoesDiretas: true,
    ordemExibicao: 1,
    ativo: true,
    atualizadoEmIso: "2026-11-01T00:00:00.000Z",
  },
];

describe("gerarRelatorioDesempenhoParaIA", () => {
  it("gera relatório completo com funil ramificado, QR Codes, equipe e evolução mensal", () => {
    const resumoGeral = consolidarResumoMetricas(HISTORICO_EXEMPLO, 365, {
      leadsQualificados: 12,
      vendasConcluidas: 5,
    });

    const texto = gerarRelatorioDesempenhoParaIA({
      nomeOrganizacao: "Escritório Exemplo",
      mesSelecionado: "todos",
      diaSelecionado: null,
      resumoGeral,
      metricasAtivas: resumoGeral,
      historicoAtivo: HISTORICO_EXEMPLO,
      experiencias: EXPERIENCIAS_EXEMPLO,
      profissionais: PROFISSIONAIS_EXEMPLO,
    });

    expect(texto).toContain("# Relatório de Desempenho & Conversão — Escritório Exemplo");
    expect(texto).toContain("15/10/2026 a 10/11/2026 (2 dias com registro)");
    expect(texto).toContain("Diagnóstico Patrimonial");
    expect(texto).toContain('Rota "Pessoa Física"');
    expect(texto).toContain('Rota "Empresa"');
    expect(texto).toContain("Sem atividade no período (1):* Consultoria Tributária");
    expect(texto).toContain("Vitrine Principal (Home)");
    expect(texto).toContain("Fluxo: diagnostico");
    expect(texto).toContain("Ana Silva");
    expect(texto).toContain("Contexto Histórico — Evolução Mensal (somente telemetria)");
    expect(texto).toContain("| 2026-10 |");
    expect(texto).toContain("| 2026-11 |");
  });

  it("separa CRM acumulado quando o recorte é mensal para não distorcer taxas do mês", () => {
    const resumoGeral = consolidarResumoMetricas(HISTORICO_EXEMPLO, 365, {
      leadsQualificados: 20,
      vendasConcluidas: 8,
    });
    const historicoNovembro = HISTORICO_EXEMPLO.filter((d) => d.dataIso.startsWith("2026-11"));
    const metricasNovembro = consolidarResumoMetricas(historicoNovembro, 31, {
      leadsQualificados: 20,
      vendasConcluidas: 8,
    });

    const texto = gerarRelatorioDesempenhoParaIA({
      nomeOrganizacao: "Escritório Exemplo",
      mesSelecionado: "2026-11",
      diaSelecionado: null,
      resumoGeral,
      metricasAtivas: metricasNovembro,
      historicoAtivo: historicoNovembro,
      experiencias: EXPERIENCIAS_EXEMPLO,
      profissionais: PROFISSIONAIS_EXEMPLO,
    });

    expect(texto).toContain("CRM Acumulado Geral (sem filtro de data)");
    expect(texto).not.toContain("**Conversão a Venda (sobre contatos):**");
    expect(texto).toContain("10/11/2026 a 10/11/2026 (1 dia com registro)");
  });

  it("lida graciosamente com histórico vazio", () => {
    const vazio = consolidarResumoMetricas([], 30);

    const texto = gerarRelatorioDesempenhoParaIA({
      nomeOrganizacao: "Empresa Nova",
      mesSelecionado: "todos",
      diaSelecionado: null,
      resumoGeral: vazio,
      metricasAtivas: vazio,
      historicoAtivo: [],
      experiencias: [],
      profissionais: [],
    });

    expect(texto).toContain("sem registros diários");
    expect(texto).toContain("Nenhuma experiência teve atividade no período.");
    expect(texto).toContain("Nenhuma leitura de QR Code no período.");
    expect(texto).toContain("Nenhum profissional cadastrado.");
  });
});

