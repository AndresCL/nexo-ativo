import {
  gerarLinkRetornoWhatsappSolicitacao,
  type SolicitacaoComercial,
} from "../entidades/solicitacaoComercial";
import { ValorMonetarioCentavos } from "../objetos-valor/valorMonetarioCentavos";
import type { MensagemEmailTransacional } from "./tiposEmailTransacional";

const REMETENTE_PADRAO_FLUXO = "Nexo Ativo <notificacoes@nexoativo.com.br>";

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

export interface ParametrosTemplateEmailEquipe {
  readonly solicitacao: SolicitacaoComercial;
  readonly nomeOrganizacao: string;
  readonly destinatarios: readonly string[];
  readonly responderParaOpcional?: string;
  readonly remetente?: string;
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
    ? `<div style="margin-top:16px;padding:14px;background-color:#ffffff;border:1px solid #e6e0d4;border-radius:6px;">
        <p style="margin:0 0 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#5c5850;">Valor Histórico Preservado</p>
        <p style="margin:0 0 8px 0;font-size:18px;font-weight:700;color:#1b1a17;">${escaparHtmlSeguro(solicitacao.demonstrativoComercialCongelado.resumoFormatado)}</p>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#3d3a34;">${linhasDemonstrativoHtml}</ul>
      </div>`
    : "";

  const blocoRespostasHtml =
    solicitacao.respostasRegistradas.length > 0
      ? `<div style="margin-top:16px;padding:14px;background-color:#faf8f4;border:1px solid #e6e0d4;border-radius:6px;">
          <p style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#5c5850;">Respostas no Microfluxo</p>
          ${solicitacao.respostasRegistradas
            .map(
              (resp) =>
                `<p style="margin:0 0 6px 0;font-size:13px;color:#1b1a17;"><strong>${escaparHtmlSeguro(resp.pergunta)}:</strong> ${escaparHtmlSeguro(resp.respostaTexto)}</p>`,
            )
            .join("")}
        </div>`
      : "";

  const blocoObservacaoHtml = solicitacao.mensagemAdicional
    ? `<p style="margin:12px 0 0 0;font-size:13px;color:#3d3a34;"><strong>Observação complementar:</strong> ${escaparHtmlSeguro(solicitacao.mensagemAdicional)}</p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:24px;background-color:#f4f0e8;font-family:Georgia,serif;color:#1b1a17;">
  <div style="max-width:600px;margin:0 auto;background-color:#fdfbf7;border:1px solid #e6e0d4;border-radius:8px;padding:28px;">
    <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#6e6a61;">Central Comercial · ${escaparHtmlSeguro(nomeOrganizacao)}</p>
    <h1 style="margin:8px 0 16px 0;font-size:24px;font-weight:600;color:#1b1a17;">Nova solicitação recebida</h1>
    <p style="margin:0 0 12px 0;font-size:14px;line-height:1.5;color:#3d3a34;">
      <strong>Visitante:</strong> ${escaparHtmlSeguro(solicitacao.nomeVisitante)}<br/>
      <strong>WhatsApp / Telefone:</strong> ${escaparHtmlSeguro(solicitacao.telefoneOuWhatsapp)}<br/>
      ${solicitacao.emailVisitante ? `<strong>E-mail:</strong> ${escaparHtmlSeguro(solicitacao.emailVisitante)}<br/>` : ""}
      <strong>Experiência:</strong> ${escaparHtmlSeguro(solicitacao.tituloExperiencia)}<br/>
      <strong>Interesse principal:</strong> ${escaparHtmlSeguro(itemInteresse)}<br/>
      <strong>Protocolo:</strong> <code>${escaparHtmlSeguro(solicitacao.id)}</code>
    </p>
    ${blocoDemonstrativoHtml}
    ${blocoRespostasHtml}
    ${blocoObservacaoHtml}
    <div style="margin-top:22px;">
      <a href="${escaparHtmlSeguro(linkWhatsapp)}" style="display:inline-block;background-color:#1b1a17;color:#fdfbf7;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:13px;font-family:sans-serif;font-weight:600;">
        Responder a ${escaparHtmlSeguro(solicitacao.nomeVisitante)} no WhatsApp
      </a>
    </div>
  </div>
</body>
</html>`;

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
    ? `<div style="margin-top:16px;padding:14px;background-color:#ffffff;border:1px solid #e6e0d4;border-radius:6px;">
        <p style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#5c5850;">Referência Comercial Registrada</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:#1b1a17;">${escaparHtmlSeguro(solicitacao.demonstrativoComercialCongelado.resumoFormatado)}</p>
      </div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:24px;background-color:#f4f0e8;font-family:Georgia,serif;color:#1b1a17;">
  <div style="max-width:600px;margin:0 auto;background-color:#fdfbf7;border:1px solid #e6e0d4;border-radius:8px;padding:28px;">
    <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:#6e6a61;">${escaparHtmlSeguro(nomeOrganizacao)}</p>
    <h1 style="margin:8px 0 16px 0;font-size:22px;font-weight:600;color:#1b1a17;">Olá, ${escaparHtmlSeguro(solicitacao.nomeVisitante)}.</h1>
    <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#3d3a34;">
      Confirmamos o recebimento da sua solicitação referente a <strong>${escaparHtmlSeguro(itemInteresse)}</strong>.
      Nossa equipe já recebeu as suas preferências e retornará em breve pelo contato informado (${escaparHtmlSeguro(solicitacao.telefoneOuWhatsapp)}).
    </p>
    ${blocoResumoComercialHtml}
    <p style="margin:18px 0 0 0;font-size:12px;color:#6e6a61;">
      Protocolo de atendimento: <code>${escaparHtmlSeguro(solicitacao.id)}</code>
    </p>
  </div>
</body>
</html>`;

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
