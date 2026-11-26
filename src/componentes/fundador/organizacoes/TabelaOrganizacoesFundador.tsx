"use client";

import { useEffect, useState } from "react";
import { ExternalLink, MessageSquare, MoreVertical } from "lucide-react";
import { formatarRotuloSituacaoAssinatura } from "@/dominio/fundador/calculadoraMetricasFundador";
import {
  DESCRITORES_ETAPA_KANBAN_FUNDADOR,
  type ItemVisaoGeralOrganizacaoFundador,
} from "@/dominio/fundador/tiposPainelFundador";
import { obterPoliticaPublicidade } from "@/dominio/publicidade/registroPoliticasPublicidade";
import { TooltipInformativo } from "@/componentes/interface/TooltipInformativo";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesTabelaOrganizacoesFundador {
  readonly organizacoes: readonly ItemVisaoGeralOrganizacaoFundador[];
  readonly acessandoOrgId: string | null;
  readonly aoAcessarPainel: (org: ItemVisaoGeralOrganizacaoFundador) => Promise<void>;
  readonly aoAbrirMensagens: (org: ItemVisaoGeralOrganizacaoFundador) => void;
  readonly aoAbrirAjustarPlano: (org: ItemVisaoGeralOrganizacaoFundador) => void;
  readonly aoAbrirAlterarSituacao: (org: ItemVisaoGeralOrganizacaoFundador) => void;
  readonly aoAbrirPerfilPublicidade: (org: ItemVisaoGeralOrganizacaoFundador) => void;
  readonly aoAbrirTrocarEmail: (org: ItemVisaoGeralOrganizacaoFundador) => void;
}

export function TabelaOrganizacoesFundador({
  organizacoes,
  acessandoOrgId,
  aoAcessarPainel,
  aoAbrirMensagens,
  aoAbrirAjustarPlano,
  aoAbrirAlterarSituacao,
  aoAbrirPerfilPublicidade,
  aoAbrirTrocarEmail,
}: PropriedadesTabelaOrganizacoesFundador) {
  const [menuOpcoesAbertoOrgId, setMenuOpcoesAbertoOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (!menuOpcoesAbertoOrgId) return;
    function fecharMenuAoClicarFora() {
      setMenuOpcoesAbertoOrgId(null);
    }
    window.addEventListener("click", fecharMenuAoClicarFora);
    return () => window.removeEventListener("click", fecharMenuAoClicarFora);
  }, [menuOpcoesAbertoOrgId]);

  return (
    <div className="overflow-visible rounded-2xl border border-marfim-200 bg-white shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-marfim-200 bg-marfim-50 text-[11px] font-semibold tracking-wider text-mineral-600 uppercase">
          <tr>
            <th scope="col" className="px-4 py-3">
              Organização
            </th>
            <th scope="col" className="px-4 py-3">
              Endereço Público
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="inline-flex items-center gap-1">
                <span>Grupo Kanban</span>
                <TooltipInformativo
                  alinhamento="esquerda"
                  texto="Organização interna exclusiva do fundador para acompanhar o momento de cada cliente (não afeta o acesso do cliente)."
                />
              </span>
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="inline-flex items-center gap-1">
                <span>Situação</span>
                <TooltipInformativo
                  alinhamento="centro"
                  texto="Bloqueio administrativo da conta (Ativa, Suspensa ou Encerrada). Se suspensa ou encerrada, os membros da organização perdem o acesso ao painel."
                />
              </span>
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="inline-flex items-center gap-1">
                <span>Publicidade</span>
                <TooltipInformativo
                  alinhamento="centro"
                  texto="Regras éticas do conselho profissional (Padrão, OAB, CFM, CFO). Perfis restritos ocultam preços, cálculos e avaliações do Google na vitrine."
                />
              </span>
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="inline-flex items-center gap-1">
                <span>Plano</span>
                <TooltipInformativo
                  alinhamento="centro"
                  texto="Faixa comercial contratada (Avaliação Inicial, Pro ou Personalizado). Define o valor no MRR e as cotas de profissionais ativos e envios de e-mail."
                />
              </span>
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="inline-flex items-center gap-1">
                <span>Assinatura</span>
                <TooltipInformativo
                  alinhamento="direita"
                  texto="Status financeiro da mensalidade (Ativa, Em carência, Inadimplente, Cancelada). O cliente ainda acessa o painel para regularizar, mas contas inadimplentes/canceladas não podem publicar alterações."
                />
              </span>
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="inline-flex items-center gap-1">
                <span>E-mails (Mês)</span>
                <TooltipInformativo
                  alinhamento="direita"
                  texto="Quantidade de e-mails transacionais de solicitações enviados por esta organização no mês atual."
                />
              </span>
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              Ações Fundador
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-marfim-200">
          {organizacoes.map((org) => {
            const qtdMensagens = (org.mensagensKanban ?? []).length;
            const menuAberto = menuOpcoesAbertoOrgId === org.id;

            return (
              <tr key={org.id} className="hover:bg-marfim-50/50">
                <td className="px-4 py-3 font-semibold text-mineral-950">
                  {org.nome}
                  <span className="block text-[10px] font-normal text-mineral-500">
                    {org.segmentoAtividade}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-mineral-700">
                  /{org.identificadorPublico}
                </td>
                <td className="px-4 py-3 text-mineral-800">
                  {DESCRITORES_ETAPA_KANBAN_FUNDADOR[org.etapaKanban ?? "onboarding"].rotulo}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={combinarClasses(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      org.situacao === "ativa"
                        ? "border-emerald-300 bg-emerald-100 text-emerald-900"
                        : "border-red-300 bg-red-100 text-red-900",
                    )}
                  >
                    {org.situacao}
                  </span>
                </td>
                <td className="px-4 py-3 text-mineral-800">
                  {obterPoliticaPublicidade(org.perfilPublicidade).rotulo}
                </td>
                <td className="px-4 py-3 font-medium uppercase text-mineral-800">
                  {org.planoCodigo}
                </td>
                <td className="px-4 py-3 text-mineral-700">
                  {formatarRotuloSituacaoAssinatura(org.situacaoAssinatura, org.origemAssinatura)}
                </td>
                <td className="px-4 py-3 tabular-nums text-mineral-800">
                  <span className="font-semibold">{org.emailsEnviadosMesAtual ?? 0}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      disabled={acessandoOrgId === org.id}
                      onClick={() => void aoAcessarPainel(org)}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      <span>
                        {acessandoOrgId === org.id ? "Abrindo..." : "Acessar Painel"}
                      </span>
                    </button>

                    <button
                      type="button"
                      aria-label={`Mais opções para ${org.nome}`}
                      aria-expanded={menuAberto}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpcoesAbertoOrgId((atual) => (atual === org.id ? null : org.id));
                      }}
                      className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg border border-marfim-300 bg-white text-mineral-700 transition-colors hover:bg-marfim-100"
                    >
                      <MoreVertical className="h-3.5 w-3.5" aria-hidden="true" />
                      {qtdMensagens > 0 ? (
                        <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
                          {qtdMensagens}
                        </span>
                      ) : null}
                    </button>

                    {menuAberto ? (
                      <div
                        role="menu"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full right-0 z-30 mt-1.5 w-48 rounded-xl border border-marfim-200 bg-white p-1.5 text-left shadow-lg"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuOpcoesAbertoOrgId(null);
                            aoAbrirMensagens(org);
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-mineral-800 hover:bg-marfim-100"
                        >
                          <span className="inline-flex items-center gap-2">
                            <MessageSquare
                              className="h-3.5 w-3.5 text-indigo-600"
                              aria-hidden="true"
                            />
                            <span>Mensagens</span>
                          </span>
                          <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-900">
                            {qtdMensagens}
                          </span>
                        </button>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuOpcoesAbertoOrgId(null);
                            aoAbrirAjustarPlano(org);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-mineral-800 hover:bg-marfim-100"
                        >
                          <span>Ajustar Plano</span>
                        </button>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuOpcoesAbertoOrgId(null);
                            aoAbrirAlterarSituacao(org);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-mineral-800 hover:bg-marfim-100"
                        >
                          <span>Alterar Situação</span>
                        </button>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuOpcoesAbertoOrgId(null);
                            aoAbrirPerfilPublicidade(org);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-mineral-800 hover:bg-marfim-100"
                        >
                          <span>Perfil de Publicidade</span>
                        </button>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuOpcoesAbertoOrgId(null);
                            aoAbrirTrocarEmail(org);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-mineral-800 hover:bg-marfim-100"
                        >
                          <span>Trocar E-mail</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

