"use client";

import { useRef, useState, useEffect, type CSSProperties, type ReactNode } from "react";
import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { X } from "lucide-react";
import type { MidiaItemCatalogo } from "@/dominio/entidades/catalogoConteudo";
import {
  gerarVariaveisCssPaletaEditorial,
  obterDescritorPaletaEditorial,
  type ConteudoPaginaPublicada,
} from "@/dominio/entidades/paginaPublicada";
import { GaleriaImagensComThumbs } from "@/componentes/interface/GaleriaImagensComThumbs";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesBottomSheetEditorialBase {
  readonly aberto: boolean;
  readonly aoFechar: () => void;
  readonly pagina: ConteudoPaginaPublicada;
  readonly tituloFallbackImagens: string;
  readonly imagensGaleria?: readonly MidiaItemCatalogo[];
  readonly ariaDescribedBy?: string;
  readonly children: ReactNode;
  readonly rodapeFixo?: ReactNode;
}

export function BottomSheetEditorialBase({
  aberto,
  aoFechar,
  pagina,
  tituloFallbackImagens,
  imagensGaleria = [],
  ariaDescribedBy,
  children,
  rodapeFixo,
}: PropriedadesBottomSheetEditorialBase) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragY = useMotionValue(0);
  const opacidadeHandle = useTransform(dragY, [0, 100], [1, 0.5]);
  const [fechandoPorGesto, setFechandoPorGesto] = useState(false);

  useEffect(() => {
    if (aberto) {
      dragY.set(0);
      setFechandoPorGesto(false);
    }
  }, [aberto, dragY]);

  function fecharComAnimacao() {
    if (fechandoPorGesto) return;
    setFechandoPorGesto(true);
    const alturaPainel = containerRef.current?.offsetHeight ?? window.innerHeight;
    void animate(dragY, alturaPainel, {
      type: "spring",
      damping: 30,
      stiffness: 300,
      mass: 0.8,
      onComplete: () => {
        aoFechar();
      },
    });
  }

  const paleta = obterDescritorPaletaEditorial(pagina.paletaId);
  const variaveisPaleta = gerarVariaveisCssPaletaEditorial(
    pagina.paletaId,
    pagina.corPersonalizadaHex,
    pagina.customizacaoTokens,
  ) as CSSProperties;

  return (
    <DialogoPrimitivo.Root open={aberto} onOpenChange={(abrir) => !abrir && aoFechar()}>
      <DialogoPrimitivo.Portal>
        <DialogoPrimitivo.Overlay className="animacao-overlay-dialogo fixed inset-0 z-40 bg-black/60 backdrop-blur-xs" />

        <DialogoPrimitivo.Content
          asChild
          style={variaveisPaleta}
          aria-describedby={ariaDescribedBy}
          className="focus:outline-hidden"
        >
          <motion.div
            ref={containerRef}
            initial={{ y: "100%" }}
            animate={{ y: fechandoPorGesto ? (containerRef.current?.offsetHeight ?? 600) : 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            style={{ y: dragY }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.6 }}
            onDragEnd={(_evento, info) => {
              if (info.offset.y > 90 || info.velocity.y > 350) {
                fecharComAnimacao();
              } else {
                void animate(dragY, 0, {
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                });
              }
            }}
            className={combinarClasses(
              "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t shadow-2xl sm:animacao-painel-responsivo sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-full sm:w-[28rem] sm:rounded-none sm:border-l sm:border-t-0 font-sans",
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
                    tituloFallback={tituloFallbackImagens}
                    temaEscuro={paleta.temaEscuro}
                    proporcaoClassName="aspect-4/3 w-full !rounded-none"
                    className="space-y-0 [&_div.flex]:p-3 [&_div.flex]:bg-[var(--editorial-superficie)]/50"
                  />
                </div>
              ) : null}

              {/* Conteúdo textual com padding equilibrado */}
              <div
                className={combinarClasses(
                  "px-5 pb-6 sm:px-6",
                  imagensGaleria.length > 0 ? "pt-5" : "pt-12 sm:pt-8",
                )}
              >
                {children}
              </div>
            </div>

            {/* Rodapé Fixo de Conversão */}
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

