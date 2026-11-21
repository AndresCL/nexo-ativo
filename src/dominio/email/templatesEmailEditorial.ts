import {
  gerarLinkRetornoWhatsappSolicitacao,
  type SolicitacaoComercial,
} from "../entidades/solicitacaoComercial";
import { ValorMonetarioCentavos } from "../objetos-valor/valorMonetarioCentavos";
import type { MensagemEmailTransacional } from "./tiposEmailTransacional";

export const REMETENTE_PADRAO_FLUXO = "Nexo Ativo <notificacoes@nexoativo.com.br>";
export const URL_LOGO_PADRAO_NEXO_ATIVO = "https://nexoativo.com.br/logo-nexo-ativo.png";

/**
 * Escapa caracteres especiais HTML para evitar injeção de marcação ou scripts
 * no corpo dos e-mails transacionais gerados a partir de dados de visitantes.
 */
export function escaparHtmlSeguro(textoBruto: string): string {
  return textoBruto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface OpcoesLayoutBaseEmail {
  readonly tituloSuperior?: string;
  readonly tituloPrincipal: string;
  readonly conteudoCorpoHtml: string;
  readonly botaoAcaoOpcional?: {
    readonly texto: string;
    readonly link: string;
  };
  readonly notasRodapeHtml?: string;
  readonly urlLogo?: string;
}

/**
 * Renderiza o container visual minimalista editorial do Nexo Ativo.
 * Garante consistência estética de marca, tipografia refinada e layout responsivo.
 */
export function renderizarLayoutBaseEmail(opcoes: OpcoesLayoutBaseEmail): string {
  const urlLogo = opcoes.urlLogo ?? URL_LOGO_PADRAO_NEXO_ATIVO;

  const blocoBotao = opcoes.botaoAcaoOpcional
    ? `<div style="margin:28px 0 24px 0;">
        <a href="${escaparHtmlSeguro(opcoes.botaoAcaoOpcional.link)}" style="display:inline-block;background-color:#1b1a17;color:#fdfbf7;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:13px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-weight:600;letter-spacing:0.02em;">
          ${escaparHtmlSeguro(opcoes.botaoAcaoOpcional.texto)}
        </a>
      </div>`
    : "";

  const blocoTituloSuperior = opcoes.tituloSuperior
    ? `<p style="margin:0 0 10px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#78716c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-weight:600;">
        ${escaparHtmlSeguro(opcoes.tituloSuperior)}
      </p>`
    : "";

  const blocoNotasRodape = opcoes.notasRodapeHtml
    ? `<div style="margin-top:28px;padding-top:20px;border-top:1px solid #e7e5e4;font-size:12px;line-height:1.6;color:#78716c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        ${opcoes.notasRodapeHtml}
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escaparHtmlSeguro(opcoes.tituloPrincipal)}</title>
</head>
<body style="margin:0;padding:32px 16px;background-color:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c1917;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;background-color:#ffffff;border:1px solid #e7e5e4;border-radius:8px;padding:36px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
    <!-- Cabeçalho com Logotipo Minimalista -->
    <div style="margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #f5f5f4;">
      <img src="${escaparHtmlSeguro(urlLogo)}" alt="Nexo Ativo" width="128" style="display:block;border:0;outline:none;max-width:130px;height:auto;"/>
    </div>
    
    ${blocoTituloSuperior}
    
    <h1 style="margin:0 0 20px 0;font-size:22px;font-weight:600;letter-spacing:-0.02em;color:#0c0a09;line-height:1.3;">
      ${escaparHtmlSeguro(opcoes.tituloPrincipal)}
    </h1>
    
    <div style="font-size:14px;line-height:1.65;color:#292524;">
      ${opcoes.conteudoCorpoHtml}
    </div>
    
    ${blocoBotao}
    ${blocoNotasRodape}
  </div>
  
  <div style="max-width:560px;margin:16px auto 0 auto;text-align:center;font-size:11px;color:#a8a29e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <p style="margin:0;">Nexo Ativo · Plataforma Editorial para Profissionais e Negócios</p>
  </div>
</body>
</html>`;
}

export interface ParametrosTemplateEmailRecuperacaoSenha {
  readonly emailDestinatario: string;
  readonly linkRedefinicao: string;
  readonly remetente?: string;
  readonly urlLogo?: string;
}

/**
 * Constrói o e-mail transacional de recuperação de senha minimalista com a identidade do Nexo Ativo.
 */
export function construirEmailRecuperacaoSenha(
  parametros: ParametrosTemplateEmailRecuperacaoSenha,
): MensagemEmailTransacional {
  const { emailDestinatario, linkRedefinicao } = parametros;
  const assunto = "Redefinição de senha de acesso · Nexo Ativo";

  const conteudoCorpoHtml = `
    <p style="margin:0 0 14px 0;">Olá,</p>
    <p style="margin:0 0 14px 0;">
      Recebemos uma solicitação para redefinir a senha da sua conta associada ao e-mail <strong>${escaparHtmlSeguro(emailDestinatario)}</strong>.
    </p>
    <p style="margin:0 0 14px 0;">
      Para escolher uma nova senha e restabelecer seu acesso, clique no botão seguro abaixo:
    </p>
  `;

  const notasRodapeHtml = `
    <p style="margin:0 0 8px 0;">
      Se você não solicitou a redefinição de senha, desconsidere esta mensagem com segurança. Sua senha atual permanecerá inalterada.
    </p>
    <p style="margin:0;font-size:11px;color:#a8a29e;word-break:break-all;">
      Caso o botão não funcione, copie e cole este endereço no seu navegador:<br/>
      <a href="${escaparHtmlSeguro(linkRedefinicao)}" style="color:#57534e;text-decoration:underline;">${escaparHtmlSeguro(linkRedefinicao)}</a>
    </p>
  `;

  const html = renderizarLayoutBaseEmail({
    tituloSuperior: "Segurança de Acesso",
    tituloPrincipal: "Redefinir sua senha",
    conteudoCorpoHtml,
    botaoAcaoOpcional: {
      texto: "Redefinir minha senha",
      link: linkRedefinicao,
    },
    notasRodapeHtml,
    urlLogo: parametros.urlLogo,
  });

  const textoPuro = [
    "Redefinição de senha · Nexo Ativo",
    "",
    `Olá,`,
    `Recebemos uma solicitação para redefinir a senha da sua conta (${emailDestinatario}).`,
    "",
    `Acesse o link seguro abaixo para criar uma nova senha:`,
    linkRedefinicao,
    "",
    "Se você não solicitou a redefinição, apenas desconsidere esta mensagem.",
    "Nexo Ativo · Plataforma Editorial",
  ].join("\n");

  const hashIdempotencia = Buffer.from(`${emailDestinatario}-${new Date().toISOString().slice(0, 13)}`).toString("base64url");

  return {
    chaveIdempotencia: `recuperar-senha-${hashIdempotencia}`,
    de: parametros.remetente ?? REMETENTE_PADRAO_FLUXO,
    para: [emailDestinatario],
    assunto,
    html,
    textoPuro,
  };
}

export interface ParametrosTemplateEmailEquipe {
  readonly solicitacao: SolicitacaoComercial;
  readonly nomeOrganizacao: string;
  readonly destinatarios: readonly string[];
  readonly responderParaOpcional?: string;
  readonly remetente?: string;
  readonly urlLogo?: string;
}

/**
 * Constrói o e-mail transacional idempotente enviado à equipe da organização
 * sempre que uma nova solicitação comercial é registrada.
 */
export function construirEmailNovaSolicitacaoEquipe(
  parametros: ParametrosTemplateEmailEquipe,
): MensagemEmailTransacional {
  const { solicitacao, nomeOrganizacao, destinatarios } = parametros;
  const itemInteresse =
    solicitacao.servicoNome ?? solicitacao.produtoNome ?? solicitacao.tituloExperiencia;
  const linkWhatsapp = gerarLinkRetornoWhatsappSolicitacao(solicitacao, nomeOrganizacao);

  const assunto = `Nova solicitação em ${nomeOrganizacao}: ${solicitacao.nomeVisitante} (${itemInteresse})`;

  const linhasDemonstrativoHtml = solicitacao.demonstrativoComercialCongelado
    ? solicitacao.demonstrativoComercialCongelado.linhas
        .map((linha) => {
          const valorFormatado = ValorMonetarioCentavos.deCentavos(
            linha.subtotalCentavos,
          ).formatarMoedaBrasileira();
          return `<li style="margin-bottom:4px;">${escaparHtmlSeguro(linha.rotulo)}: <strong>${escaparHtmlSeguro(valorFormatado)}</strong></li>`;
        })
        .join("")
    : "";

  const blocoDemonstrativoHtml = solicitacao.demonstrativoComercialCongelado
    ? `<div style="margin-top:16px;padding:14px;background-color:#fafaf9;border:1px solid #e7e5e4;border-radius:6px;">
        <p style="margin:0 0 6px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#78716c;font-weight:600;">Valor Histórico Preservado</p>
        <p style="margin:0 0 8px 0;font-size:18px;font-weight:700;color:#0c0a09;">${escaparHtmlSeguro(solicitacao.demonstrativoComercialCongelado.resumoFormatado)}</p>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#44403c;">${linhasDemonstrativoHtml}</ul>
      </div>`
    : "";

  const blocoRespostasHtml =
    solicitacao.respostasRegistradas.length > 0
      ? `<div style="margin-top:16px;padding:14px;background-color:#fafaf9;border:1px solid #e7e5e4;border-radius:6px;">
          <p style="margin:0 0 8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#78716c;font-weight:600;">Respostas no Microfluxo</p>
          ${solicitacao.respostasRegistradas
            .map(
              (resp) =>
                `<p style="margin:0 0 6px 0;font-size:13px;color:#1c1917;"><strong>${escaparHtmlSeguro(resp.pergunta)}:</strong> ${escaparHtmlSeguro(resp.respostaTexto)}</p>`,
            )
            .join("")}
        </div>`
      : "";

  const blocoObservacaoHtml = solicitacao.mensagemAdicional
    ? `<p style="margin:12px 0 0 0;font-size:13px;color:#44403c;"><strong>Observação complementar:</strong> ${escaparHtmlSeguro(solicitacao.mensagemAdicional)}</p>`
    : "";

  const conteudoCorpoHtml = `
    <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#292524;">
      <strong>Visitante:</strong> ${escaparHtmlSeguro(solicitacao.nomeVisitante)}<br/>
      <strong>WhatsApp / Telefone:</strong> ${escaparHtmlSeguro(solicitacao.telefoneOuWhatsapp)}<br/>
      ${solicitacao.emailVisitante ? `<strong>E-mail:</strong> ${escaparHtmlSeguro(solicitacao.emailVisitante)}<br/>` : ""}
      <strong>Experiência:</strong> ${escaparHtmlSeguro(solicitacao.tituloExperiencia)}<br/>
      <strong>Interesse principal:</strong> ${escaparHtmlSeguro(itemInteresse)}<br/>
      <strong>Protocolo:</strong> <code style="font-size:12px;background:#f5f5f4;padding:2px 6px;border-radius:4px;">${escaparHtmlSeguro(solicitacao.id)}</code>
    </p>
    ${blocoDemonstrativoHtml}
    ${blocoRespostasHtml}
    ${blocoObservacaoHtml}
  `;

  const html = renderizarLayoutBaseEmail({
    tituloSuperior: `Central Comercial · ${nomeOrganizacao}`,
    tituloPrincipal: "Nova solicitação recebida",
    conteudoCorpoHtml,
    botaoAcaoOpcional: {
      texto: `Responder a ${solicitacao.nomeVisitante} no WhatsApp`,
      link: linkWhatsapp,
    },
    urlLogo: parametros.urlLogo,
  });

  const linhasTexto: string[] = [
    `Nova solicitação recebida em ${nomeOrganizacao}`,
    `Protocolo: ${solicitacao.id}`,
    `Visitante: ${solicitacao.nomeVisitante}`,
    `WhatsApp / Telefone: ${solicitacao.telefoneOuWhatsapp}`,
  ];
  if (solicitacao.emailVisitante) {
    linhasTexto.push(`E-mail: ${solicitacao.emailVisitante}`);
  }
  linhasTexto.push(`Experiência: ${solicitacao.tituloExperiencia}`);
  linhasTexto.push(`Interesse: ${itemInteresse}`);
  if (solicitacao.demonstrativoComercialCongelado) {
    linhasTexto.push(
      `Valor Histórico Preservado: ${solicitacao.demonstrativoComercialCongelado.resumoFormatado}`,
    );
  }
  for (const resp of solicitacao.respostasRegistradas) {
    linhasTexto.push(`- ${resp.pergunta}: ${resp.respostaTexto}`);
  }
  if (solicitacao.mensagemAdicional) {
    linhasTexto.push(`Observação: ${solicitacao.mensagemAdicional}`);
  }
  linhasTexto.push(`Responder no WhatsApp: ${linkWhatsapp}`);

  const responderPara = solicitacao.emailVisitante ?? parametros.responderParaOpcional;

  return {
    chaveIdempotencia: `email-equipe-${solicitacao.id}`,
    de: parametros.remetente ?? REMETENTE_PADRAO_FLUXO,
    para: destinatarios,
    ...(responderPara ? { responderParaOpcional: responderPara } : {}),
    assunto,
    html,
    textoPuro: linhasTexto.join("\n"),
  };
}

export interface ParametrosTemplateEmailVisitante {
  readonly solicitacao: SolicitacaoComercial;
  readonly nomeOrganizacao: string;
  readonly emailVisitante: string;
  readonly responderParaOpcional?: string;
  readonly remetente?: string;
  readonly urlLogo?: string;
}

/**
 * Constrói o e-mail editorial de confirmação enviado ao visitante que concluiu
 * um microfluxo e informou seu endereço de e-mail.
 */
export function construirEmailConfirmacaoVisitante(
  parametros: ParametrosTemplateEmailVisitante,
): MensagemEmailTransacional {
  const { solicitacao, nomeOrganizacao, emailVisitante } = parametros;
  const itemInteresse =
    solicitacao.servicoNome ?? solicitacao.produtoNome ?? solicitacao.tituloExperiencia;

  const assunto = `Recebemos sua solicitação em ${nomeOrganizacao}`;

  const blocoResumoComercialHtml = solicitacao.demonstrativoComercialCongelado
    ? `<div style="margin-top:16px;padding:14px;background-color:#fafaf9;border:1px solid #e7e5e4;border-radius:6px;">
        <p style="margin:0 0 4px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#78716c;font-weight:600;">Referência Comercial Registrada</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:#0c0a09;">${escaparHtmlSeguro(solicitacao.demonstrativoComercialCongelado.resumoFormatado)}</p>
      </div>`
    : "";

  const conteudoCorpoHtml = `
    <p style="margin:0 0 12px 0;">Olá, <strong>${escaparHtmlSeguro(solicitacao.nomeVisitante)}</strong>.</p>
    <p style="margin:0 0 12px 0;line-height:1.6;">
      Confirmamos o recebimento da sua solicitação referente a <strong>${escaparHtmlSeguro(itemInteresse)}</strong>.
      Nossa equipe já recebeu as suas preferências e retornará em breve pelo contato informado (${escaparHtmlSeguro(solicitacao.telefoneOuWhatsapp)}).
    </p>
    ${blocoResumoComercialHtml}
    <p style="margin:18px 0 0 0;font-size:12px;color:#78716c;">
      Protocolo de atendimento: <code style="font-size:12px;background:#f5f5f4;padding:2px 6px;border-radius:4px;">${escaparHtmlSeguro(solicitacao.id)}</code>
    </p>
  `;

  const html = renderizarLayoutBaseEmail({
    tituloSuperior: nomeOrganizacao,
    tituloPrincipal: `Solicitação registrada com sucesso`,
    conteudoCorpoHtml,
    urlLogo: parametros.urlLogo,
  });

  const linhasTexto = [
    `Olá, ${solicitacao.nomeVisitante}.`,
    `Confirmamos o recebimento da sua solicitação em ${nomeOrganizacao} referente a "${itemInteresse}".`,
    ...(solicitacao.demonstrativoComercialCongelado
      ? [`Referência comercial: ${solicitacao.demonstrativoComercialCongelado.resumoFormatado}`]
      : []),
    `Protocolo de atendimento: ${solicitacao.id}`,
  ];

  return {
    chaveIdempotencia: `email-visitante-${solicitacao.id}`,
    de: parametros.remetente ?? REMETENTE_PADRAO_FLUXO,
    para: [emailVisitante],
    ...(parametros.responderParaOpcional
      ? { responderParaOpcional: parametros.responderParaOpcional }
      : {}),
    assunto,
    html,
    textoPuro: linhasTexto.join("\n\n"),
  };
}

