import type { UsuarioAutenticado } from "@/dominio/entidades/autenticacaoEOrganizacao";
import type { DadosCriarOrganizacaoInicial } from "@/validacoes/esquemasAutenticacao";

/**
 * Contratos segregados (ISP / DIP) para operações de identidade e provisionamento
 * de organização a partir da interface web.
 */
export interface PortaAutenticacaoCliente {
  entrarComEmailESenha(email: string, senha: string): Promise<UsuarioAutenticado>;
  cadastrarComEmailESenha(
    nomeExibicao: string,
    email: string,
    senha: string,
  ): Promise<UsuarioAutenticado>;
  entrarComGoogle(): Promise<UsuarioAutenticado>;
  solicitarRecuperacaoSenha(email: string): Promise<void>;
  confirmarRedefinicaoSenha(codigoAcao: string, novaSenha: string): Promise<void>;
  validarCodigoRedefinicaoSenha(codigoAcao: string): Promise<string>;
  reenviarVerificacaoEmail(): Promise<void>;
  recarregarEstadoUsuario(): Promise<UsuarioAutenticado | null>;
  forcarAtualizacaoTokenSessao(): Promise<void>;
  encerrarSessao(): Promise<void>;
}

export interface ResultadoCriacaoOrganizacao {
  readonly organizacaoId: string;
  readonly identificadorPublico: string;
}

export interface PortaProvisionamentoOrganizacaoCliente {
  criarOrganizacaoInicial(
    dados: DadosCriarOrganizacaoInicial,
  ): Promise<ResultadoCriacaoOrganizacao>;
  verificarDisponibilidadeIdentificador?(
    identificadorPublico: string,
  ): Promise<boolean>;
}
