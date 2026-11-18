"use client";

import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import { ArrowUpRight, Calendar, MessageCircle, Phone, Sparkles } from "lucide-react";
import { obterListaImagensMidia } from "@/dominio/entidades/catalogoConteudo";
import type {
  ConteudoPaginaPublicada,
  ItemAcaoHome,
} from "@/dominio/entidades/paginaPublicada";
import { normalizarNumeroWhatsappInternacional } from "@/dominio/servicos/numeroWhatsappInternacional";
import { servicoTelemetriaAnonimaPadrao } from "@/infraestrutura/analytics/servicoTelemetriaAnonima";
import { obterOuDetectarOrigemSessao } from "@/infraestrutura/analytics/rastreadorSessaoOrigem";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { RenderizadorTextoRicoEditorial } from "../RenderizadorTextoRicoEditorial";
import { BottomSheetEditorialBase } from "./BottomSheetEditorialBase";

export interface PropriedadesBottomSheetPostVitrine {
  readonly aberto: boolean;
  readonly aoFechar: () => void;
  readonly pagina: ConteudoPaginaPublicada;
  readonly acaoPost: ItemAcaoHome | null;
  readonly whatsappFallbackOpcional?: string;
  readonly aoIniciarMicrofluxo?: (microfluxoId: string) => void;
}

export function BottomSheetPostVitrine({
  aberto,
  aoFechar,
  pagina,
  acaoPost,
  whatsappFallbackOpcional,
  aoIniciarMicrofluxo,
}: PropriedadesBottomSheetPostVitrine) {
  if (!acaoPost) return null;

  const post = acaoPost.configuracaoPost;
  const tituloExibicao = post?.tituloPost?.trim() || acaoPost.rotulo;
  const dataTexto = post?.dataTexto?.trim();
  const corpoTexto = post?.corpoTexto?.trim() || "";
  const imagensGaleria = obterListaImagensMidia(null, post?.imagens);

  const cta = post?.cta ?? { tipoAcao: "whatsapp" as const };
  const tipoCta = cta.tipoAcao;
  const rotuloBotaoPersonalizado = cta.rotuloBotao?.trim();

  function obterRotuloPadraoCta(): string {
    switch (tipoCta) {
      case "microfluxo":
        return "Continuar para experiência";
      case "link_externo":
        return "Acessar link";
      case "telefone":
        return "Ligar agora";
      case "whatsapp":
      default:
        return "Conversar no WhatsApp";
    }
  }

  function executarAcaoCta() {
    if (!acaoPost) return;
    const origem = obterOuDetectarOrigemSessao(pagina.organizacaoId);
    const idExperienciaPost = acaoPost.destino.startsWith("#post-")
      ? acaoPost.destino.slice("#post-".length)
      : acaoPost.id.replace(/^acao-fluxo-/, "");

    void servicoTelemetriaAnonimaPadrao.registrarEvento({
      organizacaoId: pagina.organizacaoId,
      tipoEvento: "conclusao_microfluxo",
      canalOrigem: origem.canalOrigem,
      ...(origem.qrCodeOrigem ? { qrCodeOrigem: origem.qrCodeOrigem } : {}),
      ...(origem.cartaoProfissionalId ? { cartaoProfissionalId: origem.cartaoProfissionalId } : {}),
      microfluxoId: idExperienciaPost,
      microfluxoTitulo: acaoPost.rotulo,
    });

    if (tipoCta === "microfluxo" && cta.microfluxoId && aoIniciarMicrofluxo) {
      aoFechar();
      aoIniciarMicrofluxo(cta.microfluxoId);
      return;
    }

    if (tipoCta === "link_externo") {
      const destinoUrl = cta.destinoOpcional?.trim();
      if (destinoUrl) {
        window.open(destinoUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }

    if (tipoCta === "telefone") {
      const bruto =
        cta.destinoOpcional?.trim() ||
        pagina.identidade.telefonePrincipalOpcional ||
        pagina.identidade.celularOpcional ||
        "";
      const limpo = bruto.replace(/[^\d+]/g, "");
      if (limpo) {
        void servicoTelemetriaAnonimaPadrao.registrarEvento({
          organizacaoId: pagina.organizacaoId,
          tipoEvento: "clique_ligacao",
          canalOrigem: origem.canalOrigem,
        });
        window.location.assign(`tel:${limpo}`);
      }
      return;
    }

    // WhatsApp (padrão)
    const destinoBruto =
      cta.destinoOpcional?.trim() ||
      whatsappFallbackOpcional ||
      pagina.identidade.celularOpcional ||
      pagina.identidade.telefonePrincipalOpcional ||
      "";

    const mensagem = encodeURIComponent(
      `Olá, vi a publicação "${tituloExibicao}" na vitrine da ${pagina.identidade.nomeExibicao} e gostaria de saber mais.`,
    );

    const linkWhatsapp = destinoBruto.startsWith("http")
      ? destinoBruto
      : (() => {
          const numero = normalizarNumeroWhatsappInternacional(destinoBruto);
          return numero ? `https://wa.me/${numero}?text=${mensagem}` : null;
        })();

    if (linkWhatsapp) {
      void servicoTelemetriaAnonimaPadrao.registrarEvento({
        organizacaoId: pagina.organizacaoId,
        tipoEvento: "clique_whatsapp",
        canalOrigem: origem.canalOrigem,
        ...(origem.qrCodeOrigem ? { qrCodeOrigem: origem.qrCodeOrigem } : {}),
        ...(origem.cartaoProfissionalId ? { cartaoProfissionalId: origem.cartaoProfissionalId } : {}),
      });
      window.open(linkWhatsapp, "_blank", "noopener,noreferrer");
    }
  }

  const iconeCta =
    tipoCta === "microfluxo" ? (
      <Sparkles className="h-4 w-4" aria-hidden="true" />
    ) : tipoCta === "link_externo" ? (
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    ) : tipoCta === "telefone" ? (
      <Phone className="h-4 w-4" aria-hidden="true" />
    ) : (
      <MessageCircle className="h-4 w-4 fill-white stroke-none" aria-hidden="true" />
    );

  return (
    <BottomSheetEditorialBase
      aberto={aberto}
      aoFechar={aoFechar}
      pagina={pagina}
      tituloFallbackImagens={tituloExibicao}
      imagensGaleria={imagensGaleria}
      ariaDescribedBy="corpo-post-detalhe"
      rodapeFixo={
        tipoCta !== "nenhum" ? (
          <button
            type="button"
            onClick={executarAcaoCta}
            className={combinarClasses(
              "flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-center text-sm font-bold shadow-md transition active:scale-[0.99] cursor-pointer",
              tipoCta === "whatsapp"
                ? "bg-[#25D366] text-white hover:opacity-95"
                : "bg-[var(--editorial-cta-fundo)] text-[var(--editorial-cta-texto)] hover:opacity-95",
            )}
          >
            {iconeCta}
            <span>{rotuloBotaoPersonalizado || obterRotuloPadraoCta()}</span>
          </button>
        ) : undefined
      }
    >
      {dataTexto ? (
        <div className="mb-2.5 flex items-center gap-1.5 text-xs font-medium tracking-wide text-[var(--editorial-texto-secundario)]">
          <Calendar className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
          <span>{dataTexto}</span>
        </div>
      ) : null}

      <DialogoPrimitivo.Title className="text-xl font-bold tracking-tight text-[var(--editorial-texto)] sm:text-2xl leading-snug">
        {tituloExibicao}
      </DialogoPrimitivo.Title>

      {corpoTexto ? (
        <div className="mt-4 border-t border-[var(--editorial-borda)] pt-4">
          <RenderizadorTextoRicoEditorial id="corpo-post-detalhe" texto={corpoTexto} />
        </div>
      ) : (
        <div id="corpo-post-detalhe" className="sr-only">
          Publicação {tituloExibicao}
        </div>
      )}
    </BottomSheetEditorialBase>
  );
}

