import { obterServicosClienteFirebase } from "@/infraestrutura/firebase/clienteFirebase";

/**
 * Aguarda a hidratação assíncrona do Firebase Auth no navegador antes de abrir
 * listeners protegidos por Firestore Rules, evitando falhas prematuras de `permission-denied`.
 */
export async function aguardarProntidaoAuthCliente(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const { autenticacao } = obterServicosClienteFirebase();
    await autenticacao.authStateReady();
    return Boolean(autenticacao.currentUser);
  } catch {
    return false;
  }
}

