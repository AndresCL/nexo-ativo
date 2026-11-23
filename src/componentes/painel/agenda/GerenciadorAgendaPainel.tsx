"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Compass, SlidersHorizontal } from "lucide-react";
import type { PortaAgendaPainel } from "@/aplicacao/portas/portasAgenda";
import { obterDataHoraAtualNoFuso } from "@/dominio/agenda/calendarioDatas";
import type {
  AgendamentoAgenda,
  ConfiguracaoAgendaOrganizacao,
  SituacaoAgendamento,
} from "@/dominio/agenda/tiposAgenda";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { TransicaoAlternancia } from "@/componentes/interface/TransicaoAlternancia";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import { servicoAgendaPainelCliente } from "@/infraestrutura/painel/servicoAgendaPainelCliente";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { EditorDisponibilidadeAgenda } from "./EditorDisponibilidadeAgenda";
import { VisaoReservasAgenda } from "./VisaoReservasAgenda";

export interface PropriedadesGerenciadorAgendaPainel {
  readonly organizacaoId: string;
  readonly configuracaoInicial: ConfiguracaoAgendaOrganizacao;
  readonly agendamentosIniciais: readonly AgendamentoAgenda[];
  readonly possuiExperienciaAgendaAtiva: boolean;
  readonly podeGerenciarAgenda: boolean;
  readonly podeEditarDisponibilidade: boolean;
  readonly servicoAgenda?: PortaAgendaPainel;
}

export function GerenciadorAgendaPainel({
  organizacaoId,
  configuracaoInicial,
  agendamentosIniciais,
  possuiExperienciaAgendaAtiva,
  podeGerenciarAgenda,
  podeEditarDisponibilidade,
  servicoAgenda = servicoAgendaPainelCliente,
}: PropriedadesGerenciadorAgendaPainel) {
  const [abaAtiva, setAbaAtiva] = useState<"reservas" | "disponibilidade">(
    Object.keys(configuracaoInicial.datasAbertas).length === 0 ? "disponibilidade" : "reservas",
  );
  const [configuracao, setConfiguracao] = useState(configuracaoInicial);
  const [configuracaoSalva, setConfiguracaoSalva] = useState(configuracaoInicial);
  const [agendamentos, setAgendamentos] = useState(agendamentosIniciais);
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [ocupandoId, setOcupandoId] = useState<string | null>(null);

  const hojeIso = obterDataHoraAtualNoFuso(new Date(), configuracao.fusoHorario).dataIso;

  const haAlteracoesPendentes =
    JSON.stringify(configuracao) !== JSON.stringify(configuracaoSalva);

  const metricas = useMemo(() => {
    let hoje = 0;
    let proximasConfirmadas = 0;
    for (const a of agendamentos) {
      if (a.situacao !== "confirmado") continue;
      if (a.dataIso === hojeIso) hoje += 1;
      if (a.dataIso >= hojeIso) proximasConfirmadas += 1;
    }
    const diasAbertosFuturos = Object.entries(configuracao.datasAbertas).filter(
      ([dataIso, faixas]) => dataIso >= hojeIso && faixas.length > 0,
    ).length;

    return { hoje, proximasConfirmadas, diasAbertosFuturos };
  }, [agendamentos, configuracao.datasAbertas, hojeIso]);

  async function salvarDisponibilidade() {
    setSalvandoConfig(true);
    try {
      const salva = await servicoAgenda.salvarConfiguracaoAgenda(configuracao);
      setConfiguracao(salva);
      setConfiguracaoSalva(salva);
      notificar.sucesso("Disponibilidade da agenda salva com sucesso.");
    } catch (erro) {
      notificar.erro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível salvar a disponibilidade. Revise os horários informados.",
      );
    } finally {
      setSalvandoConfig(false);
    }
  }

  async function atualizarSituacao(parametros: {
    readonly agendamentoId: string;
    readonly situacao: SituacaoAgendamento;
    readonly observacoesInternas?: string;
  }) {
    setOcupandoId(parametros.agendamentoId);
    try {
      const resultado = await servicoAgenda.atualizarSituacaoAgendamento({
        organizacaoId,
        ...parametros,
      });

      setAgendamentos((lista) =>
        lista.map((item) =>
          item.id === resultado.agendamentoId
            ? {
                ...item,
                situacao: resultado.situacao,
                ...(resultado.observacoesInternas !== undefined
                  ? { observacoesInternas: resultado.observacoesInternas }
                  : {}),
                atualizadoEmIso: resultado.atualizadoEmIso,
              }
            : item,
        ),
      );
      notificar.sucesso("Agendamento atualizado.");
    } catch (erro) {
      notificar.erro(
        erro instanceof Error ? erro.message : "Não foi possível atualizar o agendamento.",
      );
    } finally {
      setOcupandoId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-marfim-200/80 pb-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
            Agenda
          </h1>
          <p className="text-xs leading-relaxed text-mineral-500">
            Marque os dias abertos para atendimento e acompanhe as reservas feitas pela sua vitrine.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Seções da agenda"
          className="inline-flex rounded-xl border border-marfim-200 bg-white p-1 shadow-2xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={abaAtiva === "reservas"}
            onClick={() => setAbaAtiva("reservas")}
            className={combinarClasses(
              "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-colors",
              abaAtiva === "reservas"
                ? "bg-mineral-950 text-white"
                : "text-mineral-600 hover:text-mineral-950",
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Reservas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={abaAtiva === "disponibilidade"}
            onClick={() => setAbaAtiva("disponibilidade")}
            className={combinarClasses(
              "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-colors",
              abaAtiva === "disponibilidade"
                ? "bg-mineral-950 text-white"
                : "text-mineral-600 hover:text-mineral-950",
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Disponibilidade
            {haAlteracoesPendentes ? (
              <span className="h-2 w-2 rounded-full bg-amber-400" aria-label="Alterações pendentes" />
            ) : null}
          </button>
        </div>
      </header>

      {!possuiExperienciaAgendaAtiva ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 px-4 py-3 text-xs text-indigo-950">
          <div className="flex items-center gap-2.5">
            <Compass className="h-4 w-4 shrink-0 text-indigo-700" aria-hidden="true" />
            <p>
              Para os visitantes reservarem horários, adicione uma experiência do tipo{" "}
              <strong>Agenda / Agendamento</strong> na sua vitrine e publique a página.
            </p>
          </div>
          <Link
            href="/painel/experiencias"
            className="inline-flex min-h-9 items-center rounded-lg bg-indigo-700 px-3 text-xs font-semibold text-white hover:bg-indigo-800"
          >
            Ir para Experiências
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <CartaoSuperficie className="p-4">
          <p className="text-[11px] font-medium text-mineral-500">Reservas hoje</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-mineral-950">{metricas.hoje}</p>
        </CartaoSuperficie>
        <CartaoSuperficie className="p-4">
          <p className="text-[11px] font-medium text-mineral-500">Próximas reservas</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-mineral-950">
            {metricas.proximasConfirmadas}
          </p>
        </CartaoSuperficie>
        <CartaoSuperficie className="p-4">
          <p className="text-[11px] font-medium text-mineral-500">Dias abertos</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-mineral-950">
            {metricas.diasAbertosFuturos}
          </p>
        </CartaoSuperficie>
      </div>

      <TransicaoAlternancia chaveId={abaAtiva} variante="fade">
        {abaAtiva === "reservas" ? (
          <VisaoReservasAgenda
            agendamentos={agendamentos}
            hojeIso={hojeIso}
            podeGerenciar={podeGerenciarAgenda}
            ocupandoId={ocupandoId}
            aoAtualizarSituacao={atualizarSituacao}
          />
        ) : (
          <EditorDisponibilidadeAgenda
            configuracao={configuracao}
            agendamentos={agendamentos}
            hojeIso={hojeIso}
            podeEditar={podeEditarDisponibilidade}
            salvando={salvandoConfig}
            haAlteracoesPendentes={haAlteracoesPendentes}
            aoAlterarConfiguracao={setConfiguracao}
            aoSalvar={salvarDisponibilidade}
          />
        )}
      </TransicaoAlternancia>
    </div>
  );
}

