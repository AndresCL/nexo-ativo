"use client";

import { useEffect, useState } from "react";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import {
  carregarConfiguracaoVideos,
  salvarConfiguracaoVideos,
} from "@/infraestrutura/painel/servicoVideosYoutubeCliente";

export function OpcaoOcultarTituloVideosExperiencia({
  organizacaoId,
}: {
  readonly organizacaoId: string;
}) {
  const [ocultarTitulo, setOcultarTitulo] = useState(false);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let ativo = true;
    carregarConfiguracaoVideos(organizacaoId)
      .then((config) => {
        if (!ativo) return;
        setOcultarTitulo(Boolean(config.ocultarTituloVideos));
        setCarregado(true);
      })
      .catch(() => {
        if (ativo) setCarregado(true);
      });
    return () => {
      ativo = false;
    };
  }, [organizacaoId]);

  async function alternar(marcado: boolean) {
    setOcultarTitulo(marcado);
    try {
      const atual = await carregarConfiguracaoVideos(organizacaoId);
      await salvarConfiguracaoVideos(organizacaoId, {
        ...atual,
        ocultarTituloVideos: marcado,
      });
      notificar.sucesso("Preferência salva.");
    } catch {
      notificar.erro("Não foi possível salvar a preferência.");
    }
  }

  return (
    <label className="mt-2.5 flex cursor-pointer items-center gap-2 text-xs font-medium text-mineral-800">
      <input
        type="checkbox"
        disabled={!carregado}
        checked={ocultarTitulo}
        onChange={(e) => void alternar(e.target.checked)}
        className="h-4 w-4 rounded border-marfim-300 accent-mineral-900"
      />
      <span>Ocultar título na vitrine</span>
    </label>
  );
}

