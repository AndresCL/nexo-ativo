import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GerenciadorAssinaturaPainel } from "@/componentes/painel/assinatura/GerenciadorAssinaturaPainel";
import {
  criarResumoDireitosPlanoInicial,
  type Organizacao,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import type {
  CobrancaHistoricoAsaas,
  RegistroAssinaturaAsaas,
} from "@/dominio/assinaturas/tiposAssinaturaAsaas";

const organizacao: Organizacao = {
  id: "garage-88",
  nome: "Garage 88",
  identificadorPublico: "garage-88",
  segmentoAtividade: "Automotivo",
  situacao: "ativa",
  resumoDireitosPlano: {
    ...criarResumoDireitosPlanoInicial(),
    planoCodigo: "pro",
    situacaoAssinatura: "ativa",
    limiteProfissionaisAtivos: 1,
    limiteEnviosEmailMensal: 100,
  },
  criadoEmIso: "2026-11-13T12:00:00Z",
  atualizadoEmIso: "2026-11-13T12:00:00Z",
};
const assinatura: RegistroAssinaturaAsaas = {
  id: "assinatura-1",
  organizacaoId: organizacao.id,
  assinaturaAsaasId: "sub-1",
  planoCodigo: "pro",
  valorMensalCentavos: 9700,
  situacaoAsaas: "ACTIVE",
  situacaoInterna: "ativa",
  contratouImplantacaoAssistida: false,
  proximoVencimentoIso: "2026-11-20",
  criadoEmIso: "2026-11-13T12:00:00Z",
  atualizadoEmIso: "2026-11-13T12:00:00Z",
};
const cobranca: CobrancaHistoricoAsaas = {
  id: "cobranca-1",
  organizacaoId: organizacao.id,
  cobrancaAsaasId: "pay-1",
  valorCentavos: 9700,
  formaPagamento: "PIX",
  situacao: "RECEIVED",
  dataVencimentoIso: "2026-11-13",
  criadoEmIso: "2026-11-13T12:00:00Z",
  atualizadoEmIso: "2026-11-13T12:00:00Z",
  urlFaturaOuComprovante: "https://example.com/fatura",
};

function montar(
  opcoes: {
    gerenciar?: boolean;
    cobrancas?: readonly CobrancaHistoricoAsaas[];
    criar?: ReturnType<typeof vi.fn>;
  } = {},
) {
  const criarAssinatura =
    opcoes.criar ??
    vi.fn().mockResolvedValue({
      assinaturaId: "sub-2",
      situacao: "pendente_contratacao",
      urlCheckoutOuFatura: "https://example.com/checkout",
    });
  render(
    <GerenciadorAssinaturaPainel
      organizacao={organizacao}
      assinaturaAtual={assinatura}
      cobrancas={opcoes.cobrancas ?? [cobranca]}
      podeGerenciarAssinatura={opcoes.gerenciar ?? true}
      servicoAssinaturas={{ criarAssinatura }}
    />,
  );
  return criarAssinatura;
}
function preencher() {
  fireEvent.click(screen.getByRole("button", { name: "Contratar Plano Equipe" }));
  fireEvent.change(screen.getByLabelText("CPF ou CNPJ"), { target: { value: "12345678900" } });
  fireEvent.change(screen.getByLabelText("WhatsApp com DDD"), { target: { value: "11999998888" } });
  fireEvent.change(screen.getByLabelText("E-mail para envio das faturas"), {
    target: { value: "financeiro@exemplo.com.br" },
  });
}

describe("Assinatura do painel", () => {
  it("mostra os limites reais do plano e o histórico com data e situação legíveis", () => {
    montar();
    const resumo = screen.getByRole("region", { name: "Resumo da assinatura" });
    expect(within(resumo).getByText("Até 1")).toBeInTheDocument();
    expect(within(resumo).getByText("100")).toBeInTheDocument();
    expect(within(resumo).getByText("Próximo vencimento: 20/11/2026")).toBeInTheDocument();
    const historico = screen.getByRole("table");
    expect(within(historico).getByText("13/11/2026")).toBeInTheDocument();
    expect(within(historico).getByText("Pix")).toBeInTheDocument();
    expect(within(historico).getByText("Paga")).toBeInTheDocument();
    expect(within(historico).getByRole("link", { name: "Visualizar" })).toHaveAttribute(
      "href",
      cobranca.urlFaturaOuComprovante,
    );
  });

  it("separa mensalidade e implantação e envia a opção escolhida sem contratar ao abrir", async () => {
    const criar = montar();
    preencher();
    expect(criar).not.toHaveBeenCalled();
    const dialogo = screen.getByRole("dialog");
    expect(within(dialogo).getByText("R$ 197,00/mês")).toBeInTheDocument();
    expect(within(dialogo).queryByText("Implantação · pagamento único")).not.toBeInTheDocument();
    fireEvent.click(within(dialogo).getByRole("checkbox"));
    expect(within(dialogo).getByText("Implantação · pagamento único")).toBeInTheDocument();
    fireEvent.click(within(dialogo).getByRole("button", { name: "Gerar assinatura e checkout" }));
    await waitFor(() =>
      expect(criar).toHaveBeenCalledWith({
        organizacaoId: "garage-88",
        planoCodigo: "equipe",
        contratarImplantacaoAssistida: true,
        dadosFiscais: {
          nomeOuRazaoSocial: "Garage 88",
          cpfOuCnpj: "12345678900",
          email: "financeiro@exemplo.com.br",
          telefone: "11999998888",
        },
      }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("link", { name: /Acessar Fatura/ })).toHaveAttribute(
      "href",
      "https://example.com/checkout",
    );
  });

  it("mantém o formulário preenchido e permite tentar novamente após falha", async () => {
    const criar = vi.fn().mockRejectedValue(new Error("Falha ao gerar assinatura"));
    montar({ criar });
    preencher();
    fireEvent.click(screen.getByRole("button", { name: "Gerar assinatura e checkout" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao gerar assinatura");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("CPF ou CNPJ")).toHaveValue("12345678900");
    expect(screen.getByRole("button", { name: "Gerar assinatura e checkout" })).toBeEnabled();
  });

  it("bloqueia submissões duplicadas e o fechamento durante o processamento", async () => {
    let concluir!: (resultado: { assinaturaId: string; situacao: string }) => void;
    const criar = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          concluir = resolve;
        }),
    );
    montar({ criar });
    preencher();
    const formulario = screen.getByLabelText("CPF ou CNPJ").closest("form")!;
    fireEvent.submit(formulario);
    fireEvent.submit(formulario);
    expect(criar).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByLabelText("CPF ou CNPJ")).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    concluir({ assinaturaId: "sub-2", situacao: "pendente_contratacao" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("respeita a permissão de gestão e mantém o histórico vazio visível", () => {
    const criar = montar({ gerenciar: false, cobrancas: [] });
    expect(screen.getByRole("button", { name: "Contratar Plano Equipe" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Gerenciar / Alterar Dados" })).toBeDisabled();
    expect(screen.getByText("Nenhuma cobrança registrada")).toBeInTheDocument();
    expect(criar).not.toHaveBeenCalled();
  });
});
