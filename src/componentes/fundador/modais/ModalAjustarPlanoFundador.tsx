"use client";

import { useState } from "react";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import { CATALOGO_PLANOS_FLUXO } from "@/dominio/assinaturas/tiposAssinaturaAsaas";
import type {
  CodigoPlanoAssinatura,
  SituacaoResumoAssinatura,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import type { ItemVisaoGeralOrganizacaoFundador } from "@/dominio/fundador/tiposPainelFundador";
import type { PortaOperacoesFundadorCliente } from "@/infraestrutura/fundador/servicoOperacoesFundadorCliente";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { TooltipInformativo } from "@/componentes/interface/TooltipInformativo";

export interface ResultadoAjustePlanoFundador {
  readonly organizacaoId: string;
  readonly novoPlanoCodigo: CodigoPlanoAssinatura;
  readonly novaSituacaoAssinatura: SituacaoResumoAssinatura;
  readonly limiteProfissionaisAtivos: number;
  readonly limiteEnviosEmailMensal: number;
  readonly justificativa: string;
}

export interface PropriedadesModalAjustarPlanoFundador {
  readonly organizacao: ItemVisaoGeralOrganizacaoFundador;
  readonly servicoFundador: PortaOperacoesFundadorCliente;
  readonly aoFechar: () => void;
  readonly aoConcluir: (resultado: ResultadoAjustePlanoFundador) => void;
}

export function ModalAjustarPlanoFundador({
  organizacao,
  servicoFundador,
  aoFechar,
  aoConcluir,
}: PropriedadesModalAjustarPlanoFundador) {
  const defInicial = CATALOGO_PLANOS_FLUXO[organizacao.planoCodigo] ?? CATALOGO_PLANOS_FLUXO.pro;
  const [novoPlano, setNovoPlano] = useState<CodigoPlanoAssinatura>(organizacao.planoCodigo);
  const [novaSituacaoAssinatura, setNovaSituacaoAssinatura] = useState<SituacaoResumoAssinatura>(
    organizacao.situacaoAssinatura,
  );
  const [limiteProfissionais, setLimiteProfissionais] = useState<number>(
    organizacao.limiteProfissionaisAtivos ?? defInicial.limiteProfissionaisAtivos,
  );
  const [limiteEmailsMensal, setLimiteEmailsMensal] = useState<number>(
    organizacao.limiteEnviosEmailMensal ?? defInicial.limiteEnviosEmailMensal,
  );
  const [justificativa, setJustificativa] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function confirmarAjuste() {
    setSalvando(true);
    const justificativaLimpa = justificativa.trim();
    try {
      await servicoFundador.ajustarPlanoOrganizacao({
        organizacaoId: organizacao.id,
        novoPlanoCodigo: novoPlano,
        novaSituacaoAssinatura,
        limiteProfissionaisAtivos: limiteProfissionais,
        limiteEnviosEmailMensal: limiteEmailsMensal,
        justificativa: justificativaLimpa,
      });

      notificar.sucesso(`Plano de "${organizacao.nome}" atualizado para "${novoPlano}".`);
      aoConcluir({
        organizacaoId: organizacao.id,
        novoPlanoCodigo: novoPlano,
        novaSituacaoAssinatura,
        limiteProfissionaisAtivos: limiteProfissionais,
        limiteEnviosEmailMensal: limiteEmailsMensal,
        justificativa: justificativaLimpa,
      });
    } catch (e) {
      notificar.erro(e instanceof Error ? e.message : "Não foi possível ajustar o plano.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mineral-950/60 p-4">
      <CartaoSuperficie className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-xl">
        <div className="border-b border-marfim-200 pb-3">
          <h3 className="text-xl font-bold tracking-tight text-mineral-950">
            Ajustar Plano: {organizacao.nome}
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="select-plano"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-mineral-800"
            >
              <span>Novo Código do Plano</span>
              <TooltipInformativo
                alinhamento="esquerda"
                texto="Define a faixa comercial e os limites padrão de profissionais ativos e envios de e-mail por mês. O MRR considera apenas assinaturas recorrentes ativas no gateway."
              />
            </label>
            <select
              id="select-plano"
              value={novoPlano}
              onChange={(e) => {
                const codigo = e.target.value as CodigoPlanoAssinatura;
                const def = CATALOGO_PLANOS_FLUXO[codigo] ?? CATALOGO_PLANOS_FLUXO.pro;
                setNovoPlano(codigo);
                setLimiteProfissionais(def.limiteProfissionaisAtivos);
                setLimiteEmailsMensal(def.limiteEnviosEmailMensal);
              }}
              className="mt-1 w-full rounded-md border border-marfim-300 p-2 text-xs"
            >
              <option value="avaliacao_inicial">Avaliação Inicial</option>
              <option value="pro">Pro (R$ 87/mês)</option>
              <option value="personalizado">Empresarial (Sob medida)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="input-limite-profissionais"
                className="block text-xs font-medium text-mineral-800"
              >
                Profissionais Ativos
              </label>
              <input
                id="input-limite-profissionais"
                type="number"
                min={1}
                max={9999}
                value={limiteProfissionais}
                onChange={(e) => setLimiteProfissionais(Math.max(1, Number(e.target.value)))}
                className="mt-1 w-full rounded-md border border-marfim-300 p-2 text-xs"
              />
            </div>
            <div>
              <label
                htmlFor="input-limite-emails"
                className="block text-xs font-medium text-mineral-800"
              >
                E-mails por Mês
              </label>
              <input
                id="input-limite-emails"
                type="number"
                min={0}
                max={50000}
                value={limiteEmailsMensal}
                onChange={(e) => setLimiteEmailsMensal(Math.max(0, Number(e.target.value)))}
                className="mt-1 w-full rounded-md border border-marfim-300 p-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="select-situacao-assinatura"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-mineral-800"
            >
              <span>Situação da Assinatura</span>
              <TooltipInformativo
                alinhamento="esquerda"
                texto="Controla o status financeiro. Se inadimplente ou cancelada, o cliente ainda entra no painel para regularizar, mas não pode publicar alterações."
              />
            </label>
            <select
              id="select-situacao-assinatura"
              value={novaSituacaoAssinatura}
              onChange={(e) =>
                setNovaSituacaoAssinatura(e.target.value as SituacaoResumoAssinatura)
              }
              className="mt-1 w-full rounded-md border border-marfim-300 p-2 text-xs"
            >
              <option value="ativa">Ativa</option>
              <option value="pendente_contratacao">Pendente Contratação</option>
              <option value="em_carencia">Em Carência</option>
              <option value="inadimplente">Inadimplente</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="justificativa-plano"
              className="block text-xs font-medium text-mineral-800"
            >
              Justificativa para Auditoria
            </label>
            <textarea
              id="justificativa-plano"
              rows={3}
              required
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Explique o motivo do ajuste..."
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
              onClick={() => void confirmarAjuste()}
            >
              {salvando ? "Salvando..." : "Confirmar Ajuste"}
            </Botao>
          </div>
        </div>
      </CartaoSuperficie>
    </div>
  );
}

