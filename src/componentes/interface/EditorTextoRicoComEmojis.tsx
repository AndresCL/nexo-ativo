"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Eye,
  Heading3,
  Italic,
  Link2,
  List,
  Pencil,
  Quote,
  Smile,
  X,
} from "lucide-react";
import { RenderizadorTextoRicoEditorial } from "@/componentes/editorial/RenderizadorTextoRicoEditorial";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesEditorTextoRicoComEmojis {
  readonly id?: string;
  readonly rotulo: string;
  readonly valor: string;
  readonly aoAlterar: (novoValor: string) => void;
  readonly desabilitado?: boolean;
  readonly obrigatorio?: boolean;
  readonly maxLength?: number;
  readonly placeholder?: string;
}

const CATEGORIAS_EMOJIS: readonly {
  readonly id: string;
  readonly rotulo: string;
  readonly emojis: readonly string[];
}[] = [
  {
    id: "destaques",
    rotulo: "Destaques",
    emojis: ["✨", "🔥", "🚀", "⭐", "🌟", "💡", "🎯", "🏆", "💎", "👑", "⚡", "🎉", "🎊", "🎁"],
  },
  {
    id: "comunicacao",
    rotulo: "Atendimento",
    emojis: ["💬", "📲", "📞", "🤝", "👋", "🙌", "👏", "❤️", "💚", "💙", "✅", "☑️", "👉", "👇"],
  },
  {
    id: "agenda_local",
    rotulo: "Agenda & Local",
    emojis: ["📅", "🗓️", "⏰", "⏳", "📍", "🏢", "🏠", "🚗", "✈️", "🛡️", "🔒", "🔑", "📌", "📢"],
  },
  {
    id: "negocios",
    rotulo: "Negócios",
    emojis: ["💼", "📈", "💰", "💳", "🏷️", "📦", "🛍️", "☕", "🍽️", "🥂", "⚖️", "🩺", "🎓", "📸"],
  },
];

export function EditorTextoRicoComEmojis({
  id,
  rotulo,
  valor,
  aoAlterar,
  desabilitado = false,
  obrigatorio = false,
  maxLength = 5000,
  placeholder = "Escreva o conteúdo do post, comunicado, campanha ou novidade...",
}: PropriedadesEditorTextoRicoComEmojis) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const popoverEmojiRef = useRef<HTMLDivElement | null>(null);
  const [modoPrevia, setModoPrevia] = useState(false);
  const [seletorEmojiAberto, setSeletorEmojiAberto] = useState(false);
  const [categoriaEmojiAtiva, setCategoriaEmojiAtiva] = useState("destaques");

  useEffect(() => {
    function fecharAoClicarFora(e: MouseEvent) {
      if (popoverEmojiRef.current && !popoverEmojiRef.current.contains(e.target as Node)) {
        setSeletorEmojiAberto(false);
      }
    }
    if (seletorEmojiAberto) {
      document.addEventListener("mousedown", fecharAoClicarFora);
    }
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, [seletorEmojiAberto]);

  function aplicarFormatacaoSelecao(prefixo: string, sufixo = prefixo, textoPadrao = "texto") {
    const el = textareaRef.current;
    if (!el || desabilitado) return;

    const inicio = el.selectionStart ?? valor.length;
    const fim = el.selectionEnd ?? valor.length;
    const selecionado = valor.slice(inicio, fim) || textoPadrao;
    const novoTexto = `${valor.slice(0, inicio)}${prefixo}${selecionado}${sufixo}${valor.slice(fim)}`;

    aoAlterar(novoTexto.slice(0, maxLength));
    requestAnimationFrame(() => {
      el.focus();
      const novoInicio = inicio + prefixo.length;
      el.setSelectionRange(novoInicio, novoInicio + selecionado.length);
    });
  }

  function aplicarPrefixoLinha(prefixo: string) {
    const el = textareaRef.current;
    if (!el || desabilitado) return;

    const inicio = el.selectionStart ?? valor.length;
    const inicioLinha = valor.lastIndexOf("\n", inicio - 1) + 1;
    const jaPossuiPrefixo = valor.slice(inicioLinha).startsWith(prefixo);

    const novoTexto = jaPossuiPrefixo
      ? `${valor.slice(0, inicioLinha)}${valor.slice(inicioLinha + prefixo.length)}`
      : `${valor.slice(0, inicioLinha)}${prefixo}${valor.slice(inicioLinha)}`;

    aoAlterar(novoTexto.slice(0, maxLength));
    requestAnimationFrame(() => {
      el.focus();
      const deslocamento = jaPossuiPrefixo ? -prefixo.length : prefixo.length;
      const novaPosicao = Math.max(inicioLinha, inicio + deslocamento);
      el.setSelectionRange(novaPosicao, novaPosicao);
    });
  }

  function inserirEmoji(emoji: string) {
    const el = textareaRef.current;
    if (!el || desabilitado) {
      aoAlterar(`${valor}${emoji}`.slice(0, maxLength));
      return;
    }

    const inicio = el.selectionStart ?? valor.length;
    const fim = el.selectionEnd ?? valor.length;
    const novoTexto = `${valor.slice(0, inicio)}${emoji}${valor.slice(fim)}`;
    aoAlterar(novoTexto.slice(0, maxLength));

    requestAnimationFrame(() => {
      el.focus();
      const novaPos = inicio + emoji.length;
      el.setSelectionRange(novaPos, novaPos);
    });
  }

  const grupoEmojiAtual =
    CATEGORIAS_EMOJIS.find((c) => c.id === categoriaEmojiAtiva) ?? CATEGORIAS_EMOJIS[0]!;

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-mineral-900">
          {rotulo}
          {obrigatorio ? <span className="ml-1 text-red-600">*</span> : null}
        </label>
        <span className="text-[11px] tabular-nums text-mineral-400">
          {valor.length}/{maxLength}
        </span>
      </div>

      <div className="overflow-visible rounded-xl border border-marfim-200 bg-white shadow-2xs focus-within:border-indigo-400">
        {/* Barra de Ferramentas WYSIWYG */}
        <div className="flex flex-wrap items-center justify-between gap-1 border-b border-marfim-200 bg-marfim-50/70 px-2 py-1.5 rounded-t-xl">
          <div className="flex flex-wrap items-center gap-0.5">
            <button
              type="button"
              disabled={desabilitado || modoPrevia}
              onClick={() => aplicarPrefixoLinha("### ")}
              title="Subtítulo"
              aria-label="Inserir subtítulo"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-mineral-700 transition hover:bg-white hover:text-mineral-950 disabled:opacity-40 cursor-pointer"
            >
              <Heading3 className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              disabled={desabilitado || modoPrevia}
              onClick={() => aplicarFormatacaoSelecao("**", "**", "destaque")}
              title="Negrito"
              aria-label="Negrito"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-mineral-700 transition hover:bg-white hover:text-mineral-950 disabled:opacity-40 cursor-pointer"
            >
              <Bold className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              disabled={desabilitado || modoPrevia}
              onClick={() => aplicarFormatacaoSelecao("*", "*", "ênfase")}
              title="Itálico"
              aria-label="Itálico"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-mineral-700 transition hover:bg-white hover:text-mineral-950 disabled:opacity-40 cursor-pointer"
            >
              <Italic className="h-4 w-4" aria-hidden="true" />
            </button>

            <span className="mx-1 h-4 w-px bg-marfim-200" aria-hidden="true" />

            <button
              type="button"
              disabled={desabilitado || modoPrevia}
              onClick={() => aplicarPrefixoLinha("• ")}
              title="Lista com marcadores"
              aria-label="Lista com marcadores"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-mineral-700 transition hover:bg-white hover:text-mineral-950 disabled:opacity-40 cursor-pointer"
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              disabled={desabilitado || modoPrevia}
              onClick={() => aplicarPrefixoLinha("> ")}
              title="Bloco de citação / destaque"
              aria-label="Bloco de citação"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-mineral-700 transition hover:bg-white hover:text-mineral-950 disabled:opacity-40 cursor-pointer"
            >
              <Quote className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              disabled={desabilitado || modoPrevia}
              onClick={() => aplicarFormatacaoSelecao("[", "](https://)", "texto do link")}
              title="Inserir link"
              aria-label="Inserir link"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-mineral-700 transition hover:bg-white hover:text-mineral-950 disabled:opacity-40 cursor-pointer"
            >
              <Link2 className="h-4 w-4" aria-hidden="true" />
            </button>

            <span className="mx-1 h-4 w-px bg-marfim-200" aria-hidden="true" />

            {/* Gatilho do Seletor de Emojis */}
            <div className="relative" ref={popoverEmojiRef}>
              <button
                type="button"
                disabled={desabilitado || modoPrevia}
                onClick={() => setSeletorEmojiAberto((prev) => !prev)}
                title="Inserir emoji"
                aria-label="Inserir emoji"
                aria-expanded={seletorEmojiAberto}
                className={combinarClasses(
                  "inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium transition disabled:opacity-40 cursor-pointer",
                  seletorEmojiAberto
                    ? "bg-indigo-100 text-indigo-900"
                    : "text-mineral-700 hover:bg-white hover:text-mineral-950",
                )}
              >
                <Smile className="h-4 w-4 text-amber-500" aria-hidden="true" />
                <span>Emojis</span>
              </button>

              {seletorEmojiAberto ? (
                <div className="absolute left-0 z-50 mt-1.5 w-72 rounded-xl border border-marfim-300 bg-white p-3 shadow-xl space-y-2.5">
                  <div className="flex items-center justify-between border-b border-marfim-100 pb-1.5">
                    <span className="text-xs font-semibold text-mineral-900">Inserir emoji</span>
                    <button
                      type="button"
                      onClick={() => setSeletorEmojiAberto(false)}
                      aria-label="Fechar emojis"
                      className="rounded p-0.5 text-mineral-400 hover:text-mineral-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {CATEGORIAS_EMOJIS.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoriaEmojiAtiva(cat.id)}
                        className={combinarClasses(
                          "rounded-md px-2 py-1 text-[10px] font-semibold transition cursor-pointer",
                          categoriaEmojiAtiva === cat.id
                            ? "bg-indigo-600 text-white"
                            : "bg-marfim-50 text-mineral-600 hover:bg-marfim-100",
                        )}
                      >
                        {cat.rotulo}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 pt-0.5">
                    {grupoEmojiAtual.emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => inserirEmoji(emoji)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-base transition hover:scale-115 hover:bg-marfim-100 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Alternador Editar / Pré-visualizar */}
          <div className="flex items-center rounded-lg border border-marfim-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setModoPrevia(false)}
              className={combinarClasses(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition cursor-pointer",
                !modoPrevia ? "bg-indigo-50 text-indigo-800" : "text-mineral-500 hover:text-mineral-800",
              )}
            >
              <Pencil className="h-3 w-3" aria-hidden="true" />
              <span>Editar</span>
            </button>
            <button
              type="button"
              onClick={() => setModoPrevia(true)}
              className={combinarClasses(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition cursor-pointer",
                modoPrevia ? "bg-indigo-50 text-indigo-800" : "text-mineral-500 hover:text-mineral-800",
              )}
            >
              <Eye className="h-3 w-3" aria-hidden="true" />
              <span>Visualizar</span>
            </button>
          </div>
        </div>

        {/* Corpo de Edição ou Pré-visualização */}
        {modoPrevia ? (
          <div
            style={
              {
                "--editorial-texto": "#1c1917",
                "--editorial-texto-secundario": "#44403c",
                "--editorial-destaque": "#4f46e5",
                "--editorial-superficie": "#f5f5f4",
              } as React.CSSProperties
            }
            className="min-h-36 px-4 py-3 bg-white rounded-b-xl"
          >
            {valor.trim() ? (
              <RenderizadorTextoRicoEditorial texto={valor} />
            ) : (
              <p className="text-xs italic text-mineral-400">
                Nenhum texto digitado para pré-visualizar.
              </p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            id={id}
            rows={6}
            maxLength={maxLength}
            disabled={desabilitado}
            value={valor}
            onChange={(e) => aoAlterar(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-b-xl bg-white px-3.5 py-3 text-sm leading-relaxed text-mineral-950 placeholder:text-mineral-400 focus:outline-none"
          />
        )}
      </div>
    </div>
  );
}

