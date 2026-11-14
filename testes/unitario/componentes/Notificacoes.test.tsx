import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import { copiarTextoComAviso } from "@/componentes/interface/notificacoes/copiarTextoComAviso";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Central de notificações do app", () => {
  it("usa o mesmo local para sucesso, erro e informação, fora do conteúdo da tela", () => {
    const tela = render(<main>Conteúdo da página</main>);
    act(() => {
      notificar.sucesso("Atualizações publicadas.");
      notificar.erro("Não foi possível salvar.");
      notificar.informacao("Exclusão pendente de publicação.");
    });
    const central = screen.getByRole("region", { name: "Notificações" });
    expect(central.parentElement).toBe(document.body);
    expect(within(central).getAllByRole("status")).toHaveLength(2);
    expect(within(central).getByRole("alert")).toHaveTextContent("Não foi possível salvar.");
    expect(tela.container).not.toContainElement(central);
  });

  it("limita a pilha a três avisos e evita mensagens repetidas", () => {
    act(() => {
      notificar.sucesso("Primeiro");
      const id = notificar.sucesso("Segundo");
      expect(notificar.sucesso("Segundo")).toBe(id);
      notificar.informacao("Terceiro");
      notificar.aviso("Quarto");
    });
    expect(screen.queryByText("Primeiro")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Fechar notificação" })).toHaveLength(3);
    expect(screen.getByRole("alert")).toHaveTextContent("Quarto");
  });

  it("permite fechar apenas a mensagem escolhida", () => {
    act(() => {
      notificar.sucesso("Rascunho salvo.");
      notificar.erro("Falha de publicação.");
    });
    fireEvent.click(
      within(screen.getByRole("alert")).getByRole("button", { name: "Fechar notificação" }),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Rascunho salvo.");
  });

  it("remove sucessos em seis segundos e mantém erros por dez segundos", () => {
    vi.useFakeTimers();
    act(() => {
      notificar.sucesso("Salvo.");
      notificar.erro("Erro de conexão.");
    });
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Fechar notificação" })).not.toBeInTheDocument();
  });

  it.each(["ponteiro", "teclado"])(
    "pausa a expiração durante interação por %s e retoma o tempo restante",
    (interacao) => {
      vi.useFakeTimers();
      act(() => notificar.sucesso("Mensagem para ler."));
      const toast = screen.getByRole("status");
      const fechar = within(toast).getByRole("button");
      act(() => vi.advanceTimersByTime(2000));
      if (interacao === "ponteiro") fireEvent.pointerEnter(toast);
      else fireEvent.focus(fechar);
      act(() => vi.advanceTimersByTime(20000));
      expect(toast).toBeInTheDocument();
      if (interacao === "ponteiro") fireEvent.pointerLeave(toast);
      else fireEvent.blur(fechar, { relatedTarget: document.body });
      act(() => vi.advanceTimersByTime(3999));
      expect(toast).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(1));
      expect(toast).not.toBeInTheDocument();
    },
  );

  it("preserva o aviso ao trocar o conteúdo da rota", () => {
    const tela = render(<main>Rota inicial</main>);
    act(() => notificar.sucesso("Conta criada."));
    tela.rerender(<main>Próxima rota</main>);
    expect(screen.getByRole("status")).toHaveTextContent("Conta criada.");
  });
});

describe("Cópia de texto com notificação compartilhada", () => {
  it("confirma somente depois que a cópia termina", async () => {
    let concluir!: () => void;
    const writeText = vi.fn(
      () =>
        new Promise<void>((resolver) => {
          concluir = resolver;
        }),
    );
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const pendente = copiarTextoComAviso("https://exemplo.com");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await act(async () => {
      concluir();
      await pendente;
    });
    expect(writeText).toHaveBeenCalledWith("https://exemplo.com");
    expect(screen.getByRole("status")).toHaveTextContent("Link copiado.");
  });

  it.each([true, false])(
    "informa a falha quando a cópia falha ou não é suportada (%s)",
    async (suportado) => {
      vi.stubGlobal(
        "navigator",
        suportado
          ? { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("Bloqueado")) } }
          : {},
      );
      await act(async () => {
        expect(await copiarTextoComAviso("chave", "Chave copiada.")).toBe(false);
      });
      expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível copiar.");
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    },
  );
});
