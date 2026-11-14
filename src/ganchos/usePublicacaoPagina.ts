"use client";

import { useRef, useState } from "react";
import type { ResultadoPublicacaoPagina } from "@/aplicacao/portas/portasEditorAparencia";
import { notificar } from "@/componentes/interface/notificacoes/notificar";

export interface OpcoesPublicacaoPagina {
  readonly versaoPublicadaInicial: number | null;
  readonly podeSalvarRascunho?: boolean;
  readonly podePublicarPagina: boolean;
  readonly haAlteracoesNaoSalvas?: boolean;
  /** O editor pode começar com um rascunho padrão ainda não gravado. */
  readonly garantirRascunhoInicial?: boolean;
  readonly bloqueado?: boolean;
  /** Referência do acervo após cada gravação individual. */
  readonly revisaoConteudoSalvo?: unknown;
  readonly salvarRascunho?: () => Promise<void>;
  readonly validarPublicacao?: () => void;
  readonly publicarPagina: () => Promise<ResultadoPublicacaoPagina>;
  readonly aoPublicar?: (resultado: ResultadoPublicacaoPagina) => void;
}

/** Coordena salvar → publicar e mantém uma gravação bem-sucedida se a publicação falhar. */
export function usePublicacaoPagina(opcoes: OpcoesPublicacaoPagina) {
  const [operacao, setOperacao] = useState<
    "salvando" | "salvando_para_publicar" | "publicando" | null
  >(null);
  const emAndamento = useRef(false);
  const [versaoPublicada, setVersaoPublicada] = useState(opcoes.versaoPublicadaInicial);
  const [rascunhoNaoPublicado, setRascunhoNaoPublicado] = useState(false);
  const [publicouNestaSessao, setPublicouNestaSessao] = useState(false);
  const [revisaoPublicada, setRevisaoPublicada] = useState(() => opcoes.revisaoConteudoSalvo);
  const haRascunhoNaoPublicado =
    rascunhoNaoPublicado || opcoes.revisaoConteudoSalvo !== revisaoPublicada;
  const ocupado = operacao !== null || Boolean(opcoes.bloqueado);
  const podeSalvar =
    Boolean(opcoes.salvarRascunho && opcoes.podeSalvarRascunho && opcoes.haAlteracoesNaoSalvas) &&
    !ocupado;
  const precisaSalvarParaPublicar = Boolean(
    opcoes.haAlteracoesNaoSalvas ||
    (opcoes.garantirRascunhoInicial && versaoPublicada === null && !rascunhoNaoPublicado),
  );
  const podePublicar =
    opcoes.podePublicarPagina &&
    !ocupado &&
    !(precisaSalvarParaPublicar && (!opcoes.podeSalvarRascunho || !opcoes.salvarRascunho));

  async function salvarRascunho() {
    if (!podeSalvar || emAndamento.current || !opcoes.salvarRascunho) return;
    emAndamento.current = true;
    setOperacao("salvando");
    try {
      await opcoes.salvarRascunho();
      setRascunhoNaoPublicado(true);
      notificar.sucesso(
        "Rascunho salvo. Publique a página quando quiser disponibilizar as alterações.",
      );
    } catch (erro) {
      notificar.erro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível salvar o rascunho. Suas alterações foram mantidas.",
      );
    } finally {
      emAndamento.current = false;
      setOperacao(null);
    }
  }

  async function publicarPagina() {
    if (!podePublicar || emAndamento.current) return;
    emAndamento.current = true;
    try {
      opcoes.validarPublicacao?.();
      if (precisaSalvarParaPublicar && opcoes.salvarRascunho) {
        setOperacao("salvando_para_publicar");
        await opcoes.salvarRascunho();
        setRascunhoNaoPublicado(true);
      }
      setOperacao("publicando");
      const resultado = await opcoes.publicarPagina();
      setVersaoPublicada(resultado.versaoPublicada);
      setRascunhoNaoPublicado(false);
      setRevisaoPublicada(() => opcoes.revisaoConteudoSalvo);
      setPublicouNestaSessao(true);
      opcoes.aoPublicar?.(resultado);
      notificar.sucesso("Página publicada. As alterações já estão disponíveis na vitrine.");
    } catch (erro) {
      notificar.erro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível publicar a página. Tente novamente.",
      );
    } finally {
      emAndamento.current = false;
      setOperacao(null);
    }
  }

  const mensagemEstado = opcoes.haAlteracoesNaoSalvas
    ? "Alterações não salvas"
    : haRascunhoNaoPublicado
      ? "Rascunho salvo · publicação pendente"
      : publicouNestaSessao
        ? "Página publicada"
        : versaoPublicada === null
          ? "Página ainda não publicada"
          : null;

  return {
    versaoPublicada,
    ocupado,
    podeSalvar,
    podePublicar,
    salvarRascunho,
    publicarPagina,
    salvando: operacao === "salvando",
    publicando: operacao === "publicando" || operacao === "salvando_para_publicar",
    salvandoParaPublicar: operacao === "salvando_para_publicar",
    mensagemEstado,
  };
}

export type ControlePublicacaoPagina = ReturnType<typeof usePublicacaoPagina>;
