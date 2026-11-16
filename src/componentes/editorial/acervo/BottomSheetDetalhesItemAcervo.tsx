"use client";

import { useRef, type CSSProperties } from "react";
import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import { motion, useMotionValue, useTransform } from "motion/react";
import { X, MessageCircle, Sparkles, Clock } from "lucide-react";
import {
  formatarApresentacaoPrecoItem,
  obterListaImagensMidia,
  type ProdutoCatalogo,
  type ServicoOrganizacao,
} from "@/dominio/entidades/catalogoConteudo";
import {
  gerarVariaveisCssPaletaEditorial,
  obterDescritorPaletaEditorial,
  type ConteudoPaginaPublicada,
  type ConfiguracaoCtaAcervo,
} from "@/dominio/entidades/paginaPublicada";
import { normalizarNumeroWhatsappInternacional } from "@/dominio/servicos/numeroWhatsappInternacional";
import { GaleriaImagensComThumbs } from "@/componentes/interface/GaleriaImagensComThumbs";
import { servicoTelemetriaAnonimaPadrao } from "@/infraestrutura/analytics/servicoTelemetriaAnonima";
import { obterOuDetectarOrigemSessao } from "@/infraestrutura/analytics/rastreadorSessaoOrigem";
import { combinarClasses } from "@/utilitarios/combinarClasses";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const dragY = useMotionValue(0);
  const opacidadeHandle = useTransform(dragY, [0, 100], [1, 0.5]);

  if (!item) return null;

  const paleta = obterDescritorPaletaEditorial(pagina.paletaId);
  const variaveisPaleta = gerarVariaveisCssPaletaEditorial(
    pagina.paletaId,
    pagina.corPersonalizadaHex,
    pagina.customizacaoTokens,
  ) as CSSProperties;

  const ehProduto = tipo === "produtos";
  const produto = ehProduto ? (item as ProdutoCatalogo) : null;
  const servico = !ehProduto ? (item as ServicoOrganizacao) : null;

  // Imagens
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

  // Preço formatado
  const precoCentavos = ehProduto ? produto?.precoCentavos : servico?.precoBaseCentavos;
  const rotuloPreco = formatarApresentacaoPrecoItem({
    centavos: precoCentavos,
    rotuloOpcional: item.rotuloPrecoOpcional,
  });

  // Configuração do CTA
  const tipoCta = configuracaoCta?.tipoAcao ?? "whatsapp";
  const rotuloBotaoPersonalizado = configuracaoCta?.rotuloBotao?.trim();

  // WhatsApp
  const whatsappDisponivel =
    pagina.identidade.celularOpcional || pagina.identidade.telefonePrincipalOpcional;
  const numeroWhatsappLimpo = normalizarNumeroWhatsappInternacional(whatsappDisponivel);

  const mensagemWhatsapp = encodeURIComponent(
    `Olá, vi o anúncio de "${item.nome}" na vitrine da ${pagina.identidade.nomeExibicao} e gostaria de mais informações.`,
  );
  const linkWhatsapp = numeroWhatsappLimpo
    ? `https://wa.me/${numeroWhatsappLimpo}?text=${mensagemWhatsapp}`
    : null;

  function registrarCliqueWhatsapp() {
    const origem = obterOuDetectarOrigemSessao(pagina.organizacaoId);
    void servicoTelemetriaAnonimaPadrao.registrarEvento({
      organizacaoId: pagina.organizacaoId,
      tipoEvento: "clique_whatsapp",
      canalOrigem: origem.canalOrigem,
      ...(origem.qrCodeOrigem ? { qrCodeOrigem: origem.qrCodeOrigem } : {}),
      ...(origem.cartaoProfissionalId ? { cartaoProfissionalId: origem.cartaoProfissionalId } : {}),
    });
  }

  function executarAcaoCta() {
    if (tipoCta === "microfluxo" && configuracaoCta?.microfluxoId && aoIniciarMicrofluxo) {
      aoFechar();
      aoIniciarMicrofluxo(configuracaoCta.microfluxoId, {
        ...(ehProduto ? { produtoId: item.id } : { servicoId: item.id }),
      });
      return;
    }

    if (linkWhatsapp) {
      registrarCliqueWhatsapp();
      window.open(linkWhatsapp, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <DialogoPrimitivo.Root open={aberto} onOpenChange={(abrir) => !abrir && aoFechar()}>
      <DialogoPrimitivo.Portal>
        <DialogoPrimitivo.Overlay className="animacao-overlay-dialogo fixed inset-0 z-40 bg-black/60 backdrop-blur-xs" />

        <DialogoPrimitivo.Content
          asChild
          style={variaveisPaleta}
          aria-describedby="descricao-item-detalhe"
          className="focus:outline-hidden"
        >
          <motion.div
            ref={containerRef}
            style={{ y: dragY }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.65 }}
            onDragEnd={(_evento, info) => {
              if (info.offset.y > 90 || info.velocity.y > 350) {
                aoFechar();
              }
            }}
            className={combinarClasses(
              "animacao-painel-responsivo fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t shadow-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-full sm:w-[28rem] sm:rounded-none sm:border-l sm:border-t-0 font-sans",
              paleta.temaEscuro
                ? "border-white/15 bg-[var(--editorial-fundo)] text-[var(--editorial-texto)]"
                : "border-black/10 bg-[var(--editorial-fundo)] text-[var(--editorial-texto)]",
            )}
          >
            {/* Barrinha Fixa de Drag Sempre Visível (com cápsula translúcida resistente) */}
            <motion.div
              style={{ opacity: opacidadeHandle }}
              className="absolute top-2.5 inset-x-0 z-40 flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing sm:hidden py-1 touch-none"
            >
              <div
                className="h-1.5 w-12 rounded-full bg-white/80 shadow-md backdrop-blur-md ring-1 ring-black/10"
                aria-hidden="true"
              />
            </motion.div>

            {/* Botão Fechar Flutuante */}
            <DialogoPrimitivo.Close
              onClick={aoFechar}
              aria-label="Fechar detalhes"
              className="absolute top-4 right-4 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-black/45 text-white shadow-md backdrop-blur-md transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </DialogoPrimitivo.Close>

            {/* Área de Conteúdo com Rolagem */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Galeria de Fotos 100% Sangrada (Bleed de ponta a ponta sem margens) */}
              {imagensGaleria.length > 0 ? (
                <div className="w-full overflow-hidden bg-black/10">
                  <GaleriaImagensComThumbs
                    imagens={imagensGaleria}
                    tituloFallback={item.nome}
                    temaEscuro={paleta.temaEscuro}
                    proporcaoClassName="aspect-4/3 w-full !rounded-none"
                    className="space-y-0 [&_div.flex]:p-3 [&_div.flex]:bg-[var(--editorial-superficie)]/50"
                  />
                </div>
              ) : null}

              {/* Conteúdo textual com padding equilibrado */}
              <div className="px-5 pt-5 pb-6 sm:px-6">
                {/* Categoria e Preço */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {item.categoria ? (
                    <span className="rounded-full bg-current/8 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-[var(--editorial-texto-secundario)] uppercase">
                      {item.categoria}
                    </span>
                  ) : (
                    <div />
                  )}

                  <span className="text-base font-bold text-[var(--editorial-destaque)] sm:text-lg">
                    {rotuloPreco}
                  </span>
                </div>

                {/* Título Único do Item */}
                <DialogoPrimitivo.Title className="mt-3 text-xl font-bold tracking-tight text-[var(--editorial-texto)] sm:text-2xl leading-snug">
                  {item.nome}
                </DialogoPrimitivo.Title>

                {/* Prazo ou Duração (se for serviço) */}
                {servico?.prazoOuDuracao ? (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--editorial-texto-secundario)]">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{servico.prazoOuDuracao}</span>
                  </div>
                ) : null}

                {/* Especificações Rápidas */}
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

                {/* Descrição / Resumo */}
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
              </div>
            </div>

            {/* Rodapé Fixo de Conversão Conforme o CTA da Experiência */}
            <div className="shrink-0 border-t border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] p-4 sm:p-5">
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
            </div>
          </motion.div>
        </DialogoPrimitivo.Content>
      </DialogoPrimitivo.Portal>
    </DialogoPrimitivo.Root>
  );
}
