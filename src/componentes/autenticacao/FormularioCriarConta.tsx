"use client";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import type { PortaAutenticacaoCliente } from "@/aplicacao/portas/portasAutenticacao";
import { servicoAutenticacaoCliente } from "@/infraestrutura/firebase/servicoAutenticacaoCliente";
import {
  esquemaCriarContaEmail,
  type DadosCriarContaEmail,
} from "@/validacoes/esquemasAutenticacao";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";

export interface PropriedadesFormularioCriarConta {
  readonly servicoAutenticacao?: PortaAutenticacaoCliente;
}

export function FormularioCriarConta({
  servicoAutenticacao = servicoAutenticacaoCliente,
}: PropriedadesFormularioCriarConta) {
  const navegador = useRouter();

  const [cadastrandoGoogle, setCadastrandoGoogle] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DadosCriarContaEmail>({
    resolver: zodResolver(esquemaCriarContaEmail),
    defaultValues: {
      nomeExibicao: "",
      email: "",
      senha: "",
      confirmacaoSenha: "",
    },
  });

  async function submeterCadastro(dados: DadosCriarContaEmail) {
    try {
      const usuario = await servicoAutenticacao.cadastrarComEmailESenha(
        dados.nomeExibicao,
        dados.email,
        dados.senha,
      );
      navegador.push(usuario.emailVerificado ? "/painel" : "/verificar-email");
      navegador.refresh();
    } catch (erro) {
      notificar.erro(
        erro instanceof Error ? erro.message : "Não foi possível criar sua conta agora.",
      );
    }
  }

  async function cadastrarComGoogle() {
    setCadastrandoGoogle(true);
    try {
      await servicoAutenticacao.entrarComGoogle();
      navegador.push("/painel");
      navegador.refresh();
    } catch (erro) {
      notificar.erro(
        erro instanceof Error ? erro.message : "Não foi possível autenticar com Google.",
      );
    } finally {
      setCadastrandoGoogle(false);
    }
  }

  return (
    <div className="space-y-5">
      <Botao
        type="button"
        variante="operacional_secundario"
        className="w-full"
        carregando={cadastrandoGoogle}
        textoCarregando="Conectando ao Google..."
        disabled={isSubmitting}
        onClick={cadastrarComGoogle}
      >
        Criar conta com Google
      </Botao>

      <div className="relative flex items-center py-1">
        <div className="grow border-t border-marfim-200" />
        <span className="mx-3 shrink text-xs text-mineral-500">ou cadastre-se com e-mail</span>
        <div className="grow border-t border-marfim-200" />
      </div>

      <form onSubmit={handleSubmit(submeterCadastro)} noValidate className="space-y-4">
        <CampoFormulario
          rotulo="Seu nome"
          autoComplete="name"
          placeholder="Ex.: Dra. Helena Costa"
          required
          mensagemErro={errors.nomeExibicao?.message}
          {...register("nomeExibicao")}
        />

        <CampoFormulario
          rotulo="E-mail profissional"
          type="email"
          autoComplete="email"
          placeholder="helena@clinica.com.br"
          required
          mensagemErro={errors.email?.message}
          {...register("email")}
        />

        <CampoFormulario
          rotulo="Senha"
          type={mostrarSenha ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          required
          mensagemErro={errors.senha?.message}
          sufixoElemento={
            <button
              type="button"
              onClick={() => setMostrarSenha((anterior) => !anterior)}
              className="text-mineral-500 hover:text-mineral-800 transition-colors focus:outline-none"
              aria-label={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
            >
              {mostrarSenha ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          }
          {...register("senha")}
        />

        <CampoFormulario
          rotulo="Confirmar senha"
          type={mostrarConfirmacaoSenha ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repita a senha escolhida"
          required
          mensagemErro={errors.confirmacaoSenha?.message}
          sufixoElemento={
            <button
              type="button"
              onClick={() => setMostrarConfirmacaoSenha((anterior) => !anterior)}
              className="text-mineral-500 hover:text-mineral-800 transition-colors focus:outline-none"
              aria-label={
                mostrarConfirmacaoSenha
                  ? "Ocultar confirmação de senha"
                  : "Exibir confirmação de senha"
              }
            >
              {mostrarConfirmacaoSenha ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          }
          {...register("confirmacaoSenha")}
        />

        <Botao
          type="submit"
          variante="operacional_primario"
          className="w-full"
          carregando={isSubmitting}
          textoCarregando="Criando sua conta..."
          disabled={cadastrandoGoogle}
        >
          Criar conta e continuar
        </Botao>
      </form>

      <p className="pt-2 text-center text-xs text-mineral-700">
        Já possui uma conta?{" "}
        <Link
          href="/entrar"
          className="font-semibold text-mineral-950 underline underline-offset-4"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
