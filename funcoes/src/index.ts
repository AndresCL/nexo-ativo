import { z } from "zod";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineSecret, defineString } from "firebase-functions/params";
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
import { executarConsultaDisponibilidadeAgenda } from "./casos-de-uso/consultarDisponibilidadeAgenda";
import { executarRegistroAgendamentoVisitante } from "./casos-de-uso/registrarAgendamentoVisitanteTransacional";
import { executarAtualizacaoSituacaoAgendamento } from "./casos-de-uso/atualizarSituacaoAgendamentoTransacional";
import { executarSolicitacaoRecuperacaoSenha } from "./casos-de-uso/solicitarRecuperacaoSenhaTransacional";
import { executarEnvioVerificacaoEmail } from "./casos-de-uso/enviarVerificacaoEmailTransacional";
import { criarProvedorEmailPadrao } from "./email/adaptadorResendEmail";
import { criarProvedorAsaasPadrao } from "./asaas/adaptadorAsaasCliente";
import { executarCriacaoAssinaturaAsaas } from "./casos-de-uso/criarAssinaturaOrganizacaoAsaas";
import { executarCancelamentoAssinaturaAsaas } from "./casos-de-uso/cancelarAssinaturaOrganizacaoAsaas";
import { executarRestabelecimentoAssinaturaAsaas } from "./casos-de-uso/restabelecerAssinaturaOrganizacaoAsaas";
import { executarContratacaoImplantacaoAssistidaAsaas } from "./casos-de-uso/contratarImplantacaoAssistidaAsaas";
import { executarProcessamentoWebhookAsaasTransacional } from "./casos-de-uso/processarWebhookAsaasTransacional";
import { executarAlteracaoSituacaoOrganizacaoFundador } from "./casos-de-uso/atualizarSituacaoOrganizacaoFundador";
import { executarAjustePlanoOrganizacaoFundador } from "./casos-de-uso/ajustarPlanoOrganizacaoFundador";
import { executarDefinicaoPerfilPublicidadeOrganizacaoFundador } from "./casos-de-uso/definirPerfilPublicidadeOrganizacaoFundador";
import { executarCriacaoOrganizacaoPeloFundador } from "./casos-de-uso/criarOrganizacaoPeloFundador";
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

export const consultarDisponibilidadeAgendaPublica = onCall(async (requisicao) => {
  try {
    const { bancoDados } = obterAdminFuncoes();
    return await executarConsultaDisponibilidadeAgenda(bancoDados, requisicao.data);
  } catch (erro) {
    throw converterErroParaHttpsError(erro);
  }
});

export const registrarAgendamentoVisitante = onCall(
  { secrets: [chaveResend] },
  async (requisicao) => {
    try {
      const { bancoDados } = obterAdminFuncoes();
      return await executarRegistroAgendamentoVisitante(bancoDados, requisicao.data);
    } catch (erro) {
      throw converterErroParaHttpsError(erro);
    }
  },
);

export const atualizarSituacaoAgendamento = onCall(async (requisicao) => {
  try {
    const { bancoDados } = obterAdminFuncoes();
    const usuario = extrairUsuarioDeRequisicaoCallable(requisicao);
    return await executarAtualizacaoSituacaoAgendamento(bancoDados, usuario, requisicao.data);
  } catch (erro) {
    throw converterErroParaHttpsError(erro);
  }
});

export const solicitarRecuperacaoSenha = onCall(
  { secrets: [chaveResend] },
  async (requisicao) => {
    try {
      const { bancoDados, autenticacao } = obterAdminFuncoes();
      const provedorEmail = criarProvedorEmailPadrao();
      return await executarSolicitacaoRecuperacaoSenha(
        bancoDados,
        autenticacao,
        provedorEmail,
        requisicao.data,
      );
    } catch (erro) {
      throw converterErroParaHttpsError(erro);
    }
  }
);

export const enviarVerificacaoEmail = onCall(
  { secrets: [chaveResend] },
  async (requisicao) => {
    try {
      const { bancoDados, autenticacao } = obterAdminFuncoes();
      const usuario = extrairUsuarioDeRequisicaoCallable(requisicao);
      const provedorEmail = criarProvedorEmailPadrao();
      return await executarEnvioVerificacaoEmail(
        bancoDados,
        autenticacao,
        provedorEmail,
        usuario,
      );
    } catch (erro) {
      throw converterErroParaHttpsError(erro);
    }
  }
);

const chaveAsaas = defineSecret("ASAAS_API_KEY");
const tokenWebhookAsaas = defineSecret("ASAAS_WEBHOOK_ACCESS_TOKEN");
const urlBaseAsaas = defineString("ASAAS_URL_BASE", {
  default: "https://api.asaas.com/v3",
});

function criarProvedorAsaasConfigurado() {
  return criarProvedorAsaasPadrao({
    chaveApi: chaveAsaas.value(),
    urlBase: urlBaseAsaas.value(),
  });
}

export const criarAssinaturaAsaas = onCall(
  { secrets: [chaveAsaas] },
  async (requisicao) => {
    try {
      const { bancoDados } = obterAdminFuncoes();
      const usuario = extrairUsuarioDeRequisicaoCallable(requisicao);
      if (!usuario) {
        throw new HttpsError(
          "unauthenticated",
          "Você precisa estar autenticado para contratar um plano.",
        );
      }
      return await executarCriacaoAssinaturaAsaas(
        bancoDados,
        usuario,
        requisicao.data,
        criarProvedorAsaasConfigurado(),
      );
    } catch (erro) {
      throw converterErroParaHttpsError(erro);
    }
  },
);

export const cancelarAssinaturaAsaas = onCall(
  { secrets: [chaveAsaas] },
  async (requisicao) => {
    try {
      const { bancoDados } = obterAdminFuncoes();
      const usuario = extrairUsuarioDeRequisicaoCallable(requisicao);
      if (!usuario) {
        throw new HttpsError(
          "unauthenticated",
          "Você precisa estar autenticado para cancelar a assinatura.",
        );
      }
      return await executarCancelamentoAssinaturaAsaas(
        bancoDados,
        usuario,
        requisicao.data,
        criarProvedorAsaasConfigurado(),
      );
    } catch (erro) {
      throw converterErroParaHttpsError(erro);
    }
  },
);

export const restabelecerAssinaturaAsaas = onCall(
  { secrets: [chaveAsaas] },
  async (requisicao) => {
    try {
      const { bancoDados } = obterAdminFuncoes();
      const usuario = extrairUsuarioDeRequisicaoCallable(requisicao);
      if (!usuario) {
        throw new HttpsError(
          "unauthenticated",
          "Você precisa estar autenticado para restabelecer a assinatura.",
        );
      }
      return await executarRestabelecimentoAssinaturaAsaas(
        bancoDados,
        usuario,
        requisicao.data,
        criarProvedorAsaasConfigurado(),
      );
    } catch (erro) {
      throw converterErroParaHttpsError(erro);
    }
  },
);

export const contratarImplantacaoAssistidaAsaas = onCall(
  { secrets: [chaveAsaas] },
  async (requisicao) => {
    try {
      const { bancoDados } = obterAdminFuncoes();
      const usuario = extrairUsuarioDeRequisicaoCallable(requisicao);
      if (!usuario) {
        throw new HttpsError(
          "unauthenticated",
          "Você precisa estar autenticado para contratar a implantação assistida.",
        );
      }
      return await executarContratacaoImplantacaoAssistidaAsaas(
        bancoDados,
        usuario,
        requisicao.data,
        criarProvedorAsaasConfigurado(),
      );
    } catch (erro) {
      throw converterErroParaHttpsError(erro);
    }
  },
);

export const webhookAsaas = onRequest(
  { cors: false, secrets: [tokenWebhookAsaas] },
  async (requisicao, resposta) => {
    try {
      const tokenEsperado = tokenWebhookAsaas.value().trim();
      if (!tokenEsperado) {
        console.error("[WEBHOOK_ASAAS_NAO_CONFIGURADO]");
        resposta.status(500).json({ erro: "Token de webhook Asaas não configurado." });
        return;
      }

      const tokenRecebido = requisicao.headers["asaas-access-token"] as string | undefined;
      if (!tokenRecebido || tokenRecebido.trim() !== tokenEsperado) {
        console.warn("[WEBHOOK_ASAAS_NAO_AUTORIZADO]");
        resposta.status(401).json({ erro: "Token de webhook Asaas não autorizado." });
        return;
      }

      console.log("[WEBHOOK_ASAAS_RECEBIDO]", {
        evento: requisicao.body?.event,
        paymentId: requisicao.body?.payment?.id,
        status: requisicao.body?.payment?.status,
      });

      const { bancoDados } = obterAdminFuncoes();
      const resultado = await executarProcessamentoWebhookAsaasTransacional(
        bancoDados,
        requisicao.body,
      );

      console.log("[WEBHOOK_ASAAS_SUCESSO]", resultado);
      resposta.status(200).json(resultado);
    } catch (erro) {
      console.error("[WEBHOOK_ASAAS_ERRO]", erro);
      const mensagem = erro instanceof Error ? erro.message : "Erro interno no webhook Asaas.";
      resposta.status(400).json({ erro: mensagem });
    }
  },
);

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

export const criarOrganizacaoFundador = onCall(async (requisicao) => {
  try {
    const { autenticacao, bancoDados } = obterAdminFuncoes();
    const usuario = extrairUsuarioDeRequisicaoCallable(requisicao);
    if (!usuario) {
      throw new HttpsError("unauthenticated", "Requer autenticação de fundador.");
    }
    return await executarCriacaoOrganizacaoPeloFundador(
      bancoDados,
      autenticacao,
      usuario,
      requisicao.data,
    );
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
