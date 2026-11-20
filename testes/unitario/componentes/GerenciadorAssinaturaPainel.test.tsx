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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

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
    limiteProfissionaisAtivos: 10,
    limiteEnviosEmailMensal: 300,
  },
  criadoEmIso: "2026-11-13T12:00:00Z",
  atualizadoEmIso: "2026-11-13T12:00:00Z",
};
const assinatura: RegistroAssinaturaAsaas = {
  id: "assinatura-1",
  organizacaoId: organizacao.id,
  assinaturaAsaasId: "sub-1",
  planoCodigo: "pro",
  valorMensalCentavos: 8700,
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
  valorCentavos: 8700,
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
    orgSobrescrita?: Partial<Organizacao>;
    assinaturaSobrescrita?: RegistroAssinaturaAsaas | null;
  } = {},
) {
  const criarAssinatura =
    opcoes.criar ??
    vi.fn().mockResolvedValue({
      assinaturaId: "sub-2",
      situacao: "pendente_contratacao",
      urlCheckoutOuFatura: "https://example.com/checkout",
    });
  const orgFinal = {
    ...organizacao,
    ...opcoes.orgSobrescrita,
    resumoDireitosPlano: {
      ...organizacao.resumoDireitosPlano,
      ...(opcoes.orgSobrescrita?.resumoDireitosPlano ?? {}),
    },
  };
  const assinaturaFinal =
    opcoes.assinaturaSobrescrita !== undefined
      ? opcoes.assinaturaSobrescrita
      : assinatura;
  render(
    <GerenciadorAssinaturaPainel
      organizacao={orgFinal}
      assinaturaAtual={assinaturaFinal}
      cobrancas={opcoes.cobrancas ?? [cobranca]}
      podeGerenciarAssinatura={opcoes.gerenciar ?? true}
      servicoAssinaturas={{
        criarAssinatura,
        cancelarAssinatura: vi.fn(),
        contratarImplantacaoAssistida: vi.fn(),
      }}
    />,
  );
  return criarAssinatura;
}
function preencher(nomeBotao = "Contratar Plano Pro") {
  fireEvent.click(screen.getByRole("button", { name: nomeBotao }));
  fireEvent.change(screen.getByLabelText("CPF ou CNPJ"), { target: { value: "12345678900" } });
  fireEvent.change(screen.getByLabelText("WhatsApp com DDD"), { target: { value: "11999998888" } });
  fireEvent.change(screen.getByLabelText("E-mail para envio das faturas"), {
    target: { value: "financeiro@exemplo.com.br" },
  });
}

describe("Assinatura do painel", () => {
  it("mostra os limites reais do plano, o card Empresarial e o histórico com data e situação legíveis", () => {
    montar();
    const resumo = screen.getByRole("region", { name: "Resumo da assinatura" });
    expect(within(resumo).getByText("Até 10")).toBeInTheDocument();
    expect(within(resumo).getByText("300")).toBeInTheDocument();
    expect(within(resumo).getByText("Próximo vencimento: 20/11/2026")).toBeInTheDocument();
    expect(screen.getByText("Plano Empresarial")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Solicitar proposta sob medida/ })).toBeInTheDocument();
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
    const criar = montar({
      orgSobrescrita: {
        resumoDireitosPlano: {
          ...organizacao.resumoDireitosPlano,
          planoCodigo: "avaliacao_inicial",
          situacaoAssinatura: "avaliacao_inicial",
        },
      },
      assinaturaSobrescrita: null,
    });
    preencher("Contratar Plano Pro");
    expect(criar).not.toHaveBeenCalled();
    const dialogo = screen.getByRole("dialog");
    expect(within(dialogo).getByText("R$ 87,00/mês")).toBeInTheDocument();
    expect(within(dialogo).queryByText("Implantação · pagamento único")).not.toBeInTheDocument();
    fireEvent.click(within(dialogo).getByRole("checkbox"));
    expect(within(dialogo).getByText("Implantação · pagamento único")).toBeInTheDocument();
    fireEvent.click(within(dialogo).getByRole("button", { name: "Gerar assinatura e checkout" }));
    await waitFor(() =>
      expect(criar).toHaveBeenCalledWith({
        organizacaoId: "garage-88",
        planoCodigo: "pro",
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
    montar({
      criar,
      orgSobrescrita: {
        resumoDireitosPlano: {
          ...organizacao.resumoDireitosPlano,
          planoCodigo: "avaliacao_inicial",
          situacaoAssinatura: "avaliacao_inicial",
        },
      },
      assinaturaSobrescrita: null,
    });
    preencher("Contratar Plano Pro");
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
    montar({
      criar,
      orgSobrescrita: {
        resumoDireitosPlano: {
          ...organizacao.resumoDireitosPlano,
          planoCodigo: "avaliacao_inicial",
          situacaoAssinatura: "avaliacao_inicial",
        },
      },
      assinaturaSobrescrita: null,
    });
    preencher("Contratar Plano Pro");
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
    const criar = montar({
      gerenciar: false,
      cobrancas: [],
      orgSobrescrita: {
        resumoDireitosPlano: {
          ...organizacao.resumoDireitosPlano,
          planoCodigo: "avaliacao_inicial",
          situacaoAssinatura: "avaliacao_inicial",
        },
      },
      assinaturaSobrescrita: null,
    });
    expect(screen.getByRole("button", { name: "Contratar Plano Pro" })).toBeDisabled();
    expect(screen.getByText("Nenhuma cobrança registrada")).toBeInTheDocument();
    expect(criar).not.toHaveBeenCalled();
  });

  it("exibe estado de fatura pendente quando assinatura foi gerada mas pagamento ainda não foi confirmado", () => {
    const assinaturaPendente: RegistroAssinaturaAsaas = {
      ...assinatura,
      situacaoAsaas: "PENDING",
      situacaoInterna: "pendente_contratacao",
      urlFaturaOuCheckout: "https://sandbox.asaas.com/i/fatura-123",
    };
    const organizacaoPendente: Organizacao = {
      ...organizacao,
      resumoDireitosPlano: {
        ...organizacao.resumoDireitosPlano,
        situacaoAssinatura: "pendente_contratacao",
      },
    };

    render(
      <GerenciadorAssinaturaPainel
        organizacao={organizacaoPendente}
        assinaturaAtual={assinaturaPendente}
        cobrancas={[]}
        podeGerenciarAssinatura={true}
        servicoAssinaturas={{
          criarAssinatura: vi.fn(),
          cancelarAssinatura: vi.fn(),
          contratarImplantacaoAssistida: vi.fn(),
        }}
      />,
    );

    expect(screen.getAllByText("Fatura Gerada · Aguardando Pagamento")).toHaveLength(2);
    expect(
      screen.getByText("Assinatura gerada · Aguardando confirmação do pagamento"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Pagar \/ Acessar Fatura/ }),
    ).toHaveAttribute("href", "https://sandbox.asaas.com/i/fatura-123");
    expect(
      screen.queryByRole("link", { name: /Acessar Fatura \/ Pagar/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Alterar dados cadastrais ou reemitir fatura" }),
    ).toBeInTheDocument();
  });

  it("permite contratar implantação assistida avulsa e disponibiliza botão para Chat de suporte", async () => {
    window.open = vi.fn();
    const contratarMock = vi.fn().mockResolvedValue({
      organizacaoId: "garage-88",
      cobrancaAsaasId: "pay_imp_1",
      urlCheckout: "https://sandbox.asaas.com/i/imp1",
    });

    render(
      <GerenciadorAssinaturaPainel
        organizacao={organizacao}
        assinaturaAtual={assinatura}
        cobrancas={[cobranca]}
        podeGerenciarAssinatura={true}
        servicoAssinaturas={{
          criarAssinatura: vi.fn(),
          cancelarAssinatura: vi.fn(),
          contratarImplantacaoAssistida: contratarMock,
        }}
      />,
    );

    const botaoImplantacao = screen.getByRole("button", {
      name: /Contratar Implantação/,
    });
    expect(botaoImplantacao).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ajuda no Chat/ })).toBeInTheDocument();

    fireEvent.click(botaoImplantacao);
    await waitFor(() =>
      expect(contratarMock).toHaveBeenCalledWith("garage-88"),
    );
  });

  it("identifica faturas de ciclo futuro como Próximo ciclo quando a assinatura estiver ativa", () => {
    const cobrancaFutura: CobrancaHistoricoAsaas = {
      id: "cobranca-futura",
      organizacaoId: organizacao.id,
      cobrancaAsaasId: "pay-futura",
      valorCentavos: 8700,
      formaPagamento: "UNDEFINED",
      situacao: "PENDING",
      dataVencimentoIso: "2099-12-20",
      criadoEmIso: "2026-11-19T12:00:00Z",
      atualizadoEmIso: "2026-11-19T12:00:00Z",
      urlFaturaOuComprovante: "https://sandbox.asaas.com/i/futura",
    };

    render(
      <GerenciadorAssinaturaPainel
        organizacao={{
          ...organizacao,
          resumoDireitosPlano: {
            ...organizacao.resumoDireitosPlano,
            situacaoAssinatura: "ativa",
          },
        }}
        assinaturaAtual={assinatura}
        cobrancas={[cobrancaFutura]}
        podeGerenciarAssinatura={true}
      />,
    );

    const tabela = screen.getByRole("table");
    expect(within(tabela).getByText("Próximo ciclo")).toBeInTheDocument();
    expect(within(tabela).getByText("A definir")).toBeInTheDocument();
  });

  it("exibe faturas pendentes de ciclo futuro como Cancelada quando a assinatura estiver cancelada", () => {
    const cobrancaFutura: CobrancaHistoricoAsaas = {
      id: "cobranca-futura-cancelada",
      organizacaoId: organizacao.id,
      cobrancaAsaasId: "pay-futura-cancelada",
      valorCentavos: 8700,
      formaPagamento: "UNDEFINED",
      situacao: "PENDING",
      dataVencimentoIso: "2099-12-20",
      criadoEmIso: "2026-11-19T12:00:00Z",
      atualizadoEmIso: "2026-11-19T12:00:00Z",
      urlFaturaOuComprovante: "https://sandbox.asaas.com/i/futura",
    };

    render(
      <GerenciadorAssinaturaPainel
        organizacao={{
          ...organizacao,
          resumoDireitosPlano: {
            ...organizacao.resumoDireitosPlano,
            situacaoAssinatura: "cancelada",
            vigenciaAteIso: "2099-12-20",
          },
        }}
        assinaturaAtual={{
          ...assinatura,
          situacaoInterna: "cancelada",
          situacaoAsaas: "INACTIVE",
          vigenciaAteIso: "2099-12-20",
        }}
        cobrancas={[cobrancaFutura]}
        podeGerenciarAssinatura={true}
      />,
    );

    const tabela = screen.getByRole("table");
    expect(within(tabela).getByText("Cancelada")).toBeInTheDocument();
    expect(within(tabela).queryByRole("link", { name: "Visualizar" })).not.toBeInTheDocument();
  });

  it("exibe botão de cancelar assinatura no rodapé e exige digitar eliminar no diálogo para confirmar", async () => {
    const cancelarMock = vi.fn().mockResolvedValue({ sucesso: true });

    render(
      <GerenciadorAssinaturaPainel
        organizacao={{
          ...organizacao,
          resumoDireitosPlano: {
            ...organizacao.resumoDireitosPlano,
            situacaoAssinatura: "ativa",
          },
        }}
        assinaturaAtual={assinatura}
        cobrancas={[cobranca]}
        podeGerenciarAssinatura={true}
        servicoAssinaturas={{
          criarAssinatura: vi.fn(),
          cancelarAssinatura: cancelarMock,
          contratarImplantacaoAssistida: vi.fn(),
        }}
      />,
    );

    // Botão deve estar na seção de cancelamento no rodapé
    const secaoCancelamento = screen.getByRole("region", { name: "Cancelar assinatura" });
    const botaoAbrirModal = within(secaoCancelamento).getByRole("button", {
      name: "Cancelar assinatura",
    });
    expect(botaoAbrirModal).toBeInTheDocument();

    fireEvent.click(botaoAbrirModal);

    const dialogo = screen.getByRole("alertdialog");
    expect(within(dialogo).getByText("Deseja cancelar sua assinatura?")).toBeInTheDocument();

    const botaoConfirmar = within(dialogo).getByRole("button", {
      name: "Confirmar cancelamento",
    });
    expect(botaoConfirmar).toBeDisabled();

    // Digita texto incorreto -> permanece desabilitado
    const inputConfirmar = within(dialogo).getByPlaceholderText("eliminar");
    fireEvent.change(inputConfirmar, { target: { value: "nao" } });
    expect(botaoConfirmar).toBeDisabled();

    // Digita "eliminar" -> botão fica habilitado
    fireEvent.change(inputConfirmar, { target: { value: "eliminar" } });
    expect(botaoConfirmar).not.toBeDisabled();

    fireEvent.click(botaoConfirmar);

    await waitFor(() => {
      expect(cancelarMock).toHaveBeenCalledWith(organizacao.id);
    });
  });
});
