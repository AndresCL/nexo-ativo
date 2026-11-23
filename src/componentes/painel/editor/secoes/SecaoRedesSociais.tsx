"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type {
  LinkRedeSocial,
  TamanhoRedesSociais,
  TipoRedeSocial,
} from "@/dominio/entidades/paginaPublicada";
import {
  LISTA_TAMANHOS_REDES_SOCIAIS,
  resolverTamanhoRedesSociais,
} from "@/dominio/editorial/configuracaoRedesSociais";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";

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

export interface PropriedadesSecaoRedesSociais {
  readonly redesSociais: readonly LinkRedeSocial[];
  readonly tamanhoRedesSociais?: TamanhoRedesSociais;
  readonly somenteLeitura?: boolean;
  readonly adicionarRedeSocial: () => void;
  readonly atualizarRedeSocial: (redeId: string, parcial: Partial<LinkRedeSocial>) => void;
  readonly moverRedeSocial: (redeId: string, direcao: "cima" | "baixo") => void;
  readonly removerRedeSocial: (redeId: string) => void;
  readonly atualizarConfiguracaoRedesSociais: (parcial: {
    readonly tamanhoRedesSociais?: TamanhoRedesSociais;
  }) => void;
}

export function SecaoRedesSociais({
  redesSociais,
  tamanhoRedesSociais,
  somenteLeitura = false,
  adicionarRedeSocial,
  atualizarRedeSocial,
  moverRedeSocial,
  removerRedeSocial,
  atualizarConfiguracaoRedesSociais,
}: PropriedadesSecaoRedesSociais) {
  const tamanhoResolvido = resolverTamanhoRedesSociais(tamanhoRedesSociais);

  return (
    <div
      id="painel-aba-acoes"
      role="tabpanel"
      aria-labelledby="aba-acoes"
      className="space-y-6"
    >
      <CartaoSuperficie className="space-y-5 rounded-2xl bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-mineral-950">Redes sociais discretas</h2>
            <p className="mt-0.5 text-xs text-mineral-600">
              Cadastre seus canais e escolha o tamanho dos ícones. A posição na vitrine é organizada
              em{" "}
              <Link
                href="/painel/experiencias"
                className="font-medium text-mineral-950 underline underline-offset-2"
              >
                Experiências
              </Link>
              .
            </p>
          </div>

          <Botao
            variante="operacional_secundario"
            tamanho="compacto"
            disabled={somenteLeitura || redesSociais.length >= 9}
            onClick={adicionarRedeSocial}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Adicionar rede</span>
          </Botao>
        </div>

        <div className="space-y-1.5 rounded-xl border border-marfim-200 bg-marfim-50/60 p-4">
          <label className="block text-xs font-medium text-mineral-800">
            Tamanho dos ícones sociais
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LISTA_TAMANHOS_REDES_SOCIAIS.map((opcao) => {
              const ativo = tamanhoResolvido === opcao.codigo;
              return (
                <button
                  key={opcao.codigo}
                  type="button"
                  disabled={somenteLeitura}
                  aria-pressed={ativo}
                  onClick={() =>
                    atualizarConfiguracaoRedesSociais({ tamanhoRedesSociais: opcao.codigo })
                  }
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    ativo
                      ? "border-mineral-950 bg-mineral-950 text-white"
                      : "border-marfim-300 bg-white text-mineral-700 hover:bg-marfim-50"
                  }`}
                >
                  {opcao.nome}
                </button>
              );
            })}
          </div>
        </div>

        {redesSociais.length === 0 ? (
          <p className="text-xs text-mineral-500">Nenhuma rede social cadastrada.</p>
        ) : (
          <div className="space-y-3">
            {redesSociais.map((item, indice) => (
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
                    disabled={somenteLeitura || indice === redesSociais.length - 1}
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
  );
}
