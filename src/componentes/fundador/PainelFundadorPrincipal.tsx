"use client";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import { useMemo, useState } from "react";
import { Building2, History, Search, TrendingUp } from "lucide-react";
import type {
  CodigoPlanoAssinatura,
  RegistroAuditoria,
  SituacaoOrganizacao,
  SituacaoResumoAssinatura,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import type {
  ItemVisaoGeralOrganizacaoFundador,
  MetricasOperacionaisFundador,
} from "@/dominio/fundador/tiposPainelFundador";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import {
  servicoOperacoesFundadorCliente,
  type PortaOperacoesFundadorCliente,
} from "@/infraestrutura/fundador/servicoOperacoesFundadorCliente";
import { ModalPerfilPublicidadeFundador } from "@/componentes/fundador/ModalPerfilPublicidadeFundador";
import { obterPoliticaPublicidade } from "@/dominio/publicidade/registroPoliticasPublicidade";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesPainelFundadorPrincipal {
  readonly metricasIniciais: MetricasOperacionaisFundador;
  readonly organizacoesIniciais: readonly ItemVisaoGeralOrganizacaoFundador[];
  readonly auditoriaInicial: readonly RegistroAuditoria[];
  readonly servicoFundador?: PortaOperacoesFundadorCliente;
}

export function PainelFundadorPrincipal({
  metricasIniciais,
  organizacoesIniciais,
  auditoriaInicial,
  servicoFundador = servicoOperacoesFundadorCliente,
}: PropriedadesPainelFundadorPrincipal) {
  const [abaAtiva, setAbaAtiva] = useState<"metricas" | "organizacoes" | "auditoria">("metricas");
  const [organizacoes, setOrganizacoes] =
    useState<readonly ItemVisaoGeralOrganizacaoFundador[]>(organizacoesIniciais);
  const [auditoria] = useState<readonly RegistroAuditoria[]>(auditoriaInicial);
  const [busca, setBusca] = useState("");

  const [modalAcao, setModalAcao] = useState<{
    tipo: "situacao" | "plano";
    organizacao: ItemVisaoGeralOrganizacaoFundador;
  } | null>(null);

  const [organizacaoPerfil, setOrganizacaoPerfil] =
    useState<ItemVisaoGeralOrganizacaoFundador | null>(null);

  const [novaSituacao, setNovaSituacao] = useState<SituacaoOrganizacao>("ativa");
  const [novoPlano, setNovoPlano] = useState<CodigoPlanoAssinatura>("pro");
  const [novaSituacaoAssinatura, setNovaSituacaoAssinatura] =
    useState<SituacaoResumoAssinatura>("ativa");
  const [justificativa, setJustificativa] = useState("");

  const [salvando, setSalvando] = useState(false);

  const organizacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) {
      return organizacoes;
    }
    return organizacoes.filter(
      (org) =>
        org.nome.toLowerCase().includes(termo) ||
        org.identificadorPublico.toLowerCase().includes(termo) ||
        org.segmentoAtividade.toLowerCase().includes(termo),
    );
  }, [organizacoes, busca]);

  async function confirmarAlteracaoSituacao() {
    if (!modalAcao || modalAcao.tipo !== "situacao") {
      return;
    }

    setSalvando(true);

    try {
      await servicoFundador.alterarSituacaoOrganizacao({
        organizacaoId: modalAcao.organizacao.id,
        novaSituacao,
        justificativa,
      });

      setOrganizacoes((atuais) =>
        atuais.map((org) =>
          org.id === modalAcao.organizacao.id ? { ...org, situacao: novaSituacao } : org,
        ),
      );

      notificar.sucesso(
        `Situação de "${modalAcao.organizacao.nome}" alterada para "${novaSituacao}".`,
      );
      setModalAcao(null);
      setJustificativa("");
    } catch (e) {
      notificar.erro(e instanceof Error ? e.message : "Não foi possível alterar a situação.");
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarAjustePlano() {
    if (!modalAcao || modalAcao.tipo !== "plano") {
      return;
    }

    setSalvando(true);

    try {
      await servicoFundador.ajustarPlanoOrganizacao({
        organizacaoId: modalAcao.organizacao.id,
        novoPlanoCodigo: novoPlano,
        novaSituacaoAssinatura,
        justificativa,
      });

      setOrganizacoes((atuais) =>
        atuais.map((org) =>
          org.id === modalAcao.organizacao.id
            ? {
                ...org,
                planoCodigo: novoPlano,
                situacaoAssinatura: novaSituacaoAssinatura,
              }
            : org,
        ),
      );

      notificar.sucesso(`Plano de "${modalAcao.organizacao.nome}" atualizado para "${novoPlano}".`);
      setModalAcao(null);
      setJustificativa("");
    } catch (e) {
      notificar.erro(e instanceof Error ? e.message : "Não foi possível ajustar o plano.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-marfim-300 pb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-mineral-500 uppercase">
            Administração Global da Plataforma
          </span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-mineral-950">
            Painel Fundador
          </h1>
        </div>

        <div role="tablist" aria-label="Abas de governança" className="flex gap-2">
          <Botao
            variante={abaAtiva === "metricas" ? "editorial_principal" : "operacional_secundario"}
            tamanho="compacto"
            onClick={() => setAbaAtiva("metricas")}
          >
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Métricas e MRR</span>
          </Botao>
          <Botao
            variante={
              abaAtiva === "organizacoes" ? "editorial_principal" : "operacional_secundario"
            }
            tamanho="compacto"
            onClick={() => setAbaAtiva("organizacoes")}
          >
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Organizações ({organizacoes.length})</span>
          </Botao>
          <Botao
            variante={abaAtiva === "auditoria" ? "editorial_principal" : "operacional_secundario"}
            tamanho="compacto"
            onClick={() => setAbaAtiva("auditoria")}
          >
            <History className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Trilha de Auditoria</span>
          </Botao>
        </div>
      </div>

      {abaAtiva === "metricas" ? (
        <section aria-label="Métricas da plataforma" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CartaoSuperficie preenchimento="compacto" className="space-y-1">
              <p className="text-xs text-mineral-600">Receita Recorrente Mensal (MRR)</p>
              <p className="text-3xl font-bold tracking-tight text-emerald-900">
                {ValorMonetarioCentavos.deCentavos(
                  metricasIniciais.receitaMensalRecorrenteCentavos,
                ).formatarMoedaBrasileira()}
              </p>
            </CartaoSuperficie>

            <CartaoSuperficie preenchimento="compacto" className="space-y-1">
              <p className="text-xs text-mineral-600">Organizações Totais</p>
              <p className="text-3xl font-bold tracking-tight text-mineral-950">
                {metricasIniciais.totalOrganizacoes}
              </p>
            </CartaoSuperficie>

            <CartaoSuperficie preenchimento="compacto" className="space-y-1">
              <p className="text-xs text-emerald-800">Assinaturas Ativas</p>
              <p className="text-3xl font-bold tracking-tight text-emerald-900">
                {metricasIniciais.assinaturasAtivas}
              </p>
            </CartaoSuperficie>

            <CartaoSuperficie preenchimento="compacto" className="space-y-1">
              <p className="text-xs text-red-800">Inadimplentes / Atrasadas</p>
              <p className="text-3xl font-bold tracking-tight text-red-900">
                {metricasIniciais.assinaturasInadimplentes}
              </p>
            </CartaoSuperficie>
          </div>

          <CartaoSuperficie className="p-6">
            <h2 className="text-xl font-bold tracking-tight text-mineral-950">
              Diretrizes de Governança
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-mineral-700">
              O privilégio de fundador permite auditoria completa e intervenção administrativa para
              suporte a assinantes, liberação de planos personalizados ou suspensão cautelar de
              contas. Todas as ações gravam registros imutáveis na trilha de auditoria.
            </p>
          </CartaoSuperficie>
        </section>
      ) : null}

      {abaAtiva === "organizacoes" ? (
        <section aria-label="Gestão de organizações" className="space-y-4">
          <div className="relative w-full sm:w-80">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mineral-400"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Buscar organizações"
              placeholder="Buscar por nome ou slug..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-md border border-marfim-300 bg-white py-2 pr-3 pl-9 text-xs text-mineral-900 focus:border-mineral-700 focus:outline-none"
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-marfim-300 bg-white">
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
                    Situação
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Publicidade
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Plano
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Assinatura
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Ações Fundador
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-marfim-200">
                {organizacoesFiltradas.map((org) => (
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
                    <td className="px-4 py-3 text-mineral-700">{org.situacaoAssinatura}</td>
                    <td className="space-x-2 px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setModalAcao({ tipo: "situacao", organizacao: org });
                          setNovaSituacao(org.situacao);
                        }}
                        className="rounded border border-marfim-300 px-2 py-1 text-[11px] font-medium text-mineral-800 hover:bg-marfim-100"
                      >
                        Alterar Situação
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrganizacaoPerfil(org)}
                        className="rounded border border-marfim-300 px-2 py-1 text-[11px] font-medium text-mineral-800 hover:bg-marfim-100"
                      >
                        Perfil de Publicidade
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setModalAcao({ tipo: "plano", organizacao: org });
                          setNovoPlano(org.planoCodigo);
                          setNovaSituacaoAssinatura(org.situacaoAssinatura);
                        }}
                        className="rounded border border-marfim-300 bg-mineral-900 px-2 py-1 text-[11px] font-medium text-marfim-50 hover:bg-mineral-800"
                      >
                        Ajustar Plano
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {abaAtiva === "auditoria" ? (
        <section aria-label="Trilha de auditoria" className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-marfim-300 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-marfim-200 bg-marfim-50 text-[11px] font-semibold tracking-wider text-mineral-600 uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Data / Hora
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Ação
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Executor
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Organização Alvo
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Detalhes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-marfim-200">
                {auditoria.map((reg) => (
                  <tr key={reg.id} className="hover:bg-marfim-50/50">
                    <td className="px-4 py-3 font-mono text-mineral-700">{reg.criadoEmIso}</td>
                    <td className="px-4 py-3 font-medium text-mineral-950">{reg.acao}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-mineral-600">
                      {reg.atorUsuarioId}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-mineral-600">
                      {reg.organizacaoAlvoId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-mineral-700">
                      {JSON.stringify(reg.detalhes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {organizacaoPerfil ? (
        <ModalPerfilPublicidadeFundador
          organizacao={organizacaoPerfil}
          servicoFundador={servicoFundador}
          aoFechar={() => setOrganizacaoPerfil(null)}
          aoConcluir={(organizacaoId, novoPerfil) => {
            setOrganizacoes((atuais) =>
              atuais.map((org) =>
                org.id === organizacaoId ? { ...org, perfilPublicidade: novoPerfil } : org,
              ),
            );
            setOrganizacaoPerfil(null);
          }}
        />
      ) : null}

      {modalAcao ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mineral-950/60 p-4">
          <CartaoSuperficie className="w-full max-w-md space-y-5 bg-white p-6 shadow-xl">
            <div className="border-b border-marfim-200 pb-3">
              <h3 className="text-xl font-bold tracking-tight text-mineral-950">
                {modalAcao.tipo === "situacao"
                  ? `Alterar Situação: ${modalAcao.organizacao.nome}`
                  : `Ajustar Plano: ${modalAcao.organizacao.nome}`}
              </h3>
            </div>

            {modalAcao.tipo === "situacao" ? (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="select-situacao"
                    className="block text-xs font-medium text-mineral-800"
                  >
                    Nova Situação
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
                  <Botao
                    variante="operacional_secundario"
                    tamanho="compacto"
                    onClick={() => setModalAcao(null)}
                  >
                    Cancelar
                  </Botao>
                  <Botao
                    tamanho="compacto"
                    disabled={salvando || justificativa.trim().length < 5}
                    onClick={() => void confirmarAlteracaoSituacao()}
                  >
                    {salvando ? "Salvando..." : "Confirmar Alteração"}
                  </Botao>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="select-plano"
                    className="block text-xs font-medium text-mineral-800"
                  >
                    Novo Código do Plano
                  </label>
                  <select
                    id="select-plano"
                    value={novoPlano}
                    onChange={(e) => setNovoPlano(e.target.value as CodigoPlanoAssinatura)}
                    className="mt-1 w-full rounded-md border border-marfim-300 p-2 text-xs"
                  >
                    <option value="avaliacao_inicial">Avaliação Inicial</option>
                    <option value="pro">Pro (R$ 97/mês)</option>
                    <option value="equipe">Equipe (R$ 197/mês)</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="select-situacao-assinatura"
                    className="block text-xs font-medium text-mineral-800"
                  >
                    Situação da Assinatura
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
                  <Botao
                    variante="operacional_secundario"
                    tamanho="compacto"
                    onClick={() => setModalAcao(null)}
                  >
                    Cancelar
                  </Botao>
                  <Botao
                    tamanho="compacto"
                    disabled={salvando || justificativa.trim().length < 5}
                    onClick={() => void confirmarAjustePlano()}
                  >
                    {salvando ? "Salvando..." : "Confirmar Ajuste"}
                  </Botao>
                </div>
              </div>
            )}
          </CartaoSuperficie>
        </div>
      ) : null}
    </div>
  );
}
