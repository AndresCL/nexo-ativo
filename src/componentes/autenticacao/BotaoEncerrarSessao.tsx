"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import type { PortaAutenticacaoCliente } from "@/aplicacao/portas/portasAutenticacao";
import { servicoAutenticacaoCliente } from "@/infraestrutura/firebase/servicoAutenticacaoCliente";
import { Botao } from "@/componentes/interface/Botao";

export interface PropriedadesBotaoEncerrarSessao {
  readonly servicoAutenticacao?: PortaAutenticacaoCliente;
}

export function BotaoEncerrarSessao({
  servicoAutenticacao = servicoAutenticacaoCliente,
}: PropriedadesBotaoEncerrarSessao) {
  const navegador = useRouter();
  const [encerrando, setEncerrando] = useState(false);

  async function executarLogout() {
    setEncerrando(true);
    try {
      await servicoAutenticacao.encerrarSessao();
      navegador.push("/entrar");
      navegador.refresh();
    } finally {
      setEncerrando(false);
    }
  }

  return (
    <Botao
      variante="operacional_secundario"
      tamanho="compacto"
      onClick={executarLogout}
      carregando={encerrando}
      textoCarregando="Saindo..."
      className="rounded-xl border-marfim-300 bg-white text-mineral-700 hover:bg-marfim-100 hover:text-mineral-950"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      <span>Sair da conta</span>
    </Botao>
  );
}
