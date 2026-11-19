import { describe, expect, it } from "vitest";
import type { SolicitacaoComercial } from "@/dominio/entidades/solicitacaoComercial";
import { gerarMatrizExportacaoSolicitacoes } from "@/dominio/solicitacoes/exportacao/geradorMatrizExportacaoSolicitacoes";
import { serializarMatrizParaCsv } from "@/infraestrutura/exportacao/serializadorCsv";

describe("gerarMatrizExportacaoSolicitacoes", () => {
  const solicitacaoFinanciamento: SolicitacaoComercial = {
    id: "sol-1",
    organizacaoId: "org-garage88",
    identificadorPublicoOrganizacao: "garage88",
    microfluxoId: "fluxo-financiamento",
    tituloExperiencia: "Simular financiamento com taxa 1,19%!",
    versaoMicrofluxo: 24,
    nomeVisitante: "Pedro",
    telefoneOuWhatsapp: "22887665443",
    emailVisitante: "pedro@exemplo.com",
    respostasRegistradas: [
      {
        etapaId: "etapa-vantagens",
        pergunta: "Vantagens da sua simulação",
        respostaTexto: "Taxa a partir de 1,19% a.m.",
      },
      {
        etapaId: "etapa-categoria",
        pergunta: "Categoria do veículo",
        respostaTexto: "Sedã (Corolla, Civic, Cronos, Onix Plus)",
      },
    ],
    situacao: "nova",
    chaveIdempotencia: "chave-1",
    criadoEmIso: "2026-11-14T10:00:00.000Z",
    atualizadoEmIso: "2026-11-14T10:00:00.000Z",
  };

  const solicitacaoTestDrive: SolicitacaoComercial = {
    id: "sol-2",
    organizacaoId: "org-garage88",
    identificadorPublicoOrganizacao: "garage88",
    microfluxoId: "fluxo-testdrive",
    tituloExperiencia: "Agendar Test Drive",
    versaoMicrofluxo: 5,
    nomeVisitante: "Mariana",
    telefoneOuWhatsapp: "11988887777",
    respostasRegistradas: [
      {
        etapaId: "etapa-data",
        pergunta: "Data preferencial",
        respostaTexto: "20/11/2026 às 14:00",
      },
    ],
    situacao: "desqualificada",
    chaveIdempotencia: "chave-2",
    criadoEmIso: "2026-11-14T11:00:00.000Z",
    atualizadoEmIso: "2026-11-14T11:00:00.000Z",
  };

  it("elimina colunas não preenchidas (ex.: Especialista, Item de interesse, Valor histórico)", () => {
    const matriz = gerarMatrizExportacaoSolicitacoes([solicitacaoFinanciamento]);

    expect(matriz.cabecalhos).toContain("Protocolo");
    expect(matriz.cabecalhos).toContain("Nome do visitante");
    expect(matriz.cabecalhos).toContain("Telefone / WhatsApp");
    expect(matriz.cabecalhos).toContain("E-mail");

    // Nenhum lead tinha especialista, item de catálogo ou valor histórico, logo essas colunas NÃO devem existir
    expect(matriz.cabecalhos).not.toContain("Especialista");
    expect(matriz.cabecalhos).not.toContain("Item de interesse");
    expect(matriz.cabecalhos).not.toContain("Valor histórico");
    expect(matriz.cabecalhos).not.toContain("Mensagem adicional");
  });

  it("permite filtrar estritamente por microfluxo, isolando as perguntas daquele fluxo", () => {
    const matriz = gerarMatrizExportacaoSolicitacoes(
      [solicitacaoFinanciamento, solicitacaoTestDrive],
      {
        escopo: "todas",
        filtroMicrofluxoId: "fluxo-financiamento",
      },
    );

    expect(matriz.linhas).toHaveLength(1);
    expect(matriz.linhas[0]?.[0]).toBe("sol-1");
    expect(matriz.cabecalhos).toContain("Vantagens da sua simulação");
    expect(matriz.cabecalhos).toContain("Categoria do veículo");
    expect(matriz.cabecalhos).not.toContain("Data preferencial");
  });

  it("suporta consolidar respostas em coluna única quando exportando visão global", () => {
    const matriz = gerarMatrizExportacaoSolicitacoes(
      [solicitacaoFinanciamento, solicitacaoTestDrive],
      {
        escopo: "todas",
        consolidarRespostasEmColunaUnica: true,
      },
    );

    expect(matriz.linhas).toHaveLength(2);
    expect(matriz.cabecalhos).toContain("Respostas do Microfluxo");
    expect(matriz.cabecalhos).not.toContain("Vantagens da sua simulação");

    const idxRespostas = matriz.cabecalhos.indexOf("Respostas do Microfluxo");
    expect(matriz.linhas[0]?.[idxRespostas]).toContain("Taxa a partir de 1,19% a.m.");
    expect(matriz.linhas[1]?.[idxRespostas]).toContain("20/11/2026 às 14:00");
  });

  it("serializa para CSV com delimitador ';' e BOM UTF-8", () => {
    const matriz = gerarMatrizExportacaoSolicitacoes([solicitacaoFinanciamento]);
    const csv = serializarMatrizParaCsv(matriz);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("Protocolo;Data de envio;Situação;Nome do visitante");
    expect(csv).toContain("sol-1");
    expect(csv).toContain("Pedro");
  });
});
