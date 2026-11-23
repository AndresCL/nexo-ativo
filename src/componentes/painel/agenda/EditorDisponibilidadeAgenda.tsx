"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarCheck2, Info, Save, Sparkles, Trash2 } from "lucide-react";
import {
  adicionarDiasDataIso,
  diferencaDiasEntreDatasIso,
  formatarDataCurtaPtBr,
  formatarDataExtensoPtBr,
  listarDatasDoMes,
  obterDiaSemanaDataIso,
} from "@/dominio/agenda/calendarioDatas";
import type {
  AgendamentoAgenda,
  ConfiguracaoAgendaOrganizacao,
  FaixaHorarioDia,
} from "@/dominio/agenda/tiposAgenda";
import { GradeCalendarioMensal } from "@/componentes/agenda/GradeCalendarioMensal";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { TooltipInformativo } from "@/componentes/interface/TooltipInformativo";
import { EditorFaixasHorarioDia } from "./EditorFaixasHorarioDia";

export interface PropriedadesEditorDisponibilidadeAgenda {
  readonly configuracao: ConfiguracaoAgendaOrganizacao;
  readonly agendamentos: readonly AgendamentoAgenda[];
  readonly hojeIso: string;
  readonly podeEditar: boolean;
  readonly salvando: boolean;
  readonly haAlteracoesPendentes: boolean;
  readonly aoAlterarConfiguracao: (novaConfig: ConfiguracaoAgendaOrganizacao) => void;
  readonly aoSalvar: () => Promise<void>;
}

export function EditorDisponibilidadeAgenda({
  configuracao,
  agendamentos,
  hojeIso,
  podeEditar,
  salvando,
  haAlteracoesPendentes,
  aoAlterarConfiguracao,
  aoSalvar,
}: PropriedadesEditorDisponibilidadeAgenda) {
  const [anoMes, setAnoMes] = useState(() => hojeIso.slice(0, 7));
  const [dataSelecionada, setDataSelecionada] = useState<string>(hojeIso);

  const contagemConfirmadosPorData = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const a of agendamentos) {
      if (a.situacao === "confirmado") {
        mapa.set(a.dataIso, (mapa.get(a.dataIso) ?? 0) + 1);
      }
    }
    return mapa;
  }, [agendamentos]);

  const faixasDiaSelecionado = configuracao.datasAbertas[dataSelecionada];
  const diaSelecionadoAberto = Boolean(faixasDiaSelecionado && faixasDiaSelecionado.length > 0);
  const reservasConfirmadasNoDia = contagemConfirmadosPorData.get(dataSelecionada) ?? 0;

  const dataLimiteJanela = adicionarDiasDataIso(hojeIso, configuracao.janelaMaximaDias);
  const diasAbertosForaDaJanela = useMemo(
    () =>
      Object.entries(configuracao.datasAbertas)
        .filter(([dataIso, faixas]) => faixas.length > 0 && dataIso > dataLimiteJanela)
        .map(([dataIso]) => dataIso)
        .sort(),
    [configuracao.datasAbertas, dataLimiteJanela],
  );
  const ultimaDataAbertaForaDaJanela = diasAbertosForaDaJanela[diasAbertosForaDaJanela.length - 1];
  const diasNecessariosParaCobrir = ultimaDataAbertaForaDaJanela
    ? diferencaDiasEntreDatasIso(hojeIso, ultimaDataAbertaForaDaJanela)
    : 0;
  const janelaSugerida = ([15, 30, 60, 90] as const).find(
    (opcao) => opcao >= diasNecessariosParaCobrir,
  ) ?? 90;
  const diaSelecionadoForaDaJanela = diaSelecionadoAberto && dataSelecionada > dataLimiteJanela;

  function alternarAberturaDia(dataIso: string, abrir: boolean) {
    if (!podeEditar) return;
    const copia = { ...configuracao.datasAbertas };
    if (abrir) {
      copia[dataIso] = configuracao.horarioPadraoAplicacaoRapida.map((f) => ({ ...f }));
    } else {
      delete copia[dataIso];
    }
    aoAlterarConfiguracao({ ...configuracao, datasAbertas: copia });
  }

  function atualizarFaixasDia(dataIso: string, novasFaixas: readonly FaixaHorarioDia[]) {
    if (!podeEditar) return;
    const copia = { ...configuracao.datasAbertas };
    if (novasFaixas.length === 0) {
      delete copia[dataIso];
    } else {
      copia[dataIso] = novasFaixas;
    }
    aoAlterarConfiguracao({ ...configuracao, datasAbertas: copia });
  }

  function aplicarLoteNoMes(tipo: "uteis" | "sabados" | "limpar") {
    if (!podeEditar) return;
    const datasMes = listarDatasDoMes(anoMes);
    const copia = { ...configuracao.datasAbertas };

    for (const dataIso of datasMes) {
      if (dataIso < hojeIso) continue;
      const diaSemana = obterDiaSemanaDataIso(dataIso);

      if (tipo === "limpar") {
        delete copia[dataIso];
      } else if (tipo === "uteis" && diaSemana >= 1 && diaSemana <= 5) {
        copia[dataIso] = configuracao.horarioPadraoAplicacaoRapida.map((f) => ({ ...f }));
      } else if (tipo === "sabados" && diaSemana === 6) {
        copia[dataIso] = configuracao.horarioPadraoAplicacaoRapida.map((f) => ({ ...f }));
      }
    }

    aoAlterarConfiguracao({ ...configuracao, datasAbertas: copia });
  }

  return (
    <div className="space-y-5">
      <CartaoSuperficie className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-mineral-950">Regras de atendimento</h2>
            <p className="text-xs text-mineral-500">
              Defina a duração dos horários e o expediente padrão usado ao abrir novos dias.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-mineral-800">
              <input
                type="checkbox"
                disabled={!podeEditar || salvando}
                checked={configuracao.ativo}
                onChange={(e) =>
                  aoAlterarConfiguracao({ ...configuracao, ativo: e.target.checked })
                }
                className="h-4 w-4 rounded border-marfim-300 accent-mineral-950"
              />
              <span>Agenda aberta para novas reservas</span>
            </label>
            <TooltipInformativo
              alinhamento="direita"
              texto="Desmarque para pausar novos agendamentos na vitrine sem perder seus dias configurados nem reservas já confirmadas."
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
            </TooltipInformativo>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1 text-xs font-medium text-mineral-700">
            <div className="flex items-center gap-1.5">
              <label htmlFor="agenda-duracao-slot">Duração do horário</label>
              <TooltipInformativo
                alinhamento="esquerda"
                texto="Tempo de cada atendimento oferecido ao visitante (ex.: 1 hora gera horários de 09:00–10:00, 10:00–11:00)."
              >
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
              </TooltipInformativo>
            </div>
            <select
              id="agenda-duracao-slot"
              disabled={!podeEditar || salvando}
              value={configuracao.duracaoSlotMinutos}
              onChange={(e) =>
                aoAlterarConfiguracao({
                  ...configuracao,
                  duracaoSlotMinutos: Number(e.target.value),
                })
              }
              className="min-h-10 w-full rounded-lg border border-marfim-300 bg-white px-3 text-sm text-mineral-950"
            >
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1h30</option>
              <option value={120}>2 horas</option>
            </select>
          </div>

          <div className="space-y-1 text-xs font-medium text-mineral-700">
            <div className="flex items-center gap-1.5">
              <label htmlFor="agenda-intervalo-slots">Intervalo entre horários</label>
              <TooltipInformativo
                alinhamento="centro"
                texto="Pausa automática entre um atendimento e o próximo para preparação ou descanso."
              >
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
              </TooltipInformativo>
            </div>
            <select
              id="agenda-intervalo-slots"
              disabled={!podeEditar || salvando}
              value={configuracao.intervaloEntreSlotsMinutos}
              onChange={(e) =>
                aoAlterarConfiguracao({
                  ...configuracao,
                  intervaloEntreSlotsMinutos: Number(e.target.value),
                })
              }
              className="min-h-10 w-full rounded-lg border border-marfim-300 bg-white px-3 text-sm text-mineral-950"
            >
              <option value={0}>Sem intervalo</option>
              <option value={10}>10 minutos</option>
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
            </select>
          </div>

          <div className="space-y-1 text-xs font-medium text-mineral-700">
            <div className="flex items-center gap-1.5">
              <label htmlFor="agenda-antecedencia-minima">Antecedência mínima</label>
              <TooltipInformativo
                alinhamento="centro"
                texto="Tempo mínimo antes do horário para permitir reservas, evitando agendamentos de última hora."
              >
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
              </TooltipInformativo>
            </div>
            <select
              id="agenda-antecedencia-minima"
              disabled={!podeEditar || salvando}
              value={configuracao.antecedenciaMinimaHoras}
              onChange={(e) =>
                aoAlterarConfiguracao({
                  ...configuracao,
                  antecedenciaMinimaHoras: Number(e.target.value),
                })
              }
              className="min-h-10 w-full rounded-lg border border-marfim-300 bg-white px-3 text-sm text-mineral-950"
            >
              <option value={0}>Imediata</option>
              <option value={1}>1 hora antes</option>
              <option value={2}>2 horas antes</option>
              <option value={4}>4 horas antes</option>
              <option value={24}>24 horas antes</option>
            </select>
          </div>

          <div className="space-y-1 text-xs font-medium text-mineral-700">
            <div className="flex items-center gap-1.5">
              <label htmlFor="agenda-janela-futura">Janela futura</label>
              <TooltipInformativo
                alinhamento="direita"
                texto="Até quantos dias à frente o visitante pode visualizar e reservar horários na sua agenda."
              >
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
              </TooltipInformativo>
            </div>
            <select
              id="agenda-janela-futura"
              disabled={!podeEditar || salvando}
              value={configuracao.janelaMaximaDias}
              onChange={(e) =>
                aoAlterarConfiguracao({
                  ...configuracao,
                  janelaMaximaDias: Number(e.target.value),
                })
              }
              className="min-h-10 w-full rounded-lg border border-marfim-300 bg-white px-3 text-sm text-mineral-950"
            >
              <option value={15}>Próximos 15 dias</option>
              <option value={30}>Próximos 30 dias</option>
              <option value={60}>Próximos 60 dias</option>
              <option value={90}>Próximos 90 dias</option>
            </select>
          </div>
        </div>

        <div className="border-t border-marfim-200 pt-4">
          <EditorFaixasHorarioDia
            rotulo="Expediente padrão (usado nos atalhos de abertura)"
            faixas={configuracao.horarioPadraoAplicacaoRapida}
            desabilitado={!podeEditar || salvando}
            aoAlterar={(novas) =>
              aoAlterarConfiguracao({
                ...configuracao,
                horarioPadraoAplicacaoRapida: novas,
              })
            }
          />
        </div>
      </CartaoSuperficie>

      {diasAbertosForaDaJanela.length > 0 ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs text-amber-950"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
            <p className="leading-relaxed">
              Você tem{" "}
              <strong>
                {diasAbertosForaDaJanela.length}{" "}
                {diasAbertosForaDaJanela.length === 1 ? "dia aberto" : "dias abertos"}
              </strong>{" "}
              após <strong>{formatarDataCurtaPtBr(dataLimiteJanela)}</strong>
              {ultimaDataAbertaForaDaJanela
                ? ` (até ${formatarDataCurtaPtBr(ultimaDataAbertaForaDaJanela)})`
                : ""}
              , mas eles estão ocultos na vitrine porque a <strong>Janela futura</strong> está em{" "}
              <strong>Próximos {configuracao.janelaMaximaDias} dias</strong>.
            </p>
          </div>
          {podeEditar && janelaSugerida > configuracao.janelaMaximaDias ? (
            <Botao
              type="button"
              variante="operacional_secundario"
              tamanho="compacto"
              disabled={salvando}
              onClick={() =>
                aoAlterarConfiguracao({
                  ...configuracao,
                  janelaMaximaDias: janelaSugerida,
                })
              }
              className="shrink-0 border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
            >
              Ampliar para {janelaSugerida} dias
            </Botao>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <CartaoSuperficie className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-semibold text-mineral-950">Dias abertos no calendário</h2>
            <p className="text-xs text-mineral-500">
              Clique em um dia para abrir, fechar ou personalizar os horários.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!podeEditar || salvando}
              onClick={() => aplicarLoteNoMes("uteis")}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Abrir dias úteis do mês
            </button>
            <button
              type="button"
              disabled={!podeEditar || salvando}
              onClick={() => aplicarLoteNoMes("sabados")}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-marfim-300 bg-white px-3 text-xs font-semibold text-mineral-800 hover:bg-marfim-50 disabled:opacity-40"
            >
              <CalendarCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
              Abrir sábados
            </button>
            <button
              type="button"
              disabled={!podeEditar || salvando}
              onClick={() => aplicarLoteNoMes("limpar")}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-marfim-200 bg-white px-3 text-xs font-medium text-mineral-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Limpar mês
            </button>
          </div>

          <GradeCalendarioMensal
            anoMes={anoMes}
            dataSelecionada={dataSelecionada}
            hojeIso={hojeIso}
            variante="painel"
            aoAlterarMes={setAnoMes}
            aoSelecionarData={setDataSelecionada}
            obterEstadoDia={(dataIso, pertenceAoMes) => {
              if (!pertenceAoMes) return { desabilitado: true };
              const passado = dataIso < hojeIso;
              const aberto = Boolean(configuracao.datasAbertas[dataIso]?.length);
              const qtdReservas = contagemConfirmadosPorData.get(dataIso) ?? 0;
              return {
                disponivel: aberto && !passado,
                desabilitado: passado,
                ...(qtdReservas > 0
                  ? { indicadorTexto: `${qtdReservas}r`, indicadorDestaque: "indigo" as const }
                  : {}),
                ariaDescricao: aberto
                  ? `dia aberto${qtdReservas > 0 ? `, ${qtdReservas} reservas` : ""}`
                  : "dia fechado",
              };
            }}
          />
        </CartaoSuperficie>

        <CartaoSuperficie className="flex flex-col justify-between gap-5 p-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-marfim-200 pb-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-mineral-500">
                  Dia selecionado
                </p>
                <h3 className="mt-0.5 text-base font-semibold capitalize text-mineral-950">
                  {formatarDataExtensoPtBr(dataSelecionada)}
                </h3>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  diaSelecionadoAberto
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border border-marfim-200 bg-marfim-100 text-mineral-600"
                }`}
              >
                {diaSelecionadoAberto ? "Aberto" : "Fechado"}
              </span>
            </div>

            {diaSelecionadoForaDaJanela ? (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                <p>
                  Este dia está aberto, mas <strong>ainda não aparece na vitrine</strong> porque
                  ultrapassa a janela futura atual ({configuracao.janelaMaximaDias} dias, até{" "}
                  {formatarDataCurtaPtBr(dataLimiteJanela)}).
                </p>
              </div>
            ) : null}

            {reservasConfirmadasNoDia > 0 ? (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                <p>
                  Este dia já possui{" "}
                  <strong>
                    {reservasConfirmadasNoDia}{" "}
                    {reservasConfirmadasNoDia === 1 ? "reserva confirmada" : "reservas confirmadas"}
                  </strong>
                  . Fechar o dia impede novas reservas, mas não cancela as reservas já feitas.
                </p>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <Botao
                type="button"
                variante={diaSelecionadoAberto ? "operacional_secundario" : "operacional_primario"}
                tamanho="compacto"
                disabled={!podeEditar || salvando || dataSelecionada < hojeIso}
                onClick={() => alternarAberturaDia(dataSelecionada, !diaSelecionadoAberto)}
              >
                {diaSelecionadoAberto ? "Fechar este dia" : "Abrir este dia com horário padrão"}
              </Botao>
            </div>

            {diaSelecionadoAberto && faixasDiaSelecionado ? (
              <div className="pt-1">
                <EditorFaixasHorarioDia
                  rotulo="Horários específicos deste dia"
                  faixas={faixasDiaSelecionado}
                  desabilitado={!podeEditar || salvando}
                  aoAlterar={(novas) => atualizarFaixasDia(dataSelecionada, novas)}
                />
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-mineral-500">
                Este dia está fechado. Visitantes não verão horários disponíveis nesta data.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-marfim-200 pt-4">
            <span className="text-xs text-mineral-500">
              {haAlteracoesPendentes
                ? "Você tem alterações não salvas."
                : "Disponibilidade sincronizada."}
            </span>
            <Botao
              type="button"
              variante="operacional_primario"
              tamanho="compacto"
              disabled={!podeEditar || salvando || !haAlteracoesPendentes}
              onClick={() => void aoSalvar()}
              className="inline-flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>{salvando ? "Salvando…" : "Salvar disponibilidade"}</span>
            </Botao>
          </div>
        </CartaoSuperficie>
      </div>
    </div>
  );
}

