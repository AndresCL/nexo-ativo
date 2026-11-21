"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import type { PortaAutenticacaoCliente } from "@/aplicacao/portas/portasAutenticacao";
import { servicoAutenticacaoCliente } from "@/infraestrutura/firebase/servicoAutenticacaoCliente";
import {
  esquemaRedefinirSenha,
  type DadosRedefinirSenha,
} from "@/validacoes/esquemasAutenticacao";

export interface PropriedadesFormularioRedefinirSenha {
  readonly codigoAcao: string;
  readonly servicoAutenticacao?: PortaAutenticacaoCliente;
}

export function FormularioRedefinirSenha({
  codigoAcao,
  servicoAutenticacao = servicoAutenticacaoCliente,
}: PropriedadesFormularioRedefinirSenha) {
  const router = useRouter();
  const [validandoCodigo, setValidandoCodigo] = useState(true);
  const [emailConfirmado, setEmailConfirmado] = useState<string | null>(null);
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);
  const [sucessoRedefinicao, setSucessoRedefinicao] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DadosRedefinirSenha>({
    resolver: zodResolver(esquemaRedefinirSenha),
    mode: "onChange",
    defaultValues: {
      codigoAcao,
      novaSenha: "",
      confirmacaoSenha: "",
    },
  });

  const novaSenhaValor = watch("novaSenha");
  const confirmacaoSenhaValor = watch("confirmacaoSenha");
  const senhasCoincidem = Boolean(
    novaSenhaValor && confirmacaoSenhaValor && novaSenhaValor === confirmacaoSenhaValor,
  );
  const senhaPossuiTamanhoMinimo = Boolean(novaSenhaValor && novaSenhaValor.length >= 8);
  const podeSubmeter = senhaPossuiTamanhoMinimo && senhasCoincidem && !isSubmitting;

  useEffect(() => {
    setValue("codigoAcao", codigoAcao);

    if (!codigoAcao) {
      setErroValidacao("O link de redefinição de senha está incompleto ou é inválido.");
      setValidandoCodigo(false);
      return;
    }

    let montado = true;
    servicoAutenticacao
      .validarCodigoRedefinicaoSenha(codigoAcao)
      .then((email) => {
        if (montado) {
          setEmailConfirmado(email);
          setValidandoCodigo(false);
        }
      })
      .catch((erro) => {
        if (montado) {
          setErroValidacao(
            erro instanceof Error
              ? erro.message
              : "Este link de redefinição de senha expirou ou já foi utilizado.",
          );
          setValidandoCodigo(false);
        }
      });

    return () => {
      montado = false;
    };
  }, [codigoAcao, servicoAutenticacao, setValue]);

  async function submeterNovaSenha(dados: DadosRedefinirSenha) {
    try {
      await servicoAutenticacao.confirmarRedefinicaoSenha(dados.codigoAcao, dados.novaSenha);
      setSucessoRedefinicao(true);
      notificar.sucesso("Sua senha foi redefinida com sucesso!");
    } catch (erro) {
      notificar.erro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível redefinir sua senha. O link pode ter expirado.",
      );
    }
  }

  if (validandoCodigo) {
    return (
      <div className="py-6 text-center text-sm text-mineral-600 animate-pulse">
        Verificando a validade do seu link de segurança...
      </div>
    );
  }

  if (erroValidacao) {
    return (
      <div className="space-y-5">
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-alerta-erro/25 bg-alerta-erro/8 p-4 text-sm leading-relaxed text-alerta-erro"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{erroValidacao}</span>
        </div>
        <div className="text-center pt-2">
          <Link
            href="/recuperar-senha"
            className="text-xs font-semibold text-mineral-950 underline hover:text-mineral-800"
          >
            Solicitar um novo link de redefinição
          </Link>
        </div>
      </div>
    );
  }

  if (sucessoRedefinicao) {
    return (
      <div className="space-y-5">
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-md border border-alerta-sucesso/25 bg-alerta-sucesso/8 p-4 text-sm leading-relaxed text-alerta-sucesso"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Sua senha foi alterada com sucesso! Você já pode acessar sua conta com a nova credencial.
          </span>
        </div>
        <div className="pt-2">
          <Botao
            type="button"
            variante="operacional_primario"
            className="w-full"
            onClick={() => router.push("/entrar")}
          >
            Ir para a página de Login
          </Botao>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submeterNovaSenha)} className="space-y-4" noValidate>
      <input type="hidden" {...register("codigoAcao")} />

      {emailConfirmado && (
        <p className="text-xs text-mineral-600 mb-2">
          Redefinindo a senha da conta: <strong>{emailConfirmado}</strong>
        </p>
      )}

      <CampoFormulario
        rotulo="Nova senha"
        type={mostrarNovaSenha ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Digite a nova senha"
        required
        mensagemErro={errors.novaSenha?.message}
        sufixoElemento={
          <button
            type="button"
            onClick={() => setMostrarNovaSenha((anterior) => !anterior)}
            className="text-mineral-500 hover:text-mineral-800 transition-colors focus:outline-none"
            aria-label={mostrarNovaSenha ? "Ocultar nova senha" : "Ver nova senha"}
          >
            {mostrarNovaSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        {...register("novaSenha")}
      />

      <CampoFormulario
        rotulo="Confirme a nova senha"
        type={mostrarConfirmacaoSenha ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Repita a nova senha"
        required
        mensagemErro={errors.confirmacaoSenha?.message}
        sufixoElemento={
          <button
            type="button"
            onClick={() => setMostrarConfirmacaoSenha((anterior) => !anterior)}
            className="text-mineral-500 hover:text-mineral-800 transition-colors focus:outline-none"
            aria-label={mostrarConfirmacaoSenha ? "Ocultar confirmação de senha" : "Ver confirmação de senha"}
          >
            {mostrarConfirmacaoSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        {...register("confirmacaoSenha")}
      />

      <div className="pt-2">
        <Botao
          type="submit"
          variante="operacional_primario"
          className="w-full"
          carregando={isSubmitting}
          textoCarregando="Salvando nova senha..."
          disabled={!podeSubmeter}
        >
          Salvar nova senha
        </Botao>
      </div>

      <div className="text-center pt-2">
        <Link
          href="/entrar"
          className="text-xs text-mineral-600 hover:text-mineral-950 transition-colors"
        >
          Lembrou sua senha? Voltar ao login
        </Link>
      </div>
    </form>
  );
}

