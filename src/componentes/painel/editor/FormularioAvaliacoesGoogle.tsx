"use client";

import { useState } from "react";
import {
  CONFIGURACAO_AVALIACOES_GOOGLE_PADRAO,
  construirUrlLocalGoogle,
  type EstabelecimentoGoogle,
} from "@/dominio/entidades/avaliacoesGoogle";
import { useEstadoEditorAparencia } from "@/estados/estadoEditorAparencia";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { Botao } from "@/componentes/interface/Botao";
import { AvisoRecursoRestrito } from "@/componentes/painel/AvisosPublicidade";
import { usePoliticaPublicidade } from "@/componentes/painel/ProvedorPoliticaPublicidade";
import { SeletorEstabelecimentoGoogle } from "./SeletorEstabelecimentoGoogle";
import { SeletorPosicaoAvaliacoes } from "@/componentes/editorial/avaliacoes/SeletorPosicaoAvaliacoes";

export function FormularioAvaliacoesGoogle({
  somenteLeitura = false,
}: {
  readonly somenteLeitura?: boolean;
}) {
  const politicaPublicidade = usePoliticaPublicidade();
  const organizacaoId = useEstadoEditorAparencia((estado) => estado.rascunho.organizacaoId);
  const configuracao =
    useEstadoEditorAparencia((estado) => estado.rascunho.avaliacoesGoogle) ??
    CONFIGURACAO_AVALIACOES_GOOGLE_PADRAO;
  const atualizar = useEstadoEditorAparencia((estado) => estado.atualizarAvaliacoesGoogle);
  const [selecionado, definirSelecionado] = useState<EstabelecimentoGoogle>();
  const localAtual =
    selecionado?.identificadorLocal === configuracao.identificadorLocal ? selecionado : undefined;

  if (!politicaPublicidade.exibeAvaliacoesGoogle()) {
    return (
      <CartaoSuperficie className="space-y-4">
        <h2 className="text-base font-semibold text-mineral-950">Avaliações do Google</h2>
        <AvisoRecursoRestrito mensagem="a exibição de avaliações e depoimentos não está disponível para o seu perfil profissional." />
      </CartaoSuperficie>
    );
  }

  return (
    <CartaoSuperficie className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-mineral-950">Avaliações do Google</h2>
        <p className="mt-1 text-xs text-mineral-600">
          Mostre a nota da sua empresa e uma seleção de depoimentos na vitrine. As alterações
          aparecem após publicar.
        </p>
      </div>
      <SeletorEstabelecimentoGoogle
        key={organizacaoId}
        organizacaoId={organizacaoId}
        somenteLeitura={somenteLeitura}
        aoSelecionar={(local) => {
          definirSelecionado(local);
          atualizar({ ...configuracao, identificadorLocal: local.identificadorLocal });
        }}
      />
      {configuracao.identificadorLocal ? (
        <div className="space-y-2 rounded-md bg-marfim-100 p-3 text-sm">
          <p className="font-medium">{localAtual?.nome ?? "Estabelecimento vinculado"}</p>
          {localAtual ? <p className="text-xs text-mineral-600">{localAtual.endereco}</p> : null}
          <a
            href={construirUrlLocalGoogle(configuracao.identificadorLocal)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center text-xs underline"
          >
            Conferir estabelecimento no Google Maps
          </a>
          <Botao
            variante="fantasma"
            tamanho="compacto"
            disabled={somenteLeitura}
            onClick={() => {
              definirSelecionado(undefined);
              atualizar({ ...CONFIGURACAO_AVALIACOES_GOOGLE_PADRAO });
            }}
          >
            Desvincular
          </Botao>
        </div>
      ) : null}
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={configuracao.habilitado}
          disabled={somenteLeitura || !configuracao.identificadorLocal}
          onChange={(evento) => atualizar({ ...configuracao, habilitado: evento.target.checked })}
          className="h-4 w-4 accent-mineral-950"
        />
        Exibir avaliações na vitrine
      </label>
      <fieldset disabled={somenteLeitura} className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Formato de exibição</legend>
        {(
          [
            ["resumo", "Nota e quantidade de avaliações"],
            ["carrossel", "Nota com carrossel de depoimentos"],
          ] as const
        ).map(([modo, rotulo]) => (
          <label key={modo} className="flex min-h-11 items-center gap-3 text-sm">
            <input
              type="radio"
              name={`formato-avaliacoes-${organizacaoId}`}
              value={modo}
              checked={configuracao.modoExibicao === modo}
              onChange={() => atualizar({ ...configuracao, modoExibicao: modo })}
              className="h-4 w-4 accent-mineral-950"
            />
            {rotulo}
          </label>
        ))}
      </fieldset>
      <SeletorPosicaoAvaliacoes
        posicao={configuracao.posicao ?? "topo"}
        desativado={somenteLeitura}
        aoAlterar={(posicao) => atualizar({ ...configuracao, posicao })}
      />
      <p className="text-xs text-mineral-600">
        Os comentários são selecionados por relevância pelo Google. A nota representa todas as
        avaliações do estabelecimento.
      </p>
    </CartaoSuperficie>
  );
}
