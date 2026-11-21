import {
  ordenarItensAtivosCatalogo,
  type AcervoPublicoVitrine,
  type ProdutoCatalogo,
  type ProfissionalEquipe,
  type ProjetoPortfolio,
  type ServicoOrganizacao,
} from "@/dominio/entidades/catalogoConteudo";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import {
  esquemaProdutoCatalogo,
  esquemaProfissionalEquipe,
  esquemaProjetoPortfolio,
  esquemaServicoOrganizacao,
} from "@/validacoes/esquemasCatalogoConteudo";
import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";

export interface DocumentosBrutosAcervoVitrine {
  readonly organizacaoId?: string;
  readonly servicos: ReadonlyArray<{ data: () => unknown }>;
  readonly produtos: ReadonlyArray<{ data: () => unknown }>;
  readonly projetosPortfolio: ReadonlyArray<{ data: () => unknown }>;
  readonly profissionais: ReadonlyArray<{ data: () => unknown }>;
  readonly microfluxos: ReadonlyArray<{ data: () => unknown }>;
  readonly dadosVideos?: Record<string, unknown>;
}

function extrairItensAtivosValidos<
  T extends {
    readonly id: string;
    readonly ativo: boolean;
    readonly ordemExibicao: number;
    readonly organizacaoId?: string;
  },
>(
  documentos: ReadonlyArray<{ data: () => unknown }>,
  parseSeguro: (entrada: unknown) => { success: true; data: T } | { success: false },
  organizacaoIdEsperado?: string,
): readonly T[] {
  const validos: T[] = [];
  for (const doc of documentos) {
    const validacao = parseSeguro(doc.data());
    if (
      validacao.success &&
      validacao.data.ativo &&
      (!organizacaoIdEsperado || validacao.data.organizacaoId === organizacaoIdEsperado)
    ) {
      validos.push(validacao.data);
    }
  }
  return ordenarItensAtivosCatalogo(validos);
}

/**
 * Monta e valida um AcervoPublicoVitrine a partir de snapshots do Firestore,
 * reutilizado tanto pela vitrine pública quanto pela prévia do painel.
 */
export function montarAcervoVitrineDeDocumentos({
  organizacaoId,
  servicos: docsServicos,
  produtos: docsProdutos,
  projetosPortfolio: docsProjetos,
  profissionais: docsProfissionais,
  microfluxos: docsMicrofluxos,
  dadosVideos,
}: DocumentosBrutosAcervoVitrine): AcervoPublicoVitrine {
  const servicos = extrairItensAtivosValidos<ServicoOrganizacao>(
    docsServicos,
    (d) => esquemaServicoOrganizacao.safeParse(d),
    organizacaoId,
  );
  const produtos = extrairItensAtivosValidos<ProdutoCatalogo>(
    docsProdutos,
    (d) => esquemaProdutoCatalogo.safeParse(d),
    organizacaoId,
  );
  const projetosPortfolio = extrairItensAtivosValidos<ProjetoPortfolio>(
    docsProjetos,
    (d) => esquemaProjetoPortfolio.safeParse(d),
    organizacaoId,
  );
  const profissionais = extrairItensAtivosValidos<ProfissionalEquipe>(
    docsProfissionais,
    (d) => esquemaProfissionalEquipe.safeParse(d),
    organizacaoId,
  );

  const microfluxos: DefinicaoMicrofluxo[] = [];
  for (const doc of docsMicrofluxos) {
    const valFluxo = esquemaDefinicaoMicrofluxo.safeParse(doc.data());
    if (
      valFluxo.success &&
      valFluxo.data.ativo &&
      (!organizacaoId || valFluxo.data.organizacaoId === organizacaoId)
    ) {
      microfluxos.push(valFluxo.data);
    }
  }

  return {
    servicos,
    produtos,
    projetosPortfolio,
    profissionais,
    microfluxos,
    videos: Array.isArray(dadosVideos?.videos) ? dadosVideos.videos : [],
    modoExibicaoVideos: dadosVideos?.modoExibicaoVideos === "fila" ? "fila" : "carrossel",
    autoplayVideos: Boolean(dadosVideos?.autoplayVideos),
    ocultarTituloVideos: Boolean(dadosVideos?.ocultarTituloVideos),
  };
}

