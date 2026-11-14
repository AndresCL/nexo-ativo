import type { DadosCadastroFiscalAssinante } from "../../../src/dominio/assinaturas/tiposAssinaturaAsaas";

export interface ParametrosCriarClienteAsaas {
  readonly organizacaoId: string;
  readonly dadosFiscais: DadosCadastroFiscalAssinante;
}

export interface ParametrosCriarAssinaturaAsaas {
  readonly organizacaoId: string;
  readonly clienteAsaasId: string;
  readonly valorMensalReais: number;
  readonly descricao: string;
}

export interface ParametrosCriarCobrancaImplantacaoAsaas {
  readonly organizacaoId: string;
  readonly clienteAsaasId: string;
  readonly valorReais: number;
  readonly descricao: string;
}

export interface RespostaCriacaoAssinaturaAsaas {
  readonly assinaturaAsaasId: string;
  readonly urlFaturaOuCheckout?: string;
  readonly proximoVencimento?: string;
  readonly situacao: string;
}

export interface RespostaCriacaoCobrancaAvulsaAsaas {
  readonly cobrancaAsaasId: string;
  readonly urlFaturaOuCheckout?: string;
  readonly situacao: string;
}

export interface PortaProvedorAsaas {
  obterOuCriarCliente(parametros: ParametrosCriarClienteAsaas): Promise<string>;
  criarAssinatura(
    parametros: ParametrosCriarAssinaturaAsaas,
  ): Promise<RespostaCriacaoAssinaturaAsaas>;
  criarCobrancaAvulsaImplantacao(
    parametros: ParametrosCriarCobrancaImplantacaoAsaas,
  ): Promise<RespostaCriacaoCobrancaAvulsaAsaas>;
}

export interface OpcoesAdaptadorAsaas {
  readonly chaveApi?: string;
  readonly urlBase?: string;
  readonly funcaoFetch?: typeof fetch;
}

/**
 * Adaptador HTTP para comunicação com a API oficial v3 do Asaas.
 * Suporta modo simulado quando `ASAAS_API_KEY` não está presente em desenvolvimento/emulador.
 */
export class AdaptadorAsaasHttp implements PortaProvedorAsaas {
  private readonly chaveApi: string | undefined;
  private readonly urlBase: string;
  private readonly funcaoFetch: typeof fetch;

  public constructor(opcoes: OpcoesAdaptadorAsaas = {}) {
    this.chaveApi = opcoes.chaveApi ?? process.env.ASAAS_API_KEY?.trim();
    this.urlBase = opcoes.urlBase ?? (process.env.ASAAS_URL_BASE || "https://sandbox.asaas.com/v3");
    this.funcaoFetch = opcoes.funcaoFetch ?? fetch;
  }

  public async obterOuCriarCliente(parametros: ParametrosCriarClienteAsaas): Promise<string> {
    if (!this.chaveApi) {
      return `cus_simulado_${parametros.organizacaoId}`;
    }

    const payload = {
      name: parametros.dadosFiscais.nomeOuRazaoSocial,
      cpfCnpj: parametros.dadosFiscais.cpfOuCnpj,
      email: parametros.dadosFiscais.email,
      phone: parametros.dadosFiscais.telefone,
      postalCode: parametros.dadosFiscais.cep,
      addressNumber: parametros.dadosFiscais.enderecoNumero,
      externalReference: parametros.organizacaoId,
    };

    const resposta = await this.funcaoFetch(`${this.urlBase}/customers`, {
      method: "POST",
      headers: {
        access_token: this.chaveApi,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      throw new Error(`Falha ao registrar cliente no Asaas: ${detalhe}`);
    }

    const dados = (await resposta.json()) as { id: string };
    return dados.id;
  }

  public async criarAssinatura(
    parametros: ParametrosCriarAssinaturaAsaas,
  ): Promise<RespostaCriacaoAssinaturaAsaas> {
    if (!this.chaveApi) {
      return {
        assinaturaAsaasId: `sub_simulada_${parametros.organizacaoId}`,
        urlFaturaOuCheckout: `https://sandbox.asaas.com/i/simulada-${parametros.organizacaoId}`,
        proximoVencimento: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
        situacao: "ACTIVE",
      };
    }

    const amanha = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const payload = {
      customer: parametros.clienteAsaasId,
      billingType: "UNDEFINED", // Permite ao assinante escolher PIX, Cartão ou Boleto no checkout Asaas
      value: parametros.valorMensalReais,
      nextDueDate: amanha,
      cycle: "MONTHLY",
      description: parametros.descricao,
      externalReference: parametros.organizacaoId,
    };

    const resposta = await this.funcaoFetch(`${this.urlBase}/subscriptions`, {
      method: "POST",
      headers: {
        access_token: this.chaveApi,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      throw new Error(`Falha ao criar assinatura no Asaas: ${detalhe}`);
    }

    const dados = (await resposta.json()) as {
      id: string;
      status: string;
      nextDueDate?: string;
      invoiceUrl?: string;
    };

    return {
      assinaturaAsaasId: dados.id,
      urlFaturaOuCheckout: dados.invoiceUrl,
      proximoVencimento: dados.nextDueDate,
      situacao: dados.status,
    };
  }

  public async criarCobrancaAvulsaImplantacao(
    parametros: ParametrosCriarCobrancaImplantacaoAsaas,
  ): Promise<RespostaCriacaoCobrancaAvulsaAsaas> {
    if (!this.chaveApi) {
      return {
        cobrancaAsaasId: `pay_implantacao_simulada_${parametros.organizacaoId}`,
        urlFaturaOuCheckout: `https://sandbox.asaas.com/i/implantacao-${parametros.organizacaoId}`,
        situacao: "PENDING",
      };
    }

    const amanha = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const payload = {
      customer: parametros.clienteAsaasId,
      billingType: "UNDEFINED",
      value: parametros.valorReais,
      dueDate: amanha,
      description: parametros.descricao,
      externalReference: parametros.organizacaoId,
    };

    const resposta = await this.funcaoFetch(`${this.urlBase}/payments`, {
      method: "POST",
      headers: {
        access_token: this.chaveApi,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      throw new Error(`Falha ao criar cobrança de implantação no Asaas: ${detalhe}`);
    }

    const dados = (await resposta.json()) as { id: string; status: string; invoiceUrl?: string };

    return {
      cobrancaAsaasId: dados.id,
      urlFaturaOuCheckout: dados.invoiceUrl,
      situacao: dados.status,
    };
  }
}

export function criarProvedorAsaasPadrao(): PortaProvedorAsaas {
  return new AdaptadorAsaasHttp();
}
