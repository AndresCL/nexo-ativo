import { createHash } from "node:crypto";
import type { MensagemEmailTransacional } from "./tiposEmailTransacional";
import {
  escaparHtmlSeguro,
  REMETENTE_PADRAO_FLUXO,
  renderizarLayoutBaseEmail,
} from "./templatesEmailEditorial";

export interface ParametrosTemplateEmailVerificacaoConta {
  readonly emailDestinatario: string;
  readonly linkVerificacao: string;
  readonly nomeExibicao?: string | null;
  readonly remetente?: string;
  readonly urlLogo?: string;
  readonly chaveIdempotencia?: string;
}

/**
 * Gera chave de idempotência determinística vinculada ao destinatário e ao link
 * específico da tentativa (contendo o `oobCode` único), evitando bloqueio de
 * reenvios legítimos dentro da janela de cache do provedor.
 */
function gerarChaveIdempotenciaVerificacao(
  emailDestinatario: string,
  linkVerificacao: string,
): string {
  const resumo = createHash("sha256")
    .update(`${emailDestinatario.toLowerCase().trim()}:${linkVerificacao}`)
    .digest("base64url")
    .slice(0, 32);

  return `verificar-email-${resumo}`;
}

/**
 * Constrói o e-mail transacional personalizado de confirmação de conta para
 * cadastros manuais no Nexo Ativo, utilizando a identidade visual editorial.
 */
export function construirEmailVerificacaoConta(
  parametros: ParametrosTemplateEmailVerificacaoConta,
): MensagemEmailTransacional {
  const emailLimpo = parametros.emailDestinatario.trim().toLowerCase();
  const nomeLimpo = parametros.nomeExibicao?.trim();
  const saudacaoHtml = nomeLimpo ? `Olá, <strong>${escaparHtmlSeguro(nomeLimpo)}</strong>,` : "Olá,";
  const saudacaoTexto = nomeLimpo ? `Olá, ${nomeLimpo},` : "Olá,";
  const assunto = "Confirme seu endereço de e-mail · Nexo Ativo";

  const conteudoCorpoHtml = `
    <p style="margin:0 0 14px 0;">${saudacaoHtml}</p>
    <p style="margin:0 0 14px 0;">
      Obrigado por criar sua conta no <strong>Nexo Ativo</strong> com o endereço <strong>${escaparHtmlSeguro(emailLimpo)}</strong>.
    </p>
    <p style="margin:0 0 14px 0;">
      Para concluir seu cadastro e liberar o acesso ao seu painel, confirme seu e-mail clicando no botão abaixo:
    </p>
  `;

  const notasRodapeHtml = `
    <p style="margin:0 0 8px 0;">
      Se você não criou uma conta no Nexo Ativo, pode desconsiderar esta mensagem com segurança.
    </p>
    <p style="margin:0;font-size:11px;color:#a8a29e;word-break:break-all;">
      Caso o botão não funcione, copie e cole este endereço no seu navegador:<br/>
      <a href="${escaparHtmlSeguro(parametros.linkVerificacao)}" style="color:#57534e;text-decoration:underline;">${escaparHtmlSeguro(parametros.linkVerificacao)}</a>
    </p>
  `;

  const html = renderizarLayoutBaseEmail({
    tituloSuperior: "Confirmação de Conta",
    tituloPrincipal: "Confirme seu endereço de e-mail",
    conteudoCorpoHtml,
    botaoAcaoOpcional: {
      texto: "Confirmar meu e-mail",
      link: parametros.linkVerificacao,
    },
    notasRodapeHtml,
    urlLogo: parametros.urlLogo,
  });

  const textoPuro = [
    "Confirmação de conta · Nexo Ativo",
    "",
    saudacaoTexto,
    `Obrigado por criar sua conta no Nexo Ativo com o e-mail ${emailLimpo}.`,
    "",
    "Acesse o link abaixo para confirmar seu endereço de e-mail e liberar o acesso ao painel:",
    parametros.linkVerificacao,
    "",
    "Se você não criou esta conta, basta desconsiderar esta mensagem.",
    "Nexo Ativo · Plataforma Editorial",
  ].join("\n");

  return {
    chaveIdempotencia:
      parametros.chaveIdempotencia ??
      gerarChaveIdempotenciaVerificacao(emailLimpo, parametros.linkVerificacao),
    de: parametros.remetente ?? REMETENTE_PADRAO_FLUXO,
    para: [emailLimpo],
    assunto,
    html,
    textoPuro,
  };
}

