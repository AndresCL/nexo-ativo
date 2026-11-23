import type {
  PortaPublicacaoPaginaCliente,
  PortaUploadMidiaEditorial,
} from "./portasEditorAparencia";
import type {
  ProdutoCatalogo,
  ProfissionalEquipe,
  ProjetoPortfolio,
  ServicoOrganizacao,
} from "@/dominio/entidades/catalogoConteudo";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import type { PosicaoCabecalhoMarca } from "@/dominio/editorial/faixaInicioExperiencias";
import type { IdentificadorBlocoSistemaVitrine } from "@/dominio/editorial/ordemBlocosVitrine";

export interface ParcialBlocosSistemaVitrine {
  readonly ordemBlocosVitrine: readonly string[];
  readonly blocosSistemaOcultos: readonly IdentificadorBlocoSistemaVitrine[];
  readonly posicaoCabecalhoMarca: PosicaoCabecalhoMarca;
  readonly avaliacoesGoogleHabilitado?: boolean;
}

export interface PortaPersistenciaServicosCliente {
  salvarServico(servico: ServicoOrganizacao): Promise<void>;
}

export interface PortaPersistenciaProdutosCliente {
  salvarProduto(produto: ProdutoCatalogo): Promise<void>;
}

export interface PortaPersistenciaPortfolioCliente {
  salvarProjetoPortfolio(projeto: ProjetoPortfolio): Promise<void>;
}

export interface PortaPersistenciaEquipeCliente {
  salvarProfissional(profissional: ProfissionalEquipe): Promise<void>;
  excluirProfissional(organizacaoId: string, profissionalId: string): Promise<void>;
}

export interface PortaPersistenciaMicrofluxosCliente {
  salvarMicrofluxo(microfluxo: DefinicaoMicrofluxo): Promise<void>;
  salvarOrdemMicrofluxos?(microfluxos: readonly DefinicaoMicrofluxo[]): Promise<void>;
  salvarRascunhoExperiencias(
    organizacaoId: string,
    alteradas: readonly DefinicaoMicrofluxo[],
    idsExcluidos: readonly string[],
  ): Promise<void>;
  salvarOrdemEBlocosSistemaVitrine?(
    organizacaoId: string,
    parcial: ParcialBlocosSistemaVitrine,
  ): Promise<void>;
}

export interface ServicoCatalogoConteudoPorta
  extends
    PortaPersistenciaServicosCliente,
    PortaPersistenciaProdutosCliente,
    PortaPersistenciaPortfolioCliente,
    PortaPersistenciaEquipeCliente,
    PortaPersistenciaMicrofluxosCliente,
    PortaUploadMidiaEditorial,
    PortaPublicacaoPaginaCliente {}
