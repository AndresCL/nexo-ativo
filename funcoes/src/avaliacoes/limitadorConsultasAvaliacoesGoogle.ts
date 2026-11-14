import type { Firestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

interface LimitesConsultas {
  readonly porMinuto: number;
  readonly porMes: number;
  readonly globalPorMes: number;
}

export const LIMITES_CONSULTAS_AVALIACOES_GOOGLE: LimitesConsultas = {
  porMinuto: 30,
  porMes: 3000,
  globalPorMes: 20000,
};

/** Guarda somente contadores. A reserva antecede a chamada externa e não é reembolsada em falhas. */
export async function reservarConsultaAvaliacoesGoogle(
  bancoDados: Firestore,
  organizacaoId: string,
  agora = new Date(),
  limites = LIMITES_CONSULTAS_AVALIACOES_GOOGLE,
): Promise<void> {
  const mes = agora.toISOString().slice(0, 7);
  const minuto = Math.floor(agora.getTime() / 60000);
  const referenciaOrganizacao = bancoDados.collection("consumoAvaliacoesGoogle").doc(organizacaoId);
  const referenciaGlobal = bancoDados.collection("consumoAvaliacoesGoogle").doc("_plataforma");

  await bancoDados.runTransaction(async (transacao) => {
    const [instantaneoOrg, instantaneoGlobal] = await Promise.all([
      transacao.get(referenciaOrganizacao),
      transacao.get(referenciaGlobal),
    ]);
    const dadosOrg = instantaneoOrg.data();
    const dadosGlobal = instantaneoGlobal.data();
    const usoMinuto = dadosOrg?.minuto === minuto ? Number(dadosOrg.consultasMinuto ?? 0) : 0;
    const usoMes = dadosOrg?.mes === mes ? Number(dadosOrg.consultasMes ?? 0) : 0;
    const usoGlobal = dadosGlobal?.mes === mes ? Number(dadosGlobal.consultasMes ?? 0) : 0;
    if (
      usoMinuto >= limites.porMinuto ||
      usoMes >= limites.porMes ||
      usoGlobal >= limites.globalPorMes
    ) {
      throw new HttpsError(
        "resource-exhausted",
        "O limite de consultas ao Google foi atingido. Acesse as avaliações diretamente no Google.",
      );
    }
    transacao.set(referenciaOrganizacao, {
      mes,
      minuto,
      consultasMinuto: usoMinuto + 1,
      consultasMes: usoMes + 1,
    });
    transacao.set(referenciaGlobal, { mes, consultasMes: usoGlobal + 1 });
  });
}
