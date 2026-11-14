import { isDeepStrictEqual } from "node:util";
import { loadEnvConfig } from "@next/env";
import { deleteApp, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { removerCamposIndefinidosParaFirestore } from "../src/dominio/entidades/rascunhoConfiguracaoPagina";
import { esquemaConteudoPaginaPublicada } from "../src/validacoes/esquemaPaginaPublicada";
import { esquemaRascunhoConfiguracaoPagina } from "../src/validacoes/esquemaRascunhoPagina";
import { CHAMADAS_EDITORIAIS_GARAGE88 } from "../testes/fixtures/chamadasEditoriaisGarage88";

/** Atualiza somente as chamadas no emulador local, preservando as demais personalizações. */
async function atualizarChamadasGarage88(): Promise<void> {
  loadEnvConfig(process.cwd());
  if (
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_USAR_EMULADORES !== "true" ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "demo-fluxo"
  ) {
    throw new Error("A atualização exige os emuladores locais do projeto demo-fluxo.");
  }

  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  const aplicacao = initializeApp({ projectId: "demo-fluxo" }, "chamadas-garage88");
  try {
    const banco = getFirestore(aplicacao);
    const slug = await banco.doc("identificadoresPublicos/garage-88").get();
    const organizacaoId: unknown = slug.data()?.organizacaoId;
    if (typeof organizacaoId !== "string" || !organizacaoId || organizacaoId.includes("/")) {
      throw new Error("A Garage 88 precisa estar cadastrada no emulador local.");
    }

    await banco.runTransaction(async (transacao) => {
      const referenciaRascunho = banco.doc(
        `organizacoes/${organizacaoId}/configuracaoPagina/rascunho`,
      );
      const referenciaPublicada = banco.doc(`paginasPublicadas/${organizacaoId}`);
      const [rascunho, publicada] = await transacao.getAll(referenciaRascunho, referenciaPublicada);
      if (!rascunho?.exists || !publicada?.exists) {
        throw new Error("Rascunho e página publicada da Garage 88 devem existir.");
      }

      const mesmaChamada = (dados: Record<string, unknown>) =>
        isDeepStrictEqual(dados.chamadaEditorial, CHAMADAS_EDITORIAIS_GARAGE88.chamadaEditorial) &&
        isDeepStrictEqual(
          dados.chamadasEditoriaisAdicionais,
          CHAMADAS_EDITORIAIS_GARAGE88.chamadasEditoriaisAdicionais,
        );
      if (mesmaChamada(rascunho.data()!) && mesmaChamada(publicada.data()!)) {
        console.info("As três chamadas da Garage 88 já estão atualizadas.");
        return;
      }

      const atualizadoEmIso = new Date().toISOString();
      const atualizacao = { ...CHAMADAS_EDITORIAIS_GARAGE88, atualizadoEmIso };
      esquemaRascunhoConfiguracaoPagina.parse({ ...rascunho.data(), ...atualizacao });
      esquemaConteudoPaginaPublicada.parse({ ...publicada.data(), ...atualizacao });
      if (process.argv.includes("--validar")) {
        console.info("Atualização válida: três chamadas no rascunho e na vitrine da Garage 88.");
        return;
      }

      const dados = removerCamposIndefinidosParaFirestore(atualizacao);
      transacao.update(referenciaRascunho, dados);
      transacao.update(referenciaPublicada, dados);
    });
    console.info("Chamadas editoriais conferidas no emulador local da Garage 88.");
  } finally {
    await deleteApp(aplicacao);
  }
}

atualizarChamadasGarage88().catch((erro: unknown) => {
  console.error(erro);
  process.exitCode = 1;
});
