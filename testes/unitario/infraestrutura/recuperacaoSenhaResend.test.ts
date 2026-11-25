import { describe, expect, it, vi } from "vitest";
import { executarSolicitacaoRecuperacaoSenha } from "../../../funcoes/src/casos-de-uso/solicitarRecuperacaoSenhaTransacional";
import type { PortaProvedorEmailTransacional } from "../../../funcoes/src/email/adaptadorResendEmail";

type BancoRecuperacao = Parameters<typeof executarSolicitacaoRecuperacaoSenha>[0];
type AutenticacaoRecuperacao = Parameters<typeof executarSolicitacaoRecuperacaoSenha>[1];
type MensagemEmailEnviada = Parameters<PortaProvedorEmailTransacional["enviarEmailIdempotente"]>[0];

describe("Caso de Uso: Solicitação de Recuperação de Senha com Rate-Limit e Resend", () => {
  it("deve gerar link seguro e enviar e-mail minimalista quando usuário existe", async () => {
    const mapaFirestore = new Map<string, Record<string, unknown>>();

    const bancoFalso = {
      collection: (nome: string) => ({
        doc: (id: string) => ({
          get: async () => ({
            exists: mapaFirestore.has(`${nome}/${id}`),
            data: () => mapaFirestore.get(`${nome}/${id}`),
          }),
          set: async (dados: Record<string, unknown>) => {
            mapaFirestore.set(`${nome}/${id}`, dados);
          },
        }),
      }),
    } as unknown as BancoRecuperacao;

    const autenticacaoAdminFalsa = {
      getUserByEmail: vi.fn().mockResolvedValue({ uid: "user-123", email: "fundador@nexoativo.com.br" }),
      generatePasswordResetLink: vi.fn().mockResolvedValue("https://demo-fluxo.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=codigoTesteSeguro"),
    } as unknown as AutenticacaoRecuperacao;

    const envios: MensagemEmailEnviada[] = [];
    const provedorEmailFalso: PortaProvedorEmailTransacional = {
      enviarEmailIdempotente: async (msg) => {
        envios.push(msg);
        return {
          enviado: true,
          idProvedor: "resend-teste-1",
          chaveIdempotencia: msg.chaveIdempotencia,
          modoSimulado: false,
        };
      },
    };

    const resultado = await executarSolicitacaoRecuperacaoSenha(
      bancoFalso,
      autenticacaoAdminFalsa,
      provedorEmailFalso,
      { email: "fundador@nexoativo.com.br" },
      "http://localhost:3000",
    );

    expect(resultado.sucesso).toBe(true);
    expect(autenticacaoAdminFalsa.getUserByEmail).toHaveBeenCalledWith("fundador@nexoativo.com.br");
    expect(envios.length).toBe(1);
    expect(envios[0].para).toEqual(["fundador@nexoativo.com.br"]);
    expect(envios[0].html).toContain("http://localhost:3000/redefinir-senha?oobCode=codigoTesteSeguro");
  });

  it("deve barrar segundo envio imediato pelo rate limit para blindar cota do Resend", async () => {
    const mapaFirestore = new Map<string, Record<string, unknown>>();

    const bancoFalso = {
      collection: (nome: string) => ({
        doc: (id: string) => ({
          get: async () => ({
            exists: mapaFirestore.has(`${nome}/${id}`),
            data: () => mapaFirestore.get(`${nome}/${id}`),
          }),
          set: async (dados: Record<string, unknown>) => {
            mapaFirestore.set(`${nome}/${id}`, dados);
          },
        }),
      }),
    } as unknown as BancoRecuperacao;

    const autenticacaoAdminFalsa = {
      getUserByEmail: vi.fn().mockResolvedValue({ uid: "user-123", email: "fundador@nexoativo.com.br" }),
      generatePasswordResetLink: vi.fn().mockResolvedValue("https://demo-fluxo.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=codigo"),
    } as unknown as AutenticacaoRecuperacao;

    const envios: MensagemEmailEnviada[] = [];
    const provedorEmailFalso: PortaProvedorEmailTransacional = {
      enviarEmailIdempotente: async (msg) => {
        envios.push(msg);
        return { enviado: true, idProvedor: "resend-teste-1", chaveIdempotencia: msg.chaveIdempotencia, modoSimulado: false };
      },
    };

    // Primeiro envio
    await executarSolicitacaoRecuperacaoSenha(
      bancoFalso,
      autenticacaoAdminFalsa,
      provedorEmailFalso,
      { email: "fundador@nexoativo.com.br" },
    );

    expect(envios.length).toBe(1);

    // Segundo envio imediato
    await executarSolicitacaoRecuperacaoSenha(
      bancoFalso,
      autenticacaoAdminFalsa,
      provedorEmailFalso,
      { email: "fundador@nexoativo.com.br" },
    );

    // Rate-limit bloqueou o segundo envio externo
    expect(envios.length).toBe(1);
  });
});

