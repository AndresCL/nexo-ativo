import { httpsCallable } from "firebase/functions";
import { obterServicosClienteFirebase } from "@/infraestrutura/firebase/clienteFirebase";
import type { DadosSolicitacaoCriarAssinatura } from "@/validacoes/esquemasAssinaturaAsaas";

export interface ResultadoCriacaoAssinaturaCliente {
  readonly assinaturaId: string;
  readonly urlCheckoutOuFatura?: string;
  readonly urlFaturaImplantacao?: string;
  readonly situacao: string;
}

export interface PortaAssinaturasPainelCliente {
  criarAssinatura(
    dados: DadosSolicitacaoCriarAssinatura,
  ): Promise<ResultadoCriacaoAssinaturaCliente>;
  cancelarAssinatura(organizacaoId: string): Promise<void>;
}

export class ServicoAssinaturasPainelCliente implements PortaAssinaturasPainelCliente {
  public async criarAssinatura(
    dados: DadosSolicitacaoCriarAssinatura,
  ): Promise<ResultadoCriacaoAssinaturaCliente> {
    const { funcoesRemotas } = obterServicosClienteFirebase();
    const chamada = httpsCallable<
      DadosSolicitacaoCriarAssinatura,
      ResultadoCriacaoAssinaturaCliente
    >(funcoesRemotas, "criarAssinaturaAsaas");

    const resposta = await chamada(dados);
    return resposta.data;
  }

  public async cancelarAssinatura(organizacaoId: string): Promise<void> {
    const { funcoesRemotas } = obterServicosClienteFirebase();
    const chamada = httpsCallable<{ readonly organizacaoId: string }, unknown>(
      funcoesRemotas,
      "cancelarAssinaturaAsaas",
    );
    await chamada({ organizacaoId });
  }
}

export const servicoAssinaturasPainelCliente: PortaAssinaturasPainelCliente =
  new ServicoAssinaturasPainelCliente();
