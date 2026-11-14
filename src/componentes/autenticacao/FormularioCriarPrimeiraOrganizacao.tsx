"use client";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
}

export function FormularioCriarPrimeiraOrganizacao({
  servicoProvisionamento = servicoAutenticacaoCliente,
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
      <CampoFormulario
        rotulo="Nome da sua atuação ou empresa"
        placeholder="Ex.: Studio Aurora Arquitetura"
        required
        mensagemErro={errors.nome?.message}
        {...register("nome", {
          onBlur: (evento) => sugerirEnderecoAutomatico(evento.target.value),
        })}
      />

      <CampoFormulario
        rotulo="Segmento de atuação"
        placeholder="Ex.: Arquitetura e Interiores, Clínica Odontológica, Fotografia..."
        required
        mensagemErro={errors.segmentoAtividade?.message}
        {...register("segmentoAtividade")}
      />

      <CampoFormulario
        rotulo="Endereço público da sua página"
        prefixoFixo="fluxo.app/"
        placeholder="studio-aurora-arquitetura"
        textoAuxiliar="Este será o link compartilhado no seu Instagram, WhatsApp e cartões."
        required
        mensagemErro={errors.identificadorPublico?.message}
        {...register("identificadorPublico")}
      />

      <div className="pt-2">
        <Botao
          type="submit"
          variante="operacional_primario"
          carregando={isSubmitting}
          textoCarregando="Configurando seu espaço..."
        >
          Criar organização e iniciar configuração
        </Botao>
      </div>
    </form>
  );
}
