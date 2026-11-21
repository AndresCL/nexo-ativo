"use client";

import { useState } from "react";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { CartaoPainelSolicitacaoDemo } from "./CartaoPainelSolicitacaoDemo";
import { EXEMPLOS_MICROFLUXO, type EtapaFluxoDemo } from "./dadosMicrofluxosLanding";
import { RevelacaoScroll } from "./RevelacaoScroll";
import { SimuladorCelularMicrofluxo } from "./SimuladorCelularMicrofluxo";

/**
 * Orquestrador da seção interativa de Microfluxos Comerciais.
 * Começa sem opções pré-selecionadas para que o painel reflita em tempo real cada escolha.
 */
export function SecaoMicrofluxosComerciais() {
  const [exemploId, setExemploId] = useState<string>("arquitetura");
  const [etapa, setEtapa] = useState<EtapaFluxoDemo>(1);
  const [etapaMaximaAlcancada, setEtapaMaximaAlcancada] = useState<EtapaFluxoDemo>(1);
  const [opcaoPasso1Id, setOpcaoPasso1Id] = useState<string | null>(null);
  const [opcaoPasso2Id, setOpcaoPasso2Id] = useState<string | null>(null);
  const [opcoesPasso3Selecionadas, setOpcoesPasso3Selecionadas] = useState<readonly string[]>([]);

  const exemplo =
    EXEMPLOS_MICROFLUXO.find((item) => item.id === exemploId) ?? EXEMPLOS_MICROFLUXO[0];

  if (!exemplo) {
    return null;
  }

  const opcao1Atual = opcaoPasso1Id
    ? exemplo.opcoesPasso1.find((op) => op.id === opcaoPasso1Id) ?? null
    : null;
  const opcao2Atual = opcaoPasso2Id
    ? exemplo.opcoesPasso2.find((op) => op.id === opcaoPasso2Id) ?? null
    : null;

  function reiniciarEstado() {
    setEtapa(1);
    setEtapaMaximaAlcancada(1);
    setOpcaoPasso1Id(null);
    setOpcaoPasso2Id(null);
    setOpcoesPasso3Selecionadas([]);
  }

  function trocarExemplo(novoId: string) {
    if (novoId === exemploId) return;
    setExemploId(novoId);
    reiniciarEstado();
  }

  function avancarOuIrParaEtapa(proxima: EtapaFluxoDemo) {
    setEtapa(proxima);
    setEtapaMaximaAlcancada((atual) => (proxima > atual ? proxima : atual));
  }

  function alternarItemPasso3(item: string) {
    setOpcoesPasso3Selecionadas((atuais) =>
      atuais.includes(item) ? atuais.filter((atual) => atual !== item) : [...atuais, item],
    );
  }

  return (
    <section
      id="microfluxos"
      aria-labelledby="titulo-microfluxos"
      className="border-b border-neutral-800 bg-mineral-950 py-18 text-white lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <RevelacaoScroll className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <h2
              id="titulo-microfluxos"
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Microfluxos que qualificam cada cliente antes do WhatsApp.
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-neutral-400 sm:text-base">
              Em vez de responder “oi, qual o preço?” sem contexto, conduza o visitante por
              perguntas rápidas e receba o pedido organizado no painel. Teste abaixo.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Exemplos de microfluxo"
            className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1"
          >
            {EXEMPLOS_MICROFLUXO.map((item) => {
              const ativo = item.id === exemplo.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={ativo}
                  onClick={() => trocarExemplo(item.id)}
                  className={combinarClasses(
                    "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    ativo ? "bg-white text-mineral-950" : "text-neutral-400 hover:text-white",
                  )}
                >
                  {item.rotuloAba}
                </button>
              );
            })}
          </div>
        </RevelacaoScroll>

        <div className="mt-10 grid items-center gap-8 lg:grid-cols-12">
          <RevelacaoScroll
            atrasoSegundos={0.08}
            className="flex justify-center lg:col-span-5"
          >
            <SimuladorCelularMicrofluxo
              exemplo={exemplo}
              etapa={etapa}
              opcaoPasso1Id={opcaoPasso1Id}
              opcaoPasso2Id={opcaoPasso2Id}
              opcoesPasso3Selecionadas={opcoesPasso3Selecionadas}
              aoSelecionarPasso1={setOpcaoPasso1Id}
              aoSelecionarPasso2={setOpcaoPasso2Id}
              aoAlternarPasso3={alternarItemPasso3}
              aoMudarEtapa={avancarOuIrParaEtapa}
              aoReiniciar={reiniciarEstado}
            />
          </RevelacaoScroll>

          <RevelacaoScroll atrasoSegundos={0.14} className="lg:col-span-7">
            <CartaoPainelSolicitacaoDemo
              exemplo={exemplo}
              etapa={etapa}
              etapaMaximaAlcancada={etapaMaximaAlcancada}
              respostaPasso1={opcao1Atual?.titulo ?? null}
              respostaPasso2={opcao2Atual?.titulo ?? null}
              respostasPasso3={opcoesPasso3Selecionadas}
              aoIrParaEtapa={avancarOuIrParaEtapa}
            />
          </RevelacaoScroll>
        </div>
      </div>
    </section>
  );
}
