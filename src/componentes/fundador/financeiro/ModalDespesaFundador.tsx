"use client";

import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CODIGOS_CATEGORIA_DESPESA_FUNDADOR,
  DESCRITORES_CATEGORIA_DESPESA_FUNDADOR,
  converterUsdParaCentavosBrl,
  obterClassificacaoPadraoCategoria,
  type CategoriaDespesaFundador,
  type ClassificacaoCustoFundador,
  type DespesaOperacionalFundador,
  type ParametrosCriarDespesaFundador,
} from "@/dominio/fundador/tiposDespesasFundador";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import { Botao } from "@/componentes/interface/Botao";

export interface PropriedadesModalDespesaFundador {
  readonly aberto: boolean;
  readonly aoFechar: () => void;
  readonly anoMesPadrao: string;
  readonly despesaEdicao?: DespesaOperacionalFundador | null;
  readonly salvando: boolean;
  readonly aoSalvar: (dados: ParametrosCriarDespesaFundador) => Promise<void>;
}

function parseNumeroDecimal(texto: string): number {
  const normalizado = texto.trim().replace(/\./g, "").replace(",", ".");
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : NaN;
}

export function ModalDespesaFundador({
  aberto,
  aoFechar,
  anoMesPadrao,
  despesaEdicao,
  salvando,
  aoSalvar,
}: PropriedadesModalDespesaFundador) {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState<CategoriaDespesaFundador>("ia");
  const [classificacao, setClassificacao] = useState<ClassificacaoCustoFundador>("opex");
  const [anoMes, setAnoMes] = useState(anoMesPadrao);
  const [emDolar, setEmDolar] = useState(false);
  const [valorBrlTexto, setValorBrlTexto] = useState("");
  const [valorUsdTexto, setValorUsdTexto] = useState("");
  const [cotacaoTexto, setCotacaoTexto] = useState("5,80");
  const [recorrente, setRecorrente] = useState(true);
  const [observacao, setObservacao] = useState("");
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto) {
      return;
    }
    setErroFormulario(null);
    if (despesaEdicao) {
      setTitulo(despesaEdicao.titulo);
      setCategoria(despesaEdicao.categoria);
      setClassificacao(despesaEdicao.classificacao);
      setAnoMes(despesaEdicao.anoMes);
      setRecorrente(despesaEdicao.recorrente);
      setObservacao(despesaEdicao.observacao ?? "");
      if (despesaEdicao.valorOriginalUsd && despesaEdicao.cotacaoDolar) {
        setEmDolar(true);
        setValorUsdTexto(String(despesaEdicao.valorOriginalUsd).replace(".", ","));
        setCotacaoTexto(String(despesaEdicao.cotacaoDolar).replace(".", ","));
        setValorBrlTexto((despesaEdicao.valorCentavos / 100).toFixed(2).replace(".", ","));
      } else {
        setEmDolar(false);
        setValorUsdTexto("");
        setValorBrlTexto((despesaEdicao.valorCentavos / 100).toFixed(2).replace(".", ","));
      }
    } else {
      setTitulo("");
      setCategoria("ia");
      setClassificacao(obterClassificacaoPadraoCategoria("ia"));
      setAnoMes(anoMesPadrao);
      setEmDolar(false);
      setValorBrlTexto("");
      setValorUsdTexto("");
      setCotacaoTexto("5,80");
      setRecorrente(true);
      setObservacao("");
    }
  }, [aberto, despesaEdicao, anoMesPadrao]);

  const centavosConvertidosUsd = emDolar
    ? converterUsdParaCentavosBrl(parseNumeroDecimal(valorUsdTexto), parseNumeroDecimal(cotacaoTexto))
    : 0;

  async function submeter(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroFormulario(null);

    const tituloLimpo = titulo.trim();
    if (tituloLimpo.length < 2) {
      setErroFormulario("Informe um título com pelo menos 2 caracteres.");
      return;
    }

    let valorCentavos = 0;
    let valorOriginalUsd: number | undefined;
    let cotacaoDolar: number | undefined;

    if (emDolar) {
      const usd = parseNumeroDecimal(valorUsdTexto);
      const cotacao = parseNumeroDecimal(cotacaoTexto);
      if (!Number.isFinite(usd) || usd <= 0 || !Number.isFinite(cotacao) || cotacao <= 0) {
        setErroFormulario("Informe um valor em USD e uma cotação válidos.");
        return;
      }
      valorCentavos = converterUsdParaCentavosBrl(usd, cotacao);
      valorOriginalUsd = usd;
      cotacaoDolar = cotacao;
    } else {
      const reais = parseNumeroDecimal(valorBrlTexto);
      if (!Number.isFinite(reais) || reais <= 0) {
        setErroFormulario("Informe um valor em reais maior que zero.");
        return;
      }
      valorCentavos = Math.round(reais * 100);
    }

    if (valorCentavos < 1) {
      setErroFormulario("O valor final deve ser maior que zero.");
      return;
    }

    await aoSalvar({
      titulo: tituloLimpo,
      categoria,
      classificacao,
      anoMes,
      valorCentavos,
      ...(valorOriginalUsd !== undefined ? { valorOriginalUsd } : {}),
      ...(cotacaoDolar !== undefined ? { cotacaoDolar } : {}),
      recorrente,
      ...(observacao.trim() ? { observacao: observacao.trim() } : {}),
    });
  }

  return (
    <DialogoPrimitivo.Root open={aberto} onOpenChange={(novoEstado) => !novoEstado && aoFechar()}>
      <DialogoPrimitivo.Portal>
        <DialogoPrimitivo.Overlay className="animacao-overlay-dialogo fixed inset-0 z-50 bg-mineral-950/50 backdrop-blur-[1px]" />
        <DialogoPrimitivo.Content className="fixed top-1/2 left-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-marfim-200 bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogoPrimitivo.Title className="text-lg font-bold tracking-tight text-mineral-950">
                {despesaEdicao ? "Editar gasto" : "Registrar gasto"}
              </DialogoPrimitivo.Title>
              <DialogoPrimitivo.Description className="mt-0.5 text-xs text-mineral-500">
                Lance custos de servidores, Resend, IA ou despesas operacionais do mês.
              </DialogoPrimitivo.Description>
            </div>
            <DialogoPrimitivo.Close asChild>
              <Botao variante="fantasma" tamanho="compacto" aria-label="Fechar modal">
                <X className="h-4 w-4" aria-hidden="true" />
              </Botao>
            </DialogoPrimitivo.Close>
          </div>

          <form onSubmit={submeter} className="mt-5 space-y-4">
            <div>
              <label htmlFor="despesa-titulo" className="block text-xs font-semibold text-mineral-700">
                Descrição do gasto
              </label>
              <input
                id="despesa-titulo"
                type="text"
                required
                maxLength={100}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Firebase Blaze, Resend Pro, Cursor Pro"
                className="mt-1 w-full rounded-xl border border-marfim-300 bg-white px-3 py-2 text-sm text-mineral-950 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="despesa-categoria"
                  className="block text-xs font-semibold text-mineral-700"
                >
                  Categoria
                </label>
                <select
                  id="despesa-categoria"
                  value={categoria}
                  onChange={(e) => {
                    const novaCategoria = e.target.value as CategoriaDespesaFundador;
                    setCategoria(novaCategoria);
                    setClassificacao(obterClassificacaoPadraoCategoria(novaCategoria));
                  }}
                  className="mt-1 w-full rounded-xl border border-marfim-300 bg-white px-3 py-2 text-sm text-mineral-950 outline-none focus:border-indigo-500"
                >
                  {CODIGOS_CATEGORIA_DESPESA_FUNDADOR.map((codigo) => (
                    <option key={codigo} value={codigo}>
                      {DESCRITORES_CATEGORIA_DESPESA_FUNDADOR[codigo].rotulo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="despesa-mes"
                  className="block text-xs font-semibold text-mineral-700"
                >
                  Mês de referência
                </label>
                <input
                  id="despesa-mes"
                  type="month"
                  required
                  value={anoMes}
                  onChange={(e) => setAnoMes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-marfim-300 bg-white px-3 py-2 text-sm text-mineral-950 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-mineral-700">
                Classificação no cálculo
              </span>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setClassificacao("cogs")}
                  className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                    classificacao === "cogs"
                      ? "border-indigo-600 bg-indigo-50 font-semibold text-indigo-900"
                      : "border-marfim-300 bg-white text-mineral-600 hover:bg-marfim-50"
                  }`}
                >
                  Custo de Entrega (COGS)
                </button>
                <button
                  type="button"
                  onClick={() => setClassificacao("opex")}
                  className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                    classificacao === "opex"
                      ? "border-indigo-600 bg-indigo-50 font-semibold text-indigo-900"
                      : "border-marfim-300 bg-white text-mineral-600 hover:bg-marfim-50"
                  }`}
                >
                  Despesa Operacional (OpEx)
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-marfim-200 bg-marfim-50/60 p-3.5">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-mineral-700">
                <input
                  type="checkbox"
                  checked={emDolar}
                  onChange={(e) => setEmDolar(e.target.checked)}
                  className="h-4 w-4 rounded border-marfim-300 text-indigo-600"
                />
                <span>Lançar em dólar (USD) e converter para R$</span>
              </label>

              {emDolar ? (
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="despesa-usd" className="block text-[11px] text-mineral-600">
                        Valor (US$)
                      </label>
                      <input
                        id="despesa-usd"
                        type="text"
                        inputMode="decimal"
                        value={valorUsdTexto}
                        onChange={(e) => setValorUsdTexto(e.target.value)}
                        placeholder="20,00"
                        className="mt-1 w-full rounded-lg border border-marfim-300 bg-white px-3 py-1.5 text-sm text-mineral-950 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="despesa-cotacao" className="block text-[11px] text-mineral-600">
                        Cotação (R$/US$)
                      </label>
                      <input
                        id="despesa-cotacao"
                        type="text"
                        inputMode="decimal"
                        value={cotacaoTexto}
                        onChange={(e) => setCotacaoTexto(e.target.value)}
                        placeholder="5,80"
                        className="mt-1 w-full rounded-lg border border-marfim-300 bg-white px-3 py-1.5 text-sm text-mineral-950 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-mineral-600">
                    Valor convertido:{" "}
                    <strong className="text-mineral-950">
                      {ValorMonetarioCentavos.deCentavos(
                        centavosConvertidosUsd,
                      ).formatarMoedaBrasileira()}
                    </strong>
                  </p>
                </div>
              ) : (
                <div className="mt-3">
                  <label htmlFor="despesa-brl" className="block text-[11px] text-mineral-600">
                    Valor em reais (R$)
                  </label>
                  <input
                    id="despesa-brl"
                    type="text"
                    inputMode="decimal"
                    value={valorBrlTexto}
                    onChange={(e) => setValorBrlTexto(e.target.value)}
                    placeholder="120,00"
                    className="mt-1 w-full rounded-lg border border-marfim-300 bg-white px-3 py-1.5 text-sm text-mineral-950 outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-mineral-700">
                <input
                  type="checkbox"
                  checked={recorrente}
                  onChange={(e) => setRecorrente(e.target.checked)}
                  className="h-4 w-4 rounded border-marfim-300 text-indigo-600"
                />
                <span>Gasto mensal recorrente</span>
              </label>
            </div>

            <div>
              <label htmlFor="despesa-obs" className="block text-xs font-semibold text-mineral-700">
                Observação (opcional)
              </label>
              <input
                id="despesa-obs"
                type="text"
                maxLength={300}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex: Fatura do cartão com IOF incluso"
                className="mt-1 w-full rounded-xl border border-marfim-300 bg-white px-3 py-2 text-sm text-mineral-950 outline-none focus:border-indigo-500"
              />
            </div>

            {erroFormulario ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                {erroFormulario}
              </p>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Botao variante="operacional_secundario" tamanho="compacto" onClick={aoFechar}>
                Cancelar
              </Botao>
              <Botao
                type="submit"
                variante="operacional_primario"
                tamanho="compacto"
                carregando={salvando}
                textoCarregando="Salvando..."
                className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {despesaEdicao ? "Salvar alterações" : "Registrar gasto"}
              </Botao>
            </div>
          </form>
        </DialogoPrimitivo.Content>
      </DialogoPrimitivo.Portal>
    </DialogoPrimitivo.Root>
  );
}

