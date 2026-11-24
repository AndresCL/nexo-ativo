"use client";

import Link from "next/link";
import { Reorder, useDragControls } from "motion/react";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Link2,
  Pin,
  PinOff,
} from "lucide-react";
import { copiarTextoComAviso } from "@/componentes/interface/notificacoes/copiarTextoComAviso";
import { construirCaminhoExperiencia } from "@/dominio/microfluxos/conclusaoMicrofluxo";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import {
  DESCRITORES_TIPO_ACAO,
  type ItemListaUnificadaVitrine,
} from "./descritoresTipoAcao";
import { MenuAcoesMobileBloco, type AcaoMenuMobileBloco } from "./MenuAcoesMobileBloco";

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

    const acoesMobileSistema: AcaoMenuMobileBloco[] = [
      ...(ehMarca && aoAlternarFixarMarcaTopo
        ? [
            {
              id: "fixar-topo",
              rotulo: item.fixaNoTopo ? "Mover para lista ordenável" : "Fixar marca no topo",
              icone: item.fixaNoTopo ? (
                <PinOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Pin className="h-4 w-4" aria-hidden="true" />
              ),
              desabilitado: !podeAlterar,
              aoExecutar: aoAlternarFixarMarcaTopo,
            },
          ]
        : []),
      {
        id: "visibilidade",
        rotulo: item.visivel ? "Ocultar na vitrine" : "Mostrar na vitrine",
        icone: item.visivel ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        ),
        desabilitado: !podeAlterar,
        aoExecutar: aoAlternarVisibilidade,
      },
      ...(!item.fixaNoTopo && aoMover
        ? [
            {
              id: "mover-cima",
              rotulo: "Mover para cima",
              icone: <ArrowUp className="h-4 w-4" aria-hidden="true" />,
              desabilitado: !podeSubir,
              aoExecutar: () => aoMover(-1),
            },
            {
              id: "mover-baixo",
              rotulo: "Mover para baixo",
              icone: <ArrowDown className="h-4 w-4" aria-hidden="true" />,
              desabilitado: !podeDescer,
              aoExecutar: () => aoMover(1),
            },
          ]
        : []),
      {
        id: "aparencia",
        rotulo: "Configurar em Aparência",
        icone: <ExternalLink className="h-4 w-4" aria-hidden="true" />,
        href: `/painel/aparencia?aba=${item.abaAparencia}`,
      },
    ];

    return (
      <div
        data-testid={`item-bloco-${item.idBloco}`}
        className={combinarClasses(
          "flex flex-nowrap items-center justify-between gap-2.5 rounded-xl border bg-white px-3 py-3 shadow-2xs transition-colors sm:gap-3 sm:px-3.5",
          item.fixaNoTopo
            ? "border-indigo-200 bg-indigo-50/35"
            : item.visivel
              ? "border-marfim-200 hover:border-mineral-300"
              : "border-dashed border-marfim-300 bg-marfim-50/70 opacity-80",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
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
              className="flex h-8 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-mineral-400 hover:bg-marfim-100 hover:text-mineral-700 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
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

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              {posicaoExibicao !== undefined ? (
                <span className="shrink-0 text-sm font-semibold tabular-nums text-mineral-950">
                  {posicaoExibicao}º
                </span>
              ) : null}
              <span className="truncate text-sm font-semibold text-mineral-950">{item.titulo}</span>
            </div>
            <p className="mt-0.5 truncate text-xs text-mineral-500">
              {[
                item.badgeTipo,
                item.fixaNoTopo ? "Fixa no topo" : null,
                item.visivel ? "Visível" : "Oculto",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {item.subtitulo ? (
              <p className="mt-0.5 truncate text-[11px] text-mineral-400">{item.subtitulo}</p>
            ) : null}
          </div>
        </div>

        <MenuAcoesMobileBloco tituloBloco={item.titulo} acoes={acoesMobileSistema} />

        <div className="hidden shrink-0 items-center gap-1 sm:flex">
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
  const tipoAcao = fluxo.tipoAcao ?? "microfluxo";
  const ehMicrofluxo = tipoAcao === "microfluxo";

  const acoesMobileExperiencia: AcaoMenuMobileBloco[] = [
    ...(aoAbrirEditor
      ? [
          {
            id: "editar",
            rotulo: "Editar experiência",
            icone: <ChevronRight className="h-4 w-4" aria-hidden="true" />,
            destaque: true,
            aoExecutar: aoAbrirEditor,
          },
        ]
      : []),
    {
      id: "visibilidade",
      rotulo: fluxo.ativo ? "Ocultar na vitrine" : "Mostrar na vitrine",
      icone: fluxo.ativo ? (
        <EyeOff className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Eye className="h-4 w-4" aria-hidden="true" />
      ),
      desabilitado: !podeAlterar,
      aoExecutar: aoAlternarVisibilidade,
    },
    ...(aoMover
      ? [
          {
            id: "mover-cima",
            rotulo: "Mover para cima",
            icone: <ArrowUp className="h-4 w-4" aria-hidden="true" />,
            desabilitado: !podeSubir,
            aoExecutar: () => aoMover(-1),
          },
          {
            id: "mover-baixo",
            rotulo: "Mover para baixo",
            icone: <ArrowDown className="h-4 w-4" aria-hidden="true" />,
            desabilitado: !podeDescer,
            aoExecutar: () => aoMover(1),
          },
        ]
      : []),
    ...(ehMicrofluxo
      ? [
          {
            id: "copiar-link",
            rotulo: "Copiar link da experiência",
            icone: <Link2 className="h-4 w-4" aria-hidden="true" />,
            aoExecutar: () =>
              void copiarTextoComAviso(
                new URL(
                  construirCaminhoExperiencia(identificadorPublico, fluxo.id),
                  window.location.origin,
                ).href,
                "Permalink da experiência copiado.",
              ),
          },
        ]
      : []),
  ];

  return (
    <div
      data-testid={`item-bloco-${item.idBloco}`}
      className={combinarClasses(
        "group flex flex-nowrap items-center justify-between gap-2.5 rounded-xl border bg-white px-3 py-3 shadow-2xs transition-colors sm:gap-3 sm:px-3.5",
        fluxo.ativo
          ? "border-marfim-200 hover:border-indigo-300"
          : "border-dashed border-marfim-300 bg-marfim-50/70 opacity-85",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
        <button
          type="button"
          disabled={!arrasteHabilitado}
          onPointerDown={aoIniciarArraste}
          aria-label={`Arrastar ${nomeExibicao}`}
          title={
            arrasteHabilitado ? "Arraste para reordenar" : "Limpe a busca ou filtro para arrastar"
          }
          className="flex h-8 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-mineral-400 hover:bg-marfim-100 hover:text-mineral-700 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={aoAbrirEditor}
          className="min-w-0 flex-1 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-indigo-500"
        >
          <div className="flex min-w-0 items-center gap-1.5">
            {posicaoExibicao !== undefined ? (
              <span className="shrink-0 text-sm font-semibold tabular-nums text-mineral-950">
                {posicaoExibicao}º
              </span>
            ) : null}
            <span className="truncate text-sm font-semibold text-mineral-950 group-hover:text-indigo-800">
              {nomeExibicao}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-mineral-500">
            {[
              ehDestaque ? "Em destaque" : fluxo.ativo ? "Visível" : "Oculta",
              ehMicrofluxo
                ? `${fluxo.etapas.length} etapas`
                : (DESCRITORES_TIPO_ACAO[tipoAcao]?.iconeBadge ?? "Ação"),
            ].join(" · ")}
          </p>
          {fluxo.subtituloBotaoHome ? (
            <p className="mt-0.5 truncate text-[11px] text-mineral-400">
              {fluxo.subtituloBotaoHome}
            </p>
          ) : null}
        </button>
      </div>

      <MenuAcoesMobileBloco tituloBloco={nomeExibicao} acoes={acoesMobileExperiencia} />

      <div className="hidden shrink-0 items-center gap-1 sm:flex">
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

