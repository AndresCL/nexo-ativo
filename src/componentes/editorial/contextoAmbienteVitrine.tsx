"use client";

import { createContext, useContext } from "react";
import type { PortaAgendamentoVisitante } from "@/aplicacao/portas/portasAgenda";
import type { PortaSubmissaoSolicitacaoVisitante } from "@/aplicacao/portas/portasSolicitacoesComerciais";
import {
  adicionarDiasDataIso,
  obterDataHoraAtualNoFuso,
} from "@/dominio/agenda/calendarioDatas";
import { FUSO_HORARIO_PADRAO_AGENDA } from "@/dominio/agenda/tiposAgenda";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import { servicoTelemetriaAnonimaPadrao } from "@/infraestrutura/analytics/servicoTelemetriaAnonima";

export type FuncaoRegistrarTelemetriaVitrine =
  typeof servicoTelemetriaAnonimaPadrao.registrarEvento;

export interface ValorContextoAmbienteVitrine {
  /**
   * Elemento DOM onde Portais (BottomSheets, modais) devem ser montados.
   * Quando definido, a vitrine opera contida dentro de uma moldura (ex: prévia mobile no painel).
   */
  readonly containerPortal: HTMLElement | null;
  /**
   * Indica que a vitrine está rodando em modo demonstração/prévia (pula loader,
   * ativa modo prévia em avaliações Google e evita efeitos colaterais globais).
   */
  readonly modoPrevia: boolean;
  /**
   * Define se a vitrine pode ler/modificar window.history, window.location.hash e window.location.assign.
   */
  readonly sincronizarHistoricoNavegador: boolean;
  /**
   * Adaptador de telemetria (produção: grava no Firestore; prévia: no-op).
   */
  readonly registrarEventoTelemetria: FuncaoRegistrarTelemetriaVitrine;
  /**
   * Adaptador opcional de submissão de leads injetado pelo ambiente (ex: simulador na prévia).
   */
  readonly servicoSubmissao?: PortaSubmissaoSolicitacaoVisitante;
  /**
   * Adaptador opcional de agendamento injetado pelo ambiente (ex: simulador na prévia).
   */
  readonly servicoAgendamento?: PortaAgendamentoVisitante;
  /**
   * Callback opcional quando a vitrine tenta navegar para um destino externo/interno sem sair da página em modo prévia.
   */
  readonly aoNavegarEmPrevia?: (destino: string, tipo: "externo" | "telefone" | "interno") => void;
}

const CONTEXTO_AMBIENTE_PRODUCAO: ValorContextoAmbienteVitrine = {
  containerPortal: null,
  modoPrevia: false,
  sincronizarHistoricoNavegador: true,
  registrarEventoTelemetria: (evento) => servicoTelemetriaAnonimaPadrao.registrarEvento(evento),
};

export const ContextoAmbienteVitrine = createContext<ValorContextoAmbienteVitrine>(
  CONTEXTO_AMBIENTE_PRODUCAO,
);

export function useAmbienteVitrine(): ValorContextoAmbienteVitrine {
  return useContext(ContextoAmbienteVitrine);
}

/**
 * Adaptador de submissão simulada (DIP) para o modo demonstração no painel:
 * permite testar o microfluxo de ponta a ponta sem gravar leads reais nem enviar e-mails.
 */
export function criarServicoSubmissaoDemonstracao(): PortaSubmissaoSolicitacaoVisitante {
  return {
    async enviarSolicitacaoVisitante() {
      notificar.informacao(
        "Modo demonstração: solicitação simulada com sucesso. Nenhum lead real foi gravado nem e-mail enviado.",
      );
      return {
        solicitacaoId: `demo-${Date.now()}`,
        duplicadaIdempotente: false,
      };
    },
  };
}

/**
 * Adaptador de agendamento simulado (DIP) para o modo demonstração no painel:
 * permite testar a escolha de datas, horários e confirmação sem gravar reservas reais nem enviar e-mails.
 */
export function criarServicoAgendamentoDemonstracao(): PortaAgendamentoVisitante {
  return {
    async consultarDisponibilidade({ anoMes }) {
      const hoje = obterDataHoraAtualNoFuso(new Date(), FUSO_HORARIO_PADRAO_AGENDA).dataIso;
      const dias = [1, 2, 3, 5, 7]
        .map((offset) => adicionarDiasDataIso(hoje, offset))
        .filter((dataIso) => dataIso.startsWith(`${anoMes}-`))
        .map((dataIso) => ({
          dataIso,
          slots: [
            { horarioInicio: "09:00", horarioFim: "10:00", periodo: "manha" as const },
            { horarioInicio: "10:00", horarioFim: "11:00", periodo: "manha" as const },
            { horarioInicio: "14:00", horarioFim: "15:00", periodo: "tarde" as const },
            { horarioInicio: "15:00", horarioFim: "16:00", periodo: "tarde" as const },
            { horarioInicio: "16:00", horarioFim: "17:00", periodo: "tarde" as const },
          ],
        }));

      return {
        agendaAtiva: true,
        fusoHorario: FUSO_HORARIO_PADRAO_AGENDA,
        duracaoSlotMinutos: 60,
        anoMes,
        diasDisponiveis: dias,
        proximoDiaDisponivelOpcional: adicionarDiasDataIso(hoje, 1),
      };
    },
    async registrarAgendamento(dados) {
      notificar.informacao(
        "Modo demonstração: reserva simulada com sucesso. Nenhum agendamento real foi gravado nem e-mail enviado.",
      );
      const [h, m] = dados.horarioInicio.split(":").map(Number);
      const fimMin = (h ?? 9) * 60 + (m ?? 0) + 60;
      const horarioFim = `${String(Math.floor(fimMin / 60)).padStart(2, "0")}:${String(fimMin % 60).padStart(2, "0")}`;
      return {
        agendamentoId: `demo-agd-${Date.now()}`,
        organizacaoId: dados.organizacaoId,
        codigoConfirmacao: "AGD-DEMO",
        dataIso: dados.dataIso,
        horarioInicio: dados.horarioInicio,
        horarioFim,
        duracaoMinutos: 60,
        fusoHorario: FUSO_HORARIO_PADRAO_AGENDA,
        duplicadaIdempotente: false,
        emailConfirmacaoEnviado: true,
        criadoEmIso: new Date().toISOString(),
      };
    },
  };
}

