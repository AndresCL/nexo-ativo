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
  readonly dataPrimeiroVencimentoIso?: string;
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
  readonly cobrancaInicialId?: string;
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
  cancelarAssinatura(assinaturaAsaasId: string): Promise<void>;
  removerCobranca(cobrancaAsaasId: string): Promise<void>;
}

export interface OpcoesAdaptadorAsaasHttp {
  readonly chaveApi: string;
  readonly urlBase: string;
  readonly funcaoFetch?: typeof fetch;
}

export interface OpcoesFabricaProvedorAsaas {
  readonly chaveApi?: string;
  readonly urlBase?: string;
  readonly permitirSimulacao?: boolean;
  readonly funcaoFetch?: typeof fetch;
}

/**
 * Adaptador HTTP para comunicação com a API oficial v3 do Asaas.
 * Exige credenciais e URL base explícitas (fail-fast).
 */
export class AdaptadorAsaasHttp implements PortaProvedorAsaas {
  private readonly chaveApi: string;
  private readonly urlBase: string;
  private readonly funcaoFetch: typeof fetch;

  public constructor(opcoes: OpcoesAdaptadorAsaasHttp) {
    const chaveLimpa = opcoes.chaveApi.trim();
    const urlLimpa = opcoes.urlBase.trim().replace(/\/+$/, "");

    if (!chaveLimpa) {
      throw new Error("ASAAS_API_KEY não configurada para o adaptador HTTP do Asaas.");
    }
    if (!urlLimpa) {
      throw new Error("ASAAS_URL_BASE não configurada para o adaptador HTTP do Asaas.");
    }

    this.chaveApi = chaveLimpa;
    // Normaliza caso a URL tenha sido informada como sandbox.asaas.com em vez de api-sandbox.asaas.com
    this.urlBase = urlLimpa.replace("://sandbox.asaas.com", "://api-sandbox.asaas.com");
    this.funcaoFetch = opcoes.funcaoFetch ?? fetch;
  }

  public async obterOuCriarCliente(parametros: ParametrosCriarClienteAsaas): Promise<string> {
    // Consulta prévia para reaproveitar cliente existente com o mesmo CPF/CNPJ
    try {
      const respostaBusca = await this.funcaoFetch(
        `${this.urlBase}/customers?cpfCnpj=${encodeURIComponent(parametros.dadosFiscais.cpfOuCnpj)}`,
        {
          method: "GET",
          headers: {
            access_token: this.chaveApi,
          },
        },
      );
      if (respostaBusca.ok) {
        const contentType = respostaBusca.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const dadosBusca = (await respostaBusca.json()) as { data?: readonly { id: string }[] };
          if (dadosBusca.data && dadosBusca.data.length > 0 && dadosBusca.data[0]?.id) {
            return dadosBusca.data[0].id;
          }
        }
      }
    } catch {
      // Caso a busca prévia falhe por conexão, continua com a criação
    }

    const payload: Record<string, string | undefined> = {
      name: parametros.dadosFiscais.nomeOuRazaoSocial,
      cpfCnpj: parametros.dadosFiscais.cpfOuCnpj,
      email: parametros.dadosFiscais.email,
      externalReference: parametros.organizacaoId,
    };

    if (parametros.dadosFiscais.telefone) {
      payload.phone = parametros.dadosFiscais.telefone;
    }
    if (parametros.dadosFiscais.cep) {
      payload.postalCode = parametros.dadosFiscais.cep;
    }
    if (parametros.dadosFiscais.enderecoNumero) {
      payload.addressNumber = parametros.dadosFiscais.enderecoNumero;
    }

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
      let mensagemErro = detalhe;
      try {
        const jsonErro = JSON.parse(detalhe) as { errors?: { description: string }[] };
        if (jsonErro.errors && jsonErro.errors.length > 0) {
          mensagemErro = jsonErro.errors.map((e) => e.description).join("; ");
        }
      } catch {
        if (detalhe.includes("<!DOCTYPE") || detalhe.includes("<html")) {
          mensagemErro = `Servidor Asaas retornou HTTP ${resposta.status} (${resposta.statusText})`;
        }
      }
      throw new Error(`Falha ao registrar cliente no Asaas: ${mensagemErro}`);
    }

    const dados = (await resposta.json()) as { id: string };
    return dados.id;
  }

  public async criarAssinatura(
    parametros: ParametrosCriarAssinaturaAsaas,
  ): Promise<RespostaCriacaoAssinaturaAsaas> {
    const amanha = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const dataPrimeiroVencimento = parametros.dataPrimeiroVencimentoIso || amanha;

    const payload = {
      customer: parametros.clienteAsaasId,
      billingType: "UNDEFINED", // Permite ao assinante escolher PIX, Cartão ou Boleto no checkout Asaas
      value: parametros.valorMensalReais,
      nextDueDate: dataPrimeiroVencimento,
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
      let mensagemErro = detalhe;
      try {
        const jsonErro = JSON.parse(detalhe) as { errors?: { description: string }[] };
        if (jsonErro.errors && jsonErro.errors.length > 0) {
          mensagemErro = jsonErro.errors.map((e) => e.description).join("; ");
        }
      } catch {
        if (detalhe.includes("<!DOCTYPE") || detalhe.includes("<html")) {
          mensagemErro = `Servidor Asaas retornou HTTP ${resposta.status} (${resposta.statusText})`;
        }
      }
      throw new Error(`Falha ao criar assinatura no Asaas: ${mensagemErro}`);
    }

    const dados = (await resposta.json()) as {
      id: string;
      status: string;
      nextDueDate?: string;
      invoiceUrl?: string;
    };

    let urlFatura = dados.invoiceUrl;
    let cobrancaInicialId: string | undefined;

    try {
      const respostaCobrancas = await this.funcaoFetch(
        `${this.urlBase}/subscriptions/${dados.id}/payments`,
        {
          method: "GET",
          headers: {
            access_token: this.chaveApi,
          },
        },
      );
      if (respostaCobrancas.ok) {
        const contentType = respostaCobrancas.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const dadosCobrancas = (await respostaCobrancas.json()) as {
            data?: readonly {
              id?: string;
              invoiceUrl?: string;
              bankSlipUrl?: string;
            }[];
          };
          const primeira = dadosCobrancas.data?.[0];
          if (primeira) {
            urlFatura = primeira.invoiceUrl || primeira.bankSlipUrl || urlFatura;
            cobrancaInicialId = primeira.id;
          }
        }
      }
    } catch {
      // Se a busca da cobrança inicial falhar, continua normalmente
    }

    return {
      assinaturaAsaasId: dados.id,
      urlFaturaOuCheckout: urlFatura,
      proximoVencimento: dados.nextDueDate,
      situacao: dados.status,
      cobrancaInicialId,
    };
  }

  public async criarCobrancaAvulsaImplantacao(
    parametros: ParametrosCriarCobrancaImplantacaoAsaas,
  ): Promise<RespostaCriacaoCobrancaAvulsaAsaas> {
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

  public async cancelarAssinatura(assinaturaAsaasId: string): Promise<void> {
    const resposta = await this.funcaoFetch(`${this.urlBase}/subscriptions/${assinaturaAsaasId}`, {
      method: "DELETE",
      headers: {
        access_token: this.chaveApi,
      },
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      throw new Error(`Falha ao cancelar assinatura no Asaas: ${detalhe}`);
    }
  }

  public async removerCobranca(cobrancaAsaasId: string): Promise<void> {
    try {
      const resposta = await this.funcaoFetch(`${this.urlBase}/payments/${cobrancaAsaasId}`, {
        method: "DELETE",
        headers: {
          access_token: this.chaveApi,
        },
      });

      if (!resposta.ok) {
        const detalhe = await resposta.text();
        console.warn(`Aviso ao remover cobrança pendente ${cobrancaAsaasId} no Asaas: ${detalhe}`);
      }
    } catch (erro) {
      console.warn(`Erro de conexão ao remover cobrança ${cobrancaAsaasId} no Asaas:`, erro);
    }
  }
}

/**
 * Adaptador simulado restrito ao emulador local quando não há chave de API configurada.
 */
export class AdaptadorAsaasSimulado implements PortaProvedorAsaas {
  public async obterOuCriarCliente(parametros: ParametrosCriarClienteAsaas): Promise<string> {
    return `cus_simulado_${parametros.organizacaoId}`;
  }

  public async criarAssinatura(
    parametros: ParametrosCriarAssinaturaAsaas,
  ): Promise<RespostaCriacaoAssinaturaAsaas> {
    return {
      assinaturaAsaasId: `sub_simulada_${parametros.organizacaoId}`,
      urlFaturaOuCheckout: `https://sandbox.asaas.com/i/simulada-${parametros.organizacaoId}`,
      proximoVencimento: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
      situacao: "ACTIVE",
    };
  }

  public async criarCobrancaAvulsaImplantacao(
    parametros: ParametrosCriarCobrancaImplantacaoAsaas,
  ): Promise<RespostaCriacaoCobrancaAvulsaAsaas> {
    return {
      cobrancaAsaasId: `pay_implantacao_simulada_${parametros.organizacaoId}`,
      urlFaturaOuCheckout: `https://sandbox.asaas.com/i/implantacao-${parametros.organizacaoId}`,
      situacao: "PENDING",
    };
  }

  public async cancelarAssinatura(_assinaturaAsaasId: string): Promise<void> {
    // Sem efeito colateral externo no modo simulado
  }

  public async removerCobranca(_cobrancaAsaasId: string): Promise<void> {
    // Sem efeito colateral externo no modo simulado
  }
}

export function criarProvedorAsaasPadrao(
  opcoes: OpcoesFabricaProvedorAsaas = {},
): PortaProvedorAsaas {
  const chaveApi = (opcoes.chaveApi ?? process.env.ASAAS_API_KEY)?.trim();
  const urlBase = (opcoes.urlBase ?? process.env.ASAAS_URL_BASE)?.trim();
  const permitirSimulacao =
    opcoes.permitirSimulacao ?? process.env.FUNCTIONS_EMULATOR === "true";

  if (!chaveApi) {
    if (permitirSimulacao) {
      return new AdaptadorAsaasSimulado();
    }
    throw new Error("ASAAS_API_KEY não configurada no ambiente de execução.");
  }

  const urlResolvida = urlBase || (permitirSimulacao ? "https://api-sandbox.asaas.com/v3" : "");
  if (!urlResolvida) {
    throw new Error("ASAAS_URL_BASE não configurada no ambiente de execução.");
  }

  return new AdaptadorAsaasHttp({
    chaveApi,
    urlBase: urlResolvida,
    funcaoFetch: opcoes.funcaoFetch,
  });
}
