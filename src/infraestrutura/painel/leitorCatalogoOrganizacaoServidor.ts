import type {
  MembroOrganizacao,
  Organizacao,
  UsuarioAutenticado,
} from "@/dominio/entidades/autenticacaoEOrganizacao";
import type {
  ProdutoCatalogo,
  ProfissionalEquipe,
  ProjetoPortfolio,
  ServicoOrganizacao,
} from "@/dominio/entidades/catalogoConteudo";
import {
  hidratarRascunhoConfiguracaoPagina,
  type RascunhoConfiguracaoPagina,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { ordenarMicrofluxosPorPrioridadeEOrdem } from "@/dominio/microfluxos/ordenacaoMicrofluxos";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { verificarPermissaoOrganizacao } from "@/dominio/permissoes/autorizadorOrganizacao";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import {
  esquemaProdutoCatalogo,
  esquemaProfissionalEquipe,
  esquemaProjetoPortfolio,
  esquemaServicoOrganizacao,
} from "@/validacoes/esquemasCatalogoConteudo";
import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";

export interface ContextoCatalogoOrganizacaoServidor {
  readonly organizacao: Organizacao;
  readonly membro: MembroOrganizacao | null;
  readonly servicos: readonly ServicoOrganizacao[];
  readonly produtos: readonly ProdutoCatalogo[];
  readonly projetosPortfolio: readonly ProjetoPortfolio[];
  readonly profissionais: readonly ProfissionalEquipe[];
  readonly microfluxos: readonly DefinicaoMicrofluxo[];
  readonly rascunhoPagina: RascunhoConfiguracaoPagina;
  readonly versaoPublicadaAtual: number | null;
  readonly podeEditarConteudo: boolean;
  readonly podePublicarPagina: boolean;
}

function parsearColecaoOrdenada<T extends { readonly id: string; readonly ordemExibicao: number }>(
  documentos: ReadonlyArray<{ data: () => unknown }>,
  parseSeguro: (entrada: unknown) => { success: true; data: T } | { success: false },
): readonly T[] {
  const resultado: T[] = [];
  for (const doc of documentos) {
    const validacao = parseSeguro(doc.data());
    if (validacao.success) {
      resultado.push(validacao.data);
    }
  }
  return resultado.sort((a, b) => a.ordemExibicao - b.ordemExibicao || a.id.localeCompare(b.id));
}

export async function carregarContextoCatalogoOrganizacaoServidor(
  usuario: UsuarioAutenticado,
  organizacaoId: string,
): Promise<ContextoCatalogoOrganizacaoServidor | null> {
  const { bancoDadosAdmin } = obterServicosAdminFirebase();
  const refOrg = bancoDadosAdmin.collection("organizacoes").doc(organizacaoId);
  const refMembro = refOrg.collection("membros").doc(usuario.uid);
  const refRascunho = refOrg.collection("configuracaoPagina").doc("rascunho");
  const refPublicada = bancoDadosAdmin.collection("paginasPublicadas").doc(organizacaoId);

  const [
    docOrg,
    docMembro,
    docRascunho,
    docPublicada,
    snapServicos,
    snapProdutos,
    snapProjetos,
    snapProfissionais,
    snapMicrofluxos,
  ] = await Promise.all([
    refOrg.get(),
    refMembro.get(),
    refRascunho.get(),
    refPublicada.get(),
    refOrg.collection("servicos").get(),
    refOrg.collection("produtos").get(),
    refOrg.collection("projetosPortfolio").get(),
    refOrg.collection("profissionais").get(),
    refOrg.collection("microfluxos").get(),
  ]);

  if (!docOrg.exists) {
    return null;
  }

  const organizacao = docOrg.data() as Organizacao;
  const membro = docMembro.exists ? (docMembro.data() as MembroOrganizacao) : null;

  if (!verificarPermissaoOrganizacao(usuario, organizacao, membro, "visualizar_painel")) {
    return null;
  }

  const dadosPublicados = docPublicada.exists ? docPublicada.data() : undefined;
  const versaoPublicadaAtual =
    typeof dadosPublicados?.versaoPublicada === "number" ? dadosPublicados.versaoPublicada : null;

  const podeEditarConteudo = verificarPermissaoOrganizacao(
    usuario,
    organizacao,
    membro,
    "editar_aparencia_e_conteudo",
  );

  const podePublicarPagina =
    verificarPermissaoOrganizacao(usuario, organizacao, membro, "publicar_pagina") &&
    organizacao.resumoDireitosPlano.permitePublicacaoPublica;

  const servicos = parsearColecaoOrdenada(snapServicos.docs, (d) =>
    esquemaServicoOrganizacao.safeParse(d),
  );
  const produtos = parsearColecaoOrdenada(snapProdutos.docs, (d) =>
    esquemaProdutoCatalogo.safeParse(d),
  );
  const projetosPortfolio = parsearColecaoOrdenada(snapProjetos.docs, (d) =>
    esquemaProjetoPortfolio.safeParse(d),
  );
  const profissionais = parsearColecaoOrdenada(snapProfissionais.docs, (d) =>
    esquemaProfissionalEquipe.safeParse(d),
  );
  const microfluxosPersistidos: DefinicaoMicrofluxo[] = [];
  for (const doc of snapMicrofluxos.docs) {
    const valFluxo = esquemaDefinicaoMicrofluxo.safeParse(doc.data());
    if (valFluxo.success) {
      microfluxosPersistidos.push(valFluxo.data);
    }
  }
  const microfluxos =
    microfluxosPersistidos.length > 0
      ? ordenarMicrofluxosPorPrioridadeEOrdem(microfluxosPersistidos)
      : [];

  const rascunhoPagina = hidratarRascunhoConfiguracaoPagina(
    docRascunho.exists ? (docRascunho.data() as Record<string, unknown>) : undefined,
    {
      organizacaoId,
      nomeOrganizacao: organizacao.nome,
    },
  );

  return {
    organizacao,
    membro,
    servicos,
    produtos,
    projetosPortfolio,
    profissionais,
    microfluxos,
    rascunhoPagina,
    versaoPublicadaAtual,
    podeEditarConteudo,
    podePublicarPagina,
  };
}
