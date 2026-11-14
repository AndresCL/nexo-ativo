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
}

export const servicoAssinaturasPainelCliente: PortaAssinaturasPainelCliente =
  new ServicoAssinaturasPainelCliente();
