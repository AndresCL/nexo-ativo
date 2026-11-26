"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  briefingPossuiConteudo,
  briefingsSaoIguais,
  DADOS_BRIEFING_VAZIO,
  normalizarDadosBriefing,
  type DadosFormularioBriefingImplantacao,
  type EstadoSalvamentoBriefing,
} from "@/dominio/fundador/briefingImplantacao";
import type { PortaBriefingFundadorCliente } from "@/infraestrutura/fundador/servicoOperacoesFundadorCliente";

export interface OpcoesAutoSalvamentoBriefing {
  readonly organizacaoId: string;
  readonly servico: PortaBriefingFundadorCliente;
  readonly atrasoDebounceMs?: number;
}

export interface ResultadoAutoSalvamentoBriefing {
  readonly dados: DadosFormularioBriefingImplantacao;
  readonly carregandoInicial: boolean;
  readonly erroCarregamento: string | null;
  readonly estadoSalvamento: EstadoSalvamentoBriefing;
  readonly mensagemErroSalvamento: string | null;
  readonly atualizadoEmIso: string | null;
  readonly possuiAlteracoesPendentes: boolean;
  readonly atualizarCampo: <K extends keyof DadosFormularioBriefingImplantacao>(
    campo: K,
    valor: DadosFormularioBriefingImplantacao[K],
  ) => void;
  readonly salvarAgora: () => Promise<boolean>;
  readonly recarregar: () => void;
}

const ATRASO_DEBOUNCE_PADRAO_MS = 900;

export function useAutoSalvamentoBriefing({
  organizacaoId,
  servico,
  atrasoDebounceMs = ATRASO_DEBOUNCE_PADRAO_MS,
}: OpcoesAutoSalvamentoBriefing): ResultadoAutoSalvamentoBriefing {
  const [dados, setDados] = useState<DadosFormularioBriefingImplantacao>(DADOS_BRIEFING_VAZIO);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [estadoSalvamento, setEstadoSalvamento] = useState<EstadoSalvamentoBriefing>("ocioso");
  const [mensagemErroSalvamento, setMensagemErroSalvamento] = useState<string | null>(null);
  const [atualizadoEmIso, setAtualizadoEmIso] = useState<string | null>(null);
  const [gatilhoRecarga, setGatilhoRecarga] = useState(0);

  const dadosMaisRecentesRef = useRef<DadosFormularioBriefingImplantacao>(DADOS_BRIEFING_VAZIO);
  const ultimoSalvoRef = useRef<DadosFormularioBriefingImplantacao>(DADOS_BRIEFING_VAZIO);
  const existeNoServidorRef = useRef(false);
  const timerDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const promessaEmVooRef = useRef<Promise<boolean> | null>(null);
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
      if (timerDebounceRef.current) {
        clearTimeout(timerDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const controlador = new AbortController();
    setCarregandoInicial(true);
    setErroCarregamento(null);
    setEstadoSalvamento("ocioso");
    setMensagemErroSalvamento(null);

    void servico
      .obterBriefingImplantacao(organizacaoId, controlador.signal)
      .then((briefing) => {
        if (controlador.signal.aborted || !montadoRef.current) return;

        const normalizado = normalizarDadosBriefing(briefing);
        existeNoServidorRef.current = briefing !== null;
        dadosMaisRecentesRef.current = normalizado;
        ultimoSalvoRef.current = normalizado;
        setDados(normalizado);
        setAtualizadoEmIso(briefing?.atualizadoEmIso ?? null);
        setCarregandoInicial(false);
      })
      .catch((erro: unknown) => {
        if (controlador.signal.aborted || !montadoRef.current) return;
        setErroCarregamento(
          erro instanceof Error ? erro.message : "Não foi possível carregar o briefing.",
        );
        setCarregandoInicial(false);
      });

    return () => {
      controlador.abort();
    };
  }, [organizacaoId, servico, gatilhoRecarga]);

  const executarCicloSalvamento = useCallback(async (): Promise<boolean> => {
    if (promessaEmVooRef.current) {
      return promessaEmVooRef.current;
    }

    const tarefa = (async (): Promise<boolean> => {
      while (true) {
        const snapshot = dadosMaisRecentesRef.current;

        if (briefingsSaoIguais(snapshot, ultimoSalvoRef.current)) {
          if (montadoRef.current) {
            setEstadoSalvamento((atual) => (atual === "pendente" ? "salvo" : atual));
          }
          return true;
        }

        if (!existeNoServidorRef.current && !briefingPossuiConteudo(snapshot)) {
          ultimoSalvoRef.current = snapshot;
          if (montadoRef.current) {
            setEstadoSalvamento("ocioso");
            setMensagemErroSalvamento(null);
          }
          return true;
        }

        if (montadoRef.current) {
          setEstadoSalvamento("salvando");
          setMensagemErroSalvamento(null);
        }

        try {
          const resultado = await servico.salvarBriefingImplantacao({
            organizacaoId,
            ...snapshot,
          });

          ultimoSalvoRef.current = snapshot;
          if (resultado) {
            existeNoServidorRef.current = true;
            if (montadoRef.current) {
              setAtualizadoEmIso(resultado.atualizadoEmIso);
            }
          }

          // Se o usuário digitou novamente durante o PUT, continua o loop com o novo snapshot
          if (!briefingsSaoIguais(dadosMaisRecentesRef.current, ultimoSalvoRef.current)) {
            continue;
          }

          if (montadoRef.current) {
            setEstadoSalvamento("salvo");
            setMensagemErroSalvamento(null);
          }
          return true;
        } catch (erro: unknown) {
          if (montadoRef.current) {
            setEstadoSalvamento("erro");
            setMensagemErroSalvamento(
              erro instanceof Error ? erro.message : "Erro ao salvar o briefing.",
            );
          }
          return false;
        }
      }
    })();

    promessaEmVooRef.current = tarefa;
    try {
      return await tarefa;
    } finally {
      if (promessaEmVooRef.current === tarefa) {
        promessaEmVooRef.current = null;
      }
    }
  }, [organizacaoId, servico]);

  const salvarAgora = useCallback(async (): Promise<boolean> => {
    if (timerDebounceRef.current) {
      clearTimeout(timerDebounceRef.current);
      timerDebounceRef.current = null;
    }

    if (carregandoInicial || erroCarregamento !== null) {
      return true;
    }

    return executarCicloSalvamento();
  }, [carregandoInicial, erroCarregamento, executarCicloSalvamento]);

  const atualizarCampo = useCallback(
    <K extends keyof DadosFormularioBriefingImplantacao>(
      campo: K,
      valor: DadosFormularioBriefingImplantacao[K],
    ) => {
      if (carregandoInicial || erroCarregamento !== null) {
        return;
      }

      const proximo: DadosFormularioBriefingImplantacao = {
        ...dadosMaisRecentesRef.current,
        [campo]: valor,
      };
      dadosMaisRecentesRef.current = proximo;
      setDados(proximo);

      if (timerDebounceRef.current) {
        clearTimeout(timerDebounceRef.current);
        timerDebounceRef.current = null;
      }

      const semAlteracaoReal =
        briefingsSaoIguais(proximo, ultimoSalvoRef.current) ||
        (!existeNoServidorRef.current && !briefingPossuiConteudo(proximo));

      if (semAlteracaoReal) {
        setEstadoSalvamento(existeNoServidorRef.current ? "salvo" : "ocioso");
        setMensagemErroSalvamento(null);
        return;
      }

      setEstadoSalvamento("pendente");
      setMensagemErroSalvamento(null);

      timerDebounceRef.current = setTimeout(() => {
        timerDebounceRef.current = null;
        void executarCicloSalvamento();
      }, atrasoDebounceMs);
    },
    [atrasoDebounceMs, carregandoInicial, erroCarregamento, executarCicloSalvamento],
  );

  const recarregar = useCallback(() => {
    setGatilhoRecarga((atual) => atual + 1);
  }, []);

  const possuiAlteracoesPendentes =
    estadoSalvamento === "pendente" ||
    estadoSalvamento === "salvando" ||
    estadoSalvamento === "erro";

  useEffect(() => {
    if (!possuiAlteracoesPendentes) return;

    function avisarAntesDeSair(evento: BeforeUnloadEvent) {
      evento.preventDefault();
      evento.returnValue = "";
    }

    window.addEventListener("beforeunload", avisarAntesDeSair);
    return () => {
      window.removeEventListener("beforeunload", avisarAntesDeSair);
    };
  }, [possuiAlteracoesPendentes]);

  return {
    dados,
    carregandoInicial,
    erroCarregamento,
    estadoSalvamento,
    mensagemErroSalvamento,
    atualizadoEmIso,
    possuiAlteracoesPendentes,
    atualizarCampo,
    salvarAgora,
    recarregar,
  };
}

