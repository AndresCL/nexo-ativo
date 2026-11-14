"use client";

import { httpsCallable } from "firebase/functions";
import type { PortaAvaliacoesGoogleCliente } from "@/aplicacao/portas/portasAvaliacoesGoogle";
import type {
  EstabelecimentoGoogle,
  ResumoAvaliacoesGoogle,
} from "@/dominio/entidades/avaliacoesGoogle";
import { obterServicosClienteFirebase } from "@/infraestrutura/firebase/clienteFirebase";

async function chamarFuncao<Resposta>(nome: string, dados: object): Promise<Resposta> {
  const { funcoesRemotas } = obterServicosClienteFirebase();
  const consultar = httpsCallable<object, Resposta>(funcoesRemotas, nome, { timeout: 20000 });
  const resposta = await consultar(dados);
  return resposta.data;
}

export const servicoAvaliacoesGoogleCliente: PortaAvaliacoesGoogleCliente = {
  pesquisar: (organizacaoId, consulta) =>
    chamarFuncao<readonly EstabelecimentoGoogle[]>("pesquisarEstabelecimentosGoogle", {
      organizacaoId,
      consulta,
    }),
  consultar: (origem) =>
    origem.tipo === "publicada"
      ? chamarFuncao<ResumoAvaliacoesGoogle>("consultarAvaliacoesGoogleVitrine", {
          identificadorPublico: origem.identificadorPublico,
        })
      : chamarFuncao<ResumoAvaliacoesGoogle>("consultarAvaliacoesGooglePrevia", {
          organizacaoId: origem.organizacaoId,
          identificadorLocal: origem.identificadorLocal,
        }),
};
