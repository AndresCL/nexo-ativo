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
import { esquemaServicoOrganizacao } from "../src/validacoes/esquemasCatalogoConteudo";
import { esquemaDefinicaoMicrofluxo } from "../src/validacoes/esquemasMicrofluxo";
import {
  CATALOGO_ACERVOS_DEMONSTRACAO,
  CATALOGO_DEMONSTRACOES_EDITORIAIS,
} from "../testes/fixtures/dadosExemploVitrine";
import {
  IDENTIFICADOR_PUBLICO_POUSADA_VELAS_DO_FORTE,
  ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID,
} from "../testes/fixtures/dadosPousadaVelasDoForte";

const EMAIL_ADMIN_POUSADA = "contato@pousadavelasdoforte.com.br";
const SENHA_LOCAL_POUSADA = "pousada@123";

async function garantirUsuarioAdministradorAutenticacao(
  autenticacao: ReturnType<typeof getAuth>,
  uidPreferencialOpcional?: string,
) {
  try {
    const existente = await autenticacao.getUserByEmail(EMAIL_ADMIN_POUSADA);
    return await autenticacao.updateUser(existente.uid, {
      password: SENHA_LOCAL_POUSADA,
      displayName: "Pousada Velas do Forte",
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
      email: EMAIL_ADMIN_POUSADA,
      password: SENHA_LOCAL_POUSADA,
      displayName: "Pousada Velas do Forte",
      emailVerified: true,
    });
  }
}

/** Cria ou atualiza a organização Pousada Velas do Forte no emulador local. */
async function criarPousadaVelasDoForte(): Promise<void> {
  loadEnvConfig(process.cwd());

  const agoraIso = new Date().toISOString();
  const base = CATALOGO_DEMONSTRACOES_EDITORIAIS[IDENTIFICADOR_PUBLICO_POUSADA_VELAS_DO_FORTE]!;
  const acervoBase = CATALOGO_ACERVOS_DEMONSTRACAO[IDENTIFICADOR_PUBLICO_POUSADA_VELAS_DO_FORTE]!;

  const pagina = esquemaConteudoPaginaPublicada.parse({
    ...base,
    atualizadoEmIso: agoraIso,
  });

  const servicos = acervoBase.servicos.map((item) =>
    esquemaServicoOrganizacao.parse({ ...item, atualizadoEmIso: agoraIso }),
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
    ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID,
    {
      servicos,
      produtos: [],
      projetosPortfolio: [],
      profissionais: [],
      microfluxos,
    },
    process.env.NEXT_PUBLIC_URL_BASE_PUBLICA ?? "http://localhost:3000",
  );

  if (process.argv.includes("--validar")) {
    console.info(
      `Dados da Pousada Velas do Forte validados com sucesso: vitrine, ${servicos.length} serviços e ${microfluxos.length} microfluxos.`,
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

  const aplicacao = initializeApp({ projectId: "demo-fluxo" }, "seed-pousada-velas-do-forte");

  try {
    const banco = getFirestore(aplicacao);
    const autenticacao = getAuth(aplicacao);
    const referenciaSlug = banco.doc(`identificadoresPublicos/${IDENTIFICADOR_PUBLICO_POUSADA_VELAS_DO_FORTE}`);
    const referenciaOrganizacao = banco.doc(`organizacoes/${ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID}`);
    const referenciaPublicada = banco.doc(`paginasPublicadas/${ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID}`);

    const usuario = await garantirUsuarioAdministradorAutenticacao(autenticacao);

    const organizacao: Organizacao = {
      id: ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID,
      nome: "Pousada Velas do Forte",
      identificadorPublico: IDENTIFICADOR_PUBLICO_POUSADA_VELAS_DO_FORTE,
      segmentoAtividade: "Hospedagem & Turismo",
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
      usuarioUid: usuario.uid,
      email: EMAIL_ADMIN_POUSADA,
      nomeExibicao: "Pousada Velas do Forte",
      papel: "proprietario",
      statusConvite: "ativo",
      criadoEmIso: agoraIso,
      atualizadoEmIso: agoraIso,
    };

    const vinculo: VinculoOrganizacaoUsuario = {
      usuarioUid: usuario.uid,
      organizacaoId: ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID,
      identificadorPublico: IDENTIFICADOR_PUBLICO_POUSADA_VELAS_DO_FORTE,
      nomeOrganizacao: "Pousada Velas do Forte",
      papel: "proprietario",
      associadoEmIso: agoraIso,
      atualizadoEmIso: agoraIso,
    };

    const rascunhoBase = hidratarRascunhoConfiguracaoPagina(
      {
        organizacaoId: ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID,
        identificadorPublico: IDENTIFICADOR_PUBLICO_POUSADA_VELAS_DO_FORTE,
        identidade: pagina.identidade,
        chamadaEditorial: pagina.chamadaEditorial,
        chamadasEditoriaisAdicionais: pagina.chamadasEditoriaisAdicionais,
        midiaFundo: pagina.midiaFundo,
        acoesPrincipais: pagina.acoesPrincipais,
        redesSociais: pagina.redesSociais,
        obrasDestaqueGaleria: pagina.obrasDestaqueGaleria,
        composicaoVisual: pagina.composicaoVisual,
        paletaId: pagina.paletaId,
        tipografiaId: pagina.tipografiaId,
        seo: pagina.seo,
      },
      {
        organizacaoId: ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID,
        nomeOrganizacao: "Pousada Velas do Forte",
      },
    );

    const batch = banco.batch();

    batch.set(
      referenciaSlug,
      removerCamposIndefinidosParaFirestore({
        identificadorPublico: IDENTIFICADOR_PUBLICO_POUSADA_VELAS_DO_FORTE,
        organizacaoId: ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID,
        situacao: "ativo",
        atualizadoEmIso: agoraIso,
      }),
      { merge: true },
    );

    batch.set(referenciaOrganizacao, removerCamposIndefinidosParaFirestore(organizacao), {
      merge: true,
    });

    batch.set(
      referenciaOrganizacao.collection("membros").doc(usuario.uid),
      removerCamposIndefinidosParaFirestore(membro),
      { merge: true },
    );

    batch.set(
      banco.doc(
        `usuarios/${usuario.uid}/organizacoesVinculadas/${ORGANIZACAO_POUSADA_VELAS_DO_FORTE_ID}`,
      ),
      removerCamposIndefinidosParaFirestore(vinculo),
      { merge: true },
    );

    batch.set(
      referenciaOrganizacao.collection("configuracoes").doc("rascunhoPagina"),
      removerCamposIndefinidosParaFirestore(rascunhoBase),
      { merge: true },
    );

    batch.set(
      referenciaPublicada,
      removerCamposIndefinidosParaFirestore({
        ...pagina,
        atualizadoEmIso: agoraIso,
      }),
      { merge: true },
    );

    // Coleções publicadas
    for (const servico of servicos) {
      batch.set(
        referenciaPublicada.collection("servicosPublicados").doc(servico.id),
        removerCamposIndefinidosParaFirestore(servico),
        { merge: true },
      );
      batch.set(
        referenciaOrganizacao.collection("servicos").doc(servico.id),
        removerCamposIndefinidosParaFirestore(servico),
        { merge: true },
      );
    }

    for (const fluxo of microfluxos) {
      batch.set(
        referenciaPublicada.collection("microfluxosPublicados").doc(fluxo.id),
        removerCamposIndefinidosParaFirestore(fluxo),
        { merge: true },
      );
      batch.set(
        referenciaOrganizacao.collection("microfluxos").doc(fluxo.id),
        removerCamposIndefinidosParaFirestore(fluxo),
        { merge: true },
      );
    }

    await batch.commit();

    console.info(
      `Pousada Velas do Forte criada com sucesso no emulador local (/pousada-velas-do-forte).`,
    );
  } finally {
    await deleteApp(aplicacao).catch(() => undefined);
  }
}

criarPousadaVelasDoForte().catch((erro) => {
  console.error("Falha ao provisionar Pousada Velas do Forte:", erro);
  process.exitCode = 1;
});
