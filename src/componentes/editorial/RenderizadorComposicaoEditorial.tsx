import type { ComponentType } from "react";
import type { TipoComposicaoEditorial } from "@/dominio/entidades/composicaoEditorial";
import { ComposicaoGaleriaEditorial } from "./ComposicaoGaleriaEditorial";
import { ComposicaoImersiva, type PropriedadesComposicaoEditorial } from "./ComposicaoImersiva";
import { ComposicaoRetratoEditorial } from "./ComposicaoRetratoEditorial";

const MAPA_COMPOSICOES_EDITORIAIS: Readonly<
  Record<TipoComposicaoEditorial, ComponentType<PropriedadesComposicaoEditorial>>
> = {
  imersivo: ComposicaoImersiva,
  retrato_editorial: ComposicaoRetratoEditorial,
  galeria_editorial: ComposicaoGaleriaEditorial,
};

/**
 * Seleciona dinamicamente a composição editorial preservando o mesmo contrato de dados (OCP / LSP).
 * Alterar a composição no painel nunca causa perda de conteúdo ou quebra de renderização.
 */
export function RenderizadorComposicaoEditorial(propriedades: PropriedadesComposicaoEditorial) {
  const ComponenteComposicao = MAPA_COMPOSICOES_EDITORIAIS[propriedades.pagina.composicaoVisual];

  return <ComponenteComposicao {...propriedades} />;
}
