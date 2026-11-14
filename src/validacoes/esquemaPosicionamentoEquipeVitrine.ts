import { z } from "zod";

export const esquemaPosicionamentoEquipeVitrine = z.object({
  desktop: z.enum(["lista_acoes", "abaixo_hero"]).optional(),
  mobile: z.enum(["lista_acoes", "antes_acoes"]).optional(),
});
