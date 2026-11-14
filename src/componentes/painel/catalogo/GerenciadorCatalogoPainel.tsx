"use client";

import Imagem from "next/image";

import { usePublicacaoPagina } from "@/ganchos/usePublicacaoPagina";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import { useRef, useState, type FormEvent } from "react";
import { Check, Edit3, Eye, EyeOff, Package, Plus, Save, Search } from "lucide-react";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import {
  converterTextoMoedaParaCentavos,
  formatarApresentacaoPrecoItem,
  formatarCentavosParaCampoMoeda,
  obterListaImagensMidia,
  type DisponibilidadeProdutoCatalogo,
  type MidiaItemCatalogo,
  type ProdutoCatalogo,
} from "@/dominio/entidades/catalogoConteudo";
import { servicoCatalogoConteudoCliente } from "@/infraestrutura/painel/servicoCatalogoConteudoCliente";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { EditorListaImagensCatalogo } from "./EditorListaImagensCatalogo";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { AvisoRecursoRestrito } from "@/componentes/painel/AvisosPublicidade";
import { usePoliticaPublicidade } from "@/componentes/painel/ProvedorPoliticaPublicidade";
import { CabecalhoPublicacaoRapidaAcervo } from "./CabecalhoPublicacaoRapidaAcervo";

const DISPONIBILIDADES = {
  disponivel: { rotulo: "Disponível", estilo: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  sob_encomenda: { rotulo: "Sob encomenda", estilo: "border-sky-200 bg-sky-50 text-sky-800" },
  esgotado: {
    rotulo: "Vendido / Esgotado",
    estilo: "border-violet-200 bg-violet-50 text-violet-800",
  },
} as const;

function gerarIdProduto(): string {
  return `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export interface PropriedadesGerenciadorCatalogoPainel {
  readonly organizacaoId: string;
  readonly identificadorPublico: string;
  readonly produtosIniciais: readonly ProdutoCatalogo[];
  readonly versaoPublicadaInicial: number | null;
  readonly podeEditarConteudo: boolean;
  readonly podePublicarPagina: boolean;
  readonly servicoCatalogo?: ServicoCatalogoConteudoPorta;
}

export function GerenciadorCatalogoPainel({
  organizacaoId,
  identificadorPublico,
  produtosIniciais,
  versaoPublicadaInicial,
  podeEditarConteudo,
  podePublicarPagina,
  servicoCatalogo = servicoCatalogoConteudoCliente,
}: PropriedadesGerenciadorCatalogoPainel) {
  const [produtos, setProdutos] = useState<readonly ProdutoCatalogo[]>(produtosIniciais);

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | DisponibilidadeProdutoCatalogo>("todos");
  const [alterandoVisibilidadeId, setAlterandoVisibilidadeId] = useState<string | null>(null);
  const referenciaNome = useRef<HTMLInputElement>(null);
  const salvamentoEmCurso = useRef(false);
  const visibilidadeEmCurso = useRef(false);
  const produtosFiltrados = produtos.filter((produto) => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return (
      (filtro === "todos" || produto.disponibilidade === filtro) &&
      `${produto.nome} ${produto.categoria} ${produto.resumo}`
        .toLocaleLowerCase("pt-BR")
        .includes(termo)
    );
  });

  // Estado do formulário de Produto / Veículo
  const [idProdutoEdicao, setIdProdutoEdicao] = useState<string | null>(null);
  const [nomeProduto, setNomeProduto] = useState("");
  const [categoriaProduto, setCategoriaProduto] = useState("");
  const [resumoProduto, setResumoProduto] = useState("");
  const politicaPublicidade = usePoliticaPublicidade();
  const [precoProdutoTexto, setPrecoProdutoTexto] = useState("");
  const [disponibilidadeProduto, setDisponibilidadeProduto] =
    useState<DisponibilidadeProdutoCatalogo>("disponivel");
  const [especificacoesTexto, setEspecificacoesTexto] = useState("");
  const [imagensProduto, setImagensProduto] = useState<readonly MidiaItemCatalogo[]>([]);

  const [salvando, setSalvando] = useState(false);
  const publicacao = usePublicacaoPagina({
    versaoPublicadaInicial,
    podePublicarPagina,
    bloqueado: salvando || alterandoVisibilidadeId !== null,
    revisaoConteudoSalvo: produtos,
    publicarPagina: () => servicoCatalogo.publicarPagina(organizacaoId),
  });

  function limparFormularioProduto() {
    setIdProdutoEdicao(null);
    setNomeProduto("");
    setCategoriaProduto("");
    setResumoProduto("");
    setPrecoProdutoTexto("");
    setDisponibilidadeProduto("disponivel");
    setEspecificacoesTexto("");
    setImagensProduto([]);
  }

  function carregarProdutoParaEdicao(produto: ProdutoCatalogo) {
    setIdProdutoEdicao(produto.id);
    setNomeProduto(produto.nome);
    setCategoriaProduto(produto.categoria);
    setResumoProduto(produto.resumo);
    setPrecoProdutoTexto(
      typeof produto.precoCentavos === "number"
        ? formatarCentavosParaCampoMoeda(produto.precoCentavos)
        : "",
    );
    setDisponibilidadeProduto(produto.disponibilidade);
    setEspecificacoesTexto(produto.especificacoesCurtas.join("\n"));
    setImagensProduto(
      obterListaImagensMidia(
        produto.urlImagemPrincipal
          ? {
              url: produto.urlImagemPrincipal,
              textoAlternativo: produto.textoAlternativoImagem || produto.nome,
              pontoFocal: produto.pontoFocalImagem,
            }
          : null,
        produto.imagens,
      ),
    );
    referenciaNome.current?.focus();
  }

  async function salvarFormularioProduto(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (
      !podeEditarConteudo ||
      publicacao.publicando ||
      salvamentoEmCurso.current ||
      visibilidadeEmCurso.current
    ) {
      return;
    }

    salvamentoEmCurso.current = true;
    setSalvando(true);

    try {
      const precoCentavos = converterTextoMoedaParaCentavos(precoProdutoTexto);

      const especificacoesCurtas = especificacoesTexto
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const existente = produtos.find((p) => p.id === idProdutoEdicao);
      const novoOuAtualizado: ProdutoCatalogo = {
        id: existente?.id ?? gerarIdProduto(),
        organizacaoId,
        nome: nomeProduto.trim(),
        categoria: categoriaProduto.trim(),
        resumo: resumoProduto.trim(),
        ...(typeof precoCentavos === "number" ? { precoCentavos } : {}),
        disponibilidade: disponibilidadeProduto,
        especificacoesCurtas,
        ...(imagensProduto[0]?.pontoFocal
          ? { pontoFocalImagem: imagensProduto[0].pontoFocal }
          : existente?.pontoFocalImagem
            ? { pontoFocalImagem: existente.pontoFocalImagem }
            : {}),
        ...(imagensProduto[0]?.url
          ? {
              urlImagemPrincipal: imagensProduto[0].url,
              textoAlternativoImagem: imagensProduto[0].textoAlternativo || nomeProduto.trim(),
            }
          : {}),
        ...(imagensProduto.length > 0 ? { imagens: imagensProduto } : {}),
        ordemExibicao: existente?.ordemExibicao ?? produtos.length + 1,
        ativo: existente?.ativo ?? true,
        atualizadoEmIso: new Date().toISOString(),
      };

      await servicoCatalogo.salvarProduto(novoOuAtualizado);

      setProdutos((atuais) => {
        const existeNaLista = atuais.some((item) => item.id === novoOuAtualizado.id);
        return existeNaLista
          ? atuais.map((item) => (item.id === novoOuAtualizado.id ? novoOuAtualizado : item))
          : [...atuais, novoOuAtualizado];
      });

      limparFormularioProduto();
      notificar.sucesso(
        "Item do catálogo salvo com sucesso. Clique em 'Publicar página' para sincronizar a vitrine e suas simulações.",
      );
    } catch (erro) {
      notificar.erro(
        erro instanceof Error ? erro.message : "Não foi possível salvar o item do catálogo.",
      );
    } finally {
      salvamentoEmCurso.current = false;
      setSalvando(false);
    }
  }

  async function alternarAtivoProduto(produto: ProdutoCatalogo) {
    if (
      !podeEditarConteudo ||
      publicacao.publicando ||
      visibilidadeEmCurso.current ||
      salvamentoEmCurso.current
    ) {
      return;
    }

    visibilidadeEmCurso.current = true;
    setAlterandoVisibilidadeId(produto.id);
    const atualizado: ProdutoCatalogo = {
      ...produto,
      ativo: !produto.ativo,
      atualizadoEmIso: new Date().toISOString(),
    };
    try {
      await servicoCatalogo.salvarProduto(atualizado);
      setProdutos((atuais) => atuais.map((item) => (item.id === produto.id ? atualizado : item)));
    } catch (erro) {
      notificar.erro(
        erro instanceof Error ? erro.message : "Não foi possível alterar a visibilidade.",
      );
    } finally {
      visibilidadeEmCurso.current = false;
      setAlterandoVisibilidadeId(null);
    }
  }

  return (
    <div className="space-y-6">
      <CabecalhoPublicacaoRapidaAcervo
        aparencia="clara"
        titulo="Catálogo"
        subtitulo="Organize seus veículos e produtos, atualize o estoque e publique as novidades na vitrine."
        identificadorPublico={identificadorPublico}

        controle={publicacao}
      />

      <section aria-label="Resumo do catálogo" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            rotulo: "Itens cadastrados",
            quantidade: produtos.length,
            icone: Package,
            cor: "border-indigo-200 from-indigo-50/80 text-indigo-950",
            iconeCor: "bg-indigo-600",
          },
          {
            rotulo: "Disponíveis",
            quantidade: produtos.filter((p) => p.disponibilidade === "disponivel").length,
            icone: Check,
            cor: "border-emerald-200 from-emerald-50/80 text-emerald-950",
            iconeCor: "bg-emerald-600",
          },
          {
            rotulo: "Sob encomenda",
            quantidade: produtos.filter((p) => p.disponibilidade === "sob_encomenda").length,
            icone: Package,
            cor: "border-sky-200 from-sky-50/80 text-sky-950",
            iconeCor: "bg-sky-600",
          },
          {
            rotulo: "Itens ocultos",
            quantidade: produtos.filter((p) => !p.ativo).length,
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
              <Package className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="text-base font-semibold text-mineral-950">
              {idProdutoEdicao ? "Editar item do catálogo" : "Novo item"}
            </h2>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-mineral-500">
            Preencha os dados e salve. Depois, publique para atualizar sua vitrine.
          </p>

          <form onSubmit={salvarFormularioProduto} className="mt-4 space-y-4">
            <CampoFormulario
              ref={referenciaNome}
              className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
              rotulo="Nome do veículo ou produto"
              required
              disabled={!podeEditarConteudo || publicacao.publicando || salvando}
              value={nomeProduto}
              onChange={(e) => setNomeProduto(e.target.value)}
              placeholder="Ex.: Porsche 911 Carrera GTS ou BMW M3 Competition"
            />

            <CampoFormulario
              className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
              rotulo="Categoria ou linha"
              required
              disabled={!podeEditarConteudo || publicacao.publicando || salvando}
              value={categoriaProduto}
              onChange={(e) => setCategoriaProduto(e.target.value)}
              placeholder="Ex.: Esportivos Selecionados, Sedãs Premium"
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="resumo-produto" className="text-sm font-medium text-mineral-900">
                Descrição editorial *
              </label>
              <textarea
                id="resumo-produto"
                rows={3}
                required
                disabled={!podeEditarConteudo || publicacao.publicando || salvando}
                value={resumoProduto}
                onChange={(e) => setResumoProduto(e.target.value)}
                placeholder="Destaques de procedência, opcionais, garantia e estado de conservação."
                className="w-full rounded-lg border border-marfim-200 bg-white px-3.5 py-2.5 text-sm text-mineral-950 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            {!politicaPublicidade.exibePrecoProduto() ? (
              <AvisoRecursoRestrito mensagem="preços de produtos não são exibidos na sua vitrine." />
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <CampoFormulario
                className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
                rotulo="Preço"
                prefixoFixo="R$"
                required
                disabled={!podeEditarConteudo || publicacao.publicando || salvando}
                value={precoProdutoTexto}
                onChange={(e) => setPrecoProdutoTexto(e.target.value)}
                placeholder="789.000,00"
              />

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="disponibilidade-produto"
                  className="text-sm font-medium text-mineral-900"
                >
                  Disponibilidade *
                </label>
                <select
                  id="disponibilidade-produto"
                  disabled={!podeEditarConteudo || publicacao.publicando || salvando}
                  value={disponibilidadeProduto}
                  onChange={(e) =>
                    setDisponibilidadeProduto(e.target.value as DisponibilidadeProdutoCatalogo)
                  }
                  className="h-10 w-full rounded-lg border border-marfim-200 bg-white px-3 text-sm text-mineral-950 focus:border-indigo-400 focus:outline-none"
                >
                  <option value="disponivel">Disponível em estoque</option>
                  <option value="sob_encomenda">Sob encomenda / Reserva</option>
                  <option value="esgotado">Vendido / Esgotado</option>
                </select>
              </div>
            </div>

            <EditorListaImagensCatalogo
              organizacaoId={organizacaoId}
              rotulo="Fotografias do item"
              imagens={imagensProduto}
              aoAlterarImagens={setImagensProduto}
              servicoUpload={servicoCatalogo}
              desabilitado={!podeEditarConteudo || publicacao.publicando || salvando}
              tituloFallback={nomeProduto || "Produto"}
            />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="especificacoes-produto"
                className="text-sm font-medium text-mineral-900"
              >
                Especificações em formato Chave: Valor (uma por linha)
              </label>
              <textarea
                id="especificacoes-produto"
                rows={3}
                disabled={!podeEditarConteudo || publicacao.publicando || salvando}
                value={especificacoesTexto}
                onChange={(e) => setEspecificacoesTexto(e.target.value)}
                placeholder={
                  "Ano: 2024/2024\nQuilometragem: 4.800 km\nMotor: 3.0 Biturbo 480cv\nCâmbio: PDK 8 marchas"
                }
                className="font-mono text-xs w-full rounded-lg border border-marfim-200 bg-white px-3.5 py-2.5 text-mineral-950 focus:border-indigo-400 focus:outline-none"
              />
            </div>

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
                {idProdutoEdicao ? (
                  <Save className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{idProdutoEdicao ? "Salvar alterações" : "Adicionar ao catálogo"}</span>
              </Botao>

              {idProdutoEdicao ? (
                <Botao
                  variante="fantasma"
                  tamanho="compacto"
                  disabled={salvando}
                  onClick={limparFormularioProduto}
                >
                  Cancelar edição
                </Botao>
              ) : null}
            </div>
          </form>
        </CartaoSuperficie>

        <section aria-labelledby="titulo-itens-catalogo" className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="titulo-itens-catalogo" className="text-base font-semibold text-mineral-950">
                Seu catálogo{" "}
                <span className="ml-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                  {produtos.length}
                </span>
              </h2>
              <p className="mt-1 text-xs text-mineral-500">
                Gerencie os itens e a visibilidade na vitrine.
              </p>
            </div>
            {idProdutoEdicao && podeEditarConteudo ? (
              <Botao
                variante="operacional_secundario"
                tamanho="compacto"
                disabled={salvando}
                className="rounded-lg border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100"
                onClick={() => {
                  limparFormularioProduto();
                  referenciaNome.current?.focus();
                }}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Novo item
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
                aria-label="Buscar no catálogo"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar nome ou categoria…"
                className="min-h-10 w-full rounded-lg border border-marfim-200 bg-white py-2 pr-3 pl-9 text-xs focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <select
              aria-label="Filtrar disponibilidade"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as typeof filtro)}
              className="min-h-10 min-w-0 rounded-lg border border-marfim-200 bg-white px-3 py-2 text-xs text-mineral-700 focus:border-indigo-400 focus:outline-none"
            >
              <option value="todos">Toda disponibilidade</option>
              {Object.entries(DISPONIBILIDADES).map(([valor, item]) => (
                <option key={valor} value={valor}>
                  {item.rotulo}
                </option>
              ))}
            </select>
          </div>
          {produtosFiltrados.length === 0 ? (
            <CartaoSuperficie className="flex min-h-64 flex-col items-center justify-center rounded-2xl border-dashed p-6 text-center shadow-none">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <Package className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-sm font-semibold text-mineral-900">
                {produtos.length === 0 ? "Seu catálogo começa aqui" : "Nenhum item encontrado"}
              </h3>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-mineral-500">
                {produtos.length === 0
                  ? "Cadastre seu primeiro veículo ou produto no formulário para preparar a vitrine."
                  : "Tente outro nome, categoria ou disponibilidade."}
              </p>
              {produtos.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setBusca("");
                    setFiltro("todos");
                  }}
                  className="mt-3 min-h-10 rounded-lg px-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                >
                  Limpar filtros
                </button>
              ) : null}
            </CartaoSuperficie>
          ) : (
            <ul aria-label="Itens do catálogo" className="space-y-3">
              {produtosFiltrados.map((produto) => (
                <li key={produto.id}>
                  <CartaoSuperficie
                    className={combinarClasses(
                      "overflow-hidden rounded-2xl p-0 shadow-xs transition-shadow hover:shadow-sm",
                      idProdutoEdicao === produto.id
                        ? "border-indigo-300 ring-1 ring-indigo-100"
                        : "border-marfim-200",
                    )}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <FotoProduto
                        key={produto.urlImagemPrincipal ?? produto.id}
                        produto={produto}
                      />
                      <div className="min-w-0 flex-1 p-4">
                        <div className="mb-2 flex flex-wrap items-center gap-1.5">
                          <span
                            className={combinarClasses(
                              "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                              DISPONIBILIDADES[produto.disponibilidade].estilo,
                            )}
                          >
                            {DISPONIBILIDADES[produto.disponibilidade].rotulo}
                          </span>
                          {!produto.ativo ? (
                            <span className="rounded-full border border-marfim-200 bg-marfim-100 px-2 py-0.5 text-[10px] font-semibold text-mineral-600">
                              Oculto
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[10px] font-medium tracking-wider text-mineral-500 uppercase">
                          {produto.categoria}
                        </p>
                        <h3 className="mt-1 break-words text-sm font-semibold text-mineral-950">
                          {produto.nome}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-mineral-500">
                          {produto.resumo}
                        </p>
                        <p className="mt-3 text-base font-bold tracking-tight text-mineral-950">
                          {formatarApresentacaoPrecoItem({ centavos: produto.precoCentavos })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-marfim-100 px-4 py-2">
                      <p className="text-[10px] text-mineral-500">
                        {idProdutoEdicao === produto.id
                          ? "Em edição"
                          : produto.ativo
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
                          aria-label={`Editar ${produto.nome}`}
                          onClick={() => carregarProdutoParaEdicao(produto)}
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
                          carregando={alterandoVisibilidadeId === produto.id}
                          textoCarregando="Salvando…"
                          aria-label={
                            produto.ativo ? `Ocultar ${produto.nome}` : `Reativar ${produto.nome}`
                          }
                          onClick={() => alternarAtivoProduto(produto)}
                        >
                          {produto.ativo ? (
                            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          {produto.ativo ? "Ocultar" : "Reativar"}
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

function FotoProduto({ produto }: { readonly produto: ProdutoCatalogo }) {
  const [falhou, setFalhou] = useState(false);
  return (
    <div className="relative flex h-44 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-marfim-50 to-white sm:h-auto sm:min-h-44 sm:w-32 2xl:w-44">
      {produto.urlImagemPrincipal && !falhou ? (
        <Imagem
          src={produto.urlImagemPrincipal}
          alt={produto.textoAlternativoImagem ?? produto.nome}
          fill
          unoptimized
          sizes="(min-width: 640px) 176px, 100vw"
          className="object-cover"
          style={{
            objectPosition: `${produto.pontoFocalImagem?.xPercentual ?? 50}% ${produto.pontoFocalImagem?.yPercentual ?? 50}%`,
          }}
          onError={() => setFalhou(true)}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-indigo-300">
          <Package className="h-8 w-8" aria-hidden="true" />
          <span className="text-[10px] text-mineral-400">Sem fotografia</span>
        </div>
      )}
    </div>
  );
}
