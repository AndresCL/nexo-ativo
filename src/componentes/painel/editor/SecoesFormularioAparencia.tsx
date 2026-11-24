"use client";

import type { PortaUploadMidiaEditorial } from "@/aplicacao/portas/portasEditorAparencia";
import {
  type IntensidadeVeloEscuro,
  type TipoEfeitoCantosEditorial,
  type TomDotsCantosEditorial,
} from "@/dominio/entidades/paginaPublicada";
import { useEstadoEditorAparencia } from "@/estados/estadoEditorAparencia";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { TransicaoAlternancia } from "@/componentes/interface/TransicaoAlternancia";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { CampoUploadMidiaStorage } from "./CampoUploadMidiaStorage";
import { SeletorDegradadoMidia } from "./SeletorDegradadoMidia";
import { DEGRADADO_EDITORIAL_PADRAO } from "@/dominio/objetos-valor/degradadoEditorial";
import { FormularioAvaliacoesGoogle } from "./FormularioAvaliacoesGoogle";
import { SecaoEstiloECores } from "./secoes/SecaoEstiloECores";
import { SecaoIdentidadeAparencia } from "./SecaoIdentidadeAparencia";
import { SecaoRedesSociais } from "./secoes/SecaoRedesSociais";
import { SeletorEtapasEditorAparencia } from "./secoes/SeletorEtapasEditorAparencia";

import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";

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
  const atualizarConfiguracaoRedesSociais = useEstadoEditorAparencia(
    (e) => e.atualizarConfiguracaoRedesSociais,
  );
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
          <SecaoIdentidadeAparencia
            organizacaoId={rascunho.organizacaoId}
            identidade={rascunho.identidade}
            atualizarIdentidade={atualizarIdentidade}
            servicoUpload={servicoUpload}
            somenteLeitura={somenteLeitura}
          />
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
          <SecaoRedesSociais
            redesSociais={rascunho.redesSociais}
            tamanhoRedesSociais={rascunho.tamanhoRedesSociais}
            somenteLeitura={somenteLeitura}
            adicionarRedeSocial={adicionarRedeSocial}
            atualizarRedeSocial={atualizarRedeSocial}
            moverRedeSocial={moverRedeSocial}
            removerRedeSocial={removerRedeSocial}
            atualizarConfiguracaoRedesSociais={atualizarConfiguracaoRedesSociais}
          />
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
