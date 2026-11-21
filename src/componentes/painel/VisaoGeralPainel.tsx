"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  Compass,
  CreditCard,
  ExternalLink,
  Images,
  Inbox,
  Mail,
  Package,
  Palette,
  QrCode,
  Users,
  Wrench,
} from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { CATALOGO_COMPOSICOES_EDITORIAIS } from "@/dominio/entidades/composicaoEditorial";
import { CATALOGO_PLANOS_FLUXO } from "@/dominio/assinaturas/tiposAssinaturaAsaas";
import type { ResumoDireitosPlano } from "@/dominio/entidades/autenticacaoEOrganizacao";
import {
  avaliarProntidaoPublicacaoPagina,
  type RascunhoConfiguracaoPagina,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { CardOnboardingVitrine } from "./onboarding/CardOnboardingVitrine";

const ITENS_ACERVO = [
  {
    titulo: "Produtos",
    descricao: "Catálogo e preços",
    caminho: "/painel/produtos",
    icone: Package,
  },
  {
    titulo: "Serviços",
    descricao: "Ofertas e prazos",
    caminho: "/painel/servicos",
    icone: Wrench,
  },
  {
    titulo: "Portfólio",
    descricao: "Projetos realizados",
    caminho: "/painel/portfolio",
    icone: Images,
  },
  {
    titulo: "Equipe",
    descricao: "Cartões e perfis",
    caminho: "/painel/equipe",
    icone: Users,
  },
  {
    titulo: "Experiências",
    descricao: "Fluxos interativos",
    caminho: "/painel/experiencias",
    icone: Compass,
  },
  {
    titulo: "QR Codes",
    descricao: "Divulgação e links",
    caminho: "/painel/qr-codes",
    icone: QrCode,
  },
] as const;

export interface PropriedadesVisaoGeralPainel {
  readonly nomeOrganizacao: string;
  readonly identificadorPublico: string;
  readonly papel: string;
  readonly emailVerificado: boolean;
  readonly rascunho?: RascunhoConfiguracaoPagina;
  readonly resumoPlano?: ResumoDireitosPlano;
  readonly versaoPublicada: number | null;
  readonly podeEditarAparencia: boolean;
}

export function VisaoGeralPainel({
  nomeOrganizacao,
  identificadorPublico,
  papel: _papel,
  emailVerificado,
  rascunho,
  resumoPlano,
  versaoPublicada,
  podeEditarAparencia,
}: PropriedadesVisaoGeralPainel) {
  const composicao = rascunho
    ? CATALOGO_COMPOSICOES_EDITORIAIS[rascunho.composicaoVisual].nome
    : "Não disponível";
  const pendencias = rascunho
    ? avaliarProntidaoPublicacaoPagina(rascunho, { emailVerificado })
    : [];
  const pendenciasConteudo = pendencias.filter((p) => p.codigo !== "EMAIL_NAO_VERIFICADO");
  const publicada = versaoPublicada !== null;
  const nomePlano = resumoPlano
    ? (CATALOGO_PLANOS_FLUXO[resumoPlano.planoCodigo]?.nome ?? "Plano Inicial")
    : "Plano Inicial";

  return (
    <div className="space-y-6">
      {/* Cabeçalho Sóbrio */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-marfim-200/80 pb-3 sm:pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
            Visão geral
          </h1>
          <p className="mt-1 text-xs text-mineral-600">
            Painel de controle e presença digital de <span className="font-semibold text-mineral-900">{nomeOrganizacao}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {publicada && (
            <Botao
              variante="operacional_secundario"
              tamanho="compacto"
              className="rounded-xl border-marfim-300 bg-white text-mineral-800 hover:bg-marfim-100 shadow-2xs"
              comoFilho
            >
              <Link href={`/${identificadorPublico}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ver vitrine</span>
              </Link>
            </Botao>
          )}

          <Botao
            variante="operacional_primario"
            tamanho="compacto"
            className="rounded-xl bg-mineral-950 text-white hover:bg-mineral-800 shadow-2xs"
            comoFilho
          >
            <Link href="/painel/aparencia">
              <Palette className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{podeEditarAparencia ? "Editor de aparência" : "Ver aparência"}</span>
            </Link>
          </Botao>
        </div>
      </header>

      {/* Alerta minimalista se e-mail não verificado */}
      {!emailVerificado && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 shrink-0 text-amber-700" />
            <p>
              Confirme seu e-mail para habilitar a publicação pública da sua vitrine oficial.
            </p>
          </div>
          <Link
            href="/verificar-email"
            className="font-semibold underline hover:text-amber-950"
          >
            Confirmar e-mail →
          </Link>
        </div>
      )}

      {/* Guia de Lançamento (quando em rascunho) */}
      <CardOnboardingVitrine
        rascunho={rascunho}
        emailVerificado={emailVerificado}
        identificadorPublico={identificadorPublico}
        publicada={publicada}
      />

      {/* Grade Bento Box Principal */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Bento 1: Cartão da Vitrine (Destaque span-2 em telas grandes) */}
        <div className="flex flex-col justify-between rounded-2xl border border-marfim-200/90 bg-white p-5 shadow-2xs transition-all hover:border-marfim-300 md:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-mineral-500">
                Presença Digital
              </span>
              <h2 className="mt-1 text-base font-bold text-mineral-950 sm:text-lg">
                Vitrine Editorial
              </h2>
            </div>

            <span
              className={combinarClasses(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                publicada
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-marfim-300 bg-marfim-100/70 text-mineral-700",
              )}
            >
              <span
                className={combinarClasses(
                  "h-1.5 w-1.5 rounded-full",
                  publicada ? "bg-emerald-500 animate-pulse" : "bg-mineral-400",
                )}
              />
              {publicada ? `Publicada · v${versaoPublicada}` : "Modo Rascunho"}
            </span>
          </div>

          <div className="my-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-marfim-200 bg-marfim-50/50 p-3.5">
            <div className="min-w-0">
              <p className="text-[11px] text-mineral-500">Endereço público oficial</p>
              <p className="truncate font-mono text-xs font-semibold text-mineral-900">
                /{identificadorPublico}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/painel/aparencia"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-marfim-300 bg-white px-3 text-xs font-medium text-mineral-800 hover:bg-marfim-100"
              >
                <span>Aparência</span>
                <ArrowUpRight className="h-3 w-3 text-mineral-500" />
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-marfim-100 pt-3 text-xs text-mineral-500">
            <span>Composição: <strong className="text-mineral-800 font-medium">{composicao}</strong></span>
            {pendenciasConteudo.length > 0 ? (
              <span className="text-amber-700">{pendenciasConteudo.length} item(ns) pendente(s)</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <Check className="h-3.5 w-3.5" /> Conteúdo validado
              </span>
            )}
          </div>
        </div>

        {/* Bento 2: Plano & Capacidade */}
        <div className="flex flex-col justify-between rounded-2xl border border-marfim-200/90 bg-white p-5 shadow-2xs transition-all hover:border-marfim-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-mineral-500">
                Assinatura
              </span>
              <CreditCard className="h-4 w-4 text-mineral-500" />
            </div>

            <p className="mt-2 text-base font-bold text-mineral-950 sm:text-lg">
              {nomePlano}
            </p>

            <div className="mt-4 space-y-2 text-xs text-mineral-600">
              <div className="flex justify-between border-b border-marfim-100 pb-1.5">
                <span>Membros da equipe</span>
                <strong className="text-mineral-900">Até {resumoPlano?.limiteProfissionaisAtivos ?? 1}</strong>
              </div>
              <div className="flex justify-between border-b border-marfim-100 pb-1.5">
                <span>Disponibilidade</span>
                <strong className="text-mineral-900">{resumoPlano?.permitePublicacaoPublica ? "Publicação Ativa" : "Rascunho"}</strong>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-marfim-100">
            <Link
              href="/painel/assinatura"
              className="inline-flex items-center gap-1 text-xs font-semibold text-mineral-900 hover:text-mineral-950 group"
            >
              <span>Gerenciar plano e limites</span>
              <ArrowUpRight className="h-3 w-3 text-mineral-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Bento 3: Central Comercial (Solicitações & Leads) */}
        <Link
          href="/painel/solicitacoes"
          className="group flex flex-col justify-between rounded-2xl border border-marfim-200/90 bg-white p-5 shadow-2xs transition-all hover:border-marfim-300 hover:shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-marfim-100/70 text-mineral-800">
                <Inbox className="h-4 w-4" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-mineral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-mineral-900" />
            </div>

            <h3 className="mt-3 text-sm font-bold text-mineral-950">
              Central comercial
            </h3>
            <p className="mt-1 text-xs text-mineral-500 leading-relaxed">
              Acompanhe contatos e gerencie suas oportunidades no funil Kanban.
            </p>
          </div>

          <span className="mt-4 text-xs font-semibold text-mineral-900 group-hover:underline">
            Acessar solicitações →
          </span>
        </Link>

        {/* Bento 4: Desempenho & Métricas */}
        <Link
          href="/painel/desempenho"
          className="group flex flex-col justify-between rounded-2xl border border-marfim-200/90 bg-white p-5 shadow-2xs transition-all hover:border-marfim-300 hover:shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-marfim-100/70 text-mineral-800">
                <BarChart3 className="h-4 w-4" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-mineral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-mineral-900" />
            </div>

            <h3 className="mt-3 text-sm font-bold text-mineral-950">
              Métricas & Desempenho
            </h3>
            <p className="mt-1 text-xs text-mineral-500 leading-relaxed">
              Consulte visualizações, taxas de conversão e origem dos acessos da vitrine.
            </p>
          </div>

          <span className="mt-4 text-xs font-semibold text-mineral-900 group-hover:underline">
            Ver métricas →
          </span>
        </Link>

        {/* Bento 5: QR Codes & Divulgação */}
        <Link
          href="/painel/qr-codes"
          className="group flex flex-col justify-between rounded-2xl border border-marfim-200/90 bg-white p-5 shadow-2xs transition-all hover:border-marfim-300 hover:shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-marfim-100/70 text-mineral-800">
                <QrCode className="h-4 w-4" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-mineral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-mineral-900" />
            </div>

            <h3 className="mt-3 text-sm font-bold text-mineral-950">
              Central de QR Codes
            </h3>
            <p className="mt-1 text-xs text-mineral-500 leading-relaxed">
              Gere códigos inteligentes com rastreamento para balcão, cartões e crachás.
            </p>
          </div>

          <span className="mt-4 text-xs font-semibold text-mineral-900 group-hover:underline">
            Gerar QR Codes →
          </span>
        </Link>
      </div>

      {/* Bento Acervo & Catálogo (Mosaico de Ações Rápidas) */}
      <section aria-labelledby="titulo-acervo-bento" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="titulo-acervo-bento" className="text-xs font-semibold uppercase tracking-wider text-mineral-500">
            Catálogo & Conteúdo da Vitrine
          </h2>
          <span className="text-[11px] text-mineral-400">Atalhos diretos</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ITENS_ACERVO.map((item) => {
            const Icone = item.icone;
            return (
              <Link
                key={item.caminho}
                href={item.caminho}
                className="group flex flex-col justify-between rounded-xl border border-marfim-200/90 bg-white p-3.5 shadow-2xs transition-all hover:border-marfim-300 hover:bg-marfim-50/40"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-marfim-100/60 text-mineral-700">
                    <Icone className="h-3.5 w-3.5" />
                  </span>
                  <ArrowUpRight className="h-3 w-3 text-mineral-400 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="mt-3">
                  <h3 className="text-xs font-semibold text-mineral-950">{item.titulo}</h3>
                  <p className="mt-0.5 text-[10px] text-mineral-500">{item.descricao}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

