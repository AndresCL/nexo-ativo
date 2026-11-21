import { unstable_cache } from "next/cache";
import type {
  DadosCartaoProfissionalPublico,
  PacoteVitrinePublicada,
  PortaLeitorPaginaPublicada,
} from "@/aplicacao/portas/portaLeitorPaginaPublicada";
import type { ConteudoPaginaPublicada } from "@/dominio/entidades/paginaPublicada";
import { ehIdentificadorPublicoValido } from "@/dominio/objetos-valor/identificadorPublico";
import { aplicarPoliticaPublicidadeAVitrine } from "@/dominio/publicidade/aplicadorPoliticaPublicidade";
import { obterPoliticaPublicidade } from "@/dominio/publicidade/registroPoliticasPublicidade";
import { obterServicosAdminFirebase } from "@/infraestrutura/firebase/adminFirebase";
import { esquemaConteudoPaginaPublicada } from "@/validacoes/esquemaPaginaPublicada";
import { montarAcervoVitrineDeDocumentos } from "./montadorAcervoVitrineFirestore";

export function obterTagCachePaginaPublicada(identificadorPublico: string): string {
  return `pagina-publicada:${identificadorPublico}`;
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
          docVideos,
        ] = await Promise.all([
          referenciaPublicada.get(),
          bancoDadosAdmin.collection("organizacoes").doc(organizacaoId).get(),
          referenciaPublicada.collection("servicosPublicados").get(),
          referenciaPublicada.collection("produtosPublicados").get(),
          referenciaPublicada.collection("projetosPublicados").get(),
          referenciaPublicada.collection("profissionaisPublicados").get(),
          referenciaPublicada.collection("microfluxosPublicados").get(),
          bancoDadosAdmin
            .collection("organizacoes")
            .doc(organizacaoId)
            .collection("configuracoes")
            .doc("videos")
            .get(),
        ]);

        if (documentoPublicado.exists && documentoOrganizacao.data()?.situacao === "ativa") {
          const dadosBrutos = documentoPublicado.data();
          const validacao = esquemaConteudoPaginaPublicada.safeParse(dadosBrutos);

          if (validacao.success && validacao.data.publicado && validacao.data.paginaAtiva) {
            const acervo = montarAcervoVitrineDeDocumentos({
              servicos: snapServicos.docs,
              produtos: snapProdutos.docs,
              projetosPortfolio: snapProjetos.docs,
              profissionais: snapProfissionais.docs,
              microfluxos: snapMicrofluxos.docs,
              dadosVideos: docVideos.data(),
            });

            return aplicarPoliticaPublicidadeAVitrine(
              obterPoliticaPublicidade(validacao.data.perfilPublicidade),
              {
                pagina: validacao.data,
                acervo,
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
