"use client";

import { Sparkles } from "lucide-react";
import { IconeWhatsapp } from "@/componentes/interface/IconeWhatsapp";
import type {
  ConfiguracaoCtaAcervo,
  ConteudoPaginaPublicada,
} from "@/dominio/entidades/paginaPublicada";
import { normalizarNumeroWhatsappInternacional } from "@/dominio/servicos/numeroWhatsappInternacional";
import { obterOuDetectarOrigemSessao } from "@/infraestrutura/analytics/rastreadorSessaoOrigem";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { useAmbienteVitrine } from "../contextoAmbienteVitrine";

export type CtaItemAcervoResolvido =
  | {
      readonly tipo: "microfluxo";
      readonly microfluxoId: string;
      readonly rotulo: string;
    }
  | {
      readonly tipo: "whatsapp";
      readonly linkWhatsapp: string;
      readonly rotulo: string;
    };

export interface ParametrosResolucaoCtaItemAcervo {
  readonly pagina: ConteudoPaginaPublicada;
  readonly tipo: "produtos" | "servicos";
  readonly itemNome: string;
  readonly configuracaoCta?: ConfiguracaoCtaAcervo;
  readonly whatsappFallbackOpcional?: string;
  readonly possuiHandlerMicrofluxo: boolean;
}

export function resolverCtaItemAcervo({
  pagina,
  tipo,
  itemNome,
  configuracaoCta,
  whatsappFallbackOpcional,
  possuiHandlerMicrofluxo,
}: ParametrosResolucaoCtaItemAcervo): CtaItemAcervoResolvido | null {
  const ehProduto = tipo === "produtos";
  const tipoCta = configuracaoCta?.tipoAcao ?? "whatsapp";
  const rotuloPersonalizado = configuracaoCta?.rotuloBotao?.trim();

  if (tipoCta === "microfluxo") {
    const microfluxoId = configuracaoCta?.microfluxoId?.trim();
    if (!microfluxoId || !possuiHandlerMicrofluxo) {
      return null;
    }

    return {
      tipo: "microfluxo",
      microfluxoId,
      rotulo:
        rotuloPersonalizado ||
        `Iniciar experiência deste ${ehProduto ? "produto" : "serviço"}`,
    };
  }

  const whatsappDisponivel =
    whatsappFallbackOpcional ||
    pagina.identidade.celularOpcional ||
    pagina.identidade.telefonePrincipalOpcional;
  const numeroWhatsappLimpo = normalizarNumeroWhatsappInternacional(whatsappDisponivel);

  if (!numeroWhatsappLimpo) {
    return null;
  }

  const mensagemWhatsapp = encodeURIComponent(
    `Olá, vi o anúncio de "${itemNome}" na vitrine da ${pagina.identidade.nomeExibicao} e gostaria de mais informações.`,
  );

  return {
    tipo: "whatsapp",
    linkWhatsapp: `https://wa.me/${numeroWhatsappLimpo}?text=${mensagemWhatsapp}`,
    rotulo:
      rotuloPersonalizado || `Conversar sobre este ${ehProduto ? "produto" : "serviço"}`,
  };
}

export interface PropriedadesBotaoCtaItemAcervo {
  readonly pagina: ConteudoPaginaPublicada;
  readonly tipo: "produtos" | "servicos";
  readonly itemId: string;
  readonly itemNome: string;
  readonly configuracaoCta?: ConfiguracaoCtaAcervo;
  readonly whatsappFallbackOpcional?: string;
  readonly aoIniciarMicrofluxo?: (
    microfluxoId: string,
    contextoItem: { produtoId?: string; servicoId?: string },
  ) => void;
  readonly aoAntesExecutarMicrofluxo?: () => void;
  readonly tamanho?: "padrao" | "compacto";
  readonly className?: string;
}

export function BotaoCtaItemAcervo({
  pagina,
  tipo,
  itemId,
  itemNome,
  configuracaoCta,
  whatsappFallbackOpcional,
  aoIniciarMicrofluxo,
  aoAntesExecutarMicrofluxo,
  tamanho = "padrao",
  className,
}: PropriedadesBotaoCtaItemAcervo) {
  const { registrarEventoTelemetria } = useAmbienteVitrine();

  const ctaResolvido = resolverCtaItemAcervo({
    pagina,
    tipo,
    itemNome,
    configuracaoCta,
    whatsappFallbackOpcional,
    possuiHandlerMicrofluxo: Boolean(aoIniciarMicrofluxo),
  });

  if (!ctaResolvido) {
    return null;
  }

  const ehProduto = tipo === "produtos";

  function executarAcao() {
    if (!ctaResolvido) return;

    if (ctaResolvido.tipo === "microfluxo" && aoIniciarMicrofluxo) {
      aoAntesExecutarMicrofluxo?.();
      aoIniciarMicrofluxo(ctaResolvido.microfluxoId, {
        ...(ehProduto ? { produtoId: itemId } : { servicoId: itemId }),
      });
      return;
    }

    if (ctaResolvido.tipo === "whatsapp") {
      const origem = obterOuDetectarOrigemSessao(pagina.organizacaoId);
      void registrarEventoTelemetria({
        organizacaoId: pagina.organizacaoId,
        tipoEvento: "clique_whatsapp",
        canalOrigem: origem.canalOrigem,
        ...(origem.qrCodeOrigem ? { qrCodeOrigem: origem.qrCodeOrigem } : {}),
        ...(origem.cartaoProfissionalId
          ? { cartaoProfissionalId: origem.cartaoProfissionalId }
          : {}),
      });
      window.open(ctaResolvido.linkWhatsapp, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      type="button"
      onClick={executarAcao}
      className={combinarClasses(
        "flex items-center justify-center rounded-xl text-center transition active:scale-[0.99] cursor-pointer",
        tamanho === "padrao"
          ? "w-full gap-2 px-5 py-3.5 text-sm font-bold shadow-md"
          : "w-full sm:w-auto gap-1.5 px-4 py-2.5 text-xs font-semibold shadow-xs",
        ctaResolvido.tipo === "microfluxo"
          ? "bg-[var(--editorial-cta-fundo)] text-[var(--editorial-cta-texto)] hover:opacity-95"
          : "bg-[#25D366] text-white hover:opacity-95",
        className,
      )}
    >
      {ctaResolvido.tipo === "microfluxo" ? (
        <Sparkles
          className={tamanho === "padrao" ? "h-4 w-4 shrink-0" : "h-3.5 w-3.5 shrink-0"}
          aria-hidden="true"
        />
      ) : (
        <IconeWhatsapp
          className={tamanho === "padrao" ? "h-4 w-4 shrink-0" : "h-3.5 w-3.5 shrink-0"}
          aria-hidden="true"
        />
      )}
      <span>{ctaResolvido.rotulo}</span>
    </button>
  );
}

