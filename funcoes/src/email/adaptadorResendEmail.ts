import type { MensagemEmailTransacional } from "../../../src/dominio/email/tiposEmailTransacional";
import { ErroValidacaoDominio } from "../../../src/dominio/erros/errosDominio";

export interface ResultadoEnvioEmailTransacional {
  readonly enviado: boolean;
  readonly idProvedor: string;
  readonly chaveIdempotencia: string;
  readonly modoSimulado: boolean;
}

export interface PortaProvedorEmailTransacional {
  enviarEmailIdempotente(
    mensagem: MensagemEmailTransacional,
  ): Promise<ResultadoEnvioEmailTransacional>;
}

interface RespostaSucessoResendApi {
  readonly id?: string;
}

interface RespostaErroResendApi {
  readonly message?: string;
}

export interface OpcoesAdaptadorResendEmail {
  readonly chaveApi?: string;
  readonly urlEndpoint?: string;
  readonly funcaoFetch?: typeof fetch;
}

/**
 * Adaptador HTTP para envio de e-mails transacionais idempotentes via Resend.
 * Isola o formato externo da API (`from`, `to`, `reply_to`, `subject`, `html`, `text`,
 * cabeçalho `Idempotency-Key`) na camada de infraestrutura das Cloud Functions.
 */
export class AdaptadorResendEmailHttp implements PortaProvedorEmailTransacional {
  private readonly chaveApi: string | undefined;
  private readonly urlEndpoint: string;
  private readonly funcaoFetch: typeof fetch;

  public constructor(opcoes: OpcoesAdaptadorResendEmail = {}) {
    this.chaveApi = opcoes.chaveApi ?? process.env.RESEND_API_KEY?.trim();
    this.urlEndpoint = opcoes.urlEndpoint ?? "https://api.resend.com/emails";
    this.funcaoFetch = opcoes.funcaoFetch ?? fetch;
  }

  public async enviarEmailIdempotente(
    mensagem: MensagemEmailTransacional,
  ): Promise<ResultadoEnvioEmailTransacional> {
    if (mensagem.para.length === 0) {
      throw new ErroValidacaoDominio(
        "Não é possível enviar e-mail transacional sem ao menos um destinatário.",
        "EMAIL_SEM_DESTINATARIO",
      );
    }

    // Modo simulado seguro para emulador local quando RESEND_API_KEY não está definida
    if (!this.chaveApi) {
      return {
        enviado: true,
        idProvedor: `simulado-${mensagem.chaveIdempotencia}`,
        chaveIdempotencia: mensagem.chaveIdempotencia,
        modoSimulado: true,
      };
    }

    const corpoRequisicao: Record<string, unknown> = {
      from: mensagem.de,
      to: [...mensagem.para],
      subject: mensagem.assunto,
      html: mensagem.html,
      text: mensagem.textoPuro,
    };

    if (mensagem.responderParaOpcional) {
      corpoRequisicao.reply_to = mensagem.responderParaOpcional;
    }

    const resposta = await this.funcaoFetch(this.urlEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.chaveApi}`,
        "Content-Type": "application/json",
        "Idempotency-Key": mensagem.chaveIdempotencia,
      },
      body: JSON.stringify(corpoRequisicao),
    });

    if (!resposta.ok) {
      let detalheErro = `HTTP ${resposta.status}`;
      try {
        const corpoErro = (await resposta.json()) as RespostaErroResendApi;
        if (corpoErro.message) {
          detalheErro = corpoErro.message;
        }
      } catch {
        // Ignora erro de parse de corpo não-JSON
      }

      throw new Error(`Falha ao enviar e-mail transacional via Resend: ${detalheErro}`);
    }

    const dados = (await resposta.json()) as RespostaSucessoResendApi;

    return {
      enviado: true,
      idProvedor: dados.id ?? `resend-${mensagem.chaveIdempotencia}`,
      chaveIdempotencia: mensagem.chaveIdempotencia,
      modoSimulado: false,
    };
  }
}

export function criarProvedorEmailPadrao(): PortaProvedorEmailTransacional {
  return new AdaptadorResendEmailHttp();
}
