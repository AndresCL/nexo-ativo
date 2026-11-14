import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExecutorMicrofluxoVisitante } from "@/componentes/editorial/ExecutorMicrofluxoVisitante";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import {
  CATALOGO_ACERVOS_DEMONSTRACAO,
  CATALOGO_DEMONSTRACOES_EDITORIAIS,
} from "../../fixtures/dadosExemploVitrine";

describe("Notificações durante uma experiência pública", () => {
  it("mantém validação junto ao formulário e usa o toast para falha de envio, permitindo tentar novamente", async () => {
    const microfluxo: DefinicaoMicrofluxo = {
      id: "pedido",
      organizacaoId: "org-1",
      titulo: "Pedido",
      descricaoCurta: "",
      textoBotaoConclusao: "Enviar pedido",
      mensagemConfirmacaoTitulo: "Pedido recebido",
      mensagemConfirmacaoCorpo: "Entraremos em contato.",
      etapaInicialId: "contato",
      etapas: [
        { id: "contato", tipoEtapa: "coleta_contato", titulo: "Seus dados", obrigatoria: true },
      ],
      ativo: true,
      atualizadoEmIso: new Date().toISOString(),
    };
    const enviarSolicitacaoVisitante = vi
      .fn()
      .mockRejectedValueOnce(new Error("Conexão interrompida. Tente novamente."))
      .mockResolvedValueOnce({ solicitacaoId: "pedido-1", duplicadaIdempotente: false });
    render(
      <ExecutorMicrofluxoVisitante
        aberto
        aoAlterarAbertura={vi.fn()}
        microfluxo={microfluxo}
        pagina={CATALOGO_DEMONSTRACOES_EDITORIAIS["lumina-arquitetura-luz"]!}
        acervo={CATALOGO_ACERVOS_DEMONSTRACAO["lumina-arquitetura-luz"]!}
        servicoSubmissao={{ enviarSolicitacaoVisitante }}
      />,
    );
    const dialogo = screen.getByRole("dialog");
    const central = screen.getByRole("region", { name: "Notificações" });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pedido" }));
    expect(within(dialogo).getByRole("alert")).toBeInTheDocument();
    expect(within(central).queryByRole("alert")).not.toBeInTheDocument();
    expect(enviarSolicitacaoVisitante).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/Seu nome/i), { target: { value: "Ana Souza" } });
    fireEvent.change(screen.getByLabelText(/WhatsApp ou telefone/i), {
      target: { value: "11988887777" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pedido" }));
    expect(await within(central).findByRole("alert")).toHaveTextContent("Conexão interrompida.");
    expect(within(dialogo).queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Seu nome/i)).toHaveValue("Ana Souza");
    expect(screen.queryByTestId("confirmacao-microfluxo-concluido")).not.toBeInTheDocument();

    fireEvent.click(within(central).getByRole("button", { name: "Fechar notificação" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar pedido" }));
    expect(await screen.findByTestId("confirmacao-microfluxo-concluido")).toHaveTextContent(
      "Pedido recebido",
    );
    expect(enviarSolicitacaoVisitante).toHaveBeenCalledTimes(2);
  });
});
