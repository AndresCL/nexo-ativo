import type { Firestore } from "firebase-admin/firestore";
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import type {
  MembroOrganizacao,
  Organizacao,
  PapelPlataforma,
  UsuarioAutenticado,
} from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import {
  ErroAcessoNegado,
  ErroConflitoDominio,
  ErroDominio,
  ErroNaoAutenticado,
  ErroValidacaoDominio,
} from "../../../src/dominio/erros/errosDominio";
import {
  exigirPermissaoOrganizacao,
  type OperacaoOrganizacao,
} from "../../../src/dominio/permissoes/autorizadorOrganizacao";

export function extrairUsuarioDeRequisicaoCallable(
  requisicao: CallableRequest<unknown>,
): UsuarioAutenticado | null {
  if (!requisicao.auth) {
    return null;
  }

  const token = requisicao.auth.token;
  const papelBruto = token.papelPlataforma;
  const papelPlataforma: PapelPlataforma | undefined =
    papelBruto === "fundador" ? "fundador" : undefined;

  const provedor = token.firebase?.sign_in_provider;

  return {
    uid: requisicao.auth.uid,
    email: token.email ?? null,
    nomeExibicao: (token.name as string | undefined) ?? null,
    fotoUrl: token.picture ?? null,
    emailVerificado: Boolean(token.email_verified),
    ...(papelPlataforma ? { papelPlataforma } : {}),
    provedoresConectados: provedor ? [provedor] : [],
  };
}

export async function carregarEValidarAcessoOrganizacao(
  bancoDados: Firestore,
  usuario: UsuarioAutenticado | null,
  organizacaoId: string,
  operacao: OperacaoOrganizacao,
): Promise<{ organizacao: Organizacao; membro: MembroOrganizacao | null }> {
  if (!usuario) {
    throw new ErroNaoAutenticado();
  }

  const referenciaOrganizacao = bancoDados.collection("organizacoes").doc(organizacaoId);
  const referenciaMembro = referenciaOrganizacao.collection("membros").doc(usuario.uid);

  const [instantaneoOrg, instantaneoMembro] = await Promise.all([
    referenciaOrganizacao.get(),
    referenciaMembro.get(),
  ]);

  if (!instantaneoOrg.exists) {
    throw new ErroAcessoNegado(
      "Organização não encontrada ou indisponível para sua conta.",
      "ORGANIZACAO_NAO_ENCONTRADA",
    );
  }

  const organizacao = instantaneoOrg.data() as Organizacao;
  const membro = instantaneoMembro.exists ? (instantaneoMembro.data() as MembroOrganizacao) : null;

  exigirPermissaoOrganizacao(usuario, organizacao, membro, operacao);

  return { organizacao, membro };
}

export function converterErroParaHttpsError(erro: unknown): HttpsError {
  if (erro instanceof HttpsError) {
    return erro;
  }

  if (erro instanceof ErroNaoAutenticado) {
    return new HttpsError("unauthenticated", erro.message, { codigo: erro.codigo });
  }

  if (erro instanceof ErroAcessoNegado) {
    return new HttpsError("permission-denied", erro.message, { codigo: erro.codigo });
  }

  if (erro instanceof ErroConflitoDominio) {
    return new HttpsError("already-exists", erro.message, { codigo: erro.codigo });
  }

  if (erro instanceof ErroValidacaoDominio) {
    return new HttpsError("invalid-argument", erro.message, { codigo: erro.codigo });
  }

  if (erro instanceof ErroDominio) {
    return new HttpsError("failed-precondition", erro.message, { codigo: erro.codigo });
  }

  return new HttpsError(
    "internal",
    "Ocorreu uma falha interna ao processar sua solicitação. Tente novamente.",
  );
}
