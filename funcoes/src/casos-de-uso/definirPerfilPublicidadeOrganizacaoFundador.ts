import type { Firestore } from "firebase-admin/firestore";
import type {
  Organizacao,
  RegistroAuditoria,
  UsuarioAutenticado,
} from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import { ErroValidacaoDominio } from "../../../src/dominio/erros/errosDominio";
import { exigirPrivilegioFundador } from "../../../src/dominio/permissoes/autorizadorOrganizacao";
import { obterPoliticaPublicidade } from "../../../src/dominio/publicidade/registroPoliticasPublicidade";
import { esquemaDefinirPerfilPublicidadeOrganizacaoFundador } from "../../../src/validacoes/esquemasPainelFundador";

/**
 * Define o perfil de publicidade profissional de uma organização. Exclusivo do fundador,
 * auditado, e refletido imediatamente na página já publicada (quando existir).
 */
export async function executarDefinicaoPerfilPublicidadeOrganizacaoFundador(
  bancoDados: Firestore,
  usuarioExecutor: UsuarioAutenticado,
  entradaBruta: unknown,
): Promise<{ atualizado: boolean; organizacaoId: string; novoPerfil: string }> {
  exigirPrivilegioFundador(usuarioExecutor);

  const validacao = esquemaDefinirPerfilPublicidadeOrganizacaoFundador.safeParse(entradaBruta);
  if (!validacao.success) {
    const mensagem = validacao.error.issues[0]?.message ?? "Parâmetros inválidos para o perfil.";
    throw new ErroValidacaoDominio(mensagem, "DADOS_INVALIDOS");
  }

  const { organizacaoId, novoPerfil, justificativa } = validacao.data;
  const agoraIso = new Date().toISOString();
  const refOrg = bancoDados.collection("organizacoes").doc(organizacaoId);
  const refPublicada = bancoDados.collection("paginasPublicadas").doc(organizacaoId);
  const refAuditoria = bancoDados.collection("registrosAuditoria").doc();

  await bancoDados.runTransaction(async (transacao) => {
    const [docOrg, docPublicada] = await Promise.all([
      transacao.get(refOrg),
      transacao.get(refPublicada),
    ]);

    if (!docOrg.exists) {
      throw new ErroValidacaoDominio("Organização alvo não encontrada.", "ORGANIZACAO_INEXISTENTE");
    }

    const perfilAnterior = obterPoliticaPublicidade(
      (docOrg.data() as Organizacao).perfilPublicidade,
    ).codigo;

    transacao.update(refOrg, { perfilPublicidade: novoPerfil, atualizadoEmIso: agoraIso });

    if (docPublicada.exists) {
      transacao.update(refPublicada, { perfilPublicidade: novoPerfil });
    }

    const registroAuditoria: RegistroAuditoria = {
      id: refAuditoria.id,
      acao: "fundador_definiu_perfil_publicidade_organizacao",
      atorUsuarioId: usuarioExecutor.uid,
      organizacaoAlvoId: organizacaoId,
      detalhes: { perfilAnterior, novoPerfil, justificativa },
      criadoEmIso: agoraIso,
    };

    transacao.set(refAuditoria, registroAuditoria);
  });

  return { atualizado: true, organizacaoId, novoPerfil };
}
