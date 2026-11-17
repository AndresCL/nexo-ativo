import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import { CATALOGO_PLANOS_FLUXO } from "../../../src/dominio/assinaturas/tiposAssinaturaAsaas";
import type {
  MembroOrganizacao,
  Organizacao,
  RegistroAuditoria,
  ResumoDireitosPlano,
  UsuarioAutenticado,
  VinculoOrganizacaoUsuario,
} from "../../../src/dominio/entidades/autenticacaoEOrganizacao";
import {
  criarRascunhoConfiguracaoPaginaPadrao,
  removerCamposIndefinidosParaFirestore,
} from "../../../src/dominio/entidades/rascunhoConfiguracaoPagina";
import {
  ErroConflitoDominio,
  ErroValidacaoDominio,
} from "../../../src/dominio/erros/errosDominio";
import type { ResultadoCriarOrganizacaoPeloFundador } from "../../../src/dominio/fundador/tiposPainelFundador";
import { IdentificadorPublico } from "../../../src/dominio/objetos-valor/identificadorPublico";
import { exigirPrivilegioFundador } from "../../../src/dominio/permissoes/autorizadorOrganizacao";
import { esquemaCriarOrganizacaoPeloFundador } from "../../../src/validacoes/esquemasPainelFundador";

export interface PortaAutenticacaoAdminMinima {
  getUserByEmail(email: string): Promise<{ uid: string; email?: string; displayName?: string }>;
  createUser(propriedades: {
    email: string;
    displayName: string;
    password?: string;
    emailVerified: boolean;
  }): Promise<{ uid: string; email?: string; displayName?: string }>;
}

async function obterOuCriarProprietarioNoAuth(
  autenticacao: Pick<Auth, "getUserByEmail" | "createUser">,
  email: string,
  nomeExibicao: string,
  senhaOpcional?: string,
): Promise<{ uid: string; email: string; nomeExibicao: string }> {
  try {
    const existente = await autenticacao.getUserByEmail(email);
    return {
      uid: existente.uid,
      email: existente.email ?? email,
      nomeExibicao: existente.displayName ?? nomeExibicao,
    };
  } catch (erro: unknown) {
    if (
      typeof erro !== "object" ||
      erro === null ||
      !("code" in erro) ||
      erro.code !== "auth/user-not-found"
    ) {
      throw erro;
    }

    const criado = await autenticacao.createUser({
      email,
      displayName: nomeExibicao,
      ...(senhaOpcional ? { password: senhaOpcional } : {}),
      emailVerified: true,
    });

    return {
      uid: criado.uid,
      email: criado.email ?? email,
      nomeExibicao: criado.displayName ?? nomeExibicao,
    };
  }
}

export async function executarCriacaoOrganizacaoPeloFundador(
  bancoDados: Firestore,
  autenticacao: Pick<Auth, "getUserByEmail" | "createUser">,
  usuarioExecutor: UsuarioAutenticado | null,
  entradaBruta: unknown,
): Promise<ResultadoCriarOrganizacaoPeloFundador> {
  const fundador = exigirPrivilegioFundador(usuarioExecutor);

  const validacao = esquemaCriarOrganizacaoPeloFundador.safeParse(entradaBruta);
  if (!validacao.success) {
    const mensagem =
      validacao.error.issues[0]?.message ?? "Parâmetros inválidos para criação da organização.";
    throw new ErroValidacaoDominio(mensagem, "DADOS_INVALIDOS");
  }

  const dados = validacao.data;
  const slug = IdentificadorPublico.criar(dados.identificadorPublico).obterValor();
  const agoraIso = new Date().toISOString();

  const proprietario = await obterOuCriarProprietarioNoAuth(
    autenticacao,
    dados.emailProprietario,
    dados.nomeProprietario,
    dados.senhaInicialOpcional,
  );

  const definicaoPlano = CATALOGO_PLANOS_FLUXO[dados.planoCodigo] ?? CATALOGO_PLANOS_FLUXO.pro;
  const resumoDireitosPlano: ResumoDireitosPlano = {
    planoCodigo: dados.planoCodigo,
    situacaoAssinatura: "ativa",
    limiteProfissionaisAtivos: definicaoPlano.limiteProfissionaisAtivos,
    limiteEnviosEmailMensal: definicaoPlano.limiteEnviosEmailMensal,
    permitePublicacaoPublica: true,
  };

  const perfilPublicidade = dados.perfilPublicidade ?? "padrao";
  const vincularFundador =
    Boolean(dados.vincularFundadorComoAdministrador) && fundador.uid !== proprietario.uid;

  const referenciaOrganizacao = bancoDados.collection("organizacoes").doc();
  const organizacaoId = referenciaOrganizacao.id;
  const referenciaSlug = bancoDados.collection("identificadoresPublicos").doc(slug);
  const referenciaMembroProprietario = referenciaOrganizacao
    .collection("membros")
    .doc(proprietario.uid);
  const referenciaUsuarioProprietario = bancoDados.collection("usuarios").doc(proprietario.uid);
  const referenciaVinculoProprietario = referenciaUsuarioProprietario
    .collection("vinculosOrganizacao")
    .doc(organizacaoId);
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

    const novaOrganizacao: Organizacao = {
      id: organizacaoId,
      nome: dados.nome,
      identificadorPublico: slug,
      segmentoAtividade: dados.segmentoAtividade,
      ...(perfilPublicidade !== "padrao" ? { perfilPublicidade } : {}),
      situacao: "ativa",
      resumoDireitosPlano,
      criadoEmIso: agoraIso,
      atualizadoEmIso: agoraIso,
    };

    const membroProprietario: MembroOrganizacao = {
      usuarioId: proprietario.uid,
      organizacaoId,
      papel: "proprietario",
      situacao: "ativo",
      adicionadoEmIso: agoraIso,
    };

    const vinculoProprietario: VinculoOrganizacaoUsuario = {
      organizacaoId,
      nomeOrganizacao: dados.nome,
      identificadorPublico: slug,
      papel: "proprietario",
      situacao: "ativo",
    };

    transacao.set(referenciaSlug, {
      organizacaoId,
      situacao: "ativo",
      criadoEmIso: agoraIso,
    });
    transacao.set(referenciaOrganizacao, novaOrganizacao);
    transacao.set(referenciaMembroProprietario, membroProprietario);
    transacao.set(
      referenciaUsuarioProprietario,
      {
        uid: proprietario.uid,
        email: proprietario.email,
        nome: proprietario.nomeExibicao,
        atualizadoEmIso: agoraIso,
      },
      { merge: true },
    );
    transacao.set(referenciaVinculoProprietario, vinculoProprietario);

    if (vincularFundador) {
      const referenciaMembroFundador = referenciaOrganizacao
        .collection("membros")
        .doc(fundador.uid);
      const referenciaVinculoFundador = bancoDados
        .collection("usuarios")
        .doc(fundador.uid)
        .collection("vinculosOrganizacao")
        .doc(organizacaoId);

      const membroFundador: MembroOrganizacao = {
        usuarioId: fundador.uid,
        organizacaoId,
        papel: "administrador",
        situacao: "ativo",
        adicionadoEmIso: agoraIso,
      };
      const vinculoFundador: VinculoOrganizacaoUsuario = {
        organizacaoId,
        nomeOrganizacao: dados.nome,
        identificadorPublico: slug,
        papel: "administrador",
        situacao: "ativo",
      };

      transacao.set(referenciaMembroFundador, membroFundador);
      transacao.set(referenciaVinculoFundador, vinculoFundador);
    }

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

    const registroAuditoria: RegistroAuditoria = {
      id: referenciaAuditoria.id,
      acao: "fundador_criou_organizacao",
      atorUsuarioId: fundador.uid,
      organizacaoAlvoId: organizacaoId,
      usuarioAlvoId: proprietario.uid,
      detalhes: {
        identificadorPublico: slug,
        emailProprietario: proprietario.email,
        planoCodigo: dados.planoCodigo,
        perfilPublicidade,
        vincularFundadorComoAdministrador: vincularFundador,
      },
      criadoEmIso: agoraIso,
    };

    transacao.set(referenciaAuditoria, registroAuditoria);
  });

  return {
    uidProprietario: proprietario.uid,
    organizacao: {
      id: organizacaoId,
      nome: dados.nome,
      identificadorPublico: slug,
      segmentoAtividade: dados.segmentoAtividade,
      perfilPublicidade,
      situacao: "ativa",
      planoCodigo: dados.planoCodigo,
      situacaoAssinatura: "ativa",
      limiteProfissionaisAtivos: resumoDireitosPlano.limiteProfissionaisAtivos,
      limiteEnviosEmailMensal: resumoDireitosPlano.limiteEnviosEmailMensal,
      totalMembros: vincularFundador ? 2 : 1,
      criadoEmIso: agoraIso,
      atualizadoEmIso: agoraIso,
    },
  };
}
