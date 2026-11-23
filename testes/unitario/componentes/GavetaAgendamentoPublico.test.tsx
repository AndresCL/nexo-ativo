import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PortaAgendamentoVisitante } from "@/aplicacao/portas/portasAgenda";
import { GavetaAgendamentoPublico } from "@/componentes/editorial/agenda/GavetaAgendamentoPublico";
import { CATALOGO_DEMONSTRACOES_EDITORIAIS } from "../../fixtures/dadosExemploVitrine";

describe("GavetaAgendamentoPublico (Fluxo Mobile/Editorial do Visitante)", () => {
  it("auto-seleciona o primeiro dia disponível, permite reservar horário e exibe confirmação com código", async () => {
    const pagina = CATALOGO_DEMONSTRACOES_EDITORIAIS["lumina-arquitetura-luz"]!;

    const servicoMock: PortaAgendamentoVisitante = {
      consultarDisponibilidade: vi.fn().mockResolvedValue({
        agendaAtiva: true,
        fusoHorario: "America/Sao_Paulo",
        duracaoSlotMinutos: 60,
        anoMes: "2026-11",
        diasDisponiveis: [
          {
            dataIso: "2026-11-25",
            slots: [
              { horarioInicio: "09:00", horarioFim: "10:00", periodo: "manha" },
              { horarioInicio: "14:00", horarioFim: "15:00", periodo: "tarde" },
            ],
          },
        ],
        proximoDiaDisponivelOpcional: "2026-11-25",
      }),
      registrarAgendamento: vi.fn().mockResolvedValue({
        agendamentoId: "agd-teste-1",
        organizacaoId: pagina.organizacaoId,
        codigoConfirmacao: "AGD-9X2K",
        dataIso: "2026-11-25",
        horarioInicio: "14:00",
        horarioFim: "15:00",
        duracaoMinutos: 60,
        fusoHorario: "America/Sao_Paulo",
        duplicadaIdempotente: false,
        emailConfirmacaoEnviado: true,
        criadoEmIso: "2026-11-23T13:00:00.000Z",
      }),
    };

    render(
      <GavetaAgendamentoPublico
        aberto
        aoFechar={vi.fn()}
        pagina={pagina}
        acaoAgenda={{
          id: "acao-fluxo-agenda-1",
          rotulo: "Agendar reunião",
          subtituloDiscreto: "Escolha seu horário",
          tipoDestino: "agenda",
          destino: "#agenda-agenda-1",
          configuracaoAgenda: {
            exigirTelefone: true,
            exibirCampoObservacoes: true,
          },
        }}
        servicoAgendamento={servicoMock}
      />,
    );

    // Aguarda horários carregarem com auto-seleção do dia 25
    const botaoHorario = await screen.findByRole("button", { name: "14:00" });
    fireEvent.click(botaoHorario);

    const botaoContinuar = screen.getByRole("button", { name: /Continuar/i });
    fireEvent.click(botaoContinuar);

    // Preenche dados do visitante
    fireEvent.change(await screen.findByLabelText(/Nome completo/i), {
      target: { value: "Beatriz Souza" },
    });
    fireEvent.change(screen.getByLabelText(/E-mail para confirmação/i), {
      target: { value: "beatriz@exemplo.com" },
    });
    fireEvent.change(screen.getByLabelText(/WhatsApp \/ Telefone/i), {
      target: { value: "(11) 99999-1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Confirmar agendamento/i }));

    await waitFor(() => {
      expect(screen.getByText("AGD-9X2K")).toBeInTheDocument();
      expect(screen.getByText(/beatriz@exemplo.com/i)).toBeInTheDocument();
    });

    expect(servicoMock.registrarAgendamento).toHaveBeenCalledWith(
      expect.objectContaining({
        dataIso: "2026-11-25",
        horarioInicio: "14:00",
        nomeVisitante: "Beatriz Souza",
        emailVisitante: "beatriz@exemplo.com",
      }),
    );
  });
});

