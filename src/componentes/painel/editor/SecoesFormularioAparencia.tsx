"use client";

import { ChevronDown, Image, Palette, Plus, Search, Share2, Trash2, Type } from "lucide-react";
import type { PortaUploadMidiaEditorial } from "@/aplicacao/portas/portasEditorAparencia";
import {
  CATALOGO_PALETAS_EDITORIAIS,
  CATALOGO_TIPOGRAFIAS_EDITORIAIS,
  obterComposicoesEditoriaisAtivas,
  type IdentificadorPaletaEditorial,
  type IdentificadorTipografiaEditorial,
} from "@/dominio/entidades/composicaoEditorial";
import {
  type IntensidadeVeloEscuro,
  type TipoEfeitoCantosEditorial,
  type TipoRedeSocial,
} from "@/dominio/entidades/paginaPublicada";
import { useEstadoEditorAparencia, type AbaEditorAparencia } from "@/estados/estadoEditorAparencia";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { TransicaoAlternancia } from "@/componentes/interface/TransicaoAlternancia";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { CampoUploadMidiaStorage } from "./CampoUploadMidiaStorage";
import { SeletorPontoFocalMidia } from "./SeletorPontoFocalMidia";
import { SeletorDegradadoMidia } from "./SeletorDegradadoMidia";
import { DEGRADADO_EDITORIAL_PADRAO } from "@/dominio/objetos-valor/degradadoEditorial";
import { FormularioAvaliacoesGoogle } from "./FormularioAvaliacoesGoogle";

import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";

const ABAS_EDITOR: readonly {
  readonly id: AbaEditorAparencia;
  readonly rotulo: string;
  readonly descricao: string;
  readonly icone: typeof Palette;
  readonly ativa: string;
  readonly cor: string;
}[] = [
    {
      id: "estilo",
      rotulo: "1. Estilo e cores",
      descricao: "Composição e paleta",
      icone: Palette,
      ativa: "border-indigo-200 bg-indigo-50 text-indigo-900",
      cor: "bg-indigo-100 text-indigo-700",
    },
    {
      id: "identidade",
      rotulo: "2. Identidade e texto",
      descricao: "Sua marca e mensagem",
      icone: Type,
      ativa: "border-sky-200 bg-sky-50 text-sky-900",
      cor: "bg-sky-100 text-sky-700",
    },
    {
      id: "midia",
      rotulo: "3. Mídia e foco",
      descricao: "Fotos e vídeos",
      icone: Image,
      ativa: "border-violet-200 bg-violet-50 text-violet-900",
      cor: "bg-violet-100 text-violet-700",
    },
    {
      id: "acoes",
      rotulo: "4. Redes sociais",
      descricao: "Seus canais de contato",
      icone: Share2,
      ativa: "border-sky-200 bg-sky-50 text-sky-900",
      cor: "bg-sky-100 text-sky-700",
    },
    {
      id: "galeria_seo",
      rotulo: "5. Google e SEO",
      descricao: "Busca e avaliações",
      icone: Search,
      ativa: "border-emerald-200 bg-emerald-50 text-emerald-900",
      cor: "bg-emerald-100 text-emerald-700",
    },
  ];

const OPCOES_REDE_SOCIAL: readonly { readonly valor: TipoRedeSocial; readonly nome: string }[] = [
  { valor: "instagram", nome: "Instagram" },
  { valor: "linkedin", nome: "LinkedIn" },
  { valor: "whatsapp", nome: "WhatsApp" },
  { valor: "youtube", nome: "YouTube" },
  { valor: "behance", nome: "Behance" },
  { valor: "pinterest", nome: "Pinterest" },
  { valor: "tiktok", nome: "TikTok" },
  { valor: "facebook", nome: "Facebook" },
  { valor: "site", nome: "Site institucional" },
];

export interface PropriedadesSecoesFormularioAparencia {
  readonly servicoUpload: PortaUploadMidiaEditorial;
  readonly somenteLeitura?: boolean;
  readonly microfluxos?: readonly DefinicaoMicrofluxo[];
}

export function SecoesFormularioAparencia({
  servicoUpload,
  somenteLeitura = false,
  microfluxos: _microfluxos = [],
}: PropriedadesSecoesFormularioAparencia) {
  const abaAtiva = useEstadoEditorAparencia((e) => e.abaAtiva);
  const rascunho = useEstadoEditorAparencia((e) => e.rascunho);
  const alterarEstiloVisual = useEstadoEditorAparencia((e) => e.alterarEstiloVisual);
  const atualizarIdentidade = useEstadoEditorAparencia((e) => e.atualizarIdentidade);
  const atualizarMidiaFundo = useEstadoEditorAparencia((e) => e.atualizarMidiaFundo);
  const definirPontoFocalMidia = useEstadoEditorAparencia((e) => e.definirPontoFocalMidia);
  const adicionarRedeSocial = useEstadoEditorAparencia((e) => e.adicionarRedeSocial);
  const atualizarRedeSocial = useEstadoEditorAparencia((e) => e.atualizarRedeSocial);
  const removerRedeSocial = useEstadoEditorAparencia((e) => e.removerRedeSocial);
  const atualizarSeo = useEstadoEditorAparencia((e) => e.atualizarSeo);

  const urlVisualizacaoPontoFocal =
    rascunho.midiaFundo.tipo === "video"
      ? (rascunho.midiaFundo.urlPosterVideo ?? "")
      : rascunho.midiaFundo.urlPrincipal;

  return (
    <div className="space-y-5">
      <TransicaoAlternancia chaveId={abaAtiva} variante="fade">
        {abaAtiva === "estilo" ? (
          <div
            id="painel-aba-estilo"
            role="tabpanel"
            aria-labelledby="aba-estilo"
            className="space-y-6"
          >
            <CartaoSuperficie className="space-y-5 rounded-2xl border-marfim-200 bg-gradient-to-b from-indigo-50/30 via-white to-white p-5 shadow-xs sm:p-6">
              <div>
                <h2 className="text-base font-semibold text-mineral-950">Composição editorial</h2>
                <p className="mt-0.5 text-xs text-mineral-600">
                  Escolha como sua página principal organiza imagem, título e ações. Você pode
                  trocar quando quiser sem perder textos ou mídias.
                </p>
              </div>

              <div className="grid gap-3">
                {obterComposicoesEditoriaisAtivas().map((item) => {
                  const codigo = item.codigo;
                  const ativa = rascunho.composicaoVisual === codigo;
                  return (
                    <button
                      key={codigo}
                      type="button"
                      disabled={somenteLeitura}
                      aria-pressed={ativa}
                      onClick={() => alterarEstiloVisual({ composicaoVisual: codigo })}
                      className={combinarClasses(
                        "flex flex-col items-start rounded-lg border p-4 text-left transition-colors disabled:opacity-60",
                        ativa
                          ? "border-indigo-300 bg-indigo-50/60 ring-1 ring-indigo-200"
                          : "border-marfim-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/20",
                      )}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-sm font-semibold tracking-tight text-mineral-950">
                          {item.nome}
                        </span>
                        {ativa ? (
                          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-medium text-indigo-800">
                            Selecionada
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-mineral-700">
                        {item.resumoParaCliente}
                      </p>
                      <p className="mt-2 text-[11px] text-mineral-500">
                        Ideal para: {item.segmentosRecomendados.join(" · ")}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CartaoSuperficie>

            <CartaoSuperficie className="space-y-4 rounded-2xl border-marfim-200 bg-gradient-to-b from-indigo-50/20 via-white to-white p-5 shadow-xs sm:p-6">
              <div>
                <h2 className="text-base font-semibold text-mineral-950">Espaçamento entre experiências</h2>
                <p className="mt-0.5 text-xs text-mineral-600">
                  Controla o respiro vertical entre os botões de experiências na vitrine pública.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {[
                  {
                    codigo: "compacto" as const,
                    nome: "Compacto",
                    resumo: "Espaçamento enxuto (10px, o atual), ideal para 4+ experiências na tela.",
                    classeVisual: "gap-1",
                  },
                  {
                    codigo: "medio" as const,
                    nome: "Médio",
                    resumo: "Espaçamento equilibrado (16px), visual arejado e toque confortável.",
                    classeVisual: "gap-2.5",
                  },
                  {
                    codigo: "amplo" as const,
                    nome: "Amplo",
                    resumo: "Maior respiro (24px), destaque marcante para cada ação.",
                    classeVisual: "gap-4",
                  },
                ].map((opcao) => {
                  const valorAtual = rascunho.espacamentoAcoes ?? "compacto";
                  const ativo = valorAtual === opcao.codigo;
                  return (
                    <button
                      key={opcao.codigo}
                      type="button"
                      disabled={somenteLeitura}
                      aria-pressed={ativo}
                      onClick={() => alterarEstiloVisual({ espacamentoAcoes: opcao.codigo })}
                      className={combinarClasses(
                        "flex flex-col justify-between rounded-xl border p-3.5 text-left transition-colors cursor-pointer disabled:opacity-60",
                        ativo
                          ? "border-indigo-300 bg-indigo-50/60 ring-1 ring-indigo-200"
                          : "border-marfim-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/20",
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-mineral-950">{opcao.nome}</span>
                          {ativo ? (
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-800">
                              Ativo
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-mineral-600">{opcao.resumo}</p>
                      </div>

                      {/* Prévia gráfica ilustrativa do espaçamento */}
                      <div className={combinarClasses("mt-3 flex w-full flex-col rounded-lg bg-marfim-100/70 p-2", opcao.classeVisual)}>
                        <div className="h-2 w-full rounded-sm bg-mineral-300/80" />
                        <div className="h-2 w-full rounded-sm bg-mineral-300/80" />
                        <div className="h-2 w-full rounded-sm bg-mineral-300/80" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </CartaoSuperficie>

            <CartaoSuperficie className="space-y-5 rounded-2xl border-marfim-200 bg-gradient-to-b from-violet-50/30 via-white to-white p-5 shadow-xs sm:p-6">
              <div>
                <h2 className="text-base font-semibold text-mineral-950">Paleta cromática</h2>
                <p className="mt-0.5 text-xs text-mineral-600">
                  Combinações calibradas para alto contraste de leitura e atmosfera autoral.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(CATALOGO_PALETAS_EDITORIAIS) as IdentificadorPaletaEditorial[]).map(
                  (codigo) => {
                    const paleta = CATALOGO_PALETAS_EDITORIAIS[codigo];
                    const ativa = rascunho.paletaId === codigo;
                    return (
                      <button
                        key={codigo}
                        type="button"
                        disabled={somenteLeitura}
                        aria-pressed={ativa}
                        onClick={() => alterarEstiloVisual({ paletaId: codigo })}
                        className={combinarClasses(
                          "flex items-center justify-between gap-3 rounded-lg border p-3.5 text-left transition-colors disabled:opacity-60",
                          ativa
                            ? "border-indigo-300 bg-indigo-50/60 ring-1 ring-indigo-200"
                            : "border-marfim-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/20",
                        )}
                      >
                        <div>
                          <p className="text-sm font-medium text-mineral-950">{paleta.nome}</p>
                          <p className="text-[11px] text-mineral-500">
                            {paleta.temaEscuro ? "Atmosfera escura" : "Atmosfera clara"}
                          </p>
                        </div>
                        <span className="flex items-center -space-x-1.5" aria-hidden="true">
                          <span
                            style={{ backgroundColor: paleta.corFundoPrincipal }}
                            className="h-6 w-6 rounded-full border border-black/15"
                          />
                          <span
                            style={{ backgroundColor: paleta.corDestaque }}
                            className="h-6 w-6 rounded-full border border-black/15"
                          />
                          <span
                            style={{ backgroundColor: paleta.corTextoPrincipal }}
                            className="h-6 w-6 rounded-full border border-black/15"
                          />
                        </span>
                      </button>
                    );
                  },
                )}
              </div>

              <div className="mt-4 rounded-lg border border-marfim-300 bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-mineral-950">
                      Cor primária da marca (personalizada)
                    </p>
                    <p className="text-[11px] text-mineral-500">
                      Use a cor da sua marca para gerar uma paleta personalizada.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label="Seletor de cor primária da marca"
                      disabled={somenteLeitura}
                      value={rascunho.corPersonalizadaHex || "#1e3a8a"}
                      onChange={(evento) =>
                        alterarEstiloVisual({ corPersonalizadaHex: evento.target.value })
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-marfim-300 bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      aria-label="Código da cor primária da marca"
                      placeholder="#1e3a8a"
                      disabled={somenteLeitura}
                      value={rascunho.corPersonalizadaHex || ""}
                      onChange={(evento) =>
                        alterarEstiloVisual({ corPersonalizadaHex: evento.target.value })
                      }
                      className="w-24 rounded-md border border-marfim-300 px-2 py-1 text-xs font-mono text-mineral-900 focus:border-mineral-950 focus:outline-none"
                    />
                    {rascunho.corPersonalizadaHex ? (
                      <button
                        type="button"
                        disabled={somenteLeitura}
                        onClick={() => alterarEstiloVisual({ corPersonalizadaHex: "" })}
                        className="rounded px-2 py-1 text-[11px] text-mineral-600 hover:bg-marfim-100"
                        title="Limpar cor customizada e usar paleta fixa"
                      >
                        Limpar
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <details className="group rounded-xl border border-marfim-200 bg-white">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-mineral-700">
                  Personalizar cores dos elementos
                  <ChevronDown
                    className="h-4 w-4 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>

                <div className="border-t border-marfim-100 p-4">
                  <div className="flex flex-col gap-2 border-b border-marfim-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-mineral-950">
                        Cores dos elementos
                      </h3>
                      <p className="text-[11px] text-mineral-500">
                        Personalize qualquer elemento ou restaure para os tons de fábrica calibrados
                        do tema.
                      </p>
                    </div>
                    {rascunho.customizacaoTokens &&
                      Object.keys(rascunho.customizacaoTokens).length > 0 ? (
                      <button
                        type="button"
                        disabled={somenteLeitura}
                        onClick={() => alterarEstiloVisual({ customizacaoTokens: null })}
                        className="inline-flex items-center gap-1.5 rounded-md border border-mineral-300 bg-white px-2.5 py-1 text-xs font-medium text-mineral-700 shadow-xs hover:bg-marfim-100"
                      >
                        Restaurar cores originais do tema
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-mineral-400">
                        Cores originais ativas
                      </span>
                    )}
                  </div>

                  <div className="mt-3 divide-y divide-marfim-200 text-xs">
                    {[
                      {
                        chave: "corDestaque" as const,
                        rotulo: "Destaques e etiquetas",
                        descricao: "Sobretítulo ('Feirão Acelera'), tags, badges e foco",
                        padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corDestaque,
                      },
                      {
                        chave: "corTextoPrincipal" as const,
                        rotulo: "Título Principal",
                        descricao: "Nome da marca, títulos H1/H2 e títulos de seção",
                        padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corTextoPrincipal,
                      },
                      {
                        chave: "corTextoSecundario" as const,
                        rotulo: "Subtítulo & Apoio",
                        descricao: "Descrições editoriais, subtítulos de botões e endereços",
                        padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corTextoSecundario,
                      },
                      {
                        chave: "corFundoPrincipal" as const,
                        rotulo: "Fundo Geral",
                        descricao: "Fundo da página, base da bottom sheet e cartão VIP",
                        padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corFundoPrincipal,
                      },
                      {
                        chave: "corSuperficie" as const,
                        rotulo: "Fundo dos cartões",
                        descricao: "Fundo dos cartões de serviços, produtos e campos",
                        padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corSuperficie,
                      },
                      {
                        chave: "corBorda" as const,
                        rotulo: "Bordas & Linhas",
                        descricao: "Contornos de cards, divisores e molduras",
                        padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corBorda,
                      },
                      {
                        chave: "corCtaFundo" as const,
                        rotulo: "Botão principal (Fundo)",
                        descricao: "Fundo do botão de conversão principal na Home",
                        padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corCtaFundo,
                      },
                      {
                        chave: "corCtaTexto" as const,
                        rotulo: "Botão principal (Texto)",
                        descricao: "Texto e ícone dentro do botão CTA principal",
                        padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corCtaTexto,
                      },
                      {
                        chave: "corSecundarioFundo" as const,
                        rotulo: "Botões Secundários (Fundo)",
                        descricao: "Fundo dos botões secundários da Home e WhatsApp",
                        padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corSecundarioFundo,
                      },
                      {
                        chave: "corSecundarioTexto" as const,
                        rotulo: "Botões Secundários (Texto)",
                        descricao: "Texto e ícone dos botões secundários",
                        padrao: CATALOGO_PALETAS_EDITORIAIS[rascunho.paletaId].corSecundarioTexto,
                      },
                    ].map((token) => {
                      const valorAtual = rascunho.customizacaoTokens?.[token.chave] || token.padrao;

                      return (
                        <div
                          key={token.chave}
                          className="flex flex-col gap-1.5 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-medium text-mineral-900">{token.rotulo}</p>
                            <p className="text-[11px] text-mineral-500">{token.descricao}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              aria-label={`Selecionar cor: ${token.rotulo}`}
                              disabled={somenteLeitura}
                              value={valorAtual.startsWith("#") ? valorAtual : "#ffffff"}
                              onChange={(e) =>
                                alterarEstiloVisual({
                                  customizacaoTokens: { [token.chave]: e.target.value },
                                })
                              }
                              className="h-7 w-8 cursor-pointer rounded border border-marfim-300 bg-transparent p-0.5"
                            />
                            <input
                              type="text"
                              aria-label={`Código da cor: ${token.rotulo}`}
                              disabled={somenteLeitura}
                              value={valorAtual}
                              onChange={(e) =>
                                alterarEstiloVisual({
                                  customizacaoTokens: { [token.chave]: e.target.value },
                                })
                              }
                              className="w-24 rounded border border-marfim-300 px-2 py-0.5 font-mono text-[11px] text-mineral-900 focus:border-mineral-950 focus:outline-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </details>
            </CartaoSuperficie>

            <CartaoSuperficie className="space-y-5 rounded-2xl border-marfim-200 bg-gradient-to-b from-sky-50/30 via-white to-white p-5 shadow-xs sm:p-6">
              <div>
                <h2 className="text-base font-semibold text-mineral-950">Par tipográfico</h2>
                <p className="mt-0.5 text-xs text-mineral-600">
                  Define a personalidade dos títulos em relação aos textos de apoio.
                </p>
              </div>

              <div className="grid gap-3">
                {(
                  Object.keys(CATALOGO_TIPOGRAFIAS_EDITORIAIS) as IdentificadorTipografiaEditorial[]
                ).map((codigo) => {
                  const tipografia = CATALOGO_TIPOGRAFIAS_EDITORIAIS[codigo];
                  const ativa = rascunho.tipografiaId === codigo;
                  return (
                    <button
                      key={codigo}
                      type="button"
                      disabled={somenteLeitura}
                      aria-pressed={ativa}
                      onClick={() => alterarEstiloVisual({ tipografiaId: codigo })}
                      className={combinarClasses(
                        "rounded-lg border p-3.5 text-left transition-colors disabled:opacity-60",
                        ativa
                          ? "border-indigo-300 bg-indigo-50/60 ring-1 ring-indigo-200"
                          : "border-marfim-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/20",
                      )}
                    >
                      <p
                        className={combinarClasses(
                          "text-lg text-mineral-950",
                          tipografia.classeTitulo,
                        )}
                      >
                        {tipografia.nome}
                      </p>
                      <p className="mt-1 text-xs text-mineral-600">{tipografia.descricao}</p>
                    </button>
                  );
                })}
              </div>
            </CartaoSuperficie>
          </div>
        ) : null}

        {abaAtiva === "identidade" ? (
          <div
            id="painel-aba-identidade"
            role="tabpanel"
            aria-labelledby="aba-identidade"
            className="space-y-6"
          >
            <CartaoSuperficie className="space-y-5 rounded-2xl border-marfim-200 bg-gradient-to-b from-sky-50/30 via-white to-white p-5 shadow-xs sm:p-6">
              <div>
                <h2 className="text-base font-semibold text-mineral-950">Identidade da marca</h2>
                <p className="mt-0.5 text-xs text-mineral-600">
                  Como seu nome profissional, escritório ou empresa é apresentado no topo da página.
                </p>
              </div>

              <div className="space-y-2">
                <CampoFormulario
                  rotulo="Nome de exibição"
                  required
                  disabled={somenteLeitura}
                  value={rascunho.identidade.nomeExibicao}
                  onChange={(evento) => atualizarIdentidade({ nomeExibicao: evento.target.value })}
                  placeholder="Ex.: Estúdio Alvorada ou Dra. Helena Vasconcelos"
                />
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-mineral-700">
                  <input
                    type="checkbox"
                    disabled={somenteLeitura}
                    checked={rascunho.identidade.mostrarNomeExibicao ?? true}
                    onChange={(evento) =>
                      atualizarIdentidade({ mostrarNomeExibicao: evento.target.checked })
                    }
                    className="h-4 w-4 rounded border-marfim-300 text-mineral-950 focus:ring-mineral-900"
                  />
                  Mostrar nome da marca na vitrine
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <CampoFormulario
                    rotulo="Especialidade ou subtítulo curto"
                    disabled={somenteLeitura}
                    value={rascunho.identidade.subtituloCurto ?? ""}
                    onChange={(evento) =>
                      atualizarIdentidade({ subtituloCurto: evento.target.value })
                    }
                    placeholder="Ex.: Arquitetura Residencial"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-mineral-700">
                    <input
                      type="checkbox"
                      disabled={somenteLeitura}
                      checked={rascunho.identidade.mostrarSubtituloCurto ?? true}
                      onChange={(evento) =>
                        atualizarIdentidade({ mostrarSubtituloCurto: evento.target.checked })
                      }
                      className="h-4 w-4 rounded border-marfim-300 text-mineral-950 focus:ring-mineral-900"
                    />
                    Mostrar especialidade ou subtítulo na vitrine
                  </label>
                </div>

                <div className="space-y-4 sm:col-span-2">
                  <CampoUploadMidiaStorage
                    organizacaoId={rascunho.organizacaoId}
                    rotulo="Logotipo opcional"
                    textoAuxiliar="Se preferir assinatura tipográfica limpa, deixe este campo em branco."
                    categoria="imagem"
                    valorUrl={rascunho.identidade.urlLogotipoOpcional ?? ""}
                    desabilitado={somenteLeitura}
                    servicoUpload={servicoUpload}
                    aoAlterarUrl={(novaUrl) =>
                      atualizarIdentidade({ urlLogotipoOpcional: novaUrl || undefined })
                    }
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-mineral-800">
                      Alinhamento no topo da vitrine
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { valor: "esquerda", rotulo: "Esquerda" },
                          { valor: "centro", rotulo: "Centro" },
                          { valor: "direita", rotulo: "Direita" },
                        ] as const
                      ).map((opcao) => {
                        const ativo =
                          (rascunho.identidade.alinhamentoCabecalho ?? "esquerda") === opcao.valor;
                        return (
                          <button
                            key={opcao.valor}
                            type="button"
                            disabled={somenteLeitura}
                            onClick={() =>
                              atualizarIdentidade({ alinhamentoCabecalho: opcao.valor })
                            }
                            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${ativo
                                ? "border-mineral-950 bg-mineral-950 text-white"
                                : "border-marfim-300 bg-white text-mineral-700 hover:bg-marfim-50"
                              }`}
                          >
                            {opcao.rotulo}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <CampoFormulario
                  rotulo="Cidade e estado ou endereço"
                  disabled={somenteLeitura}
                  value={rascunho.identidade.cidadeEstado ?? ""}
                  onChange={(evento) => atualizarIdentidade({ cidadeEstado: evento.target.value })}
                  placeholder="Ex.: Cabo Frio · RJ ou Av. Central, 100"
                />
              </div>

              <CampoFormulario
                rotulo="Link do Google Maps (opcional)"
                textoAuxiliar="Cole o link do Google Maps para que os visitantes possam abrir a rota diretamente ao clicar no endereço na página inicial."
                disabled={somenteLeitura}
                value={rascunho.identidade.urlMapaEnderecoOpcional ?? ""}
                onChange={(evento) => {
                  const valor = evento.target.value.trim();
                  atualizarIdentidade({ urlMapaEnderecoOpcional: valor ? valor : undefined });
                }}
                placeholder="Ex.: https://maps.app.goo.gl/... ou https://goo.gl/maps/..."
              />

              <div className="grid gap-4 md:grid-cols-2">
                <CampoFormulario
                  rotulo="Telefone principal (opcional)"
                  type="tel"
                  maxLength={40}
                  textoAuxiliar="Número para chamadas telefônicas diretas de visitantes."
                  disabled={somenteLeitura}
                  value={rascunho.identidade.telefonePrincipalOpcional ?? ""}
                  onChange={(evento) =>
                    atualizarIdentidade({
                      telefonePrincipalOpcional: evento.target.value.trim() || undefined,
                    })
                  }
                  placeholder="Ex.: (22) 2644-8800"
                />

                <CampoFormulario
                  rotulo="Celular (opcional)"
                  type="tel"
                  maxLength={40}
                  textoAuxiliar="Número de celular para chamadas diretas de visitantes."
                  disabled={somenteLeitura}
                  value={rascunho.identidade.celularOpcional ?? ""}
                  onChange={(evento) =>
                    atualizarIdentidade({
                      celularOpcional: evento.target.value.trim() || undefined,
                    })
                  }
                  placeholder="Ex.: (22) 99999-8800"
                />
              </div>

              <CampoFormulario
                rotulo="Horário de funcionamento (opcional)"
                textoAuxiliar="Visível na página para orientar o visitante antes de ligar."
                disabled={somenteLeitura}
                value={rascunho.identidade.horarioFuncionamentoOpcional ?? ""}
                onChange={(evento) =>
                  atualizarIdentidade({
                    horarioFuncionamentoOpcional: evento.target.value.trim() || undefined,
                  })
                }
                placeholder="Ex.: Seg a Sex das 08h às 18h · Sáb 09h às 13h"
              />

              <CampoFormulario
                rotulo="Registro profissional (opcional)"
                textoAuxiliar="Útil para advogados (OAB), médicos (CRM), arquitetos (CAU), corretores (CRECI) ou dentistas (CRO)."
                disabled={somenteLeitura}
                value={rascunho.identidade.registroProfissionalOpcional ?? ""}
                onChange={(evento) =>
                  atualizarIdentidade({ registroProfissionalOpcional: evento.target.value })
                }
                placeholder="Ex.: OAB/SP 000.000"
              />
            </CartaoSuperficie>
          </div>
        ) : null}

        {abaAtiva === "midia" ? (
          <div
            id="painel-aba-midia"
            role="tabpanel"
            aria-labelledby="aba-midia"
            className="space-y-6"
          >
            <CartaoSuperficie className="space-y-5 rounded-2xl border-marfim-200 bg-gradient-to-b from-violet-50/30 via-white to-white p-5 shadow-xs sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-mineral-950">Mídia principal</h2>
                  <p className="mt-0.5 text-xs text-mineral-600">
                    Fotografia de alta presença ou vídeo ambiente silencioso em loop.
                  </p>
                </div>

                <div
                  role="group"
                  aria-label="Tipo de mídia principal"
                  className="inline-flex rounded-md border border-marfim-300 bg-marfim-50 p-0.5"
                >
                  <button
                    type="button"
                    disabled={somenteLeitura}
                    aria-pressed={rascunho.midiaFundo.tipo === "imagem"}
                    onClick={() => atualizarMidiaFundo({ tipo: "imagem" })}
                    className={combinarClasses(
                      "min-h-9 rounded-xs px-3 py-1 text-xs font-medium transition-colors",
                      rascunho.midiaFundo.tipo === "imagem"
                        ? "bg-indigo-50 text-indigo-900"
                        : "text-mineral-700 hover:text-mineral-950",
                    )}
                  >
                    Fotografia
                  </button>
                  <button
                    type="button"
                    disabled={somenteLeitura}
                    aria-pressed={rascunho.midiaFundo.tipo === "video"}
                    onClick={() => atualizarMidiaFundo({ tipo: "video" })}
                    className={combinarClasses(
                      "min-h-9 rounded-xs px-3 py-1 text-xs font-medium transition-colors",
                      rascunho.midiaFundo.tipo === "video"
                        ? "bg-indigo-50 text-indigo-900"
                        : "text-mineral-700 hover:text-mineral-950",
                    )}
                  >
                    Vídeo silencioso
                  </button>
                  <button
                    type="button"
                    disabled={somenteLeitura}
                    aria-pressed={rascunho.midiaFundo.tipo === "degradado"}
                    onClick={() =>
                      atualizarMidiaFundo({
                        tipo: "degradado",
                        degradadoOpcional:
                          rascunho.midiaFundo.degradadoOpcional ?? DEGRADADO_EDITORIAL_PADRAO,
                      })
                    }
                    className={combinarClasses(
                      "min-h-9 rounded-xs px-3 py-1 text-xs font-medium transition-colors",
                      rascunho.midiaFundo.tipo === "degradado"
                        ? "bg-indigo-50 text-indigo-900"
                        : "text-mineral-700 hover:text-mineral-950",
                    )}
                  >
                    Degradado
                  </button>
                </div>
              </div>

              {rascunho.midiaFundo.tipo === "degradado" ? (
                <SeletorDegradadoMidia
                  valor={rascunho.midiaFundo.degradadoOpcional}
                  somenteLeitura={somenteLeitura}
                  aoAlterar={(degradadoOpcional) => atualizarMidiaFundo({ degradadoOpcional })}
                />
              ) : null}

              {rascunho.midiaFundo.tipo === "imagem" ? (
                <>
                  <CampoUploadMidiaStorage
                    organizacaoId={rascunho.organizacaoId}
                    rotulo="Fotografia principal de fundo"
                    textoAuxiliar="Formatos aceitos: WebP, AVIF, JPEG ou PNG (até 8 MB)."
                    categoria="imagem"
                    obrigatorio
                    desabilitado={somenteLeitura}
                    valorUrl={rascunho.midiaFundo.urlPrincipal}
                    servicoUpload={servicoUpload}
                    aoAlterarUrl={(novaUrl) => atualizarMidiaFundo({ urlPrincipal: novaUrl })}
                  />

                  <CampoUploadMidiaStorage
                    organizacaoId={rascunho.organizacaoId}
                    rotulo="Fotografia vertical exclusiva para celular (opcional)"
                    textoAuxiliar="Se informada, será exibida automaticamente para visitantes no celular."
                    categoria="imagem"
                    desabilitado={somenteLeitura}
                    valorUrl={rascunho.midiaFundo.urlMobileOpcional ?? ""}
                    servicoUpload={servicoUpload}
                    aoAlterarUrl={(novaUrl) =>
                      atualizarMidiaFundo({ urlMobileOpcional: novaUrl || undefined })
                    }
                  />
                </>
              ) : rascunho.midiaFundo.tipo === "video" ? (
                <>
                  <CampoUploadMidiaStorage
                    organizacaoId={rascunho.organizacaoId}
                    rotulo="Vídeo silencioso em loop"
                    textoAuxiliar="Formatos aceitos: MP4 ou WebM silenciosos (até 25 MB)."
                    categoria="video"
                    obrigatorio
                    desabilitado={somenteLeitura}
                    valorUrl={rascunho.midiaFundo.urlPrincipal}
                    servicoUpload={servicoUpload}
                    aoAlterarUrl={(novaUrl) => atualizarMidiaFundo({ urlPrincipal: novaUrl })}
                  />

                  <CampoUploadMidiaStorage
                    organizacaoId={rascunho.organizacaoId}
                    rotulo="Imagem estática de capa (poster obrigatório)"
                    textoAuxiliar="Exibida instantaneamente antes do vídeo carregar e para visitantes que preferem movimento reduzido."
                    categoria="imagem"
                    obrigatorio
                    desabilitado={somenteLeitura}
                    valorUrl={rascunho.midiaFundo.urlPosterVideo ?? ""}
                    servicoUpload={servicoUpload}
                    aoAlterarUrl={(novaUrl) =>
                      atualizarMidiaFundo({ urlPosterVideo: novaUrl || undefined })
                    }
                  />
                </>
              ) : null}

              {rascunho.midiaFundo.tipo !== "degradado" ? (
                <CampoFormulario
                  rotulo="Descrição da imagem para acessibilidade (texto alternativo)"
                  required
                  disabled={somenteLeitura}
                  value={rascunho.midiaFundo.textoAlternativo}
                  onChange={(evento) =>
                    atualizarMidiaFundo({ textoAlternativo: evento.target.value })
                  }
                  placeholder="Ex.: Sala iluminada por luz natural com mobiliário em madeira"
                />
              ) : null}

              <div className="space-y-1.5">
                <p className="text-sm font-medium text-mineral-900">
                  Contraste do véu sobre a fotografia
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(
                    [
                      { valor: "nenhum", nome: "Nenhum" },
                      { valor: "suave", nome: "Suave" },
                      { valor: "equilibrado", nome: "Equilibrado" },
                      { valor: "intenso", nome: "Intenso" },
                    ] as readonly { valor: IntensidadeVeloEscuro; nome: string }[]
                  ).map((item) => {
                    const ativo = rascunho.midiaFundo.intensidadeVeloEscuro === item.valor;
                    return (
                      <button
                        key={item.valor}
                        type="button"
                        disabled={somenteLeitura}
                        aria-pressed={ativo}
                        onClick={() => atualizarMidiaFundo({ intensidadeVeloEscuro: item.valor })}
                        className={combinarClasses(
                          "min-h-10 rounded-md border px-3 py-2 text-xs font-medium transition-colors",
                          ativo
                            ? "border-indigo-200 bg-indigo-50 text-indigo-900"
                            : "border-marfim-300 bg-white text-mineral-800 hover:bg-marfim-100",
                        )}
                      >
                        {item.nome}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-medium text-mineral-900">
                  Efeito visual nas esquinas (acima da mídia)
                </p>
                <p className="text-xs text-mineral-600">
                  Aplica uma matriz de micropontos contemporânea nos 4 cantos da tela, acima do
                  vídeo e abaixo dos conteúdos.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { valor: "nenhum", nome: "Desativado" },
                      { valor: "dots", nome: "Dots modernos (ativado)" },
                    ] as readonly { valor: TipoEfeitoCantosEditorial; nome: string }[]
                  ).map((item) => {
                    const ativo = (rascunho.midiaFundo.efeitoCantos ?? "nenhum") === item.valor;
                    return (
                      <button
                        key={item.valor}
                        type="button"
                        disabled={somenteLeitura}
                        aria-pressed={ativo}
                        onClick={() => atualizarMidiaFundo({ efeitoCantos: item.valor })}
                        className={combinarClasses(
                          "min-h-10 rounded-md border px-3 py-2 text-xs font-medium transition-colors",
                          ativo
                            ? "border-indigo-200 bg-indigo-50 text-indigo-900"
                            : "border-marfim-300 bg-white text-mineral-800 hover:bg-marfim-100",
                        )}
                      >
                        {item.nome}
                      </button>
                    );
                  })}
                </div>

                {rascunho.midiaFundo.efeitoCantos === "dots" ? (
                  <div className="mt-3 rounded-lg border border-marfim-200 bg-marfim-50/60 p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="opacidade-dots-cantos"
                        className="text-xs font-medium text-mineral-800"
                      >
                        Opacidade dos dots
                      </label>
                      <span className="font-mono text-xs font-semibold text-mineral-900">
                        {rascunho.midiaFundo.opacidadeDotsCantos ?? 20}%
                      </span>
                    </div>
                    <input
                      id="opacidade-dots-cantos"
                      type="range"
                      min={5}
                      max={100}
                      step={5}
                      disabled={somenteLeitura}
                      value={rascunho.midiaFundo.opacidadeDotsCantos ?? 20}
                      onChange={(e) =>
                        atualizarMidiaFundo({ opacidadeDotsCantos: Number(e.target.value) })
                      }
                      className="h-2 w-full cursor-pointer accent-indigo-600"
                    />
                  </div>
                ) : null}
              </div>

              {rascunho.midiaFundo.tipo === "imagem" ? (
                <SeletorPontoFocalMidia
                  urlImagemVisualizacao={urlVisualizacaoPontoFocal}
                  textoAlternativo={rascunho.midiaFundo.textoAlternativo}
                  pontoFocalDesktop={rascunho.midiaFundo.pontoFocalDesktop}
                  pontoFocalMobile={rascunho.midiaFundo.pontoFocalMobile}
                  desabilitado={somenteLeitura}
                  aoAlterarPontoFocal={definirPontoFocalMidia}
                />
              ) : null}
            </CartaoSuperficie>
          </div>
        ) : null}

        {abaAtiva === "acoes" ? (
          <div
            id="painel-aba-acoes"
            role="tabpanel"
            aria-labelledby="aba-acoes"
            className="space-y-6"
          >
            <CartaoSuperficie className="space-y-5 rounded-2xl border-marfim-200 bg-gradient-to-b from-sky-50/30 via-white to-white p-5 shadow-xs sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-mineral-950">
                    Redes sociais discretas
                  </h2>
                  <p className="mt-0.5 text-xs text-mineral-600">
                    Exibidas de forma minimalista no rodapé da composição, sem competir com suas
                    ações principais.
                  </p>
                </div>

                <Botao
                  variante="operacional_secundario"
                  tamanho="compacto"
                  disabled={somenteLeitura || rascunho.redesSociais.length >= 9}
                  onClick={adicionarRedeSocial}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Adicionar rede</span>
                </Botao>
              </div>

              {rascunho.redesSociais.length === 0 ? (
                <p className="text-xs text-mineral-500">Nenhuma rede social cadastrada.</p>
              ) : (
                <div className="space-y-3">
                  {rascunho.redesSociais.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-2.5 rounded-md border border-marfim-300 bg-marfim-50/50 p-3 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-end"
                    >
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor={`rede-tipo-${item.id}`}
                          className="text-xs font-medium text-mineral-800"
                        >
                          Rede
                        </label>
                        <select
                          id={`rede-tipo-${item.id}`}
                          disabled={somenteLeitura}
                          value={item.rede}
                          onChange={(evento) =>
                            atualizarRedeSocial(item.id, {
                              rede: evento.target.value as TipoRedeSocial,
                            })
                          }
                          className="min-h-11 rounded-md border border-marfim-300 bg-white px-2.5 py-2 text-sm text-mineral-950 focus:border-mineral-950 focus:outline-none"
                        >
                          {OPCOES_REDE_SOCIAL.map((opcao) => (
                            <option key={opcao.valor} value={opcao.valor}>
                              {opcao.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      <CampoFormulario
                        rotulo="Endereço completo (https://...)"
                        disabled={somenteLeitura}
                        value={item.url}
                        onChange={(evento) =>
                          atualizarRedeSocial(item.id, { url: evento.target.value })
                        }
                      />

                      <Botao
                        variante="fantasma"
                        tamanho="compacto"
                        disabled={somenteLeitura}
                        aria-label={`Remover rede ${item.rede}`}
                        onClick={() => removerRedeSocial(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-alerta-erro" aria-hidden="true" />
                      </Botao>
                    </div>
                  ))}
                </div>
              )}
            </CartaoSuperficie>
          </div>
        ) : null}

        {abaAtiva === "galeria_seo" ? (
          <div
            id="painel-aba-galeria_seo"
            role="tabpanel"
            aria-labelledby="aba-galeria_seo"
            className="space-y-6"
          >
            <FormularioAvaliacoesGoogle somenteLeitura={somenteLeitura} />
            <CartaoSuperficie className="space-y-5 rounded-2xl border-marfim-200 bg-gradient-to-b from-emerald-50/30 via-white to-white p-5 shadow-xs sm:p-6">
              <div>
                <h2 className="text-base font-semibold text-mineral-950">
                  Apresentação no Google e compartilhamento (SEO)
                </h2>
                <p className="mt-0.5 text-xs text-mineral-600">
                  Personalize como seu link aparece no Google, WhatsApp e LinkedIn. Se deixar em
                  branco, usamos automaticamente seu nome e título editorial.
                </p>
              </div>

              <CampoFormulario
                rotulo="Título para buscadores (opcional)"
                disabled={somenteLeitura}
                value={rascunho.seo.tituloSeo ?? ""}
                onChange={(evento) => atualizarSeo({ tituloSeo: evento.target.value || undefined })}
                placeholder={`${rascunho.identidade.nomeExibicao} — Atendimento sob medida`}
              />

              <CampoFormulario
                rotulo="Descrição para compartilhamento (opcional)"
                disabled={somenteLeitura}
                value={rascunho.seo.descricaoSeo ?? ""}
                onChange={(evento) =>
                  atualizarSeo({ descricaoSeo: evento.target.value || undefined })
                }
                placeholder="Resumo objetivo exibido ao enviar seu link no WhatsApp ou aparecer no Google."
              />

              <CampoUploadMidiaStorage
                organizacaoId={rascunho.organizacaoId}
                rotulo="Imagem específica para compartilhamento (opcional)"
                textoAuxiliar="Caso não envie, geramos automaticamente um cartão editorial elegante com seu nome e cores."
                categoria="imagem"
                desabilitado={somenteLeitura}
                valorUrl={rascunho.seo.urlImagemCompartilhamento ?? ""}
                servicoUpload={servicoUpload}
                aoAlterarUrl={(novaUrl) =>
                  atualizarSeo({ urlImagemCompartilhamento: novaUrl || undefined })
                }
              />

              <label className="flex cursor-pointer items-center gap-2.5 rounded-md border border-marfim-300 bg-marfim-50/70 px-3.5 py-3 text-xs text-mineral-900">
                <input
                  type="checkbox"
                  disabled={somenteLeitura}
                  checked={rascunho.seo.indexavel === true}
                  onChange={(evento) => atualizarSeo({ indexavel: evento.target.checked })}
                  className="h-4 w-4 accent-mineral-950"
                />
                <span>Permitir que minha página publicada apareça em buscas no Google</span>
              </label>
            </CartaoSuperficie>
          </div>
        ) : null}
      </TransicaoAlternancia>
    </div>
  );
}

export function NavegacaoAparencia() {
  const abaAtiva = useEstadoEditorAparencia((e) => e.abaAtiva);
  const definirAbaAtiva = useEstadoEditorAparencia((e) => e.definirAbaAtiva);
  return (
    <div
      role="tablist"
      aria-label="Etapas de personalização da página"
      className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-5"
    >
      {ABAS_EDITOR.map((aba) => {
        const selecionada = abaAtiva === aba.id;
        const Icone = aba.icone;
        return (
          <button
            key={aba.id}
            id={`aba-${aba.id}`}
            role="tab"
            type="button"
            aria-selected={selecionada}
            aria-controls={`painel-aba-${aba.id}`}
            tabIndex={selecionada ? 0 : -1}
            onKeyDown={(evento) => {
              const indice = ABAS_EDITOR.findIndex((item) => item.id === aba.id);
              const proxima =
                evento.key === "ArrowRight"
                  ? (indice + 1) % ABAS_EDITOR.length
                  : evento.key === "ArrowLeft"
                    ? (indice - 1 + ABAS_EDITOR.length) % ABAS_EDITOR.length
                    : evento.key === "Home"
                      ? 0
                      : evento.key === "End"
                        ? ABAS_EDITOR.length - 1
                        : null;
              if (proxima === null) return;
              evento.preventDefault();
              const abaDestino = ABAS_EDITOR[proxima];
              if (!abaDestino) return;
              definirAbaAtiva(abaDestino.id);
              document.getElementById(`aba-${abaDestino.id}`)?.focus();
            }}
            onClick={() => definirAbaAtiva(aba.id)}
            className={combinarClasses(
              "flex min-h-20 min-w-0 items-center gap-3 rounded-xl border px-3 py-3 text-left text-xs font-semibold shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500",
              selecionada
                ? aba.ativa
                : "border-marfim-200 bg-white text-mineral-600 hover:border-marfim-300 hover:bg-marfim-50",
            )}
          >
            <span
              className={combinarClasses(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                aba.cor,
              )}
            >
              <Icone className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block">{aba.rotulo}</span>
              <span className="mt-1 block text-[10px] font-normal text-mineral-500">
                {aba.descricao}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
