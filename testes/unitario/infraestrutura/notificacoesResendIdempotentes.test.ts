import type { Firestore } from "firebase-admin/firestore";
import { describe, expect, it, vi } from "vitest";
import type {
  MensagemEmailTransacional,
  ConfiguracaoEmailOrganizacao,
  ConsumoMensalEmailOrganizacao,
} from "@/dominio/email/tiposEmailTransacional";
import {
  criarResumoDireitosPlanoInicial,
  type Organizacao,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import type { SolicitacaoComercial } from "@/dominio/entidades/solicitacaoComercial";
import type { PortaProvedorEmailTransacional } from "../../../funcoes/src/email/adaptadorResendEmail";
import { processarNotificacoesEmailSolicitacao } from "../../../funcoes/src/casos-de-uso/processarNotificacoesSolicitacao";
import { executarRegistroSolicitacaoVisitante } from "../../../funcoes/src/casos-de-uso/registrarSolicitacaoVisitanteTransacional";

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
    return {
      doc: (idDoc: string) => criarReferenciaDocumento(`${caminhoColecao}/${idDoc}`),
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

describe("Notificações por E-mail Idempotentes e Cota Mensal", () => {
  const organizacaoAtiva: Organizacao = {
    id: "org-atelier",
    nome: "Atelier Monte Claro",
    identificadorPublico: "atelier-monte-claro",
    segmentoAtividade: "Fotografia Fine Art",
    situacao: "ativa",
    resumoDireitosPlano: {
      ...criarResumoDireitosPlanoInicial(),
      limiteEnviosEmailMensal: 3, // Cota de teste reduzida
    },
    criadoEmIso: "2026-11-08T10:00:00.000Z",
    atualizadoEmIso: "2026-11-08T10:00:00.000Z",
  };

  const solicitacaoComVisitanteEmail: SolicitacaoComercial = {
    id: "sol-101",
    organizacaoId: "org-atelier",
    identificadorPublicoOrganizacao: "atelier-monte-claro",
    microfluxoId: "fluxo-atendimento",
    tituloExperiencia: "Solicitar orçamento",
    versaoMicrofluxo: 1,
    nomeVisitante: "Lucas Rocha",
    telefoneOuWhatsapp: "(11) 98888-7777",
    emailVisitante: "lucas@exemplo.com.br",
    respostasRegistradas: [],
    situacao: "nova",
    chaveIdempotencia: "chave-sol-101",
    criadoEmIso: "2026-11-08T14:00:00.000Z",
    atualizadoEmIso: "2026-11-08T14:00:00.000Z",
  };

  const configEmailValida: ConfiguracaoEmailOrganizacao = {
    organizacaoId: "org-atelier",
    notificarEquipeNovasSolicitacoes: true,
    emailsDestinatariosEquipe: ["contato@atelier.com.br"],
    enviarConfirmacaoVisitante: true,
    emailRespostaOpcional: "atendimento@atelier.com.br",
    atualizadoEmIso: "2026-11-08T10:00:00.000Z",
  };

  it("deve enviar alerta para equipe e confirmação para o visitante, registrando o consumo mensal", async () => {
    const { bancoDados, documentos } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-atelier": organizacaoAtiva as unknown as Record<string, unknown>,
      "organizacoes/org-atelier/configuracoes/email": configEmailValida as unknown as Record<
        string,
        unknown
      >,
    });

    const enviosRealizados: MensagemEmailTransacional[] = [];
    const provedorFalso: PortaProvedorEmailTransacional = {
      enviarEmailIdempotente: async (msg) => {
        enviosRealizados.push(msg);
        return {
          enviado: true,
          idProvedor: `resend-${msg.chaveIdempotencia}`,
          chaveIdempotencia: msg.chaveIdempotencia,
          modoSimulado: false,
        };
      },
    };

    const resultado = await processarNotificacoesEmailSolicitacao(
      bancoDados,
      provedorFalso,
      organizacaoAtiva,
      solicitacaoComVisitanteEmail,
    );

    expect(resultado.emailEquipeEnviado).toBe(true);
    expect(resultado.emailVisitanteEnviado).toBe(true);
    expect(resultado.bloqueadoPorCotaMensal).toBe(false);
    expect(resultado.enviosNoMesAtual).toBe(2);
    expect(enviosRealizados).toHaveLength(2);

    const docConsumo = documentos.get(
      "organizacoes/org-atelier/metricasDiarias/email-2026-11",
    ) as unknown as ConsumoMensalEmailOrganizacao;
    expect(docConsumo.enviosNoMesAtual).toBe(2);
    expect(docConsumo.chavesIdempotenciaProcessadas).toContain(
      `email-equipe-${solicitacaoComVisitanteEmail.id}`,
    );
    expect(docConsumo.chavesIdempotenciaProcessadas).toContain(
      `email-visitante-${solicitacaoComVisitanteEmail.id}`,
    );
  });

  it("não deve reenviar e-mails caso a chave de idempotência já tenha sido processada", async () => {
    const consumoPrevio: ConsumoMensalEmailOrganizacao = {
      anoMesIso: "2026-11",
      enviosNoMesAtual: 2,
      limiteMensalPlano: 3,
      chavesIdempotenciaProcessadas: [
        `email-equipe-${solicitacaoComVisitanteEmail.id}`,
        `email-visitante-${solicitacaoComVisitanteEmail.id}`,
      ],
      atualizadoEmIso: "2026-11-08T14:05:00.000Z",
    };

    const { bancoDados } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-atelier": organizacaoAtiva as unknown as Record<string, unknown>,
      "organizacoes/org-atelier/configuracoes/email": configEmailValida as unknown as Record<
        string,
        unknown
      >,
      "organizacoes/org-atelier/metricasDiarias/email-2026-11": consumoPrevio as unknown as Record<
        string,
        unknown
      >,
    });

    const mockEnvio = vi.fn();
    const provedorFalso: PortaProvedorEmailTransacional = {
      enviarEmailIdempotente: mockEnvio,
    };

    const resultado = await processarNotificacoesEmailSolicitacao(
      bancoDados,
      provedorFalso,
      organizacaoAtiva,
      solicitacaoComVisitanteEmail,
    );

    expect(resultado.emailEquipeEnviado).toBe(true);
    expect(resultado.emailVisitanteEnviado).toBe(true);
    expect(resultado.enviosNoMesAtual).toBe(2);
    expect(mockEnvio).not.toHaveBeenCalled();
  });

  it("deve bloquear envios e sinalizar quando a cota mensal do plano for atingida", async () => {
    const consumoNoLimite: ConsumoMensalEmailOrganizacao = {
      anoMesIso: "2026-11",
      enviosNoMesAtual: 3, // igual ao limite de 3
      limiteMensalPlano: 3,
      chavesIdempotenciaProcessadas: [],
      atualizadoEmIso: "2026-11-08T14:00:00.000Z",
    };

    const { bancoDados } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-atelier": organizacaoAtiva as unknown as Record<string, unknown>,
      "organizacoes/org-atelier/configuracoes/email": configEmailValida as unknown as Record<
        string,
        unknown
      >,
      "organizacoes/org-atelier/metricasDiarias/email-2026-11":
        consumoNoLimite as unknown as Record<string, unknown>,
    });

    const mockEnvio = vi.fn();
    const provedorFalso: PortaProvedorEmailTransacional = {
      enviarEmailIdempotente: mockEnvio,
    };

    const resultado = await processarNotificacoesEmailSolicitacao(
      bancoDados,
      provedorFalso,
      organizacaoAtiva,
      solicitacaoComVisitanteEmail,
    );

    expect(resultado.bloqueadoPorCotaMensal).toBe(true);
    expect(resultado.emailEquipeEnviado).toBe(false);
    expect(resultado.emailVisitanteEnviado).toBe(false);
    expect(mockEnvio).not.toHaveBeenCalled();
  });

  it("deve integrar perfeitamente no fluxo de executarRegistroSolicitacaoVisitante sem quebrar a criação da solicitação", async () => {
    const { bancoDados } = criarBancoFirestoreEmMemoria({
      "organizacoes/org-atelier": organizacaoAtiva as unknown as Record<string, unknown>,
      "organizacoes/org-atelier/configuracoes/email": configEmailValida as unknown as Record<
        string,
        unknown
      >,
    });

    const provedorFalso: PortaProvedorEmailTransacional = {
      enviarEmailIdempotente: async (msg) => ({
        enviado: true,
        idProvedor: `simulado-${msg.chaveIdempotencia}`,
        chaveIdempotencia: msg.chaveIdempotencia,
        modoSimulado: true,
      }),
    };

    const payload = {
      organizacaoId: "org-atelier",
      identificadorPublicoOrganizacao: "atelier-monte-claro",
      microfluxoId: "fluxo-atendimento",
      tituloExperiencia: "Solicitar orçamento",
      versaoMicrofluxo: 1,
      nomeVisitante: "Mariana Costa",
      telefoneOuWhatsapp: "(21) 97777-6666",
      emailVisitante: "mariana@exemplo.com.br",
      respostasRegistradas: [],
      chaveIdempotencia: "chave-mariana-sol-1",
    };

    const resultado = await executarRegistroSolicitacaoVisitante(
      bancoDados,
      payload,
      provedorFalso,
    );

    expect(resultado.duplicadaIdempotente).toBe(false);
    expect(resultado.resumoNotificacoesEmail?.emailEquipeEnviado).toBe(true);
    expect(resultado.resumoNotificacoesEmail?.emailVisitanteEnviado).toBe(true);
  });
});
