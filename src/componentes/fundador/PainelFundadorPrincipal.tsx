"use client";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ExternalLink,
  History,
  Kanban,
  MessageSquare,
  MoreVertical,
  Plus,
  Search,
  Table2,
  TrendingUp,
} from "lucide-react";
import { CATALOGO_PLANOS_FLUXO } from "@/dominio/assinaturas/tiposAssinaturaAsaas";
import type {
  CodigoPlanoAssinatura,
  RegistroAuditoria,
  SituacaoOrganizacao,
  SituacaoResumoAssinatura,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import {
  DESCRITORES_ETAPA_KANBAN_FUNDADOR,
  type EtapaKanbanOrganizacaoFundador,
  type ItemVisaoGeralOrganizacaoFundador,
  type MetricasOperacionaisFundador,
} from "@/dominio/fundador/tiposPainelFundador";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import {
  servicoOperacoesFundadorCliente,
  type PortaOperacoesFundadorCliente,
} from "@/infraestrutura/fundador/servicoOperacoesFundadorCliente";
import { GavetaMensagensOrganizacaoFundador } from "@/componentes/fundador/GavetaMensagensOrganizacaoFundador";
import { ModalCriarOrganizacaoFundador } from "@/componentes/fundador/ModalCriarOrganizacaoFundador";
import { ModalPerfilPublicidadeFundador } from "@/componentes/fundador/ModalPerfilPublicidadeFundador";
import { QuadroKanbanOrganizacoesFundador } from "@/componentes/fundador/QuadroKanbanOrganizacoesFundador";
import { obterPoliticaPublicidade } from "@/dominio/publicidade/registroPoliticasPublicidade";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { TooltipInformativo } from "@/componentes/interface/TooltipInformativo";
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

  const [modalAcao, setModalAcao] = useState<{
    tipo: "situacao" | "plano";
    organizacao: ItemVisaoGeralOrganizacaoFundador;
  } | null>(null);

  const [organizacaoPerfil, setOrganizacaoPerfil] =
    useState<ItemVisaoGeralOrganizacaoFundador | null>(null);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modoVisaoOrganizacoes, setModoVisaoOrganizacoes] = useState<"kanban" | "tabela">("kanban");
  const [organizacaoMensagensId, setOrganizacaoMensagensId] = useState<string | null>(null);
  const [salvandoKanbanOrgId, setSalvandoKanbanOrgId] = useState<string | null>(null);
  const [menuOpcoesAbertoOrgId, setMenuOpcoesAbertoOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (!menuOpcoesAbertoOrgId) return;
    function fecharMenuAoClicarFora() {
      setMenuOpcoesAbertoOrgId(null);
    }
    window.addEventListener("click", fecharMenuAoClicarFora);
    return () => window.removeEventListener("click", fecharMenuAoClicarFora);
  }, [menuOpcoesAbertoOrgId]);

  const [novaSituacao, setNovaSituacao] = useState<SituacaoOrganizacao>("ativa");
  const [novoPlano, setNovoPlano] = useState<CodigoPlanoAssinatura>("pro");
  const [novaSituacaoAssinatura, setNovaSituacaoAssinatura] =
    useState<SituacaoResumoAssinatura>("ativa");
  const [limiteProfissionais, setLimiteProfissionais] = useState<number>(10);
  const [limiteEmailsMensal, setLimiteEmailsMensal] = useState<number>(300);
  const [justificativa, setJustificativa] = useState("");

  const [salvando, setSalvando] = useState(false);

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

  function abrirModalAjustarPlano(org: ItemVisaoGeralOrganizacaoFundador) {
    const def = CATALOGO_PLANOS_FLUXO[org.planoCodigo] ?? CATALOGO_PLANOS_FLUXO.pro;
    setModalAcao({ tipo: "plano", organizacao: org });
    setNovoPlano(org.planoCodigo);
    setNovaSituacaoAssinatura(org.situacaoAssinatura);
    setLimiteProfissionais(org.limiteProfissionaisAtivos ?? def.limiteProfissionaisAtivos);
    setLimiteEmailsMensal(org.limiteEnviosEmailMensal ?? def.limiteEnviosEmailMensal);
  }

  async function confirmarAlteracaoSituacao() {
    if (!modalAcao || modalAcao.tipo !== "situacao") {
      return;
    }

    setSalvando(true);
    const justificativaLimpa = justificativa.trim();
    const orgAlvo = modalAcao.organizacao;

    try {
      await servicoFundador.alterarSituacaoOrganizacao({
        organizacaoId: orgAlvo.id,
        novaSituacao,
        justificativa: justificativaLimpa,
      });

      const mensagemAuditoria = {
        id: `aud-local-${Date.now()}`,
        texto: `[Situação alterada (${novaSituacao})] ${justificativaLimpa}`,
        criadoEmIso: new Date().toISOString(),
      };

      setOrganizacoes((atuais) =>
        atuais.map((org) =>
          org.id === orgAlvo.id
            ? {
              ...org,
              situacao: novaSituacao,
              mensagensKanban: [...(org.mensagensKanban ?? []), mensagemAuditoria],
            }
            : org,
        ),
      );

      notificar.sucesso(`Situação de "${orgAlvo.nome}" alterada para "${novaSituacao}".`);
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
    const justificativaLimpa = justificativa.trim();
    const orgAlvo = modalAcao.organizacao;

    try {
      await servicoFundador.ajustarPlanoOrganizacao({
        organizacaoId: orgAlvo.id,
        novoPlanoCodigo: novoPlano,
        novaSituacaoAssinatura,
        limiteProfissionaisAtivos: limiteProfissionais,
        limiteEnviosEmailMensal: limiteEmailsMensal,
        justificativa: justificativaLimpa,
      });

      const mensagemAuditoria = {
        id: `aud-local-${Date.now()}`,
        texto: `[Ajuste de plano (${novoPlano})] ${justificativaLimpa}`,
        criadoEmIso: new Date().toISOString(),
      };

      setOrganizacoes((atuais) =>
        atuais.map((org) =>
          org.id === orgAlvo.id
            ? {
              ...org,
              planoCodigo: novoPlano,
              situacaoAssinatura: novaSituacaoAssinatura,
              limiteProfissionaisAtivos: limiteProfissionais,
              limiteEnviosEmailMensal: limiteEmailsMensal,
              mensagensKanban: [...(org.mensagensKanban ?? []), mensagemAuditoria],
            }
            : org,
        ),
      );

      notificar.sucesso(`Plano de "${orgAlvo.nome}" atualizado para "${novoPlano}".`);
      setModalAcao(null);
      setJustificativa("");
    } catch (e) {
      notificar.erro(e instanceof Error ? e.message : "Não foi possível ajustar o plano.");
    } finally {
      setSalvando(false);
    }
  }

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

  const organizacaoMensagensAtiva = useMemo(
    () => organizacoes.find((org) => org.id === organizacaoMensagensId) ?? null,
    [organizacoes, organizacaoMensagensId],
  );

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
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                titulo: "Receita Recorrente Mensal (MRR)",
                valor: ValorMonetarioCentavos.deCentavos(
                  metricasIniciais.receitaMensalRecorrenteCentavos,
                ).formatarMoedaBrasileira(),
                apoio: "Assinaturas ativas na plataforma",
                icone: TrendingUp,
                cor: "border-emerald-200 from-emerald-50/80 text-emerald-950",
                iconeCor: "bg-emerald-600",
              },
              {
                titulo: "Organizações Totais",
                valor: String(metricasIniciais.totalOrganizacoes),
                apoio: "Cadastradas no Nexo Ativo",
                icone: Building2,
                cor: "border-indigo-200 from-indigo-50/80 text-indigo-950",
                iconeCor: "bg-indigo-600",
              },
              {
                titulo: "Assinaturas Ativas",
                valor: String(metricasIniciais.assinaturasAtivas),
                apoio: "Em situação regular",
                icone: CheckCircle2,
                cor: "border-sky-200 from-sky-50/80 text-sky-950",
                iconeCor: "bg-sky-600",
              },
              {
                titulo: "Inadimplentes / Atrasadas",
                valor: String(metricasIniciais.assinaturasInadimplentes),
                apoio: "Exigem acompanhamento",
                icone: AlertTriangle,
                cor: "border-amber-200 from-amber-50/80 text-amber-950",
                iconeCor: "bg-amber-600",
              },
            ].map((item) => (
              <div
                key={item.titulo}
                className={combinarClasses(
                  "rounded-2xl border bg-gradient-to-b via-white to-white p-4 shadow-xs sm:p-5",
                  item.cor,
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">{item.titulo}</p>
                  <span
                    className={combinarClasses(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white",
                      item.iconeCor,
                    )}
                  >
                    <item.icone className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-3 break-words text-lg font-extrabold tracking-tight sm:text-xl">
                  {item.valor}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-mineral-500">{item.apoio}</p>
              </div>
            ))}
          </div>

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
                    <th scope="col" className="px-4 py-3 text-right">
                      Ações Fundador
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-marfim-200">
                  {organizacoesFiltradas.map((org) => {
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
                          {
                            DESCRITORES_ETAPA_KANBAN_FUNDADOR[org.etapaKanban ?? "onboarding"]
                              .rotulo
                          }
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
                        <td className="px-4 py-3 text-right">
                          <div className="relative inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={acessandoOrgId === org.id}
                              onClick={() => void acessarPainelOrganizacao(org)}
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
                                setMenuOpcoesAbertoOrgId((atual) =>
                                  atual === org.id ? null : org.id,
                                );
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
                                className=" absolute top-full right-0 z-30 mt-1.5 w-48 rounded-xl border border-marfim-200 bg-white p-1.5 text-left shadow-lg"
                              >
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setMenuOpcoesAbertoOrgId(null);
                                    setOrganizacaoMensagensId(org.id);
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
                                    abrirModalAjustarPlano(org);
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
                                    setModalAcao({ tipo: "situacao", organizacao: org });
                                    setNovaSituacao(org.situacao);
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
                                    setOrganizacaoPerfil(org);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-mineral-800 hover:bg-marfim-100"
                                >
                                  <span>Perfil de Publicidade</span>
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
          )}
        </section>
      ) : null}

      {abaAtiva === "auditoria" ? (
        <section aria-label="Trilha de auditoria" className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-marfim-200 bg-white shadow-xs">
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
        aoAbrirAjustePlano={(org) => abrirModalAjustarPlano(org)}
        aoAbrirAlterarSituacao={(org) => {
          setModalAcao({ tipo: "situacao", organizacao: org });
          setNovaSituacao(org.situacao);
        }}
        aoAbrirPerfilPublicidade={(org) => setOrganizacaoPerfil(org)}
      />

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

      {modalAcao ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mineral-950/60 p-4">
          <CartaoSuperficie className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-xl">
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
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-mineral-800"
                  >
                    <span>Novo Código do Plano</span>
                    <TooltipInformativo
                      alinhamento="esquerda"
                      texto="Define a faixa comercial, o valor no MRR e os limites padrão de profissionais ativos e envios de e-mail por mês."
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
