import type {
  MembroOrganizacao,
  Organizacao,
  UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import {
  hidratarRascunhoConfiguracaoPagina,
  type RascunhoConfiguracaoPagina,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { verificarPermissaoOrganizacao } from "@/dominio/permissoes/autorizadorOrganizacao";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";

export interface ContextoEditorOrganizacaoServidor {
  readonly organizacao: Organizacao;
  readonly membro: MembroOrganizacao | null;
  readonly rascunho: RascunhoConfiguracaoPagina;
  readonly versaoPublicadaAtual: number | null;
  readonly ultimoPublicadoEmIso: string | null;
  readonly podeEditarAparencia: boolean;
  readonly podePublicarPagina: boolean;
}

export async function carregarContextoEditorOrganizacaoServidor(
  usuario: UsuarioAutenticado,
  organizacaoId: string,
): Promise<ContextoEditorOrganizacaoServidor | null> {
  const { bancoDadosAdmin } = obterServicosAdminFirebase();

  const refOrg = bancoDadosAdmin.collection("organizacoes").doc(organizacaoId);
  const refMembro = refOrg.collection("membros").doc(usuario.uid);
  const refRascunho = refOrg.collection("configuracaoPagina").doc("rascunho");
  const refPublicada = bancoDadosAdmin.collection("paginasPublicadas").doc(organizacaoId);

  const [docOrg, docMembro, docRascunho, docPublicada] = await Promise.all([
    refOrg.get(),
    refMembro.get(),
    refRascunho.get(),
    refPublicada.get(),
  ]);

  if (!docOrg.exists) {
    return null;
  }

  const organizacao = docOrg.data() as Organizacao;
  const membro = docMembro.exists ? (docMembro.data() as MembroOrganizacao) : null;

  if (!verificarPermissaoOrganizacao(usuario, organizacao, membro, "visualizar_painel")) {
    return null;
  }

  const rascunho = hidratarRascunhoConfiguracaoPagina(
    docRascunho.exists ? (docRascunho.data() as Record<string, unknown>) : undefined,
    {
      organizacaoId: organizacao.id,
      nomeOrganizacao: organizacao.nome,
    },
  );

  const dadosPublicados = docPublicada.exists ? docPublicada.data() : undefined;
  const versaoPublicadaAtual =
    typeof dadosPublicados?.versaoPublicada === "number" ? dadosPublicados.versaoPublicada : null;
  const ultimoPublicadoEmIso =
    typeof dadosPublicados?.atualizadoEmIso === "string" ? dadosPublicados.atualizadoEmIso : null;

  const podeEditarAparencia = verificarPermissaoOrganizacao(
    usuario,
    organizacao,
    membro,
    "editar_aparencia_e_conteudo",
  );

  const podePublicarPagina =
    verificarPermissaoOrganizacao(usuario, organizacao, membro, "publicar_pagina") &&
    organizacao.resumoDireitosPlano.permitePublicacaoPublica;

  return {
    organizacao,
    membro,
    rascunho,
    versaoPublicadaAtual,
    ultimoPublicadoEmIso,
    podeEditarAparencia,
    podePublicarPagina,
  };
}
