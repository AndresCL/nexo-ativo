"use client";

import { useMemo, useState } from "react";
import * as Dialogo from "@radix-ui/react-dialog";
import { Download, FileSpreadsheet, FileText, Info, X } from "lucide-react";
import type { SolicitacaoComercial } from "@/dominio/entidades/solicitacaoComercial";
import type {
  EscopoExportacaoSolicitacoes,
  FormatoExportacaoSolicitacoes,
  PlanilhaXmlExcel,
} from "@/dominio/solicitacoes/exportacao/tiposExportacaoSolicitacoes";
import { gerarMatrizExportacaoSolicitacoes } from "@/dominio/solicitacoes/exportacao/geradorMatrizExportacaoSolicitacoes";
import { serializarMatrizParaCsv } from "@/infraestrutura/exportacao/serializadorCsv";
import {
  serializarLivroParaExcelXml,
  serializarMatrizParaExcelXml,
} from "@/infraestrutura/exportacao/serializadorExcelXml";
import { baixarArquivoNavegador } from "@/infraestrutura/exportacao/baixarArquivoNavegador";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import { Botao } from "@/componentes/interface/Botao";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesDialogoExportacaoSolicitacoes {
  readonly aberto: boolean;
  readonly aoMudarAberto: (aberto: boolean) => void;
  readonly solicitacoes: readonly SolicitacaoComercial[];
  readonly nomeOrganizacao: string;
  readonly focarDesqualificadas?: boolean;
}

export function DialogoExportacaoSolicitacoes({
  aberto,
  aoMudarAberto,
  solicitacoes,
  nomeOrganizacao,
  focarDesqualificadas = false,
}: PropriedadesDialogoExportacaoSolicitacoes) {
  const [formato, setFormato] = useState<FormatoExportacaoSolicitacoes>("excel");
  const [escopo, setEscopo] = useState<EscopoExportacaoSolicitacoes>(
    focarDesqualificadas ? "desqualificadas" : "ativas",
  );

  // Lista de microfluxos únicos presentes nas solicitações
  const microfluxosDisponiveis = useMemo(() => {
    const mapa = new Map<string, { id: string; titulo: string; total: number }>();
    for (const sol of solicitacoes) {
      const atual = mapa.get(sol.microfluxoId);
      if (atual) {
        atual.total += 1;
      } else {
        mapa.set(sol.microfluxoId, {
          id: sol.microfluxoId,
          titulo: sol.tituloExperiencia,
          total: 1,
        });
      }
    }
    return Array.from(mapa.values());
  }, [solicitacoes]);

  // Se houver apenas 1 microfluxo, ele já vem pré-selecionado; se múltiplos, "todas" no Excel ou o primeiro no CSV
  const [fluxoSelecionadoId, setFluxoSelecionadoId] = useState<string>("todas");

  // Ao alternar para CSV, se estiver em "todas" e houver microfluxos, força selecionar o primeiro para evitar colunas misturadas
  function alternarFormato(novoFormato: FormatoExportacaoSolicitacoes) {
    setFormato(novoFormato);
    if (novoFormato === "csv" && fluxoSelecionadoId === "todas" && microfluxosDisponiveis.length > 0) {
      setFluxoSelecionadoId(microfluxosDisponiveis[0]?.id ?? "todas");
    }
  }

  // Filtra as solicitações pelo escopo (ativas/todas/desqualificadas)
  const solicitacoesPorEscopo = useMemo(() => {
    return solicitacoes.filter((item) => {
      if (escopo === "ativas") return item.situacao !== "desqualificada";
      if (escopo === "desqualificadas") return item.situacao === "desqualificada";
      return true;
    });
  }, [solicitacoes, escopo]);

  // Solicitações finais que serão exportadas
  const solicitacoesFinais = useMemo(() => {
    if (fluxoSelecionadoId === "todas") {
      return solicitacoesPorEscopo;
    }
    return solicitacoesPorEscopo.filter(
      (item) => item.microfluxoId === fluxoSelecionadoId,
    );
  }, [solicitacoesPorEscopo, fluxoSelecionadoId]);

  const totalExportadas = solicitacoesFinais.length;

  function executarExportacao() {
    if (totalExportadas === 0) {
      notificar.erro("Nenhuma solicitação encontrada para os filtros selecionados.");
      return;
    }

    try {
      const sufixoData = new Date().toISOString().slice(0, 10);
      const slugOrg =
        nomeOrganizacao
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-") || "solicitacoes";

      if (formato === "csv") {
        // No CSV, exporta estritamente o fluxo selecionado para garantir colunas uniformes
        const matriz = gerarMatrizExportacaoSolicitacoes(solicitacoesPorEscopo, {
          escopo,
          filtroMicrofluxoId:
            fluxoSelecionadoId === "todas" ? undefined : fluxoSelecionadoId,
          consolidarRespostasEmColunaUnica: fluxoSelecionadoId === "todas",
        });

        const slugFluxo =
          fluxoSelecionadoId !== "todas"
            ? `-${fluxoSelecionadoId.slice(0, 20)}`
            : "";

        const conteudoCsv = serializarMatrizParaCsv(matriz);
        baixarArquivoNavegador({
          nomeArquivo: `${slugOrg}${slugFluxo}-solicitacoes-${sufixoData}.csv`,
          conteudo: conteudoCsv,
          tipoMime: "text/csv;charset=utf-8",
        });
      } else {
        // No Excel: se for "todas", gera pastas de trabalho com abas separadas por microfluxo!
        if (fluxoSelecionadoId === "todas" && microfluxosDisponiveis.length > 1) {
          const abas: PlanilhaXmlExcel[] = [];

          // Aba 1: Visão Geral de todas as solicitações
          const matrizGeral = gerarMatrizExportacaoSolicitacoes(solicitacoesPorEscopo, {
            escopo,
            consolidarRespostasEmColunaUnica: true,
          });
          abas.push({ nome: "Visão Geral", matriz: matrizGeral });

          // Abas seguintes: Uma aba por microfluxo com suas colunas específicas
          for (const fluxo of microfluxosDisponiveis) {
            const matrizFluxo = gerarMatrizExportacaoSolicitacoes(solicitacoesPorEscopo, {
              escopo,
              filtroMicrofluxoId: fluxo.id,
            });
            if (matrizFluxo.linhas.length > 0) {
              abas.push({
                nome: fluxo.titulo.slice(0, 30),
                matriz: matrizFluxo,
              });
            }
          }

          const conteudoXml = serializarLivroParaExcelXml(abas);
          baixarArquivoNavegador({
            nomeArquivo: `${slugOrg}-todas-solicitacoes-${sufixoData}.xls`,
            conteudo: conteudoXml,
            tipoMime: "application/vnd.ms-excel",
          });
        } else {
          // Aba única para o fluxo específico selecionado
          const matriz = gerarMatrizExportacaoSolicitacoes(solicitacoesPorEscopo, {
            escopo,
            filtroMicrofluxoId:
              fluxoSelecionadoId === "todas" ? undefined : fluxoSelecionadoId,
          });

          const nomeAba =
            fluxoSelecionadoId !== "todas"
              ? microfluxosDisponiveis.find((f) => f.id === fluxoSelecionadoId)?.titulo ?? "Solicitações"
              : nomeOrganizacao;

          const conteudoXml = serializarMatrizParaExcelXml(matriz, nomeAba);
          baixarArquivoNavegador({
            nomeArquivo: `${slugOrg}-solicitacoes-${sufixoData}.xls`,
            conteudo: conteudoXml,
            tipoMime: "application/vnd.ms-excel",
          });
        }
      }

      notificar.sucesso(
        `Exportação concluída! ${totalExportadas} solicitação(ões) baixada(s).`,
      );
      aoMudarAberto(false);
    } catch (erro: unknown) {
      notificar.erro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível gerar a exportação.",
      );
    }
  }

  return (
    <Dialogo.Root open={aberto} onOpenChange={aoMudarAberto}>
      <Dialogo.Portal>
        <Dialogo.Overlay className="fixed inset-0 z-50 bg-mineral-950/30 backdrop-blur-sm" />
        <Dialogo.Content
          aria-describedby="descricao-dialogo-exportacao"
          className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-marfim-200 bg-white p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-marfim-200 pb-3">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-indigo-700" aria-hidden="true" />
              <Dialogo.Title className="text-sm font-semibold text-mineral-900">
                Exportar Solicitações
              </Dialogo.Title>
            </div>
            <Dialogo.Close
              aria-label="Fechar exportação"
              className="rounded-lg p-1.5 text-mineral-500 hover:bg-marfim-100"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialogo.Close>
          </div>

          <p id="descricao-dialogo-exportacao" className="mt-3 text-xs text-mineral-600 leading-relaxed">
            Baixe seus contatos e respostas estruturadas sem colunas vazias ou misturadas.
          </p>

          <div className="mt-5 space-y-4">
            {/* Formato de Arquivo */}
            <div>
              <label className="block text-xs font-medium text-mineral-800">
                Formato do arquivo
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => alternarFormato("excel")}
                  className={combinarClasses(
                    "flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition",
                    formato === "excel"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600"
                      : "border-marfim-300 bg-white text-mineral-700 hover:bg-marfim-50",
                  )}
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                  <span>Excel (.xls)</span>
                </button>

                <button
                  type="button"
                  onClick={() => alternarFormato("csv")}
                  className={combinarClasses(
                    "flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition",
                    formato === "csv"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-950 ring-1 ring-indigo-600"
                      : "border-marfim-300 bg-white text-mineral-700 hover:bg-marfim-50",
                  )}
                >
                  <FileText className="h-4 w-4 text-indigo-700" aria-hidden="true" />
                  <span>CSV (Por Fluxo)</span>
                </button>
              </div>
            </div>

            {/* Seletor de Experiência / Microfluxo */}
            <div>
              <label htmlFor="seletor-experiencia-exportacao" className="block text-xs font-medium text-mineral-800">
                Experiência / Microfluxo
              </label>

              {formato === "csv" && microfluxosDisponiveis.length > 1 ? (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-800">
                  <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>No CSV, exportamos um fluxo por vez para evitar misturar colunas.</span>
                </p>
              ) : null}

              <select
                id="seletor-experiencia-exportacao"
                value={fluxoSelecionadoId}
                onChange={(e) => setFluxoSelecionadoId(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-marfim-300 bg-white px-3 py-2 text-xs text-mineral-900 focus:border-indigo-600 focus:outline-none"
              >
                {formato === "excel" ? (
                  <option value="todas">
                    Todas as experiências (com abas separadas por fluxo)
                  </option>
                ) : null}
                {microfluxosDisponiveis.map((fluxo) => (
                  <option key={fluxo.id} value={fluxo.id}>
                    {fluxo.titulo} ({fluxo.total})
                  </option>
                ))}
              </select>
            </div>

            {/* Escopo de Solicitações (Ativas / Arquivadas) */}
            <div>
              <label className="block text-xs font-medium text-mineral-800">
                Quais solicitações incluir?
              </label>
              <div className="mt-2 space-y-1.5 text-xs">
                <label className="flex items-center gap-2 rounded-lg border border-marfim-200 p-2 hover:bg-marfim-50/50 cursor-pointer">
                  <input
                    type="radio"
                    name="escopo-exportacao"
                    checked={escopo === "ativas"}
                    onChange={() => setEscopo("ativas")}
                    className="h-3.5 w-3.5 text-indigo-600 border-marfim-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-medium text-mineral-900">Apenas ativas</span>
                    <span className="ml-1 text-mineral-500">(Quadro comercial ativo)</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 rounded-lg border border-marfim-200 p-2 hover:bg-marfim-50/50 cursor-pointer">
                  <input
                    type="radio"
                    name="escopo-exportacao"
                    checked={escopo === "todas"}
                    onChange={() => setEscopo("todas")}
                    className="h-3.5 w-3.5 text-indigo-600 border-marfim-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-medium text-mineral-900">Todas as situações</span>
                    <span className="ml-1 text-mineral-500">(inclui desqualificadas)</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 rounded-lg border border-marfim-200 p-2 hover:bg-marfim-50/50 cursor-pointer">
                  <input
                    type="radio"
                    name="escopo-exportacao"
                    checked={escopo === "desqualificadas"}
                    onChange={() => setEscopo("desqualificadas")}
                    className="h-3.5 w-3.5 text-indigo-600 border-marfim-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-medium text-mineral-900">Apenas desqualificadas</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Resumo de linhas a exportar */}
            <div className="rounded-lg bg-marfim-50 p-3 text-xs text-mineral-600 flex items-center justify-between">
              <span>Registros a exportar:</span>
              <strong className="font-semibold text-mineral-900">
                {totalExportadas} solicitação(ões)
              </strong>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-marfim-200 pt-4">
            <Botao
              type="button"
              variante="operacional_secundario"
              tamanho="compacto"
              onClick={() => aoMudarAberto(false)}
            >
              Cancelar
            </Botao>
            <Botao
              type="button"
              variante="operacional_primario"
              tamanho="compacto"
              onClick={executarExportacao}
              disabled={totalExportadas === 0}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Baixar {formato === "excel" ? "Excel" : "CSV"}
            </Botao>
          </div>
        </Dialogo.Content>
      </Dialogo.Portal>
    </Dialogo.Root>
  );
}
