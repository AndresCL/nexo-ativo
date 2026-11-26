"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  History,
  Kanban,
  Plus,
  Search,
  Table2,
  TrendingUp,
} from "lucide-react";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import type { RegistroAuditoria } from "@/dominio/entidades/autenticacaoEOrganizacao";
import {
  DESCRITORES_ETAPA_KANBAN_FUNDADOR,
  type EtapaKanbanOrganizacaoFundador,
  type ItemVisaoGeralOrganizacaoFundador,
  type MetricasOperacionaisFundador,
} from "@/dominio/fundador/tiposPainelFundador";
import {
  servicoOperacoesFundadorCliente,
  type PortaOperacoesFundadorCliente,
} from "@/infraestrutura/fundador/servicoOperacoesFundadorCliente";
import { GavetaMensagensOrganizacaoFundador } from "@/componentes/fundador/GavetaMensagensOrganizacaoFundador";
import { ModalAlterarEmailProprietarioFundador } from "@/componentes/fundador/ModalAlterarEmailProprietarioFundador";
import { ModalCriarOrganizacaoFundador } from "@/componentes/fundador/ModalCriarOrganizacaoFundador";
import { ModalPerfilPublicidadeFundador } from "@/componentes/fundador/ModalPerfilPublicidadeFundador";
import { QuadroKanbanOrganizacoesFundador } from "@/componentes/fundador/QuadroKanbanOrganizacoesFundador";
import { TabelaAuditoriaFundador } from "@/componentes/fundador/auditoria/TabelaAuditoriaFundador";
import { GradeCardsMetricasFundador } from "@/componentes/fundador/metricas/GradeCardsMetricasFundador";
import { GraficoEvolucaoMrrFundador } from "@/componentes/fundador/metricas/GraficoEvolucaoMrrFundador";
import { ModalAjustarPlanoFundador } from "@/componentes/fundador/modais/ModalAjustarPlanoFundador";
import { ModalAlterarSituacaoFundador } from "@/componentes/fundador/modais/ModalAlterarSituacaoFundador";
import { ModalBriefingImplantacaoFundador } from "@/componentes/fundador/modais/ModalBriefingImplantacaoFundador";
import { TabelaOrganizacoesFundador } from "@/componentes/fundador/organizacoes/TabelaOrganizacoesFundador";
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
  const navegador = useRouter();
  const [abaAtiva, setAbaAtiva] = useState<"metricas" | "organizacoes" | "auditoria">("metricas");
  const [acessandoOrgId, setAcessandoOrgId] = useState<string | null>(null);
  const [organizacoes, setOrganizacoes] =
    useState<readonly ItemVisaoGeralOrganizacaoFundador[]>(organizacoesIniciais);
  const [auditoria] = useState<readonly RegistroAuditoria[]>(auditoriaInicial);
  const [busca, setBusca] = useState("");
  const [modoVisaoOrganizacoes, setModoVisaoOrganizacoes] = useState<"kanban" | "tabela">("kanban");

  const [organizacaoSituacao, setOrganizacaoSituacao] =
    useState<ItemVisaoGeralOrganizacaoFundador | null>(null);
  const [organizacaoPlano, setOrganizacaoPlano] =
    useState<ItemVisaoGeralOrganizacaoFundador | null>(null);
  const [organizacaoPerfil, setOrganizacaoPerfil] =
    useState<ItemVisaoGeralOrganizacaoFundador | null>(null);
  const [organizacaoEmail, setOrganizacaoEmail] =
    useState<ItemVisaoGeralOrganizacaoFundador | null>(null);
  const [organizacaoBriefing, setOrganizacaoBriefing] =
    useState<ItemVisaoGeralOrganizacaoFundador | null>(null);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [organizacaoMensagensId, setOrganizacaoMensagensId] = useState<string | null>(null);
  const [salvandoKanbanOrgId, setSalvandoKanbanOrgId] = useState<string | null>(null);

  const organizacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) {
      return organizacoes;
    }
    return organizacoes.filter(
      (org) =>
        (org.nome ?? "").toLowerCase().includes(termo) ||
        (org.identificadorPublico ?? "").toLowerCase().includes(termo) ||
        (org.segmentoAtividade ?? "").toLowerCase().includes(termo),
    );
  }, [organizacoes, busca]);

  const organizacaoMensagensAtiva = useMemo(
    () => organizacoes.find((org) => org.id === organizacaoMensagensId) ?? null,
    [organizacoes, organizacaoMensagensId],
  );

  async function acessarPainelOrganizacao(org: ItemVisaoGeralOrganizacaoFundador) {
    setAcessandoOrgId(org.id);
    try {
      const resposta = await fetch("/api/fundador/selecionar-organizacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizacaoId: org.id }),
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível selecionar a organização.");
      }

      navegador.push("/painel");
      navegador.refresh();
    } catch (e) {
      notificar.erro(
        e instanceof Error ? e.message : "Falha ao abrir o painel desta organização.",
      );
      setAcessandoOrgId(null);
    }
  }

  async function moverOrganizacaoKanban(
    org: ItemVisaoGeralOrganizacaoFundador,
    novaEtapa: EtapaKanbanOrganizacaoFundador,
  ) {
    if (!servicoFundador.alterarEtapaKanbanOrganizacao) {
      return;
    }

    const etapaAnterior = org.etapaKanban ?? "onboarding";
    setSalvandoKanbanOrgId(org.id);
    setOrganizacoes((atuais) =>
      atuais.map((item) => (item.id === org.id ? { ...item, etapaKanban: novaEtapa } : item)),
    );

    try {
      await servicoFundador.alterarEtapaKanbanOrganizacao({
        organizacaoId: org.id,
        etapaKanban: novaEtapa,
      });

      notificar.sucesso(
        `"${org.nome}" movida para "${DESCRITORES_ETAPA_KANBAN_FUNDADOR[novaEtapa].rotulo}".`,
      );
    } catch (e) {
      setOrganizacoes((atuais) =>
        atuais.map((item) =>
          item.id === org.id ? { ...item, etapaKanban: etapaAnterior } : item,
        ),
      );
      notificar.erro(
        e instanceof Error ? e.message : "Não foi possível mover a organização no Kanban.",
      );
    } finally {
      setSalvandoKanbanOrgId(null);
    }
  }

  async function adicionarMensagemKanban(
    org: ItemVisaoGeralOrganizacaoFundador,
    texto: string,
  ) {
    if (!servicoFundador.adicionarMensagemKanbanOrganizacao) {
      return;
    }

    try {
      const novaMensagem = await servicoFundador.adicionarMensagemKanbanOrganizacao({
        organizacaoId: org.id,
        texto,
      });

      setOrganizacoes((atuais) =>
        atuais.map((item) =>
          item.id === org.id
            ? {
                ...item,
                mensagensKanban: [...(item.mensagensKanban ?? []), novaMensagem],
              }
            : item,
        ),
      );

      notificar.sucesso("Mensagem adicionada ao acompanhamento do cliente.");
    } catch (e) {
      notificar.erro(
        e instanceof Error ? e.message : "Não foi possível registrar a mensagem.",
      );
      throw e;
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-marfim-200/80 pb-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
            Nexo Ativo · Administração Global da Plataforma
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
            Painel Fundador
          </h1>
          <p className="mt-1 text-xs text-mineral-500">
            Acompanhe indicadores operacionais, gerencie organizações e consulte a trilha de auditoria.
          </p>
        </div>

        <div role="tablist" aria-label="Abas de governança" className="flex flex-wrap gap-2">
          <Botao
            variante={abaAtiva === "metricas" ? "operacional_primario" : "operacional_secundario"}
            tamanho="compacto"
            onClick={() => setAbaAtiva("metricas")}
            className={
              abaAtiva === "metricas"
                ? "rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                : "rounded-lg"
            }
          >
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Métricas e MRR</span>
          </Botao>
          <Botao
            variante={
              abaAtiva === "organizacoes" ? "operacional_primario" : "operacional_secundario"
            }
            tamanho="compacto"
            onClick={() => setAbaAtiva("organizacoes")}
            className={
              abaAtiva === "organizacoes"
                ? "rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                : "rounded-lg"
            }
          >
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Organizações ({organizacoes.length})</span>
          </Botao>
          <Botao
            variante={abaAtiva === "auditoria" ? "operacional_primario" : "operacional_secundario"}
            tamanho="compacto"
            onClick={() => setAbaAtiva("auditoria")}
            className={
              abaAtiva === "auditoria"
                ? "rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                : "rounded-lg"
            }
          >
            <History className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Trilha de Auditoria</span>
          </Botao>
        </div>
      </header>

      {abaAtiva === "metricas" ? (
        <section aria-label="Métricas da plataforma" className="space-y-6">
          <GradeCardsMetricasFundador metricas={metricasIniciais} />

          <GraficoEvolucaoMrrFundador historico={metricasIniciais.historicoMrrMensal ?? []} />

          <CartaoSuperficie className="rounded-2xl border border-marfim-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-semibold tracking-tight text-mineral-950">
              Diretrizes de Governança
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-mineral-600">
              O privilégio de fundador permite auditoria completa e intervenção administrativa para
              suporte a assinantes, liberação de planos personalizados ou suspensão cautelar de
              contas. Todas as ações gravam registros imutáveis na trilha de auditoria.
            </p>
          </CartaoSuperficie>
        </section>
      ) : null}

      {abaAtiva === "organizacoes" ? (
        <section aria-label="Gestão de organizações" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-lg border border-marfim-200 bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  aria-pressed={modoVisaoOrganizacoes === "kanban"}
                  onClick={() => setModoVisaoOrganizacoes("kanban")}
                  className={combinarClasses(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                    modoVisaoOrganizacoes === "kanban"
                      ? "bg-indigo-600 text-white"
                      : "text-mineral-600 hover:text-mineral-950",
                  )}
                >
                  <Kanban className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Kanban</span>
                </button>
                <button
                  type="button"
                  aria-pressed={modoVisaoOrganizacoes === "tabela"}
                  onClick={() => setModoVisaoOrganizacoes("tabela")}
                  className={combinarClasses(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                    modoVisaoOrganizacoes === "tabela"
                      ? "bg-indigo-600 text-white"
                      : "text-mineral-600 hover:text-mineral-950",
                  )}
                >
                  <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Tabela</span>
                </button>
              </div>

              <div className="relative w-full sm:w-72">
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
                  className="w-full rounded-lg border border-marfim-200 bg-white py-2 pr-3 pl-9 text-xs text-mineral-900 shadow-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <Botao
              tamanho="compacto"
              onClick={() => setModalCriarAberto(true)}
              className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Nova Organização</span>
            </Botao>
          </div>

          {modoVisaoOrganizacoes === "kanban" ? (
            <QuadroKanbanOrganizacoesFundador
              organizacoes={organizacoesFiltradas}
              salvandoId={salvandoKanbanOrgId}
              acessandoOrgId={acessandoOrgId}
              aoMover={moverOrganizacaoKanban}
              aoAbrirMensagens={(org) => setOrganizacaoMensagensId(org.id)}
              aoAcessarPainel={acessarPainelOrganizacao}
            />
          ) : (
            <TabelaOrganizacoesFundador
              organizacoes={organizacoesFiltradas}
              acessandoOrgId={acessandoOrgId}
              aoAcessarPainel={acessarPainelOrganizacao}
              aoAbrirMensagens={(org) => setOrganizacaoMensagensId(org.id)}
              aoAbrirAjustarPlano={(org) => setOrganizacaoPlano(org)}
              aoAbrirAlterarSituacao={(org) => setOrganizacaoSituacao(org)}
              aoAbrirPerfilPublicidade={(org) => setOrganizacaoPerfil(org)}
              aoAbrirTrocarEmail={(org) => setOrganizacaoEmail(org)}
            />
          )}
        </section>
      ) : null}

      {abaAtiva === "auditoria" ? <TabelaAuditoriaFundador auditoria={auditoria} /> : null}

      <GavetaMensagensOrganizacaoFundador
        organizacao={organizacaoMensagensAtiva}
        salvando={
          organizacaoMensagensAtiva !== null &&
          salvandoKanbanOrgId === organizacaoMensagensAtiva.id
        }
        acessandoOrgId={acessandoOrgId}
        aoFechar={() => setOrganizacaoMensagensId(null)}
        aoMoverEtapa={moverOrganizacaoKanban}
        aoAdicionarMensagem={adicionarMensagemKanban}
        aoAcessarPainel={acessarPainelOrganizacao}
        aoAbrirBriefing={(org) => setOrganizacaoBriefing(org)}
        aoAbrirAjustePlano={(org) => setOrganizacaoPlano(org)}
        aoAbrirAlterarSituacao={(org) => setOrganizacaoSituacao(org)}
        aoAbrirPerfilPublicidade={(org) => setOrganizacaoPerfil(org)}
      />

      {organizacaoBriefing ? (
        <ModalBriefingImplantacaoFundador
          key={organizacaoBriefing.id}
          organizacao={organizacaoBriefing}
          servicoBriefing={
            servicoFundador.obterBriefingImplantacao &&
            servicoFundador.salvarBriefingImplantacao
              ? {
                  obterBriefingImplantacao: servicoFundador.obterBriefingImplantacao.bind(
                    servicoFundador,
                  ),
                  salvarBriefingImplantacao: servicoFundador.salvarBriefingImplantacao.bind(
                    servicoFundador,
                  ),
                }
              : servicoOperacoesFundadorCliente
          }
          aoFechar={() => setOrganizacaoBriefing(null)}
        />
      ) : null}

      {organizacaoPerfil ? (
        <ModalPerfilPublicidadeFundador
          organizacao={organizacaoPerfil}
          servicoFundador={servicoFundador}
          aoFechar={() => setOrganizacaoPerfil(null)}
          aoConcluir={(organizacaoId, novoPerfil, justificativaPerfil) => {
            const msgAuditoria = justificativaPerfil
              ? {
                  id: `aud-local-${Date.now()}`,
                  texto: `[Perfil de publicidade (${novoPerfil})] ${justificativaPerfil}`,
                  criadoEmIso: new Date().toISOString(),
                }
              : null;

            setOrganizacoes((atuais) =>
              atuais.map((org) =>
                org.id === organizacaoId
                  ? {
                      ...org,
                      perfilPublicidade: novoPerfil,
                      ...(msgAuditoria
                        ? { mensagensKanban: [...(org.mensagensKanban ?? []), msgAuditoria] }
                        : {}),
                    }
                  : org,
              ),
            );
            setOrganizacaoPerfil(null);
          }}
        />
      ) : null}

      {organizacaoEmail ? (
        <ModalAlterarEmailProprietarioFundador
          organizacao={organizacaoEmail}
          servicoFundador={servicoFundador}
          aoFechar={() => setOrganizacaoEmail(null)}
          aoConcluir={() => setOrganizacaoEmail(null)}
        />
      ) : null}

      {modalCriarAberto ? (
        <ModalCriarOrganizacaoFundador
          servicoFundador={servicoFundador}
          aoFechar={() => setModalCriarAberto(false)}
          aoConcluir={(novaOrganizacao) => {
            setOrganizacoes((atuais) => [novaOrganizacao, ...atuais]);
            setModalCriarAberto(false);
          }}
        />
      ) : null}

      {organizacaoSituacao ? (
        <ModalAlterarSituacaoFundador
          organizacao={organizacaoSituacao}
          servicoFundador={servicoFundador}
          aoFechar={() => setOrganizacaoSituacao(null)}
          aoConcluir={(organizacaoId, novaSituacao, justificativaSituacao) => {
            const mensagemAuditoria = {
              id: `aud-local-${Date.now()}`,
              texto: `[Situação alterada (${novaSituacao})] ${justificativaSituacao}`,
              criadoEmIso: new Date().toISOString(),
            };
            setOrganizacoes((atuais) =>
              atuais.map((org) =>
                org.id === organizacaoId
                  ? {
                      ...org,
                      situacao: novaSituacao,
                      mensagensKanban: [...(org.mensagensKanban ?? []), mensagemAuditoria],
                    }
                  : org,
              ),
            );
            setOrganizacaoSituacao(null);
          }}
        />
      ) : null}

      {organizacaoPlano ? (
        <ModalAjustarPlanoFundador
          organizacao={organizacaoPlano}
          servicoFundador={servicoFundador}
          aoFechar={() => setOrganizacaoPlano(null)}
          aoConcluir={(res) => {
            const mensagemAuditoria = {
              id: `aud-local-${Date.now()}`,
              texto: `[Ajuste de plano (${res.novoPlanoCodigo})] ${res.justificativa}`,
              criadoEmIso: new Date().toISOString(),
            };
            setOrganizacoes((atuais) =>
              atuais.map((org) =>
                org.id === res.organizacaoId
                  ? {
                      ...org,
                      planoCodigo: res.novoPlanoCodigo,
                      situacaoAssinatura: res.novaSituacaoAssinatura,
                      limiteProfissionaisAtivos: res.limiteProfissionaisAtivos,
                      limiteEnviosEmailMensal: res.limiteEnviosEmailMensal,
                      mensagensKanban: [...(org.mensagensKanban ?? []), mensagemAuditoria],
                    }
                  : org,
              ),
            );
            setOrganizacaoPlano(null);
          }}
        />
      ) : null}
    </div>
  );
}
