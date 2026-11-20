import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  Compass,
  CreditCard,
  ExternalLink,
  Globe,
  Images,
  Inbox,
  Mail,
  Package,
  Palette,
  Users,
  Wrench,
} from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { CATALOGO_COMPOSICOES_EDITORIAIS } from "@/dominio/entidades/composicaoEditorial";
import { CATALOGO_PLANOS_FLUXO } from "@/dominio/assinaturas/tiposAssinaturaAsaas";
import type { ResumoDireitosPlano } from "@/dominio/entidades/autenticacaoEOrganizacao";
import {
  avaliarProntidaoPublicacaoPagina,
  type RascunhoConfiguracaoPagina,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { CardOnboardingVitrine } from "./onboarding/CardOnboardingVitrine";

const ATALHOS = [
  {
    titulo: "Aparência",
    descricao: "Identidade, imagens e prévia da página.",
    caminho: "/painel/aparencia",
    icone: Palette,
  },
  {
    titulo: "Produtos",
    descricao: "Cadastre produtos, estoque e disponibilidade.",
    caminho: "/painel/produtos",
    icone: Package,
  },
  {
    titulo: "Serviços",
    descricao: "Ofertas, valores e prazos de atendimento.",
    caminho: "/painel/servicos",
    icone: Wrench,
  },
  {
    titulo: "Portfólio",
    descricao: "Projetos e trabalhos que apresentam sua marca.",
    caminho: "/painel/portfolio",
    icone: Images,
  },
  {
    titulo: "Equipe",
    descricao: "Perfis, cartões digitais e QR Codes.",
    caminho: "/painel/equipe",
    icone: Users,
  },
  {
    titulo: "Experiências",
    descricao: "Percursos interativos e ações da vitrine.",
    caminho: "/painel/experiencias",
    icone: Compass,
  },
] as const;

export function VisaoGeralPainel({
  nomeOrganizacao,
  identificadorPublico,
  papel,
  emailVerificado,
  rascunho,
  resumoPlano,
  versaoPublicada,
  podeEditarAparencia,
}: {
  readonly nomeOrganizacao: string;
  readonly identificadorPublico: string;
  readonly papel: string;
  readonly emailVerificado: boolean;
  readonly rascunho?: RascunhoConfiguracaoPagina;
  readonly resumoPlano?: ResumoDireitosPlano;
  readonly versaoPublicada: number | null;
  readonly podeEditarAparencia: boolean;
}) {
  const composicao = rascunho
    ? CATALOGO_COMPOSICOES_EDITORIAIS[rascunho.composicaoVisual].nome
    : "Não disponível";
  const pendencias = rascunho
    ? avaliarProntidaoPublicacaoPagina(rascunho, { emailVerificado })
    : [];
  const pendenciasConteudo = pendencias.filter((p) => p.codigo !== "EMAIL_NAO_VERIFICADO");
  const publicada = versaoPublicada !== null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-3 sm:pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
            Visão geral
          </h1>
          <p className="mt-1 text-xs text-mineral-500">
            Acompanhe sua presença digital e encontre o que precisa para o próximo passo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {publicada ? (
            <Botao
              variante="operacional_secundario"
              tamanho="compacto"
              className="rounded-lg border-slate-200 bg-white text-mineral-900 hover:bg-slate-50 shadow-2xs"
              comoFilho
            >
              <Link href={`/${identificadorPublico}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Abrir página pública
              </Link>
            </Botao>
          ) : null}
          <Botao
            variante="operacional_primario"
            tamanho="compacto"
            className="rounded-lg shadow-2xs"
            comoFilho
          >
            <Link href="/painel/aparencia">
              <Palette className="h-4 w-4" aria-hidden="true" />
              {podeEditarAparencia ? "Personalizar aparência" : "Consultar aparência"}
            </Link>
          </Botao>
        </div>
      </header>

      {/* Guia de Lançamento (Onboarding) prioritário quando ainda em rascunho */}
      <CardOnboardingVitrine
        rascunho={rascunho}
        emailVerificado={emailVerificado}
        identificadorPublico={identificadorPublico}
        publicada={publicada}
      />

      {/* Resumo da sua presença digital em cards brancos sóbrios */}
      <section
        aria-label="Resumo da sua presença digital"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {[
          {
            titulo: "Composição",
            valor: composicao,
            apoio: "Selecionada no rascunho",
            icone: Palette,
          },
          {
            titulo: "Publicação",
            valor: publicada ? "Publicada" : "Em rascunho",
            apoio: publicada ? `Versão v${versaoPublicada}` : "Prepare sua primeira publicação",
            icone: Globe,
          },
          {
            titulo: "Plano atual",
            valor: resumoPlano
              ? (CATALOGO_PLANOS_FLUXO[resumoPlano.planoCodigo]?.nome ?? "Não disponível")
              : "Não disponível",
            apoio: "Plano e faturamento na assinatura",
            icone: CreditCard,
          },
          {
            titulo: "Equipe no plano",
            valor: resumoPlano ? `Até ${resumoPlano.limiteProfissionaisAtivos}` : "Não disponível",
            apoio: "Limite de profissionais ativos",
            icone: Users,
          },
        ].map((item) => (
          <div
            key={item.titulo}
            className="rounded-2xl bg-white p-4 shadow-2xs transition-all hover:shadow-xs sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-mineral-600">{item.titulo}</p>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-mineral-800">
                <item.icone className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 break-words text-lg font-bold tracking-tight text-mineral-950 sm:text-xl">
              {item.valor}
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-mineral-400">{item.apoio}</p>
          </div>
        ))}
      </section>

      {!emailVerificado ? (
        <CartaoSuperficie
          preenchimento="compacto"
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white shadow-2xs"
        >
          <div className="flex max-w-2xl items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-mineral-700" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-mineral-900">Confirme seu e-mail</p>
              <p className="mt-1 text-xs leading-relaxed text-mineral-500">
                Você pode preparar o rascunho enquanto aguarda. Confirme o e-mail para liberar a
                publicação.
              </p>
            </div>
          </div>
          <Botao
            variante="operacional_secundario"
            tamanho="compacto"
            className="rounded-lg bg-neutral-100 text-mineral-900 hover:bg-neutral-200 shadow-2xs"
            comoFilho
          >
            <Link href="/verificar-email">Confirmar e-mail</Link>
          </Botao>
        </CartaoSuperficie>
      ) : null}

      {/* Módulos Operacionais Principais */}
      <section aria-label="Acompanhar sua operação" className="grid gap-4 md:grid-cols-2">
        {[
          {
            titulo: "Central comercial",
            descricao: "Acompanhe as solicitações recebidas e organize os atendimentos no Kanban.",
            caminho: "/painel/solicitacoes",
            acao: "Ver solicitações",
            icone: Inbox,
          },
          {
            titulo: "Desempenho da vitrine",
            descricao: "Consulte visitas, interações e conversões para acompanhar seus resultados.",
            caminho: "/painel/desempenho",
            acao: "Ver desempenho",
            icone: BarChart3,
          },
        ].map((item) => (
          <Link
            key={item.caminho}
            href={item.caminho}
            className="group rounded-2xl bg-white p-5 shadow-2xs transition-all hover:shadow-xs focus-visible:outline-2 focus-visible:outline-mineral-950"
          >
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-mineral-900">
              <item.icone className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-sm font-bold text-mineral-950">{item.titulo}</h2>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-mineral-500">
              {item.descricao}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-mineral-950">
              {item.acao}
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* Atalhos Rápidos da Vitrine */}
        <section aria-labelledby="titulo-atalhos-painel" className="space-y-4">
          <div>
            <h2 id="titulo-atalhos-painel" className="text-base font-bold text-mineral-950">
              Organize sua vitrine
            </h2>
            <p className="mt-1 text-xs text-mineral-500">
              Acesse cada área para consultar ou atualizar seu conteúdo.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {ATALHOS.map((item) => (
              <Link
                key={item.caminho}
                href={item.caminho}
                className="group flex min-w-0 items-start gap-3 rounded-2xl bg-white p-4 shadow-2xs transition-all hover:bg-slate-50/40 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-mineral-950"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-mineral-800">
                  <item.icone className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-semibold text-mineral-950">{item.titulo}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-mineral-500">
                    {item.descricao}
                  </p>
                </div>
                <ArrowUpRight
                  className="h-3.5 w-3.5 shrink-0 text-mineral-400 group-hover:text-mineral-950 transition-colors"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Situação e Revisão do Rascunho */}
        <div className="min-w-0 space-y-4">
          <section
            aria-labelledby="titulo-situacao-pagina"
            className="rounded-2xl bg-white p-5 shadow-2xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="titulo-situacao-pagina" className="text-sm font-semibold text-mineral-950">
                Sua página
              </h2>
              <span
                className={combinarClasses(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                  publicada
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-neutral-200 bg-neutral-100 text-neutral-700",
                )}
              >
                <span
                  className={combinarClasses(
                    "h-1.5 w-1.5 rounded-full",
                    publicada ? "bg-emerald-500 animate-pulse" : "bg-neutral-400",
                  )}
                />
                {publicada ? `Publicada · v${versaoPublicada}` : "Em rascunho"}
              </span>
            </div>
            <p className="mt-3 break-all rounded-lg bg-neutral-50 px-3 py-2.5 text-xs font-medium text-mineral-700 border border-neutral-200/60">
              /{identificadorPublico}
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-mineral-500">
              {publicada
                ? "Sua página está publicada. As alterações do rascunho aparecem na vitrine após uma nova publicação."
                : "Prepare o conteúdo e confira a prévia antes da primeira publicação."}
            </p>
            <Link
              href="/painel/aparencia"
              className="mt-3 inline-flex min-h-10 items-center gap-1 text-xs font-semibold text-mineral-950 hover:underline"
            >
              Abrir rascunho e prévia
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </section>

          {rascunho ? (
            <section
              aria-labelledby="titulo-revisao-rascunho"
              className="rounded-2xl bg-white p-5 shadow-2xs"
            >
              <h2 id="titulo-revisao-rascunho" className="text-sm font-semibold text-mineral-950">
                {pendencias.length > 0 ? "Revisão do rascunho" : "Conteúdo revisado"}
              </h2>
              {pendenciasConteudo.length > 0 ? (
                <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-mineral-600">
                  {pendenciasConteudo.map((p, indice) => (
                    <li key={`${p.codigo}-${indice}`} className="flex gap-2">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"
                        aria-hidden="true"
                      />
                      {p.mensagem}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-mineral-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  Os campos obrigatórios de conteúdo estão preenchidos.
                </p>
              )}
              {!emailVerificado ? (
                <p className="mt-3 text-xs leading-relaxed text-slate-700">
                  Falta confirmar seu e-mail para publicar.
                </p>
              ) : null}
              {resumoPlano && !resumoPlano.permitePublicacaoPublica ? (
                <p className="mt-3 text-xs leading-relaxed text-amber-800">
                  Seu plano atual ainda não permite publicação pública.{" "}
                  <Link
                    href="/painel/assinatura"
                    className="font-semibold underline hover:text-amber-950"
                  >
                    Ative o plano Pro
                  </Link>{" "}
                  para colocar seu endereço oficial no ar.
                </p>
              ) : (
                <p className="mt-3 text-[11px] leading-relaxed text-mineral-500">
                  A validação final acontece ao publicar no editor de aparência.
                </p>
              )}
            </section>
          ) : null}

          <Link
            href="/painel/assinatura"
            className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-mineral-700 shadow-2xs hover:text-mineral-950 hover:shadow-xs transition-all"
          >
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-mineral-800" aria-hidden="true" />
              Plano e faturamento
            </span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <p className="px-1 text-[10px] text-mineral-500">Organização ativa · Papel: {papel}</p>
        </div>
      </div>
    </div>
  );
}
