"use client";

import { useEffect, useRef, useState } from "react";
import type { EstabelecimentoGoogle } from "@/dominio/entidades/avaliacoesGoogle";
import type { PortaAvaliacoesGoogleCliente } from "@/aplicacao/portas/portasAvaliacoesGoogle";
import { servicoAvaliacoesGoogleCliente } from "@/infraestrutura/avaliacoes/servicoAvaliacoesGoogleCliente";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { Botao } from "@/componentes/interface/Botao";
import { AtribuicaoGoogleMaps } from "@/componentes/editorial/avaliacoes/AtribuicaoGoogleMaps";
import { notificar } from "@/componentes/interface/notificacoes/notificar";

export function SeletorEstabelecimentoGoogle({
  organizacaoId,
  somenteLeitura,
  aoSelecionar,
  servico = servicoAvaliacoesGoogleCliente,
}: {
  readonly organizacaoId: string;
  readonly somenteLeitura: boolean;
  readonly aoSelecionar: (local: EstabelecimentoGoogle) => void;
  readonly servico?: PortaAvaliacoesGoogleCliente;
}) {
  const [consulta, definirConsulta] = useState("");
  const [resultados, definirResultados] = useState<readonly EstabelecimentoGoogle[]>([]);
  const [buscando, definirBuscando] = useState(false);
  const [pesquisou, definirPesquisou] = useState(false);
  const sequencia = useRef(0);

  useEffect(() => {
    sequencia.current += 1;
    definirBuscando(false);
    return () => {
      sequencia.current += 1;
    };
  }, [organizacaoId, somenteLeitura]);

  async function pesquisar() {
    if (somenteLeitura || buscando || consulta.trim().length < 3) return;
    const atual = ++sequencia.current;
    definirBuscando(true);
    definirResultados([]);
    definirPesquisou(false);
    try {
      const locais = await servico.pesquisar(organizacaoId, consulta.trim());
      if (atual === sequencia.current) {
        definirResultados(locais);
        definirPesquisou(true);
      }
    } catch (falha) {
      if (atual === sequencia.current)
        notificar.erro(
          falha instanceof Error ? falha.message : "Não foi possível buscar sua empresa.",
        );
    } finally {
      if (atual === sequencia.current) definirBuscando(false);
    }
  }

  return (
    <div className="space-y-3" role="search" aria-label="Buscar estabelecimento no Google">
      <CampoFormulario
        rotulo="Nome da empresa e cidade"
        placeholder="Ex.: Clínica Serena, São Paulo"
        value={consulta}
        disabled={somenteLeitura}
        maxLength={180}
        onChange={(evento) => {
          sequencia.current += 1;
          definirConsulta(evento.target.value);
          definirResultados([]);
          definirPesquisou(false);
          definirBuscando(false);
        }}
        onKeyDown={(evento) => {
          if (evento.key === "Enter") {
            evento.preventDefault();
            void pesquisar();
          }
        }}
      />
      <Botao
        variante="operacional_secundario"
        tamanho="compacto"
        carregando={buscando}
        disabled={somenteLeitura || consulta.trim().length < 3}
        onClick={() => void pesquisar()}
      >
        Buscar empresa
      </Botao>
      {pesquisou && resultados.length === 0 ? (
        <p role="status" className="text-xs text-mineral-600">
          Nenhum estabelecimento encontrado. Tente incluir o bairro ou endereço.
        </p>
      ) : null}
      {resultados.length > 0 ? (
        <ul aria-label="Estabelecimentos encontrados" className="space-y-2">
          {resultados.map((local) => (
            <li
              key={local.identificadorLocal}
              className="rounded-md border border-marfim-300 p-3 text-sm"
            >
              <p className="font-medium">{local.nome}</p>
              <p className="mt-1 text-xs text-mineral-600">{local.endereco}</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <Botao
                  tamanho="compacto"
                  disabled={somenteLeitura}
                  onClick={() => {
                    aoSelecionar(local);
                    definirResultados([]);
                    definirPesquisou(false);
                  }}
                  aria-label={`Selecionar ${local.nome}`}
                >
                  Selecionar
                </Botao>
                <AtribuicaoGoogleMaps url={local.urlGoogleMaps} atribuicoes={local.atribuicoes} />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
