import { getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

export interface ContextoAdminFuncoes {
  readonly app: App;
  readonly autenticacao: Auth;
  readonly bancoDados: Firestore;
}

let bancoDadosConfigurado: Firestore | undefined;

export function obterAdminFuncoes(): ContextoAdminFuncoes {
  const app = getApps()[0] ?? initializeApp();

  if (!bancoDadosConfigurado) {
    bancoDadosConfigurado = getFirestore(app);
    try {
      bancoDadosConfigurado.settings({ ignoreUndefinedProperties: true });
    } catch {
      // Ignora caso as configurações já tenham sido travadas pela instância ativa
    }
  }

  return {
    app,
    autenticacao: getAuth(app),
    bancoDados: bancoDadosConfigurado,
  };
}
