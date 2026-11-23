"use client";

import Link from "next/link";
import { Reorder, useDragControls } from "motion/react";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Compass,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  GripVertical,
  Link2,
  MessageCircle,
  Phone,
  Pin,
  PinOff,
  Share2,
  Sparkles,
  Star,
} from "lucide-react";
import { copiarTextoComAviso } from "@/componentes/interface/notificacoes/copiarTextoComAviso";
import { construirCaminhoExperiencia } from "@/dominio/microfluxos/conclusaoMicrofluxo";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import {
  DESCRITORES_TIPO_ACAO,
  type ItemListaUnificadaVitrine,
} from "./descritoresTipoAcao";

export interface PropriedadesItemBlocoListaVitrine {
  readonly item: ItemListaUnificadaVitrine;
  readonly posicaoExibicao?: number;
  readonly identificadorPublico: string;
  readonly podeAlterar: boolean;
  readonly arrasteHabilitado: boolean;
  readonly podeSubir: boolean;
  readonly podeDescer: boolean;
  readonly aoMover?: (direcao: -1 | 1) => void;
  readonly aoAlternarVisibilidade: () => void;
  readonly aoAbrirEditor?: () => void;
  readonly aoAlternarFixarMarcaTopo?: () => void;
}

function ConteudoLinhaBloco({
  item,
  posicaoExibicao,
  identificadorPublico,
  podeAlterar,
  arrasteHabilitado,
  podeSubir,
  podeDescer,
  aoMover,
  aoAlternarVisibilidade,
  aoAbrirEditor,
  aoAlternarFixarMarcaTopo,
  aoIniciarArraste,
}: PropriedadesItemBlocoListaVitrine & {
  readonly aoIniciarArraste?: (evento: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  if (item.tipo === "sistema") {
    const ehMarca = item.idBloco === "bloco:marca";
    const IconeSistema =
      item.idBloco === "bloco:marca"
        ? Sparkles
        : item.idBloco === "bloco:avaliacoes_google"
          ? Star
          : Share2;

    return (
      <div
        data-testid={`item-bloco-${item.idBloco}`}
        className={combinarClasses(
          "flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-3.5 py-3 shadow-2xs transition-colors sm:flex-nowrap",
          item.fixaNoTopo
            ? "border-indigo-200 bg-indigo-50/35"
            : item.visivel
              ? "border-marfim-200 hover:border-mineral-300"
              : "border-dashed border-marfim-300 bg-marfim-50/70 opacity-80",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {!item.fixaNoTopo ? (
            <button
              type="button"
              disabled={!arrasteHabilitado}
              onPointerDown={aoIniciarArraste}
              aria-label={`Arrastar ${item.titulo}`}
              title={
                arrasteHabilitado
                  ? "Arraste para reordenar"
                  : "Limpe a busca ou filtro para arrastar"
              }
              className="flex h-8 w-7 shrink-0 cursor-grab items-center justify-center rounded-md text-mineral-400 hover:bg-marfim-100 hover:text-mineral-700 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
            >
              <GripVertical className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <span
              className="flex h-8 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-indigo-700"
              title="Fixa no topo da tela"
            >
              <Pin className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          )}

          {posicaoExibicao !== undefined ? (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-marfim-100 text-[11px] font-bold tabular-nums text-mineral-700">
              {posicaoExibicao}º
            </span>
          ) : null}

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mineral-900/5 text-mineral-800">
            <IconeSistema className="h-4 w-4" aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-mineral-950">{item.titulo}</span>
              <span className="rounded-full border border-mineral-200 bg-marfim-50 px-2 py-0.5 text-[10px] font-medium text-mineral-600">
                {item.badgeTipo}
              </span>
              {item.fixaNoTopo ? (
                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-800">
                  Fixa no topo
                </span>
              ) : null}
              <span
                className={combinarClasses(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                  item.visivel
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-marfim-200 bg-marfim-100 text-mineral-500",
                )}
              >
                {item.visivel ? (
                  <Eye className="h-2.5 w-2.5" aria-hidden="true" />
                ) : (
                  <EyeOff className="h-2.5 w-2.5" aria-hidden="true" />
                )}
                {item.visivel ? "Visível" : "Oculto"}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-mineral-500">{item.subtitulo}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {ehMarca && aoAlternarFixarMarcaTopo ? (
            <button
              type="button"
              disabled={!podeAlterar}
              onClick={aoAlternarFixarMarcaTopo}
              title={
                item.fixaNoTopo
                  ? "Mover marca para a lista ordenável"
                  : "Fixar marca no topo da tela"
              }
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-marfim-200 bg-white px-2.5 text-[11px] font-medium text-mineral-700 transition hover:bg-indigo-50 hover:text-indigo-800 disabled:opacity-40"
            >
              {item.fixaNoTopo ? (
                <>
                  <PinOff className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Mover para lista</span>
                </>
              ) : (
                <>
                  <Pin className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Fixar no topo</span>
                </>
              )}
            </button>
          ) : null}

          <button
            type="button"
            disabled={!podeAlterar}
            onClick={aoAlternarVisibilidade}
            aria-label={item.visivel ? `Ocultar ${item.titulo}` : `Mostrar ${item.titulo}`}
            title={item.visivel ? "Ocultar na vitrine" : "Mostrar na vitrine"}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-marfim-200 bg-white text-mineral-600 transition hover:bg-marfim-50 hover:text-mineral-950 disabled:opacity-40"
          >
            {item.visivel ? (
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>

          {!item.fixaNoTopo && aoMover ? (
            <>
              <button
                type="button"
                disabled={!podeSubir}
                aria-label={`Mover ${item.titulo} para cima`}
                title="Mover para cima"
                onClick={() => aoMover(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-marfim-200 bg-white text-mineral-600 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={!podeDescer}
                aria-label={`Mover ${item.titulo} para baixo`}
                title="Mover para baixo"
                onClick={() => aoMover(1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-marfim-200 bg-white text-mineral-600 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </>
          ) : null}

          <Link
            href={`/painel/aparencia?aba=${item.abaAparencia}`}
            title="Configurar em Aparência"
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-marfim-200 bg-white px-2.5 text-[11px] font-medium text-mineral-700 transition hover:bg-marfim-50 hover:text-mineral-950"
          >
            <span className="hidden md:inline">Aparência</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  const { fluxo } = item;
  const nomeExibicao = fluxo.rotuloBotaoHome?.trim() || fluxo.titulo;
  const ehDestaque = fluxo.destaquePrimarioHome === true;
  const IconeStatus = ehDestaque ? Star : fluxo.ativo ? Eye : EyeOff;
  const tipoAcao = fluxo.tipoAcao ?? "microfluxo";
  const ehMicrofluxo = tipoAcao === "microfluxo";

  return (
    <div
      data-testid={`item-bloco-${item.idBloco}`}
      className={combinarClasses(
        "group flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-3.5 py-3 shadow-2xs transition-colors sm:flex-nowrap",
        fluxo.ativo
          ? "border-marfim-200 hover:border-indigo-300"
          : "border-dashed border-marfim-300 bg-marfim-50/70 opacity-85",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <button
          type="button"
          disabled={!arrasteHabilitado}
          onPointerDown={aoIniciarArraste}
          aria-label={`Arrastar ${nomeExibicao}`}
          title={
            arrasteHabilitado ? "Arraste para reordenar" : "Limpe a busca ou filtro para arrastar"
          }
          className="flex h-8 w-7 shrink-0 cursor-grab items-center justify-center rounded-md text-mineral-400 hover:bg-marfim-100 hover:text-mineral-700 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        {posicaoExibicao !== undefined ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-[11px] font-bold tabular-nums text-indigo-700">
            {posicaoExibicao}º
          </span>
        ) : null}

        <button
          type="button"
          onClick={aoAbrirEditor}
          className="min-w-0 flex-1 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-indigo-500"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-mineral-950 group-hover:text-indigo-800">
              {nomeExibicao}
            </span>
            <span
              className={combinarClasses(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                ehDestaque
                  ? "border-violet-200 bg-violet-50 text-violet-800"
                  : fluxo.ativo
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-marfim-200 bg-marfim-100 text-mineral-500",
              )}
            >
              <IconeStatus className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
              {ehDestaque ? "Em destaque" : fluxo.ativo ? "Visível" : "Oculta"}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-mineral-500">
              {ehMicrofluxo ? (
                `${fluxo.etapas.length} etapas`
              ) : (
                <>
                  {tipoAcao === "link_externo" ? (
                    <Globe className="h-3 w-3" aria-hidden="true" />
                  ) : tipoAcao === "whatsapp" ? (
                    <MessageCircle className="h-3 w-3" aria-hidden="true" />
                  ) : tipoAcao === "telefone" ? (
                    <Phone className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Compass className="h-3 w-3" aria-hidden="true" />
                  )}
                  {DESCRITORES_TIPO_ACAO[tipoAcao]?.iconeBadge ?? "Ação"}
                </>
              )}
            </span>
          </div>
          {fluxo.subtituloBotaoHome ? (
            <p className="mt-0.5 truncate text-[11px] text-mineral-500">
              {fluxo.subtituloBotaoHome}
            </p>
          ) : null}
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {ehMicrofluxo ? (
          <button
            type="button"
            aria-label={`Copiar permalink de ${nomeExibicao}`}
            title={`Copiar link da versão publicada de ${nomeExibicao}`}
            onClick={() =>
              void copiarTextoComAviso(
                new URL(
                  construirCaminhoExperiencia(identificadorPublico, fluxo.id),
                  window.location.origin,
                ).href,
                "Permalink da experiência copiado.",
              )
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-marfim-200 bg-white text-mineral-500 transition hover:bg-indigo-50 hover:text-indigo-700"
          >
            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}

        <button
          type="button"
          disabled={!podeAlterar}
          onClick={aoAlternarVisibilidade}
          aria-label={fluxo.ativo ? `Ocultar ${nomeExibicao}` : `Mostrar ${nomeExibicao}`}
          title={fluxo.ativo ? "Ocultar na vitrine" : "Mostrar na vitrine"}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-marfim-200 bg-white text-mineral-600 transition hover:bg-marfim-50 hover:text-mineral-950 disabled:opacity-40"
        >
          {fluxo.ativo ? (
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>

        {aoMover ? (
          <>
            <button
              type="button"
              disabled={!podeSubir}
              aria-label={`Mover ${nomeExibicao} para cima`}
              title="Mover para cima"
              onClick={() => aoMover(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-marfim-200 bg-white text-mineral-600 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={!podeDescer}
              aria-label={`Mover ${nomeExibicao} para baixo`}
              title="Mover para baixo"
              onClick={() => aoMover(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-marfim-200 bg-white text-mineral-600 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </>
        ) : null}

        <button
          type="button"
          onClick={aoAbrirEditor}
          aria-label={`Editar ${nomeExibicao}`}
          className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-100"
        >
          <span>Editar</span>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function ItemBlocoListaVitrine(propriedades: PropriedadesItemBlocoListaVitrine) {
  const controlesArraste = useDragControls();

  if (propriedades.item.tipo === "sistema" && propriedades.item.fixaNoTopo) {
    return <ConteudoLinhaBloco {...propriedades} />;
  }

  return (
    <Reorder.Item
      value={propriedades.item.idBloco}
      dragListener={false}
      dragControls={controlesArraste}
      className="list-none"
    >
      <ConteudoLinhaBloco
        {...propriedades}
        aoIniciarArraste={(evento) => {
          if (propriedades.arrasteHabilitado) {
            controlesArraste.start(evento);
          }
        }}
      />
    </Reorder.Item>
  );
}

