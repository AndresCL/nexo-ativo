import { z } from "zod";
import {
  COMPRIMENTO_MAXIMO_IDENTIFICADOR,
  COMPRIMENTO_MINIMO_IDENTIFICADOR,
  IDENTIFICADORES_RESERVADOS,
} from "@/dominio/objetos-valor/identificadorPublico";

export const esquemaIdentificadorPublico = z
  .string({
    required_error: "Informe o endereço público desejado.",
  })
  .trim()
  .min(
    COMPRIMENTO_MINIMO_IDENTIFICADOR,
    `Use pelo menos ${COMPRIMENTO_MINIMO_IDENTIFICADOR} caracteres.`,
  )
  .max(
    COMPRIMENTO_MAXIMO_IDENTIFICADOR,
    `Use no máximo ${COMPRIMENTO_MAXIMO_IDENTIFICADOR} caracteres.`,
  )
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use apenas letras minúsculas sem acento, números e hífens simples.",
  )
  .refine(
    (valor) => !IDENTIFICADORES_RESERVADOS.has(valor),
    "Este endereço é reservado pela plataforma. Escolha outra opção.",
  );

export const esquemaPreCadastroInteresse = z.object({
  nomeOrganizacao: z
    .string({ required_error: "Informe o nome do seu escritório, marca ou atuação." })
    .trim()
    .min(2, "Informe ao menos 2 caracteres para o nome.")
    .max(80, "O nome pode ter no máximo 80 caracteres."),
  identificadorPublico: esquemaIdentificadorPublico,
});

export type DadosPreCadastroInteresse = z.infer<typeof esquemaPreCadastroInteresse>;
