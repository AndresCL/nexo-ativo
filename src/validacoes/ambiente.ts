import { z } from "zod";

const PADRAO_MEASUREMENT_ID_GA4 = /^G-[A-Z0-9]+$/i;

/**
 * Normaliza e valida o Measurement ID do Google Analytics 4 de forma fail-safe:
 * valores ausentes, vazios ou malformados retornam `undefined` para que um erro
 * de configuração de analytics nunca derrube a aplicação.
 */
export function normalizarMeasurementIdGoogleAnalytics(
  valorBruto: string | undefined,
): string | undefined {
  const valorLimpo = valorBruto?.trim();

  if (!valorLimpo || !PADRAO_MEASUREMENT_ID_GA4.test(valorLimpo)) {
    return undefined;
  }

  return valorLimpo;
}

const esquemaAmbientePublico = z.object({
  apiKey: z.string().min(1, "A chave pública do Firebase não pode estar vazia."),
  authDomain: z.string().min(1, "O domínio de autenticação do Firebase é obrigatório."),
  projectId: z.string().min(1, "O identificador do projeto Firebase é obrigatório."),
  storageBucket: z.string().min(1, "O bucket de armazenamento do Firebase é obrigatório."),
  messagingSenderId: z.string().min(1, "O identificador do remetente do Firebase é obrigatório."),
  appId: z.string().min(1, "O identificador da aplicação Firebase é obrigatório."),
  measurementId: z.string().optional(),
  usarEmuladores: z.boolean(),
  urlBasePublica: z.string().url("A URL base pública deve ser uma URL válida."),
});

export type ConfiguracaoAmbientePublico = z.infer<typeof esquemaAmbientePublico>;

/**
 * Lê e valida as variáveis públicas de ambiente com fallback explícito e seguro
 * para execução em desenvolvimento local / Firebase Emulator Suite.
 */
export function lerConfiguracaoAmbientePublico(): ConfiguracaoAmbientePublico {
  const valoresBrutos = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "chave-desenvolvimento-local",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "demo-fluxo.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "demo-fluxo",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "demo-fluxo.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "000000000000",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:000000000000:web:000000000000",
    measurementId: normalizarMeasurementIdGoogleAnalytics(
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    ),
    usarEmuladores: (process.env.NEXT_PUBLIC_USAR_EMULADORES ?? "true") === "true",
    urlBasePublica: process.env.NEXT_PUBLIC_URL_BASE_PUBLICA ?? "http://localhost:3000",
  };

  return esquemaAmbientePublico.parse(valoresBrutos);
}
