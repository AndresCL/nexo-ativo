"use client";

import { useEffect, useState } from "react";
import type {
  OrigemConsultaAvaliacoesGoogle,
  PortaAvaliacoesGoogleCliente,
} from "@/aplicacao/portas/portasAvaliacoesGoogle";
import type { ResumoAvaliacoesGoogle } from "@/dominio/entidades/avaliacoesGoogle";
import { servicoAvaliacoesGoogleCliente } from "@/infraestrutura/avaliacoes/servicoAvaliacoesGoogleCliente";

interface EstadoConsulta {
  readonly chave: string;
  readonly carregando: boolean;
  readonly dados?: ResumoAvaliacoesGoogle;
  readonly erro?: string;
}

const cacheResultadosSessao = new Map<string, ResumoAvaliacoesGoogle>();
const consultasEmAndamentoSessao = new Map<string, Promise<ResumoAvaliacoesGoogle>>();

function consultarComCacheSessao(
  chave: string,
  consulta: OrigemConsultaAvaliacoesGoogle,
  servico: PortaAvaliacoesGoogleCliente,
): Promise<ResumoAvaliacoesGoogle> {
  if (servico !== servicoAvaliacoesGoogleCliente) {
    return servico.consultar(consulta);
  }

  const emCache = cacheResultadosSessao.get(chave);
  if (emCache) {
    return Promise.resolve(emCache);
  }

  const emAndamento = consultasEmAndamentoSessao.get(chave);
  if (emAndamento) {
    return emAndamento;
  }

  const promessa = servico
    .consultar(consulta)
    .then((dados) => {
      cacheResultadosSessao.set(chave, dados);
      return dados;
    })
    .finally(() => {
      consultasEmAndamentoSessao.delete(chave);
    });

  consultasEmAndamentoSessao.set(chave, promessa);
  return promessa;
}

export function useAvaliacoesGoogle(
  origem: OrigemConsultaAvaliacoesGoogle | undefined,
  servico: PortaAvaliacoesGoogleCliente = servicoAvaliacoesGoogleCliente,
) {
  const tipo = origem?.tipo;
  const organizacaoId = origem?.tipo === "previa" ? origem.organizacaoId : "";
  const identificadorLocal = origem?.tipo === "previa" ? origem.identificadorLocal : "";
  const identificadorPublico = origem?.tipo === "publicada" ? origem.identificadorPublico : "";
  const chave = JSON.stringify([tipo, organizacaoId, identificadorLocal, identificadorPublico]);
  const dadosEmCache =
    tipo && servico === servicoAvaliacoesGoogleCliente
      ? cacheResultadosSessao.get(chave)
      : undefined;
  const [estado, definirEstado] = useState<EstadoConsulta>(() =>
    dadosEmCache
      ? { chave, carregando: false, dados: dadosEmCache }
      : { chave: "", carregando: false },
  );

  useEffect(() => {
    if (!tipo) return;
    const emCache =
      servico === servicoAvaliacoesGoogleCliente ? cacheResultadosSessao.get(chave) : undefined;
    if (emCache) {
      definirEstado({ chave, carregando: false, dados: emCache });
      return;
    }

    let atual = true;
    definirEstado({ chave, carregando: true });
    const consulta: OrigemConsultaAvaliacoesGoogle =
      tipo === "previa"
        ? { tipo, organizacaoId, identificadorLocal }
        : { tipo, identificadorPublico };
    void consultarComCacheSessao(chave, consulta, servico)
      .then((dados) => {
        if (atual) definirEstado({ chave, carregando: false, dados });
      })
      .catch((erro: unknown) => {
        if (atual)
          definirEstado({
            chave,
            carregando: false,
            erro:
              erro instanceof Error ? erro.message : "Não foi possível consultar as avaliações.",
          });
      });
    return () => {
      atual = false;
    };
  }, [tipo, organizacaoId, identificadorLocal, identificadorPublico, chave, servico]);

  const estadoAtual: EstadoConsulta =
    estado.chave === chave && tipo
      ? estado
      : dadosEmCache
        ? { chave, carregando: false, dados: dadosEmCache }
        : { chave, carregando: Boolean(tipo) };
  return estadoAtual;
}
