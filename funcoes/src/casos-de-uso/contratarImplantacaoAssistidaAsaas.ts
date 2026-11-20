import type { Firestore } from "firebase-admin/firestore";
import type {
  MembroOrganizacao,
  Organizacao,
  UsuarioAutenticado,
} from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import {
  ErroAcessoNegado,
  ErroValidacaoDominio,
} from "../../../src/dominio/erros/errosDominio";
import {
  criarProvedorAsaasPadrao,
  type PortaProvedorAsaas,
} from "../asaas/adaptadorAsaasCliente";
import type { CobrancaHistoricoAsaas } from "../../../src/dominio/assinaturas/tiposAssinaturaAsaas";

export interface ResultadoContratacaoImplantacaoAvulsa {
  readonly organizacaoId: string;
  readonly cobrancaAsaasId: string;
  readonly urlCheckout: string;
}

export async function executarContratacaoImplantacaoAssistidaAsaas(
  bancoDados: Firestore,
  usuario: UsuarioAutenticado,
  dadosBrutos: unknown,
  provedorAsaas: PortaProvedorAsaas = criarProvedorAsaasPadrao(),
): Promise<ResultadoContratacaoImplantacaoAvulsa> {
  const organizacaoId =
    typeof dadosBrutos === "object" &&
    dadosBrutos !== null &&
    "organizacaoId" in dadosBrutos &&
    typeof (dadosBrutos as { organizacaoId?: unknown }).organizacaoId === "string"
      ? (dadosBrutos as { organizacaoId: string }).organizacaoId.trim()
      : "";

  if (!organizacaoId) {
    throw new ErroValidacaoDominio("Identificador da organização é obrigatório.", "DADOS_INVALIDOS");
  }

  const refOrg = bancoDados.collection("organizacoes").doc(organizacaoId);
  const docOrg = await refOrg.get();
  if (!docOrg.exists) {
    throw new ErroValidacaoDominio("Organização não encontrada.", "ORGANIZACAO_NAO_ENCONTRADA");
  }

  const refMembro = refOrg.collection("membros").doc(usuario.uid);
  const docMembro = await refMembro.get();
  if (!docMembro.exists) {
    throw new ErroAcessoNegado("Você não pertence a esta organização.");
  }

  const membro = docMembro.data() as MembroOrganizacao;
  if (
    membro.situacao !== "ativo" ||
    (membro.papel !== "proprietario" && membro.papel !== "administrador")
  ) {
    throw new ErroAcessoNegado(
      "Apenas proprietários e administradores ativos da organização podem contratar serviços.",
    );
  }

  const refCliente = bancoDados.collection("clientesAsaas").doc(organizacaoId);
  const docCliente = await refCliente.get();
  let clienteAsaasId: string | undefined = docCliente.exists
    ? (docCliente.data()?.clienteAsaasId as string | undefined)
    : undefined;

  const organizacao = docOrg.data() as Organizacao;

  if (!clienteAsaasId) {
    clienteAsaasId = await provedorAsaas.obterOuCriarCliente({
      organizacaoId,
      dadosFiscais: {
        nomeOuRazaoSocial: organizacao.nome,
        cpfOuCnpj: (docCliente.data()?.cpfOuCnpj as string | undefined) || "00000000000",
        email: usuario.email || "contato@nexoativo.com.br",
      },
    });

    await refCliente.set(
      {
        id: organizacaoId,
        organizacaoId,
        clienteAsaasId,
        cpfOuCnpj: (docCliente.data()?.cpfOuCnpj as string | undefined) || "00000000000",
        criadoEmIso: new Date().toISOString(),
        atualizadoEmIso: new Date().toISOString(),
      },
      { merge: true },
    );
  }

  const resultadoImplantacao = await provedorAsaas.criarCobrancaAvulsaImplantacao({
    organizacaoId,
    clienteAsaasId,
    valorReais: 297,
    descricao: `Serviço de Implantação Assistida Fluxo — ${organizacao.nome}`,
  });

  const agoraIso = new Date().toISOString();
  const amanhaIso =
    new Date(Date.now() + 86400000).toISOString().split("T")[0] ??
    agoraIso.split("T")[0] ??
    agoraIso;

  const registroCobranca: CobrancaHistoricoAsaas = {
    id: resultadoImplantacao.cobrancaAsaasId,
    organizacaoId,
    cobrancaAsaasId: resultadoImplantacao.cobrancaAsaasId,
    valorCentavos: 29700,
    formaPagamento: "UNDEFINED",
    situacao: "PENDING",
    dataVencimentoIso: amanhaIso,
    urlFaturaOuComprovante: resultadoImplantacao.urlFaturaOuCheckout,
    criadoEmIso: agoraIso,
    atualizadoEmIso: agoraIso,
  };

  const batch = bancoDados.batch();
  batch.set(
    refOrg.collection("cobrancasAsaas").doc(resultadoImplantacao.cobrancaAsaasId),
    registroCobranca,
  );
  batch.set(
    bancoDados.collection("assinaturas").doc(organizacaoId),
    {
      contratouImplantacaoAssistida: true,
      valorImplantacaoCentavos: 29700,
      atualizadoEmIso: agoraIso,
    },
    { merge: true },
  );

  await batch.commit();

  return {
    organizacaoId,
    cobrancaAsaasId: resultadoImplantacao.cobrancaAsaasId,
    urlCheckout: resultadoImplantacao.urlFaturaOuCheckout || "",
  };
}
