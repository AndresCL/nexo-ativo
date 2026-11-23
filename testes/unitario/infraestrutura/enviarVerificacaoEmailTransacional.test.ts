import { describe, expect, it, vi } from "vitest";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import { ErroDominio, ErroNaoAutenticado } from "@/dominio/erros/errosDominio";
import { executarEnvioVerificacaoEmail } from "../../../funcoes/src/casos-de-uso/enviarVerificacaoEmailTransacional";
import type { PortaProvedorEmailTransacional } from "../../../funcoes/src/email/adaptadorResendEmail";

function criarMockFirestore(ultimoEnvioMs?: number) {
  const setRateLimit = vi.fn().mockResolvedValue(undefined);
  const setMetricas = vi.fn().mockResolvedValue(undefined);

  const bancoDados = {
    collection: vi.fn((nomeColecao: string) => {
      if (nomeColecao === "controleRateLimitVerificacaoEmail") {
        return {
          doc: vi.fn(() => ({
            get: vi.fn().mockResolvedValue({
              exists: ultimoEnvioMs !== undefined,
              data: () => (ultimoEnvioMs !== undefined ? { ultimoEnvioMs } : undefined),
            }),
            set: setRateLimit,
          })),
        };
      }
      if (nomeColecao === "metricasPlataforma") {
        return {
          doc: vi.fn(() => ({
            set: setMetricas,
          })),
        };
      }
      throw new Error(`Coleção inesperada: ${nomeColecao}`);
    }),
  } as unknown as Firestore;

  return { bancoDados, setRateLimit, setMetricas };
}

function criarProvedorEmailMock(): PortaProvedorEmailTransacional {
  return {
    enviarEmailIdempotente: vi.fn().mockResolvedValue({
      enviado: true,
      idProvedor: "resend-123",
      chaveIdempotencia: "verificar-email-123",
      modoSimulado: false,
    }),
  };
}

describe("executarEnvioVerificacaoEmail", () => {
  it("deve rejeitar requisição sem usuário autenticado", async () => {
    const { bancoDados } = criarMockFirestore();
    const provedorEmail = criarProvedorEmailMock();
    const authAdmin = {} as Auth;

    await expect(
      executarEnvioVerificacaoEmail(bancoDados, authAdmin, provedorEmail, null),
    ).rejects.toBeInstanceOf(ErroNaoAutenticado);
  });

  it("não deve enviar e-mail nem consumir cota quando a conta já estiver verificada", async () => {
    const { bancoDados } = criarMockFirestore();
    const provedorEmail = criarProvedorEmailMock();
    const authAdmin = {
      getUser: vi.fn().mockResolvedValue({
        uid: "u1",
        email: "ja@verificado.com",
        displayName: "Ana",
        emailVerified: true,
      }),
    } as unknown as Auth;

    const resultado = await executarEnvioVerificacaoEmail(
      bancoDados,
      authAdmin,
      provedorEmail,
      {
        uid: "u1",
        email: "ja@verificado.com",
        nomeExibicao: "Ana",
        fotoUrl: null,
        emailVerificado: true,
        provedoresConectados: ["password"],
      },
    );

    expect(resultado.enviado).toBe(false);
    expect(resultado.jaVerificado).toBe(true);
    expect(provedorEmail.enviarEmailIdempotente).not.toHaveBeenCalled();
  });

  it("deve bloquear reenvio dentro da janela de rate-limit com mensagem clara", async () => {
    const agoraMs = 1_700_000_030_000;
    const { bancoDados } = criarMockFirestore(agoraMs - 20_000);
    const provedorEmail = criarProvedorEmailMock();
    const authAdmin = {
      getUser: vi.fn().mockResolvedValue({
        uid: "u1",
        email: "novo@cliente.com",
        displayName: "Carlos",
        emailVerified: false,
      }),
    } as unknown as Auth;

    await expect(
      executarEnvioVerificacaoEmail(
        bancoDados,
        authAdmin,
        provedorEmail,
        {
          uid: "u1",
          email: "novo@cliente.com",
          nomeExibicao: "Carlos",
          fotoUrl: null,
          emailVerificado: false,
          provedoresConectados: ["password"],
        },
        "https://nexoativo.com.br",
        agoraMs,
      ),
    ).rejects.toThrow(ErroDominio);

    expect(provedorEmail.enviarEmailIdempotente).not.toHaveBeenCalled();
  });

  it("deve gerar link com oobCode apontando para /verificar-email e enviar via Resend", async () => {
    const { bancoDados, setRateLimit, setMetricas } = criarMockFirestore();
    const provedorEmail = criarProvedorEmailMock();
    const authAdmin = {
      getUser: vi.fn().mockResolvedValue({
        uid: "u1",
        email: "apguimaraesc@gmail.com",
        displayName: "Ana Paula",
        emailVerified: false,
      }),
      generateEmailVerificationLink: vi
        .fn()
        .mockResolvedValue(
          "https://nexo-ativo.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=codigoSeguro456&apiKey=xyz",
        ),
    } as unknown as Auth;

    const resultado = await executarEnvioVerificacaoEmail(
      bancoDados,
      authAdmin,
      provedorEmail,
      {
        uid: "u1",
        email: "apguimaraesc@gmail.com",
        nomeExibicao: "Ana Paula",
        fotoUrl: null,
        emailVerificado: false,
        provedoresConectados: ["password"],
      },
      "https://nexoativo.com.br/",
      1_700_000_000_000,
    );

    expect(resultado.enviado).toBe(true);
    expect(resultado.jaVerificado).toBe(false);
    expect(provedorEmail.enviarEmailIdempotente).toHaveBeenCalledTimes(1);

    const mensagemEnviada = vi.mocked(provedorEmail.enviarEmailIdempotente).mock.calls[0]?.[0];
    expect(mensagemEnviada?.para).toEqual(["apguimaraesc@gmail.com"]);
    expect(mensagemEnviada?.html).toContain(
      "https://nexoativo.com.br/verificar-email?oobCode=codigoSeguro456",
    );
    expect(mensagemEnviada?.html).not.toContain("firebaseapp.com");
    expect(setRateLimit).toHaveBeenCalledTimes(1);
    expect(setMetricas).toHaveBeenCalledTimes(1);
  });
});

