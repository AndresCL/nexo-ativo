import { z } from "zod";

const esquemaUrlSegura = z
  .string()
  .url()
  .refine((valor) => valor.startsWith("https://"));
const esquemaTexto = z.object({ text: z.string() });

export const esquemaEstabelecimentoGooglePlaces = z.object({
  id: z.string().min(1),
  displayName: esquemaTexto,
  formattedAddress: z.string().optional(),
  googleMapsUri: esquemaUrlSegura.optional(),
  attributions: z
    .array(
      z.object({
        provider: z.string(),
        providerUri: esquemaUrlSegura.optional(),
      }),
    )
    .default([]),
});

export const esquemaDetalhesGooglePlaces = esquemaEstabelecimentoGooglePlaces.extend({
  rating: z.number().min(1).max(5).optional(),
  userRatingCount: z.number().int().nonnegative().default(0),
  reviews: z
    .array(
      z.object({
        name: z.string().optional(),
        rating: z.number().int().min(1).max(5),
        text: esquemaTexto.optional(),
        originalText: esquemaTexto.optional(),
        publishTime: z.string().datetime().optional(),
        relativePublishTimeDescription: z.string().optional(),
        googleMapsUri: esquemaUrlSegura.optional(),
        authorAttribution: z.object({
          displayName: z.string(),
          uri: esquemaUrlSegura.optional(),
          photoUri: esquemaUrlSegura.optional(),
        }),
      }),
    )
    .default([]),
});

export const esquemaPesquisaGooglePlaces = z.object({
  places: z.array(esquemaEstabelecimentoGooglePlaces).default([]),
});
