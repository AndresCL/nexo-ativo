import type { Firestore } from "firebase-admin/firestore";
import type { Organizacao } from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import {
  gerarChaveIdempotenciaSolicitacao,
  type SolicitacaoComercial,
} from "../../../src/dominio/entidades/solicitacaoComercial";
import { ErroAcessoNegado, ErroValidacaoDominio } from "../../../src/dominio/erros/errosDominio";
import { esquemaSubmissaoPublicaSolicitacao } from "../../../src/validacoes/esquemaSolicitacaoComercial";
import {
  criarProvedorEmailPadrao,
  type PortaProvedorEmailTransacional,
} from "../email/adaptadorResendEmail";
import {
  processarNotificacoesEmailSolicitacao,
  type ResumoProcessamentoNotificacoesEmail,
} from "./processarNotificacoesSolicitacao";

export interface ResultadoRegistroSolicitacaoVisitante {
  readonly solicitacaoId: string;
  readonly organizacaoId: string;
  readonly duplicadaIdempotente: boolean;
  readonly criadoEmIso: string;
  readonly resumoNotificacoesEmail?: ResumoProcessamentoNotificacoesEmail;
}

function removerCamposIndefinidosParaFirestore<T>(valor: T): T {
  if (Array.isArray(valor)) {
    return valor.map((item) => removerCamposIndefinidosParaFirestore(item)) as unknown as T;
  }

  if (valor !== null && typeof valor === "object") {
    const resultado: Record<string, unknown> = {};
    for (const [chave, propriedade] of Object.entries(valor as Record<string, unknown>)) {
      if (propriedade !== undefined) {
        resultado[chave] = removerCamposIndefinidosParaFirestore(propriedade);
      }
    }
    return resultado as T;
  }

  return valor;
}

/**
 * Registra de forma transacional, validada e idempotente uma solicitação comercial
 * enviada por um visitante na vitrine pública.
 */
export async function executarRegistroSolicitacaoVisitante(
  bancoDados: Firestore,
  entradaBruta: unknown,
  provedorEmail: PortaProvedorEmailTransacional = criarProvedorEmailPadrao(),
): Promise<ResultadoRegistroSolicitacaoVisitante> {
  const validacao = esquemaSubmissaoPublicaSolicitacao.safeParse(entradaBruta);
  if (!validacao.success) {
    const mensagem =
      validacao.error.issues[0]?.message ??
      "Os dados informados na solicitação estão incompletos ou inválidos.";
    throw new ErroValidacaoDominio(mensagem, "SOLICITACAO_INVALIDA");
  }

  const dados = validacao.data;

  // Proteção anti-spam: honeypot invisível preenchido por robôs
  if (dados.campoArmadilhaBot && dados.campoArmadilhaBot.trim().length > 0) {
    throw new ErroValidacaoDominio(
      "Solicitação recusada pela verificação anti-automação.",
      "SUBMISSAO_AUTOMATIZADA_BLOQUEADA",
    );
  }

  const digitosTelefone = dados.telefoneOuWhatsapp.replace(/\D/g, "");
  if (digitosTelefone.length < 8) {
    throw new ErroValidacaoDominio(
      "Informe um WhatsApp ou telefone válido com DDD.",
      "TELEFONE_VISITANTE_INVALIDO",
    );
  }

  const agoraIso = new Date().toISOString();
  const chaveIdempotencia =
    dados.chaveIdempotencia?.trim() ||
    gerarChaveIdempotenciaSolicitacao({
      organizacaoId: dados.organizacaoId,
      microfluxoId: dados.microfluxoId,
      telefoneOuWhatsapp: dados.telefoneOuWhatsapp,
      ...(dados.servicoId ? { servicoId: dados.servicoId } : {}),
      ...(dados.produtoId ? { produtoId: dados.produtoId } : {}),
    });

  const referenciaOrganizacao = bancoDados.collection("organizacoes").doc(dados.organizacaoId);
  const referenciaSolicitacao = referenciaOrganizacao
    .collection("solicitacoes")
    .doc(chaveIdempotencia);

  const resultadoTransacional = await bancoDados.runTransaction(async (transacao) => {
    const [docOrganizacao, docSolicitacaoExistente] = await Promise.all([
      transacao.get(referenciaOrganizacao),
      transacao.get(referenciaSolicitacao),
    ]);

    if (!docOrganizacao.exists) {
      throw new ErroValidacaoDominio(
        "A organização informada não foi encontrada.",
        "ORGANIZACAO_INEXISTENTE",
      );
    }

    const organizacao = docOrganizacao.data() as Organizacao;
    if (organizacao.situacao !== "ativa") {
      throw new ErroAcessoNegado(
        "Esta organização não está recebendo solicitações externas no momento.",
        "ORGANIZACAO_SUSPENSA",
      );
    }

    // Proteção de idempotência contra clique duplo ou reenvio em janela curta
    if (docSolicitacaoExistente.exists) {
      const existente = docSolicitacaoExistente.data() as SolicitacaoComercial;
      return {
        solicitacaoId: existente.id,
        organizacaoId: dados.organizacaoId,
        duplicadaIdempotente: true as const,
        criadoEmIso: existente.criadoEmIso,
        organizacao,
        solicitacao: existente,
      };
    }

    const novaSolicitacao: SolicitacaoComercial = removerCamposIndefinidosParaFirestore({
      id: chaveIdempotencia,
      organizacaoId: dados.organizacaoId,
      identificadorPublicoOrganizacao: dados.identificadorPublicoOrganizacao,
      microfluxoId: dados.microfluxoId,
      tituloExperiencia: dados.tituloExperiencia,
      versaoMicrofluxo: dados.versaoMicrofluxo,
      nomeVisitante: dados.nomeVisitante,
      telefoneOuWhatsapp: dados.telefoneOuWhatsapp,
      ...(dados.emailVisitante ? { emailVisitante: dados.emailVisitante } : {}),
      ...(dados.mensagemAdicional ? { mensagemAdicional: dados.mensagemAdicional } : {}),
      ...(dados.servicoId ? { servicoId: dados.servicoId } : {}),
      ...(dados.servicoNome ? { servicoNome: dados.servicoNome } : {}),
      ...(dados.produtoId ? { produtoId: dados.produtoId } : {}),
      ...(dados.produtoNome ? { produtoNome: dados.produtoNome } : {}),
      ...(dados.profissionalId ? { profissionalId: dados.profissionalId } : {}),
      ...(dados.profissionalNome ? { profissionalNome: dados.profissionalNome } : {}),
      ...(dados.quantidadeComercial ? { quantidadeComercial: dados.quantidadeComercial } : {}),
      respostasRegistradas: dados.respostasRegistradas,
      ...(dados.demonstrativoComercialCongelado !== undefined
        ? { demonstrativoComercialCongelado: dados.demonstrativoComercialCongelado }
        : {}),
      situacao: "nova",
      chaveIdempotencia,
      criadoEmIso: agoraIso,
      atualizadoEmIso: agoraIso,
    });

    transacao.set(referenciaSolicitacao, novaSolicitacao);

    return {
      solicitacaoId: chaveIdempotencia,
      organizacaoId: dados.organizacaoId,
      duplicadaIdempotente: false as const,
      criadoEmIso: agoraIso,
      organizacao,
      solicitacao: novaSolicitacao,
    };
  });

  if (resultadoTransacional.duplicadaIdempotente) {
    return {
      solicitacaoId: resultadoTransacional.solicitacaoId,
      organizacaoId: resultadoTransacional.organizacaoId,
      duplicadaIdempotente: true,
      criadoEmIso: resultadoTransacional.criadoEmIso,
    };
  }

  let resumoNotificacoesEmail: ResumoProcessamentoNotificacoesEmail | undefined;
  try {
    resumoNotificacoesEmail = await processarNotificacoesEmailSolicitacao(
      bancoDados,
      provedorEmail,
      resultadoTransacional.organizacao,
      resultadoTransacional.solicitacao,
    );
  } catch {
    // Falha transitória do provedor externo de e-mail nunca deve descartar a solicitação já salva
  }

  return {
    solicitacaoId: resultadoTransacional.solicitacaoId,
    organizacaoId: resultadoTransacional.organizacaoId,
    duplicadaIdempotente: false,
    criadoEmIso: resultadoTransacional.criadoEmIso,
    ...(resumoNotificacoesEmail ? { resumoNotificacoesEmail } : {}),
  };
}
