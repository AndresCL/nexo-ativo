import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

// Os testes limpam apenas este projeto, preservando os dados usados no desenvolvimento.
const PROJETO_TESTE_ID = "demo-fluxo-regras";

describe("Firestore Security Rules — Isolamento Multi-Tenant e Autorização", () => {
  let ambienteTeste: RulesTestEnvironment;

  it("impede visitantes e proprietários de consultar ou zerar cotas do Google", async () => {
    const anonimo = ambienteTeste.unauthenticatedContext().firestore();
    const proprietario = ambienteTeste.authenticatedContext("uid-prop-alfa").firestore();
    for (const banco of [anonimo, proprietario]) {
      const referencia = doc(banco, "consumoAvaliacoesGoogle/org-alfa");
      await assertFails(getDoc(referencia));
      await assertFails(setDoc(referencia, { consultasMes: 0 }));
      await assertFails(
        setDoc(doc(banco, "consumoAvaliacoesGoogle/_plataforma"), { consultasMes: 0 }),
      );
    }
  });

  beforeAll(async () => {
    const regrasFirestore = readFileSync(resolve(__dirname, "../../firestore.rules"), "utf8");
    const enderecoEmulador = new URL(
      `http://${process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080"}`,
    );

    ambienteTeste = await initializeTestEnvironment({
      projectId: PROJETO_TESTE_ID,
      firestore: {
        host: enderecoEmulador.hostname,
        port: Number(enderecoEmulador.port),
        rules: regrasFirestore,
      },
    });
  });

  beforeEach(async () => {
    await ambienteTeste.clearFirestore();

    await ambienteTeste.withSecurityRulesDisabled(async (contextoAdmin) => {
      const banco = contextoAdmin.firestore();

      // Organização Alfa (publicada)
      await setDoc(doc(banco, "organizacoes/org-alfa"), {
        id: "org-alfa",
        nome: "Atelier Alfa",
        identificadorPublico: "atelier-alfa",
        segmentoAtividade: "Arquitetura",
        situacao: "ativa",
        resumoDireitosPlano: {
          planoCodigo: "pro",
          situacaoAssinatura: "ativa",
          limiteProfissionaisAtivos: 1,
          limiteEnviosEmailMensal: 500,
          permitePublicacaoPublica: true,
        },
        criadoEmIso: "2026-11-08T10:00:00.000Z",
        atualizadoEmIso: "2026-11-08T10:00:00.000Z",
      });

      await setDoc(doc(banco, "organizacoes/org-alfa/membros/uid-prop-alfa"), {
        usuarioId: "uid-prop-alfa",
        organizacaoId: "org-alfa",
        papel: "proprietario",
        situacao: "ativo",
        adicionadoEmIso: "2026-11-08T10:00:00.000Z",
      });

      await setDoc(doc(banco, "organizacoes/org-alfa/membros/uid-membro-alfa"), {
        usuarioId: "uid-membro-alfa",
        organizacaoId: "org-alfa",
        papel: "membro",
        situacao: "ativo",
        adicionadoEmIso: "2026-11-08T10:00:00.000Z",
      });

      await setDoc(doc(banco, "organizacoes/org-alfa/membros/uid-admin-alfa"), {
        usuarioId: "uid-admin-alfa",
        organizacaoId: "org-alfa",
        papel: "administrador",
        situacao: "ativo",
      });
      await setDoc(doc(banco, "organizacoes/org-alfa/microfluxos/fluxo-teste"), {
        id: "fluxo-teste",
        organizacaoId: "org-alfa",
        titulo: "Experiência de teste",
        ativo: true,
        versaoPublicada: 1,
      });
      await setDoc(doc(banco, "organizacoes/org-alfa/microfluxos/fluxo-teste/versoes/v1"), {
        versao: 1,
        microfluxoId: "fluxo-teste",
        organizacaoId: "org-alfa",
      });

      await setDoc(doc(banco, "organizacoes/org-alfa/configuracaoPagina/rascunho"), {
        organizacaoId: "org-alfa",
        tituloEditorial: "Rascunho Privado Alfa",
      });

      await setDoc(doc(banco, "organizacoes/org-alfa/solicitacoes/sol-alfa-1"), {
        organizacaoId: "org-alfa",
        nomeVisitante: "Carlos Mendes",
        situacao: "nova",
        observacoesInternas: [],
        criadoEmIso: "2026-11-08T10:05:00.000Z",
      });

      await setDoc(doc(banco, "paginasPublicadas/org-alfa"), {
        organizacaoId: "org-alfa",
        publicado: true,
        paginaAtiva: true,
        tituloEditorial: "Atelier Alfa Público",
      });

      await setDoc(doc(banco, "paginasPublicadas/org-alfa/servicosPublicados/srv-1"), {
        organizacaoId: "org-alfa",
        nome: "Projeto Residencial",
        ativo: true,
      });

      // Organização Beta (isolada de Alfa e ainda não publicada)
      await setDoc(doc(banco, "organizacoes/org-beta"), {
        id: "org-beta",
        nome: "Clínica Beta",
        identificadorPublico: "clinica-beta",
        segmentoAtividade: "Medicina",
        situacao: "ativa",
        resumoDireitosPlano: {
          planoCodigo: "equipe",
          situacaoAssinatura: "ativa",
          limiteProfissionaisAtivos: 5,
          limiteEnviosEmailMensal: 2000,
          permitePublicacaoPublica: true,
        },
        criadoEmIso: "2026-11-08T10:00:00.000Z",
        atualizadoEmIso: "2026-11-08T10:00:00.000Z",
      });

      await setDoc(doc(banco, "organizacoes/org-beta/membros/uid-prop-beta"), {
        usuarioId: "uid-prop-beta",
        organizacaoId: "org-beta",
        papel: "proprietario",
        situacao: "ativo",
        adicionadoEmIso: "2026-11-08T10:00:00.000Z",
      });

      await setDoc(doc(banco, "organizacoes/org-beta/configuracaoPagina/rascunho"), {
        organizacaoId: "org-beta",
        tituloEditorial: "Rascunho Secreto Beta",
      });

      await setDoc(doc(banco, "organizacoes/org-beta/solicitacoes/sol-beta-1"), {
        organizacaoId: "org-beta",
        nomeVisitante: "Paciente Confidencial",
        situacao: "nova",
      });

      await setDoc(doc(banco, "paginasPublicadas/org-beta"), {
        organizacaoId: "org-beta",
        publicado: false,
        paginaAtiva: false,
      });

      // Documentos administrativos e financeiros restritos ao Fundador
      await setDoc(doc(banco, "assinaturas/ass-alfa"), {
        organizacaoId: "org-alfa",
        situacao: "ativa",
        valorCentavos: 9700,
      });

      await setDoc(doc(banco, "cobrancas/cob-alfa"), {
        organizacaoId: "org-alfa",
        valorCentavos: 9700,
      });

      await setDoc(doc(banco, "registrosAuditoria/aud-1"), {
        acao: "CRIAR_ORGANIZACAO_INICIAL",
        atorUsuarioId: "uid-prop-alfa",
      });
    });
  });

  afterAll(async () => {
    await ambienteTeste.cleanup();
  });

  it("permite excluir experiências somente ao proprietário ou administrador da organização, preservando o histórico", async () => {
    const caminho = "organizacoes/org-alfa/microfluxos/fluxo-teste";
    const membro = ambienteTeste.authenticatedContext("uid-membro-alfa").firestore();
    const outraOrganizacao = ambienteTeste.authenticatedContext("uid-prop-beta").firestore();
    const anonimo = ambienteTeste.unauthenticatedContext().firestore();
    for (const banco of [membro, outraOrganizacao, anonimo]) {
      await assertFails(deleteDoc(doc(banco, caminho)));
    }
    const proprietario = ambienteTeste.authenticatedContext("uid-prop-alfa").firestore();
    await assertSucceeds(deleteDoc(doc(proprietario, caminho)));
    expect((await getDoc(doc(proprietario, `${caminho}/versoes/v1`))).exists()).toBe(true);
    const administrador = ambienteTeste.authenticatedContext("uid-admin-alfa").firestore();
    await assertSucceeds(
      setDoc(doc(administrador, caminho), { organizacaoId: "org-alfa", ativo: true }),
    );
    await assertSucceeds(deleteDoc(doc(administrador, caminho)));
  });

  it("mantém a experiência quando outra gravação do mesmo lote não é autorizada", async () => {
    const banco = ambienteTeste.authenticatedContext("uid-prop-alfa").firestore();
    const referencia = doc(banco, "organizacoes/org-alfa/microfluxos/fluxo-teste");
    const lote = writeBatch(banco);
    lote.delete(referencia);
    lote.set(doc(banco, "organizacoes/org-beta/microfluxos/invasao"), {
      organizacaoId: "org-beta",
      ativo: true,
    });
    await assertFails(lote.commit());
    expect((await getDoc(referencia)).exists()).toBe(true);
  });

  it("deve impedir totalmente que o proprietário da Organização Alfa leia ou altere dados privados da Organização Beta", async () => {
    const propAlfa = ambienteTeste.authenticatedContext("uid-prop-alfa").firestore();

    await assertFails(getDoc(doc(propAlfa, "organizacoes/org-beta")));
    await assertFails(getDoc(doc(propAlfa, "organizacoes/org-beta/configuracaoPagina/rascunho")));
    await assertFails(getDoc(doc(propAlfa, "organizacoes/org-beta/solicitacoes/sol-beta-1")));
    await assertFails(getDoc(doc(propAlfa, "organizacoes/org-beta/membros/uid-prop-beta")));
    await assertFails(
      setDoc(doc(propAlfa, "organizacoes/org-beta/servicos/invasao"), {
        organizacaoId: "org-beta",
        nome: "Serviço Injetado",
      }),
    );
  });

  it("deve permitir operações legítimas na própria organização e impedir escalonamento de plano ou membros pelo navegador", async () => {
    const propAlfa = ambienteTeste.authenticatedContext("uid-prop-alfa").firestore();
    const membroComumAlfa = ambienteTeste.authenticatedContext("uid-membro-alfa").firestore();

    // Proprietário lê sua organização e cadastra serviço próprio
    await assertSucceeds(getDoc(doc(propAlfa, "organizacoes/org-alfa")));
    await assertSucceeds(
      setDoc(doc(propAlfa, "organizacoes/org-alfa/servicos/srv-novo"), {
        organizacaoId: "org-alfa",
        nome: "Consultoria de Interiores",
        ativo: true,
      }),
    );

    // Proprietário NÃO pode adulterar seus próprios direitos de plano, perfil de publicidade nem injetar membros direto pelo cliente
    await assertFails(
      updateDoc(doc(propAlfa, "organizacoes/org-alfa"), {
        "resumoDireitosPlano.planoCodigo": "equipe",
      }),
    );
    await assertFails(
      updateDoc(doc(propAlfa, "organizacoes/org-alfa"), {
        perfilPublicidade: "advocacia_oab",
      }),
    );
    await assertFails(
      setDoc(doc(propAlfa, "organizacoes/org-alfa/membros/uid-externo"), {
        usuarioId: "uid-externo",
        organizacaoId: "org-alfa",
        papel: "administrador",
        situacao: "ativo",
      }),
    );

    // Membro operacional pode atualizar situação da solicitação, mas não pode alterar nome do visitante nem editar aparência
    await assertSucceeds(
      updateDoc(doc(membroComumAlfa, "organizacoes/org-alfa/solicitacoes/sol-alfa-1"), {
        situacao: "em_atendimento",
        atualizadoEmIso: "2026-11-08T12:00:00.000Z",
      }),
    );
    await assertFails(
      updateDoc(doc(membroComumAlfa, "organizacoes/org-alfa/solicitacoes/sol-alfa-1"), {
        nomeVisitante: "Adulterado",
      }),
    );
    await assertFails(
      updateDoc(doc(membroComumAlfa, "organizacoes/org-alfa/configuracaoPagina/rascunho"), {
        tituloEditorial: "Tentativa Sem Permissão",
      }),
    );
  });

  it("deve expor ao visitante anônimo apenas páginas publicadas ativas e bloquear leitura de rascunhos ou escrita direta", async () => {
    const visitanteAnonimo = ambienteTeste.unauthenticatedContext().firestore();

    await assertSucceeds(getDoc(doc(visitanteAnonimo, "paginasPublicadas/org-alfa")));
    await assertSucceeds(
      getDoc(doc(visitanteAnonimo, "paginasPublicadas/org-alfa/servicosPublicados/srv-1")),
    );

    // Página não publicada da Clínica Beta e rascunhos privados permanecem inacessíveis
    await assertFails(getDoc(doc(visitanteAnonimo, "paginasPublicadas/org-beta")));
    await assertFails(
      getDoc(doc(visitanteAnonimo, "organizacoes/org-alfa/configuracaoPagina/rascunho")),
    );

    // Escrita direta anônima bloqueada
    await assertFails(
      setDoc(doc(visitanteAnonimo, "paginasPublicadas/org-alfa"), {
        publicado: true,
        paginaAtiva: true,
        tituloEditorial: "Desfiguração",
      }),
    );
    await assertFails(
      setDoc(doc(visitanteAnonimo, "organizacoes/org-alfa/solicitacoes/spam-direto"), {
        organizacaoId: "org-alfa",
        nomeVisitante: "Spam",
      }),
    );
  });

  it("deve restringir assinaturas, cobranças e auditoria exclusivamente ao usuário com Custom Claim fundador", async () => {
    const propAlfa = ambienteTeste.authenticatedContext("uid-prop-alfa").firestore();
    const fundador = ambienteTeste
      .authenticatedContext("uid-fundador-plataforma", {
        papelPlataforma: "fundador",
      })
      .firestore();

    await assertFails(getDoc(doc(propAlfa, "assinaturas/ass-alfa")));
    await assertFails(getDoc(doc(propAlfa, "cobrancas/cob-alfa")));
    await assertFails(getDoc(doc(propAlfa, "registrosAuditoria/aud-1")));

    await assertSucceeds(getDoc(doc(fundador, "assinaturas/ass-alfa")));
    await assertSucceeds(getDoc(doc(fundador, "cobrancas/cob-alfa")));
    await assertSucceeds(getDoc(doc(fundador, "registrosAuditoria/aud-1")));
    await assertSucceeds(getDoc(doc(fundador, "organizacoes/org-beta")));

    // Mesmo o fundador não pode alterar registros de auditoria diretamente pelo navegador
    await assertFails(
      setDoc(doc(fundador, "registrosAuditoria/aud-forjada"), {
        acao: "FORJADA",
      }),
    );
  });
});
