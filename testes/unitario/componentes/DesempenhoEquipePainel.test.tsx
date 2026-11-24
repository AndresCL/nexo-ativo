import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type * as Recharts from "recharts";
import { PainelDesempenhoPrincipal } from "@/componentes/painel/desempenho/PainelDesempenhoPrincipal";
import { consolidarResumoMetricas } from "@/dominio/analytics/tiposMetricasAgregadas";
import { criarResumoDireitosPlanoInicial } from "@/dominio/entidades/autenticacaoEOrganizacao";
import { criarEquipeTeste } from "../../fixtures/equipeVitrine";

vi.mock("recharts", async (importarOriginal) => ({
  ...(await importarOriginal<typeof Recharts>()),
  ResponsiveContainer: () => null,
}));

const carlos = { ...criarEquipeTeste(1)[0]!, nomeCompleto: "Carlos Eduardo" };
const resumo = consolidarResumoMetricas([
  {
    dataIso: "2026-11-12",
    visualizacoesVitrine: 0,
    visualizacoesCartao: 2,
    aberturasMicrofluxo: 0,
    conclusoesMicrofluxo: 0,
    cliquesWhatsapp: 6,
    porMicrofluxo: {
      alfa: { titulo: "Experiência Alfa", aberturas: 8, conclusoes: 2, aberturasPermalink: 3 },
      beta: { titulo: "Experiência Beta", aberturas: 2, conclusoes: 1 },
    },
    porCartao: {
      [carlos.id]: { nome: carlos.nomeCompleto, visualizacoes: 2, contatosWhatsapp: 6 },
      "prof-central-garage88": { nome: "prof-central-garage88", cliquesAcoesHome: 2 },
    },
    porProfissional: { [carlos.id]: { nome: carlos.nomeCompleto, contatos: 6, solicitacoes: 0 } },
    atualizadoEmIso: "2026-11-12T12:00:00.000Z",
  },
  {
    dataIso: "2026-11-11",
    visualizacoesVitrine: 1,
    aberturasMicrofluxo: 0,
    conclusoesMicrofluxo: 0,
    cliquesWhatsapp: 0,
    atualizadoEmIso: "2026-11-11T12:00:00.000Z",
  },
]);

function renderizarPainel() {
  render(
    <PainelDesempenhoPrincipal
      organizacao={{
        id: "org-equipe",
        nome: "Equipe de teste",
        identificadorPublico: "equipe-teste",
        segmentoAtividade: "Consultoria",
        situacao: "ativa",
        resumoDireitosPlano: criarResumoDireitosPlanoInicial(),
        criadoEmIso: "2026-11-12T12:00:00.000Z",
        atualizadoEmIso: "2026-11-12T12:00:00.000Z",
      }}
      resumoMetricas={resumo}
      profissionais={[carlos]}
      experiencias={[
        { id: "alfa", titulo: "Experiência Alfa" },
        { id: "beta", titulo: "Experiência Beta" },
      ]}
    />,
  );
}

function abrirAbaEquipe() {
  fireEvent.click(screen.getByRole("tab", { name: "Equipe" }));
  const ranking = screen.getByRole("region", { name: "Performance da Equipe & Cartões VIP" });
  const linhaCarlos = within(ranking).getByRole("row", { name: /Carlos Eduardo/ });
  return { ranking, celulas: within(linhaCarlos).getAllByRole("cell") };
}

describe("Ranking da equipe no painel de desempenho", () => {
  it("mostra estatísticas individuais e zera os fluxos ao filtrar um dia sem aberturas", () => {
    renderizarPainel();
    fireEvent.click(screen.getByRole("tab", { name: "Experiências" }));
    const secao = screen.getByRole("region", { name: "Desempenho por experiência" });
    expect(
      within(secao).getByRole("img", {
        name: "Comparação de Aberturas entre experiências",
      }),
    ).toBeInTheDocument();
    fireEvent.click(within(secao).getByRole("row", { name: /Experiência Alfa/ }));
    expect(
      within(secao).getByRole("img", {
        name: "Comparação de Aberturas entre experiências",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Visão Geral" }));
    fireEvent.click(screen.getByRole("button", { name: "2026-11-11" }));
    fireEvent.click(screen.getByRole("tab", { name: "Experiências" }));
    const secaoFiltrada = screen.getByRole("region", { name: "Desempenho por experiência" });
    expect(within(secaoFiltrada).queryByText("50%")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Aquisição" }));
    expect(screen.getAllByText("Permalink", { exact: true }).length).toBeGreaterThan(0);
  });
  it("exibe os cliques uma vez, usa ações por visita e não inclui uma linha para o identificador interno", () => {
    renderizarPainel();
    const { ranking, celulas } = abrirAbaEquipe();
    expect(celulas[1]).toHaveTextContent(/^2$/);
    expect(celulas[4]).toHaveTextContent(/^6$/);
    expect(celulas[5]).toHaveTextContent(/^3,0$/);
    expect(within(ranking).getByText("Ações por visita")).toBeInTheDocument();
    expect(within(ranking).queryByText("600%")).not.toBeInTheDocument();
    expect(within(ranking).queryByText("prof-central-garage88")).not.toBeInTheDocument();
    expect(within(ranking).getAllByRole("row")).toHaveLength(2);
  });

  it("recalcula o ranking para o dia e o mês selecionados sem reutilizar contatos de outro período", () => {
    renderizarPainel();
    fireEvent.click(screen.getByRole("button", { name: "2026-11-11" }));
    expect(abrirAbaEquipe().celulas[4]).toHaveTextContent(/^0$/);
    expect(abrirAbaEquipe().celulas[5]).toHaveTextContent(/^—$/);

    fireEvent.click(screen.getByRole("tab", { name: "Visão Geral" }));
    fireEvent.click(screen.getByRole("button", { name: "Ver período completo" }));
    expect(abrirAbaEquipe().celulas[4]).toHaveTextContent(/^6$/);

    fireEvent.change(screen.getByLabelText("Filtrar período"), { target: { value: "2026-11" } });
    expect(abrirAbaEquipe().celulas[4]).toHaveTextContent(/^6$/);
    expect(abrirAbaEquipe().celulas[5]).toHaveTextContent(/^3,0$/);
  });
});
