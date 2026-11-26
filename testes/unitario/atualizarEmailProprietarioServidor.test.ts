import { describe, expect, it, vi } from "vitest";
import type { Firestore } from "firebase-admin/firestore";
import { executarAtualizacaoEmailProprietarioFundador } from "@/infraestrutura/fundador/atualizarEmailProprietarioServidor";

function criarMocksFirestore(config: {
  orgExiste?: boolean;
  proprietarioUid?: string | null;
  quantidadeVinculosAntigo?: number;
}) {
  const { orgExiste = true, proprietarioUid = "uid-antigo", quantidadeVinculosAntigo = 1 } = config;

  const setUsuario = vi.fn().mockResolvedValue(undefined);
  const transacaoSet = vi.fn();
  const transacaoDelete = vi.fn();

  const bancoDadosAdmin = {
    collection: vi.fn((nomeColecao: string) => {
      if (nomeColecao === "organizacoes") {
        return {
          doc: vi.fn((orgId: string) => ({
            path: `organizacoes/${orgId}`,
            get: vi.fn().mockResolvedValue({
              exists: orgExiste,
              data: () => ({
                id: orgId,
                nome: "Clinica Teste",
                identificadorPublico: "clinica-teste",
              }),
            }),
            collection: vi.fn(() => ({
              where: vi.fn().mockReturnThis(),
              limit: vi.fn().mockReturnThis(),
              get: vi.fn().mockResolvedValue({
                docs: proprietarioUid ? [{ id: proprietarioUid }] : [],
              }),
              doc: vi.fn((uid: string) => ({ path: `organizacoes/${orgId}/membros/${uid}` })),
            })),
          })),
        };
      }

      if (nomeColecao === "usuarios") {
        return {
          doc: vi.fn((uid: string) => ({
            path: `usuarios/${uid}`,
            set: setUsuario,
            collection: vi.fn(() => ({
              limit: vi.fn().mockReturnThis(),
              get: vi.fn().mockResolvedValue({ size: quantidadeVinculosAntigo }),
              doc: vi.fn((orgId: string) => ({
                path: `usuarios/${uid}/vinculosOrganizacao/${orgId}`,
              })),
            })),
          })),
        };
      }

      throw new Error(`Coleção inesperada: ${nomeColecao}`);
    }),
    runTransaction: vi.fn(async (fn: (t: { set: typeof transacaoSet; delete: typeof transacaoDelete }) => Promise<void>) => {
      await fn({ set: transacaoSet, delete: transacaoDelete });
    }),
  } as unknown as Firestore;

  return { bancoDadosAdmin, setUsuario, transacaoSet, transacaoDelete };
}

describe("executarAtualizacaoEmailProprietarioFundador", () => {
  it("atualiza e-mail direto no Auth quando proprietário é exclusivo da org e novo e-mail é livre", async () => {
    const { bancoDadosAdmin, setUsuario } = criarMocksFirestore({
      proprietarioUid: "uid-temp",
      quantidadeVinculosAntigo: 1,
    });

    const autenticacaoAdmin = {
      getUserByEmail: vi.fn().mockRejectedValue({ code: "auth/user-not-found" }),
      createUser: vi.fn(),
      updateUser: vi.fn().mockResolvedValue({ uid: "uid-temp", email: "real@cliente.com" }),
      revokeRefreshTokens: vi.fn().mockResolvedValue(undefined),
    };

    const resultado = await executarAtualizacaoEmailProprietarioFundador({
      autenticacaoAdmin,
      bancoDadosAdmin,
      fundadorUid: "uid-fundador",
      organizacaoId: "org-1",
      novoEmail: "REAL@cliente.com",
    });

    expect(resultado).toEqual({
      atualizado: true,
      modo: "email_atualizado",
      organizacaoId: "org-1",
      uidProprietario: "uid-temp",
      novoEmail: "real@cliente.com",
    });
    expect(autenticacaoAdmin.updateUser).toHaveBeenCalledWith("uid-temp", {
      email: "real@cliente.com",
      emailVerified: true,
    });
    expect(autenticacaoAdmin.revokeRefreshTokens).toHaveBeenCalledWith("uid-temp");
    expect(setUsuario).toHaveBeenCalledTimes(1);
    expect(autenticacaoAdmin.createUser).not.toHaveBeenCalled();
  });

  it("protege o fundador: não altera Auth do fundador e rebaixa seu vínculo para administrador", async () => {
    const { bancoDadosAdmin, transacaoSet, transacaoDelete } = criarMocksFirestore({
      proprietarioUid: "uid-fundador",
      quantidadeVinculosAntigo: 1,
    });

    const autenticacaoAdmin = {
      getUserByEmail: vi.fn().mockRejectedValue({ code: "auth/user-not-found" }),
      createUser: vi.fn().mockResolvedValue({ uid: "uid-cliente-real", email: "real@cliente.com" }),
      updateUser: vi.fn(),
      revokeRefreshTokens: vi.fn(),
    };

    const resultado = await executarAtualizacaoEmailProprietarioFundador({
      autenticacaoAdmin,
      bancoDadosAdmin,
      fundadorUid: "uid-fundador",
      organizacaoId: "org-1",
      novoEmail: "real@cliente.com",
    });

    expect(resultado.modo).toBe("titularidade_transferida");
    expect(resultado.uidProprietario).toBe("uid-cliente-real");
    expect(autenticacaoAdmin.updateUser).not.toHaveBeenCalled();
    expect(autenticacaoAdmin.createUser).toHaveBeenCalledTimes(1);
    expect(transacaoDelete).not.toHaveBeenCalled();
    expect(transacaoSet).toHaveBeenCalledWith(
      expect.objectContaining({ path: "organizacoes/org-1/membros/uid-fundador" }),
      { papel: "administrador" },
      { merge: true },
    );
  });

  it("protege usuário com múltiplas orgs: não altera Auth antigo e transfere vínculo", async () => {
    const { bancoDadosAdmin, transacaoDelete } = criarMocksFirestore({
      proprietarioUid: "uid-compartilhado",
      quantidadeVinculosAntigo: 2,
    });

    const autenticacaoAdmin = {
      getUserByEmail: vi.fn().mockResolvedValue({ uid: "uid-existente", email: "real@cliente.com" }),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      revokeRefreshTokens: vi.fn(),
    };

    const resultado = await executarAtualizacaoEmailProprietarioFundador({
      autenticacaoAdmin,
      bancoDadosAdmin,
      fundadorUid: "uid-fundador",
      organizacaoId: "org-1",
      novoEmail: "real@cliente.com",
    });

    expect(resultado.modo).toBe("titularidade_transferida");
    expect(resultado.uidProprietario).toBe("uid-existente");
    expect(autenticacaoAdmin.updateUser).not.toHaveBeenCalled();
    expect(autenticacaoAdmin.createUser).not.toHaveBeenCalled();
    expect(transacaoDelete).toHaveBeenCalledTimes(2);
  });
});
