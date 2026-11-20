import type { Firestore } from "firebase-admin/firestore";
import type {
  MembroOrganizacao,
  Organizacao,
  UsuarioAutenticado,
} from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import {
  ErroAcessoNegado,
  ErroValidacaoDominio,
} from "../../../src/dominio/erros/errosDominio";
import type { RegistroAssinaturaAsaas } from "../../../src/dominio/assinaturas/tiposAssinaturaAsaas";
import {
  criarProvedorAsaasPadrao,
  type PortaProvedorAsaas,
} from "../asaas/adaptadorAsaasCliente";

export interface ResultadoCancelamentoAssinaturaAsaas {
  readonly organizacaoId: string;
  readonly assinaturaAsaasId: string;
  readonly situacaoAssinatura: "cancelada";
}

/**
 * Cancela definitivamente a assinatura ativa de uma organização no Asaas
 * e atualiza o estado interno para "cancelada".
 */
export async function executarCancelamentoAssinaturaAsaas(
  bancoDados: Firestore,
  usuario: UsuarioAutenticado,
  dadosBrutos: unknown,
  provedorAsaas: PortaProvedorAsaas = criarProvedorAsaasPadrao(),
): Promise<ResultadoCancelamentoAssinaturaAsaas> {
  const organizacaoId =
    typeof dadosBrutos === "object" &&
    dadosBrutos !== null &&
    "organizacaoId" in dadosBrutos &&
    typeof (dadosBrutos as { organizacaoId?: unknown }).organizacaoId === "string"
      ? (dadosBrutos as { organizacaoId: string }).organizacaoId.trim()
      : "";

  if (!organizacaoId) {
    throw new ErroValidacaoDominio("Identificador da organização é obrigatório.", "DADOS_INVALIDOS");
  }

  const refOrg = bancoDados.collection("organizacoes").doc(organizacaoId);
  const docOrg = await refOrg.get();
  if (!docOrg.exists) {
    throw new ErroValidacaoDominio("Organização não encontrada.", "ORGANIZACAO_NAO_ENCONTRADA");
  }

  const refMembro = refOrg.collection("membros").doc(usuario.uid);
  const docMembro = await refMembro.get();
  if (!docMembro.exists) {
    throw new ErroAcessoNegado("Você não pertence a esta organização.");
  }

  const membro = docMembro.data() as MembroOrganizacao;
  if (
    membro.situacao !== "ativo" ||
    (membro.papel !== "proprietario" && membro.papel !== "administrador")
  ) {
    throw new ErroAcessoNegado(
      "Apenas proprietários e administradores ativos da organização podem cancelar a assinatura.",
    );
  }

  const refAssinatura = bancoDados.collection("assinaturas").doc(organizacaoId);
  const docAssinatura = await refAssinatura.get();
  if (!docAssinatura.exists) {
    throw new ErroValidacaoDominio(
      "Nenhuma assinatura encontrada para esta organização.",
      "ASSINATURA_NAO_ENCONTRADA",
    );
  }

  const assinatura = docAssinatura.data() as RegistroAssinaturaAsaas;
  if (assinatura.assinaturaAsaasId) {
    await provedorAsaas.cancelarAssinatura(assinatura.assinaturaAsaasId);
  }

  const agora = new Date();
  const agoraIso = agora.toISOString();
  const organizacao = docOrg.data() as Organizacao;

  // Ao cancelar a assinatura, a publicação pública é revogada imediatamente
  // a menos que haja explicitamente vigência paga restante registrada.
  // ProximoVencimento de fatura não paga NÃO concede vigência futura.
  const novoResumo = {
    planoCodigo: organizacao.resumoDireitosPlano.planoCodigo,
    situacaoAssinatura: "cancelada" as const,
    limiteProfissionaisAtivos: organizacao.resumoDireitosPlano.limiteProfissionaisAtivos,
    limiteEnviosEmailMensal: organizacao.resumoDireitosPlano.limiteEnviosEmailMensal,
    permitePublicacaoPublica: false,
    canceladaEmIso: agoraIso,
  };

  const batch = bancoDados.batch();

  // Cancela quaisquer cobranças pendentes futuras de ciclos que não serão mais usufruídos
  const refCobrancas = refOrg.collection("cobrancasAsaas");
  const snapCobrancasPendentes = await refCobrancas.where("situacao", "==", "PENDING").get();
  for (const docCob of snapCobrancasPendentes.docs) {
    const dadosCob = docCob.data();
    batch.delete(docCob.ref);

    if (dadosCob.cobrancaAsaasId) {
      await provedorAsaas.removerCobranca(dadosCob.cobrancaAsaasId as string);
    }
  }

  batch.update(refOrg, {
    resumoDireitosPlano: novoResumo,
    atualizadoEmIso: agoraIso,
  });
  batch.update(refAssinatura, {
    situacaoAsaas: "INACTIVE",
    situacaoInterna: "cancelada",
    canceladaEmIso: agoraIso,
    atualizadoEmIso: agoraIso,
  });
  await batch.commit();

  return {
    organizacaoId,
    assinaturaAsaasId: assinatura.assinaturaAsaasId,
    situacaoAssinatura: "cancelada",
  };
}
