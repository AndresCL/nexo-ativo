import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { TipoEventoTelemetriaAnonima } from "../../../src/dominio/analytics/tiposMetricasAgregadas";
import { ErroValidacaoDominio } from "../../../src/dominio/erros/errosDominio";
import { esquemaRegistroEventoAnonimo } from "../../../src/validacoes/esquemasTelemetriaAnonima";

const CAMPO_POR_EVENTO: Readonly<Record<TipoEventoTelemetriaAnonima, string>> = {
  visualizacao_vitrine: "visualizacoesVitrine",
  visualizacao_cartao: "visualizacoesCartao",
  clique_acao_home: "cliquesAcoesHome",
  abertura_microfluxo: "aberturasMicrofluxo",
  conclusao_microfluxo: "conclusoesMicrofluxo",
  clique_whatsapp: "cliquesWhatsapp",
  clique_ligacao: "cliquesLigacao",
};

/**
 * Registra o incremento atômico de uma métrica diária agregada sem reter
 * nenhum endereço IP, cookie de rastreamento ou informação de visitante.
 */
export async function executarRegistroEventoAgregadoAnonimo(
  bancoDados: Firestore,
  entradaBruta: unknown,
): Promise<{ registrado: boolean; dataIso: string }> {
  const validacao = esquemaRegistroEventoAnonimo.safeParse(entradaBruta);
  if (!validacao.success) {
    throw new ErroValidacaoDominio("Dados de telemetria inválidos.", "TELEMETRIA_INVALIDA");
  }

  const {
    organizacaoId,
    tipoEvento,
    canalOrigem,
    cartaoProfissionalId,
    cartaoProfissionalNome,
    acaoHomeId,
    acaoHomeRotulo,
    microfluxoId,
    microfluxoTitulo,
    profissionalId,
    profissionalNome,
  } = validacao.data;
  const hojeDataIso = new Date().toISOString().split("T")[0]!;
  const agoraIso = new Date().toISOString();

  const refMetrica = bancoDados
    .collection("organizacoes")
    .doc(organizacaoId)
    .collection("metricasDiarias")
    .doc(hojeDataIso);

  const campoIncrementar = CAMPO_POR_EVENTO[tipoEvento];
  const payloadAtualizacao: Record<string, unknown> = {
    dataIso: hojeDataIso,
    [campoIncrementar]: FieldValue.increment(1),
    atualizadoEmIso: agoraIso,
  };

  // Atribuição de Canal de Origem
  if (canalOrigem) {
    const dadosCanal: Record<string, unknown> = {};
    if (tipoEvento === "visualizacao_vitrine" || tipoEvento === "visualizacao_cartao") {
      dadosCanal.visualizacoes = FieldValue.increment(1);
    } else if (tipoEvento === "clique_acao_home") {
      dadosCanal.cliquesAcoesHome = FieldValue.increment(1);
    } else if (tipoEvento === "abertura_microfluxo") {
      dadosCanal.aberturasFluxo = FieldValue.increment(1);
    } else if (tipoEvento === "clique_whatsapp") {
      dadosCanal.contatosWhatsapp = FieldValue.increment(1);
    }
    payloadAtualizacao.porCanal = {
      [canalOrigem]: dadosCanal,
    };
  }

  // Atribuição de Cartão VIP de Colaborador
  if (cartaoProfissionalId) {
    const seguroCartaoId = cartaoProfissionalId.replace(/[./#$\[\]]/g, "_");
    const dadosCartao: Record<string, unknown> = {};
    if (cartaoProfissionalNome) {
      dadosCartao.nome = cartaoProfissionalNome;
    }
    if (tipoEvento === "visualizacao_cartao") {
      dadosCartao.visualizacoes = FieldValue.increment(1);
    } else if (tipoEvento === "clique_acao_home") {
      dadosCartao.cliquesAcoesHome = FieldValue.increment(1);
    } else if (tipoEvento === "abertura_microfluxo") {
      dadosCartao.fluxosIniciados = FieldValue.increment(1);
    } else if (tipoEvento === "clique_whatsapp") {
      dadosCartao.contatosWhatsapp = FieldValue.increment(1);
    }
    payloadAtualizacao.porCartao = {
      [seguroCartaoId]: dadosCartao,
    };
  }

  // Cliques em Botões Específicos da Home
  if (acaoHomeId) {
    const seguroAcao = acaoHomeId.replace(/[./#$\[\]]/g, "_");
    const dadosAcao: Record<string, unknown> = {
      cliques: FieldValue.increment(1),
    };
    if (acaoHomeRotulo) {
      dadosAcao.rotulo = acaoHomeRotulo;
    }
    payloadAtualizacao.porAcaoHome = {
      [seguroAcao]: dadosAcao,
    };
  }

  // Métricas por Microfluxo individual
  if (microfluxoId) {
    const seguroId = microfluxoId.replace(/[./#$\[\]]/g, "_");
    const dadosMicro: Record<string, unknown> = {};
    if (tipoEvento === "abertura_microfluxo") {
      dadosMicro.aberturas = FieldValue.increment(1);
      if (canalOrigem === "permalink") dadosMicro.aberturasPermalink = FieldValue.increment(1);
    } else if (tipoEvento === "conclusao_microfluxo") {
      dadosMicro.conclusoes = FieldValue.increment(1);
    }
    if (microfluxoTitulo) {
      dadosMicro.titulo = microfluxoTitulo;
    }
    payloadAtualizacao.porMicrofluxo = {
      [seguroId]: dadosMicro,
    };
  }

  // Métricas por Profissional selecionado
  if (profissionalId) {
    const seguroId = profissionalId.replace(/[./#$\[\]]/g, "_");
    const dadosProf: Record<string, unknown> = {};
    if (tipoEvento === "clique_whatsapp" || tipoEvento === "clique_ligacao") {
      dadosProf.contatos = FieldValue.increment(1);
    } else if (tipoEvento === "conclusao_microfluxo") {
      dadosProf.solicitacoes = FieldValue.increment(1);
    }
    if (profissionalNome) {
      dadosProf.nome = profissionalNome;
    }
    payloadAtualizacao.porProfissional = {
      [seguroId]: dadosProf,
    };
  }

  await refMetrica.set(payloadAtualizacao, { merge: true });

  return {
    registrado: true,
    dataIso: hojeDataIso,
  };
}
