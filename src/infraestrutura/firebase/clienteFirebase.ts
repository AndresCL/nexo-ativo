import type { FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import type { Functions } from "firebase/functions";
import { connectStorageEmulator, getStorage, type FirebaseStorage } from "firebase/storage";
import { lerConfiguracaoAmbientePublico } from "@/validacoes/ambiente";
import {
  obterAplicacaoClienteFirebase,
  obterFuncoesClienteFirebase,
  resolverHostEmuladorCliente,
} from "./clienteFuncoesFirebase";

export { resolverHostEmuladorCliente };

export interface ServicosClienteFirebase {
  readonly aplicacao: FirebaseApp;
  readonly autenticacao: Auth;
  readonly bancoDados: Firestore;
  readonly armazenamento: FirebaseStorage;
  readonly funcoesRemotas: Functions;
}

const aplicacoesComServicosAuxiliaresEmulados = new WeakSet<FirebaseApp>();

export function obterServicosClienteFirebase(): ServicosClienteFirebase {
  const configuracao = lerConfiguracaoAmbientePublico();
  const aplicacao = obterAplicacaoClienteFirebase();

  const autenticacao = getAuth(aplicacao);
  const bancoDados = getFirestore(aplicacao);
  const armazenamento = getStorage(aplicacao);
  const funcoesRemotas = obterFuncoesClienteFirebase();

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
