"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Store,
  User,
  Workflow,
  Copy,
  Download,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import type { DefinicaoMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import { gerarSvgQrCode } from "@/dominio/servicos/geradorQrCodeSvg";
import { copiarTextoComAviso } from "@/componentes/interface/notificacoes/copiarTextoComAviso";

type TipoDestinoQrCode = "vitrine" | "profissional" | "fluxo";

export interface PropriedadesCentralQrCodesPainel {
  readonly identificadorPublico: string;
  readonly profissionais: readonly ProfissionalEquipe[];
  readonly microfluxos: readonly DefinicaoMicrofluxo[];
}

interface DadosDestinoQrCode {
  readonly url: string;
  readonly titulo: string;
  readonly descricao: string;
  readonly nomeArquivo: string;
}

function montarUrlDestinoQrCode(
  baseOrigem: string,
  identificadorPublico: string,
  tipo: TipoDestinoQrCode,
  profissionalSlug: string,
  fluxoId: string,
): DadosDestinoQrCode {
  const base = `${baseOrigem}/${identificadorPublico}`;
  if (tipo === "profissional" && profissionalSlug) {
    return {
      url: `${base}/equipe/${profissionalSlug}?utm_source=qrcode&utm_content=profissional_${profissionalSlug}`,
      titulo: "Cartão do Profissional",
      descricao: "Acesso direto à página e contatos do profissional.",
      nomeArquivo: `qrcode-${identificadorPublico}-${profissionalSlug}`,
    };
  }
  if (tipo === "fluxo" && fluxoId) {
    return {
      url: `${base}?fluxo=${encodeURIComponent(fluxoId)}&utm_source=qrcode&utm_content=fluxo_${encodeURIComponent(fluxoId)}`,
      titulo: "Fluxo Interativo",
      descricao: "Abre a vitrine com o fluxo ou formulário selecionado em destaque.",
      nomeArquivo: `qrcode-${identificadorPublico}-fluxo-${fluxoId}`,
    };
  }
  return {
    url: `${base}?utm_source=qrcode&utm_content=vitrine`,
    titulo: "Vitrine Principal",
    descricao: "Página inicial da sua vitrine digital com catálogo completo.",
    nomeArquivo: `qrcode-${identificadorPublico}-vitrine`,
  };
}

export function CentralQrCodesPainel({
  identificadorPublico,
  profissionais,
  microfluxos,
}: PropriedadesCentralQrCodesPainel) {
  const [tipo, setTipo] = useState<TipoDestinoQrCode>("vitrine");
  const [profissionalSlug, setProfissionalSlug] = useState(
    profissionais[0]?.identificadorCartao ?? "",
  );
  const [fluxoId, setFluxoId] = useState(microfluxos[0]?.id ?? "");
  const [baseOrigem, setBaseOrigem] = useState("https://nexoativo.com.br");

  useEffect(() => {
    setBaseOrigem(window.location.origin);
  }, []);

  const { url, titulo, descricao, nomeArquivo } = montarUrlDestinoQrCode(
    baseOrigem,
    identificadorPublico,
    tipo,
    profissionalSlug,
    fluxoId,
  );

  const svgBruto = useMemo(() => {
    return gerarSvgQrCode(url, {
      tituloAcessivel: `QR Code para ${titulo}`,
    });
  }, [url, titulo]);

  const dataUriSvg = useMemo(() => {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgBruto)}`;
  }, [svgBruto]);

  const opcoesDestino = [
    {
      id: "vitrine" as const,
      rotulo: "Vitrine Principal",
      icone: Store,
    },
    {
      id: "profissional" as const,
      rotulo: "Profissional",
      icone: User,
      desabilitado: profissionais.length === 0,
    },
    {
      id: "fluxo" as const,
      rotulo: "Fluxo na Home",
      icone: Workflow,
      desabilitado: microfluxos.length === 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho Limpo */}
      <header className="border-b border-marfim-200/80 pb-3 sm:pb-4">
        <h1 className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
          QR Codes
        </h1>
        <p className="mt-1 text-xs text-mineral-600">
          Gere códigos com rastreamento automático para materiais impressos, balcão e crachás.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        {/* Painel de Configuração */}
        <div className="space-y-5 rounded-2xl border border-marfim-200/80 bg-white p-5 shadow-xs">
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase text-mineral-500">
              Escolha o Destino
            </label>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {opcoesDestino.map((opcao) => {
                const Icone = opcao.icone;
                const selecionado = tipo === opcao.id;
                return (
                  <button
                    key={opcao.id}
                    type="button"
                    disabled={opcao.desabilitado}
                    onClick={() => setTipo(opcao.id)}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ${
                      selecionado
                        ? "border-mineral-950 bg-mineral-950 text-white shadow-xs"
                        : opcao.desabilitado
                          ? "cursor-not-allowed border-marfim-200/50 bg-marfim-50/30 text-mineral-400 opacity-60"
                          : "border-marfim-200 bg-marfim-50/50 text-mineral-700 hover:border-marfim-300 hover:bg-white hover:text-mineral-900"
                    }`}
                  >
                    <Icone className={`h-4 w-4 ${selecionado ? "text-white" : "text-mineral-500"}`} />
                    <span>{opcao.rotulo}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seletores Específicos com design refinado */}
          {tipo === "profissional" && (
            <div className="space-y-2 rounded-xl border border-marfim-200 bg-marfim-50/40 p-4">
              <label className="text-xs font-semibold text-mineral-800">
                Selecione o membro da equipe
              </label>
              {profissionais.length > 0 ? (
                <select
                  value={profissionalSlug}
                  onChange={(e) => setProfissionalSlug(e.target.value)}
                  className="w-full rounded-lg border border-marfim-300 bg-white px-3 py-2 text-sm text-mineral-900 shadow-2xs outline-none transition focus:border-mineral-950 focus:ring-1 focus:ring-mineral-950"
                >
                  {profissionais.map((p) => {
                    const sufixoStatus = !p.ativo ? " [Desativado]" : "";
                    const cargo = p.cargoOuEspecialidade ? ` — ${p.cargoOuEspecialidade}` : "";
                    return (
                      <option key={p.id} value={p.identificadorCartao}>
                        {p.nomeCompleto}
                        {cargo}
                        {sufixoStatus}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <p className="text-xs text-mineral-500">Nenhum profissional cadastrado.</p>
              )}
            </div>
          )}

          {tipo === "fluxo" && (
            <div className="space-y-2 rounded-xl border border-marfim-200 bg-marfim-50/40 p-4">
              <label className="text-xs font-semibold text-mineral-800">
                Selecione a ação ou fluxo
              </label>
              {microfluxos.length > 0 ? (
                <select
                  value={fluxoId}
                  onChange={(e) => setFluxoId(e.target.value)}
                  className="w-full rounded-lg border border-marfim-300 bg-white px-3 py-2 text-sm text-mineral-900 shadow-2xs outline-none transition focus:border-mineral-950 focus:ring-1 focus:ring-mineral-950"
                >
                  {microfluxos.map((f) => {
                    const sufixoStatus = !f.ativo ? " [Desativado]" : "";
                    return (
                      <option key={f.id} value={f.id}>
                        {f.titulo}
                        {sufixoStatus}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <p className="text-xs text-mineral-500">Nenhum fluxo cadastrado.</p>
              )}
            </div>
          )}

          {/* Dica de Rastreamento Automático */}
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-3.5 text-xs text-emerald-900">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <div>
              <p className="font-semibold text-emerald-950">Rastreamento Inteligente</p>
              <p className="mt-0.5 text-emerald-800/90 leading-relaxed">
                Este link já inclui tags automáticas para você acompanhar quantas visitas vieram diretamente da leitura do QR Code nas métricas do painel.
              </p>
            </div>
          </div>
        </div>

        {/* Card Moderno do QR Code */}
        <div className="flex flex-col items-center rounded-2xl border border-marfim-200 bg-white p-6 shadow-xs">
          <div className="text-center">
            <h2 className="text-sm font-semibold text-mineral-950">{titulo}</h2>
            <p className="mt-0.5 text-[11px] text-mineral-500">{descricao}</p>
          </div>

          <div className="my-5 rounded-2xl border border-marfim-200/90 bg-marfim-50/40 p-3.5 shadow-2xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dataUriSvg}
              alt={`QR Code de ${titulo}`}
              width={180}
              height={180}
              className="h-44 w-44 rounded-lg bg-white p-2 shadow-2xs"
            />
          </div>

          {/* Link Destino Encurtado Visualmente */}
          <div className="mb-5 w-full rounded-lg bg-marfim-100/60 px-3 py-2 text-center">
            <p className="truncate text-xs font-mono text-mineral-600" title={url}>
              {url}
            </p>
          </div>

          {/* Ações */}
          <div className="flex w-full flex-col gap-2">
            <a
              href={dataUriSvg}
              download={`${nomeArquivo}.svg`}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-mineral-950 px-4 text-xs font-semibold text-white transition hover:bg-mineral-800 active:scale-[0.99]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Baixar em SVG (Vetor)</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void copiarTextoComAviso(url)}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-marfim-300 bg-white px-3 text-xs font-medium text-mineral-800 transition hover:bg-marfim-100/70 active:scale-[0.99]"
              >
                <Copy className="h-3.5 w-3.5 text-mineral-500" />
                <span>Copiar Link</span>
              </button>

              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-marfim-300 bg-white px-3 text-xs font-medium text-mineral-800 transition hover:bg-marfim-100/70 active:scale-[0.99]"
              >
                <ExternalLink className="h-3.5 w-3.5 text-mineral-500" />
                <span>Testar</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


