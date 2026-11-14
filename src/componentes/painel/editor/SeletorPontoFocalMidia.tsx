"use client";

import { useId, useState, type MouseEvent } from "react";
import { Crosshair, Monitor, Smartphone } from "lucide-react";
import type { CoordenadasPontoFocal } from "@/dominio/entidades/paginaPublicada";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesSeletorPontoFocalMidia {
  readonly urlImagemVisualizacao: string;
  readonly textoAlternativo: string;
  readonly pontoFocalDesktop: CoordenadasPontoFocal;
  readonly pontoFocalMobile?: CoordenadasPontoFocal;
  readonly desabilitado?: boolean;
  readonly aoAlterarPontoFocal: (
    dispositivo: "desktop" | "mobile",
    coordenadas: CoordenadasPontoFocal | undefined,
  ) => void;
}

const PREDEFINICOES_ENQUADRAMENTO: readonly {
  readonly rotulo: string;
  readonly coordenadas: CoordenadasPontoFocal;
}[] = [
  { rotulo: "Centro (50% · 50%)", coordenadas: { xPercentual: 50, yPercentual: 50 } },
  { rotulo: "Retrato superior (50% · 26%)", coordenadas: { xPercentual: 50, yPercentual: 26 } },
  { rotulo: "Terço inferior (50% · 68%)", coordenadas: { xPercentual: 50, yPercentual: 68 } },
];

export function SeletorPontoFocalMidia({
  urlImagemVisualizacao,
  textoAlternativo,
  pontoFocalDesktop,
  pontoFocalMobile,
  desabilitado = false,
  aoAlterarPontoFocal,
}: PropriedadesSeletorPontoFocalMidia) {
  const [dispositivoEdicao, setDispositivoEdicao] = useState<"desktop" | "mobile">("desktop");
  const idBase = useId();
  const idEixoX = `${idBase}-eixo-x`;
  const idEixoY = `${idBase}-eixo-y`;
  const idCheckboxMobile = `${idBase}-mobile-dedicado`;

  const usaPontoDedicadoMobile = Boolean(pontoFocalMobile);
  const coordenadasAtivas: CoordenadasPontoFocal =
    dispositivoEdicao === "mobile" ? (pontoFocalMobile ?? pontoFocalDesktop) : pontoFocalDesktop;

  const controlesAtivos =
    !desabilitado && (dispositivoEdicao === "desktop" || usaPontoDedicadoMobile);

  function aoClicarQuadroImagem(evento: MouseEvent<HTMLButtonElement>) {
    if (!controlesAtivos) {
      return;
    }

    const retangulo = evento.currentTarget.getBoundingClientRect();
    const largura = retangulo.width > 0 ? retangulo.width : 100;
    const altura = retangulo.height > 0 ? retangulo.height : 100;

    const xCalculado = Math.min(
      100,
      Math.max(0, Math.round(((evento.clientX - retangulo.left) / largura) * 100)),
    );
    const yCalculado = Math.min(
      100,
      Math.max(0, Math.round(((evento.clientY - retangulo.top) / altura) * 100)),
    );

    aoAlterarPontoFocal(dispositivoEdicao, {
      xPercentual: xCalculado,
      yPercentual: yCalculado,
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-marfim-300 bg-marfim-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-mineral-950">
            <Crosshair className="h-4 w-4 text-mineral-700" aria-hidden="true" />
            Ponto focal da imagem
          </p>
          <p className="mt-0.5 text-xs text-mineral-600">
            Indique a área principal (como o rosto ou o centro da obra) que nunca deve ser cortada.
          </p>
        </div>

        <div
          role="group"
          aria-label="Escolher tela para ajuste do ponto focal"
          className="inline-flex rounded-md border border-marfim-300 bg-white p-0.5"
        >
          <button
            type="button"
            aria-pressed={dispositivoEdicao === "desktop"}
            onClick={() => setDispositivoEdicao("desktop")}
            className={combinarClasses(
              "inline-flex min-h-9 items-center gap-1.5 rounded-xs px-3 py-1 text-xs font-medium transition-colors",
              dispositivoEdicao === "desktop"
                ? "bg-mineral-950 text-marfim-50"
                : "text-mineral-700 hover:text-mineral-950",
            )}
          >
            <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
            Desktop
          </button>
          <button
            type="button"
            aria-pressed={dispositivoEdicao === "mobile"}
            onClick={() => setDispositivoEdicao("mobile")}
            className={combinarClasses(
              "inline-flex min-h-9 items-center gap-1.5 rounded-xs px-3 py-1 text-xs font-medium transition-colors",
              dispositivoEdicao === "mobile"
                ? "bg-mineral-950 text-marfim-50"
                : "text-mineral-700 hover:text-mineral-950",
            )}
          >
            <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
            Celular
          </button>
        </div>
      </div>

      {dispositivoEdicao === "mobile" ? (
        <label
          htmlFor={idCheckboxMobile}
          className="flex cursor-pointer items-center gap-2.5 rounded-md border border-marfim-200 bg-white px-3 py-2.5 text-xs text-mineral-800"
        >
          <input
            id={idCheckboxMobile}
            type="checkbox"
            disabled={desabilitado}
            checked={usaPontoDedicadoMobile}
            onChange={(evento) => {
              if (evento.target.checked) {
                aoAlterarPontoFocal("mobile", { ...pontoFocalDesktop });
              } else {
                aoAlterarPontoFocal("mobile", undefined);
              }
            }}
            className="h-4 w-4 accent-mineral-950"
          />
          <span>Usar ponto focal diferente especificamente em telas verticais de celular</span>
        </label>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
        <div className="flex justify-center">
          <button
            type="button"
            disabled={!controlesAtivos}
            onClick={aoClicarQuadroImagem}
            aria-label={`Selecionar ponto focal clicando sobre a imagem (${dispositivoEdicao})`}
            data-testid="seletor-visual-ponto-focal"
            className={combinarClasses(
              "relative overflow-hidden rounded-md border border-mineral-900/20 bg-mineral-950 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mineral-950",
              dispositivoEdicao === "mobile" ? "aspect-[9/14] w-40" : "aspect-[16/10] w-full",
              controlesAtivos ? "cursor-crosshair" : "cursor-not-allowed opacity-65",
            )}
          >
            {urlImagemVisualizacao ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urlImagemVisualizacao}
                alt={textoAlternativo || "Prévia para seleção de ponto focal"}
                style={{
                  objectPosition: `${coordenadasAtivas.xPercentual}% ${coordenadasAtivas.yPercentual}%`,
                }}
                className="h-full w-full object-cover select-none"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-4 text-xs text-marfim-200">
                Envie ou selecione uma imagem para ajustar o ponto focal
              </div>
            )}

            <span
              aria-hidden="true"
              style={{
                left: `${coordenadasAtivas.xPercentual}%`,
                top: `${coordenadasAtivas.yPercentual}%`,
              }}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-marfim-50 bg-mineral-950/75 shadow-md">
                <span className="h-2 w-2 rounded-full bg-marfim-50" />
              </span>
            </span>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-mineral-800">
              <label htmlFor={idEixoX}>Posição horizontal (X)</label>
              <span>{coordenadasAtivas.xPercentual}%</span>
            </div>
            <input
              id={idEixoX}
              type="range"
              min={0}
              max={100}
              disabled={!controlesAtivos}
              value={coordenadasAtivas.xPercentual}
              onChange={(evento) =>
                aoAlterarPontoFocal(dispositivoEdicao, {
                  xPercentual: Number(evento.target.value),
                  yPercentual: coordenadasAtivas.yPercentual,
                })
              }
              className="mt-1.5 w-full accent-mineral-950 disabled:opacity-50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-medium text-mineral-800">
              <label htmlFor={idEixoY}>Posição vertical (Y)</label>
              <span>{coordenadasAtivas.yPercentual}%</span>
            </div>
            <input
              id={idEixoY}
              type="range"
              min={0}
              max={100}
              disabled={!controlesAtivos}
              value={coordenadasAtivas.yPercentual}
              onChange={(evento) =>
                aoAlterarPontoFocal(dispositivoEdicao, {
                  xPercentual: coordenadasAtivas.xPercentual,
                  yPercentual: Number(evento.target.value),
                })
              }
              className="mt-1.5 w-full accent-mineral-950 disabled:opacity-50"
            />
          </div>

          <div className="pt-1">
            <p className="mb-1.5 text-[11px] font-medium text-mineral-600">Ajustes rápidos:</p>
            <div className="flex flex-wrap gap-1.5">
              {PREDEFINICOES_ENQUADRAMENTO.map((predefinicao) => (
                <button
                  key={predefinicao.rotulo}
                  type="button"
                  disabled={!controlesAtivos}
                  onClick={() => aoAlterarPontoFocal(dispositivoEdicao, predefinicao.coordenadas)}
                  className="rounded-sm border border-marfim-300 bg-white px-2.5 py-1 text-[11px] text-mineral-800 transition-colors hover:bg-marfim-200/70 disabled:opacity-50"
                >
                  {predefinicao.rotulo}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
