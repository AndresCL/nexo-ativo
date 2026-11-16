import { z } from "zod";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { exigirPrivilegioFundador } from "../../src/dominio/permissoes/autorizadorOrganizacao";
import { ValorMonetarioCentavos } from "../../src/dominio/objetos-valor/valorMonetarioCentavos";
import { ehIdentificadorPublicoValido } from "../../src/dominio/objetos-valor/identificadorPublico";
import { obterAdminFuncoes } from "./seguranca/adminInicializado";
import {
  converterErroParaHttpsError,
  extrairUsuarioDeRequisicaoCallable,
} from "./seguranca/autorizadorAdminFirestore";
import { executarCriacaoOrganizacaoInicial } from "./casos-de-uso/criarOrganizacaoTransacional";
import { executarPublicacaoPaginaEditorial } from "./casos-de-uso/publicarPaginaTransacional";
import { atribuirPrivilegioFundadorAuditado } from "./casos-de-uso/provisionarFundadorPlataforma";
import { executarRegistroSolicitacaoVisitante } from "./casos-de-uso/registrarSolicitacaoVisitanteTransacional";
import { executarCriacaoAssinaturaAsaas } from "./casos-de-uso/criarAssinaturaOrganizacaoAsaas";
import { executarCancelamentoAssinaturaAsaas } from "./casos-de-uso/cancelarAssinaturaOrganizacaoAsaas";
import { executarProcessamentoWebhookAsaasTransacional } from "./casos-de-uso/processarWebhookAsaasTransacional";
import { executarAlteracaoSituacaoOrganizacaoFundador } from "./casos-de-uso/atualizarSituacaoOrganizacaoFundador";
import { executarAjustePlanoOrganizacaoFundador } from "./casos-de-uso/ajustarPlanoOrganizacaoFundador";
import { executarDefinicaoPerfilPublicidadeOrganizacaoFundador } from "./casos-de-uso/definirPerfilPublicidadeOrganizacaoFundador";
import { executarRegistroEventoAgregadoAnonimo } from "./analytics/registrarEventoAgregadoAnonimo";

export {
  pesquisarEstabelecimentosGoogle,
  consultarAvaliacoesGooglePrevia,
  consultarAvaliacoesGoogleVitrine,
} from "./avaliacoes/funcoesAvaliacoesGoogle";

setGlobalOptions({
  region: "southamerica-east1",
  maxInstances: 10,
});

export const verificarSaudePlataforma = onRequest({ cors: false }, (_requisicao, resposta) => {
  const mensalidadePlanoPro = ValorMonetarioCentavos.deCentavos(8700);

  resposta.status(200).json({
    situacao: "operacional",
    regiao: "southamerica-east1",
    referenciaPlanoProFormatada: mensalidadePlanoPro.formatarMoedaBrasileira(),
    validacaoDominioAtiva: ehIdentificadorPublicoValido("estudio-aurora"),
    verificadoEm: new Date().toISOString(),
  });
});

export const criarOrganizacaoInicial = onCall(async (requisicao) => {
  try {
    const { bancoDados } = obterAdminFuncoes();
    const usuario = extrairUsuarioDeRequisicaoCallable(requisicao);
    return await executarCriacaoOrganizacaoInicial(bancoDados, usuario, requisicao.data);
  } catch (erro) {
    throw converterErroParaHttpsError(erro);
  }
});

export const publicarPaginaEditorial = onCall(async (requisicao) => {
  try {
    const { bancoDados } = obterAdminFuncoes();
    const usuario = extrairUsuarioDeRequisicaoCallable(requisicao);
    return await executarPublicacaoPaginaEditorial(bancoDados, usuario, requisicao.data);
  } catch (erro) {
    throw converterErroParaHttpsError(erro);
  }
});

const chaveResend = defineSecret("RESEND_API_KEY");

export const registrarSolicitacaoVisitante = onCall(
  { secrets: [chaveResend] },
  async (requisicao) => {
    try {
      const { bancoDados } = obterAdminFuncoes();
      return await executarRegistroSolicitacaoVisitante(bancoDados, requisicao.data);
    } catch (erro) {
      throw converterErroParaHttpsError(erro);
    }
  }
);

export const criarAssinaturaAsaas = onCall(async (requisicao) => {
  try {
    const { bancoDados } = obterAdminFuncoes();
    const usuario = extrairUsuarioDeRequisicaoCallable(requisicao);
    if (!usuario) {
      throw new HttpsError(
        "unauthenticated",
        "Você precisa estar autenticado para contratar um plano.",
      );
    }
    return await executarCriacaoAssinaturaAsaas(bancoDados, usuario, requisicao.data);
  } catch (erro) {
    throw converterErroParaHttpsError(erro);
  }
});

export const cancelarAssinaturaAsaas = onCall(async (requisicao) => {
  try {
    const { bancoDados } = obterAdminFuncoes();
    const usuario = extrairUsuarioDeRequisicaoCallable(requisicao);
    if (!usuario) {
      throw new HttpsError(
        "unauthenticated",
        "Você precisa estar autenticado para cancelar a assinatura.",
      );
    }
    return await executarCancelamentoAssinaturaAsaas(bancoDados, usuario, requisicao.data);
  } catch (erro) {
    throw converterErroParaHttpsError(erro);
  }
});

export const webhookAsaas = onRequest({ cors: false }, async (requisicao, resposta) => {
  try {
    const tokenEsperado = process.env.ASAAS_WEBHOOK_ACCESS_TOKEN?.trim();
    if (tokenEsperado) {
      const tokenRecebido = requisicao.headers["asaas-access-token"];
      if (tokenRecebido !== tokenEsperado) {
        resposta.status(401).json({ erro: "Token de webhook Asaas não autorizado." });
        return;
      }
    }

    const { bancoDados } = obterAdminFuncoes();
    const resultado = await executarProcessamentoWebhookAsaasTransacional(
      bancoDados,
      requisicao.body,
    );

    resposta.status(200).json(resultado);
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro interno no webhook Asaas.";
    resposta.status(400).json({ erro: mensagem });
  }
});

export const alterarSituacaoOrganizacaoFundador = onCall(async (requisicao) => {
  try {
    const { bancoDados } = obterAdminFuncoes();
    const usuario = extrairUsuarioDeRequisicaoCallable(requisicao);
    if (!usuario) {
      throw new HttpsError("unauthenticated", "Requer autenticação de fundador.");
    }
    return await executarAlteracaoSituacaoOrganizacaoFundador(bancoDados, usuario, requisicao.data);
  } catch (erro) {
    throw converterErroParaHttpsError(erro);
  }
});

export const definirPerfilPublicidadeOrganizacaoFundador = onCall(async (requisicao) => {
  try {
    const { bancoDados } = obterAdminFuncoes();
    const usuario = extrairUsuarioDeRequisicaoCallable(requisicao);
    if (!usuario) {
      throw new HttpsError("unauthenticated", "Requer autenticação de fundador.");
    }
    return await executarDefinicaoPerfilPublicidadeOrganizacaoFundador(
      bancoDados,
      usuario,
      requisicao.data,
    );
  } catch (erro) {
    throw converterErroParaHttpsError(erro);
  }
});

export const ajustarPlanoOrganizacaoFundador = onCall(async (requisicao) => {
  try {
    const { bancoDados } = obterAdminFuncoes();
    const usuario = extrairUsuarioDeRequisicaoCallable(requisicao);
    if (!usuario) {
      throw new HttpsError("unauthenticated", "Requer autenticação de fundador.");
    }
    return await executarAjustePlanoOrganizacaoFundador(bancoDados, usuario, requisicao.data);
  } catch (erro) {
    throw converterErroParaHttpsError(erro);
  }
});

export const registrarEventoAnonimo = onCall(async (requisicao) => {
  try {
    const { bancoDados } = obterAdminFuncoes();
    return await executarRegistroEventoAgregadoAnonimo(bancoDados, requisicao.data);
  } catch (erro) {
    throw converterErroParaHttpsError(erro);
  }
});

const esquemaConcederFundador = z.object({
  uidAlvo: z.string().min(1, "Informe o identificador do usuário alvo."),
});

export const concederPapelFundador = onCall(async (requisicao) => {
  try {
    const usuarioExecutor = extrairUsuarioDeRequisicaoCallable(requisicao);
    const fundadorValidado = exigirPrivilegioFundador(usuarioExecutor);
    const { uidAlvo } = esquemaConcederFundador.parse(requisicao.data);
    const { autenticacao, bancoDados } = obterAdminFuncoes();

    await atribuirPrivilegioFundadorAuditado(autenticacao, bancoDados, {
      uidAlvo,
      atorUsuarioId: fundadorValidado.uid,
      origemOperacao: "painel_fundador",
    });

    return { atualizado: true };
  } catch (erro) {
    throw converterErroParaHttpsError(erro);
  }
});
