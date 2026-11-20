"use client";

import { Check, CreditCard, ExternalLink } from "lucide-react";
import { CATALOGO_PLANOS_FLUXO } from "@/dominio/assinaturas/tiposAssinaturaAsaas";
import type { SituacaoResumoAssinatura } from "@/dominio/entidades/autenticacaoEOrganizacao";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesSecaoPlanosDisponiveis {
  readonly organizacaoNome: string;
  readonly planoAtivoCodigo: string;
  readonly situacaoAssinatura: SituacaoResumoAssinatura;
  readonly temVigenciaRestante: boolean;
  readonly vigenciaAteIso?: string;
  readonly temFaturaPendente: boolean;
  readonly urlCheckoutGerado: string | null;
  readonly podeGerenciar: boolean;
  readonly processando: boolean;
  readonly aoAbrirModalContratacao: (evento: React.MouseEvent<HTMLButtonElement>) => void;
}

function formatarData(dataIso: string): string {
  return dataIso.replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, "$3/$2/$1");
}

export function SecaoPlanosDisponiveis({
  organizacaoNome,
  planoAtivoCodigo,
  situacaoAssinatura,
  temVigenciaRestante,
  vigenciaAteIso,
  temFaturaPendente,
  urlCheckoutGerado,
  podeGerenciar,
  processando,
  aoAbrirModalContratacao,
}: PropriedadesSecaoPlanosDisponiveis) {
  const planoPro = CATALOGO_PLANOS_FLUXO.pro;
  const ehProAtivo =
    (planoAtivoCodigo === "pro" || planoAtivoCodigo === "equipe") &&
    situacaoAssinatura === "ativa";

  const planoEmpresarial = CATALOGO_PLANOS_FLUXO.personalizado;
  const ehEmpresarialAtivo =
    planoAtivoCodigo === "personalizado" && situacaoAssinatura === "ativa";

  return (
    <section aria-labelledby="titulo-planos" className="space-y-4">
      <div>
        <h2 id="titulo-planos" className="text-base font-semibold text-mineral-950">
          Planos disponíveis
        </h2>
        <p className="mt-1 text-xs text-mineral-500">
          Escolha os recursos que acompanham o seu momento.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CartaoSuperficie
          className={combinarClasses(
            "relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-2xs transition-all hover:border-slate-300 sm:p-6",
            ehProAtivo
              ? "border-emerald-500/80 ring-1 ring-emerald-500/20"
              : temVigenciaRestante || temFaturaPendente
                ? "border-amber-400/80 ring-1 ring-amber-400/20"
                : "border-slate-200/80",
          )}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold tracking-tight text-mineral-950">
                Plano {planoPro.nome}
              </h2>
              {ehProAtivo ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                  Plano Ativo
                </span>
              ) : temVigenciaRestante && vigenciaAteIso ? (
                <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900">
                  Cancelada · Até {formatarData(vigenciaAteIso)}
                </span>
              ) : temFaturaPendente ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
                  Aguardando Pagamento
                </span>
              ) : (
                <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-mineral-800">
                  Recomendado
                </span>
              )}
            </div>

            <p className="mt-2 text-xs text-mineral-600">{planoPro.descricao}</p>

            <div className="mt-5 border-t border-marfim-200 pt-4">
              <p className="text-3xl font-bold tracking-tight text-mineral-950">
                {ValorMonetarioCentavos.deCentavos(
                  planoPro.mensalidadeCentavos,
                ).formatarMoedaBrasileira()}
                <span className="text-xs font-normal text-mineral-600"> / mês</span>
              </p>
            </div>

            <ul className="mt-5 space-y-2.5 border-t border-marfim-200 pt-4 text-xs text-mineral-700">
              {planoPro.destaques.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 border-t border-marfim-200 pt-5">
            {ehProAtivo ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-center">
                <p className="text-xs font-semibold text-emerald-900">
                  Plano Pro em vigência regular
                </p>
                <p className="mt-0.5 text-[11px] text-emerald-700">
                  Renovação automática ativa. Nenhuma ação pendente.
                </p>
              </div>
            ) : temVigenciaRestante ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-center">
                <p className="text-xs font-medium text-mineral-700">
                  Acesso liberado até {vigenciaAteIso ? formatarData(vigenciaAteIso) : "o fim do ciclo"}
                </p>
              </div>
            ) : temFaturaPendente ? (
              <div className="space-y-2">
                <Botao
                  type="button"
                  variante="operacional_secundario"
                  className="w-full rounded-lg text-xs font-semibold border-slate-200 bg-slate-50 text-mineral-800 hover:bg-slate-100"
                  disabled={!podeGerenciar || processando}
                  onClick={aoAbrirModalContratacao}
                >
                  Alterar dados cadastrais ou reemitir fatura
                </Botao>
                <p className="text-center text-[11px] text-amber-800/80">
                  Fatura gerada · Conclua o pagamento no aviso superior
                </p>
              </div>
            ) : (
              <Botao
                variante="editorial_principal"
                className="w-full rounded-lg text-xs font-semibold bg-mineral-950 text-white hover:bg-mineral-900"
                disabled={!podeGerenciar || processando}
                onClick={aoAbrirModalContratacao}
              >
                Contratar Plano Pro
              </Botao>
            )}
          </div>
        </CartaoSuperficie>

        <CartaoSuperficie
          className={combinarClasses(
            "relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-2xs transition-all hover:border-slate-300 sm:p-6",
            ehEmpresarialAtivo
              ? "border-emerald-500/80 ring-1 ring-emerald-500/20"
              : "border-slate-200/80",
          )}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold tracking-tight text-mineral-950">
                Plano {planoEmpresarial.nome}
              </h2>
              {ehEmpresarialAtivo ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                  Plano Ativo
                </span>
              ) : (
                <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-mineral-700">
                  Integrações sob medida
                </span>
              )}
            </div>

            <p className="mt-2 text-xs text-mineral-600">{planoEmpresarial.descricao}</p>

            <div className="mt-5 border-t border-marfim-200 pt-4">
              <p className="text-3xl font-bold tracking-tight text-mineral-950">
                Sob consulta
                <span className="text-xs font-normal text-mineral-600"> · projeto dedicado</span>
              </p>
            </div>

            <ul className="mt-5 space-y-2.5 border-t border-marfim-200 pt-4 text-xs text-mineral-700">
              {planoEmpresarial.destaques.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mineral-700"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 border-t border-marfim-200 pt-5">
            <a
              href={`mailto:contato@nexoativo.com.br?subject=${encodeURIComponent(
                `Plano Empresarial e Integrações Sob Medida · ${organizacaoNome}`,
              )}`}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-mineral-800 hover:bg-slate-50 transition-colors"
            >
              <span>Solicitar proposta sob medida</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
            </a>
          </div>
        </CartaoSuperficie>
      </div>
    </section>
  );
}

