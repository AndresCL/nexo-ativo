/**
 * Configuração editorial de notificações e e-mails transacionais de uma organização.
 * Armazenada em `organizacoes/{organizacaoId}/configuracoes/email`.
 * Importante: nunca contém `enviosNoMesAtual` no documento de configuração para
 * cumprir a regra de segurança `!request.resource.data.keys().hasAny(['enviosNoMesAtual'])`.
 */
export interface ConfiguracaoEmailOrganizacao {
  readonly organizacaoId: string;
  readonly notificarEquipeNovasSolicitacoes: boolean;
  readonly emailsDestinatariosEquipe: readonly string[];
  readonly enviarConfirmacaoVisitante: boolean;
  readonly emailRespostaOpcional?: string;
  readonly atualizadoEmIso: string;
}

/**
 * Consumo mensal de envios de e-mail transacional da organização.
 * Armazenado pelo backend em `organizacoes/{organizacaoId}/metricasDiarias/email-{AAAA-MM}`.
 */
export interface ConsumoMensalEmailOrganizacao {
  readonly anoMesIso: string;
  readonly enviosNoMesAtual: number;
  readonly limiteMensalPlano: number;
  readonly chavesIdempotenciaProcessadas?: readonly string[];
  readonly atualizadoEmIso: string;
}

/**
 * Contrato agnóstico de mensagem de e-mail transacional com chave de idempotência.
 */
export interface MensagemEmailTransacional {
  readonly chaveIdempotencia: string;
  readonly de: string;
  readonly para: readonly string[];
  readonly responderParaOpcional?: string;
  readonly assunto: string;
  readonly html: string;
  readonly textoPuro: string;
}

/**
 * Cria a configuração padrão de e-mail para uma organização quando ainda não configurada.
 */
export function criarConfiguracaoEmailPadraoOrganizacao(
  organizacaoId: string,
  emailInicialOpcional?: string,
  agoraIso = new Date().toISOString(),
): ConfiguracaoEmailOrganizacao {
  const emailLimpo = emailInicialOpcional?.trim().toLowerCase();
  return {
    organizacaoId,
    notificarEquipeNovasSolicitacoes: true,
    emailsDestinatariosEquipe: emailLimpo ? [emailLimpo] : [],
    enviarConfirmacaoVisitante: true,
    ...(emailLimpo ? { emailRespostaOpcional: emailLimpo } : {}),
    atualizadoEmIso: agoraIso,
  };
}

/**
 * Extrai a chave de competência mensal `AAAA-MM` a partir de uma data ISO.
 */
export function extrairAnoMesReferenciaIso(dataIso = new Date().toISOString()): string {
  const correspondencia = /^(\d{4}-\d{2})/.exec(dataIso.trim());
  if (correspondencia?.[1]) {
    return correspondencia[1];
  }
  return new Date().toISOString().slice(0, 7);
}
