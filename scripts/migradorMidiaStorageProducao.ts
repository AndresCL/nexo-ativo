import { randomUUID } from "node:crypto";

const PADRAO_URL_EMULADOR_STORAGE =
  /^https?:\/\/(?:localhost|127\.0\.0\.1):9199\/v0\/b\/[^/]+\/o\/([^?]+)/;

export interface ArquivoBucketStorageDestino {
  save(
    dados: Buffer,
    opcoes: {
      contentType: string;
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: string;
        };
      };
    },
  ): Promise<void>;
}

export interface BucketStorageDestino {
  readonly name: string;
  file(caminhoObjeto: string): ArquivoBucketStorageDestino;
}

export interface ResultadoMigracaoMidiasStorage {
  readonly arquivosMigrados: number;
  readonly mapaUrls: ReadonlyMap<string, string>;
}

export function ehUrlEmuladorStorage(valor: string): boolean {
  return PADRAO_URL_EMULADOR_STORAGE.test(valor);
}

export function extrairCaminhoObjetoStorage(urlLocal: string): string {
  const correspondencia = PADRAO_URL_EMULADOR_STORAGE.exec(urlLocal);
  if (!correspondencia?.[1]) {
    throw new Error(`URL do emulador de Storage inválida: "${urlLocal}".`);
  }
  return decodeURIComponent(correspondencia[1]);
}

export function coletarUrlsEmuladorStorage(dados: unknown): readonly string[] {
  const encontradas = new Set<string>();

  function percorrer(no: unknown): void {
    if (typeof no === "string") {
      if (ehUrlEmuladorStorage(no)) {
        encontradas.add(no);
      }
      return;
    }

    if (Array.isArray(no)) {
      for (const item of no) {
        percorrer(item);
      }
      return;
    }

    if (no !== null && typeof no === "object") {
      for (const valor of Object.values(no as Record<string, unknown>)) {
        percorrer(valor);
      }
    }
  }

  percorrer(dados);
  return [...encontradas];
}

export function substituirUrlsRecursivamente<T>(
  dados: T,
  mapaSubstituicao: ReadonlyMap<string, string>,
): T {
  if (typeof dados === "string") {
    return (mapaSubstituicao.get(dados) ?? dados) as T;
  }

  if (Array.isArray(dados)) {
    return dados.map((item) => substituirUrlsRecursivamente(item, mapaSubstituicao)) as T;
  }

  if (dados !== null && typeof dados === "object") {
    const resultado: Record<string, unknown> = {};
    for (const [chave, valor] of Object.entries(dados as Record<string, unknown>)) {
      resultado[chave] = substituirUrlsRecursivamente(valor, mapaSubstituicao);
    }
    return resultado as T;
  }

  return dados;
}

export function montarUrlDownloadFirebaseStorage(
  nomeBucket: string,
  caminhoObjeto: string,
  tokenDownload: string,
): string {
  return `https://firebasestorage.googleapis.com/v0/b/${nomeBucket}/o/${encodeURIComponent(
    caminhoObjeto,
  )}?alt=media&token=${tokenDownload}`;
}

export async function migrarMidiasEmuladorParaStorageProducao<T>(
  dados: T,
  bucketDestino: BucketStorageDestino,
  fetchFn: typeof fetch = fetch,
): Promise<{ readonly dadosMigrados: T } & ResultadoMigracaoMidiasStorage> {
  const urlsLocais = coletarUrlsEmuladorStorage(dados);
  if (urlsLocais.length === 0) {
    return {
      dadosMigrados: dados,
      arquivosMigrados: 0,
      mapaUrls: new Map(),
    };
  }

  const mapaUrls = new Map<string, string>();

  for (const urlLocal of urlsLocais) {
    const caminhoObjeto = extrairCaminhoObjetoStorage(urlLocal);
    const resposta = await fetchFn(urlLocal);
    if (!resposta.ok) {
      throw new Error(
        `Falha ao baixar mídia local "${caminhoObjeto}" do emulador (HTTP ${resposta.status}).`,
      );
    }

    const buffer = Buffer.from(await resposta.arrayBuffer());
    const contentType = resposta.headers.get("content-type") ?? "application/octet-stream";
    const tokenDownload = randomUUID();

    await bucketDestino.file(caminhoObjeto).save(buffer, {
      contentType,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: tokenDownload,
        },
      },
    });

    const urlProducao = montarUrlDownloadFirebaseStorage(
      bucketDestino.name,
      caminhoObjeto,
      tokenDownload,
    );
    mapaUrls.set(urlLocal, urlProducao);
  }

  return {
    dadosMigrados: substituirUrlsRecursivamente(dados, mapaUrls),
    arquivosMigrados: mapaUrls.size,
    mapaUrls,
  };
}

