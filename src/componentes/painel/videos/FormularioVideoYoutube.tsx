"use client";

import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import type { VideoYoutubeItem } from "@/dominio/objetos-valor/videoYoutube";
import { extrairIdVideoYoutube } from "@/dominio/objetos-valor/videoYoutube";

interface PropriedadesFormularioVideoYoutube {
  readonly videoEdicao?: VideoYoutubeItem | null;
  readonly aoSalvar: (video: VideoYoutubeItem) => void;
  readonly aoCancelar?: () => void;
  readonly salvando?: boolean;
}

export function FormularioVideoYoutube({
  videoEdicao = null,
  aoSalvar,
  aoCancelar,
  salvando = false,
}: PropriedadesFormularioVideoYoutube) {
  const [url, setUrl] = useState(videoEdicao?.url ?? "");
  const [titulo, setTitulo] = useState(videoEdicao?.titulo ?? "");
  const [erro, setErro] = useState<string | null>(null);

  function lidarComEnvio(evento: React.FormEvent) {
    evento.preventDefault();
    const idExtraido = extrairIdVideoYoutube(url);

    if (!idExtraido) {
      setErro("Informe um link válido do YouTube (ex: youtube.com/watch?v=... ou youtu.be/...).");
      return;
    }

    aoSalvar({
      id: videoEdicao?.id ?? `${idExtraido}-${Date.now()}`,
      url: url.trim(),
      titulo: titulo.trim() || undefined,
    });

    setUrl("");
    setTitulo("");
    setErro(null);
  }

  return (
    <form onSubmit={lidarComEnvio} className="space-y-4">
      <CampoFormulario
        className="rounded-lg border-neutral-200 focus:border-mineral-950 focus:ring-neutral-200"
        rotulo="Link do vídeo no YouTube"
        placeholder="https://www.youtube.com/watch?v=..."
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          if (erro) setErro(null);
        }}
        mensagemErro={erro ?? undefined}
        required
      />

      <CampoFormulario
        className="rounded-lg border-neutral-200 focus:border-mineral-950 focus:ring-neutral-200"
        rotulo="Título do vídeo (opcional)"
        placeholder="Ex: Tour institucional ou Demonstração"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <Botao
          type="submit"
          variante="operacional_primario"
          tamanho="compacto"
          disabled={salvando}
          className="gap-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs"
        >
          {videoEdicao ? (
            <Save className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          <span>{videoEdicao ? "Salvar alterações" : "Adicionar vídeo"}</span>
        </Botao>

        {aoCancelar ? (
          <Botao
            type="button"
            variante="fantasma"
            tamanho="compacto"
            disabled={salvando}
            onClick={aoCancelar}
          >
            Cancelar
          </Botao>
        ) : null}
      </div>
    </form>
  );
}
