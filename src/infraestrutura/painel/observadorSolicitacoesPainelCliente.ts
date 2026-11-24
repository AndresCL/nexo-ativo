import type { PortaObservacaoDeltaColecao } from "@/aplicacao/portas/portasReatividade";
import type { SolicitacaoComercial } from "@/dominio/entidades/solicitacaoComercial";
import { ObservadorDeltaColecaoFirestore } from "@/infraestrutura/firebase/observadorDeltaColecaoFirestore";
import { esquemaSolicitacaoComercial } from "@/validacoes/esquemaSolicitacaoComercial";

function converterDocumentoSolicitacao(dadosBrutos: unknown): SolicitacaoComercial | null {
  const validacao = esquemaSolicitacaoComercial.safeParse(dadosBrutos);
  return validacao.success ? validacao.data : null;
}

export const observadorSolicitacoesPainelCliente: PortaObservacaoDeltaColecao<SolicitacaoComercial> =
  new ObservadorDeltaColecaoFirestore<SolicitacaoComercial>({
    nomeSubcolecao: "solicitacoes",
    converterDocumento: converterDocumentoSolicitacao,
  });

