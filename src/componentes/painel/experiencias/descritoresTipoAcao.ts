import type { IdentificadorBlocoSistemaVitrine } from "@/dominio/editorial/ordemBlocosVitrine";
import type { DefinicaoMicrofluxo, TipoAcaoVitrine } from "@/dominio/microfluxos/tiposMicrofluxo";

export const DESCRITORES_TIPO_ACAO: Record<TipoAcaoVitrine, { rotulo: string; iconeBadge: string }> =
  {
    microfluxo: { rotulo: "Percurso guiado", iconeBadge: "Jornada" },
    agenda: { rotulo: "Agenda / Agendamento", iconeBadge: "Agenda" },
    publicacao_post: { rotulo: "Publicação / Post", iconeBadge: "Post" },
    link_externo: { rotulo: "Link externo", iconeBadge: "Link" },
    secao_produtos: { rotulo: "Produtos", iconeBadge: "Produtos" },
    secao_servicos: { rotulo: "Serviços", iconeBadge: "Serviços" },
    secao_portfolio: { rotulo: "Portfólio", iconeBadge: "Portfólio" },
    secao_equipe: { rotulo: "Equipe", iconeBadge: "Equipe" },
    secao_videos: { rotulo: "Vídeos do YouTube", iconeBadge: "Vídeos" },
    whatsapp: { rotulo: "WhatsApp", iconeBadge: "WhatsApp" },
    telefone: { rotulo: "Telefone", iconeBadge: "Telefone" },
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

