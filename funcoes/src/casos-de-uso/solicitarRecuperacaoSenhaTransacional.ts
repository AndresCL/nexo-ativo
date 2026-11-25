import type { Auth } from "firebase-admin/auth";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { esquemaRecuperarSenha } from "../../../src/validacoes/esquemasAutenticacao";
import { extrairAnoMesReferenciaIso } from "../../../src/dominio/email/tiposEmailTransacional";
import { construirEmailRecuperacaoSenha } from "../../../src/dominio/email/templatesEmailEditorial";
import type { PortaProvedorEmailTransacional } from "../email/adaptadorResendEmail";

export interface ResultadoSolicitacaoRecuperacaoSenha {
  readonly sucesso: boolean;
  readonly mensagem: string;
}

const INTERVALO_MINIMO_ENTRE_SOLICITACOES_MS = 120_000; // 2 minutos por e-mail para blindar cota Resend

/**
 * Caso de uso transacional para solicitar redefinição de senha com template
 * minimalista Nexo Ativo via Resend e proteção de cota / rate-limit.
 */
export async function executarSolicitacaoRecuperacaoSenha(
  bancoDados: Firestore,
  autenticacaoAdmin: Auth,
  provedorEmail: PortaProvedorEmailTransacional,
  dadosBrutos: unknown,
  urlBasePublica: string = process.env.NEXT_PUBLIC_URL_BASE_PUBLICA ?? "http://localhost:3000",
): Promise<ResultadoSolicitacaoRecuperacaoSenha> {
  const parse = esquemaRecuperarSenha.safeParse(dadosBrutos);
  if (!parse.success) {
    return {
      sucesso: true,
      mensagem: "Se o e-mail informado estiver cadastrado, você receberá as instruções em instantes.",
    };
  }

  const email = parse.data.email.toLowerCase().trim();
  const hashEmail = Buffer.from(email).toString("base64url");
  const refRateLimit = bancoDados.collection("controleRateLimitRecuperacao").doc(hashEmail);

  const agora = Date.now();
  const docRateLimit = await refRateLimit.get();

  if (docRateLimit.exists) {
    const ultimoEnvioMs = docRateLimit.data()?.ultimoEnvioMs as number | undefined;
    if (ultimoEnvioMs && agora - ultimoEnvioMs < INTERVALO_MINIMO_ENTRE_SOLICITACOES_MS) {
      // Retorna sucesso aparente sem disparar para evitar estouro de cota e timing attack
      return {
        sucesso: true,
        mensagem: "Se o e-mail informado estiver cadastrado, você receberá as instruções em instantes.",
      };
    }
  }

  try {
    const usuario = await autenticacaoAdmin.getUserByEmail(email);

    if (usuario) {
      // Gera o link seguro do Firebase apontando para a nossa tela customizada no Next.js
      const linkAcaoFirebase = await autenticacaoAdmin.generatePasswordResetLink(email, {
        url: `${urlBasePublica.replace(/\/$/, "")}/redefinir-senha`,
      });

      // Extrai o parâmetro oobCode da URL gerada pelo Firebase
      const urlFirebase = new URL(linkAcaoFirebase);
      const codigoAcao = urlFirebase.searchParams.get("oobCode");

      // Monta a URL direta para o nosso aplicativo minimalista
      const linkFinalRedefinicao = codigoAcao
        ? `${urlBasePublica.replace(/\/$/, "")}/redefinir-senha?oobCode=${encodeURIComponent(codigoAcao)}`
        : linkAcaoFirebase;

      const mensagemEmail = construirEmailRecuperacaoSenha({
        emailDestinatario: email,
        linkRedefinicao: linkFinalRedefinicao,
      });

      const resultadoEnvio = await provedorEmail.enviarEmailIdempotente(mensagemEmail);

      const agoraIso = new Date(agora).toISOString();
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
          // Falha de telemetria nunca deve interromper a recuperação de senha
        }
      }

      await refRateLimit.set({
        ultimoEnvioMs: agora,
        email,
        atualizadoEmIso: agoraIso,
      });
    }
  } catch {
    // Se o usuário não existir no Firebase Auth (auth/user-not-found) ou houver falha controlada,
    // garantimos segurança contra enumeração de contas retornando a mesma mensagem neutra.
  }

  return {
    sucesso: true,
    mensagem: "Se o e-mail informado estiver cadastrado, você receberá as instruções em instantes.",
  };
}

