import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import { cert, deleteApp, initializeApp } from "firebase-admin/app";
import { getAuth, type Auth, type UserRecord } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { executarPublicacaoPaginaEditorial } from "../funcoes/src/casos-de-uso/publicarPaginaTransacional";
import { CATALOGO_PLANOS_FLUXO } from "../src/dominio/assinaturas/tiposAssinaturaAsaas";
import type {
  CodigoPlanoAssinatura,
  MembroOrganizacao,
  Organizacao,
  UsuarioAutenticado,
  VinculoOrganizacaoUsuario,
} from "../src/dominio/entidades/autenticacaoEOrganizacao";
import { removerCamposIndefinidosParaFirestore } from "../src/dominio/entidades/rascunhoConfiguracaoPagina";
import {
  esquemaProdutoCatalogo,
  esquemaProfissionalEquipe,
  esquemaProjetoPortfolio,
  esquemaServicoOrganizacao,
} from "../src/validacoes/esquemasCatalogoConteudo";
import { esquemaDefinicaoMicrofluxo } from "../src/validacoes/esquemasMicrofluxo";
import { esquemaRascunhoConfiguracaoPagina } from "../src/validacoes/esquemaRascunhoPagina";
import { hidratarRascunhoConfiguracaoPagina } from "../src/dominio/entidades/rascunhoConfiguracaoPagina";
import {
  CATALOGO_ACERVOS_DEMONSTRACAO,
  CATALOGO_DEMONSTRACOES_EDITORIAIS,
} from "../testes/fixtures/dadosExemploVitrine";

const CAMINHO_CREDENCIAL_PADRAO = resolve(
  process.cwd(),
  "nexo-ativo-firebase-adminsdk-fbsvc-46a6e52c4f.json",
);

interface PacoteOrganizacaoEmulador {
  readonly organizacao: Organizacao;
  readonly rascunho: Record<string, unknown>;
  readonly configuracoes: ReadonlyArray<{ readonly id: string; readonly dados: Record<string, unknown> }>;
  readonly servicos: ReadonlyArray<{ readonly id: string; readonly dados: Record<string, unknown> }>;
  readonly produtos: ReadonlyArray<{ readonly id: string; readonly dados: Record<string, unknown> }>;
  readonly projetosPortfolio: ReadonlyArray<{
    readonly id: string;
    readonly dados: Record<string, unknown>;
  }>;
  readonly profissionais: ReadonlyArray<{
    readonly id: string;
    readonly dados: Record<string, unknown>;
  }>;
  readonly microfluxos: ReadonlyArray<{ readonly id: string; readonly dados: Record<string, unknown> }>;
  readonly uidProprietarioOrigem?: string;
}

function extrairArgumento(prefixo: string): string | undefined {
  const arg = process.argv.find((item) => item.startsWith(`${prefixo}=`));
  return arg ? arg.slice(prefixo.length + 1).trim() : undefined;
}

function extrairPacoteDeFixtureLocal(
  slug: string,
  planoForcado: CodigoPlanoAssinatura,
): PacoteOrganizacaoEmulador {
  const vitrine = CATALOGO_DEMONSTRACOES_EDITORIAIS[slug];
  const acervo = CATALOGO_ACERVOS_DEMONSTRACAO[slug];
  if (!vitrine || !acervo) {
    throw new Error(`Slug "${slug}" não encontrado nas fixtures locais.`);
  }

  const agoraIso = new Date().toISOString();
  const defPlano = CATALOGO_PLANOS_FLUXO[planoForcado] ?? CATALOGO_PLANOS_FLUXO.pro;
  const organizacaoLimpa: Organizacao = {
    id: vitrine.organizacaoId,
    nome: vitrine.identidade.nomeExibicao,
    identificadorPublico: slug,
    segmentoAtividade: vitrine.chamadaEditorial.sobretituloOpcional ?? "Serviços Especializados",
    situacao: "ativa",
    resumoDireitosPlano: {
      planoCodigo: planoForcado,
      situacaoAssinatura: "ativa",
      limiteProfissionaisAtivos: defPlano.limiteProfissionaisAtivos,
      limiteEnviosEmailMensal: defPlano.limiteEnviosEmailMensal,
      permitePublicacaoPublica: true,
    },
    criadoEmIso: agoraIso,
    atualizadoEmIso: agoraIso,
  };

  const rascunhoHidratado = hidratarRascunhoConfiguracaoPagina(
    vitrine as unknown as Record<string, unknown>,
    {
      organizacaoId: vitrine.organizacaoId,
      nomeOrganizacao: vitrine.identidade.nomeExibicao,
      agoraIso,
    },
  );
  const rascunhoValidado = esquemaRascunhoConfiguracaoPagina.parse(rascunhoHidratado);

  const servicos = acervo.servicos.map((s) => ({
    id: s.id,
    dados: removerCamposIndefinidosParaFirestore(
      esquemaServicoOrganizacao.parse({ ...s, atualizadoEmIso: agoraIso }),
    ),
  }));
  const produtos = acervo.produtos.map((p) => ({
    id: p.id,
    dados: removerCamposIndefinidosParaFirestore(
      esquemaProdutoCatalogo.parse({ ...p, atualizadoEmIso: agoraIso }),
    ),
  }));
  const projetosPortfolio = acervo.projetosPortfolio.map((p) => ({
    id: p.id,
    dados: removerCamposIndefinidosParaFirestore(
      esquemaProjetoPortfolio.parse({ ...p, atualizadoEmIso: agoraIso }),
    ),
  }));
  const profissionais = acervo.profissionais.map((p) => ({
    id: p.id,
    dados: removerCamposIndefinidosParaFirestore(
      esquemaProfissionalEquipe.parse({ ...p, atualizadoEmIso: agoraIso }),
    ),
  }));
  const microfluxos = (acervo.microfluxos ?? []).map((m) => {
    const { versaoPublicada: _versaoAntiga, ...semVersaoPublicada } = esquemaDefinicaoMicrofluxo.parse({
      ...m,
      atualizadoEmIso: agoraIso,
    });
    return {
      id: m.id,
      dados: removerCamposIndefinidosParaFirestore(semVersaoPublicada),
    };
  });

  return {
    organizacao: organizacaoLimpa,
    rascunho: removerCamposIndefinidosParaFirestore(
      rascunhoValidado as unknown as Record<string, unknown>,
    ),
    configuracoes: [],
    servicos,
    produtos,
    projetosPortfolio,
    profissionais,
    microfluxos,
  };
}

async function extrairPacoteDoEmuladorLocal(
  slug: string,
  planoForcado: CodigoPlanoAssinatura,
): Promise<PacoteOrganizacaoEmulador> {
  if (process.argv.includes("--origem=fixture")) {
    return extrairPacoteDeFixtureLocal(slug, planoForcado);
  }
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  const appOrigem = initializeApp({ projectId: "demo-fluxo" }, "extrator-emulador-origem");

  try {
    const dbOrigem = getFirestore(appOrigem);
    const docSlug = await dbOrigem.collection("identificadoresPublicos").doc(slug).get();
    if (!docSlug.exists) {
      throw new Error(`Slug "${slug}" não encontrado no emulador local.`);
    }

    const organizacaoId = String(docSlug.data()?.organizacaoId ?? "");
    if (!organizacaoId) {
      throw new Error(`Documento identificadoresPublicos/${slug} sem organizacaoId válido.`);
    }

    const refOrg = dbOrigem.collection("organizacoes").doc(organizacaoId);
    const [
      docOrg,
      docRascunho,
      snapMembros,
      snapConfiguracoes,
      snapServicos,
      snapProdutos,
      snapPortfolio,
      snapProfissionais,
      snapMicrofluxos,
    ] = await Promise.all([
      refOrg.get(),
      refOrg.collection("configuracaoPagina").doc("rascunho").get(),
      refOrg.collection("membros").get(),
      refOrg.collection("configuracoes").get(),
      refOrg.collection("servicos").get(),
      refOrg.collection("produtos").get(),
      refOrg.collection("projetosPortfolio").get(),
      refOrg.collection("profissionais").get(),
      refOrg.collection("microfluxos").get(),
    ]);

    if (!docOrg.exists || !docRascunho.exists) {
      throw new Error(`Organização "${organizacaoId}" ou rascunho inexistente no emulador.`);
    }

    const defPlano = CATALOGO_PLANOS_FLUXO[planoForcado] ?? CATALOGO_PLANOS_FLUXO.pro;
    const orgBruta = docOrg.data() as Organizacao;
    const organizacaoLimpa: Organizacao = {
      ...orgBruta,
      situacao: "ativa",
      resumoDireitosPlano: {
        planoCodigo: planoForcado,
        situacaoAssinatura: "ativa",
        limiteProfissionaisAtivos: defPlano.limiteProfissionaisAtivos,
        limiteEnviosEmailMensal: defPlano.limiteEnviosEmailMensal,
        permitePublicacaoPublica: true,
      },
    };

    const rascunhoValidado = esquemaRascunhoConfiguracaoPagina.parse(docRascunho.data());
    const servicos = snapServicos.docs.map((d) => ({
      id: d.id,
      dados: removerCamposIndefinidosParaFirestore(esquemaServicoOrganizacao.parse(d.data())),
    }));
    const produtos = snapProdutos.docs.map((d) => ({
      id: d.id,
      dados: removerCamposIndefinidosParaFirestore(esquemaProdutoCatalogo.parse(d.data())),
    }));
    const projetosPortfolio = snapPortfolio.docs.map((d) => ({
      id: d.id,
      dados: removerCamposIndefinidosParaFirestore(esquemaProjetoPortfolio.parse(d.data())),
    }));
    const profissionais = snapProfissionais.docs.map((d) => ({
      id: d.id,
      dados: removerCamposIndefinidosParaFirestore(esquemaProfissionalEquipe.parse(d.data())),
    }));
    const microfluxos = snapMicrofluxos.docs.map((d) => {
      const { versaoPublicada: _versaoAntiga, ...semVersaoPublicada } = esquemaDefinicaoMicrofluxo.parse(
        d.data(),
      );
      return {
        id: d.id,
        dados: removerCamposIndefinidosParaFirestore(semVersaoPublicada),
      };
    });

    const configuracoes = snapConfiguracoes.docs.map((d) => ({
      id: d.id,
      dados: removerCamposIndefinidosParaFirestore(d.data()),
    }));

    const membroProprietario = snapMembros.docs.find((d) => d.data().papel === "proprietario");

    return {
      organizacao: organizacaoLimpa,
      rascunho: removerCamposIndefinidosParaFirestore(
        rascunhoValidado as unknown as Record<string, unknown>,
      ),
      configuracoes,
      servicos,
      produtos,
      projetosPortfolio,
      profissionais,
      microfluxos,
      ...(membroProprietario ? { uidProprietarioOrigem: membroProprietario.id } : {}),
    };
  } finally {
    await deleteApp(appOrigem);
    delete process.env.FIRESTORE_EMULATOR_HOST;
  }
}

async function garantirUsuarioNoAuthProducao(
  authProd: Auth,
  email: string,
  nomeExibicao: string,
  senhaOpcional?: string,
  uidPreferencial?: string,
): Promise<UserRecord> {
  try {
    const existente = await authProd.getUserByEmail(email);
    if (senhaOpcional) {
      return await authProd.updateUser(existente.uid, {
        password: senhaOpcional,
        emailVerified: true,
        displayName: existente.displayName ?? nomeExibicao,
      });
    }
    return existente;
  } catch (erro: unknown) {
    if (
      typeof erro !== "object" ||
      erro === null ||
      !("code" in erro) ||
      erro.code !== "auth/user-not-found"
    ) {
      throw erro;
    }

    return await authProd.createUser({
      ...(uidPreferencial ? { uid: uidPreferencial } : {}),
      email,
      displayName: nomeExibicao,
      ...(senhaOpcional ? { password: senhaOpcional } : {}),
      emailVerified: true,
    });
  }
}

async function promoverOrganizacaoProducao(): Promise<void> {
  loadEnvConfig(process.cwd());

  const slug = extrairArgumento("--slug") ?? "garage-88";
  const emailProprietario = extrairArgumento("--email") ?? "admin@garage88.com.br";
  const nomeProprietario = extrairArgumento("--nome") ?? "Admin Garage 88";
  const senhaProprietario = extrairArgumento("--senha") ?? "garage88@123";
  const emailFundador = extrairArgumento("--fundador") ?? "aecontrerasl@gmail.com";
  const planoCodigo = (extrairArgumento("--plano") ?? "pro") as CodigoPlanoAssinatura;
  const caminhoCredencial = extrairArgumento("--credencial") ?? CAMINHO_CREDENCIAL_PADRAO;
  const modoExecutar = process.argv.includes("--executar");

  console.info(`1. Extraindo e validando pacote de "${slug}" do emulador local...`);
  const pacote = await extrairPacoteDoEmuladorLocal(slug, planoCodigo);

  console.info("Resumo do pacote extraído e validado:");
  console.info(`  - Organização: ${pacote.organizacao.nome} (${pacote.organizacao.id})`);
  console.info(`  - Endereço público: /${pacote.organizacao.identificadorPublico}`);
  console.info(`  - Plano: ${pacote.organizacao.resumoDireitosPlano.planoCodigo}`);
  console.info(`  - Produtos: ${pacote.produtos.length}`);
  console.info(`  - Serviços: ${pacote.servicos.length}`);
  console.info(`  - Portfólio: ${pacote.projetosPortfolio.length}`);
  console.info(`  - Equipe (Profissionais): ${pacote.profissionais.length}`);
  console.info(`  - Experiências (Microfluxos): ${pacote.microfluxos.length}`);
  console.info(
    `  - Documentos de configuração: ${pacote.configuracoes.map((c) => c.id).join(", ") || "nenhum"}`,
  );

  const credencialJson = JSON.parse(readFileSync(caminhoCredencial, "utf-8")) as {
    project_id?: string;
  };
  const projectIdDestino = credencialJson.project_id ?? "nexo-ativo";

  const appDestino = initializeApp(
    {
      credential: cert(caminhoCredencial),
      projectId: projectIdDestino,
    },
    "destino-producao",
  );

  try {
    const dbDestino: Firestore = getFirestore(appDestino);
    const authDestino: Auth = getAuth(appDestino);

    const organizacaoId = pacote.organizacao.id;
    const [docSlugProd, docOrgProd, docPubProd] = await dbDestino.getAll(
      dbDestino.doc(`identificadoresPublicos/${slug}`),
      dbDestino.doc(`organizacoes/${organizacaoId}`),
      dbDestino.doc(`paginasPublicadas/${organizacaoId}`),
    );

    console.info(`\n2. Verificação no Firebase de Produção (${projectIdDestino}):`);
    console.info(`  - identificadoresPublicos/${slug} existe? ${docSlugProd.exists}`);
    console.info(`  - organizacoes/${organizacaoId} existe? ${docOrgProd.exists}`);
    console.info(`  - paginasPublicadas/${organizacaoId} existe? ${docPubProd.exists}`);

    if (!modoExecutar) {
      console.info(
        "\n[DRY-RUN CONCLUÍDO] Nenhuma escrita realizada em produção. Use --executar para efetivar a promoção.",
      );
      return;
    }

    if (
      (docSlugProd.exists || docOrgProd.exists || docPubProd.exists) &&
      !process.argv.includes("--forcar")
    ) {
      throw new Error(
        `A organização "${slug}" (${organizacaoId}) já possui documentos em produção. Use --forcar se desejar atualizar.`,
      );
    }

    console.info("\n3. Provisionando usuários no Firebase Auth de produção...");
    const usuarioProprietario = await garantirUsuarioNoAuthProducao(
      authDestino,
      emailProprietario,
      nomeProprietario,
      senhaProprietario,
      pacote.uidProprietarioOrigem,
    );
    console.info(
      `  - Proprietário garantido: ${usuarioProprietario.email} (UID: ${usuarioProprietario.uid})`,
    );

    const usuarioFundadorRecord = await authDestino.getUserByEmail(emailFundador).catch(() => null);
    if (usuarioFundadorRecord) {
      console.info(
        `  - Fundador localizado para vínculo de administrador: ${usuarioFundadorRecord.email} (UID: ${usuarioFundadorRecord.uid})`,
      );
    }

    const agoraIso = new Date().toISOString();
    const lote = dbDestino.batch();
    const refOrg = dbDestino.collection("organizacoes").doc(organizacaoId);

    lote.set(dbDestino.collection("identificadoresPublicos").doc(slug), {
      organizacaoId,
      situacao: "ativo",
      criadoEmIso: agoraIso,
    });

    lote.set(
      refOrg,
      removerCamposIndefinidosParaFirestore({
        ...pacote.organizacao,
        atualizadoEmIso: agoraIso,
      }),
    );

    const membroProprietario: MembroOrganizacao = {
      usuarioId: usuarioProprietario.uid,
      organizacaoId,
      papel: "proprietario",
      situacao: "ativo",
      adicionadoEmIso: agoraIso,
    };
    const vinculoProprietario: VinculoOrganizacaoUsuario = {
      organizacaoId,
      nomeOrganizacao: pacote.organizacao.nome,
      identificadorPublico: slug,
      papel: "proprietario",
      situacao: "ativo",
    };

    lote.set(refOrg.collection("membros").doc(usuarioProprietario.uid), membroProprietario);
    lote.set(
      dbDestino.collection("usuarios").doc(usuarioProprietario.uid),
      {
        uid: usuarioProprietario.uid,
        email: usuarioProprietario.email ?? emailProprietario,
        nome: usuarioProprietario.displayName ?? nomeProprietario,
        atualizadoEmIso: agoraIso,
      },
      { merge: true },
    );
    lote.set(
      dbDestino
        .collection("usuarios")
        .doc(usuarioProprietario.uid)
        .collection("vinculosOrganizacao")
        .doc(organizacaoId),
      vinculoProprietario,
    );

    if (usuarioFundadorRecord && usuarioFundadorRecord.uid !== usuarioProprietario.uid) {
      const membroFundador: MembroOrganizacao = {
        usuarioId: usuarioFundadorRecord.uid,
        organizacaoId,
        papel: "administrador",
        situacao: "ativo",
        adicionadoEmIso: agoraIso,
      };
      const vinculoFundador: VinculoOrganizacaoUsuario = {
        organizacaoId,
        nomeOrganizacao: pacote.organizacao.nome,
        identificadorPublico: slug,
        papel: "administrador",
        situacao: "ativo",
      };
      lote.set(refOrg.collection("membros").doc(usuarioFundadorRecord.uid), membroFundador);
      lote.set(
        dbDestino
          .collection("usuarios")
          .doc(usuarioFundadorRecord.uid)
          .collection("vinculosOrganizacao")
          .doc(organizacaoId),
        vinculoFundador,
      );
    }

    lote.set(refOrg.collection("configuracaoPagina").doc("rascunho"), {
      ...pacote.rascunho,
      atualizadoEmIso: agoraIso,
    });

    for (const conf of pacote.configuracoes) {
      lote.set(refOrg.collection("configuracoes").doc(conf.id), conf.dados);
    }
    for (const item of pacote.servicos) {
      lote.set(refOrg.collection("servicos").doc(item.id), item.dados);
    }
    for (const item of pacote.produtos) {
      lote.set(refOrg.collection("produtos").doc(item.id), item.dados);
    }
    for (const item of pacote.projetosPortfolio) {
      lote.set(refOrg.collection("projetosPortfolio").doc(item.id), item.dados);
    }
    for (const item of pacote.profissionais) {
      lote.set(refOrg.collection("profissionais").doc(item.id), item.dados);
    }
    for (const item of pacote.microfluxos) {
      lote.set(refOrg.collection("microfluxos").doc(item.id), item.dados);
    }

    console.info("4. Gravando rascunho e acervo privado limpo no Firestore de produção...");
    await lote.commit();

    console.info("5. Executando publicação transacional oficial (v1) em produção...");
    process.env.NEXT_PUBLIC_URL_BASE_PUBLICA = "https://nexoativo.com.br";
    const atorProprietario: UsuarioAutenticado = {
      uid: usuarioProprietario.uid,
      email: usuarioProprietario.email ?? emailProprietario,
      nomeExibicao: usuarioProprietario.displayName ?? nomeProprietario,
      fotoUrl: null,
      emailVerificado: true,
      provedoresConectados: ["password"],
    };

    const resultadoPublicacao = await executarPublicacaoPaginaEditorial(
      dbDestino,
      atorProprietario,
      { organizacaoId },
    );

    console.info(
      `\n[SUCESSO] Organização "${pacote.organizacao.nome}" promovida e publicada em produção!`,
    );
    console.info(`  - URL pública: https://nexoativo.com.br/${resultadoPublicacao.identificadorPublico}`);
    console.info(`  - Versão publicada: v${resultadoPublicacao.versaoPublicada}`);
    console.info(`  - Login cliente: ${emailProprietario}`);
  } finally {
    await deleteApp(appDestino);
  }
}

promoverOrganizacaoProducao().catch((erro: unknown) => {
  console.error("Falha ao promover organização:", erro);
  process.exitCode = 1;
});

