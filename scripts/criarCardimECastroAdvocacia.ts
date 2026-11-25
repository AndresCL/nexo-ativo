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
  EMAIL_ADMIN_CARDIM_CASTRO,
  IDENTIFICADOR_PUBLICO_CARDIM_CASTRO,
  ORGANIZACAO_CARDIM_CASTRO_ID,
} from "../testes/fixtures/dadosCardimECastroAdvocacia";

const SENHA_LOCAL_CARDIM_CASTRO = "cardim@123";
const NOME_ORGANIZACAO = "Cardim & Castro Advocacia";

async function garantirUsuarioAdministradorAutenticacao(
  autenticacao: ReturnType<typeof getAuth>,
  uidPreferencialOpcional?: string,
) {
  try {
    const existente = await autenticacao.getUserByEmail(EMAIL_ADMIN_CARDIM_CASTRO);
    return await autenticacao.updateUser(existente.uid, {
      password: SENHA_LOCAL_CARDIM_CASTRO,
      displayName: `Admin ${NOME_ORGANIZACAO}`,
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
      email: EMAIL_ADMIN_CARDIM_CASTRO,
      password: SENHA_LOCAL_CARDIM_CASTRO,
      displayName: `Admin ${NOME_ORGANIZACAO}`,
      emailVerified: true,
    });
  }
}

/** Cria ou atualiza a organização Cardim & Castro Advocacia no emulador local com validação integral. */
async function criarCardimECastroAdvocacia(): Promise<void> {
  loadEnvConfig(process.cwd());

  const agoraIso = new Date().toISOString();
  const base = CATALOGO_DEMONSTRACOES_EDITORIAIS[IDENTIFICADOR_PUBLICO_CARDIM_CASTRO]!;
  const acervoBase = CATALOGO_ACERVOS_DEMONSTRACAO[IDENTIFICADOR_PUBLICO_CARDIM_CASTRO]!;

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
    ORGANIZACAO_CARDIM_CASTRO_ID,
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
      `Dados de ${NOME_ORGANIZACAO} validados com sucesso: vitrine, ${servicos.length} serviços e ${microfluxos.length} ações/microfluxos.`,
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

  const aplicacao = initializeApp({ projectId: "demo-fluxo" }, "seed-cardim-castro-advocacia");

  try {
    const banco = getFirestore(aplicacao);
    const autenticacao = getAuth(aplicacao);
    const referenciaSlug = banco.doc(
      `identificadoresPublicos/${IDENTIFICADOR_PUBLICO_CARDIM_CASTRO}`,
    );
    const referenciaOrganizacao = banco.doc(`organizacoes/${ORGANIZACAO_CARDIM_CASTRO_ID}`);
    const referenciaPublicada = banco.doc(`paginasPublicadas/${ORGANIZACAO_CARDIM_CASTRO_ID}`);

    const usuario = await garantirUsuarioAdministradorAutenticacao(autenticacao);

    const organizacao: Organizacao = {
      id: ORGANIZACAO_CARDIM_CASTRO_ID,
      nome: NOME_ORGANIZACAO,
      identificadorPublico: IDENTIFICADOR_PUBLICO_CARDIM_CASTRO,
      segmentoAtividade: "Escritório de Advocacia",
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
      organizacaoId: ORGANIZACAO_CARDIM_CASTRO_ID,
      papel: "proprietario",
      situacao: "ativo",
      adicionadoEmIso: agoraIso,
    };

    const vinculo: VinculoOrganizacaoUsuario = {
      organizacaoId: ORGANIZACAO_CARDIM_CASTRO_ID,
      nomeOrganizacao: NOME_ORGANIZACAO,
      identificadorPublico: IDENTIFICADOR_PUBLICO_CARDIM_CASTRO,
      papel: "proprietario",
      situacao: "ativo",
    };

    const rascunho = hidratarRascunhoConfiguracaoPagina(
      pagina as unknown as Record<string, unknown>,
      {
        organizacaoId: ORGANIZACAO_CARDIM_CASTRO_ID,
        nomeOrganizacao: NOME_ORGANIZACAO,
      },
    );

    const lote = banco.batch();

    lote.set(referenciaSlug, {
      organizacaoId: ORGANIZACAO_CARDIM_CASTRO_ID,
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
        email: usuario.email ?? EMAIL_ADMIN_CARDIM_CASTRO,
        nome: usuario.displayName ?? `Admin ${NOME_ORGANIZACAO}`,
        atualizadoEmIso: agoraIso,
      },
      { merge: true },
    );
    lote.set(
      banco.doc(`usuarios/${usuario.uid}/vinculosOrganizacao/${ORGANIZACAO_CARDIM_CASTRO_ID}`),
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
      `${NOME_ORGANIZACAO} criada no emulador local! Vitrine: /${IDENTIFICADOR_PUBLICO_CARDIM_CASTRO} | Admin: ${EMAIL_ADMIN_CARDIM_CASTRO} (senha: ${SENHA_LOCAL_CARDIM_CASTRO})`,
    );
    console.info("Execute npm run emuladores:salvar para persistir os dados em dados-emulador/.");
  } finally {
    await deleteApp(aplicacao);
  }
}

criarCardimECastroAdvocacia().catch((erro: unknown) => {
  console.error(erro);
  process.exitCode = 1;
});

