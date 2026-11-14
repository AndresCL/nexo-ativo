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

export function useAvaliacoesGoogle(
  origem: OrigemConsultaAvaliacoesGoogle | undefined,
  servico: PortaAvaliacoesGoogleCliente = servicoAvaliacoesGoogleCliente,
) {
  const tipo = origem?.tipo;
  const organizacaoId = origem?.tipo === "previa" ? origem.organizacaoId : "";
  const identificadorLocal = origem?.tipo === "previa" ? origem.identificadorLocal : "";
  const identificadorPublico = origem?.tipo === "publicada" ? origem.identificadorPublico : "";
  const chave = JSON.stringify([tipo, organizacaoId, identificadorLocal, identificadorPublico]);
  const [elemento, definirElemento] = useState<HTMLElement | null>(null);
  const [visivel, definirVisivel] = useState(false);
  const [estado, definirEstado] = useState<EstadoConsulta>({ chave: "", carregando: false });

  useEffect(() => {
    if (!elemento) return;
    if (typeof IntersectionObserver === "undefined") {
      definirVisivel(true);
      return;
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
          definirVisivel(true);
          observador.disconnect();
        }
      },
      { rootMargin: "100px" },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [elemento]);

  useEffect(() => {
    if (!tipo || !visivel) return;
    let atual = true;
    definirEstado({ chave, carregando: true });
    const consulta: OrigemConsultaAvaliacoesGoogle =
      tipo === "previa"
        ? { tipo, organizacaoId, identificadorLocal }
        : { tipo, identificadorPublico };
    void servico
      .consultar(consulta)
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
  }, [tipo, organizacaoId, identificadorLocal, identificadorPublico, chave, visivel, servico]);

  const estadoAtual: EstadoConsulta =
    estado.chave === chave && tipo ? estado : { chave, carregando: Boolean(tipo) };
  return { ...estadoAtual, definirElemento };
}
