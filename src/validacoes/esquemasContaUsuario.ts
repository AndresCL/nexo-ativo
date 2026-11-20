import { z } from "zod";

export const TEXTO_CONFIRMACAO_EXCLUSAO_CONTA = "EXCLUIR DEFINITIVAMENTE";

export const esquemaAtualizarPerfilUsuario = z.object({
  nomeExibicao: z
    .string({ required_error: "Informe seu nome." })
    .trim()
    .min(2, "O nome deve conter pelo menos 2 caracteres.")
    .max(80, "O nome pode ter no máximo 80 caracteres."),
});

export type FormularioAtualizarPerfilUsuario = z.infer<typeof esquemaAtualizarPerfilUsuario>;

export const esquemaAlterarSenhaUsuario = z
  .object({
    senhaAtual: z
      .string({ required_error: "Informe sua senha atual." })
      .trim()
      .min(1, "Informe sua senha atual."),
    novaSenha: z
      .string({ required_error: "Informe sua nova senha." })
      .trim()
      .min(8, "A nova senha deve ter pelo menos 8 caracteres."),
    confirmacaoNovaSenha: z
      .string({ required_error: "Confirme sua nova senha." })
      .trim(),
  })
  .refine((dados) => dados.novaSenha === dados.confirmacaoNovaSenha, {
    message: "A confirmação de senha não coincide com a nova senha digitada.",
    path: ["confirmacaoNovaSenha"],
  })
  .refine((dados) => dados.senhaAtual !== dados.novaSenha, {
    message: "A nova senha deve ser diferente da senha atual.",
    path: ["novaSenha"],
  });

export type FormularioAlterarSenhaUsuario = z.infer<typeof esquemaAlterarSenhaUsuario>;

export const esquemaExclusaoContaRequisicao = z.object({
  senhaAtual: z.string().optional(),
  confirmouPerdaPeriodoRestante: z.boolean().optional(),
});

export type RequisicaoExclusaoConta = z.infer<typeof esquemaExclusaoContaRequisicao>;

