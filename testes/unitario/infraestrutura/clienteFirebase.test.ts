import { afterEach, describe, expect, it, vi } from "vitest";

const connectAuthEmulatorSimulado = vi.fn();
const connectFirestoreEmulatorSimulado = vi.fn();
const connectStorageEmulatorSimulado = vi.fn();
const connectFunctionsEmulatorSimulado = vi.fn();

const aplicacaoFicticia = { name: "[DEFAULT]" };
const instanciaAutenticacaoFicticia: { emulatorConfig: null | { host: string } } = {
  emulatorConfig: null,
};
const bancoDadosFicticio = { tipo: "firestore" };
const armazenamentoFicticio = { tipo: "storage" };
const funcoesFicticias = { tipo: "functions" };

vi.mock("firebase/app", () => ({
  getApps: vi.fn(() => [aplicacaoFicticia]),
  getApp: vi.fn(() => aplicacaoFicticia),
  initializeApp: vi.fn(() => aplicacaoFicticia),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => instanciaAutenticacaoFicticia),
  connectAuthEmulator: (...argumentos: unknown[]) => {
    connectAuthEmulatorSimulado(...argumentos);
    instanciaAutenticacaoFicticia.emulatorConfig = { host: "localhost" };
  },
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => bancoDadosFicticio),
  connectFirestoreEmulator: (...argumentos: unknown[]) =>
    connectFirestoreEmulatorSimulado(...argumentos),
}));

vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(() => armazenamentoFicticio),
  connectStorageEmulator: (...argumentos: unknown[]) =>
    connectStorageEmulatorSimulado(...argumentos),
}));

vi.mock("firebase/functions", () => ({
  getFunctions: vi.fn(() => funcoesFicticias),
  connectFunctionsEmulator: (...argumentos: unknown[]) =>
    connectFunctionsEmulatorSimulado(...argumentos),
}));

describe("Cliente Firebase e conectores locais de emulador", () => {
  const localizacaoOriginal = window.location;

  afterEach(() => {
    vi.clearAllMocks();
    instanciaAutenticacaoFicticia.emulatorConfig = null;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: localizacaoOriginal,
    });
  });

  it("deve alinhar o host do emulador com localhost ou 127.0.0.1 para evitar particionamento cross-site", async () => {
    const { resolverHostEmuladorCliente } =
      await import("@/infraestrutura/firebase/clienteFirebase");

    expect(resolverHostEmuladorCliente("localhost")).toBe("localhost");
    expect(resolverHostEmuladorCliente("127.0.0.1")).toBe("127.0.0.1");
    expect(resolverHostEmuladorCliente("ambiente-desconhecido.local")).toBe("127.0.0.1");
  });

  it("deve conectar todos os emuladores ao mesmo hostname da janela de forma idempotente", async () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...localizacaoOriginal, hostname: "localhost" },
    });

    const { obterServicosClienteFirebase } =
      await import("@/infraestrutura/firebase/clienteFirebase");

    obterServicosClienteFirebase();
    obterServicosClienteFirebase();

    expect(connectAuthEmulatorSimulado).toHaveBeenCalledTimes(1);
    expect(connectAuthEmulatorSimulado).toHaveBeenCalledWith(
      instanciaAutenticacaoFicticia,
      "http://localhost:9099",
      { disableWarnings: true },
    );
    expect(connectFirestoreEmulatorSimulado).toHaveBeenCalledTimes(1);
    expect(connectFirestoreEmulatorSimulado).toHaveBeenCalledWith(
      bancoDadosFicticio,
      "localhost",
      8080,
    );
    expect(connectStorageEmulatorSimulado).toHaveBeenCalledTimes(1);
    expect(connectStorageEmulatorSimulado).toHaveBeenCalledWith(
      armazenamentoFicticio,
      "localhost",
      9199,
    );
    expect(connectFunctionsEmulatorSimulado).toHaveBeenCalledTimes(1);
    expect(connectFunctionsEmulatorSimulado).toHaveBeenCalledWith(
      funcoesFicticias,
      "localhost",
      5001,
    );
  });
});
