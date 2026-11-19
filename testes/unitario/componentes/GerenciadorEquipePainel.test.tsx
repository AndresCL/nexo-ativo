import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import { criarResumoDireitosPlanoInicial } from "@/dominio/entidades/autenticacaoEOrganizacao";
import { GerenciadorEquipePainel } from "@/componentes/painel/catalogo/GerenciadorEquipePainel";

const profissional: ProfissionalEquipe = {
  id: "ana",
  organizacaoId: "garage-88",
  identificadorCartao: "ana-silva",
  nomeCompleto: "Ana Silva",
  cargoOuEspecialidade: "Consultora comercial",
  minibiografia: "Especialista em veículos premium",
  urlFotoPerfil: "/midias-demonstracao/retrato-editorial-estudio.svg",
  pontoFocalFoto: { xPercentual: 40, yPercentual: 26 },
  emailContatoOpcional: "ana@exemplo.com.br",
  aceitaSolicitacoesDiretas: true,
  ordemExibicao: 1,
  ativo: true,
  atualizadoEmIso: "2026-11-13T12:00:00Z",
};

function montar(opcoes: { editar?: boolean; falharExclusao?: boolean } = {}) {
  const salvarProfissional = vi.fn().mockResolvedValue(undefined);
  const excluirProfissional = opcoes.falharExclusao
    ? vi.fn().mockRejectedValue(new Error("Falha ao excluir"))
    : vi.fn().mockResolvedValue(undefined);
  const servicoDuble: ServicoCatalogoConteudoPorta = {
    salvarProfissional,
    excluirProfissional,
    publicarPagina: vi.fn(),
    salvarProduto: vi.fn(),
    salvarServico: vi.fn(),
    salvarProjetoPortfolio: vi.fn(),
    salvarMicrofluxo: vi.fn(),
    salvarRascunhoExperiencias: vi.fn(),
    enviarMidia: vi.fn(),
  };
  render(
    <GerenciadorEquipePainel
      organizacaoId="garage-88"
      identificadorPublico="garage-88"
      urlBasePublica="https://fluxo.app"
      resumoDireitosPlano={{ ...criarResumoDireitosPlanoInicial(), limiteProfissionaisAtivos: 10 }}
      profissionaisIniciais={[
        profissional,
        {
          ...profissional,
          id: "bruno",
          identificadorCartao: "bruno-silva",
          nomeCompleto: "Bruno Silva",
          cargoOuEspecialidade: "Mecânico",
          ativo: false,
        },
      ]}
      versaoPublicadaInicial={1}
      podeEditarConteudo={opcoes.editar ?? true}
      podePublicarPagina={opcoes.editar ?? true}
      servicoCatalogo={servicoDuble}
    />,
  );
  return { salvarProfissional, excluirProfissional };
}

describe("Equipe do painel", () => {
  it("combina busca por especialidade e visibilidade e permite limpar filtros", () => {
    montar();
    const lista = () => screen.getByRole("list", { name: "Lista de profissionais" });
    expect(within(lista()).getAllByRole("listitem")).toHaveLength(2);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "mecânico" } });
    expect(within(lista()).getByText("Bruno Silva")).toBeInTheDocument();
    expect(within(lista()).queryByText("Ana Silva")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Filtrar visibilidade"), {
      target: { value: "ativos" },
    });
    expect(screen.getByText("Nenhum profissional encontrado")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(within(lista()).getAllByRole("listitem")).toHaveLength(2);
  });

  it("edita com foco no nome e preserva contatos, retrato e ponto focal", async () => {
    const { salvarProfissional } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Editar Ana Silva" }));
    const nome = screen.getByLabelText(/Nome completo/);
    expect(nome).toHaveFocus();
    fireEvent.change(nome, { target: { value: "Ana Silva Costa" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar cartão digital" }));
    await waitFor(() =>
      expect(salvarProfissional).toHaveBeenCalledWith(
        expect.objectContaining({
          id: profissional.id,
          nomeCompleto: "Ana Silva Costa",
          identificadorCartao: "ana-silva",
          pontoFocalFoto: profissional.pontoFocalFoto,
          urlFotoPerfil: profissional.urlFotoPerfil,
          emailContatoOpcional: profissional.emailContatoOpcional,
        }),
      ),
    );
    expect(
      await screen.findByRole("button", { name: "Editar Ana Silva Costa" }),
    ).toBeInTheDocument();
  });

  it("permite consultar QR Codes sem permissão de edição e usa iniciais se a foto falha", () => {
    montar({ editar: false });
    expect(screen.getByRole("button", { name: "Editar Ana Silva" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Desativar Ana Silva" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Excluir Ana Silva" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cadastrar profissional" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Publicar página" })).toBeDisabled();
    fireEvent.error(screen.getByAltText("Retrato de Ana Silva"));
    expect(screen.getByLabelText("Iniciais de Ana Silva")).toHaveTextContent("AS");
    const qr = screen.getByRole("button", { name: "QR Code de Ana Silva" });
    fireEvent.click(qr);
    expect(qr).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByAltText("QR Code de acesso a Ana Silva")).toBeInTheDocument();
    expect(screen.getByText("https://fluxo.app/garage-88/equipe/ana-silva")).toBeInTheDocument();
  });

  it("conserva o perfil e permite tentar novamente se a exclusão confirmada falhar", async () => {
    const { excluirProfissional } = montar({ falharExclusao: true });
    fireEvent.click(screen.getByRole("button", { name: "Excluir Ana Silva" }));
    expect(excluirProfissional).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Sim, excluir" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao excluir");
    expect(screen.getByRole("button", { name: "Editar Ana Silva" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Sim, excluir" })).toBeEnabled();
  });
  it("salva todos os campos do cartão, contatos e permissão de atendimento", async () => {
    const { salvarProfissional } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Editar Ana Silva" }));
    fireEvent.change(screen.getByLabelText(/WhatsApp individual .*código do país/), {
      target: { value: "55" },
    });
    for (const [rotulo, valor] of [
      [/Nome completo/, "Ana Costa"],
      [/Endereço do cartão digital/, "ana-costa"],
      [/Cargo ou especialidade/, "Consultora sênior"],
      [/Registro profissional/, "REG 123"],
      [/Apresentação editorial/, "Especialista em atendimento consultivo"],
      [/Retrato editorial/, "https://example.com/ana.webp"],
      [/E-mail de contato/, "ana.costa@exemplo.com.br"],
      [/^WhatsApp individual \(opcional\)$/, "11987654321"],
      [/LinkedIn/, "https://linkedin.com/in/ana-costa"],
      [/Instagram/, "https://instagram.com/ana-costa"],
    ] as const)
      fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
    fireEvent.click(screen.getByText("Ajustar enquadramento do retrato"));
    fireEvent.change(screen.getByLabelText(/Posição horizontal \(X\)/), {
      target: { value: "55" },
    });
    fireEvent.change(screen.getByLabelText(/Posição vertical \(Y\)/), { target: { value: "20" } });
    fireEvent.click(
      screen.getByLabelText("Permitir início de atendimento direto pelo cartão digital"),
    );
    fireEvent.click(
      screen.getByLabelText(
        "Exibir acordeão com links e experiências da vitrine no cartão digital",
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Salvar cartão digital" }));
    await waitFor(() => expect(salvarProfissional).toHaveBeenCalledTimes(1));
    expect(salvarProfissional.mock.calls[0]?.[0]).toEqual({
      ...profissional,
      nomeCompleto: "Ana Costa",
      identificadorCartao: "ana-costa",
      cargoOuEspecialidade: "Consultora sênior",
      registroProfissionalOpcional: "REG 123",
      minibiografia: "Especialista em atendimento consultivo",
      urlFotoPerfil: "https://example.com/ana.webp",
      pontoFocalFoto: { xPercentual: 55, yPercentual: 20 },
      emailContatoOpcional: "ana.costa@exemplo.com.br",
      whatsappOpcional: "+5511987654321",
      linkedinOpcional: "https://linkedin.com/in/ana-costa",
      instagramOpcional: "https://instagram.com/ana-costa",
      aceitaSolicitacoesDiretas: false,
      exibirAcoesVitrineNoCartao: false,
      atualizadoEmIso: expect.any(String),
    });
  });
});
