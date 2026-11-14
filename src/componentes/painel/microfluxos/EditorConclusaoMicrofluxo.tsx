"use client";

import { BlocosConteudoEditorial } from "@/componentes/editorial/ConteudoEtapaLivreVisitante";
import { EditorComposicaoEtapa } from "./EditorComposicaoEtapa";
import { useState } from "react";
import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import {
  construirCaminhoExperiencia,
  listarCamposResumoConclusao,
} from "@/dominio/microfluxos/conclusaoMicrofluxo";
import type {
  AcaoConclusaoMicrofluxo,
  CampoResumoConclusao,
  ConfiguracaoConclusaoMicrofluxo,
  DefinicaoMicrofluxo,
} from "@/dominio/microfluxos/tiposMicrofluxo";
import { copiarTextoComAviso } from "@/componentes/interface/notificacoes/copiarTextoComAviso";

interface Propriedades {
  readonly integrado?: boolean;
  readonly fluxo: DefinicaoMicrofluxo;
  readonly fluxos: readonly DefinicaoMicrofluxo[];
  readonly profissionais: readonly ProfissionalEquipe[];
  readonly identificadorPublico: string;
  readonly podeEditar: boolean;
  readonly permiteFinanceiro: boolean;
  readonly aoAlterar: (fluxo: DefinicaoMicrofluxo) => void;
}
const classeCampo = "mt-1 w-full rounded-md border border-marfim-300 bg-white p-2 text-sm";
const tipos: readonly [AcaoConclusaoMicrofluxo["tipo"], string][] = [
  ["whatsapp", "Continuar no WhatsApp"],
  ["url_externa", "Abrir URL externa"],
  ["microfluxo", "Iniciar outra experiência"],
  ["perfil_profissional", "Abrir perfil profissional"],
  ["home", "Voltar à home"],
];
function novaAcao(tipo: AcaoConclusaoMicrofluxo["tipo"]): AcaoConclusaoMicrofluxo {
  const rotulo = tipos.find(([valor]) => valor === tipo)![1];
  if (tipo === "url_externa") return { tipo, rotulo, url: "" };
  if (tipo === "microfluxo") return { tipo, rotulo, microfluxoId: "" };
  if (tipo === "perfil_profissional") return { tipo, rotulo, profissionalId: "" };
  return { tipo, rotulo };
}
const mesmaReferencia = (a: CampoResumoConclusao, b: CampoResumoConclusao) =>
  a.etapaId === b.etapaId && a.campoId === b.campoId;

export function EditorConclusaoMicrofluxo({
  integrado = false,
  fluxo,
  fluxos,
  profissionais,
  identificadorPublico,
  podeEditar,
  permiteFinanceiro,
  aoAlterar,
}: Propriedades) {
  const [previaCelular, setPreviaCelular] = useState(true);
  const config = fluxo.conclusao;
  const campos = listarCamposResumoConclusao(fluxo).filter(
    (item) =>
      permiteFinanceiro ||
      fluxo.etapas.find((e) => e.id === item.etapaId)?.campos?.find((c) => c.id === item.campoId)
        ?.tipo !== "moeda",
  );
  function configurar(parcial: Partial<ConfiguracaoConclusaoMicrofluxo>) {
    aoAlterar({
      ...fluxo,
      conclusao: {
        acoes: [],
        resumo: { ativo: false, campos: [], incluirDemonstrativo: false },
        camposWhatsapp: [],
        ...config,
        ...parcial,
      },
    });
  }
  function alterarAcao(indice: number, acao: AcaoConclusaoMicrofluxo) {
    configurar({ acoes: (config?.acoes ?? []).map((atual, i) => (i === indice ? acao : atual)) });
  }
  return (
    <section
      id="conclusao-experiencia"
      aria-labelledby="titulo-conclusao-experiencia"
      className={
        integrado ? "space-y-4" : "space-y-4 rounded-lg border border-marfim-300 bg-white p-4"
      }
    >
      <h3 id="titulo-conclusao-experiencia" tabIndex={-1} className="font-semibold">
        Conclusão da experiência
      </h3>
      <p className="text-xs text-mineral-600">
        A conclusão pode ter zero, uma ou duas ações. A primeira recebe maior destaque. O registro
        da solicitação acontece antes desta tela.
      </p>
      <button
        type="button"
        className="text-sm underline"
        onClick={() =>
          void copiarTextoComAviso(
            new URL(
              construirCaminhoExperiencia(identificadorPublico, fluxo.id),
              window.location.origin,
            ).href,
          )
        }
      >
        Copiar link direto da experiência
      </button>
      <p className="text-xs text-mineral-600">
        O link abre a versão publicada. Salve e publique as alterações para disponibilizá-las.
      </p>
      <EditorComposicaoEtapa
        somenteConteudo
        blocos={config?.blocos ?? []}
        etapas={fluxos.flatMap((f) => f.etapas)}
        podeEditar={podeEditar}
        aoAlterar={(blocos) =>
          configurar({
            blocos: blocos.filter(
              (b): b is Extract<typeof b, { tipo: "texto" | "imagem" }> =>
                b.tipo === "texto" || b.tipo === "imagem",
            ),
          })
        }
      />
      <fieldset disabled={!podeEditar} className="space-y-4 disabled:opacity-60">
        <label className="block text-sm">
          Texto do botão para finalizar o percurso
          <input
            className={classeCampo}
            maxLength={80}
            value={fluxo.textoBotaoConclusao}
            onChange={(e) => aoAlterar({ ...fluxo, textoBotaoConclusao: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Título da conclusão
          <input
            className={classeCampo}
            maxLength={120}
            value={fluxo.mensagemConfirmacaoTitulo}
            onChange={(e) => aoAlterar({ ...fluxo, mensagemConfirmacaoTitulo: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Mensagem da conclusão
          <textarea
            className={classeCampo}
            maxLength={360}
            value={fluxo.mensagemConfirmacaoCorpo}
            onChange={(e) => aoAlterar({ ...fluxo, mensagemConfirmacaoCorpo: e.target.value })}
          />
        </label>
        <p className="text-xs text-mineral-600">
          Use uma mensagem informativa quando não houver coleta de contato. A confirmação de
          recebimento e o protocolo aparecem somente após o registro.
        </p>
        {!config ? (
          <button
            type="button"
            className="rounded border p-2 text-sm"
            onClick={() => configurar({})}
          >
            Personalizar ações e resumo
          </button>
        ) : (
          <>
            {config.acoes.map((acao, indice) => (
              <div key={indice} className="space-y-2 rounded border border-marfim-300 p-3">
                <label className="block text-sm">
                  {indice === 0 ? "Ação principal" : "Ação secundária (opcional)"}
                  <select
                    className={classeCampo}
                    value={acao.tipo}
                    onChange={(e) =>
                      alterarAcao(
                        indice,
                        novaAcao(e.target.value as AcaoConclusaoMicrofluxo["tipo"]),
                      )
                    }
                  >
                    {tipos.map(([tipo, rotulo]) => (
                      <option key={tipo} value={tipo}>
                        {rotulo}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  Rótulo da ação {indice + 1}
                  <input
                    className={classeCampo}
                    maxLength={80}
                    value={acao.rotulo}
                    onChange={(e) => alterarAcao(indice, { ...acao, rotulo: e.target.value })}
                  />
                </label>
                {acao.tipo === "url_externa" ? (
                  <label className="block text-sm">
                    URL externa
                    <input
                      type="url"
                      className={classeCampo}
                      value={acao.url}
                      onChange={(e) => alterarAcao(indice, { ...acao, url: e.target.value })}
                    />
                  </label>
                ) : null}
                {acao.tipo === "whatsapp" ? (
                  <label className="block text-sm">
                    Telefone de destino (opcional)
                    <input
                      type="tel"
                      className={classeCampo}
                      value={acao.numeroOpcional ?? ""}
                      placeholder="Usar o profissional de origem ou a equipe"
                      onChange={(e) => {
                        const { numeroOpcional, ...restante } = acao;
                        void numeroOpcional;
                        alterarAcao(
                          indice,
                          e.target.value ? { ...acao, numeroOpcional: e.target.value } : restante,
                        );
                      }}
                    />
                  </label>
                ) : null}
                {acao.tipo === "microfluxo" ? (
                  <label className="block text-sm">
                    Experiência de destino
                    <select
                      className={classeCampo}
                      value={acao.microfluxoId}
                      onChange={(e) =>
                        alterarAcao(indice, { ...acao, microfluxoId: e.target.value })
                      }
                    >
                      <option value="">Selecione</option>
                      {fluxos
                        .filter(
                          (m) =>
                            m.id !== fluxo.id &&
                            m.ativo &&
                            (!m.tipoAcao || m.tipoAcao === "microfluxo"),
                        )
                        .map((m) => (
                          <option value={m.id} key={m.id}>
                            {m.titulo}
                          </option>
                        ))}
                    </select>
                  </label>
                ) : null}
                {acao.tipo === "perfil_profissional" ? (
                  <label className="block text-sm">
                    Perfil de destino
                    <select
                      className={classeCampo}
                      value={acao.profissionalId}
                      onChange={(e) =>
                        alterarAcao(indice, { ...acao, profissionalId: e.target.value })
                      }
                    >
                      <option value="">Selecione</option>
                      {profissionais
                        .filter((p) => p.ativo)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nomeCompleto}
                          </option>
                        ))}
                    </select>
                  </label>
                ) : null}
                <button
                  type="button"
                  className="text-xs underline"
                  onClick={() => configurar({ acoes: config.acoes.filter((_, i) => i !== indice) })}
                >
                  Remover ação {indice + 1}
                </button>
              </div>
            ))}
            {config.acoes.length < 2 ? (
              <button
                type="button"
                className="rounded border p-2 text-sm"
                onClick={() => configurar({ acoes: [...config.acoes, novaAcao("home")] })}
              >
                {config.acoes.length ? "Adicionar ação secundária" : "Adicionar ação principal"}
              </button>
            ) : null}
            {!config.acoes.length ? (
              <p className="text-sm">Conclusão informativa, sem botões.</p>
            ) : null}
            <label className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.resumo.ativo}
                onChange={(e) =>
                  configurar({ resumo: { ...config.resumo, ativo: e.target.checked } })
                }
              />
              Exibir resumo das respostas
            </label>
            {config.resumo.ativo ? (
              <div className="space-y-3">
                <p className="text-xs">
                  Selecione somente os campos que deseja mostrar, incluindo dados pessoais apenas
                  quando necessário. A ordem de seleção define a ordem do resumo.
                </p>
                {campos.map((campo) => (
                  <label
                    key={`${campo.etapaId}/${campo.campoId ?? ""}`}
                    className="flex gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={config.resumo.campos.some((c) => mesmaReferencia(c, campo))}
                      onChange={(e) =>
                        configurar({
                          resumo: {
                            ...config.resumo,
                            campos: e.target.checked
                              ? [...config.resumo.campos, campo]
                              : config.resumo.campos.filter((c) => !mesmaReferencia(c, campo)),
                          },
                        })
                      }
                    />
                    {campo.rotulo}
                  </label>
                ))}
                {config.resumo.campos.map((campo, indice) => (
                  <div
                    key={`${campo.etapaId}/${campo.campoId ?? ""}`}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <label className="flex-1 text-xs">
                      Rótulo do resumo {indice + 1}
                      <input
                        className={classeCampo}
                        value={campo.rotulo ?? ""}
                        maxLength={120}
                        onChange={(e) =>
                          configurar({
                            resumo: {
                              ...config.resumo,
                              campos: config.resumo.campos.map((c, i) =>
                                i === indice ? { ...c, rotulo: e.target.value } : c,
                              ),
                            },
                          })
                        }
                      />
                    </label>
                    <button
                      type="button"
                      disabled={indice === 0}
                      className="text-xs underline disabled:opacity-40"
                      onClick={() => {
                        const ordenados = [...config.resumo.campos];
                        [ordenados[indice - 1], ordenados[indice]] = [
                          ordenados[indice]!,
                          ordenados[indice - 1]!,
                        ];
                        configurar({ resumo: { ...config.resumo, campos: ordenados } });
                      }}
                    >
                      Mover resposta {indice + 1} para cima
                    </button>
                  </div>
                ))}
                {permiteFinanceiro ? (
                  <label className="flex gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={config.resumo.incluirDemonstrativo}
                      onChange={(e) =>
                        configurar({
                          resumo: { ...config.resumo, incluirDemonstrativo: e.target.checked },
                        })
                      }
                    />
                    Incluir demonstrativo comercial existente
                  </label>
                ) : null}
              </div>
            ) : null}
            <details className="text-sm">
              <summary className="cursor-pointer">
                Respostas autorizadas na mensagem de WhatsApp
              </summary>
              <p className="my-2 text-xs">
                Esta seleção é independente do resumo. Nenhuma resposta é enviada por padrão.
              </p>
              {campos.map((campo) => (
                <label key={`${campo.etapaId}/${campo.campoId ?? ""}`} className="my-2 flex gap-2">
                  <input
                    type="checkbox"
                    checked={config.camposWhatsapp.some((c) => mesmaReferencia(c, campo))}
                    onChange={(e) =>
                      configurar({
                        camposWhatsapp: e.target.checked
                          ? [...config.camposWhatsapp, campo]
                          : config.camposWhatsapp.filter((c) => !mesmaReferencia(c, campo)),
                      })
                    }
                  />
                  {campo.rotulo}
                </label>
              ))}
            </details>
          </>
        )}
      </fieldset>
      {config ? (
        <div className="space-y-3 border-t pt-4">
          <button
            type="button"
            className="text-xs underline"
            onClick={() => setPreviaCelular(!previaCelular)}
          >
            Prévia: {previaCelular ? "celular" : "desktop"}
          </button>
          <div
            className={`mx-auto w-full space-y-4 rounded-lg border p-5 ${previaCelular ? "max-w-sm" : "max-w-2xl"}`}
          >
            <h4 className="text-center text-xl">
              {fluxo.mensagemConfirmacaoTitulo || "Experiência concluída"}
            </h4>
            <p className="text-center text-sm">{fluxo.mensagemConfirmacaoCorpo}</p>
            <BlocosConteudoEditorial
              blocos={(config.blocos ?? []).filter(
                (b) => b.tipo === "texto" || b.url.startsWith("https://"),
              )}
            />
            {config.resumo.ativo ? (
              <dl className="space-y-2 text-sm">
                {config.resumo.campos.map((c, i) => (
                  <div key={i}>
                    <dt>{c.rotulo}</dt>
                    <dd className="text-mineral-500">Resposta do visitante</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {config.acoes.map((acao, i) => (
              <div
                key={i}
                className={`rounded border p-3 text-center text-sm ${i === 0 ? "bg-mineral-950 text-white" : ""}`}
              >
                {acao.rotulo}
              </div>
            ))}
          </div>
          <p className="text-xs text-mineral-500">
            Prévia ilustrativa. A vitrine aplica o tema publicado e omite respostas ausentes.
          </p>
        </div>
      ) : (
        <p className="text-xs">
          Esta experiência mantém a conclusão anterior até você personalizá-la.
        </p>
      )}
    </section>
  );
}
