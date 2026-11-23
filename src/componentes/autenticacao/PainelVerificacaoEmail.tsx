"use client";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import type { PortaAutenticacaoCliente } from "@/aplicacao/portas/portasAutenticacao";
import { servicoAutenticacaoCliente } from "@/infraestrutura/firebase/servicoAutenticacaoCliente";
import { Botao } from "@/componentes/interface/Botao";

export interface PropriedadesPainelVerificacaoEmail {
  readonly emailAtual?: string | null;
  readonly codigoAcao?: string;
  readonly servicoAutenticacao?: PortaAutenticacaoCliente;
}

type EstadoValidacaoLink = "ocioso" | "validando" | "confirmado_logado" | "confirmado_deslogado" | "erro";

export function PainelVerificacaoEmail({
  emailAtual,
  codigoAcao,
  servicoAutenticacao = servicoAutenticacaoCliente,
}: PropriedadesPainelVerificacaoEmail) {
  const navegador = useRouter();
  const codigoProcessadoRef = useRef<string | null>(null);

  const [estadoLink, setEstadoLink] = useState<EstadoValidacaoLink>(
    codigoAcao ? "validando" : "ocioso",
  );
  const [erroLink, setErroLink] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    if (!codigoAcao || codigoProcessadoRef.current === codigoAcao) {
      return;
    }
    codigoProcessadoRef.current = codigoAcao;

    let montado = true;

    async function processarConfirmacaoAutomatica() {
      setEstadoLink("validando");
      setErroLink(null);

      try {
        const usuarioAtualizado = await servicoAutenticacao.confirmarVerificacaoEmail(codigoAcao!);
        if (!montado) {
          return;
        }

        if (usuarioAtualizado?.emailVerificado) {
          setEstadoLink("confirmado_logado");
          notificar.sucesso("E-mail confirmado com sucesso! Redirecionando para o painel...");
          navegador.push("/painel");
          navegador.refresh();
          return;
        }

        setEstadoLink("confirmado_deslogado");
        notificar.sucesso("E-mail confirmado com sucesso!");
      } catch (erro) {
        if (!montado) {
          return;
        }

        // Se o código já tiver sido consumido (ex.: duplo clique ou prefetcher),
        // mas a conta logada já constar como verificada, concluímos com sucesso.
        try {
          const usuarioRecarregado = await servicoAutenticacao.recarregarEstadoUsuario();
          if (montado && usuarioRecarregado?.emailVerificado) {
            setEstadoLink("confirmado_logado");
            navegador.push("/painel");
            navegador.refresh();
            return;
          }
        } catch {
          // Mantém o erro original da validação do link
        }

        setEstadoLink("erro");
        setErroLink(
          erro instanceof Error
            ? erro.message
            : "Este link de confirmação é inválido ou expirou. Solicite um novo envio.",
        );
      }
    }

    void processarConfirmacaoAutomatica();

    return () => {
      montado = false;
    };
  }, [codigoAcao, navegador, servicoAutenticacao]);

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

  async function sairParaOutraConta() {
    setSaindo(true);
    try {
      await servicoAutenticacao.encerrarSessao();
      navegador.push("/entrar");
      navegador.refresh();
    } catch (erro) {
      notificar.erro(
        erro instanceof Error ? erro.message : "Não foi possível encerrar a sessão agora.",
      );
    } finally {
      setSaindo(false);
    }
  }

  if (estadoLink === "validando") {
    return (
      <div className="py-6 text-center text-sm text-mineral-600 animate-pulse">
        Confirmando seu endereço de e-mail...
      </div>
    );
  }

  if (estadoLink === "confirmado_logado") {
    return (
      <div className="space-y-5">
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-md border border-alerta-sucesso/25 bg-alerta-sucesso/8 p-4 text-sm leading-relaxed text-alerta-sucesso"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>E-mail confirmado com sucesso! Estamos liberando o acesso ao seu painel.</span>
        </div>
        <Botao
          type="button"
          variante="operacional_primario"
          className="w-full"
          onClick={() => {
            navegador.push("/painel");
            navegador.refresh();
          }}
        >
          Acessar meu painel
        </Botao>
      </div>
    );
  }

  if (estadoLink === "confirmado_deslogado") {
    return (
      <div className="space-y-5">
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-md border border-alerta-sucesso/25 bg-alerta-sucesso/8 p-4 text-sm leading-relaxed text-alerta-sucesso"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Seu endereço de e-mail foi confirmado com sucesso! Agora você já pode entrar na sua
            conta.
          </span>
        </div>
        <Botao variante="operacional_primario" className="w-full" comoFilho>
          <Link href="/entrar">Entrar na minha conta</Link>
        </Botao>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {estadoLink === "erro" && erroLink ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-alerta-erro/25 bg-alerta-erro/8 p-4 text-sm leading-relaxed text-alerta-erro"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{erroLink}</span>
        </div>
      ) : null}

      <p className="text-sm leading-relaxed text-mineral-700">
        Enviamos um link de confirmação
        {emailAtual ? (
          <>
            {" "}
            para <strong>{emailAtual}</strong>
          </>
        ) : null}
        . Abra o link recebido na sua caixa de entrada para confirmar sua conta e liberar o acesso
        ao painel.
      </p>

      <div className="flex flex-col gap-2.5 pt-2">
        {emailAtual ? (
          <>
            <Botao
              variante="operacional_primario"
              onClick={confirmarVerificacaoConcluida}
              carregando={verificando}
              textoCarregando="Conferindo confirmação..."
              disabled={reenviando || saindo}
            >
              Já confirmei meu e-mail
            </Botao>

            <Botao
              variante="operacional_secundario"
              onClick={reenviarLinkConfirmacao}
              carregando={reenviando}
              textoCarregando="Reenviando..."
              disabled={verificando || saindo}
            >
              Reenviar e-mail de confirmação
            </Botao>

            <Botao
              variante="fantasma"
              onClick={sairParaOutraConta}
              carregando={saindo}
              textoCarregando="Saindo..."
              disabled={verificando || reenviando}
            >
              Entrar com outra conta
            </Botao>
          </>
        ) : (
          <Botao variante="operacional_primario" comoFilho>
            <Link href="/entrar">Ir para a página de login</Link>
          </Botao>
        )}
      </div>
    </div>
  );
}
