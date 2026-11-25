import type { Firestore } from "firebase-admin/firestore";
import {
  criarResumoDireitosPlanoInicial,
  type MembroOrganizacao,
  type Organizacao,
  type RegistroAuditoria,
  type UsuarioAutenticado,
  type VinculoOrganizacaoUsuario,
} from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import {
  ErroConflitoDominio,
  ErroNaoAutenticado,
  ErroValidacaoDominio,
} from "../../../src/dominio/erros/errosDominio";
import { IdentificadorPublico } from "../../../src/dominio/objetos-valor/identificadorPublico";
import {
  criarRascunhoConfiguracaoPaginaPadrao,
  removerCamposIndefinidosParaFirestore,
} from "../../../src/dominio/entidades/rascunhoConfiguracaoPagina";
import { criarConteudoInicialOrganizacao } from "../../../src/dominio/entidades/conteudoInicialOrganizacao";
import { CODIGO_PERFIL_PUBLICIDADE_PADRAO } from "../../../src/dominio/publicidade/tiposPerfilPublicidade";
import { esquemaCriarOrganizacaoInicial } from "../../../src/validacoes/esquemasAutenticacao";

export interface ResultadoCriacaoOrganizacaoTransacional {
  readonly organizacaoId: string;
  readonly identificadorPublico: string;
}

/**
 * Caso de uso transacional que reserva o endereço público com unicidade física no Firestore,
 * cria a organização, vincula o criador como proprietário e inicializa o rascunho de página.
 */
export async function executarCriacaoOrganizacaoInicial(
  bancoDados: Firestore,
  usuario: UsuarioAutenticado | null,
  entradaBruta: unknown,
): Promise<ResultadoCriacaoOrganizacaoTransacional> {
  if (!usuario) {
    throw new ErroNaoAutenticado();
  }

  const validacao = esquemaCriarOrganizacaoInicial.safeParse(entradaBruta);
  if (!validacao.success) {
    const primeiraMensagem =
      validacao.error.issues[0]?.message ?? "Dados inválidos para criação da organização.";
    throw new ErroValidacaoDominio(primeiraMensagem);
  }

  const dados = validacao.data;
  const identificadorValidado = IdentificadorPublico.criar(dados.identificadorPublico);
  const slug = identificadorValidado.obterValor();
  const agoraIso = new Date().toISOString();

  const referenciaOrganizacao = bancoDados.collection("organizacoes").doc();
  const organizacaoId = referenciaOrganizacao.id;
  const referenciaSlug = bancoDados.collection("identificadoresPublicos").doc(slug);
  const referenciaMembro = referenciaOrganizacao.collection("membros").doc(usuario.uid);
  const referenciaUsuario = bancoDados.collection("usuarios").doc(usuario.uid);
  const referenciaVinculo = referenciaUsuario.collection("vinculosOrganizacao").doc(organizacaoId);
  const referenciaRascunho = referenciaOrganizacao.collection("configuracaoPagina").doc("rascunho");
  const referenciaAuditoria = bancoDados.collection("registrosAuditoria").doc();

  await bancoDados.runTransaction(async (transacao) => {
    const slugExistente = await transacao.get(referenciaSlug);
    if (slugExistente.exists) {
      throw new ErroConflitoDominio(
        "Este endereço público já está em uso por outra organização.",
        "ENDERECO_PUBLICO_INDISPONIVEL",
      );
    }

    const perfilPublicidade = dados.perfilPublicidade ?? CODIGO_PERFIL_PUBLICIDADE_PADRAO;
    const resumoDireitosPlano = criarResumoDireitosPlanoInicial();

    const novaOrganizacao: Organizacao = {
      id: organizacaoId,
      nome: dados.nome,
      identificadorPublico: slug,
      segmentoAtividade: dados.segmentoAtividade,
      ...(perfilPublicidade !== CODIGO_PERFIL_PUBLICIDADE_PADRAO ? { perfilPublicidade } : {}),
      situacao: "ativa",
      resumoDireitosPlano,
      criadoEmIso: agoraIso,
      atualizadoEmIso: agoraIso,
    };

    const membroProprietario: MembroOrganizacao = {
      usuarioId: usuario.uid,
      organizacaoId,
      papel: "proprietario",
      situacao: "ativo",
      adicionadoEmIso: agoraIso,
    };

    const vinculoEspelho: VinculoOrganizacaoUsuario = {
      organizacaoId,
      nomeOrganizacao: dados.nome,
      identificadorPublico: slug,
      papel: "proprietario",
      situacao: "ativo",
    };

    const auditoria: RegistroAuditoria = {
      id: referenciaAuditoria.id,
      acao: "CRIAR_ORGANIZACAO_INICIAL",
      atorUsuarioId: usuario.uid,
      organizacaoAlvoId: organizacaoId,
      detalhes: {
        identificadorPublico: slug,
        segmentoAtividade: dados.segmentoAtividade,
      },
      criadoEmIso: agoraIso,
    };

    transacao.set(referenciaSlug, {
      organizacaoId,
      situacao: "ativo",
      criadoEmIso: agoraIso,
    });
    transacao.set(referenciaOrganizacao, novaOrganizacao);
    transacao.set(referenciaMembro, membroProprietario);
    transacao.set(
      referenciaUsuario,
      {
        uid: usuario.uid,
        email: usuario.email,
        nome: usuario.nomeExibicao,
        atualizadoEmIso: agoraIso,
      },
      { merge: true },
    );
    transacao.set(referenciaVinculo, vinculoEspelho);
    transacao.set(
      referenciaRascunho,
      removerCamposIndefinidosParaFirestore(
        criarRascunhoConfiguracaoPaginaPadrao({
          organizacaoId,
          nomeOrganizacao: dados.nome,
          agoraIso,
        }),
      ),
    );

    const conteudoInicial = criarConteudoInicialOrganizacao({
      organizacaoId,
      nomeOrganizacao: dados.nome,
      nomeProprietarioOpcional: usuario.nomeExibicao ?? undefined,
      perfilPublicidade,
      limiteProfissionaisAtivos: resumoDireitosPlano.limiteProfissionaisAtivos,
      agoraIso,
    });

    for (const fluxo of conteudoInicial.microfluxos) {
      transacao.set(
        referenciaOrganizacao.collection("microfluxos").doc(fluxo.id),
        removerCamposIndefinidosParaFirestore(fluxo),
      );
    }
    for (const profissional of conteudoInicial.profissionais) {
      transacao.set(
        referenciaOrganizacao.collection("profissionais").doc(profissional.id),
        removerCamposIndefinidosParaFirestore(profissional),
      );
    }
    for (const produto of conteudoInicial.produtos) {
      transacao.set(
        referenciaOrganizacao.collection("produtos").doc(produto.id),
        removerCamposIndefinidosParaFirestore(produto),
      );
    }

    transacao.set(referenciaAuditoria, auditoria);
  });

  return {
    organizacaoId,
    identificadorPublico: slug,
  };
}
