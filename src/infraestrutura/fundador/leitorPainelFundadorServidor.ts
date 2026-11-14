import { obterPoliticaPublicidade } from "@/dominio/publicidade/registroPoliticasPublicidade";
import { CATALOGO_PLANOS_FLUXO } from "@/dominio/assinaturas/tiposAssinaturaAsaas";
import type {
  Organizacao,
  RegistroAuditoria,
  UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import type {
  ItemVisaoGeralOrganizacaoFundador,
  MetricasOperacionaisFundador,
} from "@/dominio/fundador/tiposPainelFundador";
import { exigirPrivilegioFundador } from "@/dominio/permissoes/autorizadorOrganizacao";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";

export interface ContextoPainelFundadorServidor {
  readonly metricas: MetricasOperacionaisFundador;
  readonly organizacoes: readonly ItemVisaoGeralOrganizacaoFundador[];
  readonly auditoriaRecente: readonly RegistroAuditoria[];
}

export async function carregarContextoPainelFundadorServidor(
  fundador: UsuarioAutenticado,
): Promise<ContextoPainelFundadorServidor> {
  exigirPrivilegioFundador(fundador);

  const { bancoDadosAdmin } = obterServicosAdminFirebase();

  const [snapOrganizacoes, snapAuditoria] = await Promise.all([
    bancoDadosAdmin.collection("organizacoes").get(),
    bancoDadosAdmin.collection("registrosAuditoria").orderBy("criadoEmIso", "desc").limit(50).get(),
  ]);

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
    const dados = doc.data() as Organizacao;
    totalOrganizacoes += 1;

    if (dados.situacao === "ativa") {
      organizacoesAtivas += 1;
    } else if (dados.situacao === "suspensa") {
      organizacoesSuspensas += 1;
    }

    const situacaoAssinatura = dados.resumoDireitosPlano?.situacaoAssinatura;
    const planoCodigo = dados.resumoDireitosPlano?.planoCodigo;

    if (situacaoAssinatura === "ativa") {
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

    listaOrganizacoes.push({
      id: dados.id,
      nome: dados.nome,
      identificadorPublico: dados.identificadorPublico,
      segmentoAtividade: dados.segmentoAtividade,
      perfilPublicidade: obterPoliticaPublicidade(dados.perfilPublicidade).codigo,
      situacao: dados.situacao,
      planoCodigo: dados.resumoDireitosPlano?.planoCodigo ?? "avaliacao_inicial",
      situacaoAssinatura: dados.resumoDireitosPlano?.situacaoAssinatura ?? "pendente_contratacao",
      totalMembros: 1, // Projeção padrão inicial
      criadoEmIso: dados.criadoEmIso,
      atualizadoEmIso: dados.atualizadoEmIso,
    });
  }

  listaOrganizacoes.sort((a, b) => b.criadoEmIso.localeCompare(a.criadoEmIso));

  const auditoriaRecente: RegistroAuditoria[] = [];
  for (const doc of snapAuditoria.docs) {
    auditoriaRecente.push(doc.data() as RegistroAuditoria);
  }

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
