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
import { exigirGrafoMicrofluxoValidoParaPublicacao } from "../src/dominio/microfluxos/validadorGrafoMicrofluxo";
import { esquemaConteudoPaginaPublicada } from "../src/validacoes/esquemaPaginaPublicada";
import { esquemaServicoOrganizacao } from "../src/validacoes/esquemasCatalogoConteudo";
import { esquemaDefinicaoMicrofluxo } from "../src/validacoes/esquemasMicrofluxo";
import {
  CATALOGO_ACERVOS_DEMONSTRACAO,
  CATALOGO_DEMONSTRACOES_EDITORIAIS,
} from "../testes/fixtures/dadosExemploVitrine";

const ORGANIZACAO_ID = "org-maplebear-cabofrio";
const IDENTIFICADOR_PUBLICO = "maplebear-cabofrio";
const EMAIL_ADMINISTRADOR = "admin@mbcabofrio.com.br";
const SENHA_LOCAL = "maplebear@123";

/** Popula a organização de teste Maple Bear Cabo Frio no emulador local. */
async function criarMapleBearCaboFrio(): Promise<void> {
  loadEnvConfig(process.cwd());
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";

  if (
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_USAR_EMULADORES !== "true" ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "demo-fluxo"
  ) {
    throw new Error("O seed exige os emuladores locais do projeto demo-fluxo.");
  }

  const agoraIso = new Date().toISOString();
  const base = CATALOGO_DEMONSTRACOES_EDITORIAIS[IDENTIFICADOR_PUBLICO]!;
  const acervoBase = CATALOGO_ACERVOS_DEMONSTRACAO[IDENTIFICADOR_PUBLICO]!;
  const pagina = esquemaConteudoPaginaPublicada.parse({
    ...base,
    acoesPrincipais: [],
    atualizadoEmIso: agoraIso,
  });

  const microfluxos = (acervoBase.microfluxos ?? []).map((fluxo) =>
    esquemaDefinicaoMicrofluxo.parse({
      ...fluxo,
      atualizadoEmIso: agoraIso,
    }),
  );
  for (const fluxo of microfluxos) {
    exigirGrafoMicrofluxoValidoParaPublicacao(fluxo);
  }

  const servicos = acervoBase.servicos.map((item) =>
    esquemaServicoOrganizacao.parse(item),
  );

  const aplicacao = initializeApp(
    { projectId: "demo-fluxo" },
    "seed-maplebear-cabofrio",
  );
  const auth = getAuth(aplicacao);
  const banco = getFirestore(aplicacao);

  try {
    const organizacaoRef = banco.doc(`organizacoes/${ORGANIZACAO_ID}`);
    const slugRef = banco.doc(`identificadoresPublicos/${IDENTIFICADOR_PUBLICO}`);

    let usuario = await auth
      .getUserByEmail(EMAIL_ADMINISTRADOR)
      .catch(() => null);
    if (!usuario) {
      usuario = await auth.createUser({
        email: EMAIL_ADMINISTRADOR,
        password: SENHA_LOCAL,
        displayName: "Admin Maple Bear Cabo Frio",
        emailVerified: true,
      });
    }

    const organizacao = {
      id: ORGANIZACAO_ID,
      nome: "Maple Bear Cabo Frio",
      identificadorPublico: IDENTIFICADOR_PUBLICO,
      plano: "pro",
      planoCodigo: "pro",
      situacao: "ativa",
      proprietarioUid: usuario.uid,
      resumoDireitosPlano: {
        permitePublicacaoPublica: true,
        permiteDominioPersonalizado: false,
        limiteMicrofluxos: 20,
        limiteItensCatalogo: 50,
      },
      criadaEmIso: agoraIso,
      atualizadaEmIso: agoraIso,
    };

    const membro: MembroOrganizacao = {
      usuarioId: usuario.uid,
      organizacaoId: ORGANIZACAO_ID,
      papel: "proprietario",
      situacao: "ativo",
      adicionadoEmIso: agoraIso,
    };

    const vinculo: VinculoOrganizacaoUsuario = {
      organizacaoId: ORGANIZACAO_ID,
      nomeOrganizacao: "Maple Bear Cabo Frio",
      identificadorPublico: IDENTIFICADOR_PUBLICO,
      papel: "proprietario",
      situacao: "ativo",
    };

    const rascunho = hidratarRascunhoConfiguracaoPagina(
      {
        organizacaoId: ORGANIZACAO_ID,
        identificadorPublico: IDENTIFICADOR_PUBLICO,
        ...pagina,
        atualizadoEmIso: agoraIso,
      },
      { organizacaoId: ORGANIZACAO_ID, nomeOrganizacao: "Maple Bear Cabo Frio", agoraIso },
    );

    const lote = banco.batch();
    lote.set(organizacaoRef, organizacao);
    lote.set(slugRef, {
      identificadorPublico: IDENTIFICADOR_PUBLICO,
      organizacaoId: ORGANIZACAO_ID,
      criadoEmIso: agoraIso,
      atualizadoEmIso: agoraIso,
    });
    lote.set(banco.doc(`organizacoes/${ORGANIZACAO_ID}/membros/${usuario.uid}`), membro);
    lote.set(
      banco.doc(`usuarios/${usuario.uid}`),
      {
        id: usuario.uid,
        email: EMAIL_ADMINISTRADOR,
        nomeExibicao: "Admin Maple Bear Cabo Frio",
        atualizadoEmIso: agoraIso,
      },
      { merge: true },
    );
    lote.set(
      banco.doc(`usuarios/${usuario.uid}/vinculosOrganizacao/${ORGANIZACAO_ID}`),
      vinculo,
    );
    lote.set(
      banco.doc(`organizacoes/${ORGANIZACAO_ID}/configuracaoPagina/rascunho`),
      removerCamposIndefinidosParaFirestore(rascunho),
    );
    lote.set(
      banco.doc(`paginasPublicadas/${ORGANIZACAO_ID}`),
      removerCamposIndefinidosParaFirestore(pagina),
    );

    for (const servico of servicos) {
      lote.set(
        banco.doc(`organizacoes/${ORGANIZACAO_ID}/servicos/${servico.id}`),
        servico,
      );
      lote.set(
        banco.doc(
          `paginasPublicadas/${ORGANIZACAO_ID}/servicosPublicados/${servico.id}`,
        ),
        servico,
      );
    }

    for (const fluxo of microfluxos) {
      const dados = removerCamposIndefinidosParaFirestore(fluxo);
      lote.set(
        banco.doc(`organizacoes/${ORGANIZACAO_ID}/microfluxos/${fluxo.id}`),
        dados,
      );
      lote.set(
        banco.doc(
          `paginasPublicadas/${ORGANIZACAO_ID}/microfluxosPublicados/${fluxo.id}`,
        ),
        dados,
      );
    }

    await lote.commit();
    console.info(
      `Maple Bear Cabo Frio criada no emulador local! Vitrine: /${IDENTIFICADOR_PUBLICO} | Admin: ${EMAIL_ADMINISTRADOR}`,
    );
  } finally {
    await deleteApp(aplicacao);
  }
}

criarMapleBearCaboFrio().catch((erro: unknown) => {
  console.error(erro);
  process.exit(1);
});

