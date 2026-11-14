import { criarMicrofluxoPadraoParaTestes } from "../../fixtures/geradoresMicrofluxoTeste";
import { fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExecutorMicrofluxoVisitante } from "@/componentes/editorial/ExecutorMicrofluxoVisitante";
import { VitrinePublicaInterativa } from "@/componentes/editorial/VitrinePublicaInterativa";
import { construirCaminhoExperiencia } from "@/dominio/microfluxos/conclusaoMicrofluxo";
import { EditorConclusaoMicrofluxo } from "@/componentes/painel/microfluxos/EditorConclusaoMicrofluxo";
import type {
  DefinicaoMicrofluxo,
  AcaoConclusaoMicrofluxo,
} from "@/dominio/microfluxos/tiposMicrofluxo";
import {
  CATALOGO_ACERVOS_DEMONSTRACAO,
  CATALOGO_DEMONSTRACOES_EDITORIAIS,
} from "../../fixtures/dadosExemploVitrine";
const { evento } = vi.hoisted(() => ({
  evento: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/infraestrutura/analytics/servicoTelemetriaAnonima", () => ({
  servicoTelemetriaAnonimaPadrao: { registrarEvento: evento },
}));
const pagina = CATALOGO_DEMONSTRACOES_EDITORIAIS["lumina-arquitetura-luz"]!;
const acervo = CATALOGO_ACERVOS_DEMONSTRACAO["lumina-arquitetura-luz"]!;
const fluxo: DefinicaoMicrofluxo = {
  ...criarMicrofluxoPadraoParaTestes({
    organizacaoId: pagina.organizacaoId,
    nomeOrganizacao: "Lumina",
    modelo: "catalogo",
  }),
  etapaInicialId: "fim",
  etapas: [
    { id: "fim", tipoEtapa: "entrada_curta", titulo: "Sua preferência", obrigatoria: false },
  ],
  regraCalculoComercial: undefined,
  textoBotaoConclusao: "Finalizar percurso",
  mensagemConfirmacaoTitulo: "Resultado",
  mensagemConfirmacaoCorpo: "Obrigado por participar.",
  conclusao: {
    acoes: [],
    resumo: { ativo: false, campos: [], incluirDemonstrativo: false },
    camposWhatsapp: [],
  },
};
function abrir(microfluxo = fluxo, enviarSolicitacaoVisitante = vi.fn()) {
  render(
    <ExecutorMicrofluxoVisitante
      aberto
      aoAlterarAbertura={vi.fn()}
      microfluxo={microfluxo}
      pagina={pagina}
      acervo={acervo}
      servicoSubmissao={{ enviarSolicitacaoVisitante }}
    />,
  );
  return enviarSolicitacaoVisitante;
}
beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState(null, "", "/");
});
describe("Conclusão flexível", () => {
  it.each([0, 1, 2])(
    "conclui sem WhatsApp com %i ações e emite uma conclusão sem registrar solicitação informativa",
    async (quantidade) => {
      const acoes: AcaoConclusaoMicrofluxo[] = [
        { tipo: "home", rotulo: "Voltar à home" },
        { tipo: "url_externa", rotulo: "Site oficial", url: "https://example.com" },
      ].slice(0, quantidade) as AcaoConclusaoMicrofluxo[];
      const enviar = abrir({ ...fluxo, conclusao: { ...fluxo.conclusao!, acoes } });
      fireEvent.click(screen.getByRole("button", { name: "Finalizar percurso" }));
      const final = await screen.findByTestId("confirmacao-microfluxo-concluido");
      expect(within(final).queryAllByRole("link")).toHaveLength(quantidade === 0 ? 1 : quantidade);
      expect(enviar).not.toHaveBeenCalled();
      expect(
        evento.mock.calls.filter(([e]) => e.tipoEvento === "conclusao_microfluxo"),
      ).toHaveLength(1);
      expect(evento.mock.calls.filter(([e]) => e.tipoEvento === "clique_whatsapp")).toHaveLength(0);
    },
  );
  it.each([true, false])("respeita a exibição do resumo: %s", async (ativo) => {
    abrir({
      ...fluxo,
      conclusao: {
        ...fluxo.conclusao!,
        resumo: {
          ativo,
          campos: [{ etapaId: "fim", rotulo: "Preferência" }],
          incluirDemonstrativo: false,
        },
      },
    });
    fireEvent.change(screen.getByPlaceholderText("Compartilhe os detalhes principais..."), {
      target: { value: "Azul" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Finalizar percurso" }));
    await screen.findByTestId("confirmacao-microfluxo-concluido");
    expect(Boolean(screen.queryByTestId("resumo-conclusao-configurado"))).toBe(ativo);
    if (ativo) expect(screen.getByTestId("resumo-conclusao-configurado")).toHaveTextContent("Azul");
  });
  it("aguarda confirmação do backend, bloqueia clique duplo e conclui sem abrir WhatsApp", async () => {
    let confirmar!: (r: { solicitacaoId: string; duplicadaIdempotente: boolean }) => void;
    const enviar = vi.fn(
      () =>
        new Promise<{ solicitacaoId: string; duplicadaIdempotente: boolean }>((resolve) => {
          confirmar = resolve;
        }),
    );
    abrir(
      {
        ...fluxo,
        etapaInicialId: "contato",
        etapas: [
          { id: "contato", tipoEtapa: "coleta_contato", titulo: "Contato", obrigatoria: true },
        ],
      },
      enviar,
    );
    fireEvent.change(screen.getByLabelText(/Seu nome/i), { target: { value: "Ana Souza" } });
    fireEvent.change(screen.getByLabelText(/WhatsApp ou telefone/i), {
      target: { value: "11988887777" },
    });
    const botao = screen.getByRole("button", { name: "Finalizar percurso" });
    fireEvent.click(botao);
    fireEvent.click(botao);
    expect(enviar).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("confirmacao-microfluxo-concluido")).not.toBeInTheDocument();
    confirmar({ solicitacaoId: "protocolo-123", duplicadaIdempotente: false });
    expect(await screen.findByTestId("confirmacao-microfluxo-concluido")).toHaveTextContent(
      "protocolo-123",
    );
    expect(evento.mock.calls.filter(([e]) => e.tipoEvento === "clique_whatsapp")).toHaveLength(0);
  });
  it("abre diretamente a experiência publicada preservando profissional e métricas existentes", async () => {
    const profissional = acervo.profissionais[0]!;
    window.history.replaceState(
      null,
      "",
      `${construirCaminhoExperiencia(pagina.identificadorPublico, fluxo.id).replace("#", `?consultor=${profissional.id}&utm_source=instagram#`)}`,
    );
    render(
      <VitrinePublicaInterativa
        pagina={pagina}
        acervo={{ ...acervo, microfluxos: [fluxo] }}
        duracaoMinimaLoaderMs={0}
      />,
    );
    expect(await screen.findByTestId("executor-microfluxo-visitante")).toHaveClass(
      "bottom-0",
      "sm:w-[28rem]",
    );
    expect(screen.queryByTestId("resumo-contexto-microfluxo")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        evento.mock.calls.filter(([e]) => e.tipoEvento === "abertura_microfluxo"),
      ).toHaveLength(1),
    );
    expect(evento).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoEvento: "abertura_microfluxo",
        profissionalId: profissional.id,
        cartaoProfissionalId: profissional.id,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Fechar experiência" }));
    await waitFor(() =>
      expect(screen.queryByTestId("executor-microfluxo-visitante")).not.toBeInTheDocument(),
    );
    expect(window.location.pathname).toBe(`/${pagina.identificadorPublico}`);
    expect(window.location.hash).toBe("");
    expect(window.location.search).toContain("utm_source=instagram");
  });
  it("separa resumo visível das respostas autorizadas no WhatsApp e só mede o clique real", async () => {
    abrir({
      ...fluxo,
      conclusao: {
        acoes: [{ tipo: "whatsapp", rotulo: "Conversar agora", numeroOpcional: "5511999999999" }],
        resumo: { ativo: true, campos: [{ etapaId: "fim" }], incluirDemonstrativo: false },
        camposWhatsapp: [],
      },
    });
    fireEvent.change(screen.getByPlaceholderText("Compartilhe os detalhes principais..."), {
      target: { value: "Informação reservada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Finalizar percurso" }));
    const final = await screen.findByTestId("confirmacao-microfluxo-concluido");
    expect(final).toHaveTextContent("Informação reservada");
    const link = screen.getByRole("link", { name: "Conversar agora" });
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/5511999999999?text="),
    );
    expect(decodeURIComponent(link.getAttribute("href")!)).not.toContain("Informação reservada");
    expect(evento.mock.calls.filter(([e]) => e.tipoEvento === "clique_whatsapp")).toHaveLength(0);
    fireEvent.click(link);
    expect(evento.mock.calls.filter(([e]) => e.tipoEvento === "clique_whatsapp")).toHaveLength(1);
  });
  it("respeita conclusão sem ações após selecionar profissional, sem abrir WhatsApp automaticamente", async () => {
    const abrirJanela = vi.spyOn(window, "open").mockImplementation(() => null);
    abrir({
      ...fluxo,
      etapaInicialId: "profissional",
      etapas: [
        {
          id: "profissional",
          tipoEtapa: "selecao_profissional",
          titulo: "Escolha",
          obrigatoria: true,
        },
      ],
    });
    fireEvent.click(
      screen.getByRole("button", { name: new RegExp(acervo.profissionais[0]!.nomeCompleto) }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Finalizar percurso/i }));
    const final = await screen.findByTestId("confirmacao-microfluxo-concluido");
    expect(within(final).queryAllByRole("link")).toHaveLength(1);
    expect(abrirJanela).not.toHaveBeenCalled();
  });
  it("permite remover a última ação no editor", () => {
    const alterar = vi.fn();
    render(
      <EditorConclusaoMicrofluxo
        fluxo={{
          ...fluxo,
          conclusao: { ...fluxo.conclusao!, acoes: [{ tipo: "home", rotulo: "Voltar" }] },
        }}
        fluxos={[fluxo]}
        profissionais={[]}
        identificadorPublico={pagina.identificadorPublico}
        podeEditar
        permiteFinanceiro
        aoAlterar={alterar}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remover ação 1" }));
    expect(alterar).toHaveBeenCalledWith(
      expect.objectContaining({ conclusao: expect.objectContaining({ acoes: [] }) }),
    );
  });
});
