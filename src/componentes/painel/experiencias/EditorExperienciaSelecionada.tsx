"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Trash2,
} from "lucide-react";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import type {
  DefinicaoMicrofluxo,
  EtapaMicrofluxo,
  TipoAcaoVitrine,
} from "@/dominio/microfluxos/tiposMicrofluxo";
import {
  OPCOES_ANIMACAO_DESTAQUE,
  resolverAnimacaoDestaque,
  type AnimacaoDestaque,
} from "@/dominio/microfluxos/animacaoDestaque";
import { avaliarIntegridadeGrafoMicrofluxo } from "@/dominio/microfluxos/validadorGrafoMicrofluxo";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { CanvasEditorVisualFluxos } from "../microfluxos/CanvasEditorVisualFluxos";
import { SeletorIconeAcaoPopover } from "../editor/SeletorIconeAcaoPopover";
import { TituloExperienciaEditavel } from "../catalogo/TituloExperienciaEditavel";
import { ConfiguracaoEquipeVitrine } from "../catalogo/ConfiguracaoEquipeVitrine";
import { ConfiguracaoPostExperiencia } from "../catalogo/ConfiguracaoPostExperiencia";
import { ConfiguracaoAgendaExperiencia } from "../catalogo/ConfiguracaoAgendaExperiencia";
import { OpcaoOcultarTituloVideosExperiencia } from "../catalogo/OpcaoOcultarTituloVideosExperiencia";
import { DESCRITORES_TIPO_ACAO } from "./descritoresTipoAcao";
import { SecaoColecaoAcervoExperiencia } from "./SecaoColecaoAcervoExperiencia";
import { SecaoConfiguracaoPixExperiencia } from "./SecaoConfiguracaoPixExperiencia";

export interface PropriedadesEditorExperienciaSelecionada {
  readonly organizacaoId: string;
  readonly identificadorPublico: string;
  readonly fluxoAtual: DefinicaoMicrofluxo;
  readonly microfluxos: readonly DefinicaoMicrofluxo[];
  readonly profissionais: readonly ProfissionalEquipe[];
  readonly quantidadeProfissionaisAtivos?: number;
  readonly podeAlterar: boolean;
  readonly permiteFinanceiro: boolean;
  readonly permitePixManual: boolean;
  readonly servicoCatalogo: ServicoCatalogoConteudoPorta;
  readonly aoVoltarParaLista: () => void;
  readonly aoAlterarExibicao: (valor: string) => void;
  readonly aoSolicitarExclusao: (fluxoId: string) => void;
  readonly aoAtualizarFluxo: (atualizador: (atual: DefinicaoMicrofluxo) => DefinicaoMicrofluxo) => void;
  readonly aoAtualizarEtapa: (
    etapaId: string,
    atualizador: (etapa: EtapaMicrofluxo) => EtapaMicrofluxo,
  ) => void;
}

export function EditorExperienciaSelecionada({
  organizacaoId,
  identificadorPublico,
  fluxoAtual,
  microfluxos,
  profissionais,
  quantidadeProfissionaisAtivos,
  podeAlterar,
  permiteFinanceiro,
  permitePixManual,
  servicoCatalogo,
  aoVoltarParaLista,
  aoAlterarExibicao,
  aoSolicitarExclusao,
  aoAtualizarFluxo,
  aoAtualizarEtapa,
}: PropriedadesEditorExperienciaSelecionada) {
  const inconsistenciasGrafo = avaliarIntegridadeGrafoMicrofluxo(fluxoAtual);
  const grafoIntegro = inconsistenciasGrafo.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={aoVoltarParaLista}
          className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-marfim-200 bg-white px-3 py-1.5 text-xs font-semibold text-mineral-800 shadow-2xs transition hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Voltar para a lista</span>
        </button>

        <p className="text-xs text-mineral-500">
          Editando experiência ·{" "}
          <span className="font-semibold text-mineral-900">
            {fluxoAtual.titulo}
          </span>
        </p>
      </div>

      <fieldset
        id="editor-experiencia-selecionada"
        aria-label={`Configuração de ${fluxoAtual.titulo}`}
        disabled={!podeAlterar}
        className="min-w-0 space-y-4"
      >
        <div className="space-y-4 rounded-2xl border border-marfim-200 bg-gradient-to-b from-indigo-50/30 via-white to-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex w-full min-w-0 flex-auto items-center gap-3 sm:w-auto sm:flex-1">
              {fluxoAtual.tipoAcao !== "secao_equipe" ? (
                <SeletorIconeAcaoPopover
                  key={fluxoAtual.id}
                  compacto
                  valorSelecionado={fluxoAtual.iconeBotaoHome ?? "automatico"}
                  disabled={!podeAlterar}
                  aoSelecionar={(iconeId) =>
                    aoAtualizarFluxo((atual) => ({ ...atual, iconeBotaoHome: iconeId }))
                  }
                />
              ) : null}
              <div className="min-w-0 flex-1 space-y-1">
                {fluxoAtual.tipoAcao === "secao_equipe" ? (
                  <p className="text-[11px] font-medium text-mineral-600">Título na vitrine</p>
                ) : null}
                <TituloExperienciaEditavel
                  key={fluxoAtual.id}
                  valor={
                    fluxoAtual.tipoAcao === "secao_equipe"
                      ? fluxoAtual.rotuloBotaoHome || fluxoAtual.titulo
                      : fluxoAtual.titulo
                  }
                  rotuloCampo={
                    fluxoAtual.tipoAcao === "secao_equipe" ? "Título na vitrine" : undefined
                  }
                  placeholder={
                    fluxoAtual.tipoAcao === "secao_equipe"
                      ? "Ex.: Converse com nossa equipe"
                      : undefined
                  }
                  limiteCaracteres={fluxoAtual.tipoAcao === "secao_equipe" ? 80 : undefined}
                  disabled={!podeAlterar}
                  aoAlterar={(titulo) =>
                    aoAtualizarFluxo((atual) => ({
                      ...atual,
                      titulo,
                      rotuloBotaoHome: titulo,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex items-end gap-2.5">
              <label className="space-y-1 text-xs font-medium text-mineral-700">
                <span className="block">Exibição</span>
                <select
                  aria-label="Exibição"
                  value={
                    !fluxoAtual.ativo
                      ? "oculta"
                      : fluxoAtual.destaquePrimarioHome
                        ? "destaque"
                        : "visivel"
                  }
                  onChange={(evento) => aoAlterarExibicao(evento.target.value)}
                  className="min-h-10 rounded-lg border border-marfim-200 bg-white px-3 text-sm text-mineral-950"
                >
                  <option value="oculta">Oculta</option>
                  <option value="visivel">Visível</option>
                  <option value="destaque">Em destaque</option>
                </select>
              </label>

              {fluxoAtual.destaquePrimarioHome ? (
                <label className="space-y-1 text-xs font-medium text-mineral-700">
                  <span className="block">Animação</span>
                  <select
                    aria-label="Animação do destaque"
                    disabled={!podeAlterar}
                    value={resolverAnimacaoDestaque(
                      fluxoAtual.animacaoDestaque,
                      fluxoAtual.animarBordaDestaque,
                    )}
                    onChange={(evento) => {
                      const novaAnimacao = evento.target.value as AnimacaoDestaque;
                      aoAtualizarFluxo((f) => ({
                        ...f,
                        animacaoDestaque: novaAnimacao,
                        animarBordaDestaque: novaAnimacao === "brilho_interior",
                      }));
                    }}
                    className="min-h-10 rounded-lg border border-marfim-200 bg-white px-3 text-sm text-mineral-950"
                  >
                    {OPCOES_ANIMACAO_DESTAQUE.map((opcao) => (
                      <option key={opcao.valor} value={opcao.valor}>
                        {opcao.rotulo}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <details key={fluxoAtual.id} className="relative">
                <summary
                  aria-label="Mais opções da experiência"
                  className="flex min-h-10 min-w-10 cursor-pointer list-none items-center justify-center rounded-md text-mineral-600 hover:bg-marfim-100 [&::-webkit-details-marker]:hidden"
                >
                  <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                </summary>
                <div className="absolute right-0 z-30 mt-1 w-52 rounded-lg border border-marfim-200 bg-white p-1 shadow-lg">
                  <button
                    type="button"
                    disabled={!podeAlterar}
                    onClick={(evento) => {
                      if (!podeAlterar) return;
                      evento.currentTarget.closest("details")?.removeAttribute("open");
                      aoSolicitarExclusao(fluxoAtual.id);
                    }}
                    className="flex min-h-10 w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Excluir experiência
                  </button>
                </div>
              </details>
            </div>
          </div>

          <div className="grid gap-3 border-t border-marfim-200 pt-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="tipo-acao-vitrine"
                className="block text-[11px] font-semibold tracking-wider text-mineral-700 uppercase"
              >
                Tipo de Ação na Vitrine
              </label>
              <select
                id="tipo-acao-vitrine"
                value={
                  fluxoAtual.tipoAcao === "secao_portfolio"
                    ? "microfluxo"
                    : (fluxoAtual.tipoAcao ?? "microfluxo")
                }
                disabled={!podeAlterar}
                onChange={(e) => {
                  const novoTipo = e.target.value as TipoAcaoVitrine;
                  aoAtualizarFluxo((atual) => ({
                    ...atual,
                    tipoAcao: novoTipo,
                    ...(novoTipo === "secao_equipe" ? { urlDestinoOpcional: "#equipe" } : {}),
                    ...(novoTipo === "secao_servicos" ? { urlDestinoOpcional: "#servicos" } : {}),
                    ...(novoTipo === "secao_produtos" ? { urlDestinoOpcional: "#produtos" } : {}),
                    ...(novoTipo === "agenda" && !atual.configuracaoAgenda
                      ? {
                          configuracaoAgenda: {
                            exigirTelefone: true,
                            exibirCampoObservacoes: true,
                          },
                        }
                      : {}),
                    ...(novoTipo === "publicacao_post" && !atual.configuracaoPost
                      ? {
                          configuracaoPost: {
                            corpoTexto: "",
                            cta: { tipoAcao: "whatsapp" },
                          },
                        }
                      : {}),
                  }));
                }}
                className="mt-1 w-full rounded-lg border border-marfim-200 bg-white px-2.5 py-1.5 text-xs text-mineral-950 focus:border-indigo-400 focus:outline-none"
              >
                {Object.entries(DESCRITORES_TIPO_ACAO)
                  .filter(([valor]) => valor !== "secao_portfolio")
                  .map(([valor, descritor]) => (
                    <option key={valor} value={valor}>
                      {descritor.rotulo}
                    </option>
                  ))}
              </select>
              {fluxoAtual.tipoAcao === "secao_videos" ? (
                <OpcaoOcultarTituloVideosExperiencia organizacaoId={organizacaoId} />
              ) : null}
            </div>

            <div>
              <label
                htmlFor="subtitulo-vitrine-experiencia"
                className="block text-[11px] font-semibold tracking-wider text-mineral-700 uppercase"
              >
                {fluxoAtual.tipoAcao === "secao_equipe"
                  ? "Subtítulo na vitrine (opcional)"
                  : "Subtítulo do botão na vitrine (apoio na Home)"}
              </label>
              <input
                id="subtitulo-vitrine-experiencia"
                aria-label={
                  fluxoAtual.tipoAcao === "secao_equipe"
                    ? "Subtítulo na vitrine"
                    : "Subtítulo discreto do botão"
                }
                type="text"
                value={fluxoAtual.subtituloBotaoHome ?? ""}
                disabled={!podeAlterar}
                onChange={(e) =>
                  aoAtualizarFluxo((atual) => ({
                    ...atual,
                    subtituloBotaoHome: e.target.value,
                  }))
                }
                placeholder={
                  fluxoAtual.tipoAcao === "secao_equipe"
                    ? "Ex.: Encontre quem pode ajudar você"
                    : "Ex.: Atendimento rápido e sob medida"
                }
                className="mt-1 w-full rounded-lg border border-marfim-200 bg-white px-2.5 py-1.5 text-xs text-mineral-950 placeholder:text-mineral-400 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          {fluxoAtual.tipoAcao === "secao_produtos" || fluxoAtual.tipoAcao === "secao_servicos" ? (
            <SecaoColecaoAcervoExperiencia
              fluxoAtual={fluxoAtual}
              microfluxos={microfluxos}
              podeAlterar={podeAlterar}
              aoAtualizarFluxo={aoAtualizarFluxo}
            />
          ) : null}

          {fluxoAtual.tipoAcao?.startsWith("secao_") ? (
            <CampoFormulario
              rotulo="Título da seção (opcional)"
              textoAuxiliar="Exibido no modal e no painel do celular. Em branco, usamos o título padrão."
              maxLength={100}
              value={fluxoAtual.tituloSecao ?? ""}
              disabled={!podeAlterar}
              placeholder={
                fluxoAtual.tipoAcao === "secao_produtos"
                  ? "Ex.: Nossos produtos"
                  : fluxoAtual.tipoAcao === "secao_portfolio"
                    ? "Ex.: Nossos projetos"
                    : fluxoAtual.tipoAcao === "secao_servicos"
                      ? "Ex.: Como podemos ajudar"
                      : "Ex.: Conheça os especialistas"
              }
              onChange={(evento) =>
                aoAtualizarFluxo((atual) => ({
                  ...atual,
                  tituloSecao: evento.target.value,
                }))
              }
            />
          ) : null}

          {fluxoAtual.tipoAcao === "secao_equipe" ? (
            <ConfiguracaoEquipeVitrine
              valor={fluxoAtual.posicionamentoEquipe}
              limiteAvatares={fluxoAtual.limiteAvataresEquipe}
              aoAlterarLimiteAvatares={(limiteAvataresEquipe) =>
                aoAtualizarFluxo((atual) => ({ ...atual, limiteAvataresEquipe }))
              }
              disabled={!podeAlterar}
              quantidadeProfissionais={quantidadeProfissionaisAtivos}
              aoAlterar={(posicionamentoEquipe) =>
                aoAtualizarFluxo((atual) => ({ ...atual, posicionamentoEquipe }))
              }
            />
          ) : null}

          {fluxoAtual.tipoAcao === "agenda" ? (
            <ConfiguracaoAgendaExperiencia
              fluxoAtual={fluxoAtual}
              desabilitado={!podeAlterar}
              aoAlterarAgenda={(configuracaoAgenda) =>
                aoAtualizarFluxo((atual) => ({ ...atual, configuracaoAgenda }))
              }
            />
          ) : null}

          {fluxoAtual.tipoAcao === "publicacao_post" ? (
            <ConfiguracaoPostExperiencia
              organizacaoId={organizacaoId}
              fluxoAtual={fluxoAtual}
              microfluxosDisponiveis={microfluxos}
              servicoUpload={servicoCatalogo}
              desabilitado={!podeAlterar}
              aoAlterarPost={(configuracaoPost) =>
                aoAtualizarFluxo((atual) => ({ ...atual, configuracaoPost }))
              }
            />
          ) : null}

          {fluxoAtual.tipoAcao === "link_externo" ? (
            <div className="pt-2">
              <label
                htmlFor="url-destino-externo"
                className="block text-[11px] font-semibold tracking-wider text-mineral-700 uppercase"
              >
                URL de Destino Externo
              </label>
              <div className="relative mt-1">
                <Globe className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-mineral-400" />
                <input
                  id="url-destino-externo"
                  type="url"
                  value={fluxoAtual.urlDestinoOpcional ?? ""}
                  disabled={!podeAlterar}
                  onChange={(e) =>
                    aoAtualizarFluxo((atual) => ({
                      ...atual,
                      urlDestinoOpcional: e.target.value,
                    }))
                  }
                  placeholder="https://exemplo.com.br/catalogo"
                  className="w-full rounded-lg border border-marfim-200 bg-white py-1.5 pr-2.5 pl-8 text-xs text-mineral-950 placeholder:text-mineral-400 focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-mineral-500">
                O visitante será direcionado para este link ao clicar no botão na vitrine da Home.
              </p>
            </div>
          ) : fluxoAtual.tipoAcao === "whatsapp" ? (
            <div className="pt-2">
              <label
                htmlFor="url-destino-whatsapp"
                className="block text-[11px] font-semibold tracking-wider text-mineral-700 uppercase"
              >
                Número ou Link do WhatsApp
              </label>
              <div className="relative mt-1">
                <MessageCircle className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-mineral-400" />
                <input
                  id="url-destino-whatsapp"
                  type="text"
                  value={fluxoAtual.urlDestinoOpcional ?? ""}
                  disabled={!podeAlterar}
                  onChange={(e) =>
                    aoAtualizarFluxo((atual) => ({
                      ...atual,
                      urlDestinoOpcional: e.target.value,
                    }))
                  }
                  placeholder="5511999990000 ou https://wa.me/5511999990000"
                  className="w-full rounded-lg border border-marfim-200 bg-white py-1.5 pr-2.5 pl-8 text-xs text-mineral-950 placeholder:text-mineral-400 focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-mineral-500">
                Abre o aplicativo ou WhatsApp Web diretamente ao clicar na vitrine.
              </p>
            </div>
          ) : fluxoAtual.tipoAcao === "telefone" ? (
            <div className="pt-2">
              <label
                htmlFor="url-destino-telefone"
                className="block text-[11px] font-semibold tracking-wider text-mineral-700 uppercase"
              >
                Telefone para Discagem Direta
              </label>
              <div className="relative mt-1">
                <Phone className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-mineral-400" />
                <input
                  id="url-destino-telefone"
                  type="tel"
                  value={fluxoAtual.urlDestinoOpcional ?? ""}
                  disabled={!podeAlterar}
                  onChange={(e) =>
                    aoAtualizarFluxo((atual) => ({
                      ...atual,
                      urlDestinoOpcional: e.target.value,
                    }))
                  }
                  placeholder="(11) 3000-0000 ou 1130000000"
                  className="w-full rounded-lg border border-marfim-200 bg-white py-1.5 pr-2.5 pl-8 text-xs text-mineral-950 placeholder:text-mineral-400 focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-mineral-500">
                Inicia uma chamada telefônica direta ao tocar no botão.
              </p>
            </div>
          ) : fluxoAtual.tipoAcao === "secao_equipe" ? (
            <Link
              href="/painel/equipe"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-xs font-semibold text-indigo-700 hover:text-indigo-900"
            >
              Gerenciar equipe
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>

        {!grafoIntegro ? (
          <details
            open={!grafoIntegro}
            className="rounded-md border border-amber-300 bg-amber-50/80 p-3 text-xs text-amber-900 shadow-xs"
          >
            <summary className="flex cursor-pointer items-center gap-1.5 font-semibold text-amber-950">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-amber-500" />
              Conexões pendentes em “{fluxoAtual.titulo}” ({inconsistenciasGrafo.length})
            </summary>
            <p className="mt-2 leading-relaxed text-amber-800">
              Você pode salvar o rascunho a qualquer momento. Para publicar na vitrine, conecte os
              caminhos destacados abaixo no canvas:
            </p>
            <ul className="mt-2.5 space-y-1.5 border-l-2 border-amber-300 pl-2">
              {inconsistenciasGrafo.map((prob, idx) => (
                <li key={`${prob.codigo}-${idx}`} className="leading-relaxed">
                  {prob.mensagem}
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {!fluxoAtual.tipoAcao ||
        fluxoAtual.tipoAcao === "microfluxo" ||
        fluxoAtual.tipoAcao === "secao_servicos" ||
        fluxoAtual.tipoAcao === "secao_portfolio" ? (
          <>
            <CanvasEditorVisualFluxos
              key={fluxoAtual.id}
              fluxo={fluxoAtual}
              aoSalvarFluxo={(atualizado) => aoAtualizarFluxo(() => atualizado)}
              podeEditar={podeAlterar}
              fluxos={microfluxos}
              profissionais={profissionais}
              identificadorPublico={identificadorPublico}
              permiteFinanceiro={permiteFinanceiro}
            />

            <SecaoConfiguracaoPixExperiencia
              fluxoAtual={fluxoAtual}
              identificadorPublico={identificadorPublico}
              podeAlterar={podeAlterar}
              permitePixManual={permitePixManual}
              aoAtualizarFluxo={aoAtualizarFluxo}
              aoAtualizarEtapa={aoAtualizarEtapa}
            />
          </>
        ) : null}
      </fieldset>
    </div>
  );
}

