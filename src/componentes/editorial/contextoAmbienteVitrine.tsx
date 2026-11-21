"use client";

import { createContext, useContext } from "react";
import type { PortaSubmissaoSolicitacaoVisitante } from "@/aplicacao/portas/portasSolicitacoesComerciais";
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

