import type { Firestore } from "firebase-admin/firestore";
import {
  CATALOGO_PLANOS_FLUXO,
  type CobrancaHistoricoAsaas,
  type RegistroAssinaturaAsaas,
  type RegistroClienteAsaas,
} from "../../../src/dominio/assinaturas/tiposAssinaturaAsaas";
import type {
  MembroOrganizacao,
  Organizacao,
  UsuarioAutenticado,
} from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import { ErroValidacaoDominio } from "../../../src/dominio/erros/errosDominio";
import { exigirPermissaoOrganizacao } from "../../../src/dominio/permissoes/autorizadorOrganizacao";
import { esquemaSolicitacaoCriarAssinatura } from "../../../src/validacoes/esquemasAssinaturaAsaas";
import { criarProvedorAsaasPadrao, type PortaProvedorAsaas } from "../asaas/adaptadorAsaasCliente";

export interface ResultadoCriarAssinatura {
  readonly assinaturaId: string;
  readonly urlCheckoutOuFatura?: string;
  readonly urlFaturaImplantacao?: string;
  readonly situacao: string;
}

export async function executarCriacaoAssinaturaAsaas(
  bancoDados: Firestore,
  usuario: UsuarioAutenticado,
  entradaBruta: unknown,
  provedorAsaas: PortaProvedorAsaas = criarProvedorAsaasPadrao(),
): Promise<ResultadoCriarAssinatura> {
  const validacao = esquemaSolicitacaoCriarAssinatura.safeParse(entradaBruta);
  if (!validacao.success) {
    const mensagem =
      validacao.error.issues[0]?.message ??
      "Os dados informados para contratação da assinatura são inválidos.";
    throw new ErroValidacaoDominio(mensagem, "DADOS_ASSINATURA_INVALIDOS");
  }

  const { organizacaoId, planoCodigo, contratarImplantacaoAssistida, dadosFiscais } =
    validacao.data;

  const refOrg = bancoDados.collection("organizacoes").doc(organizacaoId);
  const refMembro = refOrg.collection("membros").doc(usuario.uid);

  const [docOrg, docMembro] = await Promise.all([refOrg.get(), refMembro.get()]);

  if (!docOrg.exists) {
    throw new ErroValidacaoDominio(
      "Organização informada não encontrada.",
      "ORGANIZACAO_INEXISTENTE",
    );
  }

  const organizacao = docOrg.data() as Organizacao;
  const membro = docMembro.exists ? (docMembro.data() as MembroOrganizacao) : null;

  exigirPermissaoOrganizacao(usuario, organizacao, membro, "gerenciar_assinatura");

  const definicaoPlano = CATALOGO_PLANOS_FLUXO[planoCodigo];
  if (!definicaoPlano) {
    throw new ErroValidacaoDominio("Plano selecionado inválido.", "PLANO_INVALIDO");
  }

  // Se a organização já possui assinatura ativa e regular, não permite duplicar contratos
  if (organizacao.resumoDireitosPlano.situacaoAssinatura === "ativa") {
    throw new ErroValidacaoDominio(
      "A organização já possui uma assinatura ativa e regular.",
      "ASSINATURA_JA_ATIVA",
    );
  }

  // Se a organização está cancelada, mas ainda possui período de vigência restante já pago,
  // impede criar nova cobrança antecipada duplicando o ciclo em curso
  const vigenciaAtualIso = organizacao.resumoDireitosPlano.vigenciaAteIso;
  const hojeIso = new Date().toISOString().slice(0, 10);
  if (
    organizacao.resumoDireitosPlano.situacaoAssinatura === "cancelada" &&
    vigenciaAtualIso &&
    vigenciaAtualIso.slice(0, 10) >= hojeIso
  ) {
    throw new ErroValidacaoDominio(
      `A organização já possui acesso ativo garantido até ${vigenciaAtualIso.slice(0, 10)}. Não é necessário contratar um novo plano até o término do ciclo.`,
      "VIGENCIA_PAGA_ATIVA",
    );
  }

  // Obter ou criar o cliente no Asaas
  const clienteAsaasId = await provedorAsaas.obterOuCriarCliente({
    organizacaoId,
    dadosFiscais,
  });

  const agora = new Date();
  const agoraIso = agora.toISOString();
  const dataHojeIso = agoraIso.slice(0, 10);

  // Criar assinatura recorrente
  const resultadoAssinatura = await provedorAsaas.criarAssinatura({
    organizacaoId,
    clienteAsaasId,
    valorMensalReais: definicaoPlano.mensalidadeCentavos / 100,
    descricao: `Assinatura Fluxo Editorial — Plano ${definicaoPlano.nome}`,
  });

  let urlFaturaImplantacao: string | undefined;
  if (contratarImplantacaoAssistida && definicaoPlano.valorImplantacaoAssistidaCentavos) {
    const resultadoImplantacao = await provedorAsaas.criarCobrancaAvulsaImplantacao({
      organizacaoId,
      clienteAsaasId,
      valorReais: definicaoPlano.valorImplantacaoAssistidaCentavos / 100,
      descricao: `Serviço de Implantação Assistida Fluxo — ${definicaoPlano.nome}`,
    });
    urlFaturaImplantacao = resultadoImplantacao.urlFaturaOuCheckout;
  }

  const refAssinaturaGlobal = bancoDados.collection("assinaturas").doc(organizacaoId);
  const refClienteGlobal = bancoDados.collection("clientesAsaas").doc(organizacaoId);

  await bancoDados.runTransaction(async (transacao) => {
    const registroCliente: RegistroClienteAsaas = {
      id: organizacaoId,
      organizacaoId,
      clienteAsaasId,
      cpfOuCnpj: dadosFiscais.cpfOuCnpj,
      criadoEmIso: agoraIso,
      atualizadoEmIso: agoraIso,
    };

    const registroAssinatura: RegistroAssinaturaAsaas = {
      id: organizacaoId,
      organizacaoId,
      assinaturaAsaasId: resultadoAssinatura.assinaturaAsaasId,
      planoCodigo,
      valorMensalCentavos: definicaoPlano.mensalidadeCentavos,
      situacaoAsaas: resultadoAssinatura.situacao,
      situacaoInterna: "pendente_contratacao",
      ...(resultadoAssinatura.urlFaturaOuCheckout
        ? { urlFaturaOuCheckout: resultadoAssinatura.urlFaturaOuCheckout }
        : {}),
      contratouImplantacaoAssistida: contratarImplantacaoAssistida,
      ...(definicaoPlano.valorImplantacaoAssistidaCentavos
        ? { valorImplantacaoCentavos: definicaoPlano.valorImplantacaoAssistidaCentavos }
        : {}),
      ...(resultadoAssinatura.proximoVencimento
        ? { proximoVencimentoIso: resultadoAssinatura.proximoVencimento }
        : {}),
      criadoEmIso: agoraIso,
      atualizadoEmIso: agoraIso,
    };

    transacao.set(refClienteGlobal, registroCliente, { merge: true });
    transacao.set(refAssinaturaGlobal, registroAssinatura, { merge: true });

    // Uma nova assinatura criada em estado pendente não libera publicação pública
    // até que o primeiro pagamento seja confirmado/compensado no Asaas.
    transacao.update(refOrg, {
      "resumoDireitosPlano.planoCodigo": planoCodigo,
      "resumoDireitosPlano.situacaoAssinatura": "pendente_contratacao",
      "resumoDireitosPlano.limiteProfissionaisAtivos": definicaoPlano.limiteProfissionaisAtivos,
      "resumoDireitosPlano.limiteEnviosEmailMensal": definicaoPlano.limiteEnviosEmailMensal,
      "resumoDireitosPlano.permitePublicacaoPublica": false,
      atualizadoEmIso: agoraIso,
    });

    if (resultadoAssinatura.cobrancaInicialId) {
      const refCobrancaInicial = refOrg
        .collection("cobrancasAsaas")
        .doc(resultadoAssinatura.cobrancaInicialId);
      const cobrancaParaSalvar: CobrancaHistoricoAsaas = {
        id: resultadoAssinatura.cobrancaInicialId,
        organizacaoId,
        cobrancaAsaasId: resultadoAssinatura.cobrancaInicialId,
        assinaturaAsaasId: resultadoAssinatura.assinaturaAsaasId,
        valorCentavos: definicaoPlano.mensalidadeCentavos,
        formaPagamento: "UNDEFINED",
        situacao: "PENDING",
        dataVencimentoIso: resultadoAssinatura.proximoVencimento ?? dataHojeIso,
        ...(resultadoAssinatura.urlFaturaOuCheckout
          ? { urlFaturaOuComprovante: resultadoAssinatura.urlFaturaOuCheckout }
          : {}),
        criadoEmIso: agoraIso,
        atualizadoEmIso: agoraIso,
      };
      transacao.set(refCobrancaInicial, cobrancaParaSalvar, { merge: true });
    }
  });

  return {
    assinaturaId: resultadoAssinatura.assinaturaAsaasId,
    urlCheckoutOuFatura: resultadoAssinatura.urlFaturaOuCheckout,
    ...(urlFaturaImplantacao ? { urlFaturaImplantacao } : {}),
    situacao: resultadoAssinatura.situacao,
  };
}
