import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ValidadorEnderecoPublico } from "@/componentes/interface/ValidadorEnderecoPublico";

describe("ValidadorEnderecoPublico", () => {
  it("deve exibir erro acessível quando o usuário informa um endereço reservado como painel", async () => {
    const usuario = userEvent.setup();
    render(<ValidadorEnderecoPublico />);

    const campoNome = screen.getByLabelText(/Nome da atuação ou empresa/i);
    const campoEndereco = screen.getByLabelText(/Endereço público desejado/i);

    await usuario.type(campoNome, "Meu Escritório");
    await usuario.clear(campoEndereco);
    await usuario.type(campoEndereco, "painel");
    await usuario.click(screen.getByRole("button", { name: /Verificar formato do endereço/i }));

    const alerta = await screen.findByRole("alert");
    expect(alerta).toHaveTextContent(/reservado pela plataforma/i);
    expect(campoEndereco).toHaveAttribute("aria-invalid", "true");
  });

  it("deve sugerir o endereço normalizado ao sair do campo nome e validar com sucesso", async () => {
    const usuario = userEvent.setup();
    const aoValidar = vi.fn();
    render(<ValidadorEnderecoPublico aoValidarComSucesso={aoValidar} />);

    const campoNome = screen.getByLabelText(/Nome da atuação ou empresa/i);
    await usuario.type(campoNome, "Estúdio São Bento");
    await usuario.tab();

    const campoEndereco = screen.getByLabelText(/Endereço público desejado/i);
    expect(campoEndereco).toHaveValue("estudio-sao-bento");

    await usuario.click(screen.getByRole("button", { name: /Verificar formato do endereço/i }));

    expect(await screen.findByRole("status")).toHaveTextContent("fluxo.app/estudio-sao-bento");
    expect(aoValidar).toHaveBeenCalledWith({
      nomeOrganizacao: "Estúdio São Bento",
      identificadorPublico: "estudio-sao-bento",
    });
  });
});
