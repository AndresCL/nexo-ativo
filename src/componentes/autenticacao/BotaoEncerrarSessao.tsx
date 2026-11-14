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
      variante="fantasma"
      tamanho="compacto"
      onClick={executarLogout}
      carregando={encerrando}
      textoCarregando="Saindo..."
      className="w-full justify-start text-mineral-600 hover:bg-indigo-50/50 hover:text-indigo-700"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      <span>Sair da conta</span>
    </Botao>
  );
}
