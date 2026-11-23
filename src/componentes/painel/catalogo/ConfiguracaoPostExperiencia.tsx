"use client";

import { Globe, MessageCircle, Phone } from "lucide-react";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import type {
  ConfiguracaoPostVitrine,
  DefinicaoMicrofluxo,
  TipoAcaoCtaPostVitrine,
} from "@/dominio/microfluxos/tiposMicrofluxo";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { EditorTextoRicoComEmojis } from "@/componentes/interface/EditorTextoRicoComEmojis";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { EditorListaImagensCatalogo } from "./EditorListaImagensCatalogo";

export interface PropriedadesConfiguracaoPostExperiencia {
  readonly organizacaoId: string;
  readonly fluxoAtual: DefinicaoMicrofluxo;
  readonly microfluxosDisponiveis: readonly DefinicaoMicrofluxo[];
  readonly servicoUpload: ServicoCatalogoConteudoPorta;
  readonly desabilitado?: boolean;
  readonly aoAlterarPost: (novaConfiguracao: ConfiguracaoPostVitrine) => void;
}

const OPCOES_CTA_POST: readonly {
  readonly id: TipoAcaoCtaPostVitrine;
  readonly rotulo: string;
  readonly desc: string;
}[] = [
  {
    id: "nenhum",
    rotulo: "Sem botão (Apenas leitura)",
    desc: "Exibe apenas o conteúdo do post, sem botão de ação no rodapé",
  },
  {
    id: "whatsapp",
    rotulo: "WhatsApp Direto",
    desc: "Abre conversa já contextualizada com a publicação",
  },
  {
    id: "microfluxo",
    rotulo: "Iniciar Outra Experiência",
    desc: "Abre um percurso guiado (simulação, agendamento, etc.)",
  },
  {
    id: "link_externo",
    rotulo: "Link Externo",
    desc: "Direciona o visitante para um site ou página externa",
  },
  {
    id: "telefone",
    rotulo: "Telefone",
    desc: "Inicia chamada telefônica direta no celular",
  },
];

export function ConfiguracaoPostExperiencia({
  organizacaoId,
  fluxoAtual,
  microfluxosDisponiveis,
  servicoUpload,
  desabilitado = false,
  aoAlterarPost,
}: PropriedadesConfiguracaoPostExperiencia) {
  const postAtual: ConfiguracaoPostVitrine = fluxoAtual.configuracaoPost ?? {
    corpoTexto: "",
    cta: { tipoAcao: "whatsapp" },
  };

  function atualizarParcial(parcial: Partial<ConfiguracaoPostVitrine>) {
    aoAlterarPost({
      ...postAtual,
      ...parcial,
    });
  }

  const tipoCtaAtual = postAtual.cta.tipoAcao;

  return (
    <div className="space-y-4 pt-2">
      <div className="rounded-xl border border-marfim-200 bg-white p-4 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-mineral-900 uppercase tracking-wider">
            Conteúdo da Publicação (Bottom Sheet)
          </h3>
          <p className="mt-0.5 text-[11px] text-mineral-500">
            Ao tocar no botão na vitrine, o visitante verá esta publicação aberta em uma gaveta
            deslizante como um post completo.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <CampoFormulario
            rotulo="Título interno do post (opcional)"
            textoAuxiliar="Se deixar em branco, usa o título do botão na vitrine."
            maxLength={140}
            disabled={desabilitado}
            value={postAtual.tituloPost ?? ""}
            placeholder={fluxoAtual.rotuloBotaoHome || fluxoAtual.titulo}
            onChange={(e) => atualizarParcial({ tituloPost: e.target.value })}
          />

          <CampoFormulario
            rotulo="Data ou selo temporal (opcional)"
            textoAuxiliar="Exibido discretamente acima do título."
            maxLength={60}
            disabled={desabilitado}
            value={postAtual.dataTexto ?? ""}
            placeholder="Ex.: 17 Nov 2026 · Novidade"
            onChange={(e) => atualizarParcial({ dataTexto: e.target.value })}
          />
        </div>

        <EditorTextoRicoComEmojis
          id={`corpo-post-${fluxoAtual.id}`}
          rotulo="Texto da publicação"
          obrigatorio
          maxLength={5000}
          desabilitado={desabilitado}
          valor={postAtual.corpoTexto}
          aoAlterar={(corpoTexto) => atualizarParcial({ corpoTexto })}
        />

        <EditorListaImagensCatalogo
          organizacaoId={organizacaoId}
          rotulo="Imagens da publicação (opcional)"
          imagens={postAtual.imagens ?? []}
          aoAlterarImagens={(imagens) => atualizarParcial({ imagens })}
          servicoUpload={servicoUpload}
          desabilitado={desabilitado}
          tituloFallback={postAtual.tituloPost || fluxoAtual.titulo}
        />
      </div>

      <div className="rounded-xl border border-marfim-200 bg-white p-4 space-y-3.5">
        <div>
          <label className="block text-[11px] font-semibold text-mineral-700 uppercase tracking-wider">
            Botão de Ação do Post (CTA)
          </label>
          <p className="text-[11px] text-mineral-500 mt-0.5">
            Escolha o que acontece quando o visitante clica no botão principal ao final do post.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {OPCOES_CTA_POST.map((opcao) => {
            const selecionado = tipoCtaAtual === opcao.id;
            return (
              <button
                key={opcao.id}
                type="button"
                disabled={desabilitado}
                onClick={() =>
                  atualizarParcial({
                    cta: {
                      ...postAtual.cta,
                      tipoAcao: opcao.id,
                    },
                  })
                }
                className={combinarClasses(
                  "flex flex-col text-left p-2.5 rounded-lg border transition text-xs cursor-pointer",
                  selecionado
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-950 font-medium ring-1 ring-emerald-500"
                    : "border-marfim-200 hover:bg-marfim-50 text-mineral-700",
                )}
              >
                <span className="font-semibold text-mineral-900">{opcao.rotulo}</span>
                <span className="text-[10px] text-mineral-500 mt-0.5">{opcao.desc}</span>
              </button>
            );
          })}
        </div>

        {tipoCtaAtual === "microfluxo" ? (
          <div>
            <label
              htmlFor={`seletor-experiencia-post-${fluxoAtual.id}`}
              className="block text-[11px] font-semibold text-mineral-700 uppercase tracking-wider"
            >
              Experiência Vinculada *
            </label>
            <select
              id={`seletor-experiencia-post-${fluxoAtual.id}`}
              disabled={desabilitado}
              value={postAtual.cta.microfluxoId ?? ""}
              onChange={(e) =>
                atualizarParcial({
                  cta: {
                    ...postAtual.cta,
                    microfluxoId: e.target.value,
                  },
                })
              }
              className="mt-1 w-full rounded-lg border border-marfim-200 bg-white px-2.5 py-2 text-xs text-mineral-950 focus:border-indigo-400 focus:outline-none"
            >
              <option value="">Selecione a experiência a ser iniciada...</option>
              {microfluxosDisponiveis
                .filter(
                  (m) =>
                    m.id !== fluxoAtual.id &&
                    (!m.tipoAcao || m.tipoAcao === "microfluxo" || m.tipoAcao === "agenda"),
                )
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.titulo}
                  </option>
                ))}
            </select>
          </div>
        ) : null}

        {tipoCtaAtual === "link_externo" ? (
          <div>
            <label
              htmlFor={`url-cta-post-${fluxoAtual.id}`}
              className="block text-[11px] font-semibold text-mineral-700 uppercase tracking-wider"
            >
              URL de Destino *
            </label>
            <div className="relative mt-1">
              <Globe className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-mineral-400" />
              <input
                id={`url-cta-post-${fluxoAtual.id}`}
                type="url"
                disabled={desabilitado}
                value={postAtual.cta.destinoOpcional ?? ""}
                onChange={(e) =>
                  atualizarParcial({
                    cta: {
                      ...postAtual.cta,
                      destinoOpcional: e.target.value,
                    },
                  })
                }
                placeholder="https://exemplo.com.br/campanha"
                className="w-full rounded-lg border border-marfim-200 bg-white pl-8 pr-2.5 py-1.5 text-xs text-mineral-950 placeholder:text-mineral-400 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>
        ) : null}

        {tipoCtaAtual === "whatsapp" ? (
          <div>
            <label
              htmlFor={`whatsapp-cta-post-${fluxoAtual.id}`}
              className="block text-[11px] font-semibold text-mineral-700 uppercase tracking-wider"
            >
              Número ou Link de WhatsApp (Opcional)
            </label>
            <div className="relative mt-1">
              <MessageCircle className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-mineral-400" />
              <input
                id={`whatsapp-cta-post-${fluxoAtual.id}`}
                type="text"
                disabled={desabilitado}
                value={postAtual.cta.destinoOpcional ?? ""}
                onChange={(e) =>
                  atualizarParcial({
                    cta: {
                      ...postAtual.cta,
                      destinoOpcional: e.target.value,
                    },
                  })
                }
                placeholder="Em branco, usa o WhatsApp principal da organização"
                className="w-full rounded-lg border border-marfim-200 bg-white pl-8 pr-2.5 py-1.5 text-xs text-mineral-950 placeholder:text-mineral-400 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>
        ) : null}

        {tipoCtaAtual === "telefone" ? (
          <div>
            <label
              htmlFor={`telefone-cta-post-${fluxoAtual.id}`}
              className="block text-[11px] font-semibold text-mineral-700 uppercase tracking-wider"
            >
              Telefone para Discagem (Opcional)
            </label>
            <div className="relative mt-1">
              <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-mineral-400" />
              <input
                id={`telefone-cta-post-${fluxoAtual.id}`}
                type="tel"
                disabled={desabilitado}
                value={postAtual.cta.destinoOpcional ?? ""}
                onChange={(e) =>
                  atualizarParcial({
                    cta: {
                      ...postAtual.cta,
                      destinoOpcional: e.target.value,
                    },
                  })
                }
                placeholder="Em branco, usa o telefone principal da organização"
                className="w-full rounded-lg border border-marfim-200 bg-white pl-8 pr-2.5 py-1.5 text-xs text-mineral-950 placeholder:text-mineral-400 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>
        ) : null}

        {tipoCtaAtual !== "nenhum" ? (
          <div>
            <label
              htmlFor={`rotulo-cta-post-${fluxoAtual.id}`}
              className="block text-[11px] font-semibold text-mineral-700 uppercase tracking-wider"
            >
              Texto do Botão (CTA)
            </label>
            <input
              id={`rotulo-cta-post-${fluxoAtual.id}`}
              type="text"
              disabled={desabilitado}
              maxLength={60}
              value={postAtual.cta.rotuloBotao ?? ""}
              placeholder={
                tipoCtaAtual === "microfluxo"
                  ? "Ex.: Simular agora"
                  : tipoCtaAtual === "link_externo"
                    ? "Ex.: Saiba mais"
                    : tipoCtaAtual === "telefone"
                      ? "Ex.: Ligar agora"
                      : "Ex.: Quero aproveitar no WhatsApp"
              }
              onChange={(e) =>
                atualizarParcial({
                  cta: {
                    ...postAtual.cta,
                    rotuloBotao: e.target.value,
                  },
                })
              }
              className="mt-1 w-full rounded-lg border border-marfim-200 bg-white px-2.5 py-1.5 text-xs text-mineral-950 placeholder:text-mineral-400 focus:border-indigo-400 focus:outline-none"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

