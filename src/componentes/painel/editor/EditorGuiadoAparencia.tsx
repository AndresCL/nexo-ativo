"use client";

import { AcoesPublicacaoPagina } from "@/componentes/painel/AcoesPublicacaoPagina";
import { usePublicacaoPagina } from "@/ganchos/usePublicacaoPagina";

import { AvisosPublicidade } from "@/componentes/painel/AvisosPublicidade";
import { notificar } from "@/componentes/interface/notificacoes/notificar";

import Link from "next/link";
import { Palette } from "lucide-react";
import type { ServicoEditorAparenciaPorta } from "@/aplicacao/portas/portasEditorAparencia";
import type { ItemAcaoHome } from "@/dominio/entidades/paginaPublicada";
import {
  avaliarProntidaoPublicacaoPagina,
  converterRascunhoParaConteudoPublicado,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { useEstadoEditorAparencia } from "@/estados/estadoEditorAparencia";
import { servicoEditorAparenciaCliente } from "@/infraestrutura/painel/servicoEditorAparenciaCliente";
import { AlternadorPreviaDispositivo } from "@/componentes/editorial/AlternadorPreviaDispositivo";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { NavegacaoAparencia, SecoesFormularioAparencia } from "./SecoesFormularioAparencia";
import { BlocoAvaliacoesGoogle } from "@/componentes/editorial/avaliacoes/BlocoAvaliacoesGoogle";
import type { PreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { resolverAcoesVitrineComMicrofluxos } from "@/dominio/entidades/paginaPublicada";

export interface PropriedadesEditorGuiadoAparencia {
  readonly previaEquipe?: PreviaEquipeVitrine;
  readonly microfluxos?: readonly DefinicaoMicrofluxo[];
  readonly identificadorPublico: string;
  readonly nomeOrganizacao: string;
  readonly emailVerificado: boolean;
  readonly podeEditarAparencia: boolean;
  readonly podePublicarPagina: boolean;
  readonly servicoEditor?: ServicoEditorAparenciaPorta;
}

export function EditorGuiadoAparencia({
  previaEquipe,
  microfluxos = [],
  identificadorPublico,
  nomeOrganizacao,
  emailVerificado,
  podeEditarAparencia,
  podePublicarPagina,
  servicoEditor = servicoEditorAparenciaCliente,
}: PropriedadesEditorGuiadoAparencia) {
  const rascunho = useEstadoEditorAparencia((e) => e.rascunho);
  const possuiAlteracoesNaoSalvas = useEstadoEditorAparencia((e) => e.possuiAlteracoesNaoSalvas);
  const versaoPublicadaAtual = useEstadoEditorAparencia((e) => e.versaoPublicadaAtual);
  const marcarRascunhoSalvo = useEstadoEditorAparencia((e) => e.marcarRascunhoSalvo);
  const registrarNovaPublicacao = useEstadoEditorAparencia((e) => e.registrarNovaPublicacao);

  const paginaPrevia = converterRascunhoParaConteudoPublicado(rascunho, {
    identificadorPublico,
    versaoPublicada: versaoPublicadaAtual ?? 1,
  });
  const paginaComExperiencias = {
    ...paginaPrevia,
    acoesPrincipais: resolverAcoesVitrineComMicrofluxos(paginaPrevia.acoesPrincipais, microfluxos),
  };

  const pendenciasPublicacao = avaliarProntidaoPublicacaoPagina(rascunho, {
    emailVerificado,
  });

  const controle = usePublicacaoPagina({
    versaoPublicadaInicial: versaoPublicadaAtual,
    podeSalvarRascunho: podeEditarAparencia,
    podePublicarPagina,
    haAlteracoesNaoSalvas: possuiAlteracoesNaoSalvas,
    garantirRascunhoInicial: podeEditarAparencia,
    salvarRascunho: async () => {
      await servicoEditor.salvarRascunho(rascunho);
      marcarRascunhoSalvo(new Date().toISOString());
    },
    validarPublicacao: () => {
      const pendencia = pendenciasPublicacao[0];
      if (pendencia) throw new Error(pendencia.mensagem);
    },
    publicarPagina: () => servicoEditor.publicarPagina(rascunho.organizacaoId),
    aoPublicar: (resultado) =>
      registrarNovaPublicacao(resultado.versaoPublicada, resultado.publicadoEmIso),
  });

  function aoAcionarItemPrevia(acao: ItemAcaoHome) {
    notificar.informacao(
      `Prévia da ação "${acao.rotulo}": conduzirá o visitante para ${acao.destino}.`,
    );
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-marfim-200/80 pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
              <Palette className="h-3.5 w-3.5" aria-hidden="true" />
              Sua vitrine · {nomeOrganizacao}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
                Aparência e publicação
              </h1>
              <span
                data-testid="selo-versao-publicada"
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  versaoPublicadaAtual !== null
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border border-marfim-200 bg-marfim-50 text-mineral-600"
                }`}
              >
                {versaoPublicadaAtual !== null
                  ? `Publicada · v${versaoPublicadaAtual}`
                  : "Ainda não publicada"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-mineral-600">
              Personalize sua página e acompanhe o resultado na prévia.
            </p>
          </div>

          <AcoesPublicacaoPagina
            controle={controle}
            identificadorPublico={identificadorPublico}
            exibirSalvarRascunho
            publicacaoBloqueada={pendenciasPublicacao.length > 0}
            orientacao="Publicar página salva as alterações pendentes antes de atualizar a vitrine."
          />
        </div>
      </header>

      <AvisosPublicidade areas={["texto_livre", "portfolio"]} />

      {pendenciasPublicacao.length > 0 ? (
        <CartaoSuperficie
          preenchimento="compacto"
          className="rounded-2xl border-sky-200 bg-gradient-to-b from-sky-50/80 to-white shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-mineral-950">
                Conclua antes de publicar sua página:
              </p>
              <ul className="list-disc space-y-0.5 pl-4 text-xs text-mineral-800">
                {pendenciasPublicacao.map((pendencia) => (
                  <li key={pendencia.codigo}>{pendencia.mensagem}</li>
                ))}
              </ul>
            </div>

            {!emailVerificado ? (
              <Botao variante="operacional_secundario" tamanho="compacto" comoFilho>
                <Link href="/verificar-email">Confirmar e-mail</Link>
              </Botao>
            ) : null}
          </div>
        </CartaoSuperficie>
      ) : null}

      <NavegacaoAparencia />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
        <SecoesFormularioAparencia
          servicoUpload={servicoEditor}
          somenteLeitura={!podeEditarAparencia || controle.ocupado}
          microfluxos={microfluxos}
        />

        <div className="min-w-0 space-y-3 xl:sticky xl:top-6">
          <AlternadorPreviaDispositivo
            aparencia="clara"
            paginaBase={paginaComExperiencias}
            previaEquipe={previaEquipe}
            aoAcionarItem={aoAcionarItemPrevia}
            complementoChamada={
              podeEditarAparencia ? (
                <BlocoAvaliacoesGoogle
                  key={rascunho.avaliacoesGoogle?.identificadorLocal}
                  pagina={paginaPrevia}
                  previa
                />
              ) : undefined
            }
          />
          <p className="px-1 text-[11px] leading-relaxed text-mineral-500">
            As alterações aparecem aqui enquanto você edita. Use “Publicar página” para atualizar /
            {identificadorPublico}.
          </p>
        </div>
      </div>
    </div>
  );
}
