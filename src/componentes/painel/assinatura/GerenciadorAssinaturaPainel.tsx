"use client";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import * as Dialogo from "@radix-ui/react-dialog";
import { useRef, useState } from "react";
import {
  Check,
  CreditCard,
  ExternalLink,
  FileText,
  Mail,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  CATALOGO_PLANOS_FLUXO,
  type CobrancaHistoricoAsaas,
  type RegistroAssinaturaAsaas,
} from "@/dominio/assinaturas/tiposAssinaturaAsaas";
import type {
  Organizacao,
  SituacaoResumoAssinatura,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import {
  servicoAssinaturasPainelCliente,
  type PortaAssinaturasPainelCliente,
} from "@/infraestrutura/painel/servicoAssinaturasPainelCliente";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesGerenciadorAssinaturaPainel {
  readonly organizacao: Organizacao;
  readonly assinaturaAtual: RegistroAssinaturaAsaas | null;
  readonly cobrancas: readonly CobrancaHistoricoAsaas[];
  readonly podeGerenciarAssinatura: boolean;
  readonly servicoAssinaturas?: PortaAssinaturasPainelCliente;
}

const DESCRITORES_SITUACAO_ASSINATURA: Readonly<
  Record<SituacaoResumoAssinatura, { rotulo: string; classe: string }>
> = {
  ativa: {
    rotulo: "Ativa e Regular",
    classe: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  pendente_contratacao: {
    rotulo: "Aguardando Pagamento",
    classe: "bg-sky-50 text-sky-800 border-sky-200",
  },
  em_carencia: {
    rotulo: "Em Carência (7 dias)",
    classe: "bg-sky-50 text-sky-800 border-sky-200",
  },
  inadimplente: { rotulo: "Inadimplente", classe: "bg-red-50 text-red-800 border-red-200" },
  suspensa: { rotulo: "Suspensa", classe: "bg-amber-50 text-amber-800 border-amber-200" },
  cancelada: { rotulo: "Encerrada", classe: "bg-marfim-50 text-mineral-600 border-marfim-200" },
};

export function GerenciadorAssinaturaPainel({
  organizacao,
  assinaturaAtual,
  cobrancas,
  podeGerenciarAssinatura,
  servicoAssinaturas = servicoAssinaturasPainelCliente,
}: PropriedadesGerenciadorAssinaturaPainel) {
  const planoAtivoCodigo = organizacao.resumoDireitosPlano.planoCodigo;
  const situacaoAssinatura = organizacao.resumoDireitosPlano.situacaoAssinatura;

  const [planoSelecionado, setPlanoSelecionado] = useState<"pro">("pro");
  const [incluirImplantacao, setIncluirImplantacao] = useState(false);

  const [modalContratacaoAberto, setModalContratacaoAberto] = useState(false);
  const [nomeRazaoSocial, setNomeRazaoSocial] = useState(organizacao.nome);
  const [cpfOuCnpj, setCpfOuCnpj] = useState("");
  const [emailCobranca, setEmailCobranca] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");

  const [processando, setProcessando] = useState(false);
  const contratacaoEmCurso = useRef(false);
  const botaoContratacao = useRef<HTMLButtonElement | null>(null);

  const [urlCheckoutGerado, setUrlCheckoutGerado] = useState<string | null>(
    assinaturaAtual?.urlFaturaOuCheckout ?? null,
  );

  const definicaoPlanoSelecionado = CATALOGO_PLANOS_FLUXO[planoSelecionado];

  async function submeterContratacao() {
    if (!podeGerenciarAssinatura || contratacaoEmCurso.current) {
      return;
    }

    contratacaoEmCurso.current = true;
    setProcessando(true);

    try {
      const resultado = await servicoAssinaturas.criarAssinatura({
        organizacaoId: organizacao.id,
        planoCodigo: planoSelecionado,
        contratarImplantacaoAssistida: incluirImplantacao,
        dadosFiscais: {
          nomeOuRazaoSocial: nomeRazaoSocial,
          cpfOuCnpj,
          email: emailCobranca,
          telefone,
          ...(cep ? { cep } : {}),
        },
      });

      if (resultado.urlCheckoutOuFatura) {
        setUrlCheckoutGerado(resultado.urlCheckoutOuFatura);
      }
      setModalContratacaoAberto(false);
      notificar.sucesso("Assinatura gerada. Acesse a fatura ou o checkout para continuar.");
    } catch (erro) {
      notificar.erro(erro instanceof Error ? erro.message : "Não foi possível gerar a assinatura.");
    } finally {
      contratacaoEmCurso.current = false;
      setProcessando(false);
    }
  }

  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  async function aoCancelarAssinatura() {
    setCancelando(true);
    try {
      await servicoAssinaturas.cancelarAssinatura(organizacao.id);
      setConfirmandoCancelamento(false);
      notificar.sucesso("Assinatura cancelada com sucesso.");
    } catch (erroCapturado) {
      notificar.erro(
        erroCapturado instanceof Error
          ? erroCapturado.message
          : "Não foi possível cancelar a assinatura.",
      );
    } finally {
      setCancelando(false);
    }
  }

  const descritorSituacao =
    DESCRITORES_SITUACAO_ASSINATURA[situacaoAssinatura] ??
    DESCRITORES_SITUACAO_ASSINATURA.pendente_contratacao;

  const planoAtual = CATALOGO_PLANOS_FLUXO[planoAtivoCodigo];
  const mensalidadeAtual = assinaturaAtual
    ? ValorMonetarioCentavos.deCentavos(
        assinaturaAtual.valorMensalCentavos,
      ).formatarMoedaBrasileira()
    : planoAtivoCodigo === "personalizado"
      ? "Sob consulta"
      : ValorMonetarioCentavos.deCentavos(planoAtual.mensalidadeCentavos).formatarMoedaBrasileira();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-marfim-200/80 pb-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
            Assinatura e Cobrança · {organizacao.nome}
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
            Plano & Serviços
          </h1>
          <p className="mt-1 text-xs text-mineral-600">
            Acompanhe seu plano, os recursos incluídos e suas cobranças.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={combinarClasses(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              descritorSituacao.classe,
            )}
          >
            {descritorSituacao.rotulo}
          </span>
          {urlCheckoutGerado ? (
            <a
              href={urlCheckoutGerado}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              <span>Acessar Fatura / Checkout Asaas</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            </a>
          ) : null}
          {situacaoAssinatura === "ativa" && assinaturaAtual ? (
            confirmandoCancelamento ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={cancelando}
                  onClick={aoCancelarAssinatura}
                  className="inline-flex min-h-10 items-center rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelando ? "Cancelando..." : "Confirmar cancelamento"}
                </button>
                <button
                  type="button"
                  disabled={cancelando}
                  onClick={() => setConfirmandoCancelamento(false)}
                  className="inline-flex min-h-10 items-center rounded-lg border border-marfim-300 bg-white px-3 py-2 text-xs font-semibold text-mineral-700 transition-colors hover:bg-marfim-50 disabled:opacity-50"
                >
                  Voltar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmandoCancelamento(true)}
                className="inline-flex min-h-10 items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
              >
                Cancelar assinatura
              </button>
            )
          ) : null}
        </div>
      </header>

      <section aria-label="Resumo da assinatura" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            rotulo: "Plano atual",
            valor: planoAtual.nome,
            apoio: descritorSituacao.rotulo,
            icone: CreditCard,
            cor: "border-indigo-200 from-indigo-50/80 text-indigo-950",
            iconeCor: "bg-indigo-600",
          },
          {
            rotulo: "Mensalidade",
            valor: mensalidadeAtual,
            apoio: assinaturaAtual?.proximoVencimentoIso
              ? `Próximo vencimento: ${formatarDataCobranca(assinaturaAtual.proximoVencimentoIso)}`
              : "Valor mensal do plano",
            icone: Wallet,
            cor: "border-emerald-200 from-emerald-50/80 text-emerald-950",
            iconeCor: "bg-emerald-600",
          },
          {
            rotulo: "Profissionais ativos",
            valor: `Até ${organizacao.resumoDireitosPlano.limiteProfissionaisAtivos}`,
            apoio: "Limite incluído no seu plano",
            icone: Users,
            cor: "border-sky-200 from-sky-50/80 text-sky-950",
            iconeCor: "bg-sky-600",
          },
          {
            rotulo: "E-mails por mês",
            valor: String(organizacao.resumoDireitosPlano.limiteEnviosEmailMensal),
            apoio: "Franquia de notificações",
            icone: Mail,
            cor: "border-violet-200 from-violet-50/80 text-violet-950",
            iconeCor: "bg-violet-600",
          },
        ].map((item) => (
          <div
            key={item.rotulo}
            className={combinarClasses(
              "rounded-2xl border bg-gradient-to-b via-white to-white p-4 shadow-xs sm:p-5",
              item.cor,
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold">{item.rotulo}</p>
              <span
                className={combinarClasses(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white",
                  item.iconeCor,
                )}
              >
                <item.icone className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 break-words text-xl font-extrabold tracking-tight tabular-nums sm:text-2xl">
              {item.valor}
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-mineral-500">{item.apoio}</p>
          </div>
        ))}
      </section>

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
          {(() => {
            const plano = CATALOGO_PLANOS_FLUXO.pro;
            const ehPlanoAtual =
              (planoAtivoCodigo === "pro" || planoAtivoCodigo === "equipe") &&
              situacaoAssinatura === "ativa";

            return (
              <CartaoSuperficie
                className={combinarClasses(
                  "relative flex flex-col justify-between rounded-2xl bg-gradient-to-b via-white to-white p-5 shadow-xs transition-shadow hover:shadow-sm sm:p-6",
                  ehPlanoAtual
                    ? "border-emerald-200 from-emerald-50/60 ring-1 ring-emerald-100"
                    : "border-indigo-200 from-indigo-50/60",
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-mineral-950">
                      Plano {plano.nome}
                    </h2>
                    {ehPlanoAtual ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                        Plano Ativo
                      </span>
                    ) : (
                      <span className="rounded-full border border-indigo-200 bg-indigo-100 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-800">
                        Plano Padrão
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-mineral-600">{plano.descricao}</p>

                  <div className="mt-5 border-t border-marfim-200 pt-4">
                    <p className="text-3xl font-bold tracking-tight text-mineral-950">
                      {ValorMonetarioCentavos.deCentavos(
                        plano.mensalidadeCentavos,
                      ).formatarMoedaBrasileira()}
                      <span className="text-xs font-normal text-mineral-600"> / mês</span>
                    </p>
                  </div>

                  <ul className="mt-5 space-y-2.5 border-t border-marfim-200 pt-4 text-xs text-mineral-700">
                    {plano.destaques.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-800"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 border-t border-marfim-200 pt-5">
                  <Botao
                    variante={ehPlanoAtual ? "operacional_secundario" : "editorial_principal"}
                    className={combinarClasses(
                      "w-full rounded-lg text-xs font-semibold",
                      ehPlanoAtual
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                        : "bg-indigo-600 text-white hover:bg-indigo-700",
                    )}
                    disabled={!podeGerenciarAssinatura || processando}
                    onClick={(evento) => {
                      botaoContratacao.current = evento.currentTarget;
                      setPlanoSelecionado("pro");
                      setModalContratacaoAberto(true);
                    }}
                  >
                    {ehPlanoAtual ? "Gerenciar / Alterar Dados" : "Contratar Plano Pro"}
                  </Botao>
                </div>
              </CartaoSuperficie>
            );
          })()}

          {(() => {
            const planoEmpresarial = CATALOGO_PLANOS_FLUXO.personalizado;
            const ehEmpresarialAtivo =
              planoAtivoCodigo === "personalizado" && situacaoAssinatura === "ativa";

            return (
              <CartaoSuperficie
                className={combinarClasses(
                  "relative flex flex-col justify-between rounded-2xl bg-gradient-to-b via-white to-white p-5 shadow-xs transition-shadow hover:shadow-sm sm:p-6",
                  ehEmpresarialAtivo
                    ? "border-emerald-200 from-emerald-50/60 ring-1 ring-emerald-100"
                    : "border-violet-200 from-violet-50/60",
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-mineral-950">
                      Plano {planoEmpresarial.nome}
                    </h2>
                    {ehEmpresarialAtivo ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                        Plano Ativo
                      </span>
                    ) : (
                      <span className="rounded-full border border-violet-200 bg-violet-100 px-2.5 py-0.5 text-[10px] font-semibold text-violet-800">
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
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-700"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 border-t border-marfim-200 pt-5">
                  <a
                    href={`mailto:contato@nexoativo.com.br?subject=${encodeURIComponent(`Plano Empresarial e Integrações Sob Medida · ${organizacao.nome}`)}`}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
                  >
                    <span>Solicitar proposta sob medida</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
                  </a>
                </div>
              </CartaoSuperficie>
            );
          })()}
        </div>
      </section>

      <CartaoSuperficie className="rounded-2xl border-violet-200 bg-gradient-to-b from-violet-50/60 to-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-xl space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" aria-hidden="true" />
              <h3 className="text-base font-semibold tracking-tight text-mineral-950">
                Implantação Editorial Assistida
              </h3>
            </div>
            <p className="text-xs text-mineral-700">
              Nossa equipe de design e curadoria configura sua página, organiza seu portfólio e
              estrutura seus microfluxos comerciais sobre o seu painel.
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-mineral-600">Investimento único</p>
            <p className="text-xl font-bold text-mineral-950">
              {ValorMonetarioCentavos.deCentavos(
                CATALOGO_PLANOS_FLUXO.pro.valorImplantacaoAssistidaCentavos ?? 0,
              ).formatarMoedaBrasileira()}{" "}
              <span className="text-xs font-normal text-mineral-500">(Plano Pro)</span>
            </p>
          </div>
        </div>
      </CartaoSuperficie>

      <section aria-labelledby="titulo-historico-faturas" className="space-y-4">
        <h2
          id="titulo-historico-faturas"
          className="text-base font-semibold tracking-tight text-mineral-950"
        >
          Histórico de Faturas e Cobranças
        </h2>

        {cobrancas.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-marfim-200 bg-white shadow-xs">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="border-b border-marfim-200 bg-sky-50/40 text-mineral-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Vencimento
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Valor
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Forma
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Situação
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Comprovante
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-marfim-200">
                {cobrancas.map((cob) => (
                  <tr key={cob.id} className="hover:bg-marfim-50/50">
                    <td className="px-4 py-3 font-medium text-mineral-900">
                      {formatarDataCobranca(cob.dataVencimentoIso)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-mineral-950">
                      {ValorMonetarioCentavos.deCentavos(
                        cob.valorCentavos,
                      ).formatarMoedaBrasileira()}
                    </td>
                    <td className="px-4 py-3 text-mineral-700">
                      {ROTULOS_FORMA_PAGAMENTO[cob.formaPagamento] ?? cob.formaPagamento}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={combinarClasses(
                          "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          estiloSituacaoCobranca(cob.situacao),
                        )}
                      >
                        {ROTULOS_SITUACAO_COBRANCA[cob.situacao] ?? cob.situacao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {cob.urlFaturaOuComprovante ? (
                        <a
                          href={cob.urlFaturaOuComprovante}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-9 items-center rounded-lg px-2 font-semibold text-indigo-700 hover:bg-indigo-50"
                        >
                          Visualizar
                        </a>
                      ) : (
                        <span className="text-mineral-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <CartaoSuperficie className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border-dashed text-center shadow-none">
            <FileText className="h-7 w-7 text-indigo-300" aria-hidden="true" />
            <p className="text-sm font-semibold text-mineral-900">Nenhuma cobrança registrada</p>
            <p className="text-xs text-mineral-500">
              As faturas e os comprovantes aparecerão aqui.
            </p>
          </CartaoSuperficie>
        )}
      </section>

      <Dialogo.Root
        open={modalContratacaoAberto}
        onOpenChange={(aberto) => {
          if (!contratacaoEmCurso.current) setModalContratacaoAberto(aberto);
        }}
      >
        <Dialogo.Portal>
          <Dialogo.Overlay className="fixed inset-0 z-50 bg-mineral-950/30 backdrop-blur-sm" />
          <Dialogo.Content
            onCloseAutoFocus={(evento) => {
              evento.preventDefault();
              botaoContratacao.current?.focus();
            }}
            className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 space-y-5 overflow-y-auto rounded-2xl border border-marfim-200 bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="relative border-b border-marfim-100 pr-8 pb-4">
              <Dialogo.Close
                aria-label="Fechar contratação"
                disabled={processando}
                className="absolute top-0 right-0 rounded-lg p-1.5 text-mineral-500 hover:bg-marfim-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Dialogo.Close>
              <Dialogo.Title className="text-xl font-bold tracking-tight text-mineral-950">
                Contratar Plano {definicaoPlanoSelecionado.nome}
              </Dialogo.Title>
              <Dialogo.Description className="mt-1 text-xs leading-relaxed text-mineral-500">
                Preencha os dados cadastrais para gerar a assinatura e acessar o checkout.
              </Dialogo.Description>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submeterContratacao();
              }}
              className="space-y-4"
            >
              <div
                aria-label="Resumo da contratação"
                className="space-y-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs text-mineral-700"
              >
                <p className="flex items-center justify-between gap-2">
                  <span>Mensalidade · Plano {definicaoPlanoSelecionado.nome}</span>
                  <strong className="text-indigo-950">
                    {ValorMonetarioCentavos.deCentavos(
                      definicaoPlanoSelecionado.mensalidadeCentavos,
                    ).formatarMoedaBrasileira()}
                    /mês
                  </strong>
                </p>
                {incluirImplantacao ? (
                  <p className="flex items-center justify-between gap-2">
                    <span>Implantação · pagamento único</span>
                    <strong className="text-violet-900">
                      {ValorMonetarioCentavos.deCentavos(
                        definicaoPlanoSelecionado.valorImplantacaoAssistidaCentavos ?? 0,
                      ).formatarMoedaBrasileira()}
                    </strong>
                  </p>
                ) : null}
              </div>
              <fieldset disabled={processando} className="space-y-4">
                <div>
                  <label
                    htmlFor="nome-fiscal"
                    className="block text-xs font-medium text-mineral-800"
                  >
                    Nome Completo ou Razão Social
                  </label>
                  <input
                    id="nome-fiscal"
                    type="text"
                    required
                    value={nomeRazaoSocial}
                    onChange={(e) => setNomeRazaoSocial(e.target.value)}
                    className="mt-1 w-full min-h-10 rounded-lg border border-marfim-200 px-3 py-2 text-xs text-mineral-900 focus:border-indigo-400 focus:outline-none"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="cpf-cnpj"
                      className="block text-xs font-medium text-mineral-800"
                    >
                      CPF ou CNPJ
                    </label>
                    <input
                      id="cpf-cnpj"
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={cpfOuCnpj}
                      onChange={(e) => setCpfOuCnpj(e.target.value)}
                      className="mt-1 w-full min-h-10 rounded-lg border border-marfim-200 px-3 py-2 text-xs text-mineral-900 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="telefone-fiscal"
                      className="block text-xs font-medium text-mineral-800"
                    >
                      WhatsApp com DDD
                    </label>
                    <input
                      id="telefone-fiscal"
                      type="tel"
                      required
                      placeholder="(11) 90000-0000"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="mt-1 w-full min-h-10 rounded-lg border border-marfim-200 px-3 py-2 text-xs text-mineral-900 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email-cobranca"
                    className="block text-xs font-medium text-mineral-800"
                  >
                    E-mail para envio das faturas
                  </label>
                  <input
                    id="email-cobranca"
                    type="email"
                    required
                    value={emailCobranca}
                    onChange={(e) => setEmailCobranca(e.target.value)}
                    className="mt-1 w-full min-h-10 rounded-lg border border-marfim-200 px-3 py-2 text-xs text-mineral-900 focus:border-indigo-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cep-fiscal"
                    className="block text-xs font-medium text-mineral-800"
                  >
                    CEP (opcional)
                  </label>
                  <input
                    id="cep-fiscal"
                    type="text"
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="mt-1 w-full min-h-10 rounded-lg border border-marfim-200 px-3 py-2 text-xs text-mineral-900 focus:border-indigo-400 focus:outline-none"
                  />
                </div>

                <label className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50/40 p-3 text-xs leading-relaxed text-mineral-700">
                  <input
                    type="checkbox"
                    checked={incluirImplantacao}
                    onChange={(e) => setIncluirImplantacao(e.target.checked)}
                    className="mt-0.5 rounded border-marfim-200 accent-violet-600"
                  />
                  <span>
                    <strong>Adicionar Implantação Editorial Assistida:</strong> Pagamento único de{" "}
                    {ValorMonetarioCentavos.deCentavos(
                      definicaoPlanoSelecionado.valorImplantacaoAssistidaCentavos ?? 0,
                    ).formatarMoedaBrasileira()}{" "}
                    com consultoria inicial da equipe do Nexo Ativo.
                  </span>
                </label>
              </fieldset>
              <div className="flex flex-wrap justify-end gap-3 border-t border-marfim-100 pt-4">
                <Botao
                  type="button"
                  variante="operacional_secundario"
                  tamanho="compacto"
                  disabled={processando}
                  onClick={() => setModalContratacaoAberto(false)}
                >
                  Cancelar
                </Botao>
                <Botao
                  type="submit"
                  tamanho="compacto"
                  className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  disabled={processando}
                >
                  {processando ? "Gerando Fatura..." : "Gerar assinatura e checkout"}
                </Botao>
              </div>
            </form>
          </Dialogo.Content>
        </Dialogo.Portal>
      </Dialogo.Root>
    </div>
  );
}

function formatarDataCobranca(data: string): string {
  return data.replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, "$3/$2/$1");
}

const ROTULOS_FORMA_PAGAMENTO: Readonly<Record<string, string>> = {
  BOLETO: "Boleto",
  CREDIT_CARD: "Cartão de crédito",
  PIX: "Pix",
  UNDEFINED: "A definir",
};
const ROTULOS_SITUACAO_COBRANCA: Readonly<Record<string, string>> = {
  PENDING: "Pendente",
  RECEIVED: "Paga",
  CONFIRMED: "Confirmada",
  OVERDUE: "Vencida",
  REFUNDED: "Estornada",
  RECEIVED_IN_CASH_UNDONE: "Recebimento desfeito",
  CHARGEBACK_REQUESTED: "Contestação solicitada",
  CHARGEBACK_DISPUTE: "Em contestação",
  AWAITING_CHARGEBACK_REVERSAL: "Aguardando reversão",
  DUNNING_REQUESTED: "Em cobrança",
  DUNNING_RECEIVED: "Cobrança recebida",
  AWAITING_RISK_ANALYSIS: "Em análise",
};
function estiloSituacaoCobranca(situacao: string): string {
  if (["RECEIVED", "CONFIRMED", "DUNNING_RECEIVED"].includes(situacao))
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (
    ["OVERDUE", "DUNNING_REQUESTED", "CHARGEBACK_REQUESTED", "CHARGEBACK_DISPUTE"].includes(
      situacao,
    )
  )
    return "border-red-200 bg-red-50 text-red-800";
  if (situacao === "PENDING") return "border-sky-200 bg-sky-50 text-sky-800";
  return "border-violet-200 bg-violet-50 text-violet-800";
}
