"use client";

import { usePublicacaoPagina } from "@/ganchos/usePublicacaoPagina";

import Imagem from "next/image";
import { CampoUploadMidiaStorage } from "@/componentes/painel/editor/CampoUploadMidiaStorage";
import { deveIgnorarOtimizadorImagem } from "@/dominio/entidades/paginaPublicada";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import { useRef, useState, type FormEvent } from "react";
import {
  Check,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  Layers,
  Plus,
  Save,
  Search,
  Wrench,
} from "lucide-react";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import {
  converterTextoMoedaParaCentavos,
  formatarApresentacaoPrecoItem,
  formatarCentavosParaCampoMoeda,
  obterListaImagensMidia,
  type MidiaItemCatalogo,
  type ServicoOrganizacao,
} from "@/dominio/entidades/catalogoConteudo";
import { servicoCatalogoConteudoCliente } from "@/infraestrutura/painel/servicoCatalogoConteudoCliente";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { GaleriaImagensComThumbs } from "@/componentes/interface/GaleriaImagensComThumbs";
import { EditorListaImagensCatalogo } from "./EditorListaImagensCatalogo";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { AvisoRecursoRestrito } from "@/componentes/painel/AvisosPublicidade";
import { usarPoliticaPublicidade } from "@/componentes/painel/ProvedorPoliticaPublicidade";
import { CabecalhoPublicacaoRapidaAcervo } from "./CabecalhoPublicacaoRapidaAcervo";

function gerarIdServico(): string {
  return `srv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export interface PropriedadesGerenciadorServicosPainel {
  readonly organizacaoId: string;
  readonly identificadorPublico: string;
  readonly servicosIniciais: readonly ServicoOrganizacao[];
  readonly versaoPublicadaInicial: number | null;
  readonly podeEditarConteudo: boolean;
  readonly podePublicarPagina: boolean;
  readonly servicoCatalogo?: ServicoCatalogoConteudoPorta;
}

export function GerenciadorServicosPainel({
  organizacaoId,
  identificadorPublico,
  servicosIniciais,
  versaoPublicadaInicial,
  podeEditarConteudo,
  podePublicarPagina,
  servicoCatalogo = servicoCatalogoConteudoCliente,
}: PropriedadesGerenciadorServicosPainel) {
  const politicaPublicidade = usarPoliticaPublicidade();
  const [servicos, setServicos] = useState<readonly ServicoOrganizacao[]>(servicosIniciais);

  const [busca, setBusca] = useState("");
  const [filtroVisibilidade, setFiltroVisibilidade] = useState<"todos" | "ativos" | "ocultos">(
    "todos",
  );
  const [alterandoVisibilidadeId, setAlterandoVisibilidadeId] = useState<string | null>(null);
  const referenciaNome = useRef<HTMLInputElement>(null);
  const operacaoEmCurso = useRef(false);
  const servicosFiltrados = servicos.filter((servico) => {
    const correspondeSituacao =
      filtroVisibilidade === "todos" ||
      (filtroVisibilidade === "ativos" ? servico.ativo : !servico.ativo);
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return (
      correspondeSituacao &&
      `${servico.nome} ${servico.categoria} ${servico.resumo}`
        .toLocaleLowerCase("pt-BR")
        .includes(termo)
    );
  });

  // Estado do formulário de Serviço
  const [idServicoEdicao, setIdServicoEdicao] = useState<string | null>(null);
  const [nomeServico, setNomeServico] = useState("");
  const [categoriaServico, setCategoriaServico] = useState("");
  const [resumoServico, setResumoServico] = useState("");
  const [precoServicoTexto, setPrecoServicoTexto] = useState("");
  const [rotuloPrecoServico, setRotuloPrecoServico] = useState("");
  const [prazoServico, setPrazoServico] = useState("");
  const [imagensServico, setImagensServico] = useState<readonly MidiaItemCatalogo[]>([]);

  const [salvando, setSalvando] = useState(false);
  const publicacao = usePublicacaoPagina({
    versaoPublicadaInicial,
    podePublicarPagina,
    bloqueado: salvando || alterandoVisibilidadeId !== null,
    revisaoConteudoSalvo: servicos,
    publicarPagina: () => servicoCatalogo.publicarPagina(organizacaoId),
  });

  function limparFormularioServico() {
    setIdServicoEdicao(null);
    setNomeServico("");
    setCategoriaServico("");
    setResumoServico("");
    setPrecoServicoTexto("");
    setRotuloPrecoServico("");
    setPrazoServico("");
    setImagensServico([]);
  }

  function carregarServicoParaEdicao(servico: ServicoOrganizacao) {
    setIdServicoEdicao(servico.id);
    setNomeServico(servico.nome);
    setCategoriaServico(servico.categoria);
    setResumoServico(servico.resumo);
    setPrecoServicoTexto(formatarCentavosParaCampoMoeda(servico.precoBaseCentavos));
    setRotuloPrecoServico(servico.rotuloPrecoOpcional ?? "");
    setPrazoServico(servico.prazoOuDuracao ?? "");
    setImagensServico(
      obterListaImagensMidia(
        servico.urlImagemOpcional
          ? {
              url: servico.urlImagemOpcional,
              textoAlternativo: servico.nome,
              pontoFocal: servico.pontoFocalImagem,
            }
          : null,
        servico.imagens,
      ),
    );
    referenciaNome.current?.focus();
  }

  async function salvarFormularioServico(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!podeEditarConteudo || publicacao.publicando || operacaoEmCurso.current) {
      return;
    }

    operacaoEmCurso.current = true;
    setSalvando(true);

    try {
      const precoBaseCentavos = converterTextoMoedaParaCentavos(precoServicoTexto);
      const existente = servicos.find((s) => s.id === idServicoEdicao);
      const imagemPrincipal = imagensServico[0];
      const novoOuAtualizado: ServicoOrganizacao = {
        id: existente?.id ?? gerarIdServico(),
        organizacaoId,
        nome: nomeServico.trim(),
        categoria: categoriaServico.trim(),
        resumo: resumoServico.trim(),
        ...(imagemPrincipal?.url ? { urlImagemOpcional: imagemPrincipal.url } : {}),
        ...(imagemPrincipal?.pontoFocal
          ? { pontoFocalImagem: imagemPrincipal.pontoFocal }
          : existente?.pontoFocalImagem
            ? { pontoFocalImagem: existente.pontoFocalImagem }
            : {}),
        ...(imagensServico.length > 0 ? { imagens: imagensServico } : {}),
        ...(typeof precoBaseCentavos === "number" ? { precoBaseCentavos } : {}),
        ...(rotuloPrecoServico.trim() ? { rotuloPrecoOpcional: rotuloPrecoServico.trim() } : {}),
        ...(prazoServico.trim() ? { prazoOuDuracao: prazoServico.trim() } : {}),
        ordemExibicao: existente?.ordemExibicao ?? servicos.length + 1,
        ativo: existente?.ativo ?? true,
        atualizadoEmIso: new Date().toISOString(),
      };

      await servicoCatalogo.salvarServico(novoOuAtualizado);

      setServicos((atuais) => {
        const existeNaLista = atuais.some((item) => item.id === novoOuAtualizado.id);
        return existeNaLista
          ? atuais.map((item) => (item.id === novoOuAtualizado.id ? novoOuAtualizado : item))
          : [...atuais, novoOuAtualizado];
      });

      limparFormularioServico();
      notificar.sucesso(
        "Serviço salvo com sucesso. Clique em 'Publicar página' para sincronizar com a vitrine e com os fluxos interativos.",
      );
    } catch (erro) {
      notificar.erro(erro instanceof Error ? erro.message : "Não foi possível salvar o serviço.");
    } finally {
      operacaoEmCurso.current = false;
      setSalvando(false);
    }
  }

  async function alternarAtivoServico(servico: ServicoOrganizacao) {
    if (!podeEditarConteudo || publicacao.publicando || operacaoEmCurso.current) {
      return;
    }

    operacaoEmCurso.current = true;
    setAlterandoVisibilidadeId(servico.id);
    const atualizado: ServicoOrganizacao = {
      ...servico,
      ativo: !servico.ativo,
      atualizadoEmIso: new Date().toISOString(),
    };
    try {
      await servicoCatalogo.salvarServico(atualizado);
      setServicos((atuais) => atuais.map((item) => (item.id === servico.id ? atualizado : item)));
    } catch (erro) {
      notificar.erro(
        erro instanceof Error ? erro.message : "Não foi possível alterar a situação do serviço.",
      );
    } finally {
      operacaoEmCurso.current = false;
      setAlterandoVisibilidadeId(null);
    }
  }

  return (
    <div className="space-y-6">
      <CabecalhoPublicacaoRapidaAcervo
        aparencia="clara"
        titulo="Serviços"
        subtitulo="Organize seus serviços, valores e prazos. Publique as atualizações para apresentar suas ofertas na vitrine."
        identificadorPublico={identificadorPublico}

        controle={publicacao}
      />

      <section aria-label="Resumo dos serviços" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            rotulo: "Serviços cadastrados",
            quantidade: servicos.length,
            icone: Wrench,
            cor: "border-indigo-200 from-indigo-50/80 text-indigo-950",
            iconeCor: "bg-indigo-600",
          },
          {
            rotulo: "Serviços ativos",
            quantidade: servicos.filter((s) => s.ativo).length,
            icone: Check,
            cor: "border-emerald-200 from-emerald-50/80 text-emerald-950",
            iconeCor: "bg-emerald-600",
          },
          {
            rotulo: "Categorias",
            quantidade: new Set(servicos.map((s) => s.categoria.trim().toLocaleLowerCase("pt-BR")))
              .size,
            icone: Layers,
            cor: "border-sky-200 from-sky-50/80 text-sky-950",
            iconeCor: "bg-sky-600",
          },
          {
            rotulo: "Serviços ocultos",
            quantidade: servicos.filter((s) => !s.ativo).length,
            icone: EyeOff,
            cor: "border-violet-200 from-violet-50/80 text-violet-950",
            iconeCor: "bg-violet-600",
          },
        ].map((item) => (
          <div
            key={item.rotulo}
            className={combinarClasses(
              "rounded-2xl border bg-gradient-to-b via-white to-white p-4 shadow-xs sm:p-5",
              item.cor,
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold">{item.rotulo}</p>
              <span
                className={combinarClasses(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white",
                  item.iconeCor,
                )}
              >
                <item.icone className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold tabular-nums">{item.quantidade}</p>
          </div>
        ))}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <CartaoSuperficie className="min-w-0 rounded-2xl bg-gradient-to-b from-indigo-50/30 via-white to-white p-5 shadow-xs sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Wrench className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="text-base font-semibold text-mineral-950">
              {idServicoEdicao ? "Editar serviço" : "Novo serviço"}
            </h2>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-mineral-500">
            Defina o que você oferece e salve. Depois, publique para atualizar sua vitrine.
          </p>

          <form onSubmit={salvarFormularioServico} className="mt-4 space-y-4">
            <CampoFormulario
              className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
              ref={referenciaNome}
              rotulo="Nome do serviço"
              required
              disabled={!podeEditarConteudo || publicacao.publicando || salvando}
              value={nomeServico}
              onChange={(e) => setNomeServico(e.target.value)}
              placeholder="Ex.: Consultoria em Fusões & Aquisições ou Estética Automotiva"
            />

            <CampoFormulario
              className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
              rotulo="Categoria ou área"
              required
              disabled={!podeEditarConteudo || publicacao.publicando || salvando}
              value={categoriaServico}
              onChange={(e) => setCategoriaServico(e.target.value)}
              placeholder="Ex.: Consultoria, Blindagem, Detailing, Manutenção"
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="resumo-servico" className="text-sm font-medium text-mineral-900">
                Resumo editorial *
              </label>
              <textarea
                id="resumo-servico"
                rows={3}
                required
                disabled={!podeEditarConteudo || publicacao.publicando || salvando}
                value={resumoServico}
                onChange={(e) => setResumoServico(e.target.value)}
                placeholder="Explique com clareza o escopo e para quem este serviço é indicado."
                className="w-full rounded-lg border border-marfim-200 bg-white px-3.5 py-2.5 text-sm text-mineral-950 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            {politicaPublicidade.exibePrecoServico() ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <CampoFormulario
                  className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
                  rotulo="Valor base opcional"
                  prefixoFixo="R$"
                  disabled={!podeEditarConteudo || publicacao.publicando || salvando}
                  value={precoServicoTexto}
                  onChange={(e) => setPrecoServicoTexto(e.target.value)}
                  placeholder="850,00"
                  textoAuxiliar="Deixe em branco para exibir 'Sob consulta'."
                />

                <CampoFormulario
                  className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
                  rotulo="Complemento de preço (opcional)"
                  disabled={!podeEditarConteudo || publicacao.publicando || salvando}
                  value={rotuloPrecoServico}
                  onChange={(e) => setRotuloPrecoServico(e.target.value)}
                  placeholder="Ex.: A partir de / Por sessão"
                />
              </div>
            ) : (
              <AvisoRecursoRestrito mensagem="valores de serviços não são exibidos na sua vitrine." />
            )}

            <CampoFormulario
              className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
              rotulo="Duração ou prazo estimado (opcional)"
              disabled={!podeEditarConteudo || publicacao.publicando || salvando}
              value={prazoServico}
              onChange={(e) => setPrazoServico(e.target.value)}
              placeholder="Ex.: 60 minutos, 2 dias ou 4 a 6 semanas"
            />

            <EditorListaImagensCatalogo
              organizacaoId={organizacaoId}
              rotulo="Fotografias do serviço (opcional)"
              imagens={imagensServico}
              aoAlterarImagens={setImagensServico}
              servicoUpload={servicoCatalogo}
              desabilitado={!podeEditarConteudo || publicacao.publicando || salvando}
              tituloFallback={nomeServico || "Serviço"}
            />

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Botao
                type="submit"
                variante="operacional_primario"
                tamanho="compacto"
                disabled={
                  !podeEditarConteudo || publicacao.publicando || alterandoVisibilidadeId !== null
                }
                className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                carregando={salvando}
              >
                {idServicoEdicao ? (
                  <Save className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{idServicoEdicao ? "Salvar alterações" : "Adicionar serviço"}</span>
              </Botao>

              {idServicoEdicao ? (
                <Botao
                  variante="fantasma"
                  tamanho="compacto"
                  disabled={salvando || alterandoVisibilidadeId !== null}
                  onClick={limparFormularioServico}
                >
                  Cancelar edição
                </Botao>
              ) : null}
            </div>
          </form>
        </CartaoSuperficie>

        <section aria-labelledby="titulo-lista-servicos" className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="titulo-lista-servicos" className="text-base font-semibold text-mineral-950">
                Seus serviços{" "}
                <span className="ml-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                  {servicos.length}
                </span>
              </h2>
              <p className="mt-1 text-xs text-mineral-500">
                Gerencie suas ofertas e a visibilidade na vitrine.
              </p>
            </div>
            {idServicoEdicao && podeEditarConteudo ? (
              <Botao
                variante="operacional_secundario"
                tamanho="compacto"
                disabled={salvando || alterandoVisibilidadeId !== null}
                className="rounded-lg border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100"
                onClick={() => {
                  limparFormularioServico();
                  referenciaNome.current?.focus();
                }}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Novo serviço
              </Botao>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-marfim-200 bg-white p-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mineral-400"
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="Buscar serviços"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar nome ou categoria…"
                className="min-h-10 w-full rounded-lg border border-marfim-200 bg-white py-2 pr-3 pl-9 text-xs focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <select
              aria-label="Filtrar visibilidade"
              value={filtroVisibilidade}
              onChange={(e) => setFiltroVisibilidade(e.target.value as typeof filtroVisibilidade)}
              className="min-h-10 min-w-0 rounded-lg border border-marfim-200 bg-white px-3 py-2 text-xs text-mineral-700 focus:border-indigo-400 focus:outline-none"
            >
              <option value="todos">Todos os serviços</option>
              <option value="ativos">Ativos</option>
              <option value="ocultos">Ocultos</option>
            </select>
          </div>
          {servicosFiltrados.length === 0 ? (
            <CartaoSuperficie className="flex min-h-64 flex-col items-center justify-center rounded-2xl border-dashed p-6 text-center shadow-none">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <Wrench className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-sm font-semibold text-mineral-900">
                {servicos.length === 0
                  ? "Seu primeiro serviço começa aqui"
                  : "Nenhum serviço encontrado"}
              </h3>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-mineral-500">
                {servicos.length === 0
                  ? "Cadastre suas principais frentes de atendimento no formulário para preparar a vitrine."
                  : "Tente outro nome, categoria ou visibilidade."}
              </p>
              {servicos.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setBusca("");
                    setFiltroVisibilidade("todos");
                  }}
                  className="mt-3 min-h-10 rounded-lg px-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                >
                  Limpar filtros
                </button>
              ) : null}
            </CartaoSuperficie>
          ) : (
            <ul aria-label="Lista de serviços" className="space-y-3">
              {servicosFiltrados.map((servico) => (
                <li key={servico.id}>
                  <CartaoSuperficie
                    className={combinarClasses(
                      "overflow-hidden rounded-2xl p-0 shadow-xs transition-shadow hover:shadow-sm",
                      idServicoEdicao === servico.id
                        ? "border-indigo-300 ring-1 ring-indigo-100"
                        : "border-marfim-200",
                    )}
                  >
                    <GaleriaImagensComThumbs
                      imagens={obterListaImagensMidia(
                        servico.urlImagemOpcional
                          ? {
                              url: servico.urlImagemOpcional,
                              textoAlternativo: servico.nome,
                              pontoFocal: servico.pontoFocalImagem,
                            }
                          : null,
                        servico.imagens,
                      )}
                      tituloFallback={servico.nome}
                      sizes="(max-width: 768px) 100vw, 420px"
                      className="p-3 pb-0"
                    />
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                          <Wrench className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="break-words text-[10px] font-medium tracking-wider text-mineral-500 uppercase">
                              {servico.categoria}
                            </p>
                            <span
                              className={combinarClasses(
                                "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                                servico.ativo
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "border-violet-200 bg-violet-50 text-violet-800",
                              )}
                            >
                              {servico.ativo ? "Ativo" : "Oculto"}
                            </span>
                          </div>
                          <h3 className="mt-1 break-words text-sm font-semibold text-mineral-950">
                            {servico.nome}
                          </h3>
                        </div>
                      </div>
                      <p className="mt-3 break-words text-xs leading-relaxed text-mineral-500">
                        {servico.resumo}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-marfim-100 bg-marfim-50/50 px-3 py-2.5">
                        {politicaPublicidade.exibePrecoServico() ? (
                          <p className="text-sm font-bold tracking-tight text-mineral-950">
                            {formatarApresentacaoPrecoItem({
                              centavos: servico.precoBaseCentavos,
                              rotuloOpcional: servico.rotuloPrecoOpcional,
                            })}
                          </p>
                        ) : null}
                        {servico.prazoOuDuracao ? (
                          <p className="flex items-center gap-1.5 text-xs text-mineral-500">
                            <Clock3
                              className="h-3.5 w-3.5 shrink-0 text-sky-500"
                              aria-hidden="true"
                            />
                            {servico.prazoOuDuracao}
                          </p>
                        ) : null}
                        {!politicaPublicidade.exibePrecoServico() && !servico.prazoOuDuracao ? (
                          <p className="text-xs text-mineral-500">
                            Consulte os detalhes do atendimento
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-marfim-100 px-4 py-2">
                      <p className="text-[10px] text-mineral-500">
                        {idServicoEdicao === servico.id
                          ? "Em edição"
                          : servico.ativo
                            ? "Incluído na próxima publicação"
                            : "Fora da próxima publicação"}
                      </p>
                      <div className="flex items-center gap-1">
                        <Botao
                          variante="fantasma"
                          tamanho="compacto"
                          className="rounded-lg px-2.5 text-xs text-indigo-700 hover:bg-indigo-50"
                          disabled={
                            !podeEditarConteudo ||
                            publicacao.publicando ||
                            salvando ||
                            alterandoVisibilidadeId !== null
                          }
                          aria-label={`Editar ${servico.nome}`}
                          onClick={() => carregarServicoParaEdicao(servico)}
                        >
                          <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                          Editar
                        </Botao>
                        <Botao
                          variante="fantasma"
                          tamanho="compacto"
                          className="rounded-lg px-2.5 text-xs text-mineral-600 hover:bg-marfim-50"
                          disabled={
                            !podeEditarConteudo ||
                            publicacao.publicando ||
                            salvando ||
                            alterandoVisibilidadeId !== null
                          }
                          carregando={alterandoVisibilidadeId === servico.id}
                          textoCarregando="Salvando…"
                          aria-label={
                            servico.ativo ? `Ocultar ${servico.nome}` : `Reativar ${servico.nome}`
                          }
                          onClick={() => alternarAtivoServico(servico)}
                        >
                          {servico.ativo ? (
                            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          {servico.ativo ? "Ocultar" : "Reativar"}
                        </Botao>
                      </div>
                    </div>
                  </CartaoSuperficie>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function FotoServico({ servico }: { readonly servico: ServicoOrganizacao }) {
  const [falhou, setFalhou] = useState(false);
  if (!servico.urlImagemOpcional || falhou) return null;
  return (
    <div className="relative aspect-[16/7] overflow-hidden bg-sky-50">
      <Imagem
        src={servico.urlImagemOpcional}
        alt={servico.nome}
        fill
        sizes="(min-width: 1280px) 600px, 100vw"
        unoptimized={deveIgnorarOtimizadorImagem(servico.urlImagemOpcional)}
        className="object-cover"
        style={{
          objectPosition: `${servico.pontoFocalImagem?.xPercentual ?? 50}% ${servico.pontoFocalImagem?.yPercentual ?? 50}%`,
        }}
        onError={() => setFalhou(true)}
      />
    </div>
  );
}
