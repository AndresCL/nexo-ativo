import type { Firestore } from "firebase-admin/firestore";
import {
  CATALOGO_PLANOS_FLUXO,
  type RegistroAssinaturaAsaas,
  type RegistroClienteAsaas,
} from "../../../src/dominio/assinaturas/tiposAssinaturaAsaas";
import type {
  MembroOrganizacao,
  Organizacao,
  UsuarioAutenticado,
} from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import { ErroValidacaoDominio } from "../../../src/dominio/erros/errosDominio";
import { exigirPermissaoOrganizacao } from "../../../src/dominio/permissoes/autorizadorOrganizacao";
import { criarProvedorAsaasPadrao, type PortaProvedorAsaas } from "../asaas/adaptadorAsaasCliente";

export interface EntradaRestabelecerAssinatura {
  readonly organizacaoId: string;
}

export interface ResultadoRestabelecerAssinatura {
  readonly organizacaoId: string;
  readonly situacaoAssinatura: "ativa";
  readonly proximoVencimentoIso: string;
}

/**
 * Restabelece a renovação automática da assinatura de uma organização que havia sido cancelada,
 * agendando a cobrança no Asaas exatamente para o término da vigência já paga, SEM cobrar no ato.
 */
export async function executarRestabelecimentoAssinaturaAsaas(
  bancoDados: Firestore,
  usuario: UsuarioAutenticado,
  entrada: EntradaRestabelecerAssinatura,
  provedorAsaas: PortaProvedorAsaas = criarProvedorAsaasPadrao(),
): Promise<ResultadoRestabelecerAssinatura> {
  const { organizacaoId } = entrada;

  const refOrg = bancoDados.collection("organizacoes").doc(organizacaoId);
  const refMembro = refOrg.collection("membros").doc(usuario.uid);
  const refAssinatura = bancoDados.collection("assinaturas").doc(organizacaoId);
  const refCliente = bancoDados.collection("clientesAsaas").doc(organizacaoId);

  const [docOrg, docMembro, docAssinatura, docCliente] = await Promise.all([
    refOrg.get(),
    refMembro.get(),
    refAssinatura.get(),
    refCliente.get(),
  ]);

  if (!docOrg.exists) {
    throw new ErroValidacaoDominio("Organização informada não encontrada.", "ORGANIZACAO_INEXISTENTE");
  }

  const organizacao = docOrg.data() as Organizacao;
  const membro = docMembro.exists ? (docMembro.data() as MembroOrganizacao) : null;
  exigirPermissaoOrganizacao(usuario, organizacao, membro, "gerenciar_assinatura");

  const resumo = organizacao.resumoDireitosPlano;
  const vigenciaAteIso = resumo.vigenciaAteIso;
  const hojeIso = new Date().toISOString().slice(0, 10);

  if (resumo.situacaoAssinatura === "ativa") {
    throw new ErroValidacaoDominio("A assinatura já está ativa e regular.", "ASSINATURA_JA_ATIVA");
  }

  if (!vigenciaAteIso || vigenciaAteIso.slice(0, 10) < hojeIso) {
    throw new ErroValidacaoDominio(
      "A vigência desta assinatura já expirou. Contrate um novo plano para reativar seu acesso.",
      "VIGENCIA_EXPIRADA",
    );
  }

  const cliente = docCliente.exists ? (docCliente.data() as RegistroClienteAsaas) : null;
  if (!cliente?.clienteAsaasId) {
    throw new ErroValidacaoDominio("Cadastro fiscal do cliente Asaas não encontrado.", "CLIENTE_INEXISTENTE");
  }

  const planoDefinicao = CATALOGO_PLANOS_FLUXO[resumo.planoCodigo] ?? CATALOGO_PLANOS_FLUXO.pro;

  // Cria a nova assinatura no Asaas com nextDueDate agendado para o término da vigência paga
  const resultadoAssinatura = await provedorAsaas.criarAssinatura({
    organizacaoId,
    clienteAsaasId: cliente.clienteAsaasId,
    valorMensalReais: planoDefinicao.mensalidadeCentavos / 100,
    descricao: `Assinatura Fluxo Editorial — Plano ${planoDefinicao.nome}`,
    dataPrimeiroVencimentoIso: vigenciaAteIso.slice(0, 10),
  });

  const agoraIso = new Date().toISOString();

  const registroAssinaturaRestabelecida: RegistroAssinaturaAsaas = {
    id: organizacaoId,
    organizacaoId,
    assinaturaAsaasId: resultadoAssinatura.assinaturaAsaasId,
    planoCodigo: resumo.planoCodigo,
    valorMensalCentavos: planoDefinicao.mensalidadeCentavos,
    situacaoAsaas: "ACTIVE",
    situacaoInterna: "ativa",
    proximoVencimentoIso: vigenciaAteIso.slice(0, 10),
    contratouImplantacaoAssistida: false,
    criadoEmIso: docAssinatura.exists ? (docAssinatura.data()?.criadoEmIso ?? agoraIso) : agoraIso,
    atualizadoEmIso: agoraIso,
  };

  const batch = bancoDados.batch();

  batch.update(refOrg, {
    "resumoDireitosPlano.situacaoAssinatura": "ativa",
    "resumoDireitosPlano.permitePublicacaoPublica": true,
    "resumoDireitosPlano.canceladaEmIso": null,
    atualizadoEmIso: agoraIso,
  });

  batch.set(refAssinatura, registroAssinaturaRestabelecida, { merge: true });

  await batch.commit();

  return {
    organizacaoId,
    situacaoAssinatura: "ativa",
    proximoVencimentoIso: vigenciaAteIso.slice(0, 10),
  };
}

