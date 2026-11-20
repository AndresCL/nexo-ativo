"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import type { VideoYoutubeItem } from "@/dominio/objetos-valor/videoYoutube";
import { extrairIdVideoYoutube } from "@/dominio/objetos-valor/videoYoutube";

interface PropriedadesFormularioVideoYoutube {
  readonly aoAdicionar: (video: VideoYoutubeItem) => void;
  readonly salvando?: boolean;
}

export function FormularioVideoYoutube({
  aoAdicionar,
  salvando = false,
}: PropriedadesFormularioVideoYoutube) {
  const [url, setUrl] = useState("");
  const [titulo, setTitulo] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function lidarComEnvio(evento: React.FormEvent) {
    evento.preventDefault();
    const idExtraido = extrairIdVideoYoutube(url);

    if (!idExtraido) {
      setErro("Informe um link válido do YouTube (ex: youtube.com/watch?v=... ou youtu.be/...).");
      return;
    }

    aoAdicionar({
      id: `${idExtraido}-${Date.now()}`,
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

      <div className="pt-2">
        <Botao
          type="submit"
          variante="operacional_primario"
          disabled={salvando}
          className="w-full gap-2 rounded-lg shadow-2xs"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Adicionar vídeo
        </Botao>
      </div>
    </form>
  );
}
