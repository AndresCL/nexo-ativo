import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectFunctionsEmulator, getFunctions, type Functions } from "firebase/functions";
import { lerConfiguracaoAmbientePublico } from "@/validacoes/ambiente";

const aplicacoesComFuncoesEmuladas = new WeakSet<FirebaseApp>();

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

export function obterAplicacaoClienteFirebase(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }

  const configuracao = lerConfiguracaoAmbientePublico();
  return initializeApp({
    apiKey: configuracao.apiKey,
    authDomain: configuracao.authDomain,
    projectId: configuracao.projectId,
    storageBucket: configuracao.storageBucket,
    messagingSenderId: configuracao.messagingSenderId,
    appId: configuracao.appId,
  });
}

/**
 * Inicializa apenas o SDK de Cloud Functions (sem Auth, Firestore ou Storage),
 * evitando carregar `auth/iframe.js` e cookies de terceiros nas rotas públicas.
 */
export function obterFuncoesClienteFirebase(): Functions {
  const configuracao = lerConfiguracaoAmbientePublico();
  const aplicacao = obterAplicacaoClienteFirebase();
  const funcoesRemotas = getFunctions(aplicacao, "southamerica-east1");

  if (
    typeof window !== "undefined" &&
    configuracao.usarEmuladores &&
    !aplicacoesComFuncoesEmuladas.has(aplicacao)
  ) {
    const hostEmulador = resolverHostEmuladorCliente(window.location.hostname);
    connectFunctionsEmulator(funcoesRemotas, hostEmulador, 5001);
    aplicacoesComFuncoesEmuladas.add(aplicacao);
  }

  return funcoesRemotas;
}

