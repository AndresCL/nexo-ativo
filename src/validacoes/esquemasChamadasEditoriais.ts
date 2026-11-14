import { z } from "zod";
import { LIMITE_MAXIMO_CHAMADAS_EDITORIAIS } from "../dominio/entidades/chamadasEditoriais";

export const esquemaChamadaEditorial = z.object({
  sobretituloOpcional: z.string().max(90).optional(),
  tituloPrincipal: z
    .string()
    .trim()
    .min(4, "Informe um título editorial com pelo menos 4 caracteres.")
    .max(180),
  descricaoCurta: z.string().max(320).optional(),
  rotuloCta: z.string().max(60).optional(),
  fluxoId: z.string().max(80).optional(),
});

export const esquemaChamadasEditoriaisAdicionais = z
  .array(esquemaChamadaEditorial)
  .max(LIMITE_MAXIMO_CHAMADAS_EDITORIAIS - 1, "Utilize no máximo 3 chamadas editoriais.")
  .optional();
