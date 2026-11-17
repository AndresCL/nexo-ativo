"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { extrairIdVideoYoutube, type VideoYoutubeItem } from "@/dominio/objetos-valor/videoYoutube";

interface PropriedadesFormularioVideoYoutube {
  readonly aoAdicionar: (video: VideoYoutubeItem) => void;
}

export function FormularioVideoYoutube({ aoAdicionar }: PropriedadesFormularioVideoYoutube) {
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
    <form
      onSubmit={lidarComEnvio}
      className="space-y-4 rounded-2xl border border-marfim-200 bg-white p-5 shadow-xs"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <CampoFormulario
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
          rotulo="Título (opcional)"
          placeholder="Ex: Tour pelo espaço"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Botao type="submit" variante="operacional_primario" className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Adicionar vídeo
        </Botao>
      </div>
    </form>
  );
}
