import { obterPoliticaPublicidade } from "@/dominio/publicidade/registroPoliticasPublicidade";
import { CATALOGO_PLANOS_FLUXO } from "@/dominio/assinaturas/tiposAssinaturaAsaas";
import type {
  Organizacao,
  RegistroAuditoria,
  UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import {
  CODIGOS_ETAPA_KANBAN_FUNDADOR,
  type AcompanhamentoOrganizacaoFundador,
  type EtapaKanbanOrganizacaoFundador,
  type ItemVisaoGeralOrganizacaoFundador,
  type MensagemKanbanFundador,
  type MetricasOperacionaisFundador,
} from "@/dominio/fundador/tiposPainelFundador";
import { exigirPrivilegioFundador } from "@/dominio/permissoes/autorizadorOrganizacao";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";

export interface ContextoPainelFundadorServidor {
  readonly metricas: MetricasOperacionaisFundador;
  readonly organizacoes: readonly ItemVisaoGeralOrganizacaoFundador[];
  readonly auditoriaRecente: readonly RegistroAuditoria[];
}

function normalizarEtapaKanban(valor: unknown): EtapaKanbanOrganizacaoFundador {
  if (
    typeof valor === "string" &&
    (CODIGOS_ETAPA_KANBAN_FUNDADOR as readonly string[]).includes(valor)
  ) {
    return valor as EtapaKanbanOrganizacaoFundador;
  }
  return "onboarding";
}

function normalizarMensagensKanban(valor: unknown): readonly MensagemKanbanFundador[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).id === "string" &&
        typeof (item as Record<string, unknown>).texto === "string" &&
        typeof (item as Record<string, unknown>).criadoEmIso === "string",
    )
    .map((item) => ({
      id: String(item.id),
      texto: String(item.texto),
      ...(typeof item.autorEmail === "string" ? { autorEmail: item.autorEmail } : {}),
      criadoEmIso: String(item.criadoEmIso),
    }));
}

function extrairMensagemDeRegistroAuditoria(
  registro: RegistroAuditoria,
): MensagemKanbanFundador | null {
  const detalhes = registro.detalhes;
  if (!detalhes || typeof detalhes !== "object") {
    return null;
  }

  const justificativa =
    typeof detalhes.justificativa === "string" ? detalhes.justificativa.trim() : "";
  if (!justificativa) {
    return null;
  }

  let prefixo = "Auditoria";
  if (registro.acao === "fundador_ajustou_plano_organizacao") {
    const plano = typeof detalhes.novoPlanoCodigo === "string" ? detalhes.novoPlanoCodigo : "";
    prefixo = plano ? `Ajuste de plano (${plano})` : "Ajuste de plano";
  } else if (registro.acao === "fundador_alterou_situacao_organizacao") {
    const sit = typeof detalhes.novaSituacao === "string" ? detalhes.novaSituacao : "";
    prefixo = sit ? `Situação alterada (${sit})` : "Situação alterada";
  } else if (registro.acao === "fundador_definiu_perfil_publicidade_organizacao") {
    const perf = typeof detalhes.novoPerfil === "string" ? detalhes.novoPerfil : "";
    prefixo = perf ? `Perfil de publicidade (${perf})` : "Perfil de publicidade";
  }

  return {
    id: `aud-${registro.id}`,
    texto: `[${prefixo}] ${justificativa}`,
    criadoEmIso:
      typeof registro.criadoEmIso === "string" ? registro.criadoEmIso : new Date().toISOString(),
  };
}

export async function carregarContextoPainelFundadorServidor(
  fundador: UsuarioAutenticado,
): Promise<ContextoPainelFundadorServidor> {
  exigirPrivilegioFundador(fundador);

  const { bancoDadosAdmin } = obterServicosAdminFirebase();

  const [snapOrganizacoes, snapAuditoria, snapAcompanhamentos] = await Promise.all([
    bancoDadosAdmin.collection("organizacoes").get(),
    bancoDadosAdmin.collection("registrosAuditoria").orderBy("criadoEmIso", "desc").limit(100).get(),
    bancoDadosAdmin.collection("acompanhamentoFundador").get(),
  ]);

  const auditoriaRecente: RegistroAuditoria[] = [];
  const mensagensAuditoriaPorOrg = new Map<string, MensagemKanbanFundador[]>();

  for (const doc of snapAuditoria.docs) {
    const reg = doc.data() as RegistroAuditoria;
    auditoriaRecente.push(reg);

    if (reg.organizacaoAlvoId) {
      const msgAuditoria = extrairMensagemDeRegistroAuditoria(reg);
      if (msgAuditoria) {
        const listaAtual = mensagensAuditoriaPorOrg.get(reg.organizacaoAlvoId) ?? [];
        listaAtual.push(msgAuditoria);
        mensagensAuditoriaPorOrg.set(reg.organizacaoAlvoId, listaAtual);
      }
    }
  }

  const acompanhamentosPorOrg = new Map<string, AcompanhamentoOrganizacaoFundador>();
  for (const docAcomp of snapAcompanhamentos.docs) {
    const bruto = docAcomp.data() as Record<string, unknown>;
    acompanhamentosPorOrg.set(docAcomp.id, {
      organizacaoId: docAcomp.id,
      etapaKanban: normalizarEtapaKanban(bruto.etapaKanban),
      mensagens: normalizarMensagensKanban(bruto.mensagens),
      atualizadoEmIso:
        typeof bruto.atualizadoEmIso === "string"
          ? bruto.atualizadoEmIso
          : new Date().toISOString(),
    });
  }

  let totalOrganizacoes = 0;
  let organizacoesAtivas = 0;
  let organizacoesSuspensas = 0;
  let assinaturasAtivas = 0;
  let assinaturasInadimplentes = 0;
  let assinaturasCanceladas = 0;
  let receitaMensalRecorrenteCentavos = 0;
  const totalSolicitacoesComerciais = 0;

  const listaOrganizacoes: ItemVisaoGeralOrganizacaoFundador[] = [];

  for (const doc of snapOrganizacoes.docs) {
    const dados = doc.data() as Partial<Organizacao>;
    if (!dados.nome && !dados.identificadorPublico) {
      continue;
    }

    const orgId = dados.id || doc.id;
    const situacaoOrg = dados.situacao ?? "ativa";
    totalOrganizacoes += 1;

    if (situacaoOrg === "ativa") {
      organizacoesAtivas += 1;
    } else if (situacaoOrg === "suspensa") {
      organizacoesSuspensas += 1;
    }

    const situacaoAssinatura = dados.resumoDireitosPlano?.situacaoAssinatura;
    const planoCodigo = dados.resumoDireitosPlano?.planoCodigo;

    if (situacaoAssinatura === "ativa" && planoCodigo) {
      assinaturasAtivas += 1;
      const planoDef = CATALOGO_PLANOS_FLUXO[planoCodigo];
      if (planoDef) {
        receitaMensalRecorrenteCentavos += planoDef.mensalidadeCentavos;
      }
    } else if (situacaoAssinatura === "inadimplente") {
      assinaturasInadimplentes += 1;
    } else if (situacaoAssinatura === "cancelada") {
      assinaturasCanceladas += 1;
    }

    const acompanhamento = acompanhamentosPorOrg.get(orgId);
    const msgsManuais = acompanhamento?.mensagens ?? [];
    const msgsAuditoria = mensagensAuditoriaPorOrg.get(orgId) ?? [];
    const idsExistentes = new Set(msgsManuais.map((m) => m.id));
    const mensagensMescladas = [
      ...msgsManuais,
      ...msgsAuditoria.filter((m) => !idsExistentes.has(m.id)),
    ].sort((a, b) => a.criadoEmIso.localeCompare(b.criadoEmIso));

    const criadoEmIso = typeof dados.criadoEmIso === "string" ? dados.criadoEmIso : "";
    const atualizadoEmIso =
      typeof dados.atualizadoEmIso === "string" ? dados.atualizadoEmIso : criadoEmIso;

    listaOrganizacoes.push({
      id: orgId,
      nome: dados.nome ?? orgId,
      identificadorPublico: dados.identificadorPublico ?? orgId,
      segmentoAtividade: dados.segmentoAtividade ?? "",
      perfilPublicidade: obterPoliticaPublicidade(dados.perfilPublicidade).codigo,
      situacao: situacaoOrg,
      planoCodigo: dados.resumoDireitosPlano?.planoCodigo ?? "avaliacao_inicial",
      situacaoAssinatura: dados.resumoDireitosPlano?.situacaoAssinatura ?? "pendente_contratacao",
      limiteProfissionaisAtivos: dados.resumoDireitosPlano?.limiteProfissionaisAtivos ?? 10,
      limiteEnviosEmailMensal: dados.resumoDireitosPlano?.limiteEnviosEmailMensal ?? 300,
      totalMembros: 1, // Projeção padrão inicial
      etapaKanban: acompanhamento?.etapaKanban ?? "onboarding",
      mensagensKanban: mensagensMescladas,
      criadoEmIso,
      atualizadoEmIso,
    });
  }

  listaOrganizacoes.sort((a, b) => (b.criadoEmIso ?? "").localeCompare(a.criadoEmIso ?? ""));

  const metricas: MetricasOperacionaisFundador = {
    totalOrganizacoes,
    organizacoesAtivas,
    organizacoesSuspensas,
    assinaturasAtivas,
    assinaturasInadimplentes,
    assinaturasCanceladas,
    receitaMensalRecorrenteCentavos,
    totalSolicitacoesComerciais,
  };

  return {
    metricas,
    organizacoes: listaOrganizacoes,
    auditoriaRecente,
  };
}
