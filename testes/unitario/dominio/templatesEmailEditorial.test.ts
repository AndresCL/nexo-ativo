import { describe, expect, it } from "vitest";
import {
  construirEmailConfirmacaoVisitante,
  construirEmailNovaSolicitacaoEquipe,
  construirEmailRecuperacaoSenha,
  escaparHtmlSeguro,
  URL_LOGO_PADRAO_NEXO_ATIVO,
} from "@/dominio/email/templatesEmailEditorial";
import type { SolicitacaoComercial } from "@/dominio/entidades/solicitacaoComercial";

describe("Templates de E-mail Editorial e Sanitização HTML", () => {
  const solicitacaoBase: SolicitacaoComercial = {
    id: "sol-teste-123",
    organizacaoId: "org-atelier",
    identificadorPublicoOrganizacao: "atelier-monte-claro",
    microfluxoId: "fluxo-catalogo",
    tituloExperiencia: "Explorar tiragens fine art",
    versaoMicrofluxo: 1,
    nomeVisitante: "<script>alert('xss')</script> Clara & Mendes",
    telefoneOuWhatsapp: "(21) 99876-5432",
    emailVisitante: "clara@exemplo.com.br",
    produtoId: "prd-1",
    produtoNome: "Tiragem Especial <Obras Raras>",
    quantidadeComercial: 2,
    mensagemAdicional: "Gostaria de moldura em madeira & vidro museológico.",
    respostasRegistradas: [
      {
        etapaId: "etapa-formato",
        pergunta: "Qual acabamento você prefere?",
        respostaTexto: "Papel Algodão 310g <b>Premium</b>",
      },
    ],
    demonstrativoComercialCongelado: {
      modalidade: "quantidade_vezes_preco",
      moeda: "BRL",
      linhas: [
        {
          id: "linha-1",
          rotulo: "Tiragem Especial <Obras Raras> (2 unid.)",
          quantidade: 2,
          valorUnitarioCentavos: 150000,
          subtotalCentavos: 300000,
        },
      ],
      totalCentavos: 300000,
      resumoFormatado: "R$ 3.000,00",
      versaoMicrofluxo: 1,
      calculadoEmIso: "2026-11-08T12:00:00.000Z",
    },
    situacao: "nova",
    chaveIdempotencia: "chave-idemp-123",
    criadoEmIso: "2026-11-08T12:00:00.000Z",
    atualizadoEmIso: "2026-11-08T12:00:00.000Z",
  };

  it("deve escapar caracteres perigosos contra injeção em HTML", () => {
    const textoInseguro = `<script>alert("hack")</script> & 'aspas'`;
    const textoEscapado = escaparHtmlSeguro(textoInseguro);

    expect(textoEscapado).not.toContain("<script>");
    expect(textoEscapado).toContain("&lt;script&gt;");
    expect(textoEscapado).toContain("&amp;");
    expect(textoEscapado).toContain("&quot;");
    expect(textoEscapado).toContain("&#39;");
  });

  it("deve construir e-mail da equipe com chave de idempotência determinística e HTML sanitizado", () => {
    const emailEquipe = construirEmailNovaSolicitacaoEquipe({
      solicitacao: solicitacaoBase,
      nomeOrganizacao: "Atelier Monte Claro",
      destinatarios: ["equipe@atelier.com.br"],
    });

    expect(emailEquipe.chaveIdempotencia).toBe(`email-equipe-${solicitacaoBase.id}`);
    expect(emailEquipe.para).toEqual(["equipe@atelier.com.br"]);
    expect(emailEquipe.responderParaOpcional).toBe(solicitacaoBase.emailVisitante);
    expect(emailEquipe.assunto).toContain("Nova solicitação em Atelier Monte Claro");

    // Valida escape de XSS no HTML
    expect(emailEquipe.html).not.toContain("<script>");
    expect(emailEquipe.html).toContain("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;");
    expect(emailEquipe.html).toContain("&lt;Obras Raras&gt;");
    expect(emailEquipe.html).toContain("R$ 3.000,00");
    expect(emailEquipe.textoPuro).toContain(solicitacaoBase.id);
  });

  it("deve construir e-mail editorial de confirmação para o visitante com identificação e protocolo", () => {
    const emailVisitante = construirEmailConfirmacaoVisitante({
      solicitacao: solicitacaoBase,
      nomeOrganizacao: "Atelier Monte Claro",
      emailVisitante: solicitacaoBase.emailVisitante!,
      responderParaOpcional: "contato@atelier.com.br",
    });

    expect(emailVisitante.chaveIdempotencia).toBe(`email-visitante-${solicitacaoBase.id}`);
    expect(emailVisitante.para).toEqual(["clara@exemplo.com.br"]);
    expect(emailVisitante.responderParaOpcional).toBe("contato@atelier.com.br");
    expect(emailVisitante.assunto).toContain("Recebemos sua solicitação em Atelier Monte Claro");
    expect(emailVisitante.html).toContain(solicitacaoBase.id);
    expect(emailVisitante.html).toContain("R$ 3.000,00");
    expect(emailVisitante.textoPuro).toContain(solicitacaoBase.id);
    expect(emailVisitante.textoPuro).toContain("R$ 3.000,00");
  });

  it("deve construir e-mail minimalista de recuperação de senha com logo e link seguro", () => {
    const emailRecuperacao = construirEmailRecuperacaoSenha({
      emailDestinatario: "usuario@exemplo.com.br",
      linkRedefinicao: "http://localhost:3000/redefinir-senha?oobCode=codigoSeguro123",
    });

    expect(emailRecuperacao.para).toEqual(["usuario@exemplo.com.br"]);
    expect(emailRecuperacao.assunto).toContain("Redefinição de senha de acesso");
    expect(emailRecuperacao.html).toContain(URL_LOGO_PADRAO_NEXO_ATIVO);
    expect(emailRecuperacao.html).toContain("http://localhost:3000/redefinir-senha?oobCode=codigoSeguro123");
    expect(emailRecuperacao.html).toContain("Redefinir minha senha");
    expect(emailRecuperacao.textoPuro).toContain("http://localhost:3000/redefinir-senha?oobCode=codigoSeguro123");
  });
});
