"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType, type KeyboardEvent } from "react";
import {
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  FolderKanban,
  MessageCircle,
  Phone,
  ShoppingBag,
  Sparkles,
  Users,
  UtensilsCrossed,
  Youtube,
} from "lucide-react";
import type { TipoAcaoVitrine } from "@/dominio/microfluxos/tiposMicrofluxo";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import {
  DESCRITORES_TIPO_ACAO,
  ORDEM_GRUPOS_TIPO_ACAO,
  ROTULOS_GRUPO_TIPO_ACAO,
} from "./descritoresTipoAcao";

interface PropriedadesSeletorTipoAcaoVitrine {
  readonly id?: string;
  readonly valor: TipoAcaoVitrine;
  readonly desabilitado?: boolean;
  readonly aoAlterar: (novoTipo: TipoAcaoVitrine) => void;
}

const ICONES_TIPO_ACAO: Record<
  TipoAcaoVitrine,
  { icone: ComponentType<{ className?: string; "aria-hidden"?: boolean }>; classeBadge: string }
> = {
  microfluxo: { icone: Sparkles, classeBadge: "bg-indigo-50 text-indigo-600" },
  agenda: { icone: Calendar, classeBadge: "bg-sky-50 text-sky-600" },
  publicacao_post: { icone: FileText, classeBadge: "bg-amber-50 text-amber-600" },
  cardapio: { icone: UtensilsCrossed, classeBadge: "bg-orange-50 text-orange-600" },
  secao_produtos: { icone: ShoppingBag, classeBadge: "bg-emerald-50 text-emerald-600" },
  secao_servicos: { icone: Briefcase, classeBadge: "bg-violet-50 text-violet-600" },
  secao_portfolio: { icone: FolderKanban, classeBadge: "bg-stone-100 text-stone-600" },
  secao_equipe: { icone: Users, classeBadge: "bg-teal-50 text-teal-600" },
  secao_videos: { icone: Youtube, classeBadge: "bg-rose-50 text-rose-600" },
  whatsapp: { icone: MessageCircle, classeBadge: "bg-green-50 text-green-600" },
  telefone: { icone: Phone, classeBadge: "bg-blue-50 text-blue-600" },
  link_externo: { icone: ExternalLink, classeBadge: "bg-slate-100 text-slate-600" },
};

export function SeletorTipoAcaoVitrine({
  id = "tipo-acao-vitrine",
  valor,
  desabilitado = false,
  aoAlterar,
}: PropriedadesSeletorTipoAcaoVitrine) {
  const [aberto, setAberto] = useState(false);
  const [indiceFocado, setIndiceFocado] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const opcoesVisiveis = useMemo<readonly TipoAcaoVitrine[]>(
    () =>
      (Object.keys(DESCRITORES_TIPO_ACAO) as TipoAcaoVitrine[]).filter(
        (tipo) => tipo !== "secao_portfolio",
      ),
    [],
  );

  const grupos = useMemo(
    () =>
      ORDEM_GRUPOS_TIPO_ACAO.map((grupo) => ({
        grupo,
        rotuloGrupo: ROTULOS_GRUPO_TIPO_ACAO[grupo],
        itens: opcoesVisiveis.filter((tipo) => DESCRITORES_TIPO_ACAO[tipo].grupo === grupo),
      })).filter((g) => g.itens.length > 0),
    [opcoesVisiveis],
  );

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  const descritorAtual = DESCRITORES_TIPO_ACAO[valor] ?? DESCRITORES_TIPO_ACAO.microfluxo;
  const visualAtual = ICONES_TIPO_ACAO[valor] ?? ICONES_TIPO_ACAO.microfluxo;
  const IconeAtual = visualAtual.icone;

  function selecionar(tipo: TipoAcaoVitrine) {
    aoAlterar(tipo);
    setAberto(false);
  }

  function tratarTeclado(evento: KeyboardEvent<HTMLButtonElement>) {
    if (desabilitado) return;
    if (evento.key === "Escape") {
      setAberto(false);
      return;
    }
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      if (!aberto) {
        setAberto(true);
        setIndiceFocado(Math.max(0, opcoesVisiveis.indexOf(valor)));
        return;
      }
      setIndiceFocado((atual) => (atual + 1) % opcoesVisiveis.length);
      return;
    }
    if (evento.key === "ArrowUp") {
      evento.preventDefault();
      if (!aberto) {
        setAberto(true);
        setIndiceFocado(Math.max(0, opcoesVisiveis.indexOf(valor)));
        return;
      }
      setIndiceFocado((atual) => (atual - 1 + opcoesVisiveis.length) % opcoesVisiveis.length);
      return;
    }
    if (evento.key === "Enter" && aberto && indiceFocado >= 0) {
      evento.preventDefault();
      const escolhido = opcoesVisiveis[indiceFocado];
      if (escolhido) selecionar(escolhido);
    }
  }

  return (
    <div ref={containerRef} className="relative mt-1">
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={aberto}
        aria-haspopup="listbox"
        disabled={desabilitado}
        onClick={() => {
          if (desabilitado) return;
          setAberto((estado) => {
            const proximo = !estado;
            if (proximo) setIndiceFocado(Math.max(0, opcoesVisiveis.indexOf(valor)));
            return proximo;
          });
        }}
        onKeyDown={tratarTeclado}
        className={combinarClasses(
          "flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl border border-marfim-200 bg-white px-2.5 py-2 text-left transition-all",
          "hover:border-mineral-300 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
          aberto && "border-indigo-400 ring-2 ring-indigo-500/10",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={combinarClasses(
              "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              visualAtual.classeBadge,
            )}
          >
            <IconeAtual className="h-4 w-4" aria-hidden={true} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-mineral-950">
              {descritorAtual.rotulo}
            </p>
            <p className="truncate text-[11px] text-mineral-500">
              {descritorAtual.descricaoCurta}
            </p>
          </div>
        </div>

        <ChevronDown
          className={combinarClasses(
            "h-4 w-4 shrink-0 text-mineral-400 transition-transform duration-150",
            aberto && "rotate-180 text-indigo-500",
          )}
          aria-hidden={true}
        />
      </button>

      {aberto ? (
        <div
          role="listbox"
          aria-label="Tipo de ação na vitrine"
          className="absolute right-0 left-0 z-50 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-marfim-200 bg-white p-1.5 shadow-xl"
        >
          {grupos.map((blocoGrupo, idxGrupo) => (
            <div
              key={blocoGrupo.grupo}
              className={idxGrupo > 0 ? "mt-1.5 border-t border-marfim-100 pt-1.5" : undefined}
            >
              <p className="px-2 py-1 text-[10px] font-semibold tracking-wider text-mineral-400 uppercase">
                {blocoGrupo.rotuloGrupo}
              </p>
              <div className="space-y-0.5">
                {blocoGrupo.itens.map((tipo) => {
                  const descritor = DESCRITORES_TIPO_ACAO[tipo];
                  const visual = ICONES_TIPO_ACAO[tipo];
                  const Icone = visual.icone;
                  const selecionado = tipo === valor;
                  const focado = opcoesVisiveis[indiceFocado] === tipo;

                  return (
                    <button
                      key={tipo}
                      type="button"
                      role="option"
                      aria-selected={selecionado}
                      onClick={() => selecionar(tipo)}
                      onMouseEnter={() => setIndiceFocado(opcoesVisiveis.indexOf(tipo))}
                      className={combinarClasses(
                        "flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2 py-2 text-left transition-colors",
                        selecionado
                          ? "bg-indigo-50/70"
                          : focado
                            ? "bg-marfim-50"
                            : "hover:bg-marfim-50",
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={combinarClasses(
                            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                            visual.classeBadge,
                          )}
                        >
                          <Icone className="h-4 w-4" aria-hidden={true} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-mineral-950">
                            {descritor.rotulo}
                          </p>
                          <p className="line-clamp-1 text-[11px] text-mineral-500">
                            {descritor.descricaoCurta}
                          </p>
                        </div>
                      </div>

                      {selecionado ? (
                        <Check className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden={true} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
