import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AcoesPublicacaoPagina } from "@/componentes/painel/AcoesPublicacaoPagina";
import { usePublicacaoPagina } from "@/ganchos/usePublicacaoPagina";

function montar({
  salvar = vi.fn().mockResolvedValue(undefined),
  publicar = vi.fn().mockResolvedValue({ versaoPublicada: 2 }),
  permitido = true,
  validar = vi.fn(),
} = {}) {
  function Tela() {
    const [alterado, setAlterado] = useState(true);
    const controle = usePublicacaoPagina({
      versaoPublicadaInicial: 1,
      podeSalvarRascunho: permitido,
      podePublicarPagina: permitido,
      haAlteracoesNaoSalvas: alterado,
      salvarRascunho: async () => {
        await salvar();
        setAlterado(false);
      },
      publicarPagina: publicar,
      validarPublicacao: validar,
    });
    return (
      <AcoesPublicacaoPagina
        controle={controle}
        identificadorPublico="garage-88"
        exibirSalvarRascunho
      />
    );
  }
  render(<Tela />);
  return { salvar, publicar };
}

describe("Ações compartilhadas de publicação", () => {
  it("salva o rascunho sem publicar e depois publica sem salvar duas vezes", async () => {
    const { salvar, publicar } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    expect(await screen.findByText("Rascunho salvo · publicação pendente")).toBeInTheDocument();
    expect(publicar).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    await waitFor(() => expect(publicar).toHaveBeenCalledTimes(1));
    expect(salvar).toHaveBeenCalledTimes(1);
  });

  it("publica em um clique salvando antes e bloqueia ações concorrentes", async () => {
    let concluir!: () => void;
    const salvar = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          concluir = resolve;
        }),
    );
    const { publicar } = montar({ salvar });
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    expect(screen.getByRole("button", { name: "Salvando e publicando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeDisabled();
    expect(publicar).not.toHaveBeenCalled();
    concluir();
    expect(await screen.findByText("Página publicada")).toBeInTheDocument();
    expect(salvar.mock.invocationCallOrder[0]).toBeLessThan(publicar.mock.invocationCallOrder[0]!);
  });

  it("impede publicar quando o salvamento falha e mantém o rascunho pendente", async () => {
    const salvar = vi.fn().mockRejectedValue(new Error("Falha ao salvar"));
    const { publicar } = montar({ salvar });
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao salvar");
    expect(publicar).not.toHaveBeenCalled();
    expect(screen.getByText("Alterações não salvas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeEnabled();
  });

  it("preserva o rascunho salvo se publicar falhar e permite tentar de novo", async () => {
    const publicar = vi
      .fn()
      .mockRejectedValueOnce(new Error("Falha ao publicar"))
      .mockResolvedValue({ versaoPublicada: 2 });
    const { salvar } = montar({ publicar });
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao publicar");
    expect(screen.getByText("Rascunho salvo · publicação pendente")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    expect(await screen.findByText("Página publicada")).toBeInTheDocument();
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(publicar).toHaveBeenCalledTimes(2);
  });

  it("valida antes de salvar ou publicar", async () => {
    const { salvar, publicar } = montar({
      validar: vi.fn().mockImplementation(() => {
        throw new Error("Revise as conexões");
      }),
    });
    fireEvent.click(screen.getByRole("button", { name: "Publicar página" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Revise as conexões");
    expect(salvar).not.toHaveBeenCalled();
    expect(publicar).not.toHaveBeenCalled();
  });

  it("respeita as permissões de salvar e publicar", () => {
    montar({ permitido: false });
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Publicar página" })).toBeDisabled();
  });
});
