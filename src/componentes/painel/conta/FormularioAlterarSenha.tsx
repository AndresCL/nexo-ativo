"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, ShieldAlert } from "lucide-react";
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
        className="rounded-2xl border border-marfim-200/80 bg-white p-6 shadow-2xs sm:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="titulo-seguranca" className="text-base font-semibold text-mineral-950">
              Segurança e senha
            </h2>
            <p className="text-xs text-mineral-500">
              Gerencie a senha de acesso da sua conta.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900">
          <p className="font-medium">Autenticação federada ativa (Google)</p>
          <p className="mt-1 text-amber-800">
            Sua conta está conectada através do Google. Por esse motivo, você não utiliza uma senha
            específica do Nexo Ativo para acessar o sistema. Para alterar sua senha de acesso,
            atualize as credenciais diretamente na sua conta Google.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="titulo-seguranca"
      className="rounded-2xl border border-marfim-200/80 bg-white p-6 shadow-2xs sm:p-8"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 id="titulo-seguranca" className="text-base font-semibold text-mineral-950">
            Segurança e senha
          </h2>
          <p className="text-xs text-mineral-500">
            Mantenha sua conta protegida com uma senha forte.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(submeter)} className="mt-6 space-y-4">
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

        <div className="pt-2">
          <Botao
            type="submit"
            variante="operacional_primario"
            tamanho="padrao"
            carregando={salvando}
            textoCarregando="Atualizando senha..."
            disabled={salvando}
          >
            Atualizar senha
          </Botao>
        </div>
      </form>
    </section>
  );
}
