import { doc, setDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import type {
  PortaAgendaPainel,
  ResultadoAtualizacaoSituacaoAgendamentoCliente,
} from "@/aplicacao/portas/portasAgenda";
import type {
  ConfiguracaoAgendaOrganizacao,
  SituacaoAgendamento,
} from "@/dominio/agenda/tiposAgenda";
import { podarDatasAbertasPassadas } from "@/dominio/agenda/validadorReservaAgenda";
import { obterServicosClienteFirebase } from "@/infraestrutura/firebase/clienteFirebase";
import {
  esquemaConfiguracaoAgendaOrganizacao,
  type DadosAtualizacaoSituacaoAgendamento,
} from "@/validacoes/esquemasAgenda";

export class ServicoAgendaPainelFirebase implements PortaAgendaPainel {
  public async salvarConfiguracaoAgenda(
    configuracao: ConfiguracaoAgendaOrganizacao,
  ): Promise<ConfiguracaoAgendaOrganizacao> {
    const agoraIso = new Date().toISOString();
    const datasPodadas = podarDatasAbertasPassadas(
      configuracao.datasAbertas,
      configuracao.fusoHorario,
      7,
    );

    const validada = esquemaConfiguracaoAgendaOrganizacao.parse({
      ...configuracao,
      datasAbertas: datasPodadas,
      atualizadoEmIso: agoraIso,
    });

    const { bancoDados } = obterServicosClienteFirebase();
    const refDoc = doc(bancoDados, "organizacoes", validada.organizacaoId, "configuracoes", "agenda");
    await setDoc(refDoc, validada);
    return validada;
  }

  public async atualizarSituacaoAgendamento(parametros: {
    readonly organizacaoId: string;
    readonly agendamentoId: string;
    readonly situacao: SituacaoAgendamento;
    readonly observacoesInternas?: string;
  }): Promise<ResultadoAtualizacaoSituacaoAgendamentoCliente> {
    const { funcoesRemotas } = obterServicosClienteFirebase();
    const chamar = httpsCallable<
      DadosAtualizacaoSituacaoAgendamento,
      ResultadoAtualizacaoSituacaoAgendamentoCliente
    >(funcoesRemotas, "atualizarSituacaoAgendamento");

    const resposta = await chamar(parametros);
    return resposta.data;
  }
}

export const servicoAgendaPainelCliente: PortaAgendaPainel = new ServicoAgendaPainelFirebase();

