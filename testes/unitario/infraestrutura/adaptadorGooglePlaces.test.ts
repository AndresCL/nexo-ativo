import { describe, expect, it, vi } from "vitest";
import { criarProvedorGooglePlaces } from "../../../funcoes/src/google/adaptadorGooglePlaces";

const detalhesGoogle = {
  id: "ChIJ_serena",
  displayName: { text: "Clínica Serena" },
  formattedAddress: "São Paulo",
  rating: 4.7,
  userRatingCount: 128,
  attributions: [{ provider: "Provedor de dados", providerUri: "https://example.com" }],
  reviews: [
    {
      name: "places/ChIJ_serena/reviews/123",
      rating: 5,
      text: { text: "Tradução" },
      originalText: { text: "Original review" },
      authorAttribution: { displayName: "Maria", uri: "https://www.google.com/maps/contrib/123" },
    },
  ],
};

describe("Adaptador Google Places", () => {
  it("preserva média geral, autoria, texto original e atribuições sem usar a média da seleção", async () => {
    const requisitar = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(detalhesGoogle)));
    const resumo = await criarProvedorGooglePlaces(
      "chave-de-teste",
      requisitar,
    ).consultarAvaliacoes("ChIJ_serena");
    expect(resumo).toMatchObject({
      notaMedia: 4.7,
      totalAvaliacoes: 128,
      avaliacoes: [{ autor: "Maria", nota: 5, texto: "Original review" }],
      atribuicoes: [{ nome: "Provedor de dados", url: "https://example.com" }],
    });
    const [url, opcoes] = requisitar.mock.calls[0]!;
    expect(url).toContain("places/ChIJ_serena?languageCode=pt-BR");
    expect(opcoes).toMatchObject({
      cache: "no-store",
      headers: { "X-Goog-Api-Key": "chave-de-teste" },
    });
  });

  it("pesquisa somente os campos necessários e trata resultados vazios", async () => {
    const requisitar = vi.fn<typeof fetch>().mockResolvedValue(new Response("{}"));
    await expect(
      criarProvedorGooglePlaces("chave", requisitar).pesquisarEstabelecimentos("Clínica São Paulo"),
    ).resolves.toEqual([]);
    expect(requisitar.mock.calls[0]?.[1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({
        textQuery: "Clínica São Paulo",
        languageCode: "pt-BR",
        regionCode: "BR",
        pageSize: 5,
      }),
    });
  });

  it.each([
    { ...detalhesGoogle, id: "ChIJ_outro" },
    { ...detalhesGoogle, googleMapsUri: "javascript:alert(1)" },
    { ...detalhesGoogle, googleMapsUri: "endereco invalido" },
    { ...detalhesGoogle, rating: 8 },
  ])("rejeita conteúdo inválido antes da exibição", async (dados) => {
    const requisitar = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(dados)));
    await expect(
      criarProvedorGooglePlaces("chave", requisitar).consultarAvaliacoes("ChIJ_serena"),
    ).rejects.toMatchObject({ code: "unavailable" });
  });

  it("retorna erro sanitizado para falhas HTTP e não chama o Google sem chave", async () => {
    const requisitar = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("credenciais privadas", { status: 403 }));
    await expect(
      criarProvedorGooglePlaces("chave", requisitar).consultarAvaliacoes("ChIJ_serena"),
    ).rejects.toMatchObject({ code: "unavailable" });
    requisitar.mockClear();
    await expect(
      criarProvedorGooglePlaces("", requisitar).consultarAvaliacoes("ChIJ_serena"),
    ).rejects.toMatchObject({ code: "failed-precondition" });
    expect(requisitar).not.toHaveBeenCalled();
  });
});
