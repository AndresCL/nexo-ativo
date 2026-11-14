"use client";

import { doc, setDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import type {
  OpcoesUploadMidiaEditorial,
  ResultadoPublicacaoPagina,
  ResultadoUploadMidiaEditorial,
  ServicoEditorAparenciaPorta,
} from "@/aplicacao/portas/portasEditorAparencia";
import {
  removerCamposIndefinidosParaFirestore,
  validarArquivoMidiaEditorial,
  type RascunhoConfiguracaoPagina,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { ErroValidacaoDominio } from "@/dominio/erros/errosDominio";
import { obterServicosClienteFirebase } from "@/infraestrutura/firebase/clienteFirebase";
import { traduzirErroAutenticacaoFirebase } from "@/infraestrutura/firebase/tradutorErrosFirebaseAuth";
import {
  esquemaRascunhoConfiguracaoPagina,
  type DadosRequisicaoPublicarPagina,
} from "@/validacoes/esquemaRascunhoPagina";

export function gerarNomeArquivoSeguroStorage(nomeOriginal: string): string {
  const partes = nomeOriginal.toLowerCase().split(".");
  const extensaoBruta = partes.length > 1 ? (partes.pop() ?? "bin") : "bin";
  const extensaoLimpa = extensaoBruta.replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
  const baseLimpa = partes
    .join("-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const sufixoUnico = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${baseLimpa || "midia"}-${sufixoUnico}.${extensaoLimpa}`;
}

export class ServicoEditorAparenciaFirebaseCliente implements ServicoEditorAparenciaPorta {
  public async salvarRascunho(rascunho: RascunhoConfiguracaoPagina): Promise<void> {
    const rascunhoAtualizado: RascunhoConfiguracaoPagina = {
      ...rascunho,
      atualizadoEmIso: new Date().toISOString(),
    };

    const validacao = esquemaRascunhoConfiguracaoPagina.safeParse(rascunhoAtualizado);
    if (!validacao.success) {
      const primeiraMensagem =
        validacao.error.issues[0]?.message ??
        "Verifique os campos preenchidos antes de salvar o rascunho.";
      throw new ErroValidacaoDominio(primeiraMensagem);
    }

    const dadosLimpos = removerCamposIndefinidosParaFirestore(validacao.data);

    try {
      const { bancoDados } = obterServicosClienteFirebase();
      const referencia = doc(
        bancoDados,
        "organizacoes",
        rascunho.organizacaoId,
        "configuracaoPagina",
        "rascunho",
      );
      await setDoc(referencia, dadosLimpos);
    } catch (erro) {
      console.error("[ServicoEditorAparencia] Falha ao salvar rascunho no Firestore:", erro);
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }

  public async enviarMidia(
    opcoes: OpcoesUploadMidiaEditorial,
  ): Promise<ResultadoUploadMidiaEditorial> {
    validarArquivoMidiaEditorial(
      {
        nome: opcoes.arquivo.name,
        tamanhoBytes: opcoes.arquivo.size,
        tipoMime: opcoes.arquivo.type,
      },
      opcoes.categoria,
    );

    const pastaCategoria = opcoes.categoria === "video" ? "videos" : "imagens";
    const nomeSeguro = gerarNomeArquivoSeguroStorage(opcoes.arquivo.name);
    const caminhoArmazenamento = `organizacoes/${opcoes.organizacaoId}/${pastaCategoria}/${nomeSeguro}`;

    const { armazenamento } = obterServicosClienteFirebase();
    const referenciaArquivo = ref(armazenamento, caminhoArmazenamento);

    return new Promise<ResultadoUploadMidiaEditorial>((resolver, rejeitar) => {
      const tarefa = uploadBytesResumable(referenciaArquivo, opcoes.arquivo, {
        contentType: opcoes.arquivo.type,
      });

      tarefa.on(
        "state_changed",
        (instantaneo) => {
          if (opcoes.aoAtualizarProgresso && instantaneo.totalBytes > 0) {
            const percentual = Math.round(
              (instantaneo.bytesTransferred / instantaneo.totalBytes) * 100,
            );
            opcoes.aoAtualizarProgresso(percentual);
          }
        },
        (erro) => {
          rejeitar(traduzirErroAutenticacaoFirebase(erro));
        },
        async () => {
          try {
            const urlPublica = await getDownloadURL(tarefa.snapshot.ref);
            resolver({
              urlPublica,
              caminhoArmazenamento,
            });
          } catch (erroUrl) {
            rejeitar(traduzirErroAutenticacaoFirebase(erroUrl));
          }
        },
      );
    });
  }

  public async publicarPagina(organizacaoId: string): Promise<ResultadoPublicacaoPagina> {
    try {
      const { funcoesRemotas } = obterServicosClienteFirebase();
      const chamarPublicacao = httpsCallable<
        DadosRequisicaoPublicarPagina,
        ResultadoPublicacaoPagina
      >(funcoesRemotas, "publicarPaginaEditorial");

      const resposta = await chamarPublicacao({ organizacaoId });
      const dados = resposta.data;

      try {
        await fetch("/api/vitrine/revalidar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizacaoId: dados.organizacaoId,
            identificadorPublico: dados.identificadorPublico,
          }),
        });
      } catch {
        // A revalidação imediata é complementar; a publicação transacional já está persistida.
      }

      return dados;
    } catch (erro) {
      throw traduzirErroAutenticacaoFirebase(erro);
    }
  }
}

export const servicoEditorAparenciaCliente = new ServicoEditorAparenciaFirebaseCliente();
