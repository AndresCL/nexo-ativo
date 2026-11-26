import { httpsCallable } from "firebase/functions";
import type {
  PortaAgendamentoVisitante,
  ResultadoSubmissaoAgendamentoVisitante,
} from "@/aplicacao/portas/portasAgenda";
import type { RespostaDisponibilidadeAgendaPublica } from "@/dominio/agenda/tiposAgenda";
import { gerarChaveIdempotenciaAgendamento } from "@/dominio/agenda/validadorReservaAgenda";
import { obterFuncoesClienteFirebase } from "@/infraestrutura/firebase/clienteFuncoesFirebase";
import type {
  DadosConsultaDisponibilidadeAgenda,
  DadosSubmissaoAgendamentoVisitante,
} from "@/validacoes/esquemasAgenda";

export class ServicoAgendamentoVisitanteFirebase implements PortaAgendamentoVisitante {
  public async consultarDisponibilidade(
    dados: DadosConsultaDisponibilidadeAgenda,
  ): Promise<RespostaDisponibilidadeAgendaPublica> {
    const funcoesRemotas = obterFuncoesClienteFirebase();
    const chamar = httpsCallable<
      DadosConsultaDisponibilidadeAgenda,
      RespostaDisponibilidadeAgendaPublica
    >(funcoesRemotas, "consultarDisponibilidadeAgendaPublica");

    const resposta = await chamar(dados);
    return resposta.data;
  }

  public async registrarAgendamento(
    dados: DadosSubmissaoAgendamentoVisitante,
  ): Promise<ResultadoSubmissaoAgendamentoVisitante> {
    const chaveFallback =
      dados.chaveIdempotencia ??
      gerarChaveIdempotenciaAgendamento({
        organizacaoId: dados.organizacaoId,
        dataIso: dados.dataIso,
        horarioInicio: dados.horarioInicio,
        emailVisitante: dados.emailVisitante,
      });

    const funcoesRemotas = obterFuncoesClienteFirebase();
    const chamar = httpsCallable<
      DadosSubmissaoAgendamentoVisitante,
      ResultadoSubmissaoAgendamentoVisitante
    >(funcoesRemotas, "registrarAgendamentoVisitante");

    const resposta = await chamar({
      ...dados,
      chaveIdempotencia: chaveFallback,
    });
    return resposta.data;
  }
}

export const servicoAgendamentoVisitantePadrao: PortaAgendamentoVisitante =
  new ServicoAgendamentoVisitanteFirebase();

