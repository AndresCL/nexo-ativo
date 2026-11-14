import type { Firestore } from "firebase-admin/firestore";
import {
  criarResumoDireitosPlanoInicial,
  type UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import { criarPaginaAvaliacoesGoogleTeste } from "./dadosAvaliacoesGoogleTeste";

export const USUARIO_AVALIACOES_TESTE: UsuarioAutenticado = {
  uid: "usuario-serena",
  email: "serena@example.com",
  emailVerificado: true,
  nomeExibicao: "Serena",
  fotoUrl: null,
  provedoresConectados: ["password"],
};

interface ReferenciaTeste {
  readonly caminho: string;
  get: () => Promise<{ exists: boolean; data: () => Record<string, unknown> | undefined }>;
  collection: (nome: string) => { doc: (id: string) => ReferenciaTeste };
}

export function criarBancoAvaliacoesGoogleTeste() {
  const documentos = new Map<string, Record<string, unknown>>([
    ["identificadoresPublicos/clinica-serena", { organizacaoId: "org-serena", situacao: "ativo" }],
    ["paginasPublicadas/org-serena", { ...criarPaginaAvaliacoesGoogleTeste() }],
    [
      "organizacoes/org-serena",
      {
        id: "org-serena",
        situacao: "ativa",
        resumoDireitosPlano: criarResumoDireitosPlanoInicial(),
      },
    ],
    [
      "organizacoes/org-serena/membros/usuario-serena",
      {
        usuarioId: "usuario-serena",
        organizacaoId: "org-serena",
        papel: "administrador",
        situacao: "ativo",
      },
    ],
  ]);

  function referencia(caminho: string): ReferenciaTeste {
    return {
      caminho,
      get: async () => ({ exists: documentos.has(caminho), data: () => documentos.get(caminho) }),
      collection: (nome: string) => ({
        doc: (id: string) => referencia(`${caminho}/${nome}/${id}`),
      }),
    };
  }
  let fila = Promise.resolve();
  const banco = {
    collection: (nome: string) => ({ doc: (id: string) => referencia(`${nome}/${id}`) }),
    async runTransaction<T>(
      executar: (transacao: {
        get: (ref: ReferenciaTeste) => ReturnType<ReferenciaTeste["get"]>;
        set: (ref: ReferenciaTeste, valor: Record<string, unknown>) => void;
      }) => Promise<T>,
    ): Promise<T> {
      const anterior = fila;
      let liberar!: () => void;
      fila = new Promise<void>((resolver) => {
        liberar = resolver;
      });
      await anterior;
      const escritas: Array<[string, Record<string, unknown>]> = [];
      try {
        const resultado = await executar({
          get: (ref) => ref.get(),
          set: (ref, valor) => {
            escritas.push([ref.caminho, valor]);
          },
        });
        for (const [caminho, valor] of escritas) documentos.set(caminho, valor);
        return resultado;
      } finally {
        liberar();
      }
    },
  };
  return { bancoDados: banco as unknown as Firestore, documentos };
}
