import type { Firestore } from "firebase-admin/firestore";
import { CATALOGO_PLANOS_FLUXO } from "../../../src/dominio/assinaturas/tiposAssinaturaAsaas";
import type {
  Organizacao,
  RegistroAuditoria,
  ResumoDireitosPlano,
  UsuarioAutenticado,
} from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import { ErroValidacaoDominio } from "../../../src/dominio/erros/errosDominio";
import { exigirPrivilegioFundador } from "../../../src/dominio/permissoes/autorizadorOrganizacao";
import { esquemaAjustarPlanoOrganizacaoFundador } from "../../../src/validacoes/esquemasPainelFundador";

export async function executarAjustePlanoOrganizacaoFundador(
  bancoDados: Firestore,
  usuarioExecutor: UsuarioAutenticado,
  entradaBruta: unknown,
): Promise<{ atualizado: boolean; organizacaoId: string }> {
  exigirPrivilegioFundador(usuarioExecutor);

  const validacao = esquemaAjustarPlanoOrganizacaoFundador.safeParse(entradaBruta);
  if (!validacao.success) {
    const mensagem =
      validacao.error.issues[0]?.message ?? "Parâmetros inválidos para ajuste de plano.";
    throw new ErroValidacaoDominio(mensagem, "DADOS_INVALIDOS");
  }

  const {
    organizacaoId,
    novoPlanoCodigo,
    novaSituacaoAssinatura,
    limiteProfissionaisAtivos,
    limiteEnviosEmailMensal,
    permitePublicacaoPublica,
    justificativa,
  } = validacao.data;

  const agoraIso = new Date().toISOString();
  const refOrg = bancoDados.collection("organizacoes").doc(organizacaoId);
  const refAssinatura = bancoDados.collection("assinaturas").doc(organizacaoId);
  const refAuditoria = bancoDados.collection("registrosAuditoria").doc();

  const definicaoCatalogo = CATALOGO_PLANOS_FLUXO[novoPlanoCodigo];

  await bancoDados.runTransaction(async (transacao) => {
    const [docOrg, docAssinatura] = await Promise.all([
      transacao.get(refOrg),
      transacao.get(refAssinatura),
    ]);
    if (!docOrg.exists) {
      throw new ErroValidacaoDominio("Organização alvo não encontrada.", "ORGANIZACAO_INEXISTENTE");
    }

    const org = docOrg.data() as Organizacao;
    const planoAnterior = org.resumoDireitosPlano;
    const possuiAssinaturaGatewayAtiva =
      docAssinatura.exists && docAssinatura.data()?.situacaoInterna === "ativa";

    const origemAssinatura =
      novaSituacaoAssinatura === "ativa"
        ? possuiAssinaturaGatewayAtiva
          ? "gateway"
          : "cortesia"
        : planoAnterior.origemAssinatura;

    const novoResumo: ResumoDireitosPlano = {
      planoCodigo: novoPlanoCodigo,
      situacaoAssinatura: novaSituacaoAssinatura,
      ...(origemAssinatura ? { origemAssinatura } : {}),
      limiteProfissionaisAtivos:
        limiteProfissionaisAtivos ?? definicaoCatalogo.limiteProfissionaisAtivos,
      limiteEnviosEmailMensal: limiteEnviosEmailMensal ?? definicaoCatalogo.limiteEnviosEmailMensal,
      permitePublicacaoPublica:
        permitePublicacaoPublica !== undefined
          ? permitePublicacaoPublica
          : novaSituacaoAssinatura === "ativa",
    };

    transacao.update(refOrg, {
      resumoDireitosPlano: novoResumo,
      atualizadoEmIso: agoraIso,
    });

    const registroAuditoria: RegistroAuditoria = {
      id: refAuditoria.id,
      acao: "fundador_ajustou_plano_organizacao",
      atorUsuarioId: usuarioExecutor.uid,
      organizacaoAlvoId: organizacaoId,
      detalhes: {
        planoAnterior: planoAnterior.planoCodigo,
        situacaoAnterior: planoAnterior.situacaoAssinatura,
        novoPlanoCodigo,
        novaSituacaoAssinatura,
        justificativa,
      },
      criadoEmIso: agoraIso,
    };

    transacao.set(refAuditoria, registroAuditoria);
  });

  return {
    atualizado: true,
    organizacaoId,
  };
}
