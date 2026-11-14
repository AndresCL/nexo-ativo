import type {
  AcervoPublicoVitrine,
  ProfissionalEquipe,
  ServicoOrganizacao,
} from "@/dominio/entidades/catalogoConteudo";
import type { ConteudoPaginaPublicada } from "@/dominio/entidades/paginaPublicada";

export interface PacoteVitrinePublicada {
  readonly pagina: ConteudoPaginaPublicada;
  readonly acervo: AcervoPublicoVitrine;
}

export interface DadosCartaoProfissionalPublico {
  readonly paginaOrganizacao: ConteudoPaginaPublicada;
  readonly profissional: ProfissionalEquipe;
  readonly servicosAtivos: readonly ServicoOrganizacao[];
  readonly acervo?: AcervoPublicoVitrine;
}

/**
 * Porta segregada (ISP / DIP) para leitura da projeção pública publicada de uma organização,
 * seu acervo ativo e os cartões digitais individuais de sua equipe.
 */
export interface PortaLeitorPaginaPublicada {
  buscarPorIdentificadorPublico(
    identificadorPublico: string,
  ): Promise<ConteudoPaginaPublicada | null>;

  buscarVitrineCompletaPorIdentificador(
    identificadorPublico: string,
  ): Promise<PacoteVitrinePublicada | null>;

  buscarCartaoProfissionalPublico(
    identificadorOrganizacao: string,
    identificadorCartao: string,
  ): Promise<DadosCartaoProfissionalPublico | null>;
}
