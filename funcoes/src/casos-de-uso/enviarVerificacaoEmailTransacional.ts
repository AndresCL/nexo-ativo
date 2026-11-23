import type { Auth } from "firebase-admin/auth";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { UsuarioAutenticado } from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import {
  ErroDominio,
  ErroNaoAutenticado,
  ErroValidacaoDominio,
} from "../../../src/dominio/erros/errosDominio";
import { extrairAnoMesReferenciaIso } from "../../../src/dominio/email/tiposEmailTransacional";
import { construirEmailVerificacaoConta } from "../../../src/dominio/email/templatesEmailAutenticacao";
import type { PortaProvedorEmailTransacional } from "../email/adaptadorResendEmail";

export interface ResultadoEnvioVerificacaoEmail {
  readonly enviado: boolean;
  readonly jaVerificado: boolean;
  readonly mensagem: string;
}

const INTERVALO_MINIMO_REENVIO_MS = 60_000; // 60 segundos por usuário para proteger a cota do Resend

function resolverUrlBasePublica(urlBaseInformada?: string): string {
  const fallbackAmbiente =
    process.env.FUNCTIONS_EMULATOR === "true"
      ? "http://localhost:3000"
      : "https://nexoativo.com.br";

  const urlBruta =
    urlBaseInformada?.trim() ||
    process.env.NEXT_PUBLIC_URL_BASE_PUBLICA?.trim() ||
    fallbackAmbiente;

  return urlBruta.replace(/\/$/, "");
}

/**
 * Caso de uso transacional para envio e reenvio do e-mail personalizado de
 * confirmação de conta via Resend, com rate-limit transparente por usuário e
 * link direto para a tela `/verificar-email` do Nexo Ativo.
 */
export async function executarEnvioVerificacaoEmail(
  bancoDados: Firestore,
  autenticacaoAdmin: Auth,
  provedorEmail: PortaProvedorEmailTransacional,
  usuario: UsuarioAutenticado | null,
  urlBasePublica?: string,
  agoraMs: number = Date.now(),
): Promise<ResultadoEnvioVerificacaoEmail> {
  if (!usuario) {
    throw new ErroNaoAutenticado(
      "Você precisa estar autenticado para solicitar o e-mail de confirmação.",
    );
  }

  const registroUsuario = await autenticacaoAdmin.getUser(usuario.uid);
  const email = registroUsuario.email?.trim().toLowerCase();

  if (!email) {
    throw new ErroValidacaoDominio(
      "Esta conta não possui um endereço de e-mail associado para confirmação.",
      "CONTA_SEM_EMAIL",
    );
  }

  if (registroUsuario.emailVerified) {
    return {
      enviado: false,
      jaVerificado: true,
      mensagem: "Seu endereço de e-mail já está confirmado.",
    };
  }

  const refRateLimit = bancoDados
    .collection("controleRateLimitVerificacaoEmail")
    .doc(usuario.uid);
  const docRateLimit = await refRateLimit.get();

  if (docRateLimit.exists) {
    const ultimoEnvioMs = docRateLimit.data()?.ultimoEnvioMs as number | undefined;
    if (ultimoEnvioMs && agoraMs - ultimoEnvioMs < INTERVALO_MINIMO_REENVIO_MS) {
      const segundosRestantes = Math.max(
        1,
        Math.ceil((INTERVALO_MINIMO_REENVIO_MS - (agoraMs - ultimoEnvioMs)) / 1000),
      );
      throw new ErroDominio(
        "LIMITE_REENVIO_VERIFICACAO",
        `Já enviamos um e-mail de confirmação há poucos instantes. Aguarde ${segundosRestantes}s antes de solicitar um novo envio.`,
      );
    }
  }

  const urlBase = resolverUrlBasePublica(urlBasePublica);
  const linkAcaoFirebase = await autenticacaoAdmin.generateEmailVerificationLink(email, {
    url: `${urlBase}/verificar-email`,
  });

  const urlFirebase = new URL(linkAcaoFirebase);
  const codigoAcao = urlFirebase.searchParams.get("oobCode");

  const linkFinalVerificacao = codigoAcao
    ? `${urlBase}/verificar-email?oobCode=${encodeURIComponent(codigoAcao)}`
    : linkAcaoFirebase;

  const mensagemEmail = construirEmailVerificacaoConta({
    emailDestinatario: email,
    nomeExibicao: registroUsuario.displayName ?? usuario.nomeExibicao,
    linkVerificacao: linkFinalVerificacao,
  });

  const resultadoEnvio = await provedorEmail.enviarEmailIdempotente(mensagemEmail);
  const agoraIso = new Date(agoraMs).toISOString();

  await refRateLimit.set({
    ultimoEnvioMs: agoraMs,
    email,
    uid: usuario.uid,
    atualizadoEmIso: agoraIso,
  });

  if (resultadoEnvio.enviado) {
    try {
      const anoMesIso = extrairAnoMesReferenciaIso(agoraIso);
      await bancoDados
        .collection("metricasPlataforma")
        .doc(`email-${anoMesIso}`)
        .set(
          {
            anoMesIso,
            enviosAutenticacao: FieldValue.increment(1),
            atualizadoEmIso: agoraIso,
          },
          { merge: true },
        );
    } catch {
      // Falha de telemetria nunca deve interromper a confirmação de conta
    }
  }

  return {
    enviado: true,
    jaVerificado: false,
    mensagem: "Enviamos um link de confirmação personalizado para o seu e-mail.",
  };
}

