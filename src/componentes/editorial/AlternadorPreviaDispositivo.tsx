"use client";

import { useMemo, useState } from "react";
import type { AcervoPublicoVitrine } from "@/dominio/entidades/catalogoConteudo";
import {
  obterComposicoesEditoriaisAtivas,
  type TipoComposicaoEditorial,
} from "@/dominio/entidades/composicaoEditorial";
import type { ConteudoPaginaPublicada } from "@/dominio/entidades/paginaPublicada";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import {
  ContextoAmbienteVitrine,
  criarServicoAgendamentoDemonstracao,
  criarServicoSubmissaoDemonstracao,
  type ValorContextoAmbienteVitrine,
} from "./contextoAmbienteVitrine";
import { QuadroEscalonavelSmartphone } from "./QuadroEscalonavelSmartphone";
import { VitrinePublicaInterativa } from "./VitrinePublicaInterativa";

export type ModoDispositivoPrevia = "mobile";

const ACERVO_VAZIO: AcervoPublicoVitrine = {
  servicos: [],
  produtos: [],
  projetosPortfolio: [],
  profissionais: [],
  microfluxos: [],
};

export interface PropriedadesAlternadorPreviaDispositivo {
  readonly aparencia?: "escura" | "clara";
  readonly acervo?: AcervoPublicoVitrine;
  readonly exibirAvaliacoesGoogle?: boolean;
  readonly paginaBase: ConteudoPaginaPublicada;
  readonly permitirTrocarComposicao?: boolean;
}

/**
 * Moldura de smartphone Mobile (390px) que hospeda a própria VitrinePublicaInterativa
 * em modo demonstração 100% funcional, com Portais contidos, navegação isolada,
 * telemetria desativada e submissão simulada (DRY + SOLID).
 */
export function AlternadorPreviaDispositivo({
  aparencia = "escura",
  acervo = ACERVO_VAZIO,
  exibirAvaliacoesGoogle = true,
  paginaBase,
  permitirTrocarComposicao = false,
}: PropriedadesAlternadorPreviaDispositivo) {
  const clara = aparencia === "clara";
  const [containerMoldura, setContainerMoldura] = useState<HTMLDivElement | null>(null);
  const [composicaoSelecionada, setComposicaoSelecionada] = useState<TipoComposicaoEditorial>(
    paginaBase.composicaoVisual,
  );

  const servicoSubmissaoDemo = useMemo(() => criarServicoSubmissaoDemonstracao(), []);
  const servicoAgendamentoDemo = useMemo(() => criarServicoAgendamentoDemonstracao(), []);

  const valorAmbientePrevia = useMemo<ValorContextoAmbienteVitrine>(
    () => ({
      containerPortal: containerMoldura,
      modoPrevia: true,
      sincronizarHistoricoNavegador: false,
      registrarEventoTelemetria: async () => {},
      servicoSubmissao: servicoSubmissaoDemo,
      servicoAgendamento: servicoAgendamentoDemo,
      aoNavegarEmPrevia: (destino, tipo) => {
        if (tipo === "telefone") {
          notificar.informacao(`Prévia de ligação: o visitante discará para ${destino}.`);
        } else {
          notificar.informacao(`Prévia de navegação: o visitante será levado para ${destino}.`);
        }
      },
    }),
    [containerMoldura, servicoSubmissaoDemo, servicoAgendamentoDemo],
  );

  const paginaPrevia: ConteudoPaginaPublicada = permitirTrocarComposicao
    ? { ...paginaBase, composicaoVisual: composicaoSelecionada }
    : paginaBase;

  return (
    <div className="space-y-4">
      {permitirTrocarComposicao ? (
        <div
          className={combinarClasses(
            "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
            clara
              ? "border-marfim-200 bg-white text-mineral-800 shadow-xs"
              : "border-marfim-100/14 bg-mineral-900/90 text-marfim-100",
          )}
        >
          <div
            role="group"
            aria-label="Escolher composição editorial"
            className="flex flex-wrap items-center gap-1.5"
          >
            {obterComposicoesEditoriaisAtivas().map((descritor) => {
              const codigo = descritor.codigo;
              const ativa = composicaoSelecionada === codigo;
              return (
                <button
                  key={codigo}
                  type="button"
                  aria-pressed={ativa}
                  onClick={() => setComposicaoSelecionada(codigo)}
                  className={combinarClasses(
                    "min-h-10 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
                    ativa
                      ? "bg-marfim-100 text-mineral-950"
                      : "text-mineral-300 hover:bg-marfim-100/10 hover:text-marfim-100",
                  )}
                >
                  {descritor.nome}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Casca externa relative + overflow-hidden funciona como container dos Portais (BottomSheets e Cartão Digital) */}
      <QuadroEscalonavelSmartphone
        refMoldura={setContainerMoldura}
        dataTestId="quadro-previa-dispositivo"
        dataDispositivo="mobile"
      >
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-width:thin]">
          <ContextoAmbienteVitrine.Provider value={valorAmbientePrevia}>
            <VitrinePublicaInterativa
              pagina={paginaPrevia}
              acervo={acervo}
              servicoSubmissao={servicoSubmissaoDemo}
              duracaoMinimaLoaderMs={0}
              alturaContidaPrevia
              exibirAvaliacoesGoogle={exibirAvaliacoesGoogle}
            />
          </ContextoAmbienteVitrine.Provider>
        </div>
      </QuadroEscalonavelSmartphone>
    </div>
  );
}
