import { z } from "zod";
import { esquemaIdentificadorPublico } from "./esquemasComuns";

export const esquemaEntrarComEmail = z.object({
  email: z
    .string({ required_error: "Informe seu endereço de e-mail." })
    .trim()
    .email("Informe um endereço de e-mail válido."),
  senha: z
    .string({ required_error: "Informe sua senha." })
    .min(8, "A senha possui pelo menos 8 caracteres."),
});

export type DadosEntrarComEmail = z.infer<typeof esquemaEntrarComEmail>;

export const esquemaCriarContaEmail = z
  .object({
    nomeExibicao: z
      .string({ required_error: "Informe seu nome." })
      .trim()
      .min(2, "Informe pelo menos 2 caracteres para seu nome.")
      .max(80, "O nome pode ter no máximo 80 caracteres."),
    email: z
      .string({ required_error: "Informe seu endereço de e-mail." })
      .trim()
      .email("Informe um endereço de e-mail válido."),
    senha: z
      .string({ required_error: "Crie uma senha de acesso." })
      .min(8, "Crie uma senha com pelo menos 8 caracteres."),
    confirmacaoSenha: z.string({ required_error: "Confirme sua senha." }),
  })
  .refine((dados) => dados.senha === dados.confirmacaoSenha, {
    message: "A confirmação de senha não coincide com a senha digitada.",
    path: ["confirmacaoSenha"],
  });

export type DadosCriarContaEmail = z.infer<typeof esquemaCriarContaEmail>;

export const esquemaRecuperarSenha = z.object({
  email: z
    .string({ required_error: "Informe seu endereço de e-mail." })
    .trim()
    .email("Informe um endereço de e-mail válido."),
});

export type DadosRecuperarSenha = z.infer<typeof esquemaRecuperarSenha>;

export const esquemaCriarOrganizacaoInicial = z.object({
  nome: z
    .string({ required_error: "Informe o nome da sua empresa ou atuação profissional." })
    .trim()
    .min(2, "Informe ao menos 2 caracteres.")
    .max(80, "Use no máximo 80 caracteres."),
  identificadorPublico: esquemaIdentificadorPublico,
  segmentoAtividade: z
    .string({ required_error: "Informe seu segmento principal de atuação." })
    .trim()
    .min(2, "Informe seu segmento de atuação.")
    .max(60, "Use no máximo 60 caracteres."),
});

export type DadosCriarOrganizacaoInicial = z.infer<typeof esquemaCriarOrganizacaoInicial>;
