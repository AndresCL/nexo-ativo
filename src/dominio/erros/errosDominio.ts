/**
 * Hierarquia de erros puros do núcleo de domínio.
 * Respeita o Princípio da Substituição de Liskov (LSP): qualquer erro específico
 * de domínio pode ser tratado de forma previsível como ErroDominio pelas camadas superiores.
 */
export class ErroDominio extends Error {
  public readonly codigo: string;

  public constructor(codigo: string, mensagem: string) {
    super(mensagem);
    this.name = new.target.name;
    this.codigo = codigo;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ErroValidacaoDominio extends ErroDominio {
  public constructor(mensagem: string, codigo = "ERRO_VALIDACAO_DOMINIO") {
    super(codigo, mensagem);
  }
}

export class ErroIdentificadorReservado extends ErroValidacaoDominio {
  public constructor(identificador: string) {
    super(
      `O identificador "${identificador}" é reservado pela plataforma e não pode ser utilizado por uma organização.`,
      "IDENTIFICADOR_PUBLICO_RESERVADO",
    );
  }
}

export class ErroOperacaoMonetaria extends ErroValidacaoDominio {
  public constructor(mensagem: string) {
    super(mensagem, "ERRO_OPERACAO_MONETARIA");
  }
}

export class ErroNaoAutenticado extends ErroDominio {
  public constructor(mensagem = "É necessário entrar na sua conta para realizar esta operação.") {
    super("USUARIO_NAO_AUTENTICADO", mensagem);
  }
}

export class ErroAcessoNegado extends ErroDominio {
  public constructor(
    mensagem = "Você não possui permissão para acessar ou alterar dados desta organização.",
    codigo = "ACESSO_NEGADO",
  ) {
    super(codigo, mensagem);
  }
}

export class ErroConflitoDominio extends ErroDominio {
  public constructor(mensagem: string, codigo = "CONFLITO_DOMINIO") {
    super(codigo, mensagem);
  }
}
