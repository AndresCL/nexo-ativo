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
import { esquemaEntrarComEmail, type DadosEntrarComEmail } from "@/validacoes/esquemasAutenticacao";
import { Botao } from "@/componentes/interface/Botao";
import { IconeGoogle } from "@/componentes/interface/IconeGoogle";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";

export interface PropriedadesFormularioLogin {
  readonly servicoAutenticacao?: PortaAutenticacaoCliente;
}

export function FormularioLogin({
  servicoAutenticacao = servicoAutenticacaoCliente,
}: PropriedadesFormularioLogin) {
  const navegador = useRouter();

  const [autenticandoGoogle, setAutenticandoGoogle] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DadosEntrarComEmail>({
    resolver: zodResolver(esquemaEntrarComEmail),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  async function submeterLoginEmail(dados: DadosEntrarComEmail) {
    try {
      const emailHigienizado = dados.email.trim().toLowerCase();
      await servicoAutenticacao.entrarComEmailESenha(emailHigienizado, dados.senha);
      navegador.push("/painel");
      navegador.refresh();
    } catch (erro) {
      notificar.erro(
        erro instanceof Error ? erro.message : "Não foi possível entrar na sua conta agora.",
      );
    }
  }

  async function iniciarLoginComGoogle() {
    setAutenticandoGoogle(true);
    try {
      await servicoAutenticacao.entrarComGoogle();
      navegador.push("/painel");
      navegador.refresh();
    } catch (erro) {
      notificar.erro(
        erro instanceof Error ? erro.message : "Não foi possível autenticar com sua conta Google.",
      );
    } finally {
      setAutenticandoGoogle(false);
    }
  }

  return (
    <div className="space-y-5">
      <Botao
        type="button"
        variante="operacional_secundario"
        className="w-full"
        carregando={autenticandoGoogle}
        textoCarregando="Conectando ao Google..."
        disabled={isSubmitting}
        onClick={iniciarLoginComGoogle}
      >
        <IconeGoogle />
        Continuar com Google
      </Botao>

      <div className="relative flex items-center py-1">
        <div className="grow border-t border-marfim-200" />
        <span className="mx-3 shrink text-xs text-mineral-500">ou com seu e-mail</span>
        <div className="grow border-t border-marfim-200" />
      </div>

      <form onSubmit={handleSubmit(submeterLoginEmail)} noValidate className="space-y-4">
        <CampoFormulario
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@suaempresa.com.br"
          required
          mensagemErro={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-1">
          <CampoFormulario
            rotulo="Senha"
            type={mostrarSenha ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Sua senha de acesso"
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
          <div className="flex justify-end">
            <Link
              href="/recuperar-senha"
              className="text-xs font-medium text-mineral-700 underline-offset-4 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>

        <Botao
          type="submit"
          variante="operacional_primario"
          className="w-full"
          carregando={isSubmitting}
          textoCarregando="Entrando..."
          disabled={autenticandoGoogle}
        >
          Entrar no painel
        </Botao>
      </form>

      <p className="pt-2 text-center text-xs text-mineral-700">
        Ainda não possui conta?{" "}
        <Link
          href="/criar-conta"
          className="font-semibold text-mineral-950 underline underline-offset-4"
        >
          Criar conta agora
        </Link>
      </p>
    </div>
  );
}
