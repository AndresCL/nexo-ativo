"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Botao } from "@/componentes/interface/Botao";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import {
  esquemaAlterarSenhaUsuario,
  type FormularioAlterarSenhaUsuario,
} from "@/validacoes/esquemasContaUsuario";
import {
  servicoContaCliente,
  type ServicoContaFirebaseCliente,
} from "@/infraestrutura/firebase/servicoContaFirebaseCliente";

export interface PropriedadesFormularioAlterarSenha {
  readonly provedores: readonly string[];
  readonly servicoConta?: ServicoContaFirebaseCliente;
}

export function FormularioAlterarSenha({
  provedores,
  servicoConta = servicoContaCliente,
}: PropriedadesFormularioAlterarSenha) {
  const [salvando, setSalvando] = useState(false);
  const ehProvedorGoogle = provedores.includes("google.com") && !provedores.includes("password");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormularioAlterarSenhaUsuario>({
    resolver: zodResolver(esquemaAlterarSenhaUsuario),
  });

  async function submeter(dados: FormularioAlterarSenhaUsuario) {
    setSalvando(true);
    try {
      await servicoConta.alterarSenha(dados);
      reset();
      notificar.sucesso("Sua senha foi alterada com sucesso.");
    } catch (erro) {
      const mensagem =
        erro instanceof Error ? erro.message : "Não foi possível alterar sua senha.";
      notificar.erro(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  if (ehProvedorGoogle) {
    return (
      <section
        aria-labelledby="titulo-seguranca"
        className="rounded-2xl border border-marfim-200/90 bg-white p-5 shadow-2xs sm:p-6"
      >
        <div className="border-b border-marfim-100 pb-3">
          <h2 id="titulo-seguranca" className="text-sm font-semibold text-mineral-950">
            Segurança e senha
          </h2>
          <p className="mt-0.5 text-xs text-mineral-500">
            Credenciais de autenticação da sua conta.
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-marfim-200 bg-marfim-50/50 p-4">
          <div>
            <p className="text-xs font-semibold text-mineral-900">Autenticação via Google</p>
            <p className="mt-0.5 text-[11px] text-mineral-600">
              Sua conta utiliza o login seguro do Google. Para redefinir sua senha, acesse as configurações da sua Conta Google.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-marfim-300 bg-white px-2.5 py-1 text-[11px] font-medium text-mineral-700 shadow-2xs">
            Google OAuth
          </span>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="titulo-seguranca"
      className="rounded-2xl border border-marfim-200/90 bg-white p-5 shadow-2xs sm:p-6"
    >
      <div className="border-b border-marfim-100 pb-3">
        <h2 id="titulo-seguranca" className="text-sm font-semibold text-mineral-950">
          Segurança e senha
        </h2>
        <p className="mt-0.5 text-xs text-mineral-500">
          Mantenha sua conta protegida com uma senha forte.
        </p>
      </div>

      <form onSubmit={handleSubmit(submeter)} className="mt-4 space-y-4">
        <div>
          <label htmlFor="campo-senha-atual" className="block text-xs font-medium text-mineral-700">
            Senha atual
          </label>
          <input
            id="campo-senha-atual"
            type="password"
            autoComplete="current-password"
            {...register("senhaAtual")}
            className="mt-1.5 block w-full rounded-xl border border-marfim-300 bg-white px-3.5 py-2 text-sm text-mineral-900 shadow-2xs placeholder:text-mineral-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            placeholder="Digite sua senha atual"
          />
          {errors.senhaAtual ? (
            <p className="mt-1 text-xs text-red-600">{errors.senhaAtual.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="campo-nova-senha" className="block text-xs font-medium text-mineral-700">
            Nova senha (mínimo de 8 caracteres)
          </label>
          <input
            id="campo-nova-senha"
            type="password"
            autoComplete="new-password"
            {...register("novaSenha")}
            className="mt-1.5 block w-full rounded-xl border border-marfim-300 bg-white px-3.5 py-2 text-sm text-mineral-900 shadow-2xs placeholder:text-mineral-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            placeholder="Digite sua nova senha"
          />
          {errors.novaSenha ? (
            <p className="mt-1 text-xs text-red-600">{errors.novaSenha.message}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="campo-confirmacao-nova-senha"
            className="block text-xs font-medium text-mineral-700"
          >
            Confirmar nova senha
          </label>
          <input
            id="campo-confirmacao-nova-senha"
            type="password"
            autoComplete="new-password"
            {...register("confirmacaoNovaSenha")}
            className="mt-1.5 block w-full rounded-xl border border-marfim-300 bg-white px-3.5 py-2 text-sm text-mineral-900 shadow-2xs placeholder:text-mineral-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            placeholder="Confirme sua nova senha"
          />
          {errors.confirmacaoNovaSenha ? (
            <p className="mt-1 text-xs text-red-600">{errors.confirmacaoNovaSenha.message}</p>
          ) : null}
        </div>

        <div className="pt-1">
          <Botao
            type="submit"
            variante="operacional_primario"
            tamanho="compacto"
            carregando={salvando}
            textoCarregando="Atualizando senha..."
            disabled={salvando}
            className="rounded-xl bg-mineral-950 text-white hover:bg-mineral-800"
          >
            Atualizar senha
          </Botao>
        </div>
      </form>
    </section>
  );
}
