import {
  formatarDataExtensoPtBr,
  formatarRotuloFusoHorario,
} from "../agenda/calendarioDatas";
import type { AgendamentoAgenda } from "../agenda/tiposAgenda";
import { normalizarNumeroWhatsappInternacional } from "../servicos/numeroWhatsappInternacional";
import {
  escaparHtmlSeguro,
  REMETENTE_PADRAO_FLUXO,
  renderizarLayoutBaseEmail,
} from "./templatesEmailEditorial";
import type { MensagemEmailTransacional } from "./tiposEmailTransacional";

export interface ParametrosEmailConfirmacaoAgendamentoVisitante {
  readonly agendamento: AgendamentoAgenda;
  readonly nomeOrganizacao: string;
  readonly responderParaOpcional?: string;
  readonly remetente?: string;
  readonly urlLogo?: string;
}

export interface ParametrosEmailNovoAgendamentoEquipe {
  readonly agendamento: AgendamentoAgenda;
  readonly nomeOrganizacao: string;
  readonly destinatarios: readonly string[];
  readonly responderParaOpcional?: string;
  readonly remetente?: string;
  readonly urlLogo?: string;
  readonly urlPainelBase?: string;
}

/**
 * Constrói o e-mail transacional de confirmação enviado ao visitante ao concluir uma reserva.
 */
export function construirEmailConfirmacaoAgendamentoVisitante(
  parametros: ParametrosEmailConfirmacaoAgendamentoVisitante,
): MensagemEmailTransacional {
  const { agendamento, nomeOrganizacao } = parametros;
  const dataExtenso = formatarDataExtensoPtBr(agendamento.dataIso);
  const fusoLegivel = formatarRotuloFusoHorario(agendamento.fusoHorario);
  const assunto = `Agendamento confirmado · ${dataExtenso} às ${agendamento.horarioInicio} · ${nomeOrganizacao}`;

  const blocoObservacoes = agendamento.observacoesVisitante?.trim()
    ? `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#78716c;font-size:13px;vertical-align:top;">Observações</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#1c1917;font-size:13px;">${escaparHtmlSeguro(agendamento.observacoesVisitante.trim())}</td>
      </tr>`
    : "";

  const conteudoCorpoHtml = `
    <p style="margin:0 0 14px 0;">Olá, <strong>${escaparHtmlSeguro(agendamento.nomeVisitante)}</strong>.</p>
    <p style="margin:0 0 20px 0;">
      Seu agendamento com <strong>${escaparHtmlSeguro(nomeOrganizacao)}</strong> está confirmado. Confira abaixo os detalhes da sua reserva:
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;border-top:1px solid #e7e5e4;margin:0 0 20px 0;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#78716c;font-size:13px;width:36%;">Código</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#0c0a09;font-size:13px;font-weight:700;letter-spacing:0.06em;">${escaparHtmlSeguro(agendamento.codigoConfirmacao)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#78716c;font-size:13px;">Data</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#0c0a09;font-size:13px;font-weight:600;">${escaparHtmlSeguro(dataExtenso)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#78716c;font-size:13px;">Horário</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#0c0a09;font-size:13px;font-weight:600;">${escaparHtmlSeguro(agendamento.horarioInicio)} – ${escaparHtmlSeguro(agendamento.horarioFim)} (${agendamento.duracaoMinutos} min)</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#78716c;font-size:13px;">Fuso horário</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#1c1917;font-size:13px;">${escaparHtmlSeguro(fusoLegivel)}</td>
      </tr>
      ${blocoObservacoes}
    </table>
  `;

  const notasRodapeHtml = `
    <p style="margin:0;">
      Precisa reagendar ou tirar alguma dúvida? Basta responder a este e-mail ou entrar em contato diretamente com <strong>${escaparHtmlSeguro(nomeOrganizacao)}</strong> informando o código <strong>${escaparHtmlSeguro(agendamento.codigoConfirmacao)}</strong>.
    </p>
  `;

  const html = renderizarLayoutBaseEmail({
    tituloSuperior: nomeOrganizacao,
    tituloPrincipal: "Seu horário está reservado",
    conteudoCorpoHtml,
    notasRodapeHtml,
    urlLogo: parametros.urlLogo,
  });

  const textoPuro = [
    `${nomeOrganizacao} — Agendamento Confirmado`,
    "",
    `Olá, ${agendamento.nomeVisitante}.`,
    `Seu agendamento está confirmado:`,
    "",
    `Código: ${agendamento.codigoConfirmacao}`,
    `Data: ${dataExtenso}`,
    `Horário: ${agendamento.horarioInicio} – ${agendamento.horarioFim} (${agendamento.duracaoMinutos} min · ${fusoLegivel})`,
    ...(agendamento.observacoesVisitante?.trim()
      ? [`Observações: ${agendamento.observacoesVisitante.trim()}`]
      : []),
    "",
    `Caso precise reagendar, responda a este e-mail informando o código ${agendamento.codigoConfirmacao}.`,
  ].join("\n");

  return {
    chaveIdempotencia: `agendamento-visitante-${agendamento.id}`,
    de: parametros.remetente ?? REMETENTE_PADRAO_FLUXO,
    para: [agendamento.emailVisitante],
    ...(parametros.responderParaOpcional
      ? { responderParaOpcional: parametros.responderParaOpcional }
      : {}),
    assunto,
    html,
    textoPuro,
  };
}

/**
 * Constrói o e-mail transacional de aviso para a equipe da organização sobre nova reserva.
 */
export function construirEmailNovoAgendamentoEquipe(
  parametros: ParametrosEmailNovoAgendamentoEquipe,
): MensagemEmailTransacional {
  const { agendamento, nomeOrganizacao, destinatarios } = parametros;
  const dataExtenso = formatarDataExtensoPtBr(agendamento.dataIso);
  const assunto = `Novo agendamento: ${agendamento.nomeVisitante} · ${dataExtenso} às ${agendamento.horarioInicio}`;

  const urlBase = (parametros.urlPainelBase ?? "https://nexoativo.com.br").replace(/\/$/, "");
  const linkAgendaPainel = `${urlBase}/painel/agenda`;

  const digitosWhatsapp = agendamento.telefoneOuWhatsapp
    ? normalizarNumeroWhatsappInternacional(agendamento.telefoneOuWhatsapp)
    : "";

  const blocoTelefone = agendamento.telefoneOuWhatsapp?.trim()
    ? `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#78716c;font-size:13px;">Telefone / WhatsApp</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#1c1917;font-size:13px;">
          ${escaparHtmlSeguro(agendamento.telefoneOuWhatsapp.trim())}
          ${digitosWhatsapp ? ` · <a href="https://wa.me/${digitosWhatsapp}" style="color:#166534;font-weight:600;text-decoration:none;">Abrir WhatsApp</a>` : ""}
        </td>
      </tr>`
    : "";

  const blocoObservacoes = agendamento.observacoesVisitante?.trim()
    ? `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#78716c;font-size:13px;vertical-align:top;">Observações</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#1c1917;font-size:13px;">${escaparHtmlSeguro(agendamento.observacoesVisitante.trim())}</td>
      </tr>`
    : "";

  const conteudoCorpoHtml = `
    <p style="margin:0 0 16px 0;">
      Um visitante reservou um horário na agenda de <strong>${escaparHtmlSeguro(nomeOrganizacao)}</strong> pela experiência <em>${escaparHtmlSeguro(agendamento.tituloExperiencia)}</em>.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;border-top:1px solid #e7e5e4;margin:0 0 20px 0;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#78716c;font-size:13px;width:36%;">Código</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#0c0a09;font-size:13px;font-weight:700;">${escaparHtmlSeguro(agendamento.codigoConfirmacao)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#78716c;font-size:13px;">Data e horário</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#0c0a09;font-size:13px;font-weight:600;">${escaparHtmlSeguro(dataExtenso)} · ${escaparHtmlSeguro(agendamento.horarioInicio)} – ${escaparHtmlSeguro(agendamento.horarioFim)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#78716c;font-size:13px;">Visitante</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#0c0a09;font-size:13px;font-weight:600;">${escaparHtmlSeguro(agendamento.nomeVisitante)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#78716c;font-size:13px;">E-mail</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f4;color:#1c1917;font-size:13px;">${escaparHtmlSeguro(agendamento.emailVisitante)}</td>
      </tr>
      ${blocoTelefone}
      ${blocoObservacoes}
    </table>
  `;

  const html = renderizarLayoutBaseEmail({
    tituloSuperior: "Nova Reserva na Agenda",
    tituloPrincipal: `${agendamento.nomeVisitante} reservou um horário`,
    conteudoCorpoHtml,
    botaoAcaoOpcional: {
      texto: "Ver agenda no painel",
      link: linkAgendaPainel,
    },
    urlLogo: parametros.urlLogo,
  });

  const textoPuro = [
    `Nova reserva na agenda — ${nomeOrganizacao}`,
    "",
    `Código: ${agendamento.codigoConfirmacao}`,
    `Data: ${dataExtenso}`,
    `Horário: ${agendamento.horarioInicio} – ${agendamento.horarioFim}`,
    `Visitante: ${agendamento.nomeVisitante}`,
    `E-mail: ${agendamento.emailVisitante}`,
    ...(agendamento.telefoneOuWhatsapp?.trim()
      ? [`Telefone: ${agendamento.telefoneOuWhatsapp.trim()}`]
      : []),
    ...(agendamento.observacoesVisitante?.trim()
      ? [`Observações: ${agendamento.observacoesVisitante.trim()}`]
      : []),
    "",
    `Acesse sua agenda: ${linkAgendaPainel}`,
  ].join("\n");

  return {
    chaveIdempotencia: `agendamento-equipe-${agendamento.id}`,
    de: parametros.remetente ?? REMETENTE_PADRAO_FLUXO,
    para: destinatarios,
    responderParaOpcional: agendamento.emailVisitante,
    assunto,
    html,
    textoPuro,
  };
}

