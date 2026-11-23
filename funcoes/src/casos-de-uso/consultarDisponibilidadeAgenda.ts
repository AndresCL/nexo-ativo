import type { Firestore } from "firebase-admin/firestore";
import {
  adicionarDiasDataIso,
  obterDataHoraAtualNoFuso,
} from "../../../src/dominio/agenda/calendarioDatas";
import {
  encontrarProximoDiaDisponivel,
  gerarDisponibilidadeMensal,
} from "../../../src/dominio/agenda/geradorHorariosDisponiveis";
import {
  criarConfiguracaoAgendaPadrao,
  type ConfiguracaoAgendaOrganizacao,
  type ControleAgendaDiaria,
  type IntervaloOcupadoDia,
  type RespostaDisponibilidadeAgendaPublica,
} from "../../../src/dominio/agenda/tiposAgenda";
import { ErroValidacaoDominio } from "../../../src/dominio/erros/errosDominio";
import { esquemaConsultaDisponibilidadeAgenda } from "../../../src/validacoes/esquemasAgenda";

/**
 * Consulta pública (sem expor PII) da disponibilidade de uma agenda para um mês ("YYYY-MM").
 * Lê `configuracoes/agenda` e apenas os documentos de `controleAgendaDiaria` correspondentes
 * às datas abertas, calculando os horários livres com o serviço puro de domínio.
 */
export async function executarConsultaDisponibilidadeAgenda(
  bancoDados: Firestore,
  entradaBruta: unknown,
  agora: Date = new Date(),
): Promise<RespostaDisponibilidadeAgendaPublica> {
  const validacao = esquemaConsultaDisponibilidadeAgenda.safeParse(entradaBruta);
  if (!validacao.success) {
    throw new ErroValidacaoDominio(
      validacao.error.issues[0]?.message ?? "Parâmetros inválidos para consulta de disponibilidade.",
      "CONSULTA_AGENDA_INVALIDA",
    );
  }

  const { organizacaoId, anoMes } = validacao.data;

  const refPaginaPublicada = bancoDados.collection("paginasPublicadas").doc(organizacaoId);
  const refConfigAgenda = bancoDados
    .collection("organizacoes")
    .doc(organizacaoId)
    .collection("configuracoes")
    .doc("agenda");

  const [docPagina, docConfig] = await Promise.all([
    refPaginaPublicada.get(),
    refConfigAgenda.get(),
  ]);

  const paginaAtiva =
    docPagina.exists &&
    docPagina.data()?.publicado === true &&
    docPagina.data()?.paginaAtiva === true;

  if (!paginaAtiva) {
    return {
      agendaAtiva: false,
      fusoHorario: "America/Sao_Paulo",
      duracaoSlotMinutos: 60,
      anoMes,
      diasDisponiveis: [],
    };
  }

  const configuracao: ConfiguracaoAgendaOrganizacao = docConfig.exists
    ? {
        ...criarConfiguracaoAgendaPadrao(organizacaoId),
        ...(docConfig.data() as Partial<ConfiguracaoAgendaOrganizacao>),
        organizacaoId,
      }
    : {
        ...criarConfiguracaoAgendaPadrao(organizacaoId),
        ativo: false,
      };

  if (!configuracao.ativo) {
    return {
      agendaAtiva: false,
      fusoHorario: configuracao.fusoHorario,
      duracaoSlotMinutos: configuracao.duracaoSlotMinutos,
      anoMes,
      diasDisponiveis: [],
    };
  }

  const hojeLocal = obterDataHoraAtualNoFuso(agora, configuracao.fusoHorario).dataIso;
  const limiteLocal = adicionarDiasDataIso(hojeLocal, configuracao.janelaMaximaDias);

  const datasRelevantes = Object.keys(configuracao.datasAbertas)
    .filter((dataIso) => dataIso >= hojeLocal && dataIso <= limiteLocal)
    .sort();

  const ocupacaoPorData: Record<string, readonly IntervaloOcupadoDia[]> = {};

  if (datasRelevantes.length > 0) {
    const colecaoControle = bancoDados
      .collection("organizacoes")
      .doc(organizacaoId)
      .collection("controleAgendaDiaria");

    const docsControle = await Promise.all(
      datasRelevantes.map((dataIso) => colecaoControle.doc(dataIso).get()),
    );

    for (let i = 0; i < datasRelevantes.length; i += 1) {
      const dataIso = datasRelevantes[i]!;
      const doc = docsControle[i];
      if (doc?.exists) {
        const controle = doc.data() as Partial<ControleAgendaDiaria>;
        ocupacaoPorData[dataIso] = Array.isArray(controle.intervalosOcupados)
          ? controle.intervalosOcupados
          : [];
      }
    }
  }

  const diasDisponiveis = gerarDisponibilidadeMensal({
    configuracao,
    anoMes,
    ocupacaoPorData,
    agora,
  });

  const proximoDiaDisponivelOpcional =
    diasDisponiveis[0]?.dataIso ??
    encontrarProximoDiaDisponivel({
      configuracao,
      ocupacaoPorData,
      agora,
    });

  return {
    agendaAtiva: true,
    fusoHorario: configuracao.fusoHorario,
    duracaoSlotMinutos: configuracao.duracaoSlotMinutos,
    anoMes,
    diasDisponiveis,
    ...(proximoDiaDisponivelOpcional ? { proximoDiaDisponivelOpcional } : {}),
  };
}

