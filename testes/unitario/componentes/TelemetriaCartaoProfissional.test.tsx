import { fireEvent, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";
import { CartaoDigitalProfissionalPublico } from "@/componentes/editorial/CartaoDigitalProfissionalPublico";
import { servicoTelemetriaAnonimaPadrao } from "@/infraestrutura/analytics/servicoTelemetriaAnonima";
import {
  CATALOGO_ACERVOS_DEMONSTRACAO,
  CATALOGO_DEMONSTRACOES_EDITORIAIS,
} from "../../fixtures/dadosExemploVitrine";

vi.mock("@/ganchos/usarPreferenciaMovimentoReduzido", () => ({
  usePreferenciaMovimentoReduzido: () => false,
}));

describe("Telemetria do WhatsApp do cartão profissional", () => {
  it("registra uma visita em StrictMode e continua contando a abertura de outro cartão", () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    const registrar = vi
      .spyOn(servicoTelemetriaAnonimaPadrao, "registrarEvento")
      .mockResolvedValue(undefined);
    const pagina = CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!;
    const acervo = CATALOGO_ACERVOS_DEMONSTRACAO["garage-88"]!;
    const montar = (indice: number) => (
      <StrictMode>
        <CartaoDigitalProfissionalPublico
          paginaOrganizacao={pagina}
          profissional={acervo.profissionais[indice]!}
          acervo={acervo}
          urlPublicaCartao="http://localhost:3000/garage-88/equipe/teste"
        />
      </StrictMode>
    );
    const { rerender } = render(montar(0));
    expect(
      registrar.mock.calls.filter(([evento]) => evento.tipoEvento === "visualizacao_cartao"),
    ).toHaveLength(1);
    rerender(montar(1));
    const visitas = registrar.mock.calls.filter(
      ([evento]) => evento.tipoEvento === "visualizacao_cartao",
    );
    expect(visitas).toHaveLength(2);
    expect(visitas.map(([evento]) => evento.cartaoProfissionalId)).toEqual([
      acervo.profissionais[0]!.id,
      acervo.profissionais[1]!.id,
    ]);
  });

  it("envia um único evento para cada clique no WhatsApp de Carlos Eduardo", () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    const registrar = vi
      .spyOn(servicoTelemetriaAnonimaPadrao, "registrarEvento")
      .mockResolvedValue(undefined);
    const pagina = CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!;
    const acervo = CATALOGO_ACERVOS_DEMONSTRACAO["garage-88"]!;
    const carlos = acervo.profissionais.find(
      (profissional) => profissional.identificadorCartao === "carlos-eduardo",
    )!;
    render(
      <CartaoDigitalProfissionalPublico
        paginaOrganizacao={pagina}
        profissional={carlos}
        acervo={acervo}
        urlPublicaCartao="http://localhost:3000/garage-88/equipe/carlos-eduardo"
      />,
    );
    const link = screen.getByRole("link", { name: /Falar comigo no WhatsApp.*Carlos Eduardo/ });
    link.addEventListener("click", (evento) => evento.preventDefault());
    registrar.mockClear();
    fireEvent.click(link);
    expect(registrar).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        tipoEvento: "clique_whatsapp",
        cartaoProfissionalId: carlos.id,
        profissionalId: carlos.id,
      }),
    );
    fireEvent.click(link);
    expect(registrar).toHaveBeenCalledTimes(2);
  });
});
