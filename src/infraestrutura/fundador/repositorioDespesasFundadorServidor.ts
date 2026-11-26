import { FieldValue } from "firebase-admin/firestore";
import {
  CODIGOS_CATEGORIA_DESPESA_FUNDADOR,
  CODIGOS_CLASSIFICACAO_CUSTO_FUNDADOR,
  obterAnoMesAnterior,
  obterClassificacaoPadraoCategoria,
  type CategoriaDespesaFundador,
  type ClassificacaoCustoFundador,
  type DespesaOperacionalFundador,
  type ParametrosAtualizarDespesaFundador,
  type ParametrosCriarDespesaFundador,
} from "@/dominio/fundador/tiposDespesasFundador";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";

const COLECAO_DESPESAS_FUNDADOR = "despesasFundador";

export interface PortaRepositorioDespesasFundadorServidor {
  listarPorFaixaAnoMes(anoMesInicio: string): Promise<DespesaOperacionalFundador[]>;
  criar(
    parametros: ParametrosCriarDespesaFundador,
    autor: { readonly uid: string; readonly email: string | null },
  ): Promise<DespesaOperacionalFundador>;
  atualizar(
    despesaId: string,
    parametros: ParametrosAtualizarDespesaFundador,
    autor: { readonly uid: string; readonly email: string | null },
  ): Promise<DespesaOperacionalFundador | null>;
  excluir(despesaId: string): Promise<boolean>;
  copiarDoMesAnterior(
    anoMesDestino: string,
    autor: { readonly uid: string; readonly email: string | null },
  ): Promise<{
    readonly criadas: DespesaOperacionalFundador[];
    readonly jaExistiamNoDestino: number;
  }>;
}

function normalizarCategoria(valor: unknown): CategoriaDespesaFundador {
  if (
    typeof valor === "string" &&
    (CODIGOS_CATEGORIA_DESPESA_FUNDADOR as readonly string[]).includes(valor)
  ) {
    return valor as CategoriaDespesaFundador;
  }
  return "outros";
}

function normalizarClassificacao(
  valor: unknown,
  categoria: CategoriaDespesaFundador,
): ClassificacaoCustoFundador {
  if (
    typeof valor === "string" &&
    (CODIGOS_CLASSIFICACAO_CUSTO_FUNDADOR as readonly string[]).includes(valor)
  ) {
    return valor as ClassificacaoCustoFundador;
  }
  return obterClassificacaoPadraoCategoria(categoria);
}

function mapearDocumentoParaDespesa(
  id: string,
  dados: FirebaseFirestore.DocumentData,
): DespesaOperacionalFundador {
  const categoria = normalizarCategoria(dados.categoria);
  const classificacao = normalizarClassificacao(dados.classificacao, categoria);

  return {
    id,
    titulo: String(dados.titulo ?? ""),
    categoria,
    classificacao,
    anoMes: String(dados.anoMes ?? ""),
    valorCentavos:
      typeof dados.valorCentavos === "number" && Number.isFinite(dados.valorCentavos)
        ? Math.max(0, Math.round(dados.valorCentavos))
        : 0,
    ...(typeof dados.valorOriginalUsd === "number" && Number.isFinite(dados.valorOriginalUsd)
      ? { valorOriginalUsd: dados.valorOriginalUsd }
      : {}),
    ...(typeof dados.cotacaoDolar === "number" && Number.isFinite(dados.cotacaoDolar)
      ? { cotacaoDolar: dados.cotacaoDolar }
      : {}),
    recorrente: Boolean(dados.recorrente),
    ...(typeof dados.observacao === "string" && dados.observacao.trim().length > 0
      ? { observacao: dados.observacao.trim() }
      : {}),
    criadoEmIso: String(dados.criadoEmIso ?? new Date().toISOString()),
    atualizadoEmIso: String(dados.atualizadoEmIso ?? new Date().toISOString()),
  };
}

export class RepositorioDespesasFundadorFirestore
  implements PortaRepositorioDespesasFundadorServidor
{
  public async listarPorFaixaAnoMes(anoMesInicio: string): Promise<DespesaOperacionalFundador[]> {
    const { bancoDadosAdmin } = obterServicosAdminFirebase();
    const consulta = await bancoDadosAdmin
      .collection(COLECAO_DESPESAS_FUNDADOR)
      .where("anoMes", ">=", anoMesInicio)
      .orderBy("anoMes", "desc")
      .limit(500)
      .get();

    return consulta.docs
      .map((doc) => mapearDocumentoParaDespesa(doc.id, doc.data()))
      .sort((a, b) => {
        if (a.anoMes !== b.anoMes) {
          return b.anoMes.localeCompare(a.anoMes);
        }
        return b.criadoEmIso.localeCompare(a.criadoEmIso);
      });
  }

  public async criar(
    parametros: ParametrosCriarDespesaFundador,
    autor: { readonly uid: string; readonly email: string | null },
  ): Promise<DespesaOperacionalFundador> {
    const { bancoDadosAdmin } = obterServicosAdminFirebase();
    const agoraIso = new Date().toISOString();
    const classificacao =
      parametros.classificacao ?? obterClassificacaoPadraoCategoria(parametros.categoria);

    const documento = {
      titulo: parametros.titulo.trim(),
      categoria: parametros.categoria,
      classificacao,
      anoMes: parametros.anoMes,
      valorCentavos: Math.round(parametros.valorCentavos),
      ...(typeof parametros.valorOriginalUsd === "number"
        ? { valorOriginalUsd: parametros.valorOriginalUsd }
        : {}),
      ...(typeof parametros.cotacaoDolar === "number"
        ? { cotacaoDolar: parametros.cotacaoDolar }
        : {}),
      recorrente: Boolean(parametros.recorrente),
      ...(parametros.observacao?.trim() ? { observacao: parametros.observacao.trim() } : {}),
      autorUid: autor.uid,
      ...(autor.email ? { autorEmail: autor.email } : {}),
      criadoEmIso: agoraIso,
      atualizadoEmIso: agoraIso,
    };

    const ref = await bancoDadosAdmin.collection(COLECAO_DESPESAS_FUNDADOR).add(documento);
    return mapearDocumentoParaDespesa(ref.id, documento);
  }

  public async atualizar(
    despesaId: string,
    parametros: ParametrosAtualizarDespesaFundador,
    autor: { readonly uid: string; readonly email: string | null },
  ): Promise<DespesaOperacionalFundador | null> {
    const { bancoDadosAdmin } = obterServicosAdminFirebase();
    const ref = bancoDadosAdmin.collection(COLECAO_DESPESAS_FUNDADOR).doc(despesaId);
    const atual = await ref.get();

    if (!atual.exists) {
      return null;
    }

    const dadosAtuais = atual.data() ?? {};
    const agoraIso = new Date().toISOString();
    const atualizacoes: Record<string, unknown> = {
      atualizadoEmIso: agoraIso,
      atualizadoPorUid: autor.uid,
      ...(autor.email ? { atualizadoPorEmail: autor.email } : {}),
    };

    if (parametros.titulo !== undefined) {
      atualizacoes.titulo = parametros.titulo.trim();
    }
    if (parametros.categoria !== undefined) {
      atualizacoes.categoria = parametros.categoria;
      if (parametros.classificacao === undefined) {
        atualizacoes.classificacao = obterClassificacaoPadraoCategoria(parametros.categoria);
      }
    }
    if (parametros.classificacao !== undefined) {
      atualizacoes.classificacao = parametros.classificacao;
    }
    if (parametros.anoMes !== undefined) {
      atualizacoes.anoMes = parametros.anoMes;
    }
    if (parametros.valorCentavos !== undefined) {
      atualizacoes.valorCentavos = Math.round(parametros.valorCentavos);
    }
    if (parametros.recorrente !== undefined) {
      atualizacoes.recorrente = parametros.recorrente;
    }
    if (parametros.valorOriginalUsd === null) {
      atualizacoes.valorOriginalUsd = FieldValue.delete();
    } else if (parametros.valorOriginalUsd !== undefined) {
      atualizacoes.valorOriginalUsd = parametros.valorOriginalUsd;
    }
    if (parametros.cotacaoDolar === null) {
      atualizacoes.cotacaoDolar = FieldValue.delete();
    } else if (parametros.cotacaoDolar !== undefined) {
      atualizacoes.cotacaoDolar = parametros.cotacaoDolar;
    }
    if (parametros.observacao === null || parametros.observacao === "") {
      atualizacoes.observacao = FieldValue.delete();
    } else if (parametros.observacao !== undefined) {
      atualizacoes.observacao = parametros.observacao.trim();
    }

    await ref.update(atualizacoes);

    const atualizado = await ref.get();
    return mapearDocumentoParaDespesa(atualizado.id, atualizado.data() ?? dadosAtuais);
  }

  public async excluir(despesaId: string): Promise<boolean> {
    const { bancoDadosAdmin } = obterServicosAdminFirebase();
    const ref = bancoDadosAdmin.collection(COLECAO_DESPESAS_FUNDADOR).doc(despesaId);
    const atual = await ref.get();
    if (!atual.exists) {
      return false;
    }
    await ref.delete();
    return true;
  }

  public async copiarDoMesAnterior(
    anoMesDestino: string,
    autor: { readonly uid: string; readonly email: string | null },
  ): Promise<{
    readonly criadas: DespesaOperacionalFundador[];
    readonly jaExistiamNoDestino: number;
  }> {
    const { bancoDadosAdmin } = obterServicosAdminFirebase();
    const anoMesOrigem = obterAnoMesAnterior(anoMesDestino);

    const [snapOrigem, snapDestino] = await Promise.all([
      bancoDadosAdmin
        .collection(COLECAO_DESPESAS_FUNDADOR)
        .where("anoMes", "==", anoMesOrigem)
        .get(),
      bancoDadosAdmin
        .collection(COLECAO_DESPESAS_FUNDADOR)
        .where("anoMes", "==", anoMesDestino)
        .get(),
    ]);

    const chavesDestino = new Set(
      snapDestino.docs.map((doc) => {
        const d = doc.data();
        return `${String(d.titulo ?? "").trim().toLowerCase()}::${String(d.categoria ?? "")}`;
      }),
    );

    const agoraIso = new Date().toISOString();
    const criadas: DespesaOperacionalFundador[] = [];
    let jaExistiamNoDestino = 0;

    for (const docOrigem of snapOrigem.docs) {
      const origem = mapearDocumentoParaDespesa(docOrigem.id, docOrigem.data());
      const chave = `${origem.titulo.trim().toLowerCase()}::${origem.categoria}`;

      if (chavesDestino.has(chave)) {
        jaExistiamNoDestino += 1;
        continue;
      }

      const nova = await this.criar(
        {
          titulo: origem.titulo,
          categoria: origem.categoria,
          classificacao: origem.classificacao,
          anoMes: anoMesDestino,
          valorCentavos: origem.valorCentavos,
          ...(origem.valorOriginalUsd !== undefined
            ? { valorOriginalUsd: origem.valorOriginalUsd }
            : {}),
          ...(origem.cotacaoDolar !== undefined ? { cotacaoDolar: origem.cotacaoDolar } : {}),
          recorrente: origem.recorrente,
          ...(origem.observacao ? { observacao: origem.observacao } : {}),
        },
        autor,
      );

      criadas.push({ ...nova, criadoEmIso: agoraIso, atualizadoEmIso: agoraIso });
      chavesDestino.add(chave);
    }

    return { criadas, jaExistiamNoDestino };
  }
}

export const repositorioDespesasFundadorServidor: PortaRepositorioDespesasFundadorServidor =
  new RepositorioDespesasFundadorFirestore();

