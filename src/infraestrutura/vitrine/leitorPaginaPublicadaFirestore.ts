import { unstable_cache } from "next/cache";
import type {
  DadosCartaoProfissionalPublico,
  PacoteVitrinePublicada,
  PortaLeitorPaginaPublicada,
} from "@/aplicacao/portas/portaLeitorPaginaPublicada";
import {
  ordenarItensAtivosCatalogo,
  type ProdutoCatalogo,
  type ProfissionalEquipe,
  type ProjetoPortfolio,
  type ServicoOrganizacao,
} from "@/dominio/entidades/catalogoConteudo";
import type { ConteudoPaginaPublicada } from "@/dominio/entidades/paginaPublicada";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { ehIdentificadorPublicoValido } from "@/dominio/objetos-valor/identificadorPublico";
import { aplicarPoliticaPublicidadeAVitrine } from "@/dominio/publicidade/aplicadorPoliticaPublicidade";
import { obterPoliticaPublicidade } from "@/dominio/publicidade/registroPoliticasPublicidade";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import {
  esquemaProdutoCatalogo,
  esquemaProfissionalEquipe,
  esquemaProjetoPortfolio,
  esquemaServicoOrganizacao,
} from "@/validacoes/esquemasCatalogoConteudo";
import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";
import { esquemaConteudoPaginaPublicada } from "@/validacoes/esquemaPaginaPublicada";

export function obterTagCachePaginaPublicada(identificadorPublico: string): string {
  return `pagina-publicada:${identificadorPublico}`;
}

function extrairItensPublicadosValidos<
  T extends { readonly id: string; readonly ativo: boolean; readonly ordemExibicao: number },
>(
  documentos: ReadonlyArray<{ data: () => unknown }>,
  parseSeguro: (entrada: unknown) => { success: true; data: T } | { success: false },
): readonly T[] {
  const validos: T[] = [];
  for (const doc of documentos) {
    const validacao = parseSeguro(doc.data());
    if (validacao.success && validacao.data.ativo) {
      validos.push(validacao.data);
    }
  }
  return ordenarItensAtivosCatalogo(validos);
}

async function consultarVitrineCompletaDiretoNoFirestore(
  identificadorPublico: string,
): Promise<PacoteVitrinePublicada | null> {
  try {
    const { bancoDadosAdmin } = obterServicosAdminFirebase();
    const documentoSlug = await bancoDadosAdmin
      .collection("identificadoresPublicos")
      .doc(identificadorPublico)
      .get();

    if (documentoSlug.exists) {
      const dadosSlug = documentoSlug.data();
      const organizacaoId =
        typeof dadosSlug?.organizacaoId === "string" ? dadosSlug.organizacaoId : null;
      const slugAtivo = !["inativo", "suspenso", "encerrado", "encerrada"].includes(
        String(dadosSlug?.situacao),
      );

      if (organizacaoId && slugAtivo) {
        const referenciaPublicada = bancoDadosAdmin
          .collection("paginasPublicadas")
          .doc(organizacaoId);

        const [
          documentoPublicado,
          documentoOrganizacao,
          snapServicos,
          snapProdutos,
          snapProjetos,
          snapProfissionais,
          snapMicrofluxos,
        ] = await Promise.all([
          referenciaPublicada.get(),
          bancoDadosAdmin.collection("organizacoes").doc(organizacaoId).get(),
          referenciaPublicada.collection("servicosPublicados").get(),
          referenciaPublicada.collection("produtosPublicados").get(),
          referenciaPublicada.collection("projetosPublicados").get(),
          referenciaPublicada.collection("profissionaisPublicados").get(),
          referenciaPublicada.collection("microfluxosPublicados").get(),
        ]);

        if (documentoPublicado.exists && documentoOrganizacao.data()?.situacao === "ativa") {
          const dadosBrutos = documentoPublicado.data();
          const validacao = esquemaConteudoPaginaPublicada.safeParse(dadosBrutos);

          if (validacao.success && validacao.data.publicado && validacao.data.paginaAtiva) {
            const servicos = extrairItensPublicadosValidos<ServicoOrganizacao>(
              snapServicos.docs,
              (d) => esquemaServicoOrganizacao.safeParse(d),
            );
            const produtos = extrairItensPublicadosValidos<ProdutoCatalogo>(
              snapProdutos.docs,
              (d) => esquemaProdutoCatalogo.safeParse(d),
            );
            const profissionais = extrairItensPublicadosValidos<ProfissionalEquipe>(
              snapProfissionais.docs,
              (d) => esquemaProfissionalEquipe.safeParse(d),
            );
            const microfluxosPersistidos: DefinicaoMicrofluxo[] = [];
            for (const doc of snapMicrofluxos.docs) {
              const valFluxo = esquemaDefinicaoMicrofluxo.safeParse(doc.data());
              if (valFluxo.success && valFluxo.data.ativo) {
                microfluxosPersistidos.push(valFluxo.data);
              }
            }
            const microfluxos = microfluxosPersistidos;

            return aplicarPoliticaPublicidadeAVitrine(
              obterPoliticaPublicidade(validacao.data.perfilPublicidade),
              {
                pagina: validacao.data,
                acervo: {
                  servicos,
                  produtos,
                  projetosPortfolio: extrairItensPublicadosValidos<ProjetoPortfolio>(
                    snapProjetos.docs,
                    (d) => esquemaProjetoPortfolio.safeParse(d),
                  ),
                  profissionais,
                  microfluxos,
                },
              },
            );
          }
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}

export class LeitorPaginaPublicadaFirestore implements PortaLeitorPaginaPublicada {
  public async buscarVitrineCompletaPorIdentificador(
    identificadorPublico: string,
  ): Promise<PacoteVitrinePublicada | null> {
    if (!ehIdentificadorPublicoValido(identificadorPublico)) {
      return null;
    }

    // Em desenvolvimento local, consulta em tempo real sem reter cache em memória
    if (process.env.NODE_ENV !== "production") {
      return consultarVitrineCompletaDiretoNoFirestore(identificadorPublico);
    }

    const consultarComCache = unstable_cache(
      async () => consultarVitrineCompletaDiretoNoFirestore(identificadorPublico),
      ["vitrine-completa-publicada", identificadorPublico],
      {
        revalidate: 120,
        tags: [obterTagCachePaginaPublicada(identificadorPublico)],
      },
    );

    return consultarComCache();
  }

  public async buscarPorIdentificadorPublico(
    identificadorPublico: string,
  ): Promise<ConteudoPaginaPublicada | null> {
    const pacote = await this.buscarVitrineCompletaPorIdentificador(identificadorPublico);
    return pacote?.pagina ?? null;
  }

  public async buscarCartaoProfissionalPublico(
    identificadorOrganizacao: string,
    identificadorCartao: string,
  ): Promise<DadosCartaoProfissionalPublico | null> {
    if (
      !ehIdentificadorPublicoValido(identificadorOrganizacao) ||
      !ehIdentificadorPublicoValido(identificadorCartao)
    ) {
      return null;
    }

    const pacote = await this.buscarVitrineCompletaPorIdentificador(identificadorOrganizacao);
    if (!pacote) {
      return null;
    }

    const profissional = pacote.acervo.profissionais.find(
      (item) => item.ativo && item.identificadorCartao === identificadorCartao,
    );

    if (!profissional) {
      return null;
    }

    return {
      paginaOrganizacao: pacote.pagina,
      profissional,
      servicosAtivos: pacote.acervo.servicos,
      acervo: pacote.acervo,
    };
  }
}

export const leitorPaginaPublicadaPadrao: PortaLeitorPaginaPublicada =
  new LeitorPaginaPublicadaFirestore();
