"use client";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";

import type { PortaProvisionamentoOrganizacaoCliente } from "@/aplicacao/portas/portasAutenticacao";
import { normalizarSugestaoIdentificador } from "@/dominio/objetos-valor/identificadorPublico";
import { servicoAutenticacaoCliente } from "@/infraestrutura/firebase/servicoAutenticacaoCliente";
import {
  esquemaCriarOrganizacaoInicial,
  type DadosCriarOrganizacaoInicial,
} from "@/validacoes/esquemasAutenticacao";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";

export interface PropriedadesFormularioPrimeiraOrganizacao {
  readonly servicoProvisionamento?: PortaProvisionamentoOrganizacaoCliente;
  readonly cadastroHabilitado?: boolean;
}

export function FormularioCriarPrimeiraOrganizacao({
  servicoProvisionamento = servicoAutenticacaoCliente,
  cadastroHabilitado = false,
}: PropriedadesFormularioPrimeiraOrganizacao) {
  const navegador = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DadosCriarOrganizacaoInicial>({
    resolver: zodResolver(esquemaCriarOrganizacaoInicial),
    defaultValues: {
      nome: "",
      identificadorPublico: "",
      segmentoAtividade: "",
    },
  });

  function sugerirEnderecoAutomatico(nomeInformado: string) {
    const sugestao = normalizarSugestaoIdentificador(nomeInformado);
    if (sugestao.length > 0) {
      setValue("identificadorPublico", sugestao, { shouldValidate: true });
    }
  }

  async function submeterCriacao(dados: DadosCriarOrganizacaoInicial) {
    if (!cadastroHabilitado) {
      return;
    }

    try {
      await servicoProvisionamento.criarOrganizacaoInicial(dados);
      navegador.refresh();
    } catch (erro) {
      notificar.erro(
        erro instanceof Error ? erro.message : "Não foi possível criar sua organização agora.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(submeterCriacao)} noValidate className="space-y-4">
      {!cadastroHabilitado ? (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed font-medium text-amber-900"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <span>
            Por enquanto, novos cadastros não são permitidos. A criação de novas organizações está
            sendo realizada manualmente pela equipe do Nexo Ativo.
          </span>
        </div>
      ) : null}

      <CampoFormulario
        rotulo="Nome da sua atuação ou empresa"
        placeholder="Ex.: Studio Aurora Arquitetura"
        required
        disabled={!cadastroHabilitado}
        mensagemErro={errors.nome?.message}
        {...register("nome", {
          onBlur: (evento) => sugerirEnderecoAutomatico(evento.target.value),
        })}
      />

      <CampoFormulario
        rotulo="Segmento de atuação"
        placeholder="Ex.: Arquitetura e Interiores, Clínica Odontológica, Fotografia..."
        required
        disabled={!cadastroHabilitado}
        mensagemErro={errors.segmentoAtividade?.message}
        {...register("segmentoAtividade")}
      />

      <CampoFormulario
        rotulo="Endereço público da sua página"
        prefixoFixo="nexoativo.com.br/"
        placeholder="studio-aurora-arquitetura"
        textoAuxiliar="Este será o link compartilhado no seu Instagram, WhatsApp e cartões."
        required
        disabled={!cadastroHabilitado}
        mensagemErro={errors.identificadorPublico?.message}
        {...register("identificadorPublico")}
      />

      <div className="pt-2">
        <Botao
          type="submit"
          variante="operacional_primario"
          disabled={!cadastroHabilitado}
          carregando={isSubmitting}
          textoCarregando="Configurando seu espaço..."
        >
          Criar organização e iniciar configuração
        </Botao>
      </div>
    </form>
  );
}
