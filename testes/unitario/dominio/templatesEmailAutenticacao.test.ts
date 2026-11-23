import { describe, expect, it } from "vitest";
import { construirEmailVerificacaoConta } from "@/dominio/email/templatesEmailAutenticacao";
import { REMETENTE_PADRAO_FLUXO } from "@/dominio/email/templatesEmailEditorial";

describe("construirEmailVerificacaoConta", () => {
  it("deve gerar e-mail personalizado do Nexo Ativo com saudação, botão e texto puro", () => {
    const mensagem = construirEmailVerificacaoConta({
      emailDestinatario: "  Ana@Estudio.com.br  ",
      nomeExibicao: "Ana Paula",
      linkVerificacao: "https://nexoativo.com.br/verificar-email?oobCode=codigo-123",
    });

    expect(mensagem.de).toBe(REMETENTE_PADRAO_FLUXO);
    expect(mensagem.para).toEqual(["ana@estudio.com.br"]);
    expect(mensagem.assunto).toContain("Confirme seu endereço de e-mail");
    expect(mensagem.html).toContain("Ana Paula");
    expect(mensagem.html).toContain("Confirmar meu e-mail");
    expect(mensagem.html).toContain(
      "https://nexoativo.com.br/verificar-email?oobCode=codigo-123",
    );
    expect(mensagem.textoPuro).toContain("Olá, Ana Paula,");
    expect(mensagem.textoPuro).toContain(
      "https://nexoativo.com.br/verificar-email?oobCode=codigo-123",
    );
  });

  it("deve escapar caracteres HTML maliciosos no nome de exibição", () => {
    const mensagem = construirEmailVerificacaoConta({
      emailDestinatario: "cliente@exemplo.com",
      nomeExibicao: `<script>alert("xss")</script>`,
      linkVerificacao: "https://nexoativo.com.br/verificar-email?oobCode=abc",
    });

    expect(mensagem.html).not.toContain("<script>");
    expect(mensagem.html).toContain("&lt;script&gt;");
  });

  it("deve gerar chaves de idempotência distintas para códigos oobCode diferentes e iguais para o mesmo link", () => {
    const primeira = construirEmailVerificacaoConta({
      emailDestinatario: "cliente@exemplo.com",
      linkVerificacao: "https://nexoativo.com.br/verificar-email?oobCode=primeiro",
    });
    const repetida = construirEmailVerificacaoConta({
      emailDestinatario: "cliente@exemplo.com",
      linkVerificacao: "https://nexoativo.com.br/verificar-email?oobCode=primeiro",
    });
    const reenvio = construirEmailVerificacaoConta({
      emailDestinatario: "cliente@exemplo.com",
      linkVerificacao: "https://nexoativo.com.br/verificar-email?oobCode=segundo",
    });

    expect(primeira.chaveIdempotencia).toBe(repetida.chaveIdempotencia);
    expect(primeira.chaveIdempotencia).not.toBe(reenvio.chaveIdempotencia);
  });
});

