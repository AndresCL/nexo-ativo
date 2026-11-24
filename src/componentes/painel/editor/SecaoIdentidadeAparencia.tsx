"use client";

import type { PortaUploadMidiaEditorial } from "@/aplicacao/portas/portasEditorAparencia";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { CampoUploadMidiaStorage } from "./CampoUploadMidiaStorage";
import { SeletorTamanhoCabecalhoMarca } from "./secoes/SeletorTamanhoCabecalhoMarca";
import {
  LISTA_POSICOES_CABECALHO_MARCA,
  resolverPosicaoCabecalhoMarca,
} from "@/dominio/editorial/faixaInicioExperiencias";
import type { RascunhoConfiguracaoPagina } from "@/dominio/entidades/rascunhoConfiguracaoPagina";

export interface PropriedadesSecaoIdentidadeAparencia {
  readonly organizacaoId: string;
  readonly identidade: RascunhoConfiguracaoPagina["identidade"];
  readonly atualizarIdentidade: (
    alteracoes: Partial<RascunhoConfiguracaoPagina["identidade"]>,
  ) => void;
  readonly servicoUpload: PortaUploadMidiaEditorial;
  readonly somenteLeitura: boolean;
}

export function SecaoIdentidadeAparencia({
  organizacaoId,
  identidade,
  atualizarIdentidade,
  servicoUpload,
  somenteLeitura,
}: PropriedadesSecaoIdentidadeAparencia) {
  return (
    <div
      id="painel-aba-identidade"
      role="tabpanel"
      aria-labelledby="aba-identidade"
      className="space-y-5"
    >
      {/* Bloco 1: Identidade da marca */}
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
            value={identidade.nomeExibicao}
            onChange={(evento) => atualizarIdentidade({ nomeExibicao: evento.target.value })}
            placeholder="Nome da sua marca ou atuação"
          />
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-mineral-700">
            <input
              type="checkbox"
              disabled={somenteLeitura}
              checked={identidade.mostrarNomeExibicao ?? true}
              onChange={(evento) =>
                atualizarIdentidade({ mostrarNomeExibicao: evento.target.checked })
              }
              className="h-4 w-4 rounded border-marfim-300 text-mineral-950 focus:ring-mineral-900"
            />
            Mostrar nome da marca na vitrine
          </label>
        </div>

        <div className="space-y-2">
          <CampoFormulario
            rotulo="Especialidade ou subtítulo curto"
            disabled={somenteLeitura}
            value={identidade.subtituloCurto ?? ""}
            onChange={(evento) => atualizarIdentidade({ subtituloCurto: evento.target.value })}
            placeholder="Ex.: Arquitetura Residencial"
          />
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-mineral-700">
            <input
              type="checkbox"
              disabled={somenteLeitura}
              checked={identidade.mostrarSubtituloCurto ?? true}
              onChange={(evento) =>
                atualizarIdentidade({ mostrarSubtituloCurto: evento.target.checked })
              }
              className="h-4 w-4 rounded border-marfim-300 text-mineral-950 focus:ring-mineral-900"
            />
            Mostrar especialidade ou subtítulo na vitrine
          </label>
        </div>

        <div className="space-y-4">
          <CampoUploadMidiaStorage
            organizacaoId={organizacaoId}
            rotulo="Logotipo opcional"
            textoAuxiliar="Se preferir assinatura tipográfica limpa, deixe este campo em branco."
            categoria="imagem"
            valorUrl={identidade.urlLogotipoOpcional ?? ""}
            desabilitado={somenteLeitura}
            servicoUpload={servicoUpload}
            aoAlterarUrl={(novaUrl) =>
              atualizarIdentidade({ urlLogotipoOpcional: novaUrl || undefined })
            }
          />

          {identidade.urlLogotipoOpcional ? (
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
                  const ativo = (identidade.formatoBordaLogotipo ?? "natural") === opcao.valor;
                  return (
                    <button
                      key={opcao.valor}
                      type="button"
                      disabled={somenteLeitura}
                      onClick={() => atualizarIdentidade({ formatoBordaLogotipo: opcao.valor })}
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
        </div>
      </CartaoSuperficie>

      {/* Bloco 2: Apresentação na vitrine */}
      <CartaoSuperficie className="space-y-5 rounded-2xl bg-white p-5 shadow-xs sm:p-6">
        <div>
          <h2 className="text-base font-semibold text-mineral-950">Apresentação na vitrine</h2>
          <p className="mt-0.5 text-xs text-mineral-600">
            Controle o tamanho, o alinhamento e a posição da marca na tela inicial.
          </p>
        </div>

        <SeletorTamanhoCabecalhoMarca
          valorAtual={identidade.tamanhoCabecalho}
          desabilitado={somenteLeitura}
          aoSelecionar={(tamanhoCabecalho) => atualizarIdentidade({ tamanhoCabecalho })}
        />

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
              const ativo = (identidade.alinhamentoCabecalho ?? "esquerda") === opcao.valor;
              return (
                <button
                  key={opcao.valor}
                  type="button"
                  disabled={somenteLeitura}
                  onClick={() => atualizarIdentidade({ alinhamentoCabecalho: opcao.valor })}
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

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-mineral-800">
            Posição da marca na vitrine
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {LISTA_POSICOES_CABECALHO_MARCA.map((opcao) => {
              const ativo = resolverPosicaoCabecalhoMarca(identidade.posicaoCabecalho) === opcao.codigo;
              return (
                <button
                  key={opcao.codigo}
                  type="button"
                  disabled={somenteLeitura}
                  aria-pressed={ativo}
                  onClick={() => atualizarIdentidade({ posicaoCabecalho: opcao.codigo })}
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
      </CartaoSuperficie>

      {/* Bloco 3: Localização, contato e registro */}
      <CartaoSuperficie className="space-y-5 rounded-2xl bg-white p-5 shadow-xs sm:p-6">
        <div>
          <h2 className="text-base font-semibold text-mineral-950">
            Localização, contato e registro
          </h2>
          <p className="mt-0.5 text-xs text-mineral-600">
            Endereço, rota no mapa, telefones, horário de atendimento e registro profissional.
          </p>
        </div>

        <CampoFormulario
          rotulo="Cidade e estado ou endereço"
          disabled={somenteLeitura}
          value={identidade.cidadeEstado ?? ""}
          onChange={(evento) => atualizarIdentidade({ cidadeEstado: evento.target.value })}
          placeholder="Ex.: São Paulo · SP ou Av. Paulista, 1000"
        />

        <CampoFormulario
          rotulo="Link do Google Maps (opcional)"
          textoAuxiliar="Cole o link do Google Maps para que os visitantes possam abrir a rota diretamente ao clicar no endereço na página inicial."
          disabled={somenteLeitura}
          value={identidade.urlMapaEnderecoOpcional ?? ""}
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
            value={identidade.telefonePrincipalOpcional ?? ""}
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
            value={identidade.celularOpcional ?? ""}
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
          value={identidade.horarioFuncionamentoOpcional ?? ""}
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
          value={identidade.registroProfissionalOpcional ?? ""}
          onChange={(evento) =>
            atualizarIdentidade({ registroProfissionalOpcional: evento.target.value })
          }
          placeholder="Ex.: OAB/SP 000.000"
        />
      </CartaoSuperficie>
    </div>
  );
}
