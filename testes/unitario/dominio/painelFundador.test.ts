import type { Firestore } from "firebase-admin/firestore";
import { describe, expect, it } from "vitest";
import {
  criarResumoDireitosPlanoInicial,
  type Organizacao,
  type UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import { executarAjustePlanoOrganizacaoFundador } from "../../../funcoes/src/casos-de-uso/ajustarPlanoOrganizacaoFundador";
import { executarAlteracaoSituacaoOrganizacaoFundador } from "../../../funcoes/src/casos-de-uso/atualizarSituacaoOrganizacaoFundador";
import { executarCriacaoOrganizacaoPeloFundador } from "../../../funcoes/src/casos-de-uso/criarOrganizacaoPeloFundador";
import { executarDefinicaoPerfilPublicidadeOrganizacaoFundador } from "../../../funcoes/src/casos-de-uso/definirPerfilPublicidadeOrganizacaoFundador";
import {
  esquemaAdicionarMensagemKanbanFundador,
  esquemaAlterarEtapaKanbanFundador,
} from "@/validacoes/esquemasPainelFundador";

function criarBancoFirestoreEmMemoria(inicial: Record<string, Record<string, unknown>> = {}) {
  const documentos = new Map<string, Record<string, unknown>>(Object.entries(inicial));

  function criarReferenciaDocumento(caminho: string): Record<string, unknown> {
    const partes = caminho.split("/");
    const id = partes[partes.length - 1] ?? "doc";

    return {
      id,
      path: caminho,
      get: async () => ({
        exists: documentos.has(caminho),
        data: () => documentos.get(caminho),
      }),
      collection: (subcolecao: string) => criarReferenciaColecao(`${caminho}/${subcolecao}`),
    };
  }

  function criarReferenciaColecao(caminhoColecao: string) {
    let proximoId = 1;
    return {
      doc: (idDoc?: string) =>
        criarReferenciaDocumento(`${caminhoColecao}/${idDoc || `id_gerado_${proximoId++}`}`),
    };
  }

  const bancoFalso = {
    collection: (nomeColecao: string) => criarReferenciaColecao(nomeColecao),
    runTransaction: async <T>(
      executor: (transacao: {
        get: (ref: { path: string }) => Promise<{
          exists: boolean;
          data: () => Record<string, unknown> | undefined;
        }>;
        set: (
          ref: { path: string },
          dados: Record<string, unknown>,
          opcoes?: { merge?: boolean },
        ) => void;
        update: (ref: { path: string }, dados: Record<string, unknown>) => void;
      }) => Promise<T>,
    ): Promise<T> => {
      const transacao = {
        get: async (ref: { path: string }) => ({
          exists: documentos.has(ref.path),
          data: () => documentos.get(ref.path),
        }),
        set: (
          ref: { path: string },
          dados: Record<string, unknown>,
          opcoes?: { merge?: boolean },
        ) => {
          if (opcoes?.merge && documentos.has(ref.path)) {
            documentos.set(ref.path, { ...documentos.get(ref.path), ...dados });
          } else {
            documentos.set(ref.path, dados);
          }
        },
        update: (ref: { path: string }, dados: Record<string, unknown>) => {
          const anterior = documentos.get(ref.path) || {};
          documentos.set(ref.path, { ...anterior, ...dados });
        },
      };

      return executor(transacao);
    },
  };

  return {
    bancoDados: bancoFalso as unknown as Firestore,
    documentos,
  };
}

describe("Painel Fundador: Governança Global e Trilha de Auditoria", () => {
  const usuarioFundador: UsuarioAutenticado = {
    uid: "usr-fundador-master",
    email: "fundador@fluxo.app.br",
    nomeExibicao: "Fundador Fluxo",
    fotoUrl: null,
    emailVerificado: true,
    papelPlataforma: "fundador",
    provedoresConectados: ["password"],
  };

  const usuarioMembroComum: UsuarioAutenticado = {
    uid: "usr-comum",
    email: "comum@cliente.com.br",
    nomeExibicao: "Membro Comum",
    fotoUrl: null,
    emailVerificado: true,
    provedoresConectados: ["password"],
  };

  const organizacaoTeste: Organizacao = {
    id: "org-alvo",
    nome: "Estúdio Alvo",
    identificadorPublico: "estudio-alvo",
    segmentoAtividade: "Design",
    situacao: "ativa",
    resumoDireitosPlano: criarResumoDireitosPlanoInicial(),
    criadoEmIso: "2026-11-08T10:00:00.000Z",
    atualizadoEmIso: "2026-11-08T10:00:00.000Z",
  };

  it("deve permitir ao fundador suspender organização e gravar log em registrosAuditoria", async () => {
    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-alvo": organizacaoTeste as unknown as Record<string, unknown>,
    });

    const resultado = await executarAlteracaoSituacaoOrganizacaoFundador(
      bancoDados,
      usuarioFundador,
      {
        organizacaoId: "org-alvo",
        novaSituacao: "suspensa",
        justificativa: "Suspensão preventiva solicitada pelo suporte.",
      },
    );

    expect(resultado.atualizado).toBe(true);
    expect(resultado.novaSituacao).toBe("suspensa");

    const orgSalva = documentos.get("organizacoes/org-alvo") as unknown as Organizacao;
    expect(orgSalva.situacao).toBe("suspensa");

    // Confere gravação na trilha de auditoria
    const logsAuditoria = Array.from(documentos.entries()).filter(([caminho]) =>
      caminho.startsWith("registrosAuditoria/"),
    );
    expect(logsAuditoria.length).toBe(1);
    const [_, dadosLog] = logsAuditoria[0]!;
    expect(dadosLog.acao).toBe("fundador_alterou_situacao_organizacao");
    expect(dadosLog.atorUsuarioId).toBe("usr-fundador-master");
    expect(dadosLog.organizacaoAlvoId).toBe("org-alvo");
  });

  it("deve recusar tentativa de alteração executada por usuário sem privilégio de fundador", async () => {
    const { bancoDados } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-alvo": organizacaoTeste as unknown as Record<string, unknown>,
    });

    await expect(
      executarAlteracaoSituacaoOrganizacaoFundador(bancoDados, usuarioMembroComum, {
        organizacaoId: "org-alvo",
        novaSituacao: "suspensa",
        justificativa: "Tentativa não autorizada.",
      }),
    ).rejects.toThrow(/exclusiva da administração da plataforma/);
  });

  it("deve permitir ao fundador ajustar manualmente o plano e limites de uma organização", async () => {
    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-alvo": organizacaoTeste as unknown as Record<string, unknown>,
    });

    const resultado = await executarAjustePlanoOrganizacaoFundador(bancoDados, usuarioFundador, {
      organizacaoId: "org-alvo",
      novoPlanoCodigo: "personalizado",
      novaSituacaoAssinatura: "ativa",
      limiteProfissionaisAtivos: 20,
      limiteEnviosEmailMensal: 5000,
      justificativa: "Upgrade para contrato corporativo sob medida.",
    });

    expect(resultado.atualizado).toBe(true);

    const orgSalva = documentos.get("organizacoes/org-alvo") as unknown as Organizacao;
    expect(orgSalva.resumoDireitosPlano.planoCodigo).toBe("personalizado");
    expect(orgSalva.resumoDireitosPlano.limiteProfissionaisAtivos).toBe(20);
    expect(orgSalva.resumoDireitosPlano.limiteEnviosEmailMensal).toBe(5000);
    expect(orgSalva.resumoDireitosPlano.permitePublicacaoPublica).toBe(true);
  });
  it("deve permitir ao fundador definir o perfil de publicidade, refletir na página publicada e auditar", async () => {
    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-alvo": organizacaoTeste as unknown as Record<string, unknown>,
      "paginasPublicadas/org-alvo": { organizacaoId: "org-alvo", publicado: true },
    });

    const resultado = await executarDefinicaoPerfilPublicidadeOrganizacaoFundador(
      bancoDados,
      usuarioFundador,
      {
        organizacaoId: "org-alvo",
        novoPerfil: "advocacia_oab",
        justificativa: "Cliente é escritório de advocacia.",
      },
    );

    expect(resultado.novoPerfil).toBe("advocacia_oab");
    expect(
      (documentos.get("organizacoes/org-alvo") as unknown as Organizacao).perfilPublicidade,
    ).toBe("advocacia_oab");
    expect(documentos.get("paginasPublicadas/org-alvo")?.perfilPublicidade).toBe("advocacia_oab");

    const auditoria = Array.from(documentos.entries()).filter(([caminho]) =>
      caminho.startsWith("registrosAuditoria/"),
    );
    expect(auditoria).toHaveLength(1);
    expect(auditoria[0]?.[1].acao).toBe("fundador_definiu_perfil_publicidade_organizacao");
  });

  it("deve negar a definição do perfil de publicidade a quem não é fundador", async () => {
    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-alvo": organizacaoTeste as unknown as Record<string, unknown>,
    });

    await expect(
      executarDefinicaoPerfilPublicidadeOrganizacaoFundador(bancoDados, usuarioMembroComum, {
        organizacaoId: "org-alvo",
        novoPerfil: "medicina_cfm",
        justificativa: "Tentativa indevida de alteração.",
      }),
    ).rejects.toThrow();

    expect(
      (documentos.get("organizacoes/org-alvo") as unknown as Organizacao).perfilPublicidade,
    ).toBeUndefined();
  });

  it("deve rejeitar perfil de publicidade desconhecido", async () => {
    const { bancoDados } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-alvo": organizacaoTeste as unknown as Record<string, unknown>,
    });

    await expect(
      executarDefinicaoPerfilPublicidadeOrganizacaoFundador(bancoDados, usuarioFundador, {
        organizacaoId: "org-alvo",
        novoPerfil: "perfil_inexistente",
        justificativa: "Perfil inexistente para teste.",
      }),
    ).rejects.toThrow();
  });

  it("deve permitir ao fundador criar uma organização manualmente com proprietário e vínculo de administrador", async () => {
    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria();
    const authFalso = {
      getUserByEmail: async () => {
        const erro = new Error("Não encontrado") as Error & { code: string };
        erro.code = "auth/user-not-found";
        throw erro;
      },
      createUser: async (props: { email: string; displayName: string }) => ({
        uid: "uid-novo-cliente",
        email: props.email,
        displayName: props.displayName,
      }),
    };

    const resultado = await executarCriacaoOrganizacaoPeloFundador(
      bancoDados,
      authFalso,
      usuarioFundador,
      {
        nome: "Garage 88",
        identificadorPublico: "garage-88",
        segmentoAtividade: "Concessionária de veículos",
        emailProprietario: "admin@garage88.com.br",
        nomeProprietario: "Admin Garage 88",
        senhaInicialOpcional: "garage88@123",
        planoCodigo: "pro",
        perfilPublicidade: "padrao",
        vincularFundadorComoAdministrador: true,
      },
    );

    expect(resultado.organizacao.identificadorPublico).toBe("garage-88");
    expect(resultado.organizacao.planoCodigo).toBe("pro");
    expect(resultado.organizacao.totalMembros).toBe(2);
    expect(documentos.get("identificadoresPublicos/garage-88")?.organizacaoId).toBe(
      resultado.organizacao.id,
    );
    expect(
      documentos.get(
        `organizacoes/${resultado.organizacao.id}/membros/${usuarioFundador.uid}`,
      )?.papel,
    ).toBe("administrador");
  });

  it("deve validar corretamente as etapas do Kanban e mensagens do acompanhamento do fundador", () => {
    expect(
      esquemaAlterarEtapaKanbanFundador.safeParse({
        organizacaoId: "org-alvo",
        etapaKanban: "atencao",
      }).success,
    ).toBe(true);

    expect(
      esquemaAlterarEtapaKanbanFundador.safeParse({
        organizacaoId: "org-alvo",
        etapaKanban: "etapa_invalida",
      }).success,
    ).toBe(false);

    expect(
      esquemaAdicionarMensagemKanbanFundador.safeParse({
        organizacaoId: "org-alvo",
        texto: "Cliente solicitou acompanhamento na configuração dos microfluxos.",
      }).success,
    ).toBe(true);

    expect(
      esquemaAdicionarMensagemKanbanFundador.safeParse({
        organizacaoId: "org-alvo",
        texto: "   ",
      }).success,
    ).toBe(false);
  });
});
