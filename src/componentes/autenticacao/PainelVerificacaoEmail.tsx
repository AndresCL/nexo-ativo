"use client";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { PortaAutenticacaoCliente } from "@/aplicacao/portas/portasAutenticacao";
import { servicoAutenticacaoCliente } from "@/infraestrutura/firebase/servicoAutenticacaoCliente";
import { Botao } from "@/componentes/interface/Botao";

export interface PropriedadesPainelVerificacaoEmail {
  readonly emailAtual?: string | null;
  readonly servicoAutenticacao?: PortaAutenticacaoCliente;
}

export function PainelVerificacaoEmail({
  emailAtual,
  servicoAutenticacao = servicoAutenticacaoCliente,
}: PropriedadesPainelVerificacaoEmail) {
  const navegador = useRouter();

  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  async function confirmarVerificacaoConcluida() {
    setVerificando(true);
    try {
      const usuarioAtualizado = await servicoAutenticacao.recarregarEstadoUsuario();
      if (usuarioAtualizado?.emailVerificado) {
        navegador.push("/painel");
        navegador.refresh();
        return;
      }
      notificar.erro(
        "Ainda não identificamos a confirmação. Abra o link enviado para o seu e-mail e tente novamente.",
      );
    } catch (erro) {
      notificar.erro(
        erro instanceof Error ? erro.message : "Não foi possível atualizar o status do seu e-mail.",
      );
    } finally {
      setVerificando(false);
    }
  }

  async function reenviarLinkConfirmacao() {
    setReenviando(true);
    try {
      await servicoAutenticacao.reenviarVerificacaoEmail();
      notificar.sucesso("Um novo link de confirmação foi enviado para o seu e-mail.");
    } catch (erro) {
      notificar.erro(
        erro instanceof Error ? erro.message : "Não foi possível reenviar o e-mail agora.",
      );
    } finally {
      setReenviando(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-mineral-700">
        Enviamos um link de confirmação
        {emailAtual ? (
          <>
            {" "}
            para <strong>{emailAtual}</strong>
          </>
        ) : null}
        . Você já pode configurar o rascunho da sua página, mas precisará confirmar o e-mail antes
        de publicar.
      </p>

      <div className="flex flex-col gap-2.5 pt-2">
        <Botao
          variante="operacional_primario"
          onClick={confirmarVerificacaoConcluida}
          carregando={verificando}
          textoCarregando="Conferindo confirmação..."
          disabled={reenviando}
        >
          Já confirmei meu e-mail
        </Botao>

        <Botao
          variante="operacional_secundario"
          onClick={reenviarLinkConfirmacao}
          carregando={reenviando}
          textoCarregando="Reenviando..."
          disabled={verificando}
        >
          Reenviar e-mail de confirmação
        </Botao>

        <Botao variante="fantasma" comoFilho>
          <Link href="/painel">Ir para o rascunho do painel</Link>
        </Botao>
      </div>
    </div>
  );
}
