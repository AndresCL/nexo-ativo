import { atualizarDefinicaoMicrofluxoGarage88 } from "./modelos/microfluxosGarage88";
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

const ORGANIZACAO_ID = "org-garage88";
const IDENTIFICADOR_PUBLICO = "garage-88";
const EMAIL_ADMINISTRADOR = "admin@garage88.com.br";
const SENHA_LOCAL = "garage88@123";

async function garantirUsuarioAdministradorAutenticacao(
  autenticacao: ReturnType<typeof getAuth>,
  uidPreferencialOpcional?: string,
) {
  return autenticacao.getUserByEmail(EMAIL_ADMINISTRADOR).catch((erro: unknown) => {
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
      email: EMAIL_ADMINISTRADOR,
      password: SENHA_LOCAL,
      displayName: "Admin Garage 88",
      emailVerified: true,
    });
  });
}

/** Recupera a base histórica do cliente somente no emulador local, sem substituir registros. */
async function recuperarGarage88(): Promise<void> {
  loadEnvConfig(process.cwd());

  if (
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_USAR_EMULADORES !== "true" ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "demo-fluxo"
  ) {
    throw new Error("A recuperação exige os emuladores locais do projeto demo-fluxo.");
  }

  const agoraIso = new Date().toISOString();
  const base = CATALOGO_DEMONSTRACOES_EDITORIAIS[IDENTIFICADOR_PUBLICO]!;
  const acervoBase = CATALOGO_ACERVOS_DEMONSTRACAO[IDENTIFICADOR_PUBLICO]!;
  const pagina = esquemaConteudoPaginaPublicada.parse({
    ...base,
    acoesPrincipais: [],
    atualizadoEmIso: agoraIso,
  });
  const ordens: Readonly<Record<string, number>> = {
    "fluxo-financiamento": 0,
    "fluxo-diagnostico": 1,
    "fluxo-catalogo": 2,
    "fluxo-profissional": 3,
    "fluxo-atendimento": 4,
  };
  const microfluxos = (acervoBase.microfluxos ?? []).map((fluxo) =>
    atualizarDefinicaoMicrofluxoGarage88(
      esquemaDefinicaoMicrofluxo.parse({
        ...fluxo,
        tipoAcao: fluxo.id === "fluxo-profissional" ? "secao_equipe" : "microfluxo",
        ativoNaHome: true,
        ordemHome: ordens[fluxo.id],
        etapas:
          fluxo.id === "fluxo-profissional"
            ? []
            : fluxo.etapas.map((etapa) =>
                fluxo.id === "fluxo-catalogo" && etapa.tipoEtapa === "selecao_catalogo"
                  ? { ...etapa, fonteCatalogo: "produtos" }
                  : etapa,
              ),
        etapaInicialId: fluxo.id === "fluxo-profissional" ? "" : fluxo.etapaInicialId,
        versaoPublicada: 1,
        atualizadoEmIso: agoraIso,
      }),
    ),
  );
  microfluxos.push(
    esquemaDefinicaoMicrofluxo.parse({
      id: "acao-estoque-completo-site",
      organizacaoId: ORGANIZACAO_ID,
      tipoAcao: "link_externo",
      urlDestinoOpcional: "https://garage88.com.br",
      titulo: "Ver estoque completo no site",
      rotuloBotaoHome: "Ver estoque completo no site",
      subtituloBotaoHome: "Acesse todos os veículos em Garage88",
      iconeBotaoHome: "link",
      ordemHome: 5,
      ativo: true,
      ativoNaHome: true,
      versaoPublicada: 1,
      atualizadoEmIso: agoraIso,
    }),
  );
  for (const fluxo of microfluxos) exigirGrafoMicrofluxoValidoParaPublicacao(fluxo);

  const colecoes = [
    {
      privada: "servicos",
      publicada: "servicosPublicados",
      itens: acervoBase.servicos.map((item) => esquemaServicoOrganizacao.parse(item)),
    },
    {
      privada: "produtos",
      publicada: "produtosPublicados",
      itens: acervoBase.produtos.map((item) => esquemaProdutoCatalogo.parse(item)),
    },
    {
      privada: "projetosPortfolio",
      publicada: "projetosPublicados",
      itens: acervoBase.projetosPortfolio.map((item) => esquemaProjetoPortfolio.parse(item)),
    },
    {
      privada: "profissionais",
      publicada: "profissionaisPublicados",
      itens: acervoBase.profissionais.map((item) => esquemaProfissionalEquipe.parse(item)),
    },
    { privada: "microfluxos", publicada: "microfluxosPublicados", itens: microfluxos },
  ];

  if (process.argv.includes("--validar")) {
    console.info("Dados de recuperação válidos: página, acervo e seis ações da vitrine.");
    return;
  }

  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  const aplicacao = initializeApp({ projectId: "demo-fluxo" }, "recuperacao-garage88");

  try {
    const banco = getFirestore(aplicacao);
    const autenticacao = getAuth(aplicacao);
    const referenciaSlug = banco.doc(`identificadoresPublicos/${IDENTIFICADOR_PUBLICO}`);
    const referenciaOrganizacao = banco.doc(`organizacoes/${ORGANIZACAO_ID}`);
    const referenciaPublicada = banco.doc(`paginasPublicadas/${ORGANIZACAO_ID}`);
    const existentes = await banco.getAll(
      referenciaSlug,
      referenciaOrganizacao,
      referenciaPublicada,
    );

    if (existentes.some((documento) => documento.exists)) {
      const membrosExistentes = await referenciaOrganizacao.collection("membros").limit(1).get();
      const uidExistente = membrosExistentes.docs[0]?.id;
      await garantirUsuarioAdministradorAutenticacao(autenticacao, uidExistente);
      console.info(
        "A Garage 88 já possui registros locais. Usuário de autenticação garantido e registros do Firestore preservados.",
      );
      return;
    }

    const usuario = await garantirUsuarioAdministradorAutenticacao(autenticacao);
    const organizacao: Organizacao = {
      id: ORGANIZACAO_ID,
      nome: "Garage 88",
      identificadorPublico: IDENTIFICADOR_PUBLICO,
      segmentoAtividade: "Concessionária de veículos",
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
      organizacaoId: ORGANIZACAO_ID,
      papel: "proprietario",
      situacao: "ativo",
      adicionadoEmIso: agoraIso,
    };
    const vinculo: VinculoOrganizacaoUsuario = {
      organizacaoId: ORGANIZACAO_ID,
      nomeOrganizacao: "Garage 88",
      identificadorPublico: IDENTIFICADOR_PUBLICO,
      papel: "proprietario",
      situacao: "ativo",
    };

    await banco.runTransaction(async (transacao) => {
      const registros = await transacao.getAll(
        referenciaSlug,
        referenciaOrganizacao,
        referenciaPublicada,
      );
      if (registros.some((documento) => documento.exists)) {
        throw new Error("Foram encontrados registros da Garage 88. Recuperação cancelada.");
      }
      transacao.create(referenciaSlug, {
        organizacaoId: ORGANIZACAO_ID,
        situacao: "ativo",
        criadoEmIso: agoraIso,
      });
      transacao.create(referenciaOrganizacao, organizacao);
      transacao.create(referenciaPublicada, removerCamposIndefinidosParaFirestore(pagina));
      transacao.create(referenciaOrganizacao.collection("membros").doc(usuario.uid), membro);
      transacao.set(
        banco.doc(`usuarios/${usuario.uid}`),
        {
          uid: usuario.uid,
          email: usuario.email,
          nome: usuario.displayName,
          atualizadoEmIso: agoraIso,
        },
        { merge: true },
      );
      transacao.create(
        banco.doc(`usuarios/${usuario.uid}/vinculosOrganizacao/${ORGANIZACAO_ID}`),
        vinculo,
      );
      transacao.create(
        referenciaOrganizacao.collection("configuracaoPagina").doc("rascunho"),
        removerCamposIndefinidosParaFirestore(
          hidratarRascunhoConfiguracaoPagina(pagina as unknown as Record<string, unknown>, {
            organizacaoId: ORGANIZACAO_ID,
            nomeOrganizacao: "Garage 88",
          }),
        ),
      );
      for (const colecao of colecoes) {
        for (const item of colecao.itens) {
          const dados = removerCamposIndefinidosParaFirestore({
            ...item,
            atualizadoEmIso: agoraIso,
          });
          transacao.create(referenciaOrganizacao.collection(colecao.privada).doc(item.id), dados);
          transacao.create(referenciaPublicada.collection(colecao.publicada).doc(item.id), dados);
        }
      }
    });
    console.info("Garage 88 recuperada no emulador local: vitrine, painel, equipe e seis ações.");
    console.info(
      "A recuperação repõe a base histórica; personalizações posteriores exigem um backup.",
    );
    console.info("Salve agora com npm run emuladores:salvar.");
  } finally {
    await deleteApp(aplicacao);
  }
}

recuperarGarage88().catch((erro: unknown) => {
  console.error(erro);
  process.exitCode = 1;
});
