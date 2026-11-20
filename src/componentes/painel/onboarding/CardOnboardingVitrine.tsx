"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { Botao } from "@/componentes/interface/Botao";
import type { RascunhoConfiguracaoPagina } from "@/dominio/entidades/rascunhoConfiguracaoPagina";

export interface PropriedadesCardOnboardingVitrine {
  readonly rascunho?: RascunhoConfiguracaoPagina;
  readonly emailVerificado: boolean;
  readonly identificadorPublico: string;
  readonly publicada: boolean;
}

export function CardOnboardingVitrine({
  rascunho,
  emailVerificado,
  identificadorPublico,
  publicada,
}: PropriedadesCardOnboardingVitrine) {
  if (publicada) {
    return null;
  }

  // 1. Identidade: considerado preenchido se o usuário já salvou alguma especialidade ou frase editorial
  const identidadeConcluida = Boolean(
    rascunho?.identidade.subtituloCurto?.trim() ||
      rascunho?.identidade.cidadeEstado?.trim() ||
      (rascunho?.identidade.nomeExibicao?.trim() &&
        rascunho.identidade.nomeExibicao !== "Minha Presença Digital"),
  );

  // 2. Canais de contato: ao menos 1 rede ou canal adicionado
  const canaisConcluidos = Boolean(rascunho && rascunho.redesSociais.length > 0);

  // 3. Imagem/mídia de capa: mídia própria enviada (diferente da demo de fábrica)
  const midiaConcluida = Boolean(
    rascunho &&
      rascunho.midiaFundo.urlPrincipal &&
      !rascunho.midiaFundo.urlPrincipal.includes("midias-demonstracao"),
  );

  // 4. E-mail verificado para publicação
  const emailPronto = emailVerificado;

  const etapas = [
    {
      id: "identidade",
      titulo: "1. Identidade da marca",
      descricao: "Nome profissional ou empresa e frase de destaque",
      concluido: identidadeConcluida,
      link: "/painel/aparencia?aba=identidade",
      rotuloLink: "Preencher identidade",
    },
    {
      id: "contato",
      titulo: "2. Canais de contato e atendimento",
      descricao: "WhatsApp e redes para gerar os botões da vitrine",
      concluido: canaisConcluidos,
      link: "/painel/aparencia?aba=acoes",
      rotuloLink: "Adicionar contatos",
    },
    {
      id: "midia",
      titulo: "3. Foto ou vídeo de capa",
      descricao: "Mídia de alto impacto visual no fundo da tela",
      concluido: midiaConcluida,
      link: "/painel/aparencia?aba=midia",
      rotuloLink: "Escolher mídia de capa",
    },
    {
      id: "publicacao",
      titulo: "4. E-mail e publicação",
      descricao: emailPronto
        ? "Tudo pronto para publicar no endereço oficial"
        : "Confirme seu e-mail para liberar a publicação da vitrine",
      concluido: emailPronto && identidadeConcluida && canaisConcluidos && midiaConcluida,
      link: emailPronto ? "/painel/aparencia?aba=galeria_seo" : "/verificar-email",
      rotuloLink: emailPronto ? "Ir para publicação" : "Confirmar e-mail",
    },
  ];

  const concluidasCount = etapas.filter((e) => e.concluido).length;
  const porcentagem = Math.round((concluidasCount / etapas.length) * 100);

  // Próxima etapa a ser realizada
  const proximaEtapa = etapas.find((e) => !e.concluido) ?? etapas[etapas.length - 1];

  return (
    <CartaoSuperficie className="rounded-2xl bg-white p-5 shadow-2xs sm:p-6 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-100 text-mineral-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <h2 className="text-sm font-semibold tracking-tight text-mineral-950">
              Guia de Lançamento da sua Vitrine
            </h2>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-mineral-700">
              /{identificadorPublico}
            </span>
          </div>
          <p className="text-xs text-mineral-600">
            Complete os passos essenciais para colocar sua presença digital no ar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-semibold text-mineral-950">
              {concluidasCount} de {etapas.length} concluídos
            </p>
            <p className="text-[10px] text-mineral-500">{porcentagem}% da vitrine pronta</p>
          </div>
          <Botao variante="operacional_primario" tamanho="compacto" comoFilho>
            <Link href={proximaEtapa?.link ?? "/painel/aparencia"}>
              Continuar configuração
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Botao>
        </div>
      </div>

      {/* Barra de progresso visual minimalista */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100" aria-hidden="true">
        <div
          className="h-full rounded-full bg-mineral-950 transition-all duration-300"
          style={{ width: `${porcentagem}%` }}
        />
      </div>

      {/* Lista das etapas */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {etapas.map((etapa) => (
          <Link
            key={etapa.id}
            href={etapa.link}
            className={`group flex items-start gap-3 rounded-xl border p-3.5 transition-all text-left ${
              etapa.concluido
                ? "border-emerald-200/70 bg-emerald-50/30 hover:bg-emerald-50/50"
                : "border-neutral-200 bg-white hover:border-neutral-300 shadow-2xs"
            }`}
          >
            <span className="mt-0.5 shrink-0" aria-hidden="true">
              {etapa.concluido ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <Circle className="h-4 w-4 text-slate-300" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-mineral-950">
                  {etapa.titulo}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    etapa.concluido
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-mineral-600"
                  }`}
                >
                  {etapa.concluido ? "Pronto" : "Pendente"}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-mineral-500">
                {etapa.descricao}
              </p>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-mineral-400 group-hover:text-mineral-950 transition-colors" />
          </Link>
        ))}
      </div>
    </CartaoSuperficie>
  );
}

