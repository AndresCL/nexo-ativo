import type { ResumoAvaliacoesGoogle } from "@/dominio/entidades/avaliacoesGoogle";
import {
  criarRascunhoConfiguracaoPaginaPadrao,
  converterRascunhoParaConteudoPublicado,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";

export const RESUMO_AVALIACOES_GOOGLE_TESTE: ResumoAvaliacoesGoogle = {
  identificadorLocal: "ChIJ_serena",
  nome: "Clínica Serena",
  endereco: "Rua das Flores, 100, São Paulo",
  urlGoogleMaps: "https://www.google.com/maps?cid=123",
  atribuicoes: [],
  notaMedia: 4.9,
  totalAvaliacoes: 128,
  avaliacoes: [
    {
      id: "avaliacao-1",
      autor: "Maria Silva",
      nota: 5,
      texto: "Atendimento excelente do início ao fim. A equipe explicou cada etapa com atenção.",
      urlAutor: "https://www.google.com/maps/contrib/123",
      descricaoData: "há um mês",
      publicadaEmIso: "2026-10-10T12:00:00Z",
    },
    {
      id: "avaliacao-2",
      autor: "João Souza",
      nota: 4,
      texto: "Boa experiência e atendimento cuidadoso.",
    },
  ],
};

export function criarPaginaAvaliacoesGoogleTeste() {
  return converterRascunhoParaConteudoPublicado(
    {
      ...criarRascunhoConfiguracaoPaginaPadrao({
        organizacaoId: "org-serena",
        nomeOrganizacao: "Clínica Serena",
      }),
      avaliacoesGoogle: {
        habilitado: true,
        identificadorLocal: "ChIJ_serena",
        modoExibicao: "carrossel",
      },
    },
    { identificadorPublico: "clinica-serena", versaoPublicada: 1 },
  );
}
