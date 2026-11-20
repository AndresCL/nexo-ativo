"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, User } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import {
  esquemaAtualizarPerfilUsuario,
  type FormularioAtualizarPerfilUsuario,
} from "@/validacoes/esquemasContaUsuario";
import {
  servicoContaCliente,
  type ServicoContaFirebaseCliente,
} from "@/infraestrutura/firebase/servicoContaFirebaseCliente";

export interface PropriedadesFormularioPerfilUsuario {
  readonly nomeInicial: string;
  readonly email: string;
  readonly emailVerificado: boolean;
  readonly provedores: readonly string[];
  readonly servicoConta?: ServicoContaFirebaseCliente;
}

export function FormularioPerfilUsuario({
  nomeInicial,
  email,
  emailVerificado,
  provedores,
  servicoConta = servicoContaCliente,
}: PropriedadesFormularioPerfilUsuario) {
  const [salvando, setSalvando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormularioAtualizarPerfilUsuario>({
    resolver: zodResolver(esquemaAtualizarPerfilUsuario),
    defaultValues: {
      nomeExibicao: nomeInicial,
    },
  });

  async function submeter(dados: FormularioAtualizarPerfilUsuario) {
    setSalvando(true);
    try {
      await servicoConta.atualizarPerfil(dados);
      reset({ nomeExibicao: dados.nomeExibicao });
      notificar.sucesso("Perfil atualizado com sucesso.");
    } catch (erro) {
      const mensagem =
        erro instanceof Error ? erro.message : "Não foi possível atualizar o perfil.";
      notificar.erro(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  const ehGoogle = provedores.includes("google.com");

  return (
    <section
      aria-labelledby="titulo-perfil-usuario"
      className="rounded-2xl border border-marfim-200/90 bg-white p-5 shadow-2xs sm:p-6"
    >
      <div className="border-b border-marfim-100 pb-3">
        <h2 id="titulo-perfil-usuario" className="text-sm font-semibold text-mineral-950">
          Dados pessoais
        </h2>
        <p className="mt-0.5 text-xs text-mineral-500">
          Informações de exibição e identificação da sua conta.
        </p>
      </div>

      <form onSubmit={handleSubmit(submeter)} className="mt-4 space-y-4">
        <div>
          <label htmlFor="campo-nome" className="block text-xs font-medium text-mineral-700">
            Nome de exibição
          </label>
          <input
            id="campo-nome"
            type="text"
            {...register("nomeExibicao")}
            className="mt-1.5 block w-full rounded-xl border border-marfim-300 bg-white px-3.5 py-2 text-sm text-mineral-900 shadow-2xs placeholder:text-mineral-400 focus:border-mineral-950 focus:outline-none focus:ring-1 focus:ring-mineral-950"
            placeholder="Seu nome"
          />
          {errors.nomeExibicao ? (
            <p className="mt-1 text-xs text-red-600">{errors.nomeExibicao.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="campo-email" className="block text-xs font-medium text-mineral-700">
            Endereço de e-mail
          </label>
          <div className="relative mt-1.5">
            <input
              id="campo-email"
              type="email"
              value={email}
              disabled
              className="block w-full cursor-not-allowed rounded-xl border border-marfim-200 bg-marfim-50/60 px-3.5 py-2 text-sm text-mineral-600 shadow-2xs"
            />
            {emailVerificado ? (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200/60">
                <Check className="h-3 w-3" /> Verificado
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[11px] text-mineral-500">
            {ehGoogle
              ? "Autenticado via Google. O e-mail principal é gerenciado pela sua conta Google."
              : "O e-mail de acesso não pode ser alterado diretamente por segurança."}
          </p>
        </div>

        <div className="pt-1">
          <Botao
            type="submit"
            variante="operacional_primario"
            tamanho="compacto"
            carregando={salvando}
            textoCarregando="Salvando..."
            disabled={!isDirty || salvando}
            className="rounded-xl bg-mineral-950 text-white hover:bg-mineral-800"
          >
            Salvar alterações
          </Botao>
        </div>
      </form>
    </section>
  );
}
