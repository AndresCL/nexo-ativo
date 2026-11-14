import {
  converterEtapaParaLivre,
  criarEtapaDadosRetorno,
} from "../src/dominio/microfluxos/composicaoEtapaLivre";
import { mkdir, writeFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { loadEnvConfig } from "@next/env";
import { deleteApp, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { atualizarDefinicaoMicrofluxoGarage88 } from "./modelos/microfluxosGarage88";
import { esquemaDefinicaoMicrofluxo } from "../src/validacoes/esquemasMicrofluxo";
import { exigirGrafoMicrofluxoValidoParaPublicacao } from "../src/dominio/microfluxos/validadorGrafoMicrofluxo";
import { removerCamposIndefinidosParaFirestore } from "../src/dominio/entidades/rascunhoConfiguracaoPagina";
import { listarCamposResumoConclusao } from "../src/dominio/microfluxos/conclusaoMicrofluxo";

async function atualizarMicrofluxosGarage88() {
  loadEnvConfig(process.cwd());
  if (
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_USAR_EMULADORES !== "true" ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "demo-fluxo"
  )
    throw new Error("A atualização exige o emulador local demo-fluxo.");
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  const app = initializeApp({ projectId: "demo-fluxo" }, "microfluxos-garage88");
  try {
    const banco = getFirestore(app);
    const slug = await banco.doc("identificadoresPublicos/garage-88").get();
    const organizacaoId: unknown = slug.data()?.organizacaoId;
    if (organizacaoId !== "org-garage88")
      throw new Error("A organização local da Garage 88 não corresponde ao modelo esperado.");
    const snapshots = await banco.collection(`organizacoes/${organizacaoId}/microfluxos`).get();
    const atualizacoes = snapshots.docs.flatMap((doc) => {
      const atual = esquemaDefinicaoMicrofluxo.parse(doc.data());
      const modelo = process.argv.includes("--dados-retorno")
        ? {
            ...atual,
            etapas: atual.etapas.map((etapa) =>
              etapa.id === "etapa-contato" && (!atual.tipoAcao || atual.tipoAcao === "microfluxo")
                ? { ...etapa, ...criarEtapaDadosRetorno(etapa.id) }
                : etapa,
            ),
          }
        : process.argv.includes("--composicao-livre")
          ? { ...atual, etapas: atual.etapas.map(converterEtapaParaLivre) }
          : atualizarDefinicaoMicrofluxoGarage88(atual);
      if (modelo === atual) return [];
      // Conclusões já personalizadas são mantidas quando suas referências continuam válidas.
      const atualizado = esquemaDefinicaoMicrofluxo.parse({
        ...modelo,
        ...(atual.conclusao ? { conclusao: atual.conclusao } : {}),
      });
      const referencias = listarCamposResumoConclusao(atualizado);
      for (const campo of [
        ...(atualizado.conclusao?.resumo.campos ?? []),
        ...(atualizado.conclusao?.camposWhatsapp ?? []),
      ]) {
        if (
          !referencias.some(
            (item) => item.etapaId === campo.etapaId && item.campoId === campo.campoId,
          )
        )
          throw new Error(
            `A conclusão de ${atual.titulo} foi personalizada e referencia campos substituídos. Revise antes de aplicar.`,
          );
      }
      exigirGrafoMicrofluxoValidoParaPublicacao(atualizado);
      return isDeepStrictEqual(atual, atualizado) ? [] : [{ doc, atual, atualizado }];
    });
    console.info(`Rascunhos a atualizar: ${atualizacoes.length}.`);
    for (const item of atualizacoes)
      console.info(`${item.atual.id}: ${item.atualizado.etapas.length} etapas revisadas.`);
    if (process.argv.includes("--validar") || atualizacoes.length === 0) return;
    const agora = new Date().toISOString();
    const pastaBackup = "/tmp/garage88-backups";
    await mkdir(pastaBackup, { recursive: true });
    const backup = `${pastaBackup}/microfluxos-${agora.replace(/[:.]/g, "-")}.json`;
    await writeFile(
      backup,
      JSON.stringify(
        atualizacoes.map(({ doc }) => ({ caminho: doc.ref.path, dados: doc.data() })),
        null,
        2,
      ),
      { mode: 0o600 },
    );
    await banco.runTransaction(async (transacao) => {
      const atuais = await transacao.getAll(...atualizacoes.map((item) => item.doc.ref));
      for (const [indice, doc] of atuais.entries()) {
        const item = atualizacoes[indice]!;
        if (!doc.updateTime?.isEqual(item.doc.updateTime))
          throw new Error(
            "Um fluxo foi alterado durante a revisão. Execute a atualização novamente.",
          );
      }
      for (const item of atualizacoes) {
        const {
          etapaInicialId,
          etapas,
          textoBotaoConclusao,
          mensagemConfirmacaoTitulo,
          mensagemConfirmacaoCorpo,
          regraCalculoComercial,
          conclusao,
        } = item.atualizado;
        transacao.update(
          item.doc.ref,
          removerCamposIndefinidosParaFirestore({
            etapaInicialId,
            etapas,
            textoBotaoConclusao,
            mensagemConfirmacaoTitulo,
            mensagemConfirmacaoCorpo,
            regraCalculoComercial,
            conclusao,
            atualizadoEmIso: agora,
          }),
        );
      }
    });
    console.info(`Rascunhos atualizados. Backup anterior: ${backup}`);
    console.info(
      "A vitrine publicada permanece na versão atual. Use Publicar alterações no painel para disponibilizar os novos percursos.",
    );
  } finally {
    await deleteApp(app);
  }
}
atualizarMicrofluxosGarage88().catch((erro: unknown) => {
  console.error(erro);
  process.exitCode = 1;
});
