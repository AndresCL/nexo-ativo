"use client";

import { useState, type FormEvent } from "react";
import {
  garantirSlugCardapioUnico,
  gerarSlugCardapio,
  ordenarPaginasCardapio,
  type CardapioOrganizacao,
  type PaginaCardapio,
} from "@/dominio/entidades/cardapioDigital";
import { removerArquivosCardapioStorage } from "@/infraestrutura/cardapio/servicoCardapioCliente";
import { GradeMiniaturasPaginas } from "./GradeMiniaturasPaginas";
import {
  UploadPaginasCardapio,
  type ResultadoUploadCardapio,
} from "./UploadPaginasCardapio";

interface PropriedadesFormularioCardapioPainel {
  readonly organizacaoId: string;
  readonly cardapioInicial: CardapioOrganizacao;
  readonly todosCardapios: readonly CardapioOrganizacao[];
  readonly salvando: boolean;
  readonly aoSalvar: (cardapio: CardapioOrganizacao) => Promise<void>;
  readonly aoCancelar: () => void;
}

export function FormularioCardapioPainel({
  organizacaoId,
  cardapioInicial,
  todosCardapios,
  salvando,
  aoSalvar,
  aoCancelar,
}: PropriedadesFormularioCardapioPainel) {
  const [titulo, setTitulo] = useState(cardapioInicial.titulo);
  const [subtitulo, setSubtitulo] = useState(cardapioInicial.subtituloOpcional ?? "");
  const [ativo, setAtivo] = useState(cardapioInicial.ativo);
  const [paginas, setPaginas] = useState<readonly PaginaCardapio[]>(cardapioInicial.paginas);
  const [urlPdfOriginal, setUrlPdfOriginal] = useState<string | undefined>(
    cardapioInicial.urlPdfOriginal,
  );
  const [caminhoPdfStorage, setCaminhoPdfStorage] = useState<string | undefined>(
    cardapioInicial.caminhoPdfStorageOpcional,
  );
  const [erro, setErro] = useState<string | null>(null);

  function tratarUpload(resultado: ResultadoUploadCardapio) {
    setErro(null);
    if (resultado.substituirExistentes) {
      const antigos = [
        caminhoPdfStorage,
        ...paginas.map((p) => p.caminhoStorageOpcional),
      ];
      void removerArquivosCardapioStorage(antigos);
      setPaginas(ordenarPaginasCardapio(resultado.paginas));
      setUrlPdfOriginal(resultado.urlPdfOriginal);
      setCaminhoPdfStorage(resultado.caminhoPdfStorageOpcional);
      return;
    }

    setPaginas(ordenarPaginasCardapio([...paginas, ...resultado.paginas]));
  }

  function moverPagina(indice: number, direcao: -1 | 1) {
    const destino = indice + direcao;
    if (destino < 0 || destino >= paginas.length) return;
    const copia = paginas.slice();
    const [removida] = copia.splice(indice, 1);
    if (!removida) return;
    copia.splice(destino, 0, removida);
    setPaginas(ordenarPaginasCardapio(copia));
  }

  function removerPagina(indice: number) {
    const alvo = paginas[indice];
    if (alvo?.caminhoStorageOpcional) {
      void removerArquivosCardapioStorage([alvo.caminhoStorageOpcional]);
    }
    setPaginas(ordenarPaginasCardapio(paginas.filter((_, i) => i !== indice)));
  }

  async function submeter(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (titulo.trim().length < 2) {
      setErro("Informe o título do cardápio (ex.: Almoço, Cafés, Bebidas).");
      return;
    }

    if (paginas.length === 0) {
      setErro("Envie um PDF ou pelo menos uma imagem do cardápio.");
      return;
    }

    const slug = garantirSlugCardapioUnico(
      gerarSlugCardapio(titulo),
      todosCardapios,
      cardapioInicial.id,
    );

    try {
      await aoSalvar({
        ...cardapioInicial,
        slug,
        titulo: titulo.trim(),
        subtituloOpcional: subtitulo.trim() || undefined,
        urlPdfOriginal,
        caminhoPdfStorageOpcional: caminhoPdfStorage,
        paginas: ordenarPaginasCardapio(paginas),
        ativo,
      });
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao salvar o cardápio.");
    }
  }

  return (
    <form onSubmit={submeter} className="space-y-4 rounded-2xl border border-borda-sutil bg-superficie-base p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-texto-primario">Título do cardápio</span>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: Cardápio Principal, Bebidas, Almoço"
            maxLength={80}
            className="w-full rounded-xl border border-borda-sutil bg-superficie-elevada px-3 py-2 text-sm text-texto-primario"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-semibold text-texto-primario">
            Horário ou observação (opcional)
          </span>
          <input
            type="text"
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
            placeholder="Ex.: Servido de seg a sex, 11h30 às 15h"
            maxLength={140}
            className="w-full rounded-xl border border-borda-sutil bg-superficie-elevada px-3 py-2 text-sm text-texto-primario"
          />
        </label>
      </div>

      <UploadPaginasCardapio
        organizacaoId={organizacaoId}
        cardapioId={cardapioInicial.id}
        quantidadeAtual={paginas.length}
        aoConcluirUpload={tratarUpload}
        aoErro={setErro}
      />

      <GradeMiniaturasPaginas
        paginas={paginas}
        aoMover={moverPagina}
        aoRemover={removerPagina}
      />

      <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-texto-primario">
        <input
          type="checkbox"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
          className="h-4 w-4 rounded"
        />
        <span>Cardápio visível na vitrine pública</span>
      </label>

      {erro ? <p className="text-xs font-medium text-red-500">{erro}</p> : null}

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={aoCancelar}
          disabled={salvando}
          className="cursor-pointer rounded-xl border border-borda-sutil px-3.5 py-2 text-xs font-semibold text-texto-secundario hover:text-texto-primario"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="cursor-pointer rounded-xl bg-destaque-primario px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Salvar cardápio"}
        </button>
      </div>
    </form>
  );
}

