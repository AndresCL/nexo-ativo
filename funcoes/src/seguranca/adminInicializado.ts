import { getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

export interface ContextoAdminFuncoes {
  readonly app: App;
  readonly autenticacao: Auth;
  readonly bancoDados: Firestore;
}

export function obterAdminFuncoes(): ContextoAdminFuncoes {
  const app = getApps()[0] ?? initializeApp();

  return {
    app,
    autenticacao: getAuth(app),
    bancoDados: getFirestore(app),
  };
}
