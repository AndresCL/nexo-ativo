"use client";

import { AcoesPublicacaoPagina } from "@/componentes/painel/AcoesPublicacaoPagina";
import { AlertaPendenciasPublicacao } from "@/componentes/painel/AlertaPendenciasPublicacao";
import { usePublicacaoPagina } from "@/ganchos/usePublicacaoPagina";

import { AvisosPublicidade } from "@/componentes/painel/AvisosPublicidade";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import type { ServicoEditorAparenciaPorta } from "@/aplicacao/portas/portasEditorAparencia";
import type { AcervoPublicoVitrine } from "@/dominio/entidades/catalogoConteudo";
import {
  avaliarProntidaoPublicacaoPagina,
  converterRascunhoParaConteudoPublicado,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { useEstadoEditorAparencia } from "@/estados/estadoEditorAparencia";
import { servicoEditorAparenciaCliente } from "@/infraestrutura/painel/servicoEditorAparenciaCliente";
import { AlternadorPreviaDispositivo } from "@/componentes/editorial/AlternadorPreviaDispositivo";
import {
  AlternadorMobileEditorPrevia,
  type ModoMobileEditorPrevia,
} from "@/componentes/painel/AlternadorMobileEditorPrevia";
import { NavegacaoAparencia, SecoesFormularioAparencia } from "./SecoesFormularioAparencia";
import type { PreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { resolverAcoesVitrineComMicrofluxos } from "@/dominio/entidades/paginaPublicada";

export interface PropriedadesEditorGuiadoAparencia {
  readonly acervo?: AcervoPublicoVitrine;
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
  acervo,
  previaEquipe,
  microfluxos = [],
  identificadorPublico,
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
  const definirAbaAtiva = useEstadoEditorAparencia((e) => e.definirAbaAtiva);

  const searchParams = useSearchParams();
  useEffect(() => {
    const abaParam = searchParams?.get?.("aba");
    if (
      abaParam === "identidade" ||
      abaParam === "acoes" ||
      abaParam === "midia" ||
      abaParam === "estilo" ||
      abaParam === "galeria_seo"
    ) {
      definirAbaAtiva(abaParam);
    }
  }, [searchParams, definirAbaAtiva]);

  const acervoPrevia = useMemo<AcervoPublicoVitrine>(() => {
    if (acervo) {
      return acervo;
    }
    const profissionaisFallback = (previaEquipe?.avatares ?? []).map((perfil, indice) => ({
      id: perfil.id,
      organizacaoId: rascunho.organizacaoId,
      identificadorCartao: perfil.id,
      nomeCompleto: perfil.nomeCompleto,
      cargoOuEspecialidade: "",
      minibiografia: "",
      urlFotoPerfil: perfil.urlFotoPerfil,
      pontoFocalFoto: perfil.pontoFocalFoto,
      especialidades: [],
      servicosVinculadosIds: [],
      aceitaSolicitacoesDiretas: false,
      ativo: true,
      ordemExibicao: indice,
      atualizadoEmIso: "",
    }));
    return {
      servicos: [],
      produtos: [],
      projetosPortfolio: [],
      profissionais: profissionaisFallback,
      microfluxos,
    };
  }, [acervo, microfluxos, previaEquipe, rascunho.organizacaoId]);

  const microfluxosEfetivos = acervo?.microfluxos ?? microfluxos;

  const paginaPrevia = converterRascunhoParaConteudoPublicado(rascunho, {
    identificadorPublico,
    versaoPublicada: versaoPublicadaAtual ?? 1,
  });
  const paginaComExperiencias = {
    ...paginaPrevia,
    acoesPrincipais: resolverAcoesVitrineComMicrofluxos(
      paginaPrevia.acoesPrincipais,
      microfluxosEfetivos,
    ),
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

  const [modoMobile, setModoMobile] = useState<ModoMobileEditorPrevia>("editor");

  return (
    <div className="space-y-6">
      <header className="border-b border-marfim-200/80 pb-3 sm:pb-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
                Aparência e publicação
              </h1>
              <span
                data-testid="selo-versao-publicada"
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${versaoPublicadaAtual !== null
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
            motivoBloqueioPublicacao={pendenciasPublicacao[0]?.mensagem}
            orientacao="Publicar página salva as alterações pendentes antes de atualizar a vitrine."
          />
        </div>
      </header>

      <AvisosPublicidade areas={["texto_livre", "portfolio"]} />

      <AlertaPendenciasPublicacao
        pendencias={pendenciasPublicacao}
        emailVerificado={emailVerificado}
      />

      <AlternadorMobileEditorPrevia
        modoAtivo={modoMobile}
        aoAlterarModo={setModoMobile}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
        <div
          className={combinarClasses(
            "min-w-0 space-y-5",
            modoMobile === "editor" ? "block" : "hidden xl:block",
          )}
        >
          <NavegacaoAparencia />

          <SecoesFormularioAparencia
            servicoUpload={servicoEditor}
            somenteLeitura={!podeEditarAparencia || controle.ocupado}
            microfluxos={microfluxos}
          />
        </div>

        <div
          className={combinarClasses(
            "min-w-0 space-y-3 xl:sticky xl:top-6",
            modoMobile === "previa" ? "block" : "hidden xl:block",
          )}
        >
          <AlternadorPreviaDispositivo
            aparencia="clara"
            paginaBase={paginaComExperiencias}
            acervo={acervoPrevia}
            exibirAvaliacoesGoogle={podeEditarAparencia}
          />
          <p className="px-1 text-[11px] leading-relaxed text-mineral-500">
            Prévia interativa: teste botões, catálogos e experiências aqui enquanto edita. Use
            “Publicar página” para atualizar /{identificadorPublico}.
          </p>
        </div>
      </div>
    </div>
  );
}
