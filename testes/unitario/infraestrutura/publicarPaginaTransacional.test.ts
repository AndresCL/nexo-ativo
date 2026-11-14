import { converterEtapaParaLivre } from "@/dominio/microfluxos/composicaoEtapaLivre";
import type { Firestore } from "firebase-admin/firestore";
import { describe, expect, it } from "vitest";
import {
  criarResumoDireitosPlanoInicial,
  type MembroOrganizacao,
  type Organizacao,
  type UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import type { ProfissionalEquipe, ServicoOrganizacao } from "@/dominio/entidades/catalogoConteudo";
import { criarRascunhoConfiguracaoPaginaPadrao } from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { criarMicrofluxoPadraoParaTestes } from "../../fixtures/geradoresMicrofluxoTeste";
import { executarPublicacaoPaginaEditorial } from "../../../funcoes/src/casos-de-uso/publicarPaginaTransacional";
import { resolverAcoesVitrineComMicrofluxos } from "@/dominio/entidades/paginaPublicada";
import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";

function criarBancoFirestoreEmMemoria(inicial: Record<string, Record<string, unknown>> = {}) {
  const documentos = new Map<string, Record<string, unknown>>(Object.entries(inicial));
  let contadorAutoId = 0;

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
    const prefixoDireto = `${caminhoColecao}/`;

    return {
      doc: (idOpcional?: string) => {
        contadorAutoId += 1;
        const idFinal = idOpcional ?? `auto-${contadorAutoId}`;
        return criarReferenciaDocumento(`${caminhoColecao}/${idFinal}`);
      },
      get: async () => {
        const docs: Array<{ id: string; data: () => Record<string, unknown> }> = [];
        for (const [chave, valor] of documentos.entries()) {
          if (chave.startsWith(prefixoDireto)) {
            const sufixo = chave.slice(prefixoDireto.length);
            if (!sufixo.includes("/")) {
              docs.push({
                id: sufixo,
                data: () => valor,
              });
            }
          }
        }
        return { docs };
      },
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
        set: (ref: { path: string }, dados: Record<string, unknown>) => void;
      }) => Promise<T>,
    ): Promise<T> => {
      const gravacoesPendentes: Array<{ caminho: string; dados: Record<string, unknown> }> = [];
      const transacao = {
        get: async (ref: { path: string }) => ({
          exists: documentos.has(ref.path),
          data: () => documentos.get(ref.path),
        }),
        set: (ref: { path: string }, dados: Record<string, unknown>) => {
          gravacoesPendentes.push({ caminho: ref.path, dados });
        },
      };

      const resultado = await executor(transacao);
      for (const item of gravacoesPendentes) {
        documentos.set(item.caminho, item.dados);
      }
      return resultado;
    },
  };

  return {
    bancoDados: bancoFalso as unknown as Firestore,
    documentos,
  };
}

describe("Caso de Uso Transacional: publicarPaginaEditorial e Sincronização de Acervo", () => {
  const organizacaoBase: Organizacao = {
    id: "org-monte-claro",
    nome: "Atelier Monte Claro",
    identificadorPublico: "atelier-monte-claro",
    segmentoAtividade: "Arquitetura",
    situacao: "ativa",
    resumoDireitosPlano: criarResumoDireitosPlanoInicial(),
    criadoEmIso: "2026-11-08T10:00:00.000Z",
    atualizadoEmIso: "2026-11-08T10:00:00.000Z",
  };

  const membroProprietario: MembroOrganizacao = {
    usuarioId: "usr-prop",
    organizacaoId: "org-monte-claro",
    papel: "proprietario",
    situacao: "ativo",
    adicionadoEmIso: "2026-11-08T10:00:00.000Z",
  };

  const usuarioVerificado: UsuarioAutenticado = {
    uid: "usr-prop",
    email: "contato@monteclaro.arq.br",
    nomeExibicao: "Marina Monte Claro",
    fotoUrl: null,
    emailVerificado: true,
    provedoresConectados: ["password"],
  };

  it("deve publicar versões incrementais (v1 -> v2) sincronizando serviços e desativando itens ocultos", async () => {
    const rascunho = {
      ...criarRascunhoConfiguracaoPaginaPadrao({
        organizacaoId: organizacaoBase.id,
        nomeOrganizacao: organizacaoBase.nome,
      }),
      avaliacoesGoogle: {
        habilitado: true,
        identificadorLocal: "ChIJ_monte_claro",
        modoExibicao: "carrossel" as const,
      },
      chamadasEditoriaisAdicionais: [
        { sobretituloOpcional: "Campanha", tituloPrincipal: "Segunda mensagem editorial" },
        { tituloPrincipal: "Terceira mensagem editorial", descricaoCurta: "Apoio da campanha." },
      ],
    };

    const servicoAtivo: ServicoOrganizacao = {
      id: "srv-1",
      organizacaoId: organizacaoBase.id,
      nome: "Ensaio Editorial de Arquitetura",
      resumo: "Captação completa em locação.",
      categoria: "Comissionamento",
      precoBaseCentavos: 680000,
      ordemExibicao: 1,
      ativo: true,
      atualizadoEmIso: "2026-11-08T12:00:00.000Z",
    };

    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-monte-claro": organizacaoBase as unknown as Record<string, unknown>,
      "organizacoes/org-monte-claro/membros/usr-prop": membroProprietario as unknown as Record<
        string,
        unknown
      >,
      "organizacoes/org-monte-claro/configuracaoPagina/rascunho": rascunho as unknown as Record<
        string,
        unknown
      >,
      "organizacoes/org-monte-claro/servicos/srv-1": servicoAtivo as unknown as Record<
        string,
        unknown
      >,
    });

    const primeiraPublicacao = await executarPublicacaoPaginaEditorial(
      bancoDados,
      usuarioVerificado,
      { organizacaoId: "org-monte-claro" },
    );

    expect(primeiraPublicacao.versaoPublicada).toBe(1);
    expect(
      documentos.get("paginasPublicadas/org-monte-claro")?.chamadasEditoriaisAdicionais,
    ).toEqual(rascunho.chamadasEditoriaisAdicionais);
    expect(documentos.get("paginasPublicadas/org-monte-claro")?.avaliacoesGoogle).toEqual(
      rascunho.avaliacoesGoogle,
    );
    const historico = documentos.get("organizacoes/org-monte-claro/historicoPublicacoes/v1");
    expect(historico?.conteudoPublicado).toMatchObject({
      avaliacoesGoogle: rascunho.avaliacoesGoogle,
      chamadasEditoriaisAdicionais: rascunho.chamadasEditoriaisAdicionais,
    });
    expect(
      documentos.get("paginasPublicadas/org-monte-claro/servicosPublicados/srv-1")?.ativo,
    ).toBe(true);

    // Desativar o serviço no rascunho privado e republicar
    documentos.set("organizacoes/org-monte-claro/servicos/srv-1", {
      ...servicoAtivo,
      ativo: false,
    });
    documentos.set("organizacoes/org-monte-claro/configuracaoPagina/rascunho", {
      ...rascunho,
      chamadasEditoriaisAdicionais: [],
    });

    const segundaPublicacao = await executarPublicacaoPaginaEditorial(
      bancoDados,
      usuarioVerificado,
      { organizacaoId: "org-monte-claro" },
    );

    expect(segundaPublicacao.versaoPublicada).toBe(2);
    expect(
      documentos.get("paginasPublicadas/org-monte-claro")?.chamadasEditoriaisAdicionais,
    ).toEqual([]);
    expect(
      documentos.get("paginasPublicadas/org-monte-claro/servicosPublicados/srv-1")?.ativo,
    ).toBe(false);
  });

  it("deve bloquear publicação quando o número de profissionais ativos exceder o limite do plano", async () => {
    const prof1: ProfissionalEquipe = {
      id: "prof-1",
      organizacaoId: organizacaoBase.id,
      identificadorCartao: "marina-monte-claro",
      nomeCompleto: "Marina Monte Claro",
      cargoOuEspecialidade: "Fotógrafa",
      minibiografia: "Diretora autoral.",
      pontoFocalFoto: { xPercentual: 50, yPercentual: 30 },
      aceitaSolicitacoesDiretas: true,
      ordemExibicao: 1,
      ativo: true,
      atualizadoEmIso: "2026-11-08T12:00:00.000Z",
    };

    const prof2: ProfissionalEquipe = {
      ...prof1,
      id: "prof-2",
      identificadorCartao: "lucas-prado",
      nomeCompleto: "Lucas Prado",
    };

    const { bancoDados } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-monte-claro": organizacaoBase as unknown as Record<string, unknown>,
      "organizacoes/org-monte-claro/membros/usr-prop": membroProprietario as unknown as Record<
        string,
        unknown
      >,
      "organizacoes/org-monte-claro/profissionais/prof-1": prof1 as unknown as Record<
        string,
        unknown
      >,
      "organizacoes/org-monte-claro/profissionais/prof-2": prof2 as unknown as Record<
        string,
        unknown
      >,
    });

    await expect(
      executarPublicacaoPaginaEditorial(bancoDados, usuarioVerificado, {
        organizacaoId: "org-monte-claro",
      }),
    ).rejects.toThrow(/plano atual permite até 1/i);
  });

  it("deve bloquear publicação quando o e-mail do proprietário ainda não estiver verificado", async () => {
    const { bancoDados } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-monte-claro": organizacaoBase as unknown as Record<string, unknown>,
      "organizacoes/org-monte-claro/membros/usr-prop": membroProprietario as unknown as Record<
        string,
        unknown
      >,
    });

    await expect(
      executarPublicacaoPaginaEditorial(
        bancoDados,
        { ...usuarioVerificado, emailVerificado: false },
        { organizacaoId: "org-monte-claro" },
      ),
    ).rejects.toThrow(/Confirme seu endereço de e-mail/i);
  });

  it("deve impedir publicação por integrante com papel operacional 'membro'", async () => {
    const membroOperacional: MembroOrganizacao = {
      ...membroProprietario,
      usuarioId: "usr-equipe",
      papel: "membro",
    };

    const { bancoDados } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-monte-claro": organizacaoBase as unknown as Record<string, unknown>,
      "organizacoes/org-monte-claro/membros/usr-equipe": membroOperacional as unknown as Record<
        string,
        unknown
      >,
    });

    await expect(
      executarPublicacaoPaginaEditorial(
        bancoDados,
        { ...usuarioVerificado, uid: "usr-equipe" },
        { organizacaoId: "org-monte-claro" },
      ),
    ).rejects.toThrow(/não permite executar esta ação/i);
  });

  it("deve versionar microfluxos ativos em snapshots imutáveis (versoes/vN) e rejeitar grafos inválidos", async () => {
    const microfluxoExplorar = criarMicrofluxoPadraoParaTestes({
      organizacaoId: organizacaoBase.id,
      nomeOrganizacao: organizacaoBase.nome,
      modelo: "catalogo",
    });

    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-monte-claro": organizacaoBase as unknown as Record<string, unknown>,
      "organizacoes/org-monte-claro/membros/usr-prop": membroProprietario as unknown as Record<
        string,
        unknown
      >,
      "organizacoes/org-monte-claro/microfluxos/fluxo-catalogo":
        microfluxoExplorar as unknown as Record<string, unknown>,
    });

    await executarPublicacaoPaginaEditorial(bancoDados, usuarioVerificado, {
      organizacaoId: "org-monte-claro",
    });

    const publicado = documentos.get(
      "paginasPublicadas/org-monte-claro/microfluxosPublicados/fluxo-catalogo",
    );
    expect(publicado?.versaoPublicada).toBe(1);

    const snapshotV1 = documentos.get(
      "organizacoes/org-monte-claro/microfluxos/fluxo-catalogo/versoes/v1",
    );
    expect(snapshotV1?.versao).toBe(1);
  });

  it.each([3, null])(
    "publica posição e limite %s da equipe e os preserva na ação resolvida",
    async (limiteAvataresEquipe) => {
      const posicionamentoEquipe = { desktop: "abaixo_hero", mobile: "antes_acoes" } as const;
      const fluxo = {
        ...criarMicrofluxoPadraoParaTestes({
          organizacaoId: organizacaoBase.id,
          nomeOrganizacao: organizacaoBase.nome,
          modelo: "catalogo",
        }),
        tipoAcao: "secao_equipe",
        posicionamentoEquipe,
        limiteAvataresEquipe,
        rotuloBotaoHome: "Entre em contato conosco",
        tituloSecao: "Conheça nossos especialistas",
      };
      const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
        "organizacoes/org-monte-claro": { ...organizacaoBase },
        "organizacoes/org-monte-claro/membros/usr-prop": { ...membroProprietario },
        [`organizacoes/org-monte-claro/microfluxos/${fluxo.id}`]: fluxo,
      });
      await executarPublicacaoPaginaEditorial(bancoDados, usuarioVerificado, {
        organizacaoId: organizacaoBase.id,
      });
      const publicado = esquemaDefinicaoMicrofluxo.parse(
        documentos.get(`paginasPublicadas/org-monte-claro/microfluxosPublicados/${fluxo.id}`),
      );
      expect(publicado.tituloSecao).toBe("Conheça nossos especialistas");
      expect(publicado.posicionamentoEquipe).toEqual(posicionamentoEquipe);
      expect(publicado.limiteAvataresEquipe).toBe(limiteAvataresEquipe);
      expect(
        documentos.get(`organizacoes/org-monte-claro/microfluxos/${fluxo.id}/versoes/v1`)
          ?.definicaoImutavel,
      ).toMatchObject({
        posicionamentoEquipe,
        limiteAvataresEquipe,
        tituloSecao: "Conheça nossos especialistas",
      });
      expect(resolverAcoesVitrineComMicrofluxos([], [publicado])[0]).toMatchObject({
        rotulo: "Entre em contato conosco",
        tituloSecao: "Conheça nossos especialistas",
        destino: "#equipe",
        posicionamentoEquipe,
        limiteAvataresEquipe,
      });
    },
  );
  it("publica a conclusão sem ações preservando sua configuração na versão imutável", async () => {
    const conclusao = {
      acoes: [],
      resumo: { ativo: false, campos: [], incluirDemonstrativo: false },
      camposWhatsapp: [],
    };
    const fluxo = {
      ...criarMicrofluxoPadraoParaTestes({
        organizacaoId: organizacaoBase.id,
        nomeOrganizacao: organizacaoBase.nome,
        modelo: "catalogo",
      }),
      conclusao,
    };
    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-monte-claro": { ...organizacaoBase },
      "organizacoes/org-monte-claro/membros/usr-prop": { ...membroProprietario },
      [`organizacoes/org-monte-claro/microfluxos/${fluxo.id}`]: fluxo,
    });
    await executarPublicacaoPaginaEditorial(bancoDados, usuarioVerificado, {
      organizacaoId: organizacaoBase.id,
    });
    expect(
      documentos.get(`paginasPublicadas/org-monte-claro/microfluxosPublicados/${fluxo.id}`)
        ?.conclusao,
    ).toEqual(conclusao);
    expect(
      documentos.get(`organizacoes/org-monte-claro/microfluxos/${fluxo.id}/versoes/v1`)
        ?.definicaoImutavel,
    ).toMatchObject({ conclusao });
  });
  it("recusa destino privado no backend antes de gravar uma nova versão pública", async () => {
    const fluxo = {
      ...criarMicrofluxoPadraoParaTestes({
        organizacaoId: organizacaoBase.id,
        nomeOrganizacao: organizacaoBase.nome,
        modelo: "catalogo",
      }),
      conclusao: {
        acoes: [{ tipo: "microfluxo", rotulo: "Continuar", microfluxoId: "privado" }],
        resumo: { ativo: false, campos: [], incluirDemonstrativo: false },
        camposWhatsapp: [],
      },
    };
    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-monte-claro": { ...organizacaoBase },
      "organizacoes/org-monte-claro/membros/usr-prop": { ...membroProprietario },
      [`organizacoes/org-monte-claro/microfluxos/${fluxo.id}`]: fluxo,
    });
    await expect(
      executarPublicacaoPaginaEditorial(bancoDados, usuarioVerificado, {
        organizacaoId: organizacaoBase.id,
      }),
    ).rejects.toThrow(/destino/);
    expect(documentos.has(`paginasPublicadas/org-monte-claro`)).toBe(false);
  });
  it("publica composição livre preservando elementos editáveis na versão imutável", async () => {
    const base = criarMicrofluxoPadraoParaTestes({
      organizacaoId: organizacaoBase.id,
      nomeOrganizacao: organizacaoBase.nome,
      modelo: "catalogo",
    });
    const fluxo = { ...base, etapas: base.etapas.map(converterEtapaParaLivre) };
    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-monte-claro": { ...organizacaoBase },
      "organizacoes/org-monte-claro/membros/usr-prop": { ...membroProprietario },
      [`organizacoes/org-monte-claro/microfluxos/${fluxo.id}`]: fluxo,
    });
    await executarPublicacaoPaginaEditorial(bancoDados, usuarioVerificado, {
      organizacaoId: organizacaoBase.id,
    });
    const publicado = esquemaDefinicaoMicrofluxo.parse(
      documentos.get(`paginasPublicadas/org-monte-claro/microfluxosPublicados/${fluxo.id}`),
    );
    expect(publicado.etapas[0]).toMatchObject({
      tipoEtapa: "etapa_livre",
      blocos: [expect.objectContaining({ tipo: "catalogo" })],
    });
    expect(publicado.etapas[1]!.blocos).toContainEqual(
      expect.objectContaining({ tipo: "campo", finalidade: "telefoneOuWhatsapp" }),
    );
    expect(
      documentos.get(`organizacoes/org-monte-claro/microfluxos/${fluxo.id}/versoes/v1`)
        ?.definicaoImutavel,
    ).toMatchObject({ etapas: publicado.etapas });
  });
  it("recusa publicar uma experiência ativa sem etapa inicial mesmo quando o rascunho pode ser salvo", async () => {
    const fluxo = {
      ...criarMicrofluxoPadraoParaTestes({
        organizacaoId: organizacaoBase.id,
        nomeOrganizacao: organizacaoBase.nome,
        modelo: "catalogo",
      }),
      etapaInicialId: "",
      etapas: [],
    };
    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-monte-claro": { ...organizacaoBase },
      "organizacoes/org-monte-claro/membros/usr-prop": { ...membroProprietario },
      [`organizacoes/org-monte-claro/microfluxos/${fluxo.id}`]: fluxo,
    });
    await expect(
      executarPublicacaoPaginaEditorial(bancoDados, usuarioVerificado, {
        organizacaoId: organizacaoBase.id,
      }),
    ).rejects.toThrow(/pelo menos uma etapa/);
    expect(documentos.has("paginasPublicadas/org-monte-claro")).toBe(false);
  });
});
