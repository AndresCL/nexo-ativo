"use client";

import { CreditCard, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  CATALOGO_PLANOS_FLUXO,
  type CobrancaHistoricoAsaas,
  type RegistroAssinaturaAsaas,
} from "@/dominio/assinaturas/tiposAssinaturaAsaas";
import type {
  Organizacao,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import {
  determinarEstadoCicloAssinatura,
} from "@/dominio/assinaturas/mapeadorCicloAssinatura";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import {
  servicoAssinaturasPainelCliente,
  type PortaAssinaturasPainelCliente,
} from "@/infraestrutura/painel/servicoAssinaturasPainelCliente";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import { combinarClasses } from "@/utilitarios/combinarClasses";

import { BannerCicloAssinatura } from "./BannerCicloAssinatura";
import { SecaoMetricasAssinatura } from "./SecaoMetricasAssinatura";
import { SecaoPlanosDisponiveis } from "./SecaoPlanosDisponiveis";
import { CartaoImplantacaoAssistida } from "./CartaoImplantacaoAssistida";
import { TabelaHistoricoCobrancas } from "./TabelaHistoricoCobrancas";
import { SecaoCancelamentoAssinatura } from "./SecaoCancelamentoAssinatura";
import {
  DialogoContratacaoAssinatura,
  type DadosSubmissaoContratacao,
} from "./DialogoContratacaoAssinatura";

export interface PropriedadesGerenciadorAssinaturaPainel {
  readonly organizacao: Organizacao;
  readonly assinaturaAtual: RegistroAssinaturaAsaas | null;
  readonly cobrancas: readonly CobrancaHistoricoAsaas[];
  readonly podeGerenciarAssinatura: boolean;
  readonly emailUsuario?: string | null;
  readonly servicoAssinaturas?: PortaAssinaturasPainelCliente;
}

function formatarData(dataIso: string): string {
  return dataIso.replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, "$3/$2/$1");
}

export function GerenciadorAssinaturaPainel({
  organizacao,
  assinaturaAtual,
  cobrancas,
  podeGerenciarAssinatura,
  emailUsuario,
  servicoAssinaturas = servicoAssinaturasPainelCliente,
}: PropriedadesGerenciadorAssinaturaPainel) {
  const router = useRouter();
  const planoAtivoCodigo = organizacao.resumoDireitosPlano.planoCodigo;
  const situacaoAssinatura = organizacao.resumoDireitosPlano.situacaoAssinatura;

  const [modalContratacaoAberto, setModalContratacaoAberto] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [contratandoImplantacao, setContratandoImplantacao] = useState(false);
  const contratacaoEmCurso = useRef(false);

  const [urlCheckoutGerado, setUrlCheckoutGerado] = useState<string | null>(
    assinaturaAtual?.urlFaturaOuCheckout ?? null,
  );
  const [checkoutRecemCriado, setCheckoutRecemCriado] = useState(false);

  const estadoCiclo = determinarEstadoCicloAssinatura(organizacao, assinaturaAtual, {
    checkoutRecemCriado,
    urlCheckoutRecemCriado: urlCheckoutGerado,
  });

  const vigenciaAteIso =
    organizacao.resumoDireitosPlano.vigenciaAteIso ??
    assinaturaAtual?.vigenciaAteIso;

  const temVigenciaRestante = Boolean(
    situacaoAssinatura === "cancelada" &&
      vigenciaAteIso &&
      new Date(vigenciaAteIso).getTime() >= new Date().setHours(0, 0, 0, 0),
  );

  const temFaturaPendente =
    estadoCiclo.tipo === "aguardando_primeiro_pagamento" ||
    estadoCiclo.tipo === "reativacao_pendente";

  const estaSemPlanoAtivo =
    situacaoAssinatura !== "ativa" &&
    !temVigenciaRestante &&
    !temFaturaPendente &&
    (planoAtivoCodigo === "avaliacao_inicial" || !assinaturaAtual);

  const planoAtual = CATALOGO_PLANOS_FLUXO[planoAtivoCodigo];
  const mensalidadeAtual = assinaturaAtual
    ? ValorMonetarioCentavos.deCentavos(
        assinaturaAtual.valorMensalCentavos,
      ).formatarMoedaBrasileira()
    : planoAtivoCodigo === "personalizado"
      ? "Sob consulta"
      : ValorMonetarioCentavos.deCentavos(planoAtual.mensalidadeCentavos).formatarMoedaBrasileira();

  const apoioPlanoAtual = estaSemPlanoAtivo
    ? "Modo Rascunho · Prévia liberada"
    : temVigenciaRestante
      ? "Cancelada · Sem renovação"
      : estadoCiclo.rotuloBadge;

  const apoioMensalidade = temVigenciaRestante && vigenciaAteIso
    ? `Acesso garantido até ${formatarData(vigenciaAteIso)}`
    : assinaturaAtual?.proximoVencimentoIso
      ? `Próximo vencimento: ${formatarData(assinaturaAtual.proximoVencimentoIso)}`
      : estaSemPlanoAtivo
        ? "Nenhuma cobrança ativa"
        : "Valor mensal do plano";

  const apoioEmails = estaSemPlanoAtivo
    ? "Franquia gratuita"
    : assinaturaAtual?.criadoEmIso
      ? `Franquia de notificações · Início: ${formatarData(assinaturaAtual.criadoEmIso)}`
      : "Franquia de notificações";

  async function submeterContratacao(dados: DadosSubmissaoContratacao) {
    if (!podeGerenciarAssinatura || contratacaoEmCurso.current) return;

    contratacaoEmCurso.current = true;
    setProcessando(true);

    try {
      const resultado = await servicoAssinaturas.criarAssinatura({
        organizacaoId: organizacao.id,
        planoCodigo: "pro",
        contratarImplantacaoAssistida: dados.incluirImplantacao,
        dadosFiscais: {
          nomeOuRazaoSocial: dados.nomeRazaoSocial.trim(),
          cpfOuCnpj: dados.cpfOuCnpj.trim(),
          email: dados.emailCobranca.trim(),
          ...(dados.telefone.trim() ? { telefone: dados.telefone.trim() } : {}),
        },
      });

      if (resultado.urlCheckoutOuFatura) {
        setUrlCheckoutGerado(resultado.urlCheckoutOuFatura);
        setCheckoutRecemCriado(true);
      }
      setModalContratacaoAberto(false);
      notificar.sucesso("Assinatura gerada. Acesse a fatura ou o checkout para continuar.");
      router.refresh();
    } catch (erro) {
      notificar.erro(erro instanceof Error ? erro.message : "Não foi possível gerar a assinatura.");
    } finally {
      contratacaoEmCurso.current = false;
      setProcessando(false);
    }
  }

  async function aoContratarImplantacaoAvulsa() {
    if (!podeGerenciarAssinatura || contratandoImplantacao) return;
    setContratandoImplantacao(true);
    try {
      const resultado = await servicoAssinaturas.contratarImplantacaoAssistida(organizacao.id);
      if (resultado.urlCheckout) {
        window.open(resultado.urlCheckout, "_blank");
      }
      notificar.sucesso("Cobrança de implantação gerada com sucesso! Acesse a fatura para concluir.");
    } catch (erro) {
      notificar.erro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível gerar a contratação da implantação.",
      );
    } finally {
      setContratandoImplantacao(false);
    }
  }

  async function aoCancelarAssinatura() {
    await servicoAssinaturas.cancelarAssinatura(organizacao.id);
    notificar.sucesso("Assinatura cancelada com sucesso.");
    router.refresh();
  }

  async function aoRestabelecerAssinatura() {
    if (!podeGerenciarAssinatura || processando) return;
    setProcessando(true);
    try {
      await servicoAssinaturas.restabelecerAssinatura(organizacao.id);
      notificar.sucesso("Renovação automática restabelecida com sucesso! Nenhuma cobrança foi gerada agora.");
      router.refresh();
    } catch (erro) {
      notificar.erro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível restabelecer a renovação automática.",
      );
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-marfim-200/80 pb-3 sm:pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
            Plano & Serviços
          </h1>
          <p className="mt-1 text-xs text-mineral-600">
            Acompanhe seu plano, os recursos incluídos e suas cobranças.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={combinarClasses(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              estadoCiclo.classeBadge,
            )}
          >
            {estadoCiclo.rotuloBadge}
          </span>
        </div>
      </header>

      <BannerCicloAssinatura
        estadoCiclo={estadoCiclo}
        podeGerenciar={podeGerenciarAssinatura}
        processando={processando}
        aoSolicitarReativacao={
          temVigenciaRestante ? aoRestabelecerAssinatura : () => setModalContratacaoAberto(true)
        }
      />

      <SecaoMetricasAssinatura
        estaSemPlanoAtivo={estaSemPlanoAtivo}
        nomePlano={planoAtual.nome}
        rotuloSituacao={apoioPlanoAtual}
        mensalidadeFormatada={temVigenciaRestante ? "Sem renovação" : mensalidadeAtual}
        apoioMensalidade={apoioMensalidade}
        limiteProfissionais={organizacao.resumoDireitosPlano.limiteProfissionaisAtivos}
        limiteEmails={organizacao.resumoDireitosPlano.limiteEnviosEmailMensal}
        apoioEmails={apoioEmails}
      />

      <SecaoPlanosDisponiveis
        organizacaoNome={organizacao.nome}
        planoAtivoCodigo={planoAtivoCodigo}
        situacaoAssinatura={situacaoAssinatura}
        temVigenciaRestante={temVigenciaRestante}
        vigenciaAteIso={vigenciaAteIso}
        temFaturaPendente={temFaturaPendente}
        urlCheckoutGerado={urlCheckoutGerado}
        podeGerenciar={podeGerenciarAssinatura}
        processando={processando}
        aoAbrirModalContratacao={() => setModalContratacaoAberto(true)}
      />

      <CartaoImplantacaoAssistida
        organizacaoNome={organizacao.nome}
        contratouImplantacao={Boolean(assinaturaAtual?.contratouImplantacaoAssistida)}
        podeGerenciar={podeGerenciarAssinatura}
        contratando={contratandoImplantacao}
        aoContratar={aoContratarImplantacaoAvulsa}
      />

      <TabelaHistoricoCobrancas
        cobrancas={cobrancas}
        situacaoAssinatura={situacaoAssinatura}
      />

      {situacaoAssinatura === "ativa" && assinaturaAtual && podeGerenciarAssinatura ? (
        <SecaoCancelamentoAssinatura
          vigenciaAteIso={vigenciaAteIso}
          aoConfirmarCancelamento={aoCancelarAssinatura}
        />
      ) : null}

      <DialogoContratacaoAssinatura
        aberto={modalContratacaoAberto}
        aoMudarAberto={setModalContratacaoAberto}
        definicaoPlano={CATALOGO_PLANOS_FLUXO.pro}
        nomePadrao={organizacao.nome}
        emailPadrao={emailUsuario ?? ""}
        temFaturaPendente={temFaturaPendente}
        processando={processando}
        aoSubmeter={submeterContratacao}
      />
    </div>
  );
}
