import { z } from "zod";

export const esquemaCustomizacaoTokensEditorial = z.object({
  corFundoPrincipal: z.string().optional(),
  corSuperficie: z.string().optional(),
  corTextoPrincipal: z.string().optional(),
  corTextoSecundario: z.string().optional(),
  corDestaque: z.string().optional(),
  corBorda: z.string().optional(),
  corCtaFundo: z.string().optional(),
  corCtaTexto: z.string().optional(),
  corSecundarioFundo: z.string().optional(),
  corSecundarioTexto: z.string().optional(),
  corLogoTitulo: z.string().optional(),
  corLogoSubtitulo: z.string().optional(),
  modoFundoEquipe: z.enum(["transparente", "fixo"]).optional(),
  corEquipeTextoPrincipal: z.string().optional(),
  corEquipeTextoSecundario: z.string().optional(),
  corBottomSheetFundo: z.string().optional(),
  corBottomSheetSuperficie: z.string().optional(),
  corBottomSheetBorda: z.string().optional(),
  corBottomSheetTextoPrincipal: z.string().optional(),
  corBottomSheetTextoSecundario: z.string().optional(),
  corBottomSheetDestaque: z.string().optional(),
  corBottomSheetCtaFundo: z.string().optional(),
  corBottomSheetCtaTexto: z.string().optional(),
  corBrilhoBorda: z.string().optional(),
});

