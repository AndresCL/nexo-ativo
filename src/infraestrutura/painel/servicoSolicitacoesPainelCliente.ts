import { doc, setDoc, updateDoc } from "firebase/firestore";
import type {
  ParametrosAtualizacaoAndamentoSolicitacao,
  PortaGerenciamentoSolicitacoesPainel,
} from "@/aplicacao/portas/portasSolicitacoesComerciais";
import type { ConfiguracaoEmailOrganizacao } from "@/dominio/email/tiposEmailTransacional";
import { obterServicosClienteFirebase } from "@/infraestrutura/firebase/clienteFirebase";
import { esquemaConfiguracaoEmailOrganizacao } from "@/validacoes/esquemaConfiguracaoEmail";
import { esquemaSituacaoSolicitacaoComercial } from "@/validacoes/esquemaSolicitacaoComercial";

export class ServicoSolicitacoesPainelCliente implements PortaGerenciamentoSolicitacoesPainel {
  public async atualizarAndamentoSolicitacao(
    parametros: ParametrosAtualizacaoAndamentoSolicitacao,
  ): Promise<void> {
    const situacaoValidada = esquemaSituacaoSolicitacaoComercial.parse(parametros.situacao);
    const { bancoDados } = obterServicosClienteFirebase();

    const refSolicitacao = doc(
      bancoDados,
      "organizacoes",
      parametros.organizacaoId,
      "solicitacoes",
      parametros.solicitacaoId,
    );

    const camposPermitidosPelasRegras: Record<string, unknown> = {
      situacao: situacaoValidada,
      atualizadoEmIso: new Date().toISOString(),
    };

    if (parametros.observacoesInternas !== undefined) {
      camposPermitidosPelasRegras.observacoesInternas = parametros.observacoesInternas.trim();
    }

    if (parametros.profissionalId !== undefined) {
      camposPermitidosPelasRegras.profissionalId = parametros.profissionalId;
    }

    await updateDoc(refSolicitacao, camposPermitidosPelasRegras);
  }

  public async salvarConfiguracaoEmailOrganizacao(
    configuracao: ConfiguracaoEmailOrganizacao,
  ): Promise<void> {
    const validada = esquemaConfiguracaoEmailOrganizacao.parse(configuracao);
    const { bancoDados } = obterServicosClienteFirebase();

    const refConfigEmail = doc(
      bancoDados,
      "organizacoes",
      validada.organizacaoId,
      "configuracoes",
      "email",
    );

    // Grava de forma estrita sem 'enviosNoMesAtual' para cumprir as regras de segurança
    const payloadSeguro = {
      organizacaoId: validada.organizacaoId,
      notificarEquipeNovasSolicitacoes: validada.notificarEquipeNovasSolicitacoes,
      emailsDestinatariosEquipe: [...validada.emailsDestinatariosEquipe],
      enviarConfirmacaoVisitante: validada.enviarConfirmacaoVisitante,
      ...(validada.emailRespostaOpcional
        ? { emailRespostaOpcional: validada.emailRespostaOpcional }
        : {}),
      atualizadoEmIso: new Date().toISOString(),
    };

    await setDoc(refConfigEmail, payloadSeguro, { merge: true });
  }
}

export const servicoSolicitacoesPainelCliente: PortaGerenciamentoSolicitacoesPainel =
  new ServicoSolicitacoesPainelCliente();
