"use client";

import { deleteDoc, doc, setDoc, writeBatch } from "firebase/firestore";
import type {
  ParcialBlocosSistemaVitrine,
  ServicoCatalogoConteudoPorta,
} from "@/aplicacao/portas/portasCatalogoConteudo";
import type {
  OpcoesUploadMidiaEditorial,
  ResultadoPublicacaoPagina,
  ResultadoUploadMidiaEditorial,
} from "@/aplicacao/portas/portasEditorAparencia";
import type {
  ProdutoCatalogo,
  ProfissionalEquipe,
  ProjetoPortfolio,
  ServicoOrganizacao,
} from "@/dominio/entidades/catalogoConteudo";
import { removerCamposIndefinidosParaFirestore } from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { ErroValidacaoDominio } from "@/dominio/erros/errosDominio";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { obterServicosClienteFirebase } from "@/infraestrutura/firebase/clienteFirebase";
import { traduzirErroAutenticacaoFirebase } from "@/infraestrutura/firebase/tradutorErrosFirebaseAuth";
import {
  esquemaProdutoCatalogo,
  esquemaProfissionalEquipe,
  esquemaProjetoPortfolio,
  esquemaServicoOrganizacao,
} from "@/validacoes/esquemasCatalogoConteudo";
import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";
import { servicoEditorAparenciaCliente } from "./servicoEditorAparenciaCliente";

async function gravarDocumentoSubcolecaoOrganizacao<
  T extends { readonly id: string; readonly organizacaoId: string },
>(
  nomeSubcolecao: "servicos" | "produtos" | "projetosPortfolio" | "profissionais" | "microfluxos",
  entidade: T,
  parseSeguro: (
    entrada: unknown,
  ) =>
    | { success: true; data: T }
    | { success: false; error: { issues: ReadonlyArray<{ message?: string }> } },
): Promise<void> {
  const validacao = parseSeguro({
    ...entidade,
    atualizadoEmIso: new Date().toISOString(),
  });

  if (!validacao.success) {
    const primeiraMensagem =
      validacao.error.issues[0]?.message ?? "Verifique os campos obrigatórios antes de salvar.";
    throw new ErroValidacaoDominio(primeiraMensagem);
  }

  const dadosLimpos = removerCamposIndefinidosParaFirestore(validacao.data);

  try {
    const { bancoDados } = obterServicosClienteFirebase();
    const referencia = doc(
      bancoDados,
      "organizacoes",
      entidade.organizacaoId,
      nomeSubcolecao,
      entidade.id,
    );
    await setDoc(referencia, dadosLimpos);
  } catch (erro) {
    throw traduzirErroAutenticacaoFirebase(erro);
  }
}

export class ServicoCatalogoConteudoFirebaseCliente implements ServicoCatalogoConteudoPorta {
  public async salvarServico(servico: ServicoOrganizacao): Promise<void> {
    await gravarDocumentoSubcolecaoOrganizacao("servicos", servico, (d) =>
      esquemaServicoOrganizacao.safeParse(d),
    );
  }

  public async salvarProduto(produto: ProdutoCatalogo): Promise<void> {
    await gravarDocumentoSubcolecaoOrganizacao("produtos", produto, (d) =>
      esquemaProdutoCatalogo.safeParse(d),
    );
  }

  public async salvarProjetoPortfolio(projeto: ProjetoPortfolio): Promise<void> {
    await gravarDocumentoSubcolecaoOrganizacao("projetosPortfolio", projeto, (d) =>
      esquemaProjetoPortfolio.safeParse(d),
    );
  }

  public async salvarProfissional(profissional: ProfissionalEquipe): Promise<void> {
    await gravarDocumentoSubcolecaoOrganizacao("profissionais", profissional, (d) =>
      esquemaProfissionalEquipe.safeParse(d),
    );
  }

  public async excluirProfissional(organizacaoId: string, profissionalId: string): Promise<void> {
    try {
      const { bancoDados } = obterServicosClienteFirebase();
      const referencia = doc(
        bancoDados,
        "organizacoes",
        organizacaoId,
        "profissionais",
        profissionalId,
      );
      await deleteDoc(referencia);
    } catch (erro) {
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }

  public async salvarMicrofluxo(microfluxo: DefinicaoMicrofluxo): Promise<void> {
    await gravarDocumentoSubcolecaoOrganizacao("microfluxos", microfluxo, (d) =>
      esquemaDefinicaoMicrofluxo.safeParse(d),
    );
  }

  public async salvarOrdemMicrofluxos(microfluxos: readonly DefinicaoMicrofluxo[]): Promise<void> {
    await Promise.all(microfluxos.map((m) => this.salvarMicrofluxo(m)));
  }

  public async salvarRascunhoExperiencias(
    organizacaoId: string,
    alteradas: readonly DefinicaoMicrofluxo[],
    idsExcluidos: readonly string[],
  ): Promise<void> {
    if (alteradas.length === 0 && idsExcluidos.length === 0) return;

    const excluidos = new Set(idsExcluidos);
    const agoraIso = new Date().toISOString();
    const dadosValidados = alteradas.map((fluxo) => {
      if (fluxo.organizacaoId !== organizacaoId || excluidos.has(fluxo.id)) {
        throw new ErroValidacaoDominio("As alterações não pertencem ao mesmo rascunho.");
      }
      const validacao = esquemaDefinicaoMicrofluxo.safeParse({
        ...fluxo,
        atualizadoEmIso: agoraIso,
      });
      if (!validacao.success) {
        throw new ErroValidacaoDominio(
          validacao.error.issues[0]?.message ??
            "Revise os campos das experiências antes de salvar.",
        );
      }
      const dados = removerCamposIndefinidosParaFirestore(validacao.data);
      // O servidor controla a versão publicada. O merge preserva a versão mais recente.
      const { versaoPublicada: _versaoPublicada, ...rascunho } = dados;
      return rascunho;
    });

    try {
      const { bancoDados } = obterServicosClienteFirebase();
      const lote = writeBatch(bancoDados);
      for (const dados of dadosValidados) {
        lote.set(doc(bancoDados, "organizacoes", organizacaoId, "microfluxos", dados.id), dados, {
          merge: true,
        });
      }
      for (const id of excluidos) {
        lote.delete(doc(bancoDados, "organizacoes", organizacaoId, "microfluxos", id));
      }
      await lote.commit();
    } catch (erro) {
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }

  public async salvarOrdemEBlocosSistemaVitrine(
    organizacaoId: string,
    parcial: ParcialBlocosSistemaVitrine,
  ): Promise<void> {
    try {
      const { bancoDados } = obterServicosClienteFirebase();
      const referencia = doc(
        bancoDados,
        "organizacoes",
        organizacaoId,
        "configuracaoPagina",
        "rascunho",
      );
      const payload: Record<string, unknown> = {
        organizacaoId,
        ordemBlocosVitrine: [...parcial.ordemBlocosVitrine],
        blocosSistemaOcultos: [...parcial.blocosSistemaOcultos],
        identidade: {
          posicaoCabecalho: parcial.posicaoCabecalhoMarca,
        },
        atualizadoEmIso: new Date().toISOString(),
      };
      if (parcial.avaliacoesGoogleHabilitado !== undefined) {
        payload.avaliacoesGoogle = {
          habilitado: parcial.avaliacoesGoogleHabilitado,
        };
      }
      await setDoc(referencia, payload, { merge: true });
    } catch (erro) {
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }

  public enviarMidia(opcoes: OpcoesUploadMidiaEditorial): Promise<ResultadoUploadMidiaEditorial> {
    return servicoEditorAparenciaCliente.enviarMidia(opcoes);
  }

  public publicarPagina(organizacaoId: string): Promise<ResultadoPublicacaoPagina> {
    return servicoEditorAparenciaCliente.publicarPagina(organizacaoId);
  }
}

export const servicoCatalogoConteudoCliente = new ServicoCatalogoConteudoFirebaseCliente();
