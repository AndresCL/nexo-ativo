import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TelaCarregamentoEditorial } from "@/componentes/editorial/TelaCarregamentoEditorial";

describe("TelaCarregamentoEditorial", () => {
  it("deve renderizar o logotipo do cliente e a barra de carregamento infinito de menor largura", () => {
    const { container } = render(
      <TelaCarregamentoEditorial
        urlLogotipo="https://storage.googleapis.com/demo/logo.png"
        nomeCliente="Ateliê Alta Costura"
      />,
    );

    const logo = screen.getByAltText("Marca de Ateliê Alta Costura");
    expect(logo).toBeInTheDocument();

    const barra = container.querySelector('[role="progressbar"]');
    expect(barra).toBeInTheDocument();
    expect(barra?.className).toContain("w-28");
  });

  it("deve exibir o nome do cliente como fallback elegante quando não houver logotipo", () => {
    render(<TelaCarregamentoEditorial nomeCliente="Consultoria Jurídica Alpha" />);

    expect(screen.getByText("Consultoria Jurídica Alpha")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("não deve exibir nenhum elemento placeholder esqueleto vazio quando a logo ou dados ainda não existirem", () => {
    const { container } = render(<TelaCarregamentoEditorial />);

    // Deve exibir apenas a barra discreta centralizada, sem caixas vazias ou pulso
    expect(container.querySelector(".animate-pulse")).toBeNull();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("deve aplicar classe de fade-out suave quando desvanecendo for verdadeiro", () => {
    const { container } = render(
      <TelaCarregamentoEditorial nomeCliente="Ateliê" desvanecendo={true} />,
    );

    const elemento = container.querySelector('[role="status"]');
    expect(elemento?.className).toContain("opacity-0");
    expect(elemento?.className).toContain("pointer-events-none");
  });
});
