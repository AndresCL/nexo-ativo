import type { Firestore } from "firebase-admin/firestore";
import {
  CATALOGO_PLANOS_FLUXO,
  converterReaisParaCentavosInteiros,
  mapearSituacaoCobrancaParaAssinatura,
  type CobrancaHistoricoAsaas,
  type FormaPagamentoAsaas,
  type SituacaoCobrancaAsaas,
} from "../../../src/dominio/assinaturas/tiposAssinaturaAsaas";
import type {
  CodigoPlanoAssinatura,
  Organizacao,
  ResumoDireitosPlano,
  SituacaoResumoAssinatura,
} from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import { ErroValidacaoDominio } from "../../../src/dominio/erros/errosDominio";
import { esquemaPayloadWebhookAsaas } from "../../../src/validacoes/esquemasAssinaturaAsaas";

export interface ResultadoProcessamentoWebhookAsaas {
  readonly processado: boolean;
  readonly duplicado: boolean;
  readonly eventoId: string;
  readonly tipoEvento: string;
  readonly organizacaoId?: string;
  readonly situacaoAssinaturaAtualizada?: SituacaoResumoAssinatura;
}

/**
 * Processa de forma atômica e idempotente as notificações enviadas pelo Webhook oficial do Asaas.
 */
export async function executarProcessamentoWebhookAsaasTransacional(
  bancoDados: Firestore,
  payloadBruto: unknown,
): Promise<ResultadoProcessamentoWebhookAsaas> {
  const validacao = esquemaPayloadWebhookAsaas.safeParse(payloadBruto);
  if (!validacao.success) {
    throw new ErroValidacaoDominio("Carga útil de webhook Asaas inválida.", "WEBHOOK_INVALIDO");
  }

  const payload = validacao.data;
  const eventoTipo = payload.event;
  const pagamento = payload.payment;
  const assinatura = payload.subscription;

  // Chave de idempotência única baseada no evento ou no status do pagamento
  const eventoId =
    payload.id ||
    `${eventoTipo}-${pagamento?.id || assinatura?.id || "desconhecido"}-${pagamento?.status || assinatura?.status || "sem-status"}`;

  const refEventoWebhook = bancoDados.collection("eventosWebhookAsaas").doc(eventoId);

  const docEventoExistente = await refEventoWebhook.get();
  if (docEventoExistente.exists) {
    return {
      processado: true,
      duplicado: true,
      eventoId,
      tipoEvento: eventoTipo,
    };
  }

  const agoraIso = new Date().toISOString();

  // Localizar a organização associada
  const organizacaoId =
    pagamento?.externalReference ||
    assinatura?.externalReference ||
    (await buscarOrganizacaoPorClienteOuAssinatura(
      bancoDados,
      pagamento?.customer || assinatura?.customer,
      pagamento?.subscription || assinatura?.id,
    ));

  if (!organizacaoId) {
    // Registra o evento para não reprocessar, mesmo sem organização vinculada
    await refEventoWebhook.set({
      id: eventoId,
      evento: eventoTipo,
      processado: false,
      motivoNaoProcessado: "ORGANIZACAO_NAO_ENCONTRADA",
      recebidoEmIso: agoraIso,
      payloadBruto,
    });

    return {
      processado: false,
      duplicado: false,
      eventoId,
      tipoEvento: eventoTipo,
    };
  }

  const refOrg = bancoDados.collection("organizacoes").doc(organizacaoId);
  const refAssinaturaGlobal = bancoDados.collection("assinaturas").doc(organizacaoId);
  const refCobrancaHistorico = pagamento
    ? bancoDados
        .collection("organizacoes")
        .doc(organizacaoId)
        .collection("cobrancasAsaas")
        .doc(pagamento.id)
    : null;

  let situacaoFinalCalculada: SituacaoResumoAssinatura | undefined;

  await bancoDados.runTransaction(async (transacao) => {
    const [docOrg, docAssinatura] = await Promise.all([
      transacao.get(refOrg),
      transacao.get(refAssinaturaGlobal),
    ]);

    if (!docOrg.exists) {
      return;
    }

    const organizacao = docOrg.data() as Organizacao;
    const dadosAssinatura = docAssinatura.exists ? docAssinatura.data() : null;

    let novaSituacaoAssinatura = organizacao.resumoDireitosPlano.situacaoAssinatura;

    if (pagamento) {
      const situacaoCobranca = pagamento.status as SituacaoCobrancaAsaas;
      novaSituacaoAssinatura = mapearSituacaoCobrancaParaAssinatura(situacaoCobranca);
      situacaoFinalCalculada = novaSituacaoAssinatura;

      if (refCobrancaHistorico) {
        const registroCobranca: CobrancaHistoricoAsaas = {
          id: pagamento.id,
          organizacaoId,
          cobrancaAsaasId: pagamento.id,
          ...(pagamento.subscription ? { assinaturaAsaasId: pagamento.subscription } : {}),
          valorCentavos: converterReaisParaCentavosInteiros(pagamento.value),
          formaPagamento: (pagamento.billingType as FormaPagamentoAsaas) || "UNDEFINED",
          situacao: situacaoCobranca,
          dataVencimentoIso: pagamento.dueDate,
          ...(pagamento.invoiceUrl ? { urlFaturaOuComprovante: pagamento.invoiceUrl } : {}),
          ...(pagamento.paymentDate ? { dataPagamentoIso: pagamento.paymentDate } : {}),
          criadoEmIso: agoraIso,
          atualizadoEmIso: agoraIso,
        };

        transacao.set(refCobrancaHistorico, registroCobranca, { merge: true });
      }
    } else if (eventoTipo === "SUBSCRIPTION_INACTIVATED") {
      novaSituacaoAssinatura = "suspensa";
      situacaoFinalCalculada = "suspensa";
    } else if (eventoTipo === "SUBSCRIPTION_DELETED") {
      novaSituacaoAssinatura = "cancelada";
      situacaoFinalCalculada = "cancelada";
    }

    const planoCodigo = (dadosAssinatura?.planoCodigo ||
      organizacao.resumoDireitosPlano.planoCodigo) as CodigoPlanoAssinatura;
    const planoDefinicao = CATALOGO_PLANOS_FLUXO[planoCodigo] || CATALOGO_PLANOS_FLUXO.pro;

    const inadimplenteDesdeAtual = organizacao.resumoDireitosPlano.inadimplenteDesde;
    const manterInadimplenteDesde =
      novaSituacaoAssinatura === "inadimplente" ||
      novaSituacaoAssinatura === "em_carencia" ||
      novaSituacaoAssinatura === "suspensa";
    const proximoInadimplenteDesde = manterInadimplenteDesde
      ? inadimplenteDesdeAtual || agoraIso
      : undefined;

    const novoResumoDireitosPlano: ResumoDireitosPlano = {
      planoCodigo,
      situacaoAssinatura: novaSituacaoAssinatura,
      limiteProfissionaisAtivos: planoDefinicao.limiteProfissionaisAtivos,
      limiteEnviosEmailMensal: planoDefinicao.limiteEnviosEmailMensal,
      permitePublicacaoPublica:
        novaSituacaoAssinatura === "ativa" ||
        novaSituacaoAssinatura === "em_carencia" ||
        novaSituacaoAssinatura === "inadimplente",
      ...(proximoInadimplenteDesde ? { inadimplenteDesde: proximoInadimplenteDesde } : {}),
    };

    transacao.update(refOrg, {
      resumoDireitosPlano: novoResumoDireitosPlano,
      atualizadoEmIso: agoraIso,
    });

    if (docAssinatura.exists) {
      transacao.update(refAssinaturaGlobal, {
        situacaoInterna: novaSituacaoAssinatura,
        atualizadoEmIso: agoraIso,
      });
    }

    // Grava o evento na coleção de controle de idempotência
    transacao.set(refEventoWebhook, {
      id: eventoId,
      evento: eventoTipo,
      organizacaoId,
      processado: true,
      recebidoEmIso: agoraIso,
      payloadBruto,
    });
  });

  return {
    processado: true,
    duplicado: false,
    eventoId,
    tipoEvento: eventoTipo,
    organizacaoId,
    ...(situacaoFinalCalculada ? { situacaoAssinaturaAtualizada: situacaoFinalCalculada } : {}),
  };
}

async function buscarOrganizacaoPorClienteOuAssinatura(
  bancoDados: Firestore,
  clienteId?: string,
  assinaturaId?: string,
): Promise<string | undefined> {
  if (assinaturaId) {
    const snapAssinatura = await bancoDados
      .collection("assinaturas")
      .where("assinaturaAsaasId", "==", assinaturaId)
      .limit(1)
      .get();

    if (!snapAssinatura.empty) {
      return snapAssinatura.docs[0]?.data().organizacaoId as string;
    }
  }

  if (clienteId) {
    const snapCliente = await bancoDados
      .collection("clientesAsaas")
      .where("clienteAsaasId", "==", clienteId)
      .limit(1)
      .get();

    if (!snapCliente.empty) {
      return snapCliente.docs[0]?.data().organizacaoId as string;
    }
  }

  return undefined;
}
