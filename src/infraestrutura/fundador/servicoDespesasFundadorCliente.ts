import type {
  DespesaOperacionalFundador,
  ParametrosAtualizarDespesaFundador,
  ParametrosCriarDespesaFundador,
} from "@/dominio/fundador/tiposDespesasFundador";

export interface PortaDespesasFundadorCliente {
  criarDespesa(parametros: ParametrosCriarDespesaFundador): Promise<DespesaOperacionalFundador>;
  atualizarDespesa(
    despesaId: string,
    parametros: ParametrosAtualizarDespesaFundador,
  ): Promise<DespesaOperacionalFundador>;
  excluirDespesa(despesaId: string): Promise<void>;
  copiarDoMesAnterior(anoMesDestino: string): Promise<{
    readonly criadas: DespesaOperacionalFundador[];
    readonly jaExistiamNoDestino: number;
  }>;
}

async function extrairErroResposta(resposta: Response, fallback: string): Promise<string> {
  const corpo = (await resposta.json().catch(() => null)) as { erro?: string } | null;
  return corpo?.erro ?? fallback;
}

export class ServicoDespesasFundadorCliente implements PortaDespesasFundadorCliente {
  public async criarDespesa(
    parametros: ParametrosCriarDespesaFundador,
  ): Promise<DespesaOperacionalFundador> {
    const resposta = await fetch("/api/fundador/despesas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parametros),
    });

    if (!resposta.ok) {
      throw new Error(await extrairErroResposta(resposta, "Não foi possível registrar o gasto."));
    }

    const dados = (await resposta.json()) as { despesa: DespesaOperacionalFundador };
    return dados.despesa;
  }

  public async atualizarDespesa(
    despesaId: string,
    parametros: ParametrosAtualizarDespesaFundador,
  ): Promise<DespesaOperacionalFundador> {
    const resposta = await fetch(`/api/fundador/despesas/${encodeURIComponent(despesaId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parametros),
    });

    if (!resposta.ok) {
      throw new Error(await extrairErroResposta(resposta, "Não foi possível atualizar o gasto."));
    }

    const dados = (await resposta.json()) as { despesa: DespesaOperacionalFundador };
    return dados.despesa;
  }

  public async excluirDespesa(despesaId: string): Promise<void> {
    const resposta = await fetch(`/api/fundador/despesas/${encodeURIComponent(despesaId)}`, {
      method: "DELETE",
    });

    if (!resposta.ok) {
      throw new Error(await extrairErroResposta(resposta, "Não foi possível excluir o gasto."));
    }
  }

  public async copiarDoMesAnterior(anoMesDestino: string): Promise<{
    readonly criadas: DespesaOperacionalFundador[];
    readonly jaExistiamNoDestino: number;
  }> {
    const resposta = await fetch("/api/fundador/despesas/copiar-mes-anterior", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anoMesDestino }),
    });

    if (!resposta.ok) {
      throw new Error(
        await extrairErroResposta(resposta, "Não foi possível copiar os gastos do mês anterior."),
      );
    }

    return (await resposta.json()) as {
      criadas: DespesaOperacionalFundador[];
      jaExistiamNoDestino: number;
    };
  }
}

export const servicoDespesasFundadorCliente: PortaDespesasFundadorCliente =
  new ServicoDespesasFundadorCliente();

