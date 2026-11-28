import {
  normalizarTextoBusca,
  type ItemCatalogoFiltravel,
} from "./filtroCatalogoAcervo";

export interface SegmentoTextoDestaque {
  readonly texto: string;
  readonly destacado: boolean;
}

export interface SugestaoCatalogoAcervo {
  readonly item: ItemCatalogoFiltravel;
  readonly campoEncontrado: "nome" | "categoria" | "especificacao" | "resumo";
  readonly trechoSecundario?: string;
}

function normalizarCaractereSemAcento(caractere: string): string {
  return caractere
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function segmentarTextoComDestaque(
  textoOriginal: string,
  termoBusca: string,
): readonly SegmentoTextoDestaque[] {
  if (!textoOriginal) return [];

  const tokens = Array.from(
    new Set(
      normalizarTextoBusca(termoBusca)
        .split(/\s+/)
        .filter((token) => token.length > 0),
    ),
  );

  if (tokens.length === 0) {
    return [{ texto: textoOriginal, destacado: false }];
  }

  let textoNormalizado = "";
  const mapaOriginal: Array<{ inicio: number; fim: number }> = [];

  for (let i = 0; i < textoOriginal.length; ) {
    const codePoint = textoOriginal.codePointAt(i);
    const tamanho = codePoint !== undefined && codePoint > 0xffff ? 2 : 1;
    const caractere = textoOriginal.slice(i, i + tamanho);
    const normalizado = normalizarCaractereSemAcento(caractere);

    for (let j = 0; j < normalizado.length; j += 1) {
      textoNormalizado += normalizado[j];
      mapaOriginal.push({ inicio: i, fim: i + tamanho });
    }
    i += tamanho;
  }

  const intervalos: Array<{ inicio: number; fim: number }> = [];

  for (const token of tokens) {
    let cursor = 0;
    while (cursor <= textoNormalizado.length - token.length) {
      const encontrado = textoNormalizado.indexOf(token, cursor);
      if (encontrado === -1) break;
      const inicioOriginal = mapaOriginal[encontrado]?.inicio;
      const fimOriginal = mapaOriginal[encontrado + token.length - 1]?.fim;
      if (inicioOriginal !== undefined && fimOriginal !== undefined) {
        intervalos.push({ inicio: inicioOriginal, fim: fimOriginal });
      }
      cursor = encontrado + token.length;
    }
  }

  if (intervalos.length === 0) {
    return [{ texto: textoOriginal, destacado: false }];
  }

  intervalos.sort((a, b) => a.inicio - b.inicio || a.fim - b.fim);

  const mesclados: Array<{ inicio: number; fim: number }> = [];
  for (const atual of intervalos) {
    const ultimo = mesclados[mesclados.length - 1];
    if (!ultimo || atual.inicio > ultimo.fim) {
      mesclados.push({ ...atual });
    } else if (atual.fim > ultimo.fim) {
      ultimo.fim = atual.fim;
    }
  }

  const segmentos: SegmentoTextoDestaque[] = [];
  let posicao = 0;

  for (const faixa of mesclados) {
    if (faixa.inicio > posicao) {
      segmentos.push({
        texto: textoOriginal.slice(posicao, faixa.inicio),
        destacado: false,
      });
    }
    segmentos.push({
      texto: textoOriginal.slice(faixa.inicio, faixa.fim),
      destacado: true,
    });
    posicao = faixa.fim;
  }

  if (posicao < textoOriginal.length) {
    segmentos.push({
      texto: textoOriginal.slice(posicao),
      destacado: false,
    });
  }

  return segmentos;
}

export function gerarSugestoesCatalogo(
  itens: readonly ItemCatalogoFiltravel[],
  termoBusca: string,
  limite = 5,
): readonly SugestaoCatalogoAcervo[] {
  const termoNormalizado = normalizarTextoBusca(termoBusca);
  if (!termoNormalizado) return [];

  const tokens = termoNormalizado.split(/\s+/).filter(Boolean);
  const ranqueados: Array<{ sugestao: SugestaoCatalogoAcervo; pontuacao: number }> = [];

  for (const item of itens) {
    const nomeNorm = normalizarTextoBusca(item.nome);
    const categoriaNorm = normalizarTextoBusca(item.categoria ?? "");
    const resumoNorm = normalizarTextoBusca(item.resumo ?? "");
    const prazoNorm = normalizarTextoBusca(item.prazoOuDuracao ?? "");
    const especificacoes = item.especificacoes ?? [];
    const textoCombinado = [
      nomeNorm,
      categoriaNorm,
      resumoNorm,
      prazoNorm,
      ...especificacoes.map(normalizarTextoBusca),
    ].join(" ");

    if (!tokens.every((token) => textoCombinado.includes(token))) {
      continue;
    }

    let pontuacao = 0;
    let campoEncontrado: SugestaoCatalogoAcervo["campoEncontrado"] = "resumo";
    let trechoSecundario: string | undefined;

    if (nomeNorm.startsWith(termoNormalizado)) {
      pontuacao = 100;
      campoEncontrado = "nome";
    } else if (tokens.every((t) => nomeNorm.includes(t))) {
      pontuacao = 75;
      campoEncontrado = "nome";
    } else if (categoriaNorm && tokens.some((t) => categoriaNorm.includes(t))) {
      pontuacao = 55;
      campoEncontrado = "categoria";
    } else {
      const especEncontrada = especificacoes.find((esp) =>
        tokens.some((t) => normalizarTextoBusca(esp).includes(t)),
      );
      if (especEncontrada) {
        pontuacao = 40;
        campoEncontrado = "especificacao";
        trechoSecundario = especEncontrada;
      } else {
        pontuacao = 25;
        campoEncontrado = "resumo";
        trechoSecundario = item.resumo;
      }
    }

    ranqueados.push({
      pontuacao,
      sugestao: { item, campoEncontrado, trechoSecundario },
    });
  }

  return ranqueados
    .sort((a, b) => b.pontuacao - a.pontuacao || a.sugestao.item.ordemOriginal - b.sugestao.item.ordemOriginal)
    .slice(0, limite)
    .map((entrada) => entrada.sugestao);
}

