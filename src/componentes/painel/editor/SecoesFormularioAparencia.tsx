"use client";

import {
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
} from "lucide-react";
import type { PortaUploadMidiaEditorial } from "@/aplicacao/portas/portasEditorAparencia";
import {
  type IntensidadeVeloEscuro,
  type TipoEfeitoCantosEditorial,
  type TomDotsCantosEditorial,
  type TipoRedeSocial,
} from "@/dominio/entidades/paginaPublicada";
import { useEstadoEditorAparencia } from "@/estados/estadoEditorAparencia";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { TransicaoAlternancia } from "@/componentes/interface/TransicaoAlternancia";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { CampoUploadMidiaStorage } from "./CampoUploadMidiaStorage";
import { SeletorDegradadoMidia } from "./SeletorDegradadoMidia";
import { DEGRADADO_EDITORIAL_PADRAO } from "@/dominio/objetos-valor/degradadoEditorial";
import {
  LISTA_POSICOES_CABECALHO_MARCA,
  resolverPosicaoCabecalhoMarca,
} from "@/dominio/editorial/faixaInicioExperiencias";
import { FormularioAvaliacoesGoogle } from "./FormularioAvaliacoesGoogle";
import { SecaoEstiloECores } from "./secoes/SecaoEstiloECores";
import { SeletorEtapasEditorAparencia } from "./secoes/SeletorEtapasEditorAparencia";

import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";

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
  const adicionarRedeSocial = useEstadoEditorAparencia((e) => e.adicionarRedeSocial);
  const atualizarRedeSocial = useEstadoEditorAparencia((e) => e.atualizarRedeSocial);
  const moverRedeSocial = useEstadoEditorAparencia((e) => e.moverRedeSocial);
  const removerRedeSocial = useEstadoEditorAparencia((e) => e.removerRedeSocial);
  const atualizarSeo = useEstadoEditorAparencia((e) => e.atualizarSeo);

  return (
    <div className="space-y-5">
      <TransicaoAlternancia chaveId={abaAtiva} variante="fade">
        {abaAtiva === "estilo" ? (
          <SecaoEstiloECores
            rascunho={rascunho}
            alterarEstiloVisual={alterarEstiloVisual}
            somenteLeitura={somenteLeitura}
          />
        ) : null}

        {abaAtiva === "identidade" ? (
          <div
            id="painel-aba-identidade"
            role="tabpanel"
            aria-labelledby="aba-identidade"
            className="space-y-6"
          >
            <CartaoSuperficie className="space-y-5 rounded-2xl bg-white p-5 shadow-xs sm:p-6">
              <div>
                <h2 className="text-base font-semibold text-mineral-950">Identidade da marca</h2>
                <p className="mt-0.5 text-xs text-mineral-600">
                  Como seu nome profissional, escritório ou empresa é apresentado na página.
                </p>
              </div>

              <div className="space-y-2">
                <CampoFormulario
                  rotulo="Nome de exibição"
                  required
                  disabled={somenteLeitura}
                  value={rascunho.identidade.nomeExibicao}
                  onChange={(evento) => atualizarIdentidade({ nomeExibicao: evento.target.value })}
                  placeholder="Nome da sua marca ou atuação"
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

                  {rascunho.identidade.urlLogotipoOpcional ? (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-mineral-800">
                        Bordas do logotipo
                      </label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {(
                          [
                            { valor: "natural", rotulo: "Natural" },
                            { valor: "suave", rotulo: "Suave" },
                            { valor: "arredondado", rotulo: "Arredondado" },
                            { valor: "circulo", rotulo: "Círculo" },
                          ] as const
                        ).map((opcao) => {
                          const ativo =
                            (rascunho.identidade.formatoBordaLogotipo ?? "natural") === opcao.valor;
                          return (
                            <button
                              key={opcao.valor}
                              type="button"
                              disabled={somenteLeitura}
                              onClick={() =>
                                atualizarIdentidade({ formatoBordaLogotipo: opcao.valor })
                              }
                              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                                ativo
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
                  ) : null}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-mineral-800">
                      Alinhamento da marca na vitrine
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

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-mineral-800">
                      Posição da marca na vitrine
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {LISTA_POSICOES_CABECALHO_MARCA.map((opcao) => {
                        const ativo =
                          resolverPosicaoCabecalhoMarca(rascunho.identidade.posicaoCabecalho) ===
                          opcao.codigo;
                        return (
                          <button
                            key={opcao.codigo}
                            type="button"
                            disabled={somenteLeitura}
                            aria-pressed={ativo}
                            onClick={() =>
                              atualizarIdentidade({ posicaoCabecalho: opcao.codigo })
                            }
                            className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                              ativo
                                ? "border-mineral-950 bg-mineral-950 text-white"
                                : "border-marfim-300 bg-white text-mineral-700 hover:bg-marfim-50"
                            }`}
                          >
                            <span className="block text-xs font-semibold">{opcao.nome}</span>
                            <span
                              className={`mt-0.5 block text-[11px] leading-snug ${
                                ativo ? "text-white/80" : "text-mineral-500"
                              }`}
                            >
                              {opcao.resumo}
                            </span>
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
                  placeholder="Ex.: São Paulo · SP ou Av. Paulista, 1000"
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
                  placeholder="Ex.: (11) 3000-0000"
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
                  placeholder="Ex.: (11) 99999-0000"
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
            <CartaoSuperficie className="space-y-5 rounded-2xl bg-white p-5 shadow-xs sm:p-6">
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
                        ? "bg-mineral-950 text-white"
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
                        ? "bg-mineral-950 text-white"
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
                        ? "bg-mineral-950 text-white"
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
                            ? "border-mineral-950 bg-mineral-950 text-white"
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
                            ? "border-mineral-950 bg-mineral-950 text-white"
                            : "border-marfim-300 bg-white text-mineral-800 hover:bg-marfim-100",
                        )}
                      >
                        {item.nome}
                      </button>
                    );
                  })}
                </div>

                {rascunho.midiaFundo.efeitoCantos === "dots" ? (
                  <div className="mt-3 space-y-3 rounded-lg border border-marfim-200 bg-marfim-50/60 p-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-mineral-800">
                        Tom dos dots
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            { valor: "neutro", nome: "Neutro" },
                            { valor: "destaque", nome: "Destaque" },
                            { valor: "borda", nome: "Borda suave" },
                          ] as readonly { valor: TomDotsCantosEditorial; nome: string }[]
                        ).map((item) => {
                          const ativo =
                            (rascunho.midiaFundo.tomDotsCantos ?? "neutro") === item.valor;
                          return (
                            <button
                              key={item.valor}
                              type="button"
                              disabled={somenteLeitura}
                              aria-pressed={ativo}
                              onClick={() => atualizarMidiaFundo({ tomDotsCantos: item.valor })}
                              className={combinarClasses(
                                "min-h-8 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                                ativo
                                  ? "border-mineral-950 bg-mineral-950 text-white"
                                  : "border-marfim-300 bg-white text-mineral-800 hover:bg-marfim-100",
                              )}
                            >
                              {item.nome}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
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
                  </div>
                ) : null}
              </div>
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
            <CartaoSuperficie className="space-y-5 rounded-2xl bg-white p-5 shadow-xs sm:p-6">
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
                  {rascunho.redesSociais.map((item, indice) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-lg border border-marfim-200 bg-white p-4"
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
                        rotulo="URL"
                        aria-label="URL (Endereço completo)"
                        placeholder="https://..."
                        disabled={somenteLeitura}
                        value={item.url}
                        onChange={(evento) =>
                          atualizarRedeSocial(item.id, { url: evento.target.value })
                        }
                      />

                      <div className="flex items-center justify-end gap-1 border-t border-marfim-100 pt-1">
                        <Botao
                          variante="fantasma"
                          tamanho="compacto"
                          disabled={somenteLeitura || indice === 0}
                          aria-label={`Mover rede ${item.rede} para cima`}
                          title="Mover para cima"
                          onClick={() => moverRedeSocial(item.id, "cima")}
                        >
                          <ArrowUp className="h-4 w-4 text-mineral-700" aria-hidden="true" />
                        </Botao>

                        <Botao
                          variante="fantasma"
                          tamanho="compacto"
                          disabled={somenteLeitura || indice === rascunho.redesSociais.length - 1}
                          aria-label={`Mover rede ${item.rede} para baixo`}
                          title="Mover para baixo"
                          onClick={() => moverRedeSocial(item.id, "baixo")}
                        >
                          <ArrowDown className="h-4 w-4 text-mineral-700" aria-hidden="true" />
                        </Botao>

                        <Botao
                          variante="fantasma"
                          tamanho="compacto"
                          disabled={somenteLeitura}
                          aria-label={`Remover rede ${item.rede}`}
                          title="Remover rede"
                          onClick={() => removerRedeSocial(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-alerta-erro" aria-hidden="true" />
                        </Botao>
                      </div>
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
            <CartaoSuperficie className="space-y-5 rounded-2xl bg-white p-5 shadow-xs sm:p-6">
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
  return <SeletorEtapasEditorAparencia />;
}
