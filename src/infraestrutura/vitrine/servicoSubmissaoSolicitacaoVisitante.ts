import { httpsCallable } from "firebase/functions";
import type {
  PortaSubmissaoSolicitacaoVisitante,
  ResultadoSubmissaoSolicitacaoVisitante,
} from "@/aplicacao/portas/portasSolicitacoesComerciais";
import { gerarChaveIdempotenciaSolicitacao } from "@/dominio/entidades/solicitacaoComercial";
import { obterServicosClienteFirebase } from "@/infraestrutura/firebase/clienteFirebase";
import type { DadosSubmissaoPublicaSolicitacao } from "@/validacoes/esquemaSolicitacaoComercial";

export class ServicoSubmissaoSolicitacaoVisitanteFirebase implements PortaSubmissaoSolicitacaoVisitante {
  public async enviarSolicitacaoVisitante(
    dados: DadosSubmissaoPublicaSolicitacao,
  ): Promise<ResultadoSubmissaoSolicitacaoVisitante> {
    const chaveFallback =
      dados.chaveIdempotencia ??
      gerarChaveIdempotenciaSolicitacao({
        organizacaoId: dados.organizacaoId,
        microfluxoId: dados.microfluxoId,
        telefoneOuWhatsapp: dados.telefoneOuWhatsapp,
        ...(dados.servicoId ? { servicoId: dados.servicoId } : {}),
        ...(dados.produtoId ? { produtoId: dados.produtoId } : {}),
      });

    const { funcoesRemotas } = obterServicosClienteFirebase();
    const chamarRegistro = httpsCallable<
      DadosSubmissaoPublicaSolicitacao,
      ResultadoSubmissaoSolicitacaoVisitante
    >(funcoesRemotas, "registrarSolicitacaoVisitante");

    const resposta = await chamarRegistro({
      ...dados,
      chaveIdempotencia: chaveFallback,
    });

    return resposta.data;
  }
}

export const servicoSubmissaoSolicitacaoVisitantePadrao: PortaSubmissaoSolicitacaoVisitante =
  new ServicoSubmissaoSolicitacaoVisitanteFirebase();
