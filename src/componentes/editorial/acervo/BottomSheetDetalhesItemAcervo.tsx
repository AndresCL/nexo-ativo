"use client";

import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import { MessageCircle, Sparkles, Clock } from "lucide-react";
import {
  formatarApresentacaoPrecoItem,
  obterListaImagensMidia,
  type ProdutoCatalogo,
  type ServicoOrganizacao,
} from "@/dominio/entidades/catalogoConteudo";
import type {
  ConteudoPaginaPublicada,
  ConfiguracaoCtaAcervo,
} from "@/dominio/entidades/paginaPublicada";
import { normalizarNumeroWhatsappInternacional } from "@/dominio/servicos/numeroWhatsappInternacional";
import { servicoTelemetriaAnonimaPadrao } from "@/infraestrutura/analytics/servicoTelemetriaAnonima";
import { obterOuDetectarOrigemSessao } from "@/infraestrutura/analytics/rastreadorSessaoOrigem";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { BottomSheetEditorialBase } from "./BottomSheetEditorialBase";

interface PropriedadesBottomSheetDetalhesItemAcervo {
  readonly aberto: boolean;
  readonly aoFechar: () => void;
  readonly pagina: ConteudoPaginaPublicada;
  readonly item: ProdutoCatalogo | ServicoOrganizacao | null;
  readonly tipo: "produtos" | "servicos";
  readonly configuracaoCta?: ConfiguracaoCtaAcervo;
  readonly aoIniciarMicrofluxo?: (
    microfluxoId: string,
    contextoItem: { produtoId?: string; servicoId?: string },
  ) => void;
}

export function BottomSheetDetalhesItemAcervo({
  aberto,
  aoFechar,
  pagina,
  item,
  tipo,
  configuracaoCta,
  aoIniciarMicrofluxo,
}: PropriedadesBottomSheetDetalhesItemAcervo) {
  if (!item) return null;

  const ehProduto = tipo === "produtos";
  const produto = ehProduto ? (item as ProdutoCatalogo) : null;
  const servico = !ehProduto ? (item as ServicoOrganizacao) : null;

  const imagemPrincipal = ehProduto
    ? produto?.urlImagemPrincipal
      ? {
          url: produto.urlImagemPrincipal,
          textoAlternativo: produto.nome,
          pontoFocal: produto.pontoFocalImagem,
        }
      : null
    : servico?.urlImagemOpcional
      ? {
          url: servico.urlImagemOpcional,
          textoAlternativo: servico.nome,
          pontoFocal: servico.pontoFocalImagem,
        }
      : null;

  const imagensGaleria = obterListaImagensMidia(imagemPrincipal, item.imagens);

  const precoCentavos = ehProduto ? produto?.precoCentavos : servico?.precoBaseCentavos;
  const rotuloPreco = formatarApresentacaoPrecoItem({
    centavos: precoCentavos,
    rotuloOpcional: item.rotuloPrecoOpcional,
  });

  const tipoCta = configuracaoCta?.tipoAcao ?? "whatsapp";
  const rotuloBotaoPersonalizado = configuracaoCta?.rotuloBotao?.trim();

  const whatsappDisponivel =
    pagina.identidade.celularOpcional || pagina.identidade.telefonePrincipalOpcional;
  const numeroWhatsappLimpo = normalizarNumeroWhatsappInternacional(whatsappDisponivel);

  const mensagemWhatsapp = encodeURIComponent(
    `Olá, vi o anúncio de "${item.nome}" na vitrine da ${pagina.identidade.nomeExibicao} e gostaria de mais informações.`,
  );
  const linkWhatsapp = numeroWhatsappLimpo
    ? `https://wa.me/${numeroWhatsappLimpo}?text=${mensagemWhatsapp}`
    : null;

  function executarAcaoCta() {
    if (!item) return;
    if (tipoCta === "microfluxo" && configuracaoCta?.microfluxoId && aoIniciarMicrofluxo) {
      aoFechar();
      aoIniciarMicrofluxo(configuracaoCta.microfluxoId, {
        ...(ehProduto ? { produtoId: item.id } : { servicoId: item.id }),
      });
      return;
    }

    if (linkWhatsapp) {
      const origem = obterOuDetectarOrigemSessao(pagina.organizacaoId);
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

  return (
    <BottomSheetEditorialBase
      aberto={aberto}
      aoFechar={aoFechar}
      pagina={pagina}
      tituloFallbackImagens={item.nome}
      imagensGaleria={imagensGaleria}
      ariaDescribedBy="descricao-item-detalhe"
      rodapeFixo={
        <button
          type="button"
          onClick={executarAcaoCta}
          className={combinarClasses(
            "flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-center text-sm font-bold shadow-md transition active:scale-[0.99] cursor-pointer",
            tipoCta === "microfluxo"
              ? "bg-[var(--editorial-cta-fundo)] text-[var(--editorial-cta-texto)] hover:opacity-95"
              : "bg-[#25D366] text-white hover:opacity-95",
          )}
        >
          {tipoCta === "microfluxo" ? (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          ) : (
            <MessageCircle className="h-4 w-4 fill-white stroke-none" aria-hidden="true" />
          )}
          <span>
            {rotuloBotaoPersonalizado ||
              (tipoCta === "microfluxo"
                ? `Iniciar experiência deste ${ehProduto ? "produto" : "serviço"}`
                : `Conversar sobre este ${ehProduto ? "produto" : "serviço"}`)}
          </span>
        </button>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        {item.categoria ? (
          <span className="rounded-full bg-current/8 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-[var(--editorial-texto-secundario)] uppercase">
            {item.categoria}
          </span>
        ) : (
          <div />
        )}

        <span className="text-base font-bold text-[var(--editorial-texto-secundario)] sm:text-lg">
          {rotuloPreco}
        </span>
      </div>

      <DialogoPrimitivo.Title className="mt-3 text-xl font-bold tracking-tight text-[var(--editorial-texto)] sm:text-2xl leading-snug">
        {item.nome}
      </DialogoPrimitivo.Title>

      {servico?.prazoOuDuracao ? (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--editorial-texto-secundario)]">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{servico.prazoOuDuracao}</span>
        </div>
      ) : null}

      {produto?.especificacoesCurtas && produto.especificacoesCurtas.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {produto.especificacoesCurtas.map((especificacao, idx) => (
            <span
              key={idx}
              className="rounded-lg border border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] px-2.5 py-1 text-xs font-medium text-[var(--editorial-texto-secundario)]"
            >
              {especificacao}
            </span>
          ))}
        </div>
      ) : null}

      {item.resumo ? (
        <div className="mt-5 border-t border-[var(--editorial-borda)] pt-4">
          <p
            id="descricao-item-detalhe"
            className="text-sm leading-relaxed text-[var(--editorial-texto-secundario)] whitespace-pre-line"
          >
            {item.resumo}
          </p>
        </div>
      ) : (
        <div id="descricao-item-detalhe" className="sr-only">
          Detalhes de {item.nome}
        </div>
      )}
    </BottomSheetEditorialBase>
  );
}
