import { describe, expect, it } from "vitest";
import { traduzirErroAutenticacaoFirebase } from "@/infraestrutura/firebase/tradutorErrosFirebaseAuth";

describe("traduzirErroAutenticacaoFirebase", () => {
  it("deve traduzir colisão de múltiplos provedores para orientação segura em português", () => {
    const erroTraduzido = traduzirErroAutenticacaoFirebase({
      code: "auth/account-exists-with-different-credential",
    });

    expect(erroTraduzido.codigo).toBe("CONTA_VINCULADA_OUTRO_PROVEDOR");
    expect(erroTraduzido.message).toMatch(/vinculado a outro método de acesso/i);
  });

  it("deve traduzir credenciais incorretas e indisponibilidade de endereço público sem expor detalhes internos", () => {
    const erroSenha = traduzirErroAutenticacaoFirebase({ code: "auth/invalid-credential" });
    expect(erroSenha.codigo).toBe("CREDENCIAIS_INVALIDAS");

    const erroSlug = traduzirErroAutenticacaoFirebase({ code: "functions/already-exists" });
    expect(erroSlug.codigo).toBe("ENDERECO_PUBLICO_INDISPONIVEL");
  });

  it("deve traduzir erros comuns de permissão e indisponibilidade do Firestore", () => {
    const erroPermissao = traduzirErroAutenticacaoFirebase({ code: "permission-denied" });
    expect(erroPermissao.codigo).toBe("PERMISSAO_NEGADA");
    expect(erroPermissao.message).toMatch(/permissão/i);

    const erroSessao = traduzirErroAutenticacaoFirebase({ code: "unauthenticated" });
    expect(erroSessao.codigo).toBe("USUARIO_NAO_AUTENTICADO");
    expect(erroSessao.message).toMatch(/expirou/i);
  });
});
