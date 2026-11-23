"use client";

import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesSecaoColecaoAcervoExperiencia {
  readonly fluxoAtual: DefinicaoMicrofluxo;
  readonly microfluxos: readonly DefinicaoMicrofluxo[];
  readonly podeAlterar: boolean;
  readonly aoAtualizarFluxo: (atualizador: (atual: DefinicaoMicrofluxo) => DefinicaoMicrofluxo) => void;
}

export function SecaoColecaoAcervoExperiencia({
  fluxoAtual,
  microfluxos,
  podeAlterar,
  aoAtualizarFluxo,
}: PropriedadesSecaoColecaoAcervoExperiencia) {
  return (
    <>
      <div className="space-y-2 rounded-xl border border-marfim-200 bg-white p-3.5">
        <label className="block text-[11px] font-semibold tracking-wider text-mineral-700 uppercase">
          Modo de Exibição na Vitrine
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            {
              id: "carrossel",
              rotulo: "Carrossel Swipe",
              desc: "Deslize horizontal moderno com evidência",
            },
            {
              id: "grade_2_colunas",
              rotulo: "2 por Linha (Grid)",
              desc: "Grade de 2 colunas direto na Home",
            },
            {
              id: "modal_gaveta",
              rotulo: "Gaveta / Modal",
              desc: "Botão na Home abrindo painel completo",
            },
          ].map((opcao) => {
            const selecionado = (fluxoAtual.modoExibicaoColecao ?? "modal_gaveta") === opcao.id;
            return (
              <button
                key={opcao.id}
                type="button"
                disabled={!podeAlterar}
                onClick={() =>
                  aoAtualizarFluxo((atual) => ({
                    ...atual,
                    modoExibicaoColecao: opcao.id as
                      | "modal_gaveta"
                      | "carrossel"
                      | "grade_2_colunas",
                  }))
                }
                className={combinarClasses(
                  "flex cursor-pointer flex-col rounded-lg border p-2.5 text-left text-xs transition",
                  selecionado
                    ? "border-indigo-600 bg-indigo-50/50 font-medium text-indigo-950 ring-1 ring-indigo-500"
                    : "border-marfim-200 text-mineral-700 hover:bg-marfim-50",
                )}
              >
                <span className="font-semibold text-mineral-900">{opcao.rotulo}</span>
                <span className="mt-0.5 text-[10px] text-mineral-500">{opcao.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-marfim-200 bg-white p-3.5">
        <div>
          <label className="block text-[11px] font-semibold tracking-wider text-mineral-700 uppercase">
            Ação Principal nos Detalhes do Item (CTA)
          </label>
          <p className="mt-0.5 text-[11px] text-mineral-500">
            Define o que acontece quando o visitante toca no botão de ação dentro dos detalhes de um
            item.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            {
              id: "whatsapp",
              rotulo: "WhatsApp Direto",
              desc: "Abre conversa já com o nome do item",
            },
            {
              id: "microfluxo",
              rotulo: "Iniciar Outra Experiência",
              desc: "Abre percurso (simulação, agendamento, etc.)",
            },
          ].map((opcao) => {
            const tipoCtaAtual = fluxoAtual.configuracaoCtaAcervo?.tipoAcao ?? "whatsapp";
            const selecionado = tipoCtaAtual === opcao.id;
            return (
              <button
                key={opcao.id}
                type="button"
                disabled={!podeAlterar}
                onClick={() =>
                  aoAtualizarFluxo((atual) => ({
                    ...atual,
                    configuracaoCtaAcervo: {
                      ...(atual.configuracaoCtaAcervo ?? { tipoAcao: "whatsapp" }),
                      tipoAcao: opcao.id as "whatsapp" | "microfluxo",
                    },
                  }))
                }
                className={combinarClasses(
                  "flex cursor-pointer flex-col rounded-lg border p-2.5 text-left text-xs transition",
                  selecionado
                    ? "border-emerald-600 bg-emerald-50/50 font-medium text-emerald-950 ring-1 ring-emerald-500"
                    : "border-marfim-200 text-mineral-700 hover:bg-marfim-50",
                )}
              >
                <span className="font-semibold text-mineral-900">{opcao.rotulo}</span>
                <span className="mt-0.5 text-[10px] text-mineral-500">{opcao.desc}</span>
              </button>
            );
          })}
        </div>

        {fluxoAtual.configuracaoCtaAcervo?.tipoAcao === "microfluxo" ? (
          <div>
            <label
              htmlFor="seletor-experiencia-cta"
              className="block text-[11px] font-semibold tracking-wider text-mineral-700 uppercase"
            >
              Experiência Vinculada
            </label>
            <select
              id="seletor-experiencia-cta"
              disabled={!podeAlterar}
              value={fluxoAtual.configuracaoCtaAcervo?.microfluxoId ?? ""}
              onChange={(e) =>
                aoAtualizarFluxo((atual) => ({
                  ...atual,
                  configuracaoCtaAcervo: {
                    tipoAcao: "microfluxo",
                    rotuloBotao: atual.configuracaoCtaAcervo?.rotuloBotao,
                    microfluxoId: e.target.value,
                  },
                }))
              }
              className="mt-1 w-full rounded-lg border border-marfim-200 bg-white px-2.5 py-1.5 text-xs text-mineral-950 focus:border-indigo-400 focus:outline-none"
            >
              <option value="">Selecione a experiência a ser iniciada...</option>
              {microfluxos
                .filter(
                  (m) =>
                    m.id !== fluxoAtual.id &&
                    (m.tipoAcao === "microfluxo" || m.tipoAcao === "agenda"),
                )
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.titulo}
                  </option>
                ))}
            </select>
          </div>
        ) : null}

        <div>
          <label
            htmlFor="rotulo-personalizado-cta"
            className="block text-[11px] font-semibold tracking-wider text-mineral-700 uppercase"
          >
            Texto do Botão (Opcional)
          </label>
          <input
            id="rotulo-personalizado-cta"
            type="text"
            disabled={!podeAlterar}
            maxLength={50}
            value={fluxoAtual.configuracaoCtaAcervo?.rotuloBotao ?? ""}
            placeholder={
              fluxoAtual.configuracaoCtaAcervo?.tipoAcao === "microfluxo"
                ? "Ex.: Solicitar proposta deste item"
                : "Ex.: Tenho interesse neste item"
            }
            onChange={(e) =>
              aoAtualizarFluxo((atual) => ({
                ...atual,
                configuracaoCtaAcervo: {
                  tipoAcao: atual.configuracaoCtaAcervo?.tipoAcao ?? "whatsapp",
                  microfluxoId: atual.configuracaoCtaAcervo?.microfluxoId,
                  rotuloBotao: e.target.value,
                },
              }))
            }
            className="mt-1 w-full rounded-lg border border-marfim-200 bg-white px-2.5 py-1.5 text-xs text-mineral-950 placeholder:text-mineral-400 focus:border-indigo-400 focus:outline-none"
          />
        </div>
      </div>
    </>
  );
}

