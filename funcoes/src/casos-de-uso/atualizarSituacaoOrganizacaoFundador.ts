import type { Firestore } from "firebase-admin/firestore";
import type {
  Organizacao,
  RegistroAuditoria,
  UsuarioAutenticado,
} from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import { ErroValidacaoDominio } from "../../../src/dominio/erros/errosDominio";
import { exigirPrivilegioFundador } from "../../../src/dominio/permissoes/autorizadorOrganizacao";
import { esquemaAlterarSituacaoOrganizacaoFundador } from "../../../src/validacoes/esquemasPainelFundador";

export async function executarAlteracaoSituacaoOrganizacaoFundador(
  bancoDados: Firestore,
  usuarioExecutor: UsuarioAutenticado,
  entradaBruta: unknown,
): Promise<{ atualizado: boolean; organizacaoId: string; novaSituacao: string }> {
  exigirPrivilegioFundador(usuarioExecutor);

  const validacao = esquemaAlterarSituacaoOrganizacaoFundador.safeParse(entradaBruta);
  if (!validacao.success) {
    const mensagem = validacao.error.issues[0]?.message ?? "Parâmetros inválidos para alteração.";
    throw new ErroValidacaoDominio(mensagem, "DADOS_INVALIDOS");
  }

  const { organizacaoId, novaSituacao, justificativa } = validacao.data;
  const agoraIso = new Date().toISOString();
  const refOrg = bancoDados.collection("organizacoes").doc(organizacaoId);
  const refAuditoria = bancoDados.collection("registrosAuditoria").doc();

  await bancoDados.runTransaction(async (transacao) => {
    const docOrg = await transacao.get(refOrg);
    if (!docOrg.exists) {
      throw new ErroValidacaoDominio("Organização alvo não encontrada.", "ORGANIZACAO_INEXISTENTE");
    }

    const org = docOrg.data() as Organizacao;
    const situacaoAnterior = org.situacao;

    transacao.update(refOrg, {
      situacao: novaSituacao,
      atualizadoEmIso: agoraIso,
    });

    const registroAuditoria: RegistroAuditoria = {
      id: refAuditoria.id,
      acao: "fundador_alterou_situacao_organizacao",
      atorUsuarioId: usuarioExecutor.uid,
      organizacaoAlvoId: organizacaoId,
      detalhes: {
        situacaoAnterior,
        novaSituacao,
        justificativa,
      },
      criadoEmIso: agoraIso,
    };

    transacao.set(refAuditoria, registroAuditoria);
  });

  return {
    atualizado: true,
    organizacaoId,
    novaSituacao,
  };
}
