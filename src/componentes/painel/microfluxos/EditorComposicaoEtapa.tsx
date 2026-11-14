"use client";
import type {
  BlocoEtapaLivre,
  EtapaMicrofluxo,
  TipoPrimitivoCampo,
} from "@/dominio/microfluxos/tiposMicrofluxo";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
const classe = "mt-1 w-full rounded border border-marfim-300 bg-white px-2 py-1.5 text-xs";
const tiposCampo: readonly [TipoPrimitivoCampo, string][] = [
  ["texto_curto", "Texto curto"],
  ["texto_longo", "Texto longo"],
  ["numero", "Número"],
  ["moeda", "Moeda"],
  ["data", "Data"],
  ["email", "E-mail"],
  ["telefone", "Telefone"],
  ["booleano", "Sim / não"],
  ["selecao_unica", "Seleção única"],
  ["selecao_multipla", "Seleção múltipla"],
];
const nomes = {
  texto: "Texto",
  imagem: "Imagem",
  campo: "Campo",
  escolha: "Escolha",
  catalogo: "Catálogo",
  equipe: "Equipe",
} as const;
export function criarBlocoEtapa(tipo: BlocoEtapaLivre["tipo"]): BlocoEtapaLivre {
  const id = `elemento-${crypto.randomUUID()}`;
  if (tipo === "texto") return { id, tipo, texto: "Escreva uma explicação para o visitante." };
  if (tipo === "imagem") return { id, tipo, url: "", textoAlternativo: "" };
  if (tipo === "campo")
    return {
      id,
      tipo,
      campo: { id, rotulo: "Nova pergunta", tipo: "texto_curto", obrigatorio: false },
    };
  if (tipo === "escolha")
    return {
      id,
      tipo,
      rotulo: "Escolha uma opção",
      multipla: false,
      obrigatorio: true,
      opcoes: [
        { id: "opcao-a", rotulo: "Opção A" },
        { id: "opcao-b", rotulo: "Opção B" },
      ],
    };
  if (tipo === "catalogo")
    return { id, tipo, rotulo: "Escolha um item", fonte: "produtos", obrigatorio: true };
  return { id, tipo, rotulo: "Escolha um profissional", obrigatorio: true };
}
export function EditorComposicaoEtapa({
  blocos,
  etapas,
  etapaId,
  aoAlterar,
  podeEditar,
  somenteConteudo = false,
  permiteFinanceiro = true,
}: {
  readonly blocos: readonly BlocoEtapaLivre[];
  readonly etapas: readonly EtapaMicrofluxo[];
  readonly etapaId?: string;
  readonly aoAlterar: (blocos: readonly BlocoEtapaLivre[]) => void;
  readonly podeEditar: boolean;
  readonly somenteConteudo?: boolean;
  readonly permiteFinanceiro?: boolean;
}) {
  function mudar(indice: number, bloco: BlocoEtapaLivre) {
    aoAlterar(blocos.map((atual, i) => (i === indice ? bloco : atual)));
  }
  function mover(indice: number, deslocamento: number) {
    const novos = [...blocos];
    [novos[indice], novos[indice + deslocamento]] = [novos[indice + deslocamento]!, novos[indice]!];
    aoAlterar(novos);
  }
  return (
    <fieldset disabled={!podeEditar} className="space-y-3 disabled:opacity-60">
      <legend className="mb-3 text-sm font-semibold">
        {somenteConteudo ? "Conteúdo da finalização" : "Composição da etapa"}
      </legend>
      <p className="text-xs text-mineral-600">
        Combine os elementos e ajuste a ordem em que aparecem.
      </p>
      {blocos.map((bloco, indice) => (
        <div
          key={bloco.id}
          className="space-y-2 rounded-lg border border-marfim-300 bg-marfim-50/60 p-3"
        >
          <div className="flex items-center gap-1">
            <span className="mr-auto text-xs font-semibold">
              {indice + 1}. {nomes[bloco.tipo]}
            </span>
            <button
              type="button"
              aria-label={`Mover elemento ${indice + 1} para cima`}
              disabled={indice === 0}
              onClick={() => mover(indice, -1)}
              className="rounded p-1 disabled:opacity-30"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`Mover elemento ${indice + 1} para baixo`}
              disabled={indice === blocos.length - 1}
              onClick={() => mover(indice, 1)}
              className="rounded p-1 disabled:opacity-30"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`Remover elemento ${indice + 1}`}
              onClick={() => aoAlterar(blocos.filter((_, i) => i !== indice))}
              className="rounded p-1 text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          {bloco.tipo === "texto" ? (
            <label className="block text-xs">
              Texto
              <textarea
                rows={4}
                className={classe}
                maxLength={4000}
                value={bloco.texto}
                onChange={(e) => mudar(indice, { ...bloco, texto: e.target.value })}
              />
            </label>
          ) : null}
          {bloco.tipo === "imagem" ? (
            <>
              <label className="block text-xs">
                URL da imagem
                <input
                  className={classe}
                  type="url"
                  value={bloco.url}
                  onChange={(e) => mudar(indice, { ...bloco, url: e.target.value })}
                  placeholder="https://…"
                />
              </label>
              <label className="block text-xs">
                Descrição da imagem
                <input
                  className={classe}
                  maxLength={220}
                  value={bloco.textoAlternativo}
                  onChange={(e) => mudar(indice, { ...bloco, textoAlternativo: e.target.value })}
                />
              </label>
            </>
          ) : null}
          {bloco.tipo === "campo" ? (
            <>
              <label className="block text-xs">
                Rótulo do campo
                <input
                  className={classe}
                  maxLength={120}
                  value={bloco.campo.rotulo}
                  onChange={(e) =>
                    mudar(indice, { ...bloco, campo: { ...bloco.campo, rotulo: e.target.value } })
                  }
                />
              </label>
              <label className="block text-xs">
                Tipo de resposta
                <select
                  className={classe}
                  value={bloco.campo.tipo}
                  onChange={(e) =>
                    mudar(indice, {
                      ...bloco,
                      campo: { ...bloco.campo, tipo: e.target.value as TipoPrimitivoCampo },
                    })
                  }
                >
                  {tiposCampo
                    .filter(([tipo]) => permiteFinanceiro || tipo !== "moeda")
                    .map(([tipo, nome]) => (
                      <option key={tipo} value={tipo}>
                        {nome}
                      </option>
                    ))}
                </select>
              </label>
              <label className="block text-xs">
                Finalidade do campo
                <select
                  className={classe}
                  value={bloco.finalidade ?? ""}
                  onChange={(e) => {
                    const finalidade = e.target.value as typeof bloco.finalidade;
                    const { finalidade: anterior, ...restante } = bloco;
                    void anterior;
                    mudar(
                      indice,
                      finalidade
                        ? {
                            ...bloco,
                            finalidade,
                            campo: {
                              ...bloco.campo,
                              tipo:
                                finalidade === "telefoneOuWhatsapp"
                                  ? "telefone"
                                  : finalidade === "email"
                                    ? "email"
                                    : finalidade === "mensagemAdicional"
                                      ? "texto_longo"
                                      : "texto_curto",
                            },
                          }
                        : restante,
                    );
                  }}
                >
                  <option value="">Resposta comum</option>
                  <option value="nomeCompleto">Nome para retorno</option>
                  <option value="telefoneOuWhatsapp">Telefone para retorno</option>
                  <option value="email">E-mail para retorno</option>
                  <option value="mensagemAdicional">Mensagem para atendimento</option>
                </select>
              </label>
              <label className="block text-xs">
                Texto de exemplo
                <input
                  className={classe}
                  maxLength={160}
                  value={bloco.campo.placeholder ?? ""}
                  onChange={(e) =>
                    mudar(indice, {
                      ...bloco,
                      campo: { ...bloco.campo, placeholder: e.target.value },
                    })
                  }
                />
              </label>
              {bloco.campo.tipo === "numero" ? (
                <div className="grid grid-cols-2 gap-2">
                  {(["valorMinimo", "valorMaximo"] as const).map((limite) => (
                    <label key={limite} className="block text-xs">
                      {limite === "valorMinimo" ? "Valor mínimo" : "Valor máximo"}
                      <input
                        type="number"
                        className={classe}
                        value={bloco.campo[limite] ?? ""}
                        onChange={(e) =>
                          mudar(indice, {
                            ...bloco,
                            campo: {
                              ...bloco.campo,
                              [limite]: e.target.value === "" ? undefined : Number(e.target.value),
                            },
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              ) : null}
              {bloco.campo.tipo === "selecao_unica" || bloco.campo.tipo === "selecao_multipla" ? (
                <>
                  <label className="block text-xs">
                    Opções, uma por linha
                    <textarea
                      className={classe}
                      value={bloco.campo.opcoesCustomizadas?.join("\n") ?? ""}
                      onChange={(e) =>
                        mudar(indice, {
                          ...bloco,
                          campo: { ...bloco.campo, opcoesCustomizadas: e.target.value.split("\n") },
                        })
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="text-xs underline"
                    onClick={() =>
                      mudar(indice, {
                        id: bloco.id,
                        tipo: "escolha",
                        rotulo: bloco.campo.rotulo,
                        obrigatorio: bloco.campo.obrigatorio,
                        multipla: bloco.campo.tipo === "selecao_multipla",
                        opcoes: (bloco.campo.opcoesCustomizadas ?? []).map((rotulo) => ({
                          id: rotulo,
                          rotulo,
                        })),
                      })
                    }
                  >
                    Configurar caminhos por resposta
                  </button>
                </>
              ) : null}
              <label className="flex gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={bloco.campo.obrigatorio}
                  onChange={(e) =>
                    mudar(indice, {
                      ...bloco,
                      campo: { ...bloco.campo, obrigatorio: e.target.checked },
                    })
                  }
                />
                Preenchimento obrigatório
              </label>
            </>
          ) : null}
          {bloco.tipo === "escolha" ? (
            <>
              <label className="block text-xs">
                Pergunta
                <input
                  className={classe}
                  maxLength={160}
                  value={bloco.rotulo}
                  onChange={(e) => mudar(indice, { ...bloco, rotulo: e.target.value })}
                />
              </label>
              <label className="flex gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={bloco.multipla}
                  onChange={(e) =>
                    mudar(indice, {
                      ...bloco,
                      multipla: e.target.checked,
                      opcoes: e.target.checked
                        ? bloco.opcoes.map(
                            ({
                              proximaEtapaIdOpcional,
                              encerrarPercurso,
                              desconectada,
                              ...opcao
                            }) => {
                              void proximaEtapaIdOpcional;
                              void encerrarPercurso;
                              void desconectada;
                              return opcao;
                            },
                          )
                        : bloco.opcoes,
                    })
                  }
                />
                Permitir várias respostas
              </label>
              {bloco.opcoes.map((opcao, i) => (
                <div key={opcao.id} className="space-y-1 rounded border border-marfim-200 p-2">
                  <label className="block text-xs">
                    Opção {i + 1}
                    <input
                      className={classe}
                      maxLength={120}
                      value={opcao.rotulo}
                      onChange={(e) =>
                        mudar(indice, {
                          ...bloco,
                          opcoes: bloco.opcoes.map((o, j) =>
                            j === i ? { ...o, rotulo: e.target.value } : o,
                          ),
                        })
                      }
                    />
                  </label>
                  <label className="block text-xs">
                    Descrição da opção
                    <textarea
                      className={classe}
                      value={opcao.descricaoCurta ?? ""}
                      maxLength={220}
                      onChange={(e) =>
                        mudar(indice, {
                          ...bloco,
                          opcoes: bloco.opcoes.map((o, j) =>
                            j === i ? { ...o, descricaoCurta: e.target.value } : o,
                          ),
                        })
                      }
                    />
                  </label>
                  {permiteFinanceiro ? (
                    <label className="block text-xs">
                      Valor adicional (R$)
                      <input
                        className={classe}
                        type="number"
                        min={0}
                        step="0.01"
                        value={
                          opcao.valorAdicionalCentavos === undefined
                            ? ""
                            : opcao.valorAdicionalCentavos / 100
                        }
                        onChange={(e) =>
                          mudar(indice, {
                            ...bloco,
                            opcoes: bloco.opcoes.map((o, j) =>
                              j === i
                                ? {
                                    ...o,
                                    valorAdicionalCentavos:
                                      e.target.value === ""
                                        ? undefined
                                        : Math.round(Number(e.target.value) * 100),
                                  }
                                : o,
                            ),
                          })
                        }
                      />
                    </label>
                  ) : null}
                  {!bloco.multipla ? (
                    <label className="block text-xs">
                      Destino da opção {i + 1}
                      <select
                        className={classe}
                        value={
                          opcao.desconectada
                            ? "@solta"
                            : opcao.encerrarPercurso
                              ? "@fim"
                              : (opcao.proximaEtapaIdOpcional ?? "")
                        }
                        onChange={(e) =>
                          mudar(indice, {
                            ...bloco,
                            opcoes: bloco.opcoes.map((o, j) =>
                              j === i
                                ? {
                                    ...o,
                                    proximaEtapaIdOpcional:
                                      e.target.value &&
                                      e.target.value !== "@fim" &&
                                      e.target.value !== "@solta"
                                        ? e.target.value
                                        : undefined,
                                    encerrarPercurso: e.target.value === "@fim",
                                    desconectada: e.target.value === "@solta",
                                  }
                                : o,
                            ),
                          })
                        }
                      >
                        <option value="@solta">Sem conexão definida</option>
                        <option value="">Caminho padrão da etapa</option>
                        <option value="@fim">Finalização</option>
                        {etapas
                          .filter((e) => e.id !== etapaId)
                          .map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.titulo}
                            </option>
                          ))}
                      </select>
                    </label>
                  ) : null}
                  <button
                    type="button"
                    className="text-xs underline"
                    disabled={bloco.opcoes.length < 2}
                    onClick={() =>
                      mudar(indice, { ...bloco, opcoes: bloco.opcoes.filter((_, j) => j !== i) })
                    }
                  >
                    Remover opção {i + 1}
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-xs underline"
                onClick={() =>
                  mudar(indice, {
                    ...bloco,
                    opcoes: [
                      ...bloco.opcoes,
                      { id: crypto.randomUUID(), rotulo: `Opção ${bloco.opcoes.length + 1}` },
                    ],
                  })
                }
              >
                Adicionar opção
              </button>
              <label className="flex gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={bloco.obrigatorio}
                  onChange={(e) => mudar(indice, { ...bloco, obrigatorio: e.target.checked })}
                />
                Resposta obrigatória
              </label>
            </>
          ) : null}
          {bloco.tipo === "catalogo" || bloco.tipo === "equipe" ? (
            <>
              <label className="block text-xs">
                Rótulo da seleção
                <input
                  className={classe}
                  maxLength={160}
                  value={bloco.rotulo}
                  onChange={(e) => mudar(indice, { ...bloco, rotulo: e.target.value })}
                />
              </label>
              {bloco.tipo === "catalogo" ? (
                <label className="block text-xs">
                  Fonte do catálogo
                  <select
                    className={classe}
                    value={bloco.fonte}
                    onChange={(e) =>
                      mudar(indice, { ...bloco, fonte: e.target.value as typeof bloco.fonte })
                    }
                  >
                    <option value="produtos">Produtos</option>
                    <option value="servicos">Serviços</option>
                    <option value="ambos">Produtos e serviços</option>
                  </select>
                </label>
              ) : null}
              <label className="flex gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={bloco.obrigatorio}
                  onChange={(e) => mudar(indice, { ...bloco, obrigatorio: e.target.checked })}
                />
                Seleção obrigatória
              </label>
            </>
          ) : null}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(nomes) as BlocoEtapaLivre["tipo"][])
          .filter((tipo) => !somenteConteudo || tipo === "texto" || tipo === "imagem")
          .map((tipo) => (
            <button
              type="button"
              key={tipo}
              disabled={
                (tipo === "catalogo" || tipo === "equipe") && blocos.some((b) => b.tipo === tipo)
              }
              className="rounded border border-marfim-300 bg-white px-2 py-1.5 text-xs disabled:opacity-40"
              onClick={() => aoAlterar([...blocos, criarBlocoEtapa(tipo)])}
            >
              Adicionar {nomes[tipo].toLowerCase()}
            </button>
          ))}
      </div>
      {!somenteConteudo ? (
        <p className="text-xs text-mineral-600">
          Para receber solicitações no painel, inclua campos com as finalidades Nome e Telefone para
          retorno.
        </p>
      ) : null}
    </fieldset>
  );
}
