import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import type {
  MembroOrganizacao,
  Organizacao,
  VinculoOrganizacaoUsuario,
} from "@/dominio/entidades/autenticacaoEOrganizacao";

export interface PortaAutenticacaoAdminEmailProprietario {
  getUserByEmail(email: string): Promise<{ uid: string; email?: string; displayName?: string }>;
  createUser(propriedades: {
    email: string;
    displayName: string;
    emailVerified: boolean;
  }): Promise<{ uid: string; email?: string; displayName?: string }>;
  updateUser(
    uid: string,
    propriedades: { email: string; emailVerified: boolean },
  ): Promise<{ uid: string; email?: string }>;
  revokeRefreshTokens(uid: string): Promise<void>;
}

export interface ResultadoAtualizacaoEmailProprietario {
  readonly atualizado: boolean;
  readonly modo: "sem_alteracao" | "email_atualizado" | "titularidade_transferida";
  readonly organizacaoId: string;
  readonly uidProprietario: string;
  readonly novoEmail: string;
}

export class ErroOperacaoEmailProprietario extends Error {
  public readonly statusHttp: number;

  public constructor(mensagem: string, statusHttp: number) {
    super(mensagem);
    this.name = "ErroOperacaoEmailProprietario";
    this.statusHttp = statusHttp;
  }
}

async function buscarUsuarioPorEmailOpcional(
  autenticacaoAdmin: Pick<PortaAutenticacaoAdminEmailProprietario, "getUserByEmail">,
  email: string,
): Promise<{ uid: string; email?: string; displayName?: string } | null> {
  try {
    return await autenticacaoAdmin.getUserByEmail(email);
  } catch (erro: unknown) {
    if (
      typeof erro === "object" &&
      erro !== null &&
      "code" in erro &&
      erro.code === "auth/user-not-found"
    ) {
      return null;
    }
    throw erro;
  }
}

export async function executarAtualizacaoEmailProprietarioFundador(parametros: {
  readonly autenticacaoAdmin: Pick<
    Auth,
    "getUserByEmail" | "createUser" | "updateUser" | "revokeRefreshTokens"
  >;
  readonly bancoDadosAdmin: Firestore;
  readonly fundadorUid: string;
  readonly organizacaoId: string;
  readonly novoEmail: string;
}): Promise<ResultadoAtualizacaoEmailProprietario> {
  const { autenticacaoAdmin, bancoDadosAdmin, fundadorUid, organizacaoId } = parametros;
  const novoEmail = parametros.novoEmail.trim().toLowerCase();
  const agoraIso = new Date().toISOString();

  const refOrg = bancoDadosAdmin.collection("organizacoes").doc(organizacaoId);
  const docOrg = await refOrg.get();
  if (!docOrg.exists) {
    throw new ErroOperacaoEmailProprietario("Organização não encontrada.", 404);
  }
  const organizacao = docOrg.data() as Organizacao;

  const snapProprietarios = await refOrg
    .collection("membros")
    .where("papel", "==", "proprietario")
    .where("situacao", "==", "ativo")
    .limit(1)
    .get();

  const docProprietarioAtual = snapProprietarios.docs[0];
  if (!docProprietarioAtual) {
    throw new ErroOperacaoEmailProprietario(
      "Nenhum proprietário ativo encontrado para esta organização.",
      404,
    );
  }

  const uidAntigo = docProprietarioAtual.id;
  const usuarioExistenteNovoEmail = await buscarUsuarioPorEmailOpcional(
    autenticacaoAdmin,
    novoEmail,
  );

  if (usuarioExistenteNovoEmail?.uid === uidAntigo) {
    return {
      atualizado: false,
      modo: "sem_alteracao",
      organizacaoId,
      uidProprietario: uidAntigo,
      novoEmail,
    };
  }

  const ehFundador = uidAntigo === fundadorUid;
  const vinculosAntigo = await bancoDadosAdmin
    .collection("usuarios")
    .doc(uidAntigo)
    .collection("vinculosOrganizacao")
    .limit(2)
    .get();
  const ehUsuarioExclusivoDestaOrg = !ehFundador && vinculosAntigo.size <= 1;

  // Caso 1: Proprietário temporário exclusivo desta organização e novo e-mail livre no Auth.
  if (ehUsuarioExclusivoDestaOrg && !usuarioExistenteNovoEmail) {
    await autenticacaoAdmin.updateUser(uidAntigo, {
      email: novoEmail,
      emailVerified: true,
    });
    await autenticacaoAdmin.revokeRefreshTokens(uidAntigo);
    await bancoDadosAdmin
      .collection("usuarios")
      .doc(uidAntigo)
      .set(
        {
          uid: uidAntigo,
          email: novoEmail,
          atualizadoEmIso: agoraIso,
        },
        { merge: true },
      );

    return {
      atualizado: true,
      modo: "email_atualizado",
      organizacaoId,
      uidProprietario: uidAntigo,
      novoEmail,
    };
  }

  // Caso 2 & 3: Proprietário é o fundador, pertence a >1 org, ou novo e-mail já existe no Auth.
  // Transfere a titularidade sem tocar no Firebase Auth do usuário antigo.
  const usuarioNovo =
    usuarioExistenteNovoEmail ??
    (await autenticacaoAdmin.createUser({
      email: novoEmail,
      displayName: organizacao.nome,
      emailVerified: true,
    }));

  const refMembroNovo = refOrg.collection("membros").doc(usuarioNovo.uid);
  const refUsuarioNovo = bancoDadosAdmin.collection("usuarios").doc(usuarioNovo.uid);
  const refVinculoNovo = refUsuarioNovo.collection("vinculosOrganizacao").doc(organizacaoId);
  const refMembroAntigo = refOrg.collection("membros").doc(uidAntigo);
  const refVinculoAntigo = bancoDadosAdmin
    .collection("usuarios")
    .doc(uidAntigo)
    .collection("vinculosOrganizacao")
    .doc(organizacaoId);

  await bancoDadosAdmin.runTransaction(async (transacao) => {
    const membroNovo: MembroOrganizacao = {
      usuarioId: usuarioNovo.uid,
      organizacaoId,
      papel: "proprietario",
      situacao: "ativo",
      adicionadoEmIso: agoraIso,
    };

    const vinculoNovo: VinculoOrganizacaoUsuario = {
      organizacaoId,
      nomeOrganizacao: organizacao.nome,
      identificadorPublico: organizacao.identificadorPublico,
      papel: "proprietario",
      situacao: "ativo",
    };

    transacao.set(refMembroNovo, membroNovo);
    transacao.set(
      refUsuarioNovo,
      {
        uid: usuarioNovo.uid,
        email: novoEmail,
        nome: usuarioNovo.displayName ?? organizacao.nome,
        atualizadoEmIso: agoraIso,
      },
      { merge: true },
    );
    transacao.set(refVinculoNovo, vinculoNovo);

    if (ehFundador) {
      transacao.set(refMembroAntigo, { papel: "administrador" }, { merge: true });
      transacao.set(refVinculoAntigo, { papel: "administrador" }, { merge: true });
    } else {
      transacao.delete(refMembroAntigo);
      transacao.delete(refVinculoAntigo);
    }
  });

  return {
    atualizado: true,
    modo: "titularidade_transferida",
    organizacaoId,
    uidProprietario: usuarioNovo.uid,
    novoEmail,
  };
}

