import { exigirDestinosConclusaoValidos } from "../../../src/dominio/microfluxos/conclusaoMicrofluxo";
import type { Firestore } from "firebase-admin/firestore";
import type {
  RegistroAuditoria,
  UsuarioAutenticado,
} from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import {
  obterLimiteProfissionaisPermitido,
  ordenarItensAtivosCatalogo,
  type ProdutoCatalogo,
  type ProfissionalEquipe,
  type ProjetoPortfolio,
  type ServicoOrganizacao,
} from "../../../src/dominio/entidades/catalogoConteudo";
import {
  converterRascunhoParaConteudoPublicado,
  exigirProntidaoConteudoParaPublicacao,
  hidratarRascunhoConfiguracaoPagina,
  removerCamposIndefinidosParaFirestore,
  type HistoricoPublicacaoPagina,
} from "../../../src/dominio/entidades/rascunhoConfiguracaoPagina";
import { ErroAcessoNegado, ErroValidacaoDominio } from "../../../src/dominio/erros/errosDominio";
import type {
  DefinicaoMicrofluxo,
  VersaoPublicadaMicrofluxo,
} from "../../../src/dominio/microfluxos/tiposMicrofluxo";
import { ordenarMicrofluxosPorPrioridadeEOrdem } from "../../../src/dominio/microfluxos/ordenacaoMicrofluxos";
import { exigirGrafoMicrofluxoValidoParaPublicacao } from "../../../src/dominio/microfluxos/validadorGrafoMicrofluxo";
import { IdentificadorPublico } from "../../../src/dominio/objetos-valor/identificadorPublico";
import {
  aplicarPoliticaPublicidadeAMicrofluxos,
  aplicarPoliticaPublicidadeAPagina,
} from "../../../src/dominio/publicidade/aplicadorPoliticaPublicidade";
import { obterPoliticaPublicidade } from "../../../src/dominio/publicidade/registroPoliticasPublicidade";
import { exigirMicrofluxosConformesPublicidade } from "../../../src/dominio/publicidade/validadorPublicacaoPublicidade";
import {
  esquemaProdutoCatalogo,
  esquemaProfissionalEquipe,
  esquemaProjetoPortfolio,
  esquemaServicoOrganizacao,
} from "../../../src/validacoes/esquemasCatalogoConteudo";
import { esquemaDefinicaoMicrofluxo } from "../../../src/validacoes/esquemasMicrofluxo";
import { esquemaConteudoPaginaPublicada } from "../../../src/validacoes/esquemaPaginaPublicada";
import { esquemaRequisicaoPublicarPagina } from "../../../src/validacoes/esquemaRascunhoPagina";
import { carregarEValidarAcessoOrganizacao } from "../seguranca/autorizadorAdminFirestore";

export interface ResultadoPublicacaoTransacional {
  readonly organizacaoId: string;
  readonly identificadorPublico: string;
  readonly versaoPublicada: number;
  readonly publicadoEmIso: string;
}

interface DocumentoSimplesColecao {
  readonly id: string;
  data(): Record<string, unknown>;
}

async function listarDocumentosColecao(
  bancoDados: Firestore,
  caminhoColecao: string,
): Promise<readonly DocumentoSimplesColecao[]> {
  const colecao = bancoDados.collection(caminhoColecao);
  if (typeof colecao.get !== "function") {
    return [];
  }

  const instantaneo = await colecao.get();
  return instantaneo.docs as unknown as readonly DocumentoSimplesColecao[];
}

function validarItensAtivosComEsquema<
  T extends { readonly id: string; readonly ativo: boolean; readonly ordemExibicao: number },
>(
  documentosBrutos: readonly DocumentoSimplesColecao[],
  parseSeguro: (
    entrada: unknown,
  ) =>
    | { success: true; data: T }
    | { success: false; error: { issues: ReadonlyArray<{ message?: string }> } },
  rotuloEntidade: string,
): readonly T[] {
  const validados: T[] = [];

  for (const doc of documentosBrutos) {
    const dados = doc.data();
    if (dados.ativo !== true) {
      continue;
    }

    const resultado = parseSeguro(dados);
    if (!resultado.success) {
      const mensagem =
        resultado.error.issues[0]?.message ??
        `Um item ativo de ${rotuloEntidade} possui campos inválidos.`;
      throw new ErroValidacaoDominio(mensagem);
    }

    validados.push(removerCamposIndefinidosParaFirestore(resultado.data));
  }

  return ordenarItensAtivosCatalogo(validados);
}

function validarMicrofluxosAtivosParaPublicacao(
  documentosBrutos: readonly DocumentoSimplesColecao[],
): readonly DefinicaoMicrofluxo[] {
  if (documentosBrutos.length === 0) {
    return [];
  }

  const validados: DefinicaoMicrofluxo[] = [];
  for (const doc of documentosBrutos) {
    const dados = doc.data();
    if (dados.ativo !== true) {
      continue;
    }

    const validacao = esquemaDefinicaoMicrofluxo.safeParse(dados);
    if (!validacao.success) {
      const mensagem =
        validacao.error.issues[0]?.message ??
        "Uma experiência interativa ativa possui campos inválidos.";
      throw new ErroValidacaoDominio(mensagem);
    }

    exigirGrafoMicrofluxoValidoParaPublicacao(validacao.data);
    validados.push(removerCamposIndefinidosParaFirestore(validacao.data));
  }

  return validados;
}

/**
 * Caso de uso transacional que valida permissões, e-mail verificado, limites do plano,
 * integridade editorial e aciclicidade dos microfluxos (DAG) antes de publicar atomicamente
 * a página principal, sincronizar o acervo público ativo (`*Publicados`), gerar versões
 * imutáveis de microfluxos (`versoes/v{N}`), gravar `historicoPublicacoes` e registrar auditoria.
 */
export async function executarPublicacaoPaginaEditorial(
  bancoDados: Firestore,
  usuario: UsuarioAutenticado | null,
  entradaBruta: unknown,
): Promise<ResultadoPublicacaoTransacional> {
  const validacaoEntrada = esquemaRequisicaoPublicarPagina.safeParse(entradaBruta);
  if (!validacaoEntrada.success) {
    const mensagem =
      validacaoEntrada.error.issues[0]?.message ??
      "Dados inválidos para solicitação de publicação.";
    throw new ErroValidacaoDominio(mensagem);
  }

  const { organizacaoId } = validacaoEntrada.data;
  const { organizacao } = await carregarEValidarAcessoOrganizacao(
    bancoDados,
    usuario,
    organizacaoId,
    "publicar_pagina",
  );

  if (!organizacao.resumoDireitosPlano.permitePublicacaoPublica) {
    throw new ErroAcessoNegado(
      "O plano atual desta organização não habilita publicação externa.",
      "PLANO_SEM_PUBLICACAO",
    );
  }

  const publicadoEmIso = new Date().toISOString();

  const [
    docsServicosPrivados,
    docsProdutosPrivados,
    docsPortfolioPrivados,
    docsProfissionaisPrivados,
    docsMicrofluxosPrivados,
    docsServicosPublicadosAtuais,
    docsProdutosPublicadosAtuais,
    docsPortfolioPublicadosAtuais,
    docsProfissionaisPublicadosAtuais,
    docsMicrofluxosPublicadosAtuais,
  ] = await Promise.all([
    listarDocumentosColecao(bancoDados, `organizacoes/${organizacaoId}/servicos`),
    listarDocumentosColecao(bancoDados, `organizacoes/${organizacaoId}/produtos`),
    listarDocumentosColecao(bancoDados, `organizacoes/${organizacaoId}/projetosPortfolio`),
    listarDocumentosColecao(bancoDados, `organizacoes/${organizacaoId}/profissionais`),
    listarDocumentosColecao(bancoDados, `organizacoes/${organizacaoId}/microfluxos`),
    listarDocumentosColecao(bancoDados, `paginasPublicadas/${organizacaoId}/servicosPublicados`),
    listarDocumentosColecao(bancoDados, `paginasPublicadas/${organizacaoId}/produtosPublicados`),
    listarDocumentosColecao(bancoDados, `paginasPublicadas/${organizacaoId}/projetosPublicados`),
    listarDocumentosColecao(
      bancoDados,
      `paginasPublicadas/${organizacaoId}/profissionaisPublicados`,
    ),
    listarDocumentosColecao(bancoDados, `paginasPublicadas/${organizacaoId}/microfluxosPublicados`),
  ]);

  const servicosAtivos = validarItensAtivosComEsquema<ServicoOrganizacao>(
    docsServicosPrivados,
    (d) => esquemaServicoOrganizacao.safeParse(d),
    "serviços",
  );
  const produtosAtivos = validarItensAtivosComEsquema<ProdutoCatalogo>(
    docsProdutosPrivados,
    (d) => esquemaProdutoCatalogo.safeParse(d),
    "produtos",
  );
  const projetosAtivos = validarItensAtivosComEsquema<ProjetoPortfolio>(
    docsPortfolioPrivados,
    (d) => esquemaProjetoPortfolio.safeParse(d),
    "portfólio",
  );
  const profissionaisAtivos = validarItensAtivosComEsquema<ProfissionalEquipe>(
    docsProfissionaisPrivados,
    (d) => esquemaProfissionalEquipe.safeParse(d),
    "equipe",
  );
  const politicaPublicidade = obterPoliticaPublicidade(organizacao.perfilPublicidade);
  const microfluxosAtivosBrutos = validarMicrofluxosAtivosParaPublicacao(docsMicrofluxosPrivados);
  exigirDestinosConclusaoValidos(
    organizacaoId,
    {
      servicos: servicosAtivos,
      produtos: produtosAtivos,
      projetosPortfolio: projetosAtivos,
      profissionais: profissionaisAtivos,
      microfluxos: microfluxosAtivosBrutos,
    },
    process.env.NEXT_PUBLIC_URL_BASE_PUBLICA ?? "http://localhost:3000",
  );
  exigirMicrofluxosConformesPublicidade(politicaPublicidade, microfluxosAtivosBrutos);
  const microfluxosAtivosValidados = aplicarPoliticaPublicidadeAMicrofluxos(
    politicaPublicidade,
    microfluxosAtivosBrutos,
  );

  const limiteProfissionais = obterLimiteProfissionaisPermitido(
    organizacao.resumoDireitosPlano,
  );
  if (profissionaisAtivos.length > limiteProfissionais) {
    throw new ErroValidacaoDominio(
      `Sua organização possui ${profissionaisAtivos.length} profissionais ativos, mas o plano atual permite até ${limiteProfissionais}. Desative perfis excedentes ou ajuste seu plano antes de publicar.`,
      "LIMITE_PROFISSIONAIS_EXCEDIDO",
    );
  }

  const slugsCartaoVistos = new Set<string>();
  for (const prof of profissionaisAtivos) {
    const slugValidado = IdentificadorPublico.criar(prof.identificadorCartao).obterValor();
    if (slugsCartaoVistos.has(slugValidado)) {
      throw new ErroValidacaoDominio(
        `O endereço de cartão digital "${slugValidado}" está duplicado entre integrantes ativos da equipe.`,
        "IDENTIFICADOR_CARTAO_DUPLICADO",
      );
    }
    slugsCartaoVistos.add(slugValidado);
  }

  const ator = usuario!;

  const referenciaOrganizacao = bancoDados.collection("organizacoes").doc(organizacaoId);
  const referenciaRascunho = referenciaOrganizacao.collection("configuracaoPagina").doc("rascunho");
  const referenciaPublicada = bancoDados.collection("paginasPublicadas").doc(organizacaoId);
  const referenciaAuditoria = bancoDados.collection("registrosAuditoria").doc();

  const versaoGerada = await bancoDados.runTransaction(async (transacao) => {
    const [instantaneoRascunho, instantaneoPublicada] = await Promise.all([
      transacao.get(referenciaRascunho),
      transacao.get(referenciaPublicada),
    ]);

    const rascunhoHidratado = hidratarRascunhoConfiguracaoPagina(
      instantaneoRascunho.exists
        ? (instantaneoRascunho.data() as Record<string, unknown>)
        : undefined,
      {
        organizacaoId,
        nomeOrganizacao: organizacao.nome,
      },
    );

    exigirProntidaoConteudoParaPublicacao(rascunhoHidratado);

    const versaoAnterior =
      instantaneoPublicada.exists &&
      typeof instantaneoPublicada.data()?.versaoPublicada === "number"
        ? (instantaneoPublicada.data()?.versaoPublicada as number)
        : 0;
    const proximaVersao = versaoAnterior + 1;

    const conteudoCandidato = converterRascunhoParaConteudoPublicado(rascunhoHidratado, {
      identificadorPublico: organizacao.identificadorPublico,
      versaoPublicada: proximaVersao,
      publicadoEmIso,
      ...(organizacao.perfilPublicidade
        ? { perfilPublicidade: organizacao.perfilPublicidade }
        : {}),
    });

    const validacaoFinal = esquemaConteudoPaginaPublicada.safeParse(conteudoCandidato);
    if (!validacaoFinal.success) {
      const mensagem =
        validacaoFinal.error.issues[0]?.message ??
        "O rascunho possui campos inválidos para publicação.";
      throw new ErroValidacaoDominio(mensagem);
    }

    const conteudoLimpo = removerCamposIndefinidosParaFirestore(
      aplicarPoliticaPublicidadeAPagina(politicaPublicidade, validacaoFinal.data),
    );
    const referenciaHistorico = referenciaOrganizacao
      .collection("historicoPublicacoes")
      .doc(`v${proximaVersao}`);

    const registroHistorico: HistoricoPublicacaoPagina = removerCamposIndefinidosParaFirestore({
      versao: proximaVersao,
      organizacaoId,
      identificadorPublico: organizacao.identificadorPublico,
      publicadoPorUsuarioId: ator.uid,
      publicadoEmIso,
      conteudoPublicado: conteudoLimpo,
    });

    const microfluxosOrdenados = ordenarMicrofluxosPorPrioridadeEOrdem(microfluxosAtivosValidados);

    const microfluxosVersionados: DefinicaoMicrofluxo[] = microfluxosOrdenados.map((fluxo) => {
      const novaVersaoFluxo = (fluxo.versaoPublicada ?? 0) + 1;
      return removerCamposIndefinidosParaFirestore({
        ...fluxo,
        versaoPublicada: novaVersaoFluxo,
        atualizadoEmIso: publicadoEmIso,
      });
    });

    const registroAuditoria: RegistroAuditoria = {
      id: referenciaAuditoria.id,
      acao: "PUBLICAR_PAGINA_EDITORIAL",
      atorUsuarioId: ator.uid,
      organizacaoAlvoId: organizacaoId,
      detalhes: {
        identificadorPublico: organizacao.identificadorPublico,
        versaoPublicada: proximaVersao,
        composicaoVisual: conteudoLimpo.composicaoVisual,
        servicosPublicados: servicosAtivos.length,
        produtosPublicados: produtosAtivos.length,
        projetosPublicados: projetosAtivos.length,
        profissionaisPublicados: profissionaisAtivos.length,
        microfluxosPublicados: microfluxosVersionados.length,
      },
      criadoEmIso: publicadoEmIso,
    };

    transacao.set(referenciaPublicada, conteudoLimpo);
    transacao.set(referenciaHistorico, registroHistorico);
    transacao.set(referenciaAuditoria, registroAuditoria);

    function sincronizarSubcolecaoPublicada<T extends { readonly id: string }>(
      nomeSubcolecao: string,
      itensAtivos: readonly T[],
      documentosAtuais: readonly DocumentoSimplesColecao[],
    ) {
      const idsAtivos = new Set(itensAtivos.map((item) => item.id));
      const colecaoDestino = referenciaPublicada.collection(nomeSubcolecao);

      for (const item of itensAtivos) {
        transacao.set(colecaoDestino.doc(item.id), item);
      }

      for (const docAntigo of documentosAtuais) {
        if (!idsAtivos.has(docAntigo.id) && docAntigo.data().ativo === true) {
          transacao.set(colecaoDestino.doc(docAntigo.id), {
            ...docAntigo.data(),
            ativo: false,
            atualizadoEmIso: publicadoEmIso,
          });
        }
      }
    }

    sincronizarSubcolecaoPublicada(
      "servicosPublicados",
      servicosAtivos,
      docsServicosPublicadosAtuais,
    );
    sincronizarSubcolecaoPublicada(
      "produtosPublicados",
      produtosAtivos,
      docsProdutosPublicadosAtuais,
    );
    sincronizarSubcolecaoPublicada(
      "projetosPublicados",
      projetosAtivos,
      docsPortfolioPublicadosAtuais,
    );
    sincronizarSubcolecaoPublicada(
      "profissionaisPublicados",
      profissionaisAtivos,
      docsProfissionaisPublicadosAtuais,
    );
    sincronizarSubcolecaoPublicada(
      "microfluxosPublicados",
      microfluxosVersionados,
      docsMicrofluxosPublicadosAtuais,
    );

    const colecaoMicrofluxosPrivada = referenciaOrganizacao.collection("microfluxos");
    for (const fluxoVersionado of microfluxosVersionados) {
      const refFluxoPrivado = colecaoMicrofluxosPrivada.doc(fluxoVersionado.id);
      const numeroVersao = fluxoVersionado.versaoPublicada ?? 1;
      const refVersaoImutavel = refFluxoPrivado.collection("versoes").doc(`v${numeroVersao}`);

      const snapshotVersao: VersaoPublicadaMicrofluxo = {
        versao: numeroVersao,
        microfluxoId: fluxoVersionado.id,
        organizacaoId,
        publicadoEmIso,
        definicaoImutavel: fluxoVersionado,
      };

      transacao.set(refFluxoPrivado, fluxoVersionado);
      transacao.set(refVersaoImutavel, snapshotVersao);
    }

    return proximaVersao;
  });

  return {
    organizacaoId,
    identificadorPublico: organizacao.identificadorPublico,
    versaoPublicada: versaoGerada,
    publicadoEmIso,
  };
}
