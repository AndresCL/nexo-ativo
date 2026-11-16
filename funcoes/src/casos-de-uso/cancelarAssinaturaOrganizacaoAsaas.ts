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
  if (membro.situacao !== "ativo" || membro.papel !== "administrador") {
    throw new ErroAcessoNegado(
      "Apenas administradores ativos da organização podem cancelar a assinatura.",
    );
  }

  const refAssinatura = refOrg.collection("assinaturaAsaas").doc("atual");
  const docAssinatura = await refAssinatura.get();
  if (!docAssinatura.exists) {
    throw new ErroValidacaoDominio(
      "Nenhuma assinatura encontrada para esta organização.",
      "ASSINATURA_NAO_ENCONTRADA",
    );
  }

  const assinatura = docAssinatura.data() as RegistroAssinaturaAsaas;
  await provedorAsaas.cancelarAssinatura(assinatura.assinaturaAsaasId);

  const agoraIso = new Date().toISOString();
  const organizacao = docOrg.data() as Organizacao;

  const novoResumo = {
    planoCodigo: organizacao.resumoDireitosPlano.planoCodigo,
    situacaoAssinatura: "cancelada" as const,
    limiteProfissionaisAtivos: organizacao.resumoDireitosPlano.limiteProfissionaisAtivos,
    limiteEnviosEmailMensal: organizacao.resumoDireitosPlano.limiteEnviosEmailMensal,
    permitePublicacaoPublica: false,
  };

  const batch = bancoDados.batch();
  batch.update(refOrg, {
    resumoDireitosPlano: novoResumo,
    atualizadoEmIso: agoraIso,
  });
  batch.update(refAssinatura, {
    situacaoAsaas: "INACTIVE",
    atualizadoEmIso: agoraIso,
  });
  batch.set(
    bancoDados.collection("assinaturasAsaas").doc(assinatura.assinaturaAsaasId),
    {
      situacaoInterna: "cancelada",
      atualizadoEmIso: agoraIso,
    },
    { merge: true },
  );
  await batch.commit();

  return {
    organizacaoId,
    assinaturaAsaasId: assinatura.assinaturaAsaasId,
    situacaoAssinatura: "cancelada",
  };
}
