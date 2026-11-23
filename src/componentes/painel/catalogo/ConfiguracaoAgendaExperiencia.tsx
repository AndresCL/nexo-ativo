"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import type { ConfiguracaoAgendaVitrine } from "@/dominio/agenda/tiposAgenda";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";

export interface PropriedadesConfiguracaoAgendaExperiencia {
  readonly fluxoAtual: DefinicaoMicrofluxo;
  readonly desabilitado?: boolean;
  readonly aoAlterarAgenda: (novaConfig: ConfiguracaoAgendaVitrine) => void;
}

export function ConfiguracaoAgendaExperiencia({
  fluxoAtual,
  desabilitado = false,
  aoAlterarAgenda,
}: PropriedadesConfiguracaoAgendaExperiencia) {
  const atual: ConfiguracaoAgendaVitrine = fluxoAtual.configuracaoAgenda ?? {
    exigirTelefone: true,
    exibirCampoObservacoes: true,
  };

  function atualizarParcial(parcial: Partial<ConfiguracaoAgendaVitrine>) {
    aoAlterarAgenda({ ...atual, ...parcial });
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
        <div className="flex items-start gap-2.5">
          <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-emerald-950">
              Dias abertos e reservas ficam no menu Agenda
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-900/80">
              Marque os dias/horários disponíveis e acompanhe quem reservou diretamente em{" "}
              <strong>Agenda</strong>.
            </p>
          </div>
        </div>
        <Link
          href="/painel/agenda"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-emerald-800 px-3 text-xs font-semibold text-white hover:bg-emerald-900"
        >
          <span>Gerenciar Agenda</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="space-y-4 rounded-xl border border-marfim-200 bg-white p-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-mineral-900">
            Apresentação da Agenda na Vitrine
          </h3>
          <p className="mt-0.5 text-[11px] text-mineral-500">
            Personalize os textos exibidos ao visitante dentro da gaveta de agendamento.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <CampoFormulario
            rotulo="Título do modal (opcional)"
            textoAuxiliar="Se vazio, usa o título do botão na vitrine."
            maxLength={120}
            disabled={desabilitado}
            value={atual.tituloModal ?? ""}
            placeholder={fluxoAtual.rotuloBotaoHome || fluxoAtual.titulo}
            onChange={(e) => atualizarParcial({ tituloModal: e.target.value })}
          />

          <CampoFormulario
            rotulo="Texto do botão de confirmação"
            maxLength={60}
            disabled={desabilitado}
            value={atual.textoBotaoConfirmar ?? ""}
            placeholder="Confirmar agendamento"
            onChange={(e) => atualizarParcial({ textoBotaoConfirmar: e.target.value })}
          />
        </div>

        <CampoFormulario
          rotulo="Descrição curta no topo da agenda (opcional)"
          maxLength={240}
          disabled={desabilitado}
          value={atual.descricaoCurtaModal ?? ""}
          placeholder="Escolha o melhor dia e horário para conversarmos."
          onChange={(e) => atualizarParcial({ descricaoCurtaModal: e.target.value })}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <CampoFormulario
            rotulo="Título da tela de confirmação"
            maxLength={120}
            disabled={desabilitado}
            value={atual.mensagemConfirmacaoTitulo ?? ""}
            placeholder="Agendamento confirmado!"
            onChange={(e) => atualizarParcial({ mensagemConfirmacaoTitulo: e.target.value })}
          />

          <CampoFormulario
            rotulo="Mensagem de confirmação"
            maxLength={320}
            disabled={desabilitado}
            value={atual.mensagemConfirmacaoCorpo ?? ""}
            placeholder="Seu horário foi reservado com sucesso."
            onChange={(e) => atualizarParcial({ mensagemConfirmacaoCorpo: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap gap-5 border-t border-marfim-100 pt-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-mineral-800">
            <input
              type="checkbox"
              disabled={desabilitado}
              checked={atual.exigirTelefone ?? true}
              onChange={(e) => atualizarParcial({ exigirTelefone: e.target.checked })}
              className="h-4 w-4 rounded border-marfim-300 accent-mineral-950"
            />
            <span>Exigir WhatsApp / Telefone</span>
          </label>

          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-mineral-800">
            <input
              type="checkbox"
              disabled={desabilitado}
              checked={atual.exibirCampoObservacoes ?? true}
              onChange={(e) => atualizarParcial({ exibirCampoObservacoes: e.target.checked })}
              className="h-4 w-4 rounded border-marfim-300 accent-mineral-950"
            />
            <span>Exibir campo de observações</span>
          </label>
        </div>
      </div>
    </div>
  );
}

