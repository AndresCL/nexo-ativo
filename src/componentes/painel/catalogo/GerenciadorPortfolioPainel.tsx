"use client";

import { usePublicacaoPagina } from "@/ganchos/usePublicacaoPagina";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import { useRef, useState, type FormEvent } from "react";
import {
  Edit3,
  Eye,
  EyeOff,
  Images,
  MapPin,
  Plus,
  Save,
  Search,
} from "lucide-react";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import {
  obterListaImagensMidia,
  type MidiaItemCatalogo,
  type ProjetoPortfolio,
} from "@/dominio/entidades/catalogoConteudo";
import { servicoCatalogoConteudoCliente } from "@/infraestrutura/painel/servicoCatalogoConteudoCliente";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { GaleriaImagensComThumbs } from "@/componentes/interface/GaleriaImagensComThumbs";
import { EditorListaImagensCatalogo } from "./EditorListaImagensCatalogo";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { AvisosPublicidade } from "@/componentes/painel/AvisosPublicidade";
import { CabecalhoPublicacaoRapidaAcervo } from "./CabecalhoPublicacaoRapidaAcervo";

export interface PropriedadesGerenciadorPortfolioPainel {
  readonly organizacaoId: string;
  readonly identificadorPublico: string;
  readonly projetosIniciais: readonly ProjetoPortfolio[];
  readonly versaoPublicadaInicial: number | null;
  readonly podeEditarConteudo: boolean;
  readonly podePublicarPagina: boolean;
  readonly servicoCatalogo?: ServicoCatalogoConteudoPorta;
}

export function GerenciadorPortfolioPainel({
  organizacaoId,
  identificadorPublico,
  projetosIniciais,
  versaoPublicadaInicial,
  podeEditarConteudo,
  podePublicarPagina,
  servicoCatalogo = servicoCatalogoConteudoCliente,
}: PropriedadesGerenciadorPortfolioPainel) {
  const [projetos, setProjetos] = useState<readonly ProjetoPortfolio[]>(projetosIniciais);
  const [busca, setBusca] = useState("");
  const [filtroVisibilidade, setFiltroVisibilidade] = useState<"todos" | "ativos" | "ocultos">(
    "todos",
  );
  const [alterandoVisibilidadeId, setAlterandoVisibilidadeId] = useState<string | null>(null);
  const referenciaTitulo = useRef<HTMLInputElement>(null);
  const operacaoEmCurso = useRef(false);
  const projetosFiltrados = projetos.filter((projeto) => {
    const correspondeSituacao =
      filtroVisibilidade === "todos" ||
      (filtroVisibilidade === "ativos" ? projeto.ativo : !projeto.ativo);
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return (
      correspondeSituacao &&
      `${projeto.titulo} ${projeto.categoriaOuSerie} ${projeto.anoOuLocal ?? ""} ${projeto.resumoEditorial}`
        .toLocaleLowerCase("pt-BR")
        .includes(termo)
    );
  });
  const [idProjetoEdicao, setIdProjetoEdicao] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [categoriaOuSerie, setCategoriaOuSerie] = useState("");
  const [anoOuLocal, setAnoOuLocal] = useState("");
  const [resumoEditorial, setResumoEditorial] = useState("");
  const [imagensProjeto, setImagensProjeto] = useState<readonly MidiaItemCatalogo[]>([]);
  const [textoAlternativoCapa, setTextoAlternativoCapa] = useState("");

  const [salvando, setSalvando] = useState(false);
  const publicacao = usePublicacaoPagina({
    versaoPublicadaInicial,
    podePublicarPagina,
    bloqueado: salvando || alterandoVisibilidadeId !== null,
    revisaoConteudoSalvo: projetos,
    publicarPagina: () => servicoCatalogo.publicarPagina(organizacaoId),
  });

  function limparFormulario() {
    setIdProjetoEdicao(null);
    setTitulo("");
    setCategoriaOuSerie("");
    setAnoOuLocal("");
    setResumoEditorial("");
    setImagensProjeto([]);
    setTextoAlternativoCapa("");
  }

  function editarProjeto(projeto: ProjetoPortfolio) {
    setIdProjetoEdicao(projeto.id);
    setTitulo(projeto.titulo);
    setCategoriaOuSerie(projeto.categoriaOuSerie);
    setAnoOuLocal(projeto.anoOuLocal ?? "");
    setResumoEditorial(projeto.resumoEditorial);
    setImagensProjeto(
      obterListaImagensMidia(
        {
          url: projeto.urlImagemCapa,
          textoAlternativo: projeto.textoAlternativoCapa,
          pontoFocal: projeto.pontoFocalCapa,
        },
        projeto.imagens,
      ),
    );
    setTextoAlternativoCapa(projeto.textoAlternativoCapa);
    referenciaTitulo.current?.focus();
  }

  async function salvarProjeto(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!podeEditarConteudo || publicacao.publicando || operacaoEmCurso.current) {
      return;
    }

    operacaoEmCurso.current = true;
    setSalvando(true);

    try {
      const existente = projetos.find((p) => p.id === idProjetoEdicao);
      const imagemPrincipal = imagensProjeto[0];
      const registro: ProjetoPortfolio = {
        id:
          existente?.id ??
          `prj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        organizacaoId,
        titulo: titulo.trim(),
        categoriaOuSerie: categoriaOuSerie.trim(),
        ...(anoOuLocal.trim() ? { anoOuLocal: anoOuLocal.trim() } : {}),
        resumoEditorial: resumoEditorial.trim(),
        urlImagemCapa: imagemPrincipal?.url ?? "",
        textoAlternativoCapa: textoAlternativoCapa.trim() || `Fotografia de ${titulo.trim()}`,
        pontoFocalCapa: imagemPrincipal?.pontoFocal ?? { xPercentual: 50, yPercentual: 50 },
        ...(imagensProjeto.length > 0 ? { imagens: imagensProjeto } : {}),
        destaqueVitrine: existente?.destaqueVitrine ?? true,
        ordemExibicao: existente?.ordemExibicao ?? projetos.length + 1,
        ativo: existente?.ativo ?? true,
        atualizadoEmIso: new Date().toISOString(),
      };

      await servicoCatalogo.salvarProjetoPortfolio(registro);

      setProjetos((atuais) => {
        const existe = atuais.some((p) => p.id === registro.id);
        return existe
          ? atuais.map((p) => (p.id === registro.id ? registro : p))
          : [...atuais, registro];
      });

      limparFormulario();
      notificar.sucesso(
        "Projeto salvo no portfólio. Publique as atualizações para exibi-lo na vitrine.",
      );
    } catch (e) {
      notificar.erro(e instanceof Error ? e.message : "Não foi possível salvar o projeto.");
    } finally {
      operacaoEmCurso.current = false;
      setSalvando(false);
    }
  }

  async function alternarAtivo(projeto: ProjetoPortfolio) {
    if (!podeEditarConteudo || publicacao.publicando || operacaoEmCurso.current) {
      return;
    }
    operacaoEmCurso.current = true;
    setAlterandoVisibilidadeId(projeto.id);
    const atualizado: ProjetoPortfolio = {
      ...projeto,
      ativo: !projeto.ativo,
      atualizadoEmIso: new Date().toISOString(),
    };
    try {
      await servicoCatalogo.salvarProjetoPortfolio(atualizado);
      setProjetos((atuais) => atuais.map((p) => (p.id === projeto.id ? atualizado : p)));
    } catch (e) {
      notificar.erro(e instanceof Error ? e.message : "Não foi possível atualizar a visibilidade.");
    } finally {
      operacaoEmCurso.current = false;
      setAlterandoVisibilidadeId(null);
    }
  }

  return (
    <div className="space-y-6">
      <CabecalhoPublicacaoRapidaAcervo
        aparencia="clara"
        titulo="Portfólio"
        subtitulo="Apresente seus projetos, obras e entregas. Organize as imagens e publique seus trabalhos na vitrine."
        identificadorPublico={identificadorPublico}
        controle={publicacao}
      />

      <AvisosPublicidade areas={["portfolio"]} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="min-w-0 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-mineral-950">
              {idProjetoEdicao ? "Editar projeto" : "Adicionar projeto ao portfólio"}
            </h2>
            <p className="mt-1 text-xs text-mineral-500">
              Conte a história do projeto, escolha uma capa e salve. Depois, publique para atualizar a
              vitrine.
            </p>
          </div>

          <CartaoSuperficie className="min-w-0 rounded-2xl bg-white p-5 shadow-2xs sm:p-6">
            <form onSubmit={salvarProjeto} className="space-y-4">
            <CampoFormulario
              className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
              ref={referenciaTitulo}
              rotulo="Título do projeto ou obra"
              required
              disabled={!podeEditarConteudo || publicacao.publicando || salvando}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Residência Vale das Pedras"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <CampoFormulario
                className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
                rotulo="Categoria ou série"
                required
                disabled={!podeEditarConteudo || publicacao.publicando || salvando}
                value={categoriaOuSerie}
                onChange={(e) => setCategoriaOuSerie(e.target.value)}
                placeholder="Ex.: Casa de Campo · 620 m²"
              />

              <CampoFormulario
                className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
                rotulo="Ano ou cidade (opcional)"
                disabled={!podeEditarConteudo || publicacao.publicando || salvando}
                value={anoOuLocal}
                onChange={(e) => setAnoOuLocal(e.target.value)}
                placeholder="Ex.: Itu · 2025"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="resumo-projeto-portfolio"
                className="text-sm font-medium text-mineral-900"
              >
                Resumo editorial *
              </label>
              <textarea
                id="resumo-projeto-portfolio"
                rows={3}
                required
                disabled={!podeEditarConteudo || publicacao.publicando || salvando}
                value={resumoEditorial}
                onChange={(e) => setResumoEditorial(e.target.value)}
                placeholder="Contexto, materiais ou resultados relevantes deste trabalho."
                className="w-full rounded-lg border border-marfim-200 bg-white px-3.5 py-2.5 text-sm text-mineral-950 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <EditorListaImagensCatalogo
              organizacaoId={organizacaoId}
              rotulo="Fotografias do projeto"
              obrigatorio
              imagens={imagensProjeto}
              aoAlterarImagens={setImagensProjeto}
              servicoUpload={servicoCatalogo}
              desabilitado={!podeEditarConteudo || publicacao.publicando || salvando}
              tituloFallback={titulo || "Projeto"}
            />

            <CampoFormulario
              className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
              rotulo="Texto alternativo da capa"
              disabled={!podeEditarConteudo || publicacao.publicando || salvando}
              value={textoAlternativoCapa}
              onChange={(e) => setTextoAlternativoCapa(e.target.value)}
              placeholder="Descrição breve da fotografia para acessibilidade"
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
                {idProjetoEdicao ? (
                  <Save className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{idProjetoEdicao ? "Salvar alterações" : "Adicionar ao portfólio"}</span>
              </Botao>

              {idProjetoEdicao ? (
                <Botao
                  variante="fantasma"
                  tamanho="compacto"
                  disabled={salvando || alterandoVisibilidadeId !== null}
                  onClick={limparFormulario}
                >
                  Cancelar edição
                </Botao>
              ) : null}
            </div>
          </form>
        </CartaoSuperficie>
      </div>

        <section aria-labelledby="titulo-lista-projetos" className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="titulo-lista-projetos" className="text-base font-semibold text-mineral-950">
                Seus projetos{" "}
                <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-mineral-800">
                  {projetos.length}
                </span>
              </h2>
              <p className="mt-1 text-xs text-mineral-500">
                Uma visão dos trabalhos que compõem seu portfólio.
              </p>
            </div>
            {idProjetoEdicao && podeEditarConteudo ? (
              <Botao
                variante="operacional_secundario"
                tamanho="compacto"
                disabled={salvando || alterandoVisibilidadeId !== null}
                className="rounded-lg border-neutral-300 bg-white text-mineral-900 hover:bg-neutral-50 shadow-2xs"
                onClick={() => {
                  limparFormulario();
                  referenciaTitulo.current?.focus();
                }}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Novo projeto
              </Botao>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-2xs sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mineral-400"
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="Buscar projetos"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar projeto, categoria ou local…"
                className="min-h-10 w-full rounded-lg border border-neutral-200 bg-white py-2 pr-3 pl-9 text-xs focus:border-mineral-950 focus:outline-none"
              />
            </div>
            <select
              aria-label="Filtrar visibilidade"
              value={filtroVisibilidade}
              onChange={(e) => setFiltroVisibilidade(e.target.value as typeof filtroVisibilidade)}
              className="min-h-10 min-w-0 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-mineral-700 focus:border-mineral-950 focus:outline-none"
            >
              <option value="todos">Todos os projetos</option>
              <option value="ativos">Ativos</option>
              <option value="ocultos">Ocultos</option>
            </select>
          </div>
          {projetosFiltrados.length === 0 ? (
            <CartaoSuperficie className="flex min-h-64 flex-col items-center justify-center rounded-2xl border-dashed p-6 text-center shadow-none">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <Images className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-sm font-semibold text-mineral-900">
                {projetos.length === 0 ? "Seu portfólio começa aqui" : "Nenhum projeto encontrado"}
              </h3>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-mineral-500">
                {projetos.length === 0
                  ? "Adicione seu primeiro trabalho com uma imagem de capa e uma breve descrição."
                  : "Tente outro título, categoria, local ou visibilidade."}
              </p>
              {projetos.length > 0 ? (
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
            <ul
              aria-label="Lista de projetos"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"
            >
              {projetosFiltrados.map((projeto) => (
                <li key={projeto.id} className="min-w-0">
                  <CartaoSuperficie
                    className={combinarClasses(
                      "flex h-full flex-col overflow-hidden rounded-2xl p-0 shadow-xs transition-shadow hover:shadow-sm",
                      idProjetoEdicao === projeto.id
                        ? "border-indigo-300 ring-1 ring-indigo-100"
                        : "border-marfim-200",
                    )}
                  >
                    <GaleriaImagensComThumbs
                      imagens={obterListaImagensMidia(
                        {
                          url: projeto.urlImagemCapa,
                          textoAlternativo: projeto.textoAlternativoCapa,
                          pontoFocal: projeto.pontoFocalCapa,
                        },
                        projeto.imagens,
                      )}
                      tituloFallback={projeto.titulo}
                      proporcaoClassName="aspect-[16/10]"
                      sizes="(max-width: 768px) 100vw, 420px"
                      className="p-3 pb-0"
                    />
                    <div className="flex-1 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="break-words text-[10px] font-medium tracking-wider text-mineral-500 uppercase">
                          {projeto.categoriaOuSerie}
                        </p>
                        <span
                          className={combinarClasses(
                            "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                            projeto.ativo
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-violet-200 bg-violet-50 text-violet-800",
                          )}
                        >
                          {projeto.ativo ? "Ativo" : "Oculto"}
                        </span>
                      </div>
                      <h3 className="mt-2 break-words text-sm font-semibold text-mineral-950">
                        {projeto.titulo}
                      </h3>
                      {projeto.anoOuLocal ? (
                        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-mineral-500">
                          <MapPin className="h-3 w-3 shrink-0 text-sky-500" aria-hidden="true" />
                          {projeto.anoOuLocal}
                        </p>
                      ) : null}
                      <p className="mt-3 break-words text-xs leading-relaxed text-mineral-500">
                        {projeto.resumoEditorial}
                      </p>
                    </div>
                    <div className="border-t border-marfim-100 px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-1">
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
                          aria-label={`Editar ${projeto.titulo}`}
                          onClick={() => editarProjeto(projeto)}
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
                          carregando={alterandoVisibilidadeId === projeto.id}
                          textoCarregando="Salvando…"
                          aria-label={
                            projeto.ativo
                              ? `Ocultar ${projeto.titulo}`
                              : `Reativar ${projeto.titulo}`
                          }
                          onClick={() => alternarAtivo(projeto)}
                        >
                          {projeto.ativo ? (
                            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          {projeto.ativo ? "Ocultar" : "Reativar"}
                        </Botao>
                      </div>
                      <p className="mt-1 px-2.5 text-[10px] text-mineral-500">
                        {idProjetoEdicao === projeto.id
                          ? "Em edição"
                          : projeto.ativo
                            ? "Incluído na próxima publicação"
                            : "Fora da próxima publicação"}
                      </p>
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
