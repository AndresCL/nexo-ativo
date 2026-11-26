import type { Firestore } from "firebase-admin/firestore";
import { converterReaisParaCentavosInteiros } from "@/dominio/assinaturas/tiposAssinaturaAsaas";
import type { CobrancaParaHistoricoMrr } from "@/dominio/fundador/calculadoraHistoricoMrrFundador";

export interface ResultadoLeituraHistoricoMrrServidor {
  readonly cobrancasRecorrentes: readonly CobrancaParaHistoricoMrr[];
  readonly valorLiquidoFallbackPorOrg: ReadonlyMap<string, number>;
}

/**
 * Busca o último `netValue` registrado nos eventos de webhook Asaas apenas para
 * organizações que ainda não possuem `valorLiquidoCentavos` persistido.
 */
async function buscarLiquidoPorCobrancaNosWebhooks(
  bancoDadosAdmin: Firestore,
  organizacaoId: string,
): Promise<{
  readonly liquidoPorCobrancaId: ReadonlyMap<string, number>;
  readonly ultimoLiquidoAssinaturaCentavos?: number;
}> {
  const liquidoPorCobrancaId = new Map<string, number>();
  let ultimoLiquidoAssinaturaCentavos: number | undefined;
  let ultimaDataIso = "";

  try {
    const snapEventos = await bancoDadosAdmin
      .collection("eventosWebhookAsaas")
      .where("organizacaoId", "==", organizacaoId)
      .get();

    for (const docEvento of snapEventos.docs) {
      const dados = docEvento.data() as Record<string, unknown>;
      const payloadBruto = dados.payloadBruto as Record<string, unknown> | undefined;
      const payment = payloadBruto?.payment as Record<string, unknown> | undefined;
      if (!payment) continue;

      const status = typeof payment.status === "string" ? payment.status : "";
      if (status !== "RECEIVED" && status !== "CONFIRMED") continue;

      const netValue = Number(payment.netValue);
      if (!Number.isFinite(netValue) || netValue <= 0) continue;

      const liquidoCentavos = converterReaisParaCentavosInteiros(netValue);
      const cobrancaId = typeof payment.id === "string" ? payment.id : "";
      if (cobrancaId) {
        liquidoPorCobrancaId.set(cobrancaId, liquidoCentavos);
      }

      const temAssinatura =
        typeof payment.subscription === "string" && payment.subscription.trim().length > 0;
      const recebidoEmIso =
        typeof dados.recebidoEmIso === "string" ? dados.recebidoEmIso : "";
      if (temAssinatura && recebidoEmIso >= ultimaDataIso) {
        ultimaDataIso = recebidoEmIso;
        ultimoLiquidoAssinaturaCentavos = liquidoCentavos;
      }
    }
  } catch {
    // Fallback silencioso caso a coleção de webhooks não esteja acessível
  }

  return {
    liquidoPorCobrancaId,
    ...(ultimoLiquidoAssinaturaCentavos !== undefined ? { ultimoLiquidoAssinaturaCentavos } : {}),
  };
}

/**
 * Lê cobranças recorrentes por organização (sem exigir índice composto de collectionGroup)
 * e resolve fallback de valor líquido para documentos legados via `eventosWebhookAsaas`.
 */
export async function carregarHistoricoMrrServidor(
  bancoDadosAdmin: Firestore,
  organizacaoIds: readonly string[],
  orgsSemLiquidoNaAssinatura: ReadonlySet<string>,
): Promise<ResultadoLeituraHistoricoMrrServidor> {
  if (organizacaoIds.length === 0) {
    return {
      cobrancasRecorrentes: [],
      valorLiquidoFallbackPorOrg: new Map(),
    };
  }

  const snapshotsCobrancas = await Promise.all(
    organizacaoIds.map(async (orgId) => {
      const snap = await bancoDadosAdmin
        .collection("organizacoes")
        .doc(orgId)
        .collection("cobrancasAsaas")
        .get();
      return { orgId, docs: snap.docs };
    }),
  );

  const orgsQuePrecisamFallback = new Set<string>(orgsSemLiquidoNaAssinatura);
  for (const { orgId, docs } of snapshotsCobrancas) {
    for (const doc of docs) {
      const dados = doc.data() as Record<string, unknown>;
      const temAssinatura =
        typeof dados.assinaturaAsaasId === "string" && dados.assinaturaAsaasId.trim().length > 0;
      const situacao = typeof dados.situacao === "string" ? dados.situacao : "";
      const temLiquido =
        typeof dados.valorLiquidoCentavos === "number" &&
        Number.isFinite(dados.valorLiquidoCentavos) &&
        dados.valorLiquidoCentavos > 0;

      if (temAssinatura && (situacao === "RECEIVED" || situacao === "CONFIRMED") && !temLiquido) {
        orgsQuePrecisamFallback.add(orgId);
        break;
      }
    }
  }

  const fallbacksPorOrg = new Map<
    string,
    {
      readonly liquidoPorCobrancaId: ReadonlyMap<string, number>;
      readonly ultimoLiquidoAssinaturaCentavos?: number;
    }
  >();

  if (orgsQuePrecisamFallback.size > 0) {
    const resultadosFallback = await Promise.all(
      Array.from(orgsQuePrecisamFallback).map(async (orgId) => ({
        orgId,
        dados: await buscarLiquidoPorCobrancaNosWebhooks(bancoDadosAdmin, orgId),
      })),
    );
    for (const { orgId, dados } of resultadosFallback) {
      fallbacksPorOrg.set(orgId, dados);
    }
  }

  const cobrancasRecorrentes: CobrancaParaHistoricoMrr[] = [];
  const valorLiquidoFallbackPorOrg = new Map<string, number>();

  for (const { orgId, docs } of snapshotsCobrancas) {
    const fallbackOrg = fallbacksPorOrg.get(orgId);
    let ultimoLiquidoDaCobranca: { data: string; valor: number } | undefined;

    for (const doc of docs) {
      const dados = doc.data() as Record<string, unknown>;
      const assinaturaAsaasId =
        typeof dados.assinaturaAsaasId === "string" ? dados.assinaturaAsaasId : undefined;
      if (!assinaturaAsaasId) continue;

      const situacao = typeof dados.situacao === "string" ? dados.situacao : "";
      const valorCentavos = Number(dados.valorCentavos ?? 0);
      const valorLiquidoDireto = Number(dados.valorLiquidoCentavos ?? 0);
      const cobrancaId =
        typeof dados.cobrancaAsaasId === "string" ? dados.cobrancaAsaasId : doc.id;
      const valorLiquidoCentavos =
        Number.isFinite(valorLiquidoDireto) && valorLiquidoDireto > 0
          ? Math.round(valorLiquidoDireto)
          : fallbackOrg?.liquidoPorCobrancaId.get(cobrancaId);

      const dataVencimentoIso =
        typeof dados.dataVencimentoIso === "string" ? dados.dataVencimentoIso : undefined;
      const dataPagamentoIso =
        typeof dados.dataPagamentoIso === "string" ? dados.dataPagamentoIso : undefined;

      cobrancasRecorrentes.push({
        assinaturaAsaasId,
        valorCentavos: Number.isFinite(valorCentavos) ? Math.round(valorCentavos) : 0,
        ...(valorLiquidoCentavos !== undefined ? { valorLiquidoCentavos } : {}),
        situacao,
        ...(dataVencimentoIso ? { dataVencimentoIso } : {}),
        ...(dataPagamentoIso ? { dataPagamentoIso } : {}),
      });

      if (
        (situacao === "RECEIVED" || situacao === "CONFIRMED") &&
        valorLiquidoCentavos !== undefined
      ) {
        const dataRef = dataPagamentoIso || dataVencimentoIso || "";
        if (!ultimoLiquidoDaCobranca || dataRef >= ultimoLiquidoDaCobranca.data) {
          ultimoLiquidoDaCobranca = { data: dataRef, valor: valorLiquidoCentavos };
        }
      }
    }

    const liquidoResolvido =
      ultimoLiquidoDaCobranca?.valor ?? fallbackOrg?.ultimoLiquidoAssinaturaCentavos;
    if (liquidoResolvido !== undefined) {
      valorLiquidoFallbackPorOrg.set(orgId, liquidoResolvido);
    }
  }

  return {
    cobrancasRecorrentes,
    valorLiquidoFallbackPorOrg,
  };
}

