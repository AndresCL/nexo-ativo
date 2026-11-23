import { ErroConflitoDominio, ErroDominio } from "@/dominio/erros/errosDominio";

interface ErroComCodigoExterno {
  readonly code?: string;
  readonly message?: string;
}

/**
 * Traduz códigos de erro técnicos do Firebase Authentication e Cloud Functions
 * para erros de domínio claros e seguros em português brasileiro (DIP / SRP).
 */
export function traduzirErroAutenticacaoFirebase(erroDesconhecido: unknown): ErroDominio {
  if (erroDesconhecido instanceof ErroDominio) {
    return erroDesconhecido;
  }

  const codigo = (erroDesconhecido as ErroComCodigoExterno | null)?.code ?? "";

  switch (codigo) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return new ErroDominio(
        "CREDENCIAIS_INVALIDAS",
        "E-mail ou senha incorretos. Verifique os dados informados e tente novamente.",
      );

    case "auth/email-already-in-use":
      return new ErroConflitoDominio(
        "Já existe uma conta cadastrada com este endereço de e-mail. Entre na sua conta ou recupere sua senha.",
        "EMAIL_JA_CADASTRADO",
      );

    case "auth/account-exists-with-different-credential":
      return new ErroConflitoDominio(
        "Este e-mail já está vinculado a outro método de acesso (por exemplo, senha ou Google). Por segurança, entre pelo método original primeiro para vincular novos acessos.",
        "CONTA_VINCULADA_OUTRO_PROVEDOR",
      );

    case "auth/weak-password":
      return new ErroDominio(
        "SENHA_FRACA",
        "Escolha uma senha mais segura, com pelo menos 8 caracteres.",
      );

    case "auth/expired-action-code":
      return new ErroDominio(
        "LINK_ACAO_EXPIRADO",
        "Este link de confirmação expirou. Solicite um novo e-mail de confirmação.",
      );

    case "auth/invalid-action-code":
      return new ErroDominio(
        "LINK_ACAO_INVALIDO",
        "Este link de confirmação é inválido ou já foi utilizado.",
      );

    case "auth/too-many-requests":
      return new ErroDominio(
        "LIMITE_TENTATIVAS_EXCEDIDO",
        "Muitas tentativas seguidas foram identificadas. Aguarde alguns instantes antes de tentar novamente.",
      );

    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return new ErroDominio(
        "AUTENTICACAO_CANCELADA",
        "A janela de autenticação com Google foi fechada antes da conclusão.",
      );

    case "auth/network-request-failed":
      return new ErroDominio(
        "FALHA_CONEXAO_REDE",
        "Não foi possível conectar ao serviço de autenticação. Verifique sua conexão.",
      );

    case "functions/already-exists":
      return new ErroConflitoDominio(
        "Este endereço público já está sendo utilizado por outra organização. Escolha outra opção.",
        "ENDERECO_PUBLICO_INDISPONIVEL",
      );

    case "functions/invalid-argument":
    case "functions/failed-precondition":
    case "functions/permission-denied":
    case "functions/unauthenticated": {
      const mensagemEspecifica = (erroDesconhecido as ErroComCodigoExterno | null)?.message;
      return new ErroDominio(
        codigo.replace("functions/", "ERRO_").toUpperCase(),
        mensagemEspecifica && !mensagemEspecifica.startsWith("INTERNAL")
          ? mensagemEspecifica
          : "Não foi possível validar as informações da página para publicação. Verifique os campos obrigatórios.",
      );
    }

    case "permission-denied":
      return new ErroDominio(
        "PERMISSAO_NEGADA",
        "Você não possui permissão para salvar alterações nesta organização ou sua sessão expirou. Tente recarregar a página ou entrar novamente.",
      );

    case "unauthenticated":
      return new ErroDominio(
        "USUARIO_NAO_AUTENTICADO",
        "Sua sessão expirou. Entre novamente na sua conta para continuar editando.",
      );

    case "unavailable":
      return new ErroDominio(
        "SERVICO_INDISPONIVEL",
        "O serviço está temporariamente indisponível ou você está sem conexão com a internet. Verifique sua rede e tente novamente.",
      );

    case "resource-exhausted":
      return new ErroDominio(
        "LIMITE_EXCEDIDO",
        "Limite de operações temporariamente excedido. Aguarde alguns instantes antes de tentar novamente.",
      );

    case "invalid-argument": {
      const mensagemEspecifica = (erroDesconhecido as ErroComCodigoExterno | null)?.message;
      return new ErroDominio(
        "DADOS_INVALIDOS",
        mensagemEspecifica || "Os dados enviados contêm campos em formato inválido.",
      );
    }

    default:
      if (process.env.NODE_ENV !== "production") {
        console.error("[Firebase/Firestore] Erro não mapeado capturado:", erroDesconhecido);
      }
      return new ErroDominio(
        "ERRO_OPERACAO_INESPERADO",
        "Não foi possível concluir a operação agora. Tente novamente em instantes.",
      );
  }
}
