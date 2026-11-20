/**
 * Contratos segregados (ISP / DIP) para operações de gestão de conta,
 * perfil, credenciais e exclusão segura.
 */

export interface DadosAtualizacaoPerfilUsuario {
  readonly nomeExibicao: string;
}

export interface DadosAlteracaoSenhaUsuario {
  readonly senhaAtual: string;
  readonly novaSenha: string;
}

export interface DadosExclusaoContaUsuario {
  readonly senhaAtual?: string;
  readonly confirmouPerdaPeriodoRestante?: boolean;
}

export interface ResumoEstadoExclusaoConta {
  readonly podeExcluir: boolean;
  readonly bloqueadoPorAssinaturaAtiva: boolean;
  readonly canceladaComAcessoRestante: boolean;
  readonly vigenciaAteIso?: string;
  readonly motivoBloqueio?: string;
  readonly ehFundador: boolean;
}

export interface PortaGestaoContaCliente {
  atualizarPerfil(dados: DadosAtualizacaoPerfilUsuario): Promise<void>;
  alterarSenha(dados: DadosAlteracaoSenhaUsuario): Promise<void>;
  excluirContaDefinitivamente(dados?: DadosExclusaoContaUsuario): Promise<void>;
}

