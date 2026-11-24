"use client";

import { useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import type {
  EstadoConexaoTempoReal,
  PortaObservacaoDeltaColecao,
} from "@/aplicacao/portas/portasReatividade";

export interface ItemComIdentidadeEAtualizacao {
  readonly id: string;
  readonly atualizadoEmIso: string;
}

export function calcularCursorAtualizacaoIso<T extends ItemComIdentidadeEAtualizacao>(
  itens: readonly T[],
): string | null {
  let maiorIso: string | null = null;
  for (const item of itens) {
    if (maiorIso === null || item.atualizadoEmIso > maiorIso) {
      maiorIso = item.atualizadoEmIso;
    }
  }
  return maiorIso;
}

export function mesclarDeltaColecao<T extends { readonly id: string }>(
  atuais: readonly T[],
  delta: readonly T[],
  ordenar: (a: T, b: T) => number,
  idIgnorado?: string | null,
): readonly T[] {
  if (delta.length === 0) {
    return atuais;
  }

  const mapa = new Map<string, T>();
  for (const item of atuais) {
    mapa.set(item.id, item);
  }

  let houveAlteracao = false;
  for (const itemDelta of delta) {
    if (idIgnorado && itemDelta.id === idIgnorado) {
      continue;
    }
    mapa.set(itemDelta.id, itemDelta);
    houveAlteracao = true;
  }

  if (!houveAlteracao) {
    return atuais;
  }

  return Array.from(mapa.values()).sort(ordenar);
}

export interface OpcoesUseColecaoDeltaTempoReal<T extends ItemComIdentidadeEAtualizacao> {
  readonly organizacaoId: string;
  readonly itensIniciais: readonly T[];
  readonly observador: PortaObservacaoDeltaColecao<T>;
  readonly ordenar: (a: T, b: T) => number;
  readonly aoChegarNovosItens?: (novosItens: readonly T[]) => void;
  readonly idEmEscritaLocalRef?: RefObject<string | null>;
}

export interface RetornoUseColecaoDeltaTempoReal<T> {
  readonly itens: readonly T[];
  readonly setItens: Dispatch<SetStateAction<readonly T[]>>;
  readonly estadoConexao: EstadoConexaoTempoReal;
}

export function useColecaoDeltaTempoReal<T extends ItemComIdentidadeEAtualizacao>({
  organizacaoId,
  itensIniciais,
  observador,
  ordenar,
  aoChegarNovosItens,
  idEmEscritaLocalRef,
}: OpcoesUseColecaoDeltaTempoReal<T>): RetornoUseColecaoDeltaTempoReal<T> {
  const [itens, setItens] = useState<readonly T[]>(itensIniciais);
  const [estadoConexao, setEstadoConexao] = useState<EstadoConexaoTempoReal>("conectando");

  const ordenarRef = useRef(ordenar);
  ordenarRef.current = ordenar;

  const aoChegarNovosItensRef = useRef(aoChegarNovosItens);
  aoChegarNovosItensRef.current = aoChegarNovosItens;

  const idsConhecidosRef = useRef<Set<string>>(new Set(itensIniciais.map((item) => item.id)));
  const cursorInicialRef = useRef<{
    readonly organizacaoId: string;
    readonly cursor: string | null;
  }>({
    organizacaoId,
    cursor: calcularCursorAtualizacaoIso(itensIniciais),
  });

  if (cursorInicialRef.current.organizacaoId !== organizacaoId) {
    cursorInicialRef.current = {
      organizacaoId,
      cursor: calcularCursorAtualizacaoIso(itensIniciais),
    };
    idsConhecidosRef.current = new Set(itensIniciais.map((item) => item.id));
  }

  useEffect(() => {
    setEstadoConexao("conectando");

    const desinscrever = observador.assinarDelta(
      {
        organizacaoId,
        atualizadoAPartirDeIso: cursorInicialRef.current.cursor,
      },
      {
        aoReceberDelta: (itensAlterados, metadados) => {
          setEstadoConexao("ao_vivo");

          if (itensAlterados.length === 0) {
            return;
          }

          const novosDetectados: T[] = [];
          for (const item of itensAlterados) {
            if (!idsConhecidosRef.current.has(item.id)) {
              idsConhecidosRef.current.add(item.id);
              novosDetectados.push(item);
            }
          }

          const idIgnorado = idEmEscritaLocalRef?.current ?? null;
          setItens((atuais) =>
            mesclarDeltaColecao(atuais, itensAlterados, ordenarRef.current, idIgnorado),
          );

          if (novosDetectados.length > 0 && !metadados.temEscritasPendentes) {
            aoChegarNovosItensRef.current?.(novosDetectados);
          }
        },
        aoErro: () => {
          setEstadoConexao("degradado");
        },
      },
    );

    return () => {
      desinscrever();
    };
  }, [organizacaoId, observador, idEmEscritaLocalRef]);

  return {
    itens,
    setItens,
    estadoConexao,
  };
}

