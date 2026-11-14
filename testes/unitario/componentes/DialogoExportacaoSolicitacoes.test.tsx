import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SolicitacaoComercial } from "@/dominio/entidades/solicitacaoComercial";
import { DialogoExportacaoSolicitacoes } from "@/componentes/painel/solicitacoes/DialogoExportacaoSolicitacoes";
import * as moduloDownload from "@/infraestrutura/exportacao/baixarArquivoNavegador";

describe("DialogoExportacaoSolicitacoes", () => {
  const solicitacoesExemplo: readonly SolicitacaoComercial[] = [
    {
      id: "sol-1",
      organizacaoId: "org-1",
      identificadorPublicoOrganizacao: "garage88",
      microfluxoId: "fluxo-financiamento",
      tituloExperiencia: "Simulação de Financiamento",
      versaoMicrofluxo: 1,
      nomeVisitante: "Pedro",
      telefoneOuWhatsapp: "22887665443",
      situacao: "nova",
      chaveIdempotencia: "chave-1",
      criadoEmIso: "2026-11-14T10:00:00.000Z",
      atualizadoEmIso: "2026-11-14T10:00:00.000Z",
      respostasRegistradas: [
        {
          etapaId: "etapa-veiculo",
          pergunta: "Categoria do veículo",
          respostaTexto: "Sedã",
        },
      ],
    },
    {
      id: "sol-2",
      organizacaoId: "org-1",
      identificadorPublicoOrganizacao: "garage88",
      microfluxoId: "fluxo-testdrive",
      tituloExperiencia: "Agendar Test Drive",
      versaoMicrofluxo: 1,
      nomeVisitante: "Mariana",
      telefoneOuWhatsapp: "11999998888",
      situacao: "nova",
      chaveIdempotencia: "chave-2",
      criadoEmIso: "2026-11-14T11:00:00.000Z",
      atualizadoEmIso: "2026-11-14T11:00:00.000Z",
      respostasRegistradas: [],
    },
  ];

  it("renderiza opções de formato e microfluxos quando aberto", () => {
    render(
      <DialogoExportacaoSolicitacoes
        aberto={true}
        aoMudarAberto={vi.fn()}
        solicitacoes={solicitacoesExemplo}
        nomeOrganizacao="Garage 88"
        exibirArquivadasAtualmente={false}
      />,
    );

    expect(screen.getByText("Exportar Solicitações")).toBeInTheDocument();
    expect(screen.getByText("Excel (.xls)")).toBeInTheDocument();
    expect(screen.getByText("CSV (Por Fluxo)")).toBeInTheDocument();
    expect(screen.getByLabelText(/Experiência \/ Microfluxo/i)).toBeInTheDocument();
    expect(screen.getByText(/Todas as experiências \(com abas separadas por fluxo\)/i)).toBeInTheDocument();
  });

  it("ao alternar para CSV, exige fluxo específico e remove a opção 'todas'", () => {
    render(
      <DialogoExportacaoSolicitacoes
        aberto={true}
        aoMudarAberto={vi.fn()}
        solicitacoes={solicitacoesExemplo}
        nomeOrganizacao="Garage 88"
        exibirArquivadasAtualmente={false}
      />,
    );

    const botaoCsv = screen.getByText("CSV (Por Fluxo)");
    fireEvent.click(botaoCsv);

    expect(screen.queryByText(/Todas as experiências \(com abas separadas por fluxo\)/i)).not.toBeInTheDocument();
    expect(screen.getByText(/No CSV, exportamos um fluxo por vez para evitar misturar colunas/i)).toBeInTheDocument();
  });

  it("baixa Excel com múltiplas abas quando 'todas' está selecionado", () => {
    const spyDownload = vi.spyOn(moduloDownload, "baixarArquivoNavegador").mockImplementation(() => {});
    const mockAoMudarAberto = vi.fn();

    render(
      <DialogoExportacaoSolicitacoes
        aberto={true}
        aoMudarAberto={mockAoMudarAberto}
        solicitacoes={solicitacoesExemplo}
        nomeOrganizacao="Garage 88"
        exibirArquivadasAtualmente={false}
      />,
    );

    const botaoBaixar = screen.getByRole("button", { name: /Baixar Excel/i });
    fireEvent.click(botaoBaixar);

    expect(spyDownload).toHaveBeenCalledTimes(1);
    expect(spyDownload).toHaveBeenCalledWith(
      expect.objectContaining({
        nomeArquivo: expect.stringMatching(/garage-88-todas-solicitacoes-.*\.xls/),
        tipoMime: "application/vnd.ms-excel",
      }),
    );
    expect(mockAoMudarAberto).toHaveBeenCalledWith(false);

    spyDownload.mockRestore();
  });
});
