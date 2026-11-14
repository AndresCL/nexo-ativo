import type { Firestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import type { PortaProvedorAvaliacoesGoogle } from "../../../src/aplicacao/portas/portasAvaliacoesGoogle";
import {
  esquemaConsultaAvaliacoesGoogleVitrine,
  esquemaConfiguracaoAvaliacoesGoogle,
} from "../../../src/validacoes/esquemasAvaliacoesGoogle";
import { reservarConsultaAvaliacoesGoogle } from "./limitadorConsultasAvaliacoesGoogle";

export async function executarConsultaAvaliacoesGoogleVitrine(
  bancoDados: Firestore,
  entrada: unknown,
  provedor: PortaProvedorAvaliacoesGoogle,
  reservarConsulta = reservarConsultaAvaliacoesGoogle,
) {
  const { identificadorPublico } = esquemaConsultaAvaliacoesGoogleVitrine.parse(entrada);
  const indice = await bancoDados
    .collection("identificadoresPublicos")
    .doc(identificadorPublico)
    .get();
  const dadosIndice = indice.data();
  const organizacaoId = dadosIndice?.organizacaoId;
  if (
    typeof organizacaoId !== "string" ||
    !organizacaoId ||
    organizacaoId.includes("/") ||
    dadosIndice?.situacao === "inativo" ||
    dadosIndice?.situacao === "suspenso"
  ) {
    throw new HttpsError("not-found", "Esta vitrine não está disponível.");
  }
  const [pagina, organizacao] = await Promise.all([
    bancoDados.collection("paginasPublicadas").doc(organizacaoId).get(),
    bancoDados.collection("organizacoes").doc(organizacaoId).get(),
  ]);
  const dadosPagina = pagina.data();
  const configuracao = esquemaConfiguracaoAvaliacoesGoogle.safeParse(dadosPagina?.avaliacoesGoogle);
  if (
    organizacao.data()?.situacao !== "ativa" ||
    dadosPagina?.publicado !== true ||
    dadosPagina?.paginaAtiva !== true ||
    dadosPagina?.identificadorPublico !== identificadorPublico ||
    !configuracao.success ||
    !configuracao.data.habilitado ||
    !configuracao.data.identificadorLocal
  ) {
    throw new HttpsError("not-found", "As avaliações não estão disponíveis nesta vitrine.");
  }
  await reservarConsulta(bancoDados, organizacaoId);
  return provedor.consultarAvaliacoes(configuracao.data.identificadorLocal);
}
