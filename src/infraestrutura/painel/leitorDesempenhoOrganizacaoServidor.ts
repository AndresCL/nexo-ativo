import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";
import type {
  MetricasDiariasOrganizacao,
  ResumoMetricasPeriodo,
} from "@/dominio/analytics/tiposMetricasAgregadas";
import { consolidarResumoMetricas } from "@/dominio/analytics/tiposMetricasAgregadas";
import type {
  MembroOrganizacao,
  Organizacao,
  UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import { esquemaProfissionalEquipe } from "@/validacoes/esquemasCatalogoConteudo";
import { verificarPermissaoOrganizacao } from "@/dominio/permissoes/autorizadorOrganizacao";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";

export interface ItemExperienciaPainel {
  readonly id: string;
  readonly titulo: string;
  readonly etapas?: readonly { readonly id: string; readonly titulo: string }[];
}

export interface ContextoDesempenhoOrganizacaoServidor {
  readonly organizacao: Organizacao;
  readonly resumoMetricas: ResumoMetricasPeriodo;
  readonly profissionais: readonly ProfissionalEquipe[];
  readonly experiencias: readonly ItemExperienciaPainel[];
  readonly podeVisualizarPainel: boolean;
}

/**
 * Reconstrói um registro diário consolidado a partir do documento bruto do Firestore.
 * Converte propriedades salvas tanto em formato aninhado quanto em notação de ponto plano
 * gerada por operações set(..., { merge: true }).
 */
function reconstruirMetricasDiariasDeDocFirestore(
  dados: Record<string, unknown>,
): MetricasDiariasOrganizacao {
  const porCanal: Record<
    string,
    {
      visualizacoes?: number;
      cliquesAcoesHome?: number;
      aberturasFluxo?: number;
      contatosWhatsapp?: number;
    }
  > = {
    ...(dados.porCanal as
      | Record<
          string,
          {
            visualizacoes?: number;
            cliquesAcoesHome?: number;
            aberturasFluxo?: number;
            contatosWhatsapp?: number;
          }
        >
      | undefined),
  };
  const porCartao: Record<
    string,
    {
      nome?: string;
      visualizacoes?: number;
      cliquesAcoesHome?: number;
      fluxosIniciados?: number;
      contatosWhatsapp?: number;
    }
  > = {
    ...(dados.porCartao as
      | Record<
          string,
          {
            nome?: string;
            visualizacoes?: number;
            cliquesAcoesHome?: number;
            fluxosIniciados?: number;
            contatosWhatsapp?: number;
          }
        >
      | undefined),
  };
  const porMicrofluxo: Record<
    string,
    {
      titulo: string;
      aberturas: number;
      conclusoes: number;
      aberturasPermalink?: number;
      porEtapa?: Record<string, number>;
    }
  > = {
    ...(dados.porMicrofluxo as
      | Record<
          string,
          {
            titulo: string;
            aberturas: number;
            conclusoes: number;
            aberturasPermalink?: number;
            porEtapa?: Record<string, number>;
          }
        >
      | undefined),
  };
  const porProfissional: Record<string, { nome: string; contatos: number; solicitacoes: number }> =
    {
      ...(dados.porProfissional as
        Record<string, { nome: string; contatos: number; solicitacoes: number }> | undefined),
    };

  for (const [chave, valor] of Object.entries(dados)) {
    if (chave.startsWith("porCanal.")) {
      const [, canal, metrica] = chave.split(".");
      if (canal && metrica) {
        const item = porCanal[canal] ?? {};
        const campo = metrica as
          "visualizacoes" | "cliquesAcoesHome" | "aberturasFluxo" | "contatosWhatsapp";
        item[campo] = (item[campo] || 0) + Number(valor || 0);
        porCanal[canal] = item;
      }
    } else if (chave.startsWith("porCartao.")) {
      const [, cartaoId, metrica] = chave.split(".");
      if (cartaoId && metrica) {
        const item = porCartao[cartaoId] ?? {};
        if (metrica === "nome") {
          item.nome = String(valor);
        } else {
          const campo = metrica as
            "visualizacoes" | "cliquesAcoesHome" | "fluxosIniciados" | "contatosWhatsapp";
          item[campo] = (item[campo] || 0) + Number(valor || 0);
        }
        porCartao[cartaoId] = item;
      }
    } else if (chave.startsWith("porProfissional.")) {
      const [, profId, metrica] = chave.split(".");
      if (profId && metrica) {
        const item = porProfissional[profId] ?? { nome: profId, contatos: 0, solicitacoes: 0 };
        if (metrica === "nome") {
          item.nome = String(valor);
        } else if (metrica === "contatos") {
          item.contatos += Number(valor || 0);
        } else if (metrica === "solicitacoes") {
          item.solicitacoes += Number(valor || 0);
        }
        porProfissional[profId] = item;
      }
    } else if (chave.startsWith("porMicrofluxo.")) {
      const partes = chave.split(".");
      const microId = partes[1];
      const metrica = partes[2];
      if (microId && metrica) {
        const item = porMicrofluxo[microId] ?? { titulo: microId, aberturas: 0, conclusoes: 0, porEtapa: {} };
        if (metrica === "titulo") {
          item.titulo = String(valor);
        } else if (metrica === "aberturas") {
          item.aberturas += Number(valor || 0);
        } else if (metrica === "conclusoes") {
          item.conclusoes += Number(valor || 0);
        } else if (metrica === "aberturasPermalink") {
          item.aberturasPermalink = (item.aberturasPermalink || 0) + Number(valor || 0);
        } else if (metrica === "porEtapa" && partes[3]) {
          const etapaId = partes[3];
          item.porEtapa = item.porEtapa ?? {};
          item.porEtapa[etapaId] = (item.porEtapa[etapaId] || 0) + Number(valor || 0);
        }
        porMicrofluxo[microId] = item;
      }
    }
  }

  return {
    dataIso: dados.dataIso as string,
    visualizacoesVitrine: Number(dados.visualizacoesVitrine || 0),
    visualizacoesCartao: Number(dados.visualizacoesCartao || 0),
    cliquesAcoesHome: Number(dados.cliquesAcoesHome || 0),
    aberturasMicrofluxo: Number(dados.aberturasMicrofluxo || 0),
    conclusoesMicrofluxo: Number(dados.conclusoesMicrofluxo || 0),
    cliquesWhatsapp: Number(dados.cliquesWhatsapp || 0),
    cliquesLigacao: Number(dados.cliquesLigacao || 0),
    ...(Object.keys(porCanal).length > 0 ? { porCanal } : {}),
    ...(dados.porQrCode
      ? {
          porQrCode: dados.porQrCode as Record<
            string,
            { visualizacoes?: number; aberturasFluxo?: number; contatosWhatsapp?: number }
          >,
        }
      : {}),
    ...(Object.keys(porCartao).length > 0 ? { porCartao } : {}),
    ...(Object.keys(porMicrofluxo).length > 0 ? { porMicrofluxo } : {}),
    ...(Object.keys(porProfissional).length > 0 ? { porProfissional } : {}),
    atualizadoEmIso: (dados.atualizadoEmIso as string) || new Date().toISOString(),
  };
}

export async function carregarContextoDesempenhoOrganizacaoServidor(
  usuario: UsuarioAutenticado,
  organizacaoId: string,
): Promise<ContextoDesempenhoOrganizacaoServidor | null> {
  const { bancoDadosAdmin } = obterServicosAdminFirebase();
  const refOrg = bancoDadosAdmin.collection("organizacoes").doc(organizacaoId);
  const refMembro = refOrg.collection("membros").doc(usuario.uid);
  const refMetricas = refOrg.collection("metricasDiarias");
  const refSolicitacoes = refOrg.collection("solicitacoes");
  const refProfissionais = refOrg.collection("profissionais");

  const [docOrg, docMembro, snapMetricas, snapSolicitacoes, snapProfissionais, snapExperiencias] =
    await Promise.all([
      refOrg.get(),
      refMembro.get(),
      refMetricas.orderBy("dataIso", "desc").limit(365).get(),
      refSolicitacoes.get(),
      refProfissionais.get(),
      refOrg.collection("microfluxos").get(),
    ]);

  if (!docOrg.exists) {
    return null;
  }

  const organizacao = docOrg.data() as Organizacao;
  const membro = docMembro.exists ? (docMembro.data() as MembroOrganizacao) : null;

  if (!verificarPermissaoOrganizacao(usuario, organizacao, membro, "visualizar_painel")) {
    return null;
  }

  const profissionais: ProfissionalEquipe[] = [];
  for (const doc of snapProfissionais.docs) {
    const validacao = esquemaProfissionalEquipe.safeParse(doc.data());
    if (validacao.success) {
      profissionais.push(validacao.data);
    }
  }
  profissionais.sort((a, b) => a.ordemExibicao - b.ordemExibicao);

  const historicoDiario: MetricasDiariasOrganizacao[] = [];
  for (const doc of snapMetricas.docs) {
    const dados = doc.data();
    if (dados.dataIso && !dados.dataIso.startsWith("email-")) {
      historicoDiario.push(reconstruirMetricasDiariasDeDocFirestore(dados));
    }
  }

  let resumoMetricas = consolidarResumoMetricas(historicoDiario, 365);

  // Inicializa mapa de profissionais com os cadastrados no banco para que nenhum fique de fora do ranking
  const mapaProfissionais = new Map<
    string,
    { nome: string; contatos: number; solicitacoes: number }
  >();
  for (const p of profissionais) {
    mapaProfissionais.set(p.id, {
      nome: p.nomeCompleto,
      contatos: 0,
      solicitacoes: 0,
    });
  }

  // Preenche com o que já foi consolidado pela telemetria
  for (const item of resumoMetricas.metricasPorProfissional) {
    const existente = mapaProfissionais.get(item.id);
    mapaProfissionais.set(item.id, {
      nome: item.nome || existente?.nome || item.id,
      contatos: (existente?.contatos || 0) + item.contatos,
      solicitacoes: (existente?.solicitacoes || 0) + item.solicitacoes,
    });
  }

  // Contabilização comercial a partir das solicitações reais (CRM)
  let totalContatosSolicitacoes = 0;
  let leadsQualificados = 0;
  let vendasConcluidas = 0;

  // Solicitações complementam a atribuição da equipe e alimentam o funil comercial de CRO
  if (snapSolicitacoes && !snapSolicitacoes.empty) {
    for (const doc of snapSolicitacoes.docs) {
      const s = doc.data();
      totalContatosSolicitacoes += 1;

      // Status comercial (CRM)
      const situacao = s.situacao as string | undefined;
      if (situacao === "concluida") {
        vendasConcluidas += 1;
        leadsQualificados += 1;
      } else if (situacao === "em_atendimento" || situacao === "proposta_enviada") {
        leadsQualificados += 1;
      }

      if (s.profissionalId || s.profissionalNome) {
        const profId = (s.profissionalId as string) || "consultor-geral";
        const profNome = (s.profissionalNome as string) || profId;
        const atualProf = mapaProfissionais.get(profId) ?? {
          nome: profNome,
          contatos: 0,
          solicitacoes: 0,
        };
        mapaProfissionais.set(profId, {
          nome: profNome,
          contatos: atualProf.contatos,
          solicitacoes: atualProf.solicitacoes + 1,
        });
      }
    }
  }

  // Re-consolida o resumo aplicando as métricas de CRO com os dados comerciais reais
  resumoMetricas = consolidarResumoMetricas(historicoDiario, 365, {
    contatosTotais:
      totalContatosSolicitacoes > 0
        ? totalContatosSolicitacoes + resumoMetricas.totalCliquesWhatsapp
        : undefined,
    leadsQualificados,
    vendasConcluidas,
  });

  const metricasPorProfissional = Array.from(mapaProfissionais.entries()).map(([id, val]) => ({
    id,
    nome: val.nome,
    contatos: val.contatos,
    solicitacoes: val.solicitacoes,
  }));

  resumoMetricas = {
    ...resumoMetricas,
    metricasPorProfissional,
  };

  return {
    organizacao,
    resumoMetricas,
    profissionais,
    experiencias: snapExperiencias.docs.flatMap((doc) => {
      const validacao = esquemaDefinicaoMicrofluxo.safeParse(doc.data());
      if (
        !validacao.success ||
        validacao.data.organizacaoId !== organizacaoId ||
        (validacao.data.tipoAcao &&
          validacao.data.tipoAcao !== "microfluxo" &&
          validacao.data.tipoAcao !== "publicacao_post")
      )
        return [];
      return [
        {
          id: validacao.data.id,
          titulo: validacao.data.titulo,
          etapas: validacao.data.etapas.map((e) => ({ id: e.id, titulo: e.titulo })),
        },
      ];
    }),
    podeVisualizarPainel: true,
  };
}
