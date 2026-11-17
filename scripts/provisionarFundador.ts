import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, deleteApp, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth, type UserRecord } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { atribuirPrivilegioFundadorAuditado } from "../funcoes/src/casos-de-uso/provisionarFundadorPlataforma";

export type AmbienteAlvoProvisionamento = "emulador" | "producao";

export interface ParametrosProvisionamentoFundadorCli {
  readonly email: string;
  readonly nomeExibicao: string;
  readonly ambiente: AmbienteAlvoProvisionamento;
  readonly caminhoCredencialProducao?: string;
}

const CAMINHO_CREDENCIAL_PADRAO = resolve(
  process.cwd(),
  "nexo-ativo-firebase-adminsdk-fbsvc-46a6e52c4f.json",
);

function extrairArgumentoCli(prefixo: string): string | undefined {
  const argumento = process.argv.find((item) => item.startsWith(`${prefixo}=`));
  return argumento ? argumento.slice(prefixo.length + 1).trim() : undefined;
}

function inicializarAplicacaoAlvo(
  ambiente: AmbienteAlvoProvisionamento,
  caminhoCredencialOpcional?: string,
): App {
  if (ambiente === "emulador") {
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
    return initializeApp({ projectId: "demo-fluxo" }, `provisionar-fundador-${ambiente}`);
  }

  delete process.env.FIRESTORE_EMULATOR_HOST;
  delete process.env.FIREBASE_AUTH_EMULATOR_HOST;

  const caminhoCredencial = caminhoCredencialOpcional ?? CAMINHO_CREDENCIAL_PADRAO;
  const conteudoCredencial = JSON.parse(readFileSync(caminhoCredencial, "utf-8")) as {
    project_id?: string;
  };

  return initializeApp(
    {
      credential: cert(caminhoCredencial),
      projectId: conteudoCredencial.project_id ?? "nexo-ativo",
    },
    `provisionar-fundador-${ambiente}`,
  );
}

async function obterOuCriarUsuarioFundador(
  autenticacao: Auth,
  email: string,
  nomeExibicao: string,
): Promise<UserRecord> {
  try {
    const existente = await autenticacao.getUserByEmail(email);
    if (!existente.emailVerified) {
      return await autenticacao.updateUser(existente.uid, { emailVerified: true });
    }
    return existente;
  } catch (erro: unknown) {
    if (
      typeof erro !== "object" ||
      erro === null ||
      !("code" in erro) ||
      erro.code !== "auth/user-not-found"
    ) {
      throw erro;
    }

    return await autenticacao.createUser({
      email,
      displayName: nomeExibicao,
      emailVerified: true,
    });
  }
}

async function sincronizarPerfilFirestoreFundador(
  bancoDados: Firestore,
  usuario: UserRecord,
  nomePadrao: string,
): Promise<void> {
  const agoraIso = new Date().toISOString();
  await bancoDados
    .collection("usuarios")
    .doc(usuario.uid)
    .set(
      {
        uid: usuario.uid,
        email: usuario.email ?? null,
        nome: usuario.displayName ?? nomePadrao,
        atualizadoEmIso: agoraIso,
      },
      { merge: true },
    );
}

export async function executarProvisionamentoFundadorPorAmbiente(
  parametros: ParametrosProvisionamentoFundadorCli,
): Promise<{ uid: string; email: string; ambiente: AmbienteAlvoProvisionamento }> {
  const aplicacao = inicializarAplicacaoAlvo(
    parametros.ambiente,
    parametros.caminhoCredencialProducao,
  );

  try {
    const autenticacao = getAuth(aplicacao);
    const bancoDados = getFirestore(aplicacao);
    const usuario = await obterOuCriarUsuarioFundador(
      autenticacao,
      parametros.email,
      parametros.nomeExibicao,
    );

    await sincronizarPerfilFirestoreFundador(bancoDados, usuario, parametros.nomeExibicao);

    await atribuirPrivilegioFundadorAuditado(autenticacao, bancoDados, {
      uidAlvo: usuario.uid,
      atorUsuarioId: usuario.uid,
      origemOperacao: "cli_administrativo",
    });

    return {
      uid: usuario.uid,
      email: usuario.email ?? parametros.email,
      ambiente: parametros.ambiente,
    };
  } finally {
    await deleteApp(aplicacao);
  }
}

async function executarCli(): Promise<void> {
  const email = extrairArgumentoCli("--email") ?? "aecontrerasl@gmail.com";
  const nomeExibicao = extrairArgumentoCli("--nome") ?? "Andres Contreras (Fundador)";
  const ambienteArg = extrairArgumentoCli("--ambiente") ?? "ambos";
  const caminhoCredencialProducao = extrairArgumentoCli("--credencial");

  const ambientes: AmbienteAlvoProvisionamento[] =
    ambienteArg === "ambos"
      ? ["emulador", "producao"]
      : ambienteArg === "producao"
        ? ["producao"]
        : ["emulador"];

  for (const ambiente of ambientes) {
    const resultado = await executarProvisionamentoFundadorPorAmbiente({
      email,
      nomeExibicao,
      ambiente,
      ...(caminhoCredencialProducao ? { caminhoCredencialProducao } : {}),
    });
    console.info(
      `[${resultado.ambiente.toUpperCase()}] Fundador provisionado com sucesso: ${resultado.email} (UID: ${resultado.uid})`,
    );
  }
}

executarCli().catch((erro: unknown) => {
  console.error("Falha ao provisionar fundador:", erro);
  process.exitCode = 1;
});

