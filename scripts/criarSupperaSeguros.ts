import { loadEnvConfig } from "@next/env";
import { deleteApp, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type {
  MembroOrganizacao,
  Organizacao,
  VinculoOrganizacaoUsuario,
} from "../src/dominio/entidades/autenticacaoEOrganizacao";
import {
  hidratarRascunhoConfiguracaoPagina,
  removerCamposIndefinidosParaFirestore,
} from "../src/dominio/entidades/rascunhoConfiguracaoPagina";
import { exigirDestinosConclusaoValidos } from "../src/dominio/microfluxos/conclusaoMicrofluxo";
import { exigirGrafoMicrofluxoValidoParaPublicacao } from "../src/dominio/microfluxos/validadorGrafoMicrofluxo";
import { esquemaConteudoPaginaPublicada } from "../src/validacoes/esquemaPaginaPublicada";
import {
  esquemaProdutoCatalogo,
  esquemaProfissionalEquipe,
  esquemaProjetoPortfolio,
  esquemaServicoOrganizacao,
} from "../src/validacoes/esquemasCatalogoConteudo";
import { esquemaDefinicaoMicrofluxo } from "../src/validacoes/esquemasMicrofluxo";
import {
  CATALOGO_ACERVOS_DEMONSTRACAO,
  CATALOGO_DEMONSTRACOES_EDITORIAIS,
} from "../testes/fixtures/dadosExemploVitrine";
import {
  EMAIL_ADMIN_SUPPERA,
  IDENTIFICADOR_PUBLICO_SUPPERA,
  ORGANIZACAO_SUPPERA_ID,
} from "../testes/fixtures/dadosSupperaSeguros";

const SENHA_LOCAL_SUPPERA = "suppera@123";

async function garantirUsuarioAdministradorAutenticacao(
  autenticacao: ReturnType<typeof getAuth>,
  uidPreferencialOpcional?: string,
) {
  try {
    const existente = await autenticacao.getUserByEmail(EMAIL_ADMIN_SUPPERA);
    return await autenticacao.updateUser(existente.uid, {
      password: SENHA_LOCAL_SUPPERA,
      displayName: "Admin Suppera Seguros",
      emailVerified: true,
    });
  } catch (erro: unknown) {
    if (
      typeof erro !== "object" ||
      erro === null ||
      !("code" in erro) ||
      erro.code !== "auth/user-not-found"
    ) {
      throw erro;
    }
    return autenticacao.createUser({
      ...(uidPreferencialOpcional ? { uid: uidPreferencialOpcional } : {}),
      email: EMAIL_ADMIN_SUPPERA,
      password: SENHA_LOCAL_SUPPERA,
      displayName: "Admin Suppera Seguros",
      emailVerified: true,
    });
  }
}

/** Cria ou atualiza a organização Suppera Seguros no emulador local com validação integral de esquemas e DAG. */
async function criarSupperaSeguros(): Promise<void> {
  loadEnvConfig(process.cwd());

  const agoraIso = new Date().toISOString();
  const base = CATALOGO_DEMONSTRACOES_EDITORIAIS[IDENTIFICADOR_PUBLICO_SUPPERA]!;
  const acervoBase = CATALOGO_ACERVOS_DEMONSTRACAO[IDENTIFICADOR_PUBLICO_SUPPERA]!;

  const pagina = esquemaConteudoPaginaPublicada.parse({
    ...base,
    atualizadoEmIso: agoraIso,
  });

  const servicos = acervoBase.servicos.map((item) =>
    esquemaServicoOrganizacao.parse({ ...item, atualizadoEmIso: agoraIso }),
  );
  const produtos = acervoBase.produtos.map((item) =>
    esquemaProdutoCatalogo.parse({ ...item, atualizadoEmIso: agoraIso }),
  );
  const projetosPortfolio = acervoBase.projetosPortfolio.map((item) =>
    esquemaProjetoPortfolio.parse({ ...item, atualizadoEmIso: agoraIso }),
  );
  const profissionais = acervoBase.profissionais.map((item) =>
    esquemaProfissionalEquipe.parse({ ...item, atualizadoEmIso: agoraIso }),
  );
  const microfluxos = (acervoBase.microfluxos ?? []).map((fluxo) =>
    esquemaDefinicaoMicrofluxo.parse({
      ...fluxo,
      versaoPublicada: 1,
      atualizadoEmIso: agoraIso,
    }),
  );

  for (const fluxo of microfluxos) {
    exigirGrafoMicrofluxoValidoParaPublicacao(fluxo);
  }

  exigirDestinosConclusaoValidos(
    ORGANIZACAO_SUPPERA_ID,
    {
      servicos,
      produtos,
      projetosPortfolio,
      profissionais,
      microfluxos,
    },
    process.env.NEXT_PUBLIC_URL_BASE_PUBLICA ?? "http://localhost:3000",
  );

  if (process.argv.includes("--validar")) {
    console.info(
      `Dados da Suppera Seguros validados com sucesso: vitrine, ${servicos.length} serviços, ${profissionais.length} profissional e ${microfluxos.length} ações/microfluxos.`,
    );
    return;
  }

  if (
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_USAR_EMULADORES !== "true" ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "demo-fluxo"
  ) {
    throw new Error("O provisionamento local exige os emuladores do projeto demo-fluxo.");
  }

  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";

  const aplicacao = initializeApp({ projectId: "demo-fluxo" }, "seed-suppera-seguros");

  try {
    const banco = getFirestore(aplicacao);
    const autenticacao = getAuth(aplicacao);
    const referenciaSlug = banco.doc(`identificadoresPublicos/${IDENTIFICADOR_PUBLICO_SUPPERA}`);
    const referenciaOrganizacao = banco.doc(`organizacoes/${ORGANIZACAO_SUPPERA_ID}`);
    const referenciaPublicada = banco.doc(`paginasPublicadas/${ORGANIZACAO_SUPPERA_ID}`);

    const usuario = await garantirUsuarioAdministradorAutenticacao(autenticacao);

    const organizacao: Organizacao = {
      id: ORGANIZACAO_SUPPERA_ID,
      nome: "Suppera Seguros",
      identificadorPublico: IDENTIFICADOR_PUBLICO_SUPPERA,
      segmentoAtividade: "Corretora de Seguros Automotivos",
      situacao: "ativa",
      resumoDireitosPlano: {
        planoCodigo: "pro",
        situacaoAssinatura: "ativa",
        limiteProfissionaisAtivos: 10,
        limiteEnviosEmailMensal: 300,
        permitePublicacaoPublica: true,
      },
      criadoEmIso: agoraIso,
      atualizadoEmIso: agoraIso,
    };

    const membro: MembroOrganizacao = {
      usuarioId: usuario.uid,
      organizacaoId: ORGANIZACAO_SUPPERA_ID,
      papel: "proprietario",
      situacao: "ativo",
      adicionadoEmIso: agoraIso,
    };

    const vinculo: VinculoOrganizacaoUsuario = {
      organizacaoId: ORGANIZACAO_SUPPERA_ID,
      nomeOrganizacao: "Suppera Seguros",
      identificadorPublico: IDENTIFICADOR_PUBLICO_SUPPERA,
      papel: "proprietario",
      situacao: "ativo",
    };

    const rascunho = hidratarRascunhoConfiguracaoPagina(
      pagina as unknown as Record<string, unknown>,
      {
        organizacaoId: ORGANIZACAO_SUPPERA_ID,
        nomeOrganizacao: "Suppera Seguros",
      },
    );

    const lote = banco.batch();

    lote.set(referenciaSlug, {
      organizacaoId: ORGANIZACAO_SUPPERA_ID,
      situacao: "ativo",
      criadoEmIso: agoraIso,
    });
    lote.set(referenciaOrganizacao, organizacao);
    lote.set(referenciaPublicada, removerCamposIndefinidosParaFirestore(pagina));
    lote.set(referenciaOrganizacao.collection("membros").doc(usuario.uid), membro);
    lote.set(
      banco.doc(`usuarios/${usuario.uid}`),
      {
        uid: usuario.uid,
        email: usuario.email ?? EMAIL_ADMIN_SUPPERA,
        nome: usuario.displayName ?? "Admin Suppera Seguros",
        atualizadoEmIso: agoraIso,
      },
      { merge: true },
    );
    lote.set(
      banco.doc(`usuarios/${usuario.uid}/vinculosOrganizacao/${ORGANIZACAO_SUPPERA_ID}`),
      vinculo,
    );
    lote.set(
      referenciaOrganizacao.collection("configuracaoPagina").doc("rascunho"),
      removerCamposIndefinidosParaFirestore(rascunho),
    );

    const colecoes = [
      { privada: "servicos", publicada: "servicosPublicados", itens: servicos },
      { privada: "produtos", publicada: "produtosPublicados", itens: produtos },
      { privada: "projetosPortfolio", publicada: "projetosPublicados", itens: projetosPortfolio },
      { privada: "profissionais", publicada: "profissionaisPublicados", itens: profissionais },
      { privada: "microfluxos", publicada: "microfluxosPublicados", itens: microfluxos },
    ];

    for (const colecao of colecoes) {
      for (const item of colecao.itens) {
        const dadosLimpos = removerCamposIndefinidosParaFirestore(item);
        lote.set(referenciaOrganizacao.collection(colecao.privada).doc(item.id), dadosLimpos);
        lote.set(referenciaPublicada.collection(colecao.publicada).doc(item.id), dadosLimpos);
      }
    }

    await lote.commit();
    console.info(
      `Suppera Seguros criada no emulador local! Vitrine: /${IDENTIFICADOR_PUBLICO_SUPPERA} | Admin: ${EMAIL_ADMIN_SUPPERA} (senha: ${SENHA_LOCAL_SUPPERA})`,
    );
    console.info("Execute npm run emuladores:salvar para persistir os dados em dados-emulador/.");
  } finally {
    await deleteApp(aplicacao);
  }
}

criarSupperaSeguros().catch((erro: unknown) => {
  console.error(erro);
  process.exitCode = 1;
});

