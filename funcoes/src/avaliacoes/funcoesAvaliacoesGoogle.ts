import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall, type CallableRequest } from "firebase-functions/v2/https";
import { ZodError } from "zod";
import { obterAdminFuncoes } from "../seguranca/adminInicializado";
import {
  converterErroParaHttpsError,
  extrairUsuarioDeRequisicaoCallable,
} from "../seguranca/autorizadorAdminFirestore";
import { criarProvedorGooglePlaces } from "../google/adaptadorGooglePlaces";
import { executarConsultaAvaliacoesGoogleVitrine } from "./consultarAvaliacoesGoogleVitrine";
import {
  executarConsultaAvaliacoesGooglePrevia,
  executarPesquisaEstabelecimentosGoogle,
} from "./consultarAvaliacoesGooglePainel";

const chaveGooglePlaces = defineSecret("GOOGLE_PLACES_API_KEY");
const opcoes = {
  region: "southamerica-east1",
  secrets: [chaveGooglePlaces],
  timeoutSeconds: 15,
  maxInstances: 5,
};

function criarConsulta(tipo: "pesquisa" | "previa" | "vitrine") {
  return onCall(opcoes, async (requisicao: CallableRequest<unknown>) => {
    requisicao.rawRequest.res?.setHeader("Cache-Control", "no-store, private");
    try {
      const { bancoDados } = obterAdminFuncoes();
      const provedor = criarProvedorGooglePlaces(chaveGooglePlaces.value());
      const usuario = extrairUsuarioDeRequisicaoCallable(requisicao);
      if (tipo === "pesquisa")
        return await executarPesquisaEstabelecimentosGoogle(
          bancoDados,
          usuario,
          requisicao.data,
          provedor,
        );
      if (tipo === "previa")
        return await executarConsultaAvaliacoesGooglePrevia(
          bancoDados,
          usuario,
          requisicao.data,
          provedor,
        );
      return await executarConsultaAvaliacoesGoogleVitrine(bancoDados, requisicao.data, provedor);
    } catch (erro) {
      if (erro instanceof HttpsError) throw erro;
      if (erro instanceof ZodError)
        throw new HttpsError("invalid-argument", "Verifique os dados da consulta ao Google.");
      throw converterErroParaHttpsError(erro);
    }
  });
}

export const pesquisarEstabelecimentosGoogle = criarConsulta("pesquisa");
export const consultarAvaliacoesGooglePrevia = criarConsulta("previa");
export const consultarAvaliacoesGoogleVitrine = criarConsulta("vitrine");
