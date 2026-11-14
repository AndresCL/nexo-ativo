"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { normalizarSugestaoIdentificador } from "@/dominio/objetos-valor/identificadorPublico";
import {
  esquemaPreCadastroInteresse,
  type DadosPreCadastroInteresse,
} from "@/validacoes/esquemasComuns";
import { Botao } from "./Botao";
import { CampoFormulario } from "./CampoFormulario";

export interface PropriedadesValidadorEnderecoPublico {
  readonly aoValidarComSucesso?: (dados: DadosPreCadastroInteresse) => void;
}

/**
 * Formulário interativo da Fase 1 que exercita React Hook Form + Zod + objetos de valor
 * em português para validar o formato e as regras de reserva de endereço público.
 */
export function ValidadorEnderecoPublico({
  aoValidarComSucesso,
}: PropriedadesValidadorEnderecoPublico) {
  const [enderecoValidado, setEnderecoValidado] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DadosPreCadastroInteresse>({
    resolver: zodResolver(esquemaPreCadastroInteresse),
    defaultValues: {
      nomeOrganizacao: "",
      identificadorPublico: "",
    },
  });

  function preencherSugestaoAutomatica(nomeDigitado: string) {
    const sugestao = normalizarSugestaoIdentificador(nomeDigitado);
    if (sugestao.length > 0) {
      setValue("identificadorPublico", sugestao, { shouldValidate: true });
    }
  }

  function submeterValidacao(dados: DadosPreCadastroInteresse) {
    setEnderecoValidado(dados.identificadorPublico);
    aoValidarComSucesso?.(dados);
  }

  return (
    <form onSubmit={handleSubmit(submeterValidacao)} noValidate className="flex flex-col gap-4">
      <CampoFormulario
        rotulo="Nome da atuação ou empresa"
        placeholder="Ex.: Atelier Helena Costa"
        required
        mensagemErro={errors.nomeOrganizacao?.message}
        {...register("nomeOrganizacao", {
          onBlur: (evento) => preencherSugestaoAutomatica(evento.target.value),
        })}
      />

      <CampoFormulario
        rotulo="Endereço público desejado"
        prefixoFixo="fluxo.app/"
        placeholder="atelier-helena-costa"
        textoAuxiliar="Letras minúsculas sem acento, números e hífens."
        required
        mensagemErro={errors.identificadorPublico?.message}
        {...register("identificadorPublico")}
      />

      <div className="pt-1">
        <Botao type="submit" variante="operacional_primario" carregando={isSubmitting}>
          Verificar formato do endereço
        </Botao>
      </div>

      {enderecoValidado ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-md border border-alerta-sucesso/25 bg-alerta-sucesso/8 px-3.5 py-2.5 text-sm text-alerta-sucesso"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Formato válido: <strong>fluxo.app/{enderecoValidado}</strong> está em conformidade com
            as regras editoriais.
          </span>
        </p>
      ) : null}
    </form>
  );
}
