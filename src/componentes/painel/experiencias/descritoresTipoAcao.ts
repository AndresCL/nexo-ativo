import type { IdentificadorBlocoSistemaVitrine } from "@/dominio/editorial/ordemBlocosVitrine";
import type { DefinicaoMicrofluxo, TipoAcaoVitrine } from "@/dominio/microfluxos/tiposMicrofluxo";

export type GrupoTipoAcaoVitrine = "interacao" | "conteudo" | "contato";

export interface DescritorTipoAcaoVitrine {
  readonly rotulo: string;
  readonly iconeBadge: string;
  readonly descricaoCurta: string;
  readonly grupo: GrupoTipoAcaoVitrine;
}

export const ORDEM_GRUPOS_TIPO_ACAO: readonly GrupoTipoAcaoVitrine[] = [
  "interacao",
  "conteudo",
  "contato",
];

export const ROTULOS_GRUPO_TIPO_ACAO: Record<GrupoTipoAcaoVitrine, string> = {
  interacao: "Interação e conversão",
  conteudo: "Catálogo e conteúdo",
  contato: "Contato e links",
};

export const DESCRITORES_TIPO_ACAO: Record<TipoAcaoVitrine, DescritorTipoAcaoVitrine> = {
  microfluxo: {
    rotulo: "Percurso guiado",
    iconeBadge: "Jornada",
    descricaoCurta: "Qualifique o cliente com perguntas e etapas interativas",
    grupo: "interacao",
  },
  agenda: {
    rotulo: "Agenda / Agendamento",
    iconeBadge: "Agenda",
    descricaoCurta: "Permita escolher data e horário direto na vitrine",
    grupo: "interacao",
  },
  publicacao_post: {
    rotulo: "Publicação / Post",
    iconeBadge: "Post",
    descricaoCurta: "Comunicado, novidade ou oferta com imagem e botão",
    grupo: "conteudo",
  },
  cardapio: {
    rotulo: "Cardápio digital",
    iconeBadge: "Cardápio",
    descricaoCurta: "Exiba um ou mais cardápios em tela cheia (PDF ou imagens)",
    grupo: "conteudo",
  },
  secao_produtos: {
    rotulo: "Produtos",
    iconeBadge: "Produtos",
    descricaoCurta: "Mostre sua vitrine de produtos cadastrados",
    grupo: "conteudo",
  },
  secao_servicos: {
    rotulo: "Serviços",
    iconeBadge: "Serviços",
    descricaoCurta: "Apresente serviços, duração e valores",
    grupo: "conteudo",
  },
  secao_portfolio: {
    rotulo: "Portfólio",
    iconeBadge: "Portfólio",
    descricaoCurta: "Galeria editorial de projetos realizados",
    grupo: "conteudo",
  },
  secao_equipe: {
    rotulo: "Equipe",
    iconeBadge: "Equipe",
    descricaoCurta: "Perfis e cartões digitais dos profissionais",
    grupo: "conteudo",
  },
  secao_videos: {
    rotulo: "Vídeos do YouTube",
    iconeBadge: "Vídeos",
    descricaoCurta: "Carrossel ou fila de vídeos incorporados",
    grupo: "conteudo",
  },
  whatsapp: {
    rotulo: "WhatsApp",
    iconeBadge: "WhatsApp",
    descricaoCurta: "Abre conversa direta no WhatsApp com mensagem pronta",
    grupo: "contato",
  },
  telefone: {
    rotulo: "Telefone",
    iconeBadge: "Telefone",
    descricaoCurta: "Inicia ligação telefônica com um toque",
    grupo: "contato",
  },
  link_externo: {
    rotulo: "Link externo",
    iconeBadge: "Link",
    descricaoCurta: "Redireciona para qualquer site, loja ou aplicativo",
    grupo: "contato",
  },
};

export type ItemListaUnificadaVitrine =
  | {
      readonly tipo: "sistema";
      readonly idBloco: IdentificadorBlocoSistemaVitrine;
      readonly titulo: string;
      readonly subtitulo: string;
      readonly badgeTipo: string;
      readonly visivel: boolean;
      readonly abaAparencia: "identidade" | "acoes" | "galeria_seo";
      readonly fixaNoTopo?: boolean;
    }
  | {
      readonly tipo: "experiencia";
      readonly idBloco: string;
      readonly fluxo: DefinicaoMicrofluxo;
    };

