"use client";

import { Copy, Pencil, Plus, Repeat, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { calcularResultadoFinanceiroFundador } from "@/dominio/fundador/calculadoraResultadoFinanceiroFundador";
import {
  CODIGOS_CATEGORIA_DESPESA_FUNDADOR,
  DESCRITORES_CATEGORIA_DESPESA_FUNDADOR,
  formatarRotuloAnoMes,
  type CategoriaDespesaFundador,
  type DespesaOperacionalFundador,
  type ParametrosCriarDespesaFundador,
} from "@/dominio/fundador/tiposDespesasFundador";
import type { PontoHistoricoMrrMensal } from "@/dominio/fundador/tiposPainelFundador";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import {
  servicoDespesasFundadorCliente,
  type PortaDespesasFundadorCliente,
} from "@/infraestrutura/fundador/servicoDespesasFundadorCliente";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { GradeCardsFinanceiroFundador } from "@/componentes/fundador/financeiro/GradeCardsFinanceiroFundador";
import { GraficoResultadoFinanceiroFundador } from "@/componentes/fundador/financeiro/GraficoResultadoFinanceiroFundador";
import { ModalDespesaFundador } from "@/componentes/fundador/financeiro/ModalDespesaFundador";

export interface PropriedadesPainelFinanceiroFundador {
  readonly historicoMrrInicial: readonly PontoHistoricoMrrMensal[];
  readonly despesasIniciais: readonly DespesaOperacionalFundador[];
  readonly anoMesInicial: string;
  readonly assinaturasAtivas: number;
  readonly servicoDespesas?: PortaDespesasFundadorCliente;
}

export function PainelFinanceiroFundador({
  historicoMrrInicial,
  despesasIniciais,
  anoMesInicial,
  assinaturasAtivas,
  servicoDespesas = servicoDespesasFundadorCliente,
}: PropriedadesPainelFinanceiroFundador) {
  const [despesas, setDespesas] = useState<readonly DespesaOperacionalFundador[]>(despesasIniciais);
  const [anoMesSelecionado, setAnoMesSelecionado] = useState(anoMesInicial);
  const [filtroCategoria, setFiltroCategoria] = useState<"todas" | CategoriaDespesaFundador>(
    "todas",
  );
  const [modalAberto, setModalAberto] = useState(false);
  const [despesaEdicao, setDespesaEdicao] = useState<DespesaOperacionalFundador | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [copiandoMesAnterior, setCopiandoMesAnterior] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  const resultado = useMemo(
    () =>
      calcularResultadoFinanceiroFundador({
        historicoMrrMensal: historicoMrrInicial,
        despesas,
        anoMesSelecionado,
        assinaturasAtivas,
      }),
    [historicoMrrInicial, despesas, anoMesSelecionado, assinaturasAtivas],
  );

  const despesasMesSelecionado = useMemo(() => {
    return despesas
      .filter((item) => item.anoMes === anoMesSelecionado)
      .filter((item) => filtroCategoria === "todas" || item.categoria === filtroCategoria)
      .sort((a, b) => b.valorCentavos - a.valorCentavos);
  }, [despesas, anoMesSelecionado, filtroCategoria]);

  async function salvarDespesa(dados: ParametrosCriarDespesaFundador) {
    setSalvando(true);
    try {
      if (despesaEdicao) {
        const atualizada = await servicoDespesas.atualizarDespesa(despesaEdicao.id, {
          ...dados,
          valorOriginalUsd: dados.valorOriginalUsd ?? null,
          cotacaoDolar: dados.cotacaoDolar ?? null,
          observacao: dados.observacao ?? null,
        });
        setDespesas((atuais) =>
          atuais.map((item) => (item.id === atualizada.id ? atualizada : item)),
        );
        notificar.sucesso("Gasto atualizado com sucesso.");
      } else {
        const criada = await servicoDespesas.criarDespesa(dados);
        setDespesas((atuais) => [criada, ...atuais]);
        notificar.sucesso("Gasto registrado com sucesso.");
      }
      setModalAberto(false);
      setDespesaEdicao(null);
    } catch (e) {
      notificar.erro(e instanceof Error ? e.message : "Falha ao salvar o gasto.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirDespesa(item: DespesaOperacionalFundador) {
    setExcluindoId(item.id);
    try {
      await servicoDespesas.excluirDespesa(item.id);
      setDespesas((atuais) => atuais.filter((d) => d.id !== item.id));
      notificar.sucesso(`"${item.titulo}" removido.`);
    } catch (e) {
      notificar.erro(e instanceof Error ? e.message : "Não foi possível excluir o gasto.");
    } finally {
      setExcluindoId(null);
    }
  }

  async function copiarMesAnterior() {
    setCopiandoMesAnterior(true);
    try {
      const resposta = await servicoDespesas.copiarDoMesAnterior(anoMesSelecionado);
      if (resposta.criadas.length === 0) {
        notificar.sucesso(
          resposta.jaExistiamNoDestino > 0
            ? "Os gastos do mês anterior já constam neste mês."
            : "Nenhum gasto encontrado no mês anterior para copiar.",
        );
        return;
      }
      setDespesas((atuais) => [...resposta.criadas, ...atuais]);
      notificar.sucesso(
        `${resposta.criadas.length} ${
          resposta.criadas.length === 1 ? "gasto copiado" : "gastos copiados"
        } do mês anterior.`,
      );
    } catch (e) {
      notificar.erro(
        e instanceof Error ? e.message : "Não foi possível copiar os gastos do mês anterior.",
      );
    } finally {
      setCopiandoMesAnterior(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-marfim-200/80 pb-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
            Nexo Ativo · Controle Financeiro do Fundador
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
            Financeiro e Gastos
          </h1>
          <p className="mt-1 text-xs text-mineral-500">
            Compare o MRR líquido (pós-Asaas) com seus custos de Firebase, Resend, IA e operação.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            aria-label="Selecionar mês de referência"
            value={anoMesSelecionado}
            onChange={(e) => e.target.value && setAnoMesSelecionado(e.target.value)}
            className="h-9 rounded-lg border border-marfim-300 bg-white px-3 text-xs font-medium text-mineral-900 outline-none focus:border-indigo-500"
          />

          <Botao
            variante="operacional_secundario"
            tamanho="compacto"
            onClick={copiarMesAnterior}
            carregando={copiandoMesAnterior}
            textoCarregando="Copiando..."
            className="rounded-lg"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Copiar mês anterior</span>
          </Botao>

          <Botao
            variante="operacional_primario"
            tamanho="compacto"
            onClick={() => {
              setDespesaEdicao(null);
              setModalAberto(true);
            }}
            className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Registrar gasto</span>
          </Botao>
        </div>
      </header>

      <GradeCardsFinanceiroFundador
        resumo={resultado.resumoMesSelecionado}
        unitEconomics={resultado.unitEconomics}
      />

      <GraficoResultadoFinanceiroFundador
        serieMensal={resultado.serieMensal}
        composicaoPorCategoria={resultado.composicaoPorCategoria}
        rotuloMesSelecionado={formatarRotuloAnoMes(anoMesSelecionado)}
      />

      <CartaoSuperficie className="rounded-2xl border border-marfim-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-mineral-950">
              Lançamentos de {formatarRotuloAnoMes(anoMesSelecionado)}
            </h2>
            <p className="mt-0.5 text-xs text-mineral-500">
              {despesasMesSelecionado.length}{" "}
              {despesasMesSelecionado.length === 1 ? "gasto listado" : "gastos listados"}
            </p>
          </div>

          <select
            aria-label="Filtrar gastos por categoria"
            value={filtroCategoria}
            onChange={(e) =>
              setFiltroCategoria(e.target.value as "todas" | CategoriaDespesaFundador)
            }
            className="h-9 rounded-lg border border-marfim-300 bg-white px-3 text-xs font-medium text-mineral-800 outline-none focus:border-indigo-500"
          >
            <option value="todas">Todas as categorias</option>
            {CODIGOS_CATEGORIA_DESPESA_FUNDADOR.map((codigo) => (
              <option key={codigo} value={codigo}>
                {DESCRITORES_CATEGORIA_DESPESA_FUNDADOR[codigo].rotulo}
              </option>
            ))}
          </select>
        </div>

        {despesasMesSelecionado.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-marfim-300 bg-marfim-50/50 px-4 py-10 text-center">
            <p className="text-sm font-medium text-mineral-700">
              Nenhum gasto registrado em {formatarRotuloAnoMes(anoMesSelecionado)}.
            </p>
            <p className="mt-1 text-xs text-mineral-500">
              Clique em &ldquo;Registrar gasto&rdquo; ou copie os lançamentos do mês anterior.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-marfim-200 text-[11px] font-semibold tracking-wide text-mineral-500 uppercase">
                  <th className="py-2.5 pr-4">Descrição</th>
                  <th className="px-3 py-2.5">Categoria</th>
                  <th className="px-3 py-2.5">Tipo</th>
                  <th className="px-3 py-2.5 text-right">Valor</th>
                  <th className="py-2.5 pl-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-marfim-100">
                {despesasMesSelecionado.map((item) => {
                  const descritor = DESCRITORES_CATEGORIA_DESPESA_FUNDADOR[item.categoria];
                  return (
                    <tr key={item.id} className="hover:bg-marfim-50/50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-mineral-950">{item.titulo}</span>
                          {item.recorrente ? (
                            <span
                              title="Gasto mensal recorrente"
                              className="inline-flex items-center gap-1 rounded-full bg-marfim-100 px-2 py-0.5 text-[10px] font-medium text-mineral-600"
                            >
                              <Repeat className="h-2.5 w-2.5" aria-hidden="true" />
                              Mensal
                            </span>
                          ) : null}
                        </div>
                        {item.observacao ? (
                          <p className="mt-0.5 text-xs text-mineral-500">{item.observacao}</p>
                        ) : null}
                        {item.valorOriginalUsd && item.cotacaoDolar ? (
                          <p className="mt-0.5 text-[11px] text-mineral-400">
                            US$ {item.valorOriginalUsd.toFixed(2).replace(".", ",")} × R${" "}
                            {item.cotacaoDolar.toFixed(2).replace(".", ",")}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${descritor.classeBadge}`}
                        >
                          {descritor.rotulo}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-mineral-600">
                        {item.classificacao === "cogs" ? "Entrega (COGS)" : "Operação (OpEx)"}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-mineral-950">
                        {ValorMonetarioCentavos.deCentavos(
                          item.valorCentavos,
                        ).formatarMoedaBrasileira()}
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setDespesaEdicao(item);
                              setModalAberto(true);
                            }}
                            aria-label={`Editar ${item.titulo}`}
                            className="rounded-lg p-1.5 text-mineral-500 transition-colors hover:bg-marfim-100 hover:text-mineral-950"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            disabled={excluindoId === item.id}
                            onClick={() => excluirDespesa(item)}
                            aria-label={`Excluir ${item.titulo}`}
                            className="rounded-lg p-1.5 text-mineral-500 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CartaoSuperficie>

      <ModalDespesaFundador
        aberto={modalAberto}
        aoFechar={() => {
          setModalAberto(false);
          setDespesaEdicao(null);
        }}
        anoMesPadrao={anoMesSelecionado}
        despesaEdicao={despesaEdicao}
        salvando={salvando}
        aoSalvar={salvarDespesa}
      />
    </div>
  );
}

