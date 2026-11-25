"use client";

import { useMemo, useState, type ReactNode } from "react";
import { List } from "lucide-react";
import { AlternadorPreviaDispositivo } from "@/componentes/editorial/AlternadorPreviaDispositivo";
import {
  AlternadorMobileEditorPrevia,
  type ModoMobileEditorPrevia,
} from "@/componentes/painel/AlternadorMobileEditorPrevia";
import type { PosicaoCabecalhoMarca } from "@/dominio/editorial/faixaInicioExperiencias";
import type { IdentificadorBlocoSistemaVitrine } from "@/dominio/editorial/ordemBlocosVitrine";
import type {
  AcervoPublicoVitrine,
  ProdutoCatalogo,
  ProfissionalEquipe,
  ProjetoPortfolio,
  ServicoOrganizacao,
} from "@/dominio/entidades/catalogoConteudo";
import { resolverAcoesVitrineComMicrofluxos } from "@/dominio/entidades/paginaPublicada";
import {
  converterRascunhoParaConteudoPublicado,
  type RascunhoConfiguracaoPagina,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesLayoutListaComPreviaVitrine {
  readonly children: ReactNode;
  readonly rascunhoPagina?: RascunhoConfiguracaoPagina;
  readonly identificadorPublico: string;
  readonly versaoPublicada: number | null;
  readonly microfluxos: readonly DefinicaoMicrofluxo[];
  readonly ordemBlocosVitrine: readonly string[];
  readonly blocosSistemaOcultos: readonly IdentificadorBlocoSistemaVitrine[];
  readonly posicaoCabecalhoMarca: PosicaoCabecalhoMarca;
  readonly avaliacoesGoogleHabilitado?: boolean;
  readonly servicos?: readonly ServicoOrganizacao[];
  readonly produtos?: readonly ProdutoCatalogo[];
  readonly projetosPortfolio?: readonly ProjetoPortfolio[];
  readonly profissionais?: readonly ProfissionalEquipe[];
  readonly exibirAvaliacoesGoogle?: boolean;
}

export function LayoutListaComPreviaVitrine({
  children,
  rascunhoPagina,
  identificadorPublico,
  versaoPublicada,
  microfluxos,
  ordemBlocosVitrine,
  blocosSistemaOcultos,
  posicaoCabecalhoMarca,
  avaliacoesGoogleHabilitado,
  servicos = [],
  produtos = [],
  projetosPortfolio = [],
  profissionais = [],
  exibirAvaliacoesGoogle = false,
}: PropriedadesLayoutListaComPreviaVitrine) {
  const [abaMobile, setAbaMobile] = useState<ModoMobileEditorPrevia>("editor");

  const paginaComExperiencias = useMemo(() => {
    if (!rascunhoPagina) return null;

    const rascunhoSincronizado: RascunhoConfiguracaoPagina = {
      ...rascunhoPagina,
      ordemBlocosVitrine,
      blocosSistemaOcultos,
      identidade: {
        ...rascunhoPagina.identidade,
        posicaoCabecalho: posicaoCabecalhoMarca,
      },
      ...(rascunhoPagina.avaliacoesGoogle && avaliacoesGoogleHabilitado !== undefined
        ? {
            avaliacoesGoogle: {
              ...rascunhoPagina.avaliacoesGoogle,
              habilitado: avaliacoesGoogleHabilitado,
            },
          }
        : {}),
    };

    const paginaPrevia = converterRascunhoParaConteudoPublicado(rascunhoSincronizado, {
      identificadorPublico,
      versaoPublicada: versaoPublicada ?? 1,
    });

    return {
      ...paginaPrevia,
      acoesPrincipais: resolverAcoesVitrineComMicrofluxos(
        paginaPrevia.acoesPrincipais,
        microfluxos,
      ),
    };
  }, [
    avaliacoesGoogleHabilitado,
    blocosSistemaOcultos,
    identificadorPublico,
    microfluxos,
    ordemBlocosVitrine,
    posicaoCabecalhoMarca,
    rascunhoPagina,
    versaoPublicada,
  ]);

  const acervoPrevia = useMemo<AcervoPublicoVitrine>(
    () => ({
      servicos,
      produtos,
      projetosPortfolio,
      profissionais,
      microfluxos,
    }),
    [microfluxos, produtos, profissionais, projetosPortfolio, servicos],
  );

  if (!paginaComExperiencias) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      <AlternadorMobileEditorPrevia
        modoAtivo={abaMobile}
        aoAlterarModo={setAbaMobile}
        rotuloEditor="Lista"
        iconeEditor={<List className="h-3.5 w-3.5" aria-hidden="true" />}
        ariaLabel="Alternar entre lista e prévia"
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_410px]">
        <div className={combinarClasses("min-w-0", abaMobile === "editor" ? "block" : "hidden xl:block")}>
          {children}
        </div>

        <div
          className={combinarClasses(
            "min-w-0 space-y-3 xl:sticky xl:top-6",
            abaMobile === "previa" ? "block" : "hidden xl:block",
          )}
        >
          <AlternadorPreviaDispositivo
            aparencia="clara"
            paginaBase={paginaComExperiencias}
            acervo={acervoPrevia}
            exibirAvaliacoesGoogle={exibirAvaliacoesGoogle}
          />
          <p className="px-1 text-[11px] leading-relaxed text-mineral-500">
            Prévia interativa: reordene, oculte ou destaque blocos à esquerda e veja o resultado em
            tempo real.
          </p>
        </div>
      </div>
    </div>
  );
}

