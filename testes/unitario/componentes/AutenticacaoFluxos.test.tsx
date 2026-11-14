import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type {
  PortaAutenticacaoCliente,
  PortaProvisionamentoOrganizacaoCliente,
} from "@/aplicacao/portas/portasAutenticacao";
import { ErroConflitoDominio } from "@/dominio/erros/errosDominio";
import { FormularioLogin } from "@/componentes/autenticacao/FormularioLogin";
import { FormularioCriarPrimeiraOrganizacao } from "@/componentes/autenticacao/FormularioCriarPrimeiraOrganizacao";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

function criarPortaAutenticacaoFalsa(
  sobrescritas?: Partial<PortaAutenticacaoCliente>,
): PortaAutenticacaoCliente {
  return {
    entrarComEmailESenha: vi.fn().mockResolvedValue({
      uid: "u1",
      email: "teste@clinica.com.br",
      nomeExibicao: "Teste",
      fotoUrl: null,
      emailVerificado: true,
      provedoresConectados: ["password"],
    }),
    cadastrarComEmailESenha: vi.fn(),
    entrarComGoogle: vi.fn(),
    solicitarRecuperacaoSenha: vi.fn(),
    reenviarVerificacaoEmail: vi.fn(),
    recarregarEstadoUsuario: vi.fn(),
    forcarAtualizacaoTokenSessao: vi.fn(),
    encerrarSessao: vi.fn(),
    ...sobrescritas,
  };
}

describe("Fluxos de Autenticação e Provisionamento de Organização", () => {
  it("deve autenticar por e-mail e senha e redirecionar ao painel", async () => {
    const usuario = userEvent.setup();
    const porta = criarPortaAutenticacaoFalsa();

    render(<FormularioLogin servicoAutenticacao={porta} />);

    await usuario.type(screen.getByLabelText(/E-mail/i), "marina@estudio.com.br");
    await usuario.type(screen.getByLabelText(/^Senha/i), "senhaSegura123");
    await usuario.click(screen.getByRole("button", { name: /Entrar no painel/i }));

    expect(porta.entrarComEmailESenha).toHaveBeenCalledWith(
      "marina@estudio.com.br",
      "senhaSegura123",
    );
    expect(pushMock).toHaveBeenCalledWith("/painel");
  });

  it("deve apresentar alerta claro ao encontrar conta vinculada a outro provedor no Google Login", async () => {
    const usuario = userEvent.setup();
    const porta = criarPortaAutenticacaoFalsa({
      entrarComGoogle: vi
        .fn()
        .mockRejectedValue(
          new ErroConflitoDominio(
            "Este e-mail já está vinculado a outro método de acesso.",
            "CONTA_VINCULADA_OUTRO_PROVEDOR",
          ),
        ),
    });

    render(<FormularioLogin servicoAutenticacao={porta} />);

    await usuario.click(screen.getByRole("button", { name: /Continuar com Google/i }));

    const alerta = await screen.findByRole("alert");
    expect(alerta).toHaveTextContent(/vinculado a outro método de acesso/i);
  });

  it("deve sugerir o endereço público e acionar o provisionamento transacional da primeira organização", async () => {
    const usuario = userEvent.setup();
    const criarOrgMock = vi.fn().mockResolvedValue({
      organizacaoId: "org-nova",
      identificadorPublico: "clinica-santa-clara",
    });
    const portaOrg: PortaProvisionamentoOrganizacaoCliente = {
      criarOrganizacaoInicial: criarOrgMock,
    };

    render(<FormularioCriarPrimeiraOrganizacao servicoProvisionamento={portaOrg} />);

    await usuario.type(
      screen.getByLabelText(/Nome da sua atuação ou empresa/i),
      "Clínica Santa Clara",
    );
    await usuario.tab();
    await usuario.type(screen.getByLabelText(/Segmento de atuação/i), "Dermatologia");
    await usuario.click(
      screen.getByRole("button", { name: /Criar organização e iniciar configuração/i }),
    );

    expect(criarOrgMock).toHaveBeenCalledWith({
      nome: "Clínica Santa Clara",
      identificadorPublico: "clinica-santa-clara",
      segmentoAtividade: "Dermatologia",
    });
    expect(refreshMock).toHaveBeenCalled();
  });
});
