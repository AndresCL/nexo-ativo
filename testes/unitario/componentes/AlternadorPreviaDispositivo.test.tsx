import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AlternadorPreviaDispositivo } from "@/componentes/editorial/AlternadorPreviaDispositivo";
import { servicoTelemetriaAnonimaPadrao } from "@/infraestrutura/analytics/servicoTelemetriaAnonima";
import { servicoSubmissaoSolicitacaoVisitantePadrao } from "@/infraestrutura/vitrine/servicoSubmissaoSolicitacaoVisitante";
import {
  buscarAcervoDemonstracaoPorSlug,
  CATALOGO_DEMONSTRACOES_EDITORIAIS,
} from "../../fixtures/dadosExemploVitrine";

vi.mock("@/ganchos/usarPreferenciaMovimentoReduzido", () => ({
  usePreferenciaMovimentoReduzido: () => true,
}));

describe("AlternadorPreviaDispositivo — Isolamento da prévia funcional", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("permite percorrer e concluir microfluxo na prévia sem registrar telemetria nem gravar lead real", async () => {
    const spyTelemetria = vi
      .spyOn(servicoTelemetriaAnonimaPadrao, "registrarEvento")
      .mockResolvedValue(undefined);
    const spySubmissaoReal = vi
      .spyOn(servicoSubmissaoSolicitacaoVisitantePadrao, "enviarSolicitacaoVisitante")
      .mockResolvedValue({
        solicitacaoId: "nao-deveria-ser-chamado",
        duplicadaIdempotente: false,
      });

    const pagina = CATALOGO_DEMONSTRACOES_EDITORIAIS["lumina-arquitetura-luz"]!;
    const acervo = buscarAcervoDemonstracaoPorSlug("lumina-arquitetura-luz");
    const urlInicial = window.location.href;

    render(
      <AlternadorPreviaDispositivo
        aparencia="clara"
        paginaBase={pagina}
        acervo={acervo}
        exibirAvaliacoesGoogle={false}
      />,
    );

    const moldura = screen.getByTestId("quadro-previa-dispositivo");

    // 1. Abre o microfluxo a partir da home na prévia
    fireEvent.click(screen.getByRole("button", { name: /Explorar peças e ambientes/i }));

    const executor = screen.getByTestId("executor-microfluxo-visitante");
    expect(executor).toBeInTheDocument();
    // Garante que o Portal foi montado DENTRO da moldura do celular
    expect(moldura.contains(executor)).toBe(true);

    // 2. Seleciona um produto e avança para a etapa de contato
    fireEvent.click(
      screen.getByRole("button", { name: /Pendente Linear Slim Latão Escovado 2700K/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));

    // 3. Preenche contato e conclui o microfluxo
    fireEvent.change(screen.getByLabelText(/Seu nome/i), {
      target: { value: "Teste Prévia" },
    });
    fireEvent.change(screen.getByLabelText(/WhatsApp ou telefone/i), {
      target: { value: "11999990000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Solicitar informações sobre este item/i }));

    // Confirma que a experiência concluiu normalmente na UI da prévia
    expect(await screen.findByTestId("confirmacao-microfluxo-concluido")).toBeInTheDocument();

    // Garante isolamento total: 0 eventos de estatística, 0 leads reais gravados e URL intacta
    expect(spyTelemetria).not.toHaveBeenCalled();
    expect(spySubmissaoReal).not.toHaveBeenCalled();
    expect(window.location.href).toBe(urlInicial);
  }, 15000);

  it("permite abrir gaveta de equipe e cartão digital na prévia sem registrar visualizações nem alterar URL", () => {
    const spyTelemetria = vi
      .spyOn(servicoTelemetriaAnonimaPadrao, "registrarEvento")
      .mockResolvedValue(undefined);
    const spyPushState = vi.spyOn(window.history, "pushState");

    const pagina = CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!;
    const acervo = buscarAcervoDemonstracaoPorSlug("garage-88");
    const primeiroProfissional = acervo.profissionais[0]!;

    render(
      <AlternadorPreviaDispositivo
        aparencia="clara"
        paginaBase={pagina}
        acervo={acervo}
        exibirAvaliacoesGoogle={false}
      />,
    );

    const moldura = screen.getByTestId("quadro-previa-dispositivo");

    // Abre a gaveta de equipe
    const botaoEquipe = screen.getByRole("button", { name: /Falar com consultor no WhatsApp/i });
    fireEvent.click(botaoEquipe);

    // Abre o cartão digital do primeiro profissional
    const botaoCartao = screen.getAllByRole("button", {
      name: new RegExp(primeiroProfissional.nomeCompleto, "i"),
    })[0]!;
    fireEvent.click(botaoCartao);

    // Garante que o cartão está renderizado dentro da moldura
    expect(moldura.textContent).toContain(primeiroProfissional.nomeCompleto);

    // Zero telemetria e zero mutação de history.pushState
    expect(spyTelemetria).not.toHaveBeenCalled();
    expect(spyPushState).not.toHaveBeenCalled();
  });
});
