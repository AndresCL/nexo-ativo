import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RodapeEditorial } from "@/componentes/editorial/RodapeEditorial";

describe("Telefones do rodapé editorial", () => {
  it("exibe telefone e celular com links de chamada independentes", () => {
    render(
      <RodapeEditorial
        identidade={{
          nomeExibicao: "Teste",
          telefonePrincipalOpcional: "(11) 3333-4444",
          celularOpcional: "+55 (11) 99999-8888",
        }}
      />,
    );
    expect(screen.getByRole("link", { name: "Ligar para (11) 3333-4444" })).toHaveAttribute(
      "href",
      "tel:1133334444",
    );
    expect(
      screen.getByRole("link", { name: "Ligar para o celular +55 (11) 99999-8888" }),
    ).toHaveAttribute("href", "tel:+5511999998888");
  });

  it("exibe o rodapé quando somente o celular está preenchido", () => {
    render(
      <RodapeEditorial identidade={{ nomeExibicao: "Teste", celularOpcional: "11999998888" }} />,
    );
    expect(
      screen.getByRole("contentinfo", { name: "Informações institucionais e contato" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.queryByText("·")).not.toBeInTheDocument();
  });
});
