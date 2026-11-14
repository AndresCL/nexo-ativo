"use client";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import type { PortaAutenticacaoCliente } from "@/aplicacao/portas/portasAutenticacao";
import { servicoAutenticacaoCliente } from "@/infraestrutura/firebase/servicoAutenticacaoCliente";
import { esquemaRecuperarSenha, type DadosRecuperarSenha } from "@/validacoes/esquemasAutenticacao";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";

export interface PropriedadesFormularioRecuperarSenha {
  readonly servicoAutenticacao?: PortaAutenticacaoCliente;
}

export function FormularioRecuperarSenha({
  servicoAutenticacao = servicoAutenticacaoCliente,
}: PropriedadesFormularioRecuperarSenha) {
  const [enviadoParaEmail, setEnviadoParaEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DadosRecuperarSenha>({
    resolver: zodResolver(esquemaRecuperarSenha),
    defaultValues: { email: "" },
  });

  async function submeterRecuperacao(dados: DadosRecuperarSenha) {
    try {
      await servicoAutenticacao.solicitarRecuperacaoSenha(dados.email);
      setEnviadoParaEmail(dados.email);
    } catch (erro) {
      notificar.erro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível enviar as instruções de recuperação agora.",
      );
    }
  }

  if (enviadoParaEmail) {
    return (
      <div className="space-y-5">
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-md border border-alerta-sucesso/25 bg-alerta-sucesso/8 p-4 text-sm leading-relaxed text-alerta-sucesso"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Se houver uma conta associada a <strong>{enviadoParaEmail}</strong>, enviamos um link
            seguro para redefinir sua senha.
          </span>
        </div>

        <Botao variante="operacional_secundario" className="w-full" comoFilho>
          <Link href="/entrar">Voltar para o login</Link>
        </Botao>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submeterRecuperacao)} noValidate className="space-y-4">
      <CampoFormulario
        rotulo="Seu e-mail de acesso"
        type="email"
        autoComplete="email"
        placeholder="voce@suaempresa.com.br"
        required
        mensagemErro={errors.email?.message}
        {...register("email")}
      />

      <Botao
        type="submit"
        variante="operacional_primario"
        className="w-full"
        carregando={isSubmitting}
        textoCarregando="Enviando link..."
      >
        Enviar link de redefinição
      </Botao>

      <p className="pt-2 text-center text-xs text-mineral-700">
        Lembrou sua senha?{" "}
        <Link
          href="/entrar"
          className="font-semibold text-mineral-950 underline underline-offset-4"
        >
          Voltar para entrar
        </Link>
      </p>
    </form>
  );
}
