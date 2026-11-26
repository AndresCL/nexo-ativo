"use client";

import { useState } from "react";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import type { SituacaoOrganizacao } from "@/dominio/entidades/autenticacaoEOrganizacao";
import type { ItemVisaoGeralOrganizacaoFundador } from "@/dominio/fundador/tiposPainelFundador";
import type { PortaOperacoesFundadorCliente } from "@/infraestrutura/fundador/servicoOperacoesFundadorCliente";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { TooltipInformativo } from "@/componentes/interface/TooltipInformativo";

export interface PropriedadesModalAlterarSituacaoFundador {
  readonly organizacao: ItemVisaoGeralOrganizacaoFundador;
  readonly servicoFundador: PortaOperacoesFundadorCliente;
  readonly aoFechar: () => void;
  readonly aoConcluir: (
    organizacaoId: string,
    novaSituacao: SituacaoOrganizacao,
    justificativa: string,
  ) => void;
}

export function ModalAlterarSituacaoFundador({
  organizacao,
  servicoFundador,
  aoFechar,
  aoConcluir,
}: PropriedadesModalAlterarSituacaoFundador) {
  const [novaSituacao, setNovaSituacao] = useState<SituacaoOrganizacao>(organizacao.situacao);
  const [justificativa, setJustificativa] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function confirmarAlteracao() {
    setSalvando(true);
    const justificativaLimpa = justificativa.trim();
    try {
      await servicoFundador.alterarSituacaoOrganizacao({
        organizacaoId: organizacao.id,
        novaSituacao,
        justificativa: justificativaLimpa,
      });
      notificar.sucesso(`Situação de "${organizacao.nome}" alterada para "${novaSituacao}".`);
      aoConcluir(organizacao.id, novaSituacao, justificativaLimpa);
    } catch (e) {
      notificar.erro(e instanceof Error ? e.message : "Não foi possível alterar a situação.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mineral-950/60 p-4">
      <CartaoSuperficie className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-xl">
        <div className="border-b border-marfim-200 pb-3">
          <h3 className="text-xl font-bold tracking-tight text-mineral-950">
            Alterar Situação: {organizacao.nome}
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="select-situacao"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-mineral-800"
            >
              <span>Nova Situação</span>
              <TooltipInformativo
                alinhamento="esquerda"
                texto="Bloqueio administrativo da conta inteira. Se suspensa ou encerrada, nenhum membro da organização poderá acessar o painel."
              />
            </label>
            <select
              id="select-situacao"
              value={novaSituacao}
              onChange={(e) => setNovaSituacao(e.target.value as SituacaoOrganizacao)}
              className="mt-1 w-full rounded-md border border-marfim-300 p-2 text-xs"
            >
              <option value="ativa">Ativa</option>
              <option value="suspensa">Suspensa</option>
              <option value="encerrada">Encerrada</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="justificativa-situacao"
              className="block text-xs font-medium text-mineral-800"
            >
              Justificativa para Auditoria
            </label>
            <textarea
              id="justificativa-situacao"
              rows={3}
              required
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Explique o motivo da alteração..."
              className="mt-1 w-full rounded-md border border-marfim-300 p-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-marfim-200 pt-4">
            <Botao variante="operacional_secundario" tamanho="compacto" onClick={aoFechar}>
              Cancelar
            </Botao>
            <Botao
              tamanho="compacto"
              disabled={salvando || justificativa.trim().length < 5}
              onClick={() => void confirmarAlteracao()}
            >
              {salvando ? "Salvando..." : "Confirmar Alteração"}
            </Botao>
          </div>
        </div>
      </CartaoSuperficie>
    </div>
  );
}

