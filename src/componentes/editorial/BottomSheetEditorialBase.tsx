"use client";

import {
  useRef,
  useEffect,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import { motion, useDragControls, useMotionValue, useTransform, animate } from "motion/react";
import { X } from "lucide-react";
import {
  gerarVariaveisCssBottomSheetEditorial,
  obterDescritorTipografiaEditorial,
  resolverTemaEscuroBottomSheetEditorial,
  type ConteudoPaginaPublicada,
} from "@/dominio/entidades/paginaPublicada";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { useAmbienteVitrine } from "./contextoAmbienteVitrine";

export interface PropriedadesBottomSheetEditorialBase {
  readonly aberto: boolean;
  readonly aoFechar: () => void;
  readonly pagina: ConteudoPaginaPublicada;
  readonly ariaDescribedBy?: string;
  readonly dataTestId?: string;
  readonly rotuloBotaoFechar?: string;
  readonly ocultarBotaoFecharFlutuante?: boolean;
  readonly aoRetornarFoco?: () => void;
  readonly referenciaRetornoFoco?: RefObject<HTMLButtonElement | null>;
  readonly conteudoScrollRef?: RefObject<HTMLDivElement | null>;
  readonly midiaTopoSangrada?: ReactNode;
  readonly cabecalhoFixo?: ReactNode;
  readonly children: ReactNode;
  readonly rodapeFixo?: ReactNode;
  readonly classNameConteudoInterno?: string;
}

export function BottomSheetEditorialBase({
  aberto,
  aoFechar,
  pagina,
  ariaDescribedBy,
  dataTestId,
  rotuloBotaoFechar = "Fechar detalhes",
  ocultarBotaoFecharFlutuante = false,
  aoRetornarFoco,
  referenciaRetornoFoco,
  conteudoScrollRef,
  midiaTopoSangrada,
  cabecalhoFixo,
  children,
  rodapeFixo,
  classNameConteudoInterno,
}: PropriedadesBottomSheetEditorialBase) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollInternoRef = useRef<HTMLDivElement | null>(null);
  const dragControls = useDragControls();
  const dragY = useMotionValue(0);
  const opacidadeHandle = useTransform(dragY, [0, 100], [1, 0.5]);
  const opacidadeOverlay = useTransform(dragY, [0, 280], [1, 0]);
  const fechandoRef = useRef(false);

  useEffect(() => {
    if (aberto) {
      fechandoRef.current = false;
      dragY.set(0);
    }
  }, [aberto, dragY]);

  function fecharPorGesto() {
    if (fechandoRef.current) return;
    fechandoRef.current = true;
    const alturaPainel = containerRef.current?.offsetHeight ?? window.innerHeight;
    void animate(dragY, alturaPainel, {
      type: "tween",
      duration: 0.18,
      ease: [0.32, 0.72, 0, 1],
      onComplete: () => {
        aoFechar();
      },
    });
  }

  function iniciarArrastePeloTopo(evento: ReactPointerEvent<HTMLElement>) {
    // Não inicia arraste se o clique/toque foi em controles interativos ou áreas de swipe horizontal (ex.: galeria de fotos)
    const alvo = evento.target as HTMLElement | null;
    if (
      alvo?.closest(
        "button, a, input, textarea, select, [role='button'], [data-gesto-horizontal='true']",
      )
    ) {
      return;
    }
    dragControls.start(evento);
  }

  function definirRefScroll(no: HTMLDivElement | null) {
    scrollInternoRef.current = no;
    if (conteudoScrollRef) {
      conteudoScrollRef.current = no;
    }
  }

  const { containerPortal } = useAmbienteVitrine();
  const estaContido = containerPortal !== null;

  const tipografia = obterDescritorTipografiaEditorial(pagina.tipografiaId);
  const temaEscuroBottomSheet = resolverTemaEscuroBottomSheetEditorial(
    pagina.paletaId,
    pagina.corPersonalizadaHex,
    pagina.customizacaoTokens,
  );
  const variaveisPaleta = gerarVariaveisCssBottomSheetEditorial(
    pagina.paletaId,
    pagina.corPersonalizadaHex,
    pagina.customizacaoTokens,
  ) as CSSProperties;

  return (
    <DialogoPrimitivo.Root
      open={aberto}
      modal={!estaContido}
      onOpenChange={(abrir) => !abrir && aoFechar()}
    >
      <DialogoPrimitivo.Portal container={containerPortal ?? undefined}>
        {estaContido ? (
          <motion.div
            style={{ opacity: opacidadeOverlay }}
            onClick={aoFechar}
            aria-hidden="true"
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs"
          />
        ) : (
          <DialogoPrimitivo.Overlay asChild>
            <motion.div
              style={{ opacity: opacidadeOverlay }}
              onClick={aoFechar}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            />
          </DialogoPrimitivo.Overlay>
        )}

        <DialogoPrimitivo.Content
          asChild
          style={variaveisPaleta}
          aria-describedby={ariaDescribedBy}
          data-testid={dataTestId}
          onInteractOutside={estaContido ? (evento) => evento.preventDefault() : undefined}
          onEscapeKeyDown={
            estaContido
              ? (evento) => {
                  if (!containerPortal?.contains(document.activeElement)) {
                    evento.preventDefault();
                  }
                }
              : undefined
          }
          onCloseAutoFocus={
            aoRetornarFoco || referenciaRetornoFoco
              ? (evento) => {
                  evento.preventDefault();
                  if (aoRetornarFoco) aoRetornarFoco();
                  else referenciaRetornoFoco?.current?.focus();
                }
              : undefined
          }
          className="focus:outline-hidden"
        >
          <motion.div
            ref={containerRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            style={{ y: dragY }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.65 }}
            onDragEnd={(_evento, info) => {
              if (info.offset.y > 85 || info.velocity.y > 320) {
                fecharPorGesto();
              } else {
                void animate(dragY, 0, {
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                });
              }
            }}
            className={combinarClasses(
              estaContido
                ? "absolute inset-x-0 bottom-0 z-50 flex max-h-[92%] w-full flex-col overflow-hidden rounded-t-3xl border-t shadow-2xl"
                : "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t shadow-2xl sm:animacao-painel-responsivo sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-full sm:w-[28rem] sm:rounded-none sm:border-l sm:border-t-0",
              "border-[var(--editorial-borda)] bg-[var(--editorial-fundo)] text-[var(--editorial-texto)]",
              tipografia.classeCorpo,
            )}
          >
            {/* Área de Pega Superior Mobile para Drag Suave */}
            <motion.div
              style={{ opacity: opacidadeHandle }}
              onPointerDown={(e) => dragControls.start(e)}
              className={combinarClasses(
                "absolute top-0 inset-x-0 z-40 flex h-8 items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing touch-none",
                !estaContido && "sm:hidden",
              )}
            >
              <div
                className={combinarClasses(
                  "h-1.5 w-12 rounded-full shadow-md backdrop-blur-md",
                  midiaTopoSangrada || temaEscuroBottomSheet
                    ? "bg-white/80 ring-1 ring-black/10"
                    : "bg-black/25 ring-1 ring-white/40",
                )}
                aria-hidden="true"
              />
            </motion.div>

            {/* Botão Fechar Flutuante (quando não usa cabeçalho próprio com botão fechar) */}
            {!ocultarBotaoFecharFlutuante ? (
              <DialogoPrimitivo.Close
                onClick={aoFechar}
                aria-label={rotuloBotaoFechar}
                className="absolute top-4 right-4 z-40 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--editorial-borda)] bg-[var(--editorial-bottom-sheet-fechar-fundo)] text-[var(--editorial-bottom-sheet-fechar-texto)] shadow-md backdrop-blur-md transition hover:scale-105 active:scale-95"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </DialogoPrimitivo.Close>
            ) : null}

            {/* Cabeçalho Fixo Opcional (também aceita gesto de arraste para baixo) */}
            {cabecalhoFixo ? (
              <div
                onPointerDown={iniciarArrastePeloTopo}
                className="shrink-0 px-5 pt-7 pb-4 sm:px-6 sm:pt-6 touch-pan-x"
              >
                {cabecalhoFixo}
              </div>
            ) : null}

            {/* Área de Conteúdo com Rolagem */}
            <div
              ref={definirRefScroll}
              onPointerDown={(e) => {
                // Se o scroll estiver no topo absoluto e não houver cabeçalho fixo, permite puxar a gaveta
                if (!cabecalhoFixo && (scrollInternoRef.current?.scrollTop ?? 0) <= 0) {
                  iniciarArrastePeloTopo(e);
                }
              }}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]"
            >
              {/* Mídia Sangrada Opcional no Topo */}
              {midiaTopoSangrada ? (
                <div
                  onPointerDown={iniciarArrastePeloTopo}
                  className="w-full overflow-hidden bg-black/10"
                >
                  {midiaTopoSangrada}
                </div>
              ) : null}

              {/* Conteúdo principal */}
              <div
                className={combinarClasses(
                  "px-5 pb-6 sm:px-6",
                  midiaTopoSangrada || cabecalhoFixo ? "pt-5" : "pt-12 sm:pt-8",
                  classNameConteudoInterno,
                )}
              >
                {children}
              </div>
            </div>

            {/* Rodapé Fixo Opcional */}
            {rodapeFixo ? (
              <div className="shrink-0 border-t border-[var(--editorial-borda)] bg-[var(--editorial-superficie)] p-4 sm:p-5">
                {rodapeFixo}
              </div>
            ) : null}
          </motion.div>
        </DialogoPrimitivo.Content>
      </DialogoPrimitivo.Portal>
    </DialogoPrimitivo.Root>
  );
}

