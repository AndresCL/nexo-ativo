"use client";

import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import { Clock } from "lucide-react";
import {
  formatarApresentacaoPrecoItem,
  obterListaImagensMidia,
  type ProdutoCatalogo,
  type ServicoOrganizacao,
} from "@/dominio/entidades/catalogoConteudo";
import {
  resolverTemaEscuroBottomSheetEditorial,
  type ConteudoPaginaPublicada,
  type ConfiguracaoCtaAcervo,
} from "@/dominio/entidades/paginaPublicada";
import { GaleriaImagensComThumbs } from "@/componentes/interface/GaleriaImagensComThumbs";
import { BottomSheetEditorialBase } from "../BottomSheetEditorialBase";
import { BotaoCtaItemAcervo, resolverCtaItemAcervo } from "./BotaoCtaItemAcervo";

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

  const temaEscuroBottomSheet = resolverTemaEscuroBottomSheetEditorial(
    pagina.paletaId,
    pagina.corPersonalizadaHex,
    pagina.customizacaoTokens,
  );
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

  const possuiCta =
    resolverCtaItemAcervo({
      pagina,
      tipo,
      itemNome: item.nome,
      configuracaoCta,
      possuiHandlerMicrofluxo: Boolean(aoIniciarMicrofluxo),
    }) !== null;

  return (
    <BottomSheetEditorialBase
      aberto={aberto}
      aoFechar={aoFechar}
      pagina={pagina}
      ariaDescribedBy="descricao-item-detalhe"
      midiaTopoSangrada={
        imagensGaleria.length > 0 ? (
          <GaleriaImagensComThumbs
            imagens={imagensGaleria}
            tituloFallback={item.nome}
            temaEscuro={temaEscuroBottomSheet}
            proporcaoClassName="aspect-4/3 w-full !rounded-none"
            className="space-y-0 [&_div.flex]:p-3 [&_div.flex]:bg-[var(--editorial-superficie)]/50"
          />
        ) : undefined
      }
      rodapeFixo={
        possuiCta ? (
          <BotaoCtaItemAcervo
            pagina={pagina}
            tipo={tipo}
            itemId={item.id}
            itemNome={item.nome}
            configuracaoCta={configuracaoCta}
            aoAntesExecutarMicrofluxo={aoFechar}
            aoIniciarMicrofluxo={aoIniciarMicrofluxo}
            tamanho="padrao"
          />
        ) : undefined
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
