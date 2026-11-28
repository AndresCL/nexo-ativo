"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import {
  LIMITE_MAXIMO_CARDAPIOS_ORGANIZACAO,
  type CardapioOrganizacao,
} from "@/dominio/entidades/cardapioDigital";
import {
  excluirCardapioOrganizacaoCliente,
  listarCardapiosOrganizacaoCliente,
  salvarCardapioOrganizacaoCliente,
} from "@/infraestrutura/cardapio/servicoCardapioCliente";
import { FormularioCardapioPainel } from "./FormularioCardapioPainel";

interface PropriedadesGerenciadorCardapiosPainel {
  readonly organizacaoId: string;
  readonly identificadorPublico: string;
  readonly cardapiosIniciais?: readonly CardapioOrganizacao[];
}

export function GerenciadorCardapiosPainel({
  organizacaoId,
  identificadorPublico,
  cardapiosIniciais,
}: PropriedadesGerenciadorCardapiosPainel) {
  const [cardapios, setCardapios] = useState<readonly CardapioOrganizacao[]>(
    cardapiosIniciais ?? [],
  );
  const [carregando, setCarregando] = useState(!cardapiosIniciais);
  const [emEdicao, setEmEdicao] = useState<CardapioOrganizacao | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (cardapiosIniciais) return;
    let ativo = true;
    listarCardapiosOrganizacaoCliente(organizacaoId)
      .then((lista) => {
        if (ativo) setCardapios(lista);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [organizacaoId, cardapiosIniciais]);

  const caminhoPublico = `/${identificadorPublico}/cardapio`;

  function abrirNovoCardapio() {
    const id = `cardapio-${Date.now()}`;
    setEmEdicao({
      id,
      organizacaoId,
      slug: "cardapio",
      titulo: cardapios.length === 0 ? "Cardápio Principal" : "",
      paginas: [],
      ordemExibicao: cardapios.length,
      ativo: true,
      atualizadoEmIso: new Date().toISOString(),
    });
  }

  async function salvar(cardapio: CardapioOrganizacao) {
    setSalvando(true);
    try {
      const salvo = await salvarCardapioOrganizacaoCliente(cardapio);
      setCardapios((atuais) => {
        const existe = atuais.some((c) => c.id === salvo.id);
        const lista = existe
          ? atuais.map((c) => (c.id === salvo.id ? salvo : c))
          : [...atuais, salvo];
        return lista.slice().sort((a, b) => a.ordemExibicao - b.ordemExibicao);
      });
      setEmEdicao(null);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(cardapio: CardapioOrganizacao) {
    if (!window.confirm(`Excluir o cardápio "${cardapio.titulo}"?`)) return;
    await excluirCardapioOrganizacaoCliente(cardapio);
    setCardapios((atuais) => atuais.filter((c) => c.id !== cardapio.id));
  }

  function copiarLink() {
    if (typeof window === "undefined") return;
    void navigator.clipboard.writeText(`${window.location.origin}${caminhoPublico}`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-texto-primario">Cardápios digitais</h3>
          <p className="text-xs text-texto-secundario">
            Suba um ou mais PDFs/imagens (ex.: Almoço, Bebidas). Eles abrem em tela cheia com header
            da sua marca.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copiarLink}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-borda-sutil px-3 py-1.5 text-xs font-medium text-texto-primario"
          >
            {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiado ? "Link copiado" : "Copiar link"}</span>
          </button>

          <a
            href={caminhoPublico}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-borda-sutil px-3 py-1.5 text-xs font-medium text-texto-primario"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Ver tela cheia</span>
          </a>

          {!emEdicao && cardapios.length < LIMITE_MAXIMO_CARDAPIOS_ORGANIZACAO ? (
            <button
              type="button"
              onClick={abrirNovoCardapio}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-destaque-primario px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Novo cardápio</span>
            </button>
          ) : null}
        </div>
      </div>

      {emEdicao ? (
        <FormularioCardapioPainel
          organizacaoId={organizacaoId}
          cardapioInicial={emEdicao}
          todosCardapios={cardapios}
          salvando={salvando}
          aoSalvar={salvar}
          aoCancelar={() => setEmEdicao(null)}
        />
      ) : null}

      {carregando ? (
        <p className="text-xs text-texto-secundario">Carregando cardápios...</p>
      ) : cardapios.length === 0 && !emEdicao ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-borda-sutil p-8 text-center">
          <UtensilsCrossed className="h-8 w-8 text-texto-secundario opacity-60" />
          <p className="mt-2 text-sm font-semibold text-texto-primario">Nenhum cardápio cadastrado</p>
          <p className="mt-1 max-w-sm text-xs text-texto-secundario">
            Suba o PDF do seu cardápio atual para oferecer leitura rápida no link da bio e QR Code.
          </p>
          <button
            type="button"
            onClick={abrirNovoCardapio}
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-destaque-primario px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar primeiro cardápio</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {cardapios.map((cardapio) => (
            <div
              key={cardapio.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-borda-sutil bg-superficie-elevada px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-texto-primario">
                    {cardapio.titulo}
                  </span>
                  {!cardapio.ativo ? (
                    <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-medium text-texto-secundario">
                      Oculto
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-texto-secundario">
                  {cardapio.paginas.length}{" "}
                  {cardapio.paginas.length === 1 ? "página" : "páginas"}
                  {cardapio.subtituloOpcional ? ` · ${cardapio.subtituloOpcional}` : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEmEdicao(cardapio)}
                  aria-label={`Editar ${cardapio.titulo}`}
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-borda-sutil text-texto-secundario hover:text-texto-primario"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => void excluir(cardapio)}
                  aria-label={`Excluir ${cardapio.titulo}`}
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

