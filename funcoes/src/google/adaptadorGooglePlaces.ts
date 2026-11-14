import { HttpsError } from "firebase-functions/v2/https";
import type { PortaProvedorAvaliacoesGoogle } from "../../../src/aplicacao/portas/portasAvaliacoesGoogle";
import {
  construirUrlLocalGoogle,
  type EstabelecimentoGoogle,
} from "../../../src/dominio/entidades/avaliacoesGoogle";
import { esquemaDetalhesGooglePlaces, esquemaPesquisaGooglePlaces } from "./esquemasGooglePlaces";
import type { esquemaEstabelecimentoGooglePlaces } from "./esquemasGooglePlaces";
import type { z } from "zod";

function converterEstabelecimento(
  dados: z.infer<typeof esquemaEstabelecimentoGooglePlaces>,
): EstabelecimentoGoogle {
  return {
    identificadorLocal: dados.id,
    nome: dados.displayName.text,
    endereco: dados.formattedAddress ?? "",
    urlGoogleMaps: dados.googleMapsUri ?? construirUrlLocalGoogle(dados.id),
    atribuicoes: dados.attributions.map((atribuicao) => ({
      nome: atribuicao.provider,
      ...(atribuicao.providerUri ? { url: atribuicao.providerUri } : {}),
    })),
  };
}

export function criarProvedorGooglePlaces(
  chave: string,
  requisitar: typeof fetch = fetch,
): PortaProvedorAvaliacoesGoogle {
  async function consultar(caminho: string, campos: string, corpo?: object): Promise<unknown> {
    if (!chave.trim()) {
      throw new HttpsError(
        "failed-precondition",
        "As avaliações do Google ainda não foram configuradas na plataforma.",
      );
    }
    try {
      const resposta = await requisitar(`https://places.googleapis.com/v1/${caminho}`, {
        method: corpo ? "POST" : "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": chave,
          "X-Goog-FieldMask": campos,
        },
        ...(corpo ? { body: JSON.stringify(corpo) } : {}),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!resposta.ok) throw new Error("Consulta externa indisponível.");
      return await resposta.json();
    } catch {
      throw new HttpsError(
        "unavailable",
        "Não foi possível consultar o Google agora. Tente novamente mais tarde.",
      );
    }
  }

  return {
    async pesquisarEstabelecimentos(consulta) {
      const resposta = await consultar(
        "places:searchText",
        "places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.attributions",
        { textQuery: consulta, languageCode: "pt-BR", regionCode: "BR", pageSize: 5 },
      );
      const dados = esquemaPesquisaGooglePlaces.safeParse(resposta);
      if (!dados.success)
        throw new HttpsError(
          "unavailable",
          "O Google retornou uma resposta inválida. Tente novamente.",
        );
      return dados.data.places.map(converterEstabelecimento);
    },
    async consultarAvaliacoes(identificadorLocal) {
      const resposta = await consultar(
        `places/${encodeURIComponent(identificadorLocal)}?languageCode=pt-BR`,
        "id,displayName,formattedAddress,googleMapsUri,rating,userRatingCount,reviews,attributions",
      );
      const dados = esquemaDetalhesGooglePlaces.safeParse(resposta);
      if (!dados.success || dados.data.id !== identificadorLocal) {
        throw new HttpsError(
          "unavailable",
          "Não foi possível validar as avaliações deste estabelecimento.",
        );
      }
      const local = dados.data;
      return {
        ...converterEstabelecimento(local),
        ...(local.rating !== undefined ? { notaMedia: local.rating } : {}),
        totalAvaliacoes: local.userRatingCount,
        avaliacoes: local.reviews.slice(0, 5).map((avaliacao, indice) => ({
          id: avaliacao.name ?? `${identificadorLocal}-${indice}`,
          autor: avaliacao.authorAttribution.displayName,
          ...(avaliacao.authorAttribution.uri ? { urlAutor: avaliacao.authorAttribution.uri } : {}),
          ...(avaliacao.authorAttribution.photoUri
            ? { urlFotoAutor: avaliacao.authorAttribution.photoUri }
            : {}),
          nota: avaliacao.rating,
          texto: avaliacao.originalText?.text ?? avaliacao.text?.text ?? "",
          ...(avaliacao.publishTime ? { publicadaEmIso: avaliacao.publishTime } : {}),
          ...(avaliacao.relativePublishTimeDescription
            ? { descricaoData: avaliacao.relativePublishTimeDescription }
            : {}),
          ...(avaliacao.googleMapsUri ? { urlAvaliacao: avaliacao.googleMapsUri } : {}),
        })),
      };
    },
  };
}
