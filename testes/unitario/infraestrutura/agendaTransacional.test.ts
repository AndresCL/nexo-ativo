import type { Firestore } from "firebase-admin/firestore";
import { describe, expect, it, vi } from "vitest";
import { criarConfiguracaoAgendaPadrao } from "@/dominio/agenda/tiposAgenda";
import {
  criarResumoDireitosPlanoInicial,
  type MembroOrganizacao,
  type Organizacao,
  type UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import { executarAtualizacaoSituacaoAgendamento } from "../../../funcoes/src/casos-de-uso/atualizarSituacaoAgendamentoTransacional";
import { executarConsultaDisponibilidadeAgenda } from "../../../funcoes/src/casos-de-uso/consultarDisponibilidadeAgenda";
import { executarRegistroAgendamentoVisitante } from "../../../funcoes/src/casos-de-uso/registrarAgendamentoVisitanteTransacional";
import type { PortaProvedorEmailTransacional } from "../../../funcoes/src/email/adaptadorResendEmail";

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
        update: (ref: { path: string }, dados: Record<string, unknown>) => void;
      }) => Promise<T>,
    ): Promise<T> => {
      const operacoes: Array<
        | { tipo: "set"; caminho: string; dados: Record<string, unknown> }
        | { tipo: "update"; caminho: string; dados: Record<string, unknown> }
      > = [];

      const transacao = {
        get: async (ref: { path: string }) => ({
          exists: documentos.has(ref.path),
          data: () => documentos.get(ref.path),
        }),
        set: (ref: { path: string }, dados: Record<string, unknown>) => {
          operacoes.push({ tipo: "set", caminho: ref.path, dados });
        },
        update: (ref: { path: string }, dados: Record<string, unknown>) => {
          operacoes.push({ tipo: "update", caminho: ref.path, dados });
        },
      };

      const resultado = await executor(transacao);
      for (const op of operacoes) {
        if (op.tipo === "set") {
          documentos.set(op.caminho, op.dados);
        } else {
          const existente = documentos.get(op.caminho) ?? {};
          documentos.set(op.caminho, { ...existente, ...op.dados });
        }
      }
      return resultado;
    },
  };

  return {
    bancoDados: bancoFalso as unknown as Firestore,
    documentos,
  };
}

describe("Casos de Uso Transacionais da Agenda", () => {
  const agoraFixo = new Date("2026-11-23T13:00:00.000Z");

  const organizacaoAtiva: Organizacao = {
    id: "org-agenda",
    nome: "Estúdio Horizonte",
    identificadorPublico: "estudio-horizonte",
    segmentoAtividade: "Arquitetura",
    situacao: "ativa",
    resumoDireitosPlano: criarResumoDireitosPlanoInicial(),
    criadoEmIso: "2026-11-01T10:00:00.000Z",
    atualizadoEmIso: "2026-11-01T10:00:00.000Z",
  };

  const membroProprietario: MembroOrganizacao = {
    usuarioId: "uid-dono",
    organizacaoId: "org-agenda",
    papel: "proprietario",
    situacao: "ativo",
    criadoEmIso: "2026-11-01T10:00:00.000Z",
    atualizadoEmIso: "2026-11-01T10:00:00.000Z",
  };

  const usuarioDono: UsuarioAutenticado = {
    uid: "uid-dono",
    email: "dono@horizonte.com",
    emailVerificado: true,
    papelPlataforma: "usuario",
  };

  function criarEstadoInicial() {
    const configAgenda = {
      ...criarConfiguracaoAgendaPadrao("org-agenda", "2026-11-23T10:00:00.000Z"),
      duracaoSlotMinutos: 60,
      datasAbertas: {
        "2026-11-25": [{ inicio: "09:00", fim: "11:00" }],
      },
    };

    return criarBancoFirestoreEmMemoria({
      "organizacoes/org-agenda": organizacaoAtiva as unknown as Record<string, unknown>,
      "organizacoes/org-agenda/membros/uid-dono": membroProprietario as unknown as Record<
        string,
        unknown
      >,
      "paginasPublicadas/org-agenda": {
        publicado: true,
        paginaAtiva: true,
      },
      "organizacoes/org-agenda/configuracoes/agenda": configAgenda as unknown as Record<
        string,
        unknown
      >,
      // Mesmo com enviarConfirmacaoVisitante = false, o visitante da Agenda DEVE receber e-mail!
      "organizacoes/org-agenda/configuracoes/email": {
        organizacaoId: "org-agenda",
        notificarEquipeNovasSolicitacoes: true,
        emailsDestinatariosEquipe: ["equipe@horizonte.com"],
        enviarConfirmacaoVisitante: false,
        atualizadoEmIso: "2026-11-23T10:00:00.000Z",
      },
    });
  }

  it("consulta disponibilidade, registra reserva com e-mail ao visitante, bloqueia conflito e libera ao cancelar", async () => {
    const { bancoDados } = criarEstadoInicial();
    const enviarEmailIdempotente = vi.fn().mockResolvedValue({
      enviado: true,
      idProvedor: "resend-ok",
      chaveIdempotencia: "k",
      modoSimulado: false,
    });
    const provedorEmail: PortaProvedorEmailTransacional = { enviarEmailIdempotente };

    // 1. Disponibilidade inicial tem 09:00 e 10:00
    const dispAntes = await executarConsultaDisponibilidadeAgenda(
      bancoDados,
      { organizacaoId: "org-agenda", anoMes: "2026-11" },
      agoraFixo,
    );
    expect(dispAntes.agendaAtiva).toBe(true);
    expect(dispAntes.diasDisponiveis[0]?.slots.map((s) => s.horarioInicio)).toEqual([
      "09:00",
      "10:00",
    ]);

    // 2. Visitante 1 reserva 09:00
    const reserva1 = await executarRegistroAgendamentoVisitante(
      bancoDados,
      {
        organizacaoId: "org-agenda",
        identificadorPublicoOrganizacao: "estudio-horizonte",
        microfluxoId: "exp-agenda",
        tituloExperiencia: "Agendar reunião",
        dataIso: "2026-11-25",
        horarioInicio: "09:00",
        nomeVisitante: "Lucas Silva",
        emailVisitante: "lucas@exemplo.com",
        telefoneOuWhatsapp: "(11) 98888-7777",
      },
      provedorEmail,
      agoraFixo,
    );

    expect(reserva1.duplicadaIdempotente).toBe(false);
    expect(reserva1.emailConfirmacaoEnviado).toBe(true);
    expect(reserva1.codigoConfirmacao).toMatch(/^AGD-/);
    // 2 e-mails enviados: visitante (sempre) + equipe
    expect(enviarEmailIdempotente).toHaveBeenCalledTimes(2);
    expect(enviarEmailIdempotente.mock.calls[0]?.[0]?.para).toEqual(["lucas@exemplo.com"]);
    expect(enviarEmailIdempotente.mock.calls[1]?.[0]?.para).toEqual(["equipe@horizonte.com"]);

    // 3. Visitante 2 tentando reservar o mesmo horário 09:00 é bloqueado atomicamente
    await expect(
      executarRegistroAgendamentoVisitante(
        bancoDados,
        {
          organizacaoId: "org-agenda",
          identificadorPublicoOrganizacao: "estudio-horizonte",
          microfluxoId: "exp-agenda",
          tituloExperiencia: "Agendar reunião",
          dataIso: "2026-11-25",
          horarioInicio: "09:00",
          nomeVisitante: "Mariana Costa",
          emailVisitante: "mariana@exemplo.com",
        },
        provedorEmail,
        agoraFixo,
      ),
    ).rejects.toThrow(/reservado/i);

    // 4. Disponibilidade agora mostra apenas 10:00
    const dispDurante = await executarConsultaDisponibilidadeAgenda(
      bancoDados,
      { organizacaoId: "org-agenda", anoMes: "2026-11" },
      agoraFixo,
    );
    expect(dispDurante.diasDisponiveis[0]?.slots.map((s) => s.horarioInicio)).toEqual(["10:00"]);

    // 5. Dono cancela a reserva no painel -> horário 09:00 volta a ficar livre!
    const atualizado = await executarAtualizacaoSituacaoAgendamento(bancoDados, usuarioDono, {
      organizacaoId: "org-agenda",
      agendamentoId: reserva1.agendamentoId,
      situacao: "cancelado",
      observacoesInternas: "Cliente solicitou remarcação.",
    });
    expect(atualizado.situacao).toBe("cancelado");

    const dispDepois = await executarConsultaDisponibilidadeAgenda(
      bancoDados,
      { organizacaoId: "org-agenda", anoMes: "2026-11" },
      agoraFixo,
    );
    expect(dispDepois.diasDisponiveis[0]?.slots.map((s) => s.horarioInicio)).toEqual([
      "09:00",
      "10:00",
    ]);
  });

  it("preserva a reserva confirmada mesmo se o provedor de e-mail falhar temporariamente", async () => {
    const { bancoDados } = criarEstadoInicial();
    const provedorComFalha: PortaProvedorEmailTransacional = {
      enviarEmailIdempotente: vi.fn().mockRejectedValue(new Error("Resend timeout")),
    };

    const resultado = await executarRegistroAgendamentoVisitante(
      bancoDados,
      {
        organizacaoId: "org-agenda",
        identificadorPublicoOrganizacao: "estudio-horizonte",
        microfluxoId: "exp-agenda",
        tituloExperiencia: "Agendar reunião",
        dataIso: "2026-11-25",
        horarioInicio: "10:00",
        nomeVisitante: "Pedro Alves",
        emailVisitante: "pedro@exemplo.com",
      },
      provedorComFalha,
      agoraFixo,
    );

    expect(resultado.agendamentoId).toBeTruthy();
    expect(resultado.emailConfirmacaoEnviado).toBe(false);
  });
});

