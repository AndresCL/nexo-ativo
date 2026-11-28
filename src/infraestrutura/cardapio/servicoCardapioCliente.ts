"use client";

import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  ordenarPaginasCardapio,
  type CardapioOrganizacao,
  type PaginaCardapio,
} from "@/dominio/entidades/cardapioDigital";
import { removerCamposIndefinidosParaFirestore } from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { ErroValidacaoDominio } from "@/dominio/erros/errosDominio";
import { obterServicosClienteFirebase } from "@/infraestrutura/firebase/clienteFirebase";
import { traduzirErroAutenticacaoFirebase } from "@/infraestrutura/firebase/tradutorErrosFirebaseAuth";
import { esquemaCardapioOrganizacao } from "@/validacoes/esquemasCardapioDigital";

export interface ResultadoUploadArquivoCardapio {
  readonly url: string;
  readonly caminhoStorage: string;
}

function gerarNomeSeguroStorage(prefixo: string, extensao: string): string {
  const sufixo = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefixo}-${sufixo}.${extensao}`;
}

export async function listarCardapiosOrganizacaoCliente(
  organizacaoId: string,
): Promise<readonly CardapioOrganizacao[]> {
  try {
    const { bancoDados } = obterServicosClienteFirebase();
    const snap = await getDocs(collection(bancoDados, "organizacoes", organizacaoId, "cardapios"));
    const itens: CardapioOrganizacao[] = [];
    for (const documento of snap.docs) {
      const validacao = esquemaCardapioOrganizacao.safeParse(documento.data());
      if (validacao.success) {
        itens.push({
          ...validacao.data,
          paginas: ordenarPaginasCardapio(validacao.data.paginas),
        });
      }
    }
    return itens.sort((a, b) => a.ordemExibicao - b.ordemExibicao || a.id.localeCompare(b.id));
  } catch (erro) {
    throw traduzirErroAutenticacaoFirebase(erro);
  }
}

export async function enviarPaginaCardapioStorage(
  organizacaoId: string,
  cardapioId: string,
  arquivoImagem: File,
  indicePagina: number,
): Promise<ResultadoUploadArquivoCardapio> {
  try {
    const { armazenamento } = obterServicosClienteFirebase();
    const extensao = arquivoImagem.type === "image/png" ? "png" : arquivoImagem.type === "image/jpeg" ? "jpg" : "webp";
    const nomeArquivo = gerarNomeSeguroStorage(`pagina-${indicePagina + 1}`, extensao);
    const caminhoStorage = `organizacoes/${organizacaoId}/cardapios/${cardapioId}/${nomeArquivo}`;
    const referencia = ref(armazenamento, caminhoStorage);

    await uploadBytes(referencia, arquivoImagem, {
      contentType: arquivoImagem.type || "image/webp",
      cacheControl: "public, max-age=31536000, immutable",
    });

    const url = await getDownloadURL(referencia);
    return { url, caminhoStorage };
  } catch (erro) {
    throw traduzirErroAutenticacaoFirebase(erro);
  }
}

export async function enviarPdfOriginalCardapioStorage(
  organizacaoId: string,
  cardapioId: string,
  arquivoPdf: File,
): Promise<ResultadoUploadArquivoCardapio> {
  try {
    const { armazenamento } = obterServicosClienteFirebase();
    const nomeArquivo = gerarNomeSeguroStorage("cardapio-original", "pdf");
    const caminhoStorage = `organizacoes/${organizacaoId}/cardapios/${cardapioId}/${nomeArquivo}`;
    const referencia = ref(armazenamento, caminhoStorage);

    await uploadBytes(referencia, arquivoPdf, {
      contentType: "application/pdf",
      cacheControl: "public, max-age=86400",
    });

    const url = await getDownloadURL(referencia);
    return { url, caminhoStorage };
  } catch (erro) {
    throw traduzirErroAutenticacaoFirebase(erro);
  }
}

export async function removerArquivosCardapioStorage(
  caminhosStorage: readonly (string | undefined)[],
): Promise<void> {
  const caminhosValidos = caminhosStorage.filter(
    (caminho): caminho is string => Boolean(caminho && caminho.trim().length > 0),
  );
  if (caminhosValidos.length === 0) return;

  const { armazenamento } = obterServicosClienteFirebase();
  await Promise.allSettled(
    caminhosValidos.map((caminho) => deleteObject(ref(armazenamento, caminho))),
  );
}

export async function salvarCardapioOrganizacaoCliente(
  cardapio: CardapioOrganizacao,
): Promise<CardapioOrganizacao> {
  const normalizado: CardapioOrganizacao = {
    ...cardapio,
    paginas: ordenarPaginasCardapio(cardapio.paginas),
    atualizadoEmIso: new Date().toISOString(),
  };

  const validacao = esquemaCardapioOrganizacao.safeParse(normalizado);
  if (!validacao.success) {
    const primeiraMensagem =
      validacao.error.issues[0]?.message ?? "Verifique os campos do cardápio antes de salvar.";
    throw new ErroValidacaoDominio(primeiraMensagem);
  }

  const dadosLimpos = removerCamposIndefinidosParaFirestore(validacao.data);

  try {
    const { bancoDados } = obterServicosClienteFirebase();
    const referencia = doc(
      bancoDados,
      "organizacoes",
      cardapio.organizacaoId,
      "cardapios",
      cardapio.id,
    );
    await setDoc(referencia, dadosLimpos);
    return validacao.data;
  } catch (erro) {
    throw traduzirErroAutenticacaoFirebase(erro);
  }
}

export async function excluirCardapioOrganizacaoCliente(
  cardapio: Pick<CardapioOrganizacao, "id" | "organizacaoId" | "caminhoPdfStorageOpcional" | "paginas">,
): Promise<void> {
  try {
    const { bancoDados } = obterServicosClienteFirebase();
    const referencia = doc(
      bancoDados,
      "organizacoes",
      cardapio.organizacaoId,
      "cardapios",
      cardapio.id,
    );
    await deleteDoc(referencia);

    const caminhosParaLimpar: (string | undefined)[] = [
      cardapio.caminhoPdfStorageOpcional,
      ...cardapio.paginas.map((p: PaginaCardapio) => p.caminhoStorageOpcional),
    ];
    await removerArquivosCardapioStorage(caminhosParaLimpar);
  } catch (erro) {
    throw traduzirErroAutenticacaoFirebase(erro);
  }
}

