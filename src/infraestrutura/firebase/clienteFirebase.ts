import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, type Functions } from "firebase/functions";
import { connectStorageEmulator, getStorage, type FirebaseStorage } from "firebase/storage";
import { lerConfiguracaoAmbientePublico } from "@/validacoes/ambiente";

export interface ServicosClienteFirebase {
  readonly aplicacao: FirebaseApp;
  readonly autenticacao: Auth;
  readonly bancoDados: Firestore;
  readonly armazenamento: FirebaseStorage;
  readonly funcoesRemotas: Functions;
}

const aplicacoesComServicosAuxiliaresEmulados = new WeakSet<FirebaseApp>();

/**
 * Resolve o hostname dos emuladores no navegador alinhando com o site atual
 * (`localhost` vs `127.0.0.1`) para evitar particionamento cross-site de frames e popups.
 */
export function resolverHostEmuladorCliente(hostnameNavegador: string): string {
  if (hostnameNavegador === "localhost" || hostnameNavegador === "127.0.0.1") {
    return hostnameNavegador;
  }

  return "127.0.0.1";
}

export function obterServicosClienteFirebase(): ServicosClienteFirebase {
  const configuracao = lerConfiguracaoAmbientePublico();

  const aplicacao =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey: configuracao.apiKey,
          authDomain: configuracao.authDomain,
          projectId: configuracao.projectId,
          storageBucket: configuracao.storageBucket,
          messagingSenderId: configuracao.messagingSenderId,
          appId: configuracao.appId,
        });

  const autenticacao = getAuth(aplicacao);
  const bancoDados = getFirestore(aplicacao);
  const armazenamento = getStorage(aplicacao);
  const funcoesRemotas = getFunctions(aplicacao, "southamerica-east1");

  if (typeof window !== "undefined" && configuracao.usarEmuladores) {
    const hostEmulador = resolverHostEmuladorCliente(window.location.hostname);

    if (!autenticacao.emulatorConfig) {
      connectAuthEmulator(autenticacao, `http://${hostEmulador}:9099`, {
        disableWarnings: true,
      });
    }

    if (!aplicacoesComServicosAuxiliaresEmulados.has(aplicacao)) {
      connectFirestoreEmulator(bancoDados, hostEmulador, 8080);
      connectStorageEmulator(armazenamento, hostEmulador, 9199);
      connectFunctionsEmulator(funcoesRemotas, hostEmulador, 5001);
      aplicacoesComServicosAuxiliaresEmulados.add(aplicacao);
    }
  }

  return {
    aplicacao,
    autenticacao,
    bancoDados,
    armazenamento,
    funcoesRemotas,
  };
}
