import { getApps, initializeApp, type App as AplicacaoAdmin } from "firebase-admin/app";
import { getAuth, type Auth as AutenticacaoAdmin } from "firebase-admin/auth";
import { getFirestore, type Firestore as FirestoreAdmin } from "firebase-admin/firestore";
import { lerConfiguracaoAmbientePublico } from "@/validacoes/ambiente";

export interface ServicosAdminFirebase {
  readonly aplicacaoAdmin: AplicacaoAdmin;
  readonly autenticacaoAdmin: AutenticacaoAdmin;
  readonly bancoDadosAdmin: FirestoreAdmin;
}

/**
 * Inicializa o Firebase Admin SDK exclusivamente em ambiente de servidor (Next.js SSR / Route Handlers).
 * Garante que variáveis de emulador nunca sejam ativadas em produção.
 */
export function obterServicosAdminFirebase(): ServicosAdminFirebase {
  const configuracao = lerConfiguracaoAmbientePublico();

  if (configuracao.usarEmuladores && process.env.NODE_ENV !== "production") {
    process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
    process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
    process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= "127.0.0.1:9199";
  }

  const aplicacaoAdmin =
    getApps()[0] ??
    initializeApp({
      projectId: configuracao.projectId,
      storageBucket: configuracao.storageBucket,
    });

  return {
    aplicacaoAdmin,
    autenticacaoAdmin: getAuth(aplicacaoAdmin),
    bancoDadosAdmin: getFirestore(aplicacaoAdmin),
  };
}
