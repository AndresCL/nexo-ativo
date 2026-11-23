"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { notificar } from "@/componentes/interface/notificacoes/notificar";
import { AcoesPublicacaoPagina } from "@/componentes/painel/AcoesPublicacaoPagina";
import { usePoliticaPublicidade } from "@/componentes/painel/ProvedorPoliticaPublicidade";
import { usePublicacaoPagina } from "@/ganchos/usePublicacaoPagina";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import type { RascunhoConfiguracaoPagina } from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import {
  resolverPosicaoCabecalhoMarca,
  type PosicaoCabecalhoMarca,
} from "@/dominio/editorial/faixaInicioExperiencias";
import {
  blocoSistemaEstaConfigurado,
  obterIdBlocoExperiencia,
  reordenarBlocoVitrine,
  resolverOrdemBlocosVitrine,
  type IdentificadorBlocoSistemaVitrine,
} from "@/dominio/editorial/ordemBlocosVitrine";
import type { DefinicaoMicrofluxo, EtapaMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import {
  definirDestaqueExclusivoMicrofluxo,
  ordenarMicrofluxosPorPrioridadeEOrdem,
} from "@/dominio/microfluxos/ordenacaoMicrofluxos";
import { avaliarIntegridadeGrafoMicrofluxo } from "@/dominio/microfluxos/validadorGrafoMicrofluxo";
import { servicoCatalogoConteudoCliente } from "@/infraestrutura/painel/servicoCatalogoConteudoCliente";
import type { ItemListaUnificadaVitrine } from "../experiencias/descritoresTipoAcao";
import { DialogoExclusaoExperiencia } from "../experiencias/DialogoExclusaoExperiencia";
import { EditorExperienciaSelecionada } from "../experiencias/EditorExperienciaSelecionada";
import {
  ListaOrdenavelBlocosVitrine,
  type FiltroVisibilidadeLista,
} from "../experiencias/ListaOrdenavelBlocosVitrine";

export interface PropriedadesGerenciadorExperienciasPainel {
  readonly profissionais?: readonly ProfissionalEquipe[];
  readonly quantidadeProfissionaisAtivos?: number;
  readonly organizacaoId: string;
  readonly identificadorPublico: string;
  readonly microfluxosIniciais: readonly DefinicaoMicrofluxo[];
  readonly rascunhoPaginaInicial?: RascunhoConfiguracaoPagina;
  readonly versaoPublicadaInicial: number | null;
  readonly podeEditarConteudo: boolean;
  readonly podePublicarPagina: boolean;
  readonly servicoCatalogo?: ServicoCatalogoConteudoPorta;
}

interface EstadoBlocosSistema {
  readonly ordemBlocosVitrine: readonly string[];
  readonly blocosSistemaOcultos: readonly IdentificadorBlocoSistemaVitrine[];
  readonly posicaoCabecalhoMarca: PosicaoCabecalhoMarca;
  readonly avaliacoesGoogleHabilitado?: boolean;
}

function criarEstadoBlocosSistemaInicial(
  rascunho: RascunhoConfiguracaoPagina | undefined,
  microfluxos: readonly DefinicaoMicrofluxo[],
): EstadoBlocosSistema {
  const posicaoCabecalhoMarca = resolverPosicaoCabecalhoMarca(
    rascunho?.identidade.posicaoCabecalho,
  );
  const blocosSistemaOcultos = rascunho?.blocosSistemaOcultos ?? [];
  const avaliacoesGoogleHabilitado = rascunho?.avaliacoesGoogle?.identificadorLocal
    ? rascunho.avaliacoesGoogle.habilitado
    : undefined;

  const idsDisponiveis: string[] = [];
  if (
    rascunho &&
    posicaoCabecalhoMarca !== "topo" &&
    blocoSistemaEstaConfigurado("bloco:marca", rascunho)
  ) {
    idsDisponiveis.push("bloco:marca");
  }
  for (const fluxo of microfluxos) {
    idsDisponiveis.push(obterIdBlocoExperiencia(fluxo.id));
  }
  if (rascunho && blocoSistemaEstaConfigurado("bloco:avaliacoes_google", rascunho)) {
    idsDisponiveis.push("bloco:avaliacoes_google");
  }
  if (rascunho && blocoSistemaEstaConfigurado("bloco:redes_sociais", rascunho)) {
    idsDisponiveis.push("bloco:redes_sociais");
  }

  return {
    ordemBlocosVitrine: resolverOrdemBlocosVitrine(rascunho?.ordemBlocosVitrine, idsDisponiveis),
    blocosSistemaOcultos,
    posicaoCabecalhoMarca,
    avaliacoesGoogleHabilitado,
  };
}

function sincronizarOrdemHomeNosMicrofluxos(
  microfluxos: readonly DefinicaoMicrofluxo[],
  ordemBlocos: readonly string[],
): DefinicaoMicrofluxo[] {
  const ordemExperiencias = ordemBlocos
    .filter((id) => id.startsWith("exp:"))
    .map((id) => id.slice("exp:".length));
  const indicePorId = new Map(ordemExperiencias.map((id, idx) => [id, idx]));

  const atualizados = microfluxos.map((fluxo) => ({
    ...fluxo,
    ordemHome: indicePorId.get(fluxo.id) ?? microfluxos.length,
  }));

  return ordenarMicrofluxosPorPrioridadeEOrdem(atualizados);
}

export function GerenciadorExperienciasPainel({
  quantidadeProfissionaisAtivos,
  profissionais = [],
  organizacaoId,
  identificadorPublico,
  microfluxosIniciais,
  rascunhoPaginaInicial,
  versaoPublicadaInicial,
  podeEditarConteudo,
  podePublicarPagina,
  servicoCatalogo = servicoCatalogoConteudoCliente,
}: PropriedadesGerenciadorExperienciasPainel) {
  const router = useRouter();
  const politicaPublicidade = usePoliticaPublicidade();
  const [microfluxos, setMicrofluxos] = useState<readonly DefinicaoMicrofluxo[]>(() =>
    ordenarMicrofluxosPorPrioridadeEOrdem(microfluxosIniciais),
  );
  const [blocosSistema, setBlocosSistema] = useState<EstadoBlocosSistema>(() =>
    criarEstadoBlocosSistemaInicial(
      rascunhoPaginaInicial,
      ordenarMicrofluxosPorPrioridadeEOrdem(microfluxosIniciais),
    ),
  );
  const [fluxoEmEdicaoId, setFluxoEmEdicaoId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroVisibilidade, setFiltroVisibilidade] = useState<FiltroVisibilidadeLista>("todas");
  const [rascunhoSalvo, setRascunhoSalvo] = useState(microfluxos);
  const [blocosSistemaSalvos, setBlocosSistemaSalvos] = useState(blocosSistema);
  const [idFluxoExcluir, setIdFluxoExcluir] = useState<string | null>(null);
  const botaoNovaExperiencia = useRef<HTMLButtonElement>(null);

  const fluxoParaExcluir = microfluxos.find((fluxo) => fluxo.id === idFluxoExcluir);
  const fluxoAtual = fluxoEmEdicaoId
    ? microfluxos.find((m) => m.id === fluxoEmEdicaoId)
    : undefined;

  const { blocoMarcaFixaTopo, itensFluxoOrdenados } = useMemo(() => {
    const marcaConfigurada = rascunhoPaginaInicial
      ? blocoSistemaEstaConfigurado("bloco:marca", rascunhoPaginaInicial)
      : false;
    const avaliacoesConfiguradas = rascunhoPaginaInicial
      ? blocoSistemaEstaConfigurado("bloco:avaliacoes_google", rascunhoPaginaInicial)
      : false;
    const redesConfiguradas = rascunhoPaginaInicial
      ? blocoSistemaEstaConfigurado("bloco:redes_sociais", rascunhoPaginaInicial)
      : false;

    const marcaNoTopo = marcaConfigurada && blocosSistema.posicaoCabecalhoMarca === "topo";

    const blocoMarcaItem: Extract<ItemListaUnificadaVitrine, { tipo: "sistema" }> | null =
      marcaConfigurada
        ? {
            tipo: "sistema",
            idBloco: "bloco:marca",
            titulo: rascunhoPaginaInicial?.identidade.nomeExibicao || "Marca (Logo e título)",
            subtitulo:
              rascunhoPaginaInicial?.identidade.subtituloCurto ||
              "Logotipo, nome de exibição e subtítulo",
            badgeTipo: "Marca",
            visivel: !blocosSistema.blocosSistemaOcultos.includes("bloco:marca"),
            abaAparencia: "identidade",
            fixaNoTopo: marcaNoTopo,
          }
        : null;

    const mapaItens = new Map<string, ItemListaUnificadaVitrine>();
    if (blocoMarcaItem && !marcaNoTopo) {
      mapaItens.set("bloco:marca", blocoMarcaItem);
    }
    if (avaliacoesConfiguradas) {
      mapaItens.set("bloco:avaliacoes_google", {
        tipo: "sistema",
        idBloco: "bloco:avaliacoes_google",
        titulo: "Avaliações do Google",
        subtitulo:
          rascunhoPaginaInicial?.avaliacoesGoogle?.modoExibicao === "carrossel"
            ? "Carrossel de depoimentos vinculados"
            : "Resumo de nota e avaliações no Google",
        badgeTipo: "Google",
        visivel: blocosSistema.avaliacoesGoogleHabilitado === true,
        abaAparencia: "galeria_seo",
      });
    }
    if (redesConfiguradas) {
      const totalRedes = rascunhoPaginaInicial?.redesSociais.length ?? 0;
      mapaItens.set("bloco:redes_sociais", {
        tipo: "sistema",
        idBloco: "bloco:redes_sociais",
        titulo: "Ícones de redes sociais",
        subtitulo: `${totalRedes} ${totalRedes === 1 ? "canal configurado" : "canais configurados"}`,
        badgeTipo: "Redes sociais",
        visivel: !blocosSistema.blocosSistemaOcultos.includes("bloco:redes_sociais"),
        abaAparencia: "acoes",
      });
    }

    for (const fluxo of microfluxos) {
      const idBloco = obterIdBlocoExperiencia(fluxo.id);
      mapaItens.set(idBloco, { tipo: "experiencia", idBloco, fluxo });
    }

    const ordemFinal = resolverOrdemBlocosVitrine(
      blocosSistema.ordemBlocosVitrine,
      Array.from(mapaItens.keys()),
    );

    const ordenados: ItemListaUnificadaVitrine[] = [];
    for (const id of ordemFinal) {
      const item = mapaItens.get(id);
      if (item) ordenados.push(item);
    }

    return {
      blocoMarcaFixaTopo: marcaNoTopo ? blocoMarcaItem : null,
      itensFluxoOrdenados: ordenados,
    };
  }, [blocosSistema, microfluxos, rascunhoPaginaInicial]);

  const alteradas = microfluxos.filter(
    (fluxo) =>
      JSON.stringify(fluxo) !==
      JSON.stringify(rascunhoSalvo.find((salvo) => salvo.id === fluxo.id)),
  );
  const idsExcluidos = rascunhoSalvo
    .filter((salvo) => !microfluxos.some((fluxo) => fluxo.id === salvo.id))
    .map((salvo) => salvo.id);
  const blocosSistemaAlterados =
    JSON.stringify(blocosSistema) !== JSON.stringify(blocosSistemaSalvos);
  const haAlteracoesPendentes =
    alteradas.length > 0 || idsExcluidos.length > 0 || blocosSistemaAlterados;

  const controle = usePublicacaoPagina({
    versaoPublicadaInicial,
    podeSalvarRascunho: podeEditarConteudo,
    podePublicarPagina,
    haAlteracoesNaoSalvas: haAlteracoesPendentes,
    salvarRascunho: async () => {
      await servicoCatalogo.salvarRascunhoExperiencias(organizacaoId, alteradas, idsExcluidos);
      if (blocosSistemaAlterados && servicoCatalogo.salvarOrdemEBlocosSistemaVitrine) {
        await servicoCatalogo.salvarOrdemEBlocosSistemaVitrine(organizacaoId, {
          ordemBlocosVitrine: itensFluxoOrdenados.map((item) => item.idBloco),
          blocosSistemaOcultos: blocosSistema.blocosSistemaOcultos,
          posicaoCabecalhoMarca: blocosSistema.posicaoCabecalhoMarca,
          ...(blocosSistema.avaliacoesGoogleHabilitado !== undefined
            ? { avaliacoesGoogleHabilitado: blocosSistema.avaliacoesGoogleHabilitado }
            : {}),
        });
      }
      setRascunhoSalvo(microfluxos);
      setBlocosSistemaSalvos(blocosSistema);
      router.refresh();
    },
    validarPublicacao: () => {
      for (const fluxo of microfluxos.filter((f) => f.ativo)) {
        const problemas = avaliarIntegridadeGrafoMicrofluxo(fluxo);
        if (problemas.length) {
          setFluxoEmEdicaoId(fluxo.id);
          const primeira = problemas[0]!;
          const complemento =
            problemas.length > 1
              ? ` (+${problemas.length - 1} pendência${problemas.length > 2 ? "s" : ""})`
              : "";
          throw new Error(
            `**Experiência:** “${fluxo.titulo}”\n${primeira.mensagem}${complemento}`,
          );
        }
      }
    },
    publicarPagina: () => servicoCatalogo.publicarPagina(organizacaoId),
  });

  const podeAlterar = podeEditarConteudo && !controle.ocupado;
  const versaoPublicada = controle.versaoPublicada;

  function aplicarNovaOrdemBlocos(novaOrdem: readonly string[]) {
    setBlocosSistema((atual) => ({ ...atual, ordemBlocosVitrine: novaOrdem }));
    setMicrofluxos((atual) => sincronizarOrdemHomeNosMicrofluxos(atual, novaOrdem));
  }

  function moverItem(indiceOrigem: number, direcao: -1 | 1) {
    if (!podeAlterar) return;
    const ordemAtualIds = itensFluxoOrdenados.map((i) => i.idBloco);
    const novaOrdem = reordenarBlocoVitrine(ordemAtualIds, indiceOrigem, indiceOrigem + direcao);
    aplicarNovaOrdemBlocos(novaOrdem);
  }

  function alternarVisibilidadeExperiencia(fluxoId: string) {
    if (!podeAlterar) return;
    setMicrofluxos((lista) =>
      lista.map((fluxo) =>
        fluxo.id === fluxoId
          ? {
              ...fluxo,
              ativo: !fluxo.ativo,
              ativoNaHome: !fluxo.ativo,
              ...(fluxo.ativo ? { destaquePrimarioHome: false } : {}),
            }
          : fluxo,
      ),
    );
  }

  function alternarVisibilidadeSistema(idBloco: IdentificadorBlocoSistemaVitrine) {
    if (!podeAlterar) return;
    setBlocosSistema((atual) => {
      if (idBloco === "bloco:avaliacoes_google") {
        return {
          ...atual,
          avaliacoesGoogleHabilitado: !(atual.avaliacoesGoogleHabilitado === true),
        };
      }
      const jaOculto = atual.blocosSistemaOcultos.includes(idBloco);
      const proximosOcultos = jaOculto
        ? atual.blocosSistemaOcultos.filter((id) => id !== idBloco)
        : [...atual.blocosSistemaOcultos, idBloco];
      return { ...atual, blocosSistemaOcultos: proximosOcultos };
    });
  }

  function alternarFixarMarcaTopo() {
    if (!podeAlterar) return;
    setBlocosSistema((atual) => {
      const indoParaLista = atual.posicaoCabecalhoMarca === "topo";
      const proximaPosicao: PosicaoCabecalhoMarca = indoParaLista ? "acima_experiencias" : "topo";
      const ordemAtual = itensFluxoOrdenados.map((i) => i.idBloco);
      const proximaOrdem = indoParaLista
        ? ["bloco:marca", ...ordemAtual.filter((id) => id !== "bloco:marca")]
        : ordemAtual.filter((id) => id !== "bloco:marca");
      return {
        ...atual,
        posicaoCabecalhoMarca: proximaPosicao,
        ordemBlocosVitrine: proximaOrdem,
      };
    });
  }

  function alterarExibicao(valor: string) {
    if (!podeAlterar || !fluxoAtual) return;
    const atualizada = microfluxos.map((fluxo) =>
      fluxo.id === fluxoAtual.id
        ? { ...fluxo, ativo: valor !== "oculta", ativoNaHome: valor !== "oculta" }
        : fluxo,
    );
    setMicrofluxos(
      definirDestaqueExclusivoMicrofluxo(atualizada, fluxoAtual.id, valor === "destaque"),
    );
  }

  function criarNovoFluxo() {
    if (!podeAlterar) return;
    const novoId = `experiencia-${crypto.randomUUID()}`;
    const numero = microfluxos.length + 1;
    const novoFluxo: DefinicaoMicrofluxo = {
      id: novoId,
      organizacaoId,
      tipoAcao: "microfluxo",
      ancoraAcionamento: `#${novoId}`,
      titulo: `Nova experiência ${numero}`,
      descricaoCurta: "Percurso interativo personalizado.",
      textoBotaoConclusao: "Concluir experiência",
      mensagemConfirmacaoTitulo: "Experiência concluída",
      mensagemConfirmacaoCorpo: "Obrigado por concluir este percurso.",
      etapaInicialId: "",
      etapas: [],
      ativo: false,
      ativoNaHome: false,
      destaquePrimarioHome: false,
      ordemHome: microfluxos.length,
      rotuloBotaoHome: `Nova experiência ${numero}`,
      atualizadoEmIso: new Date().toISOString(),
    };

    const novoBlocoId = obterIdBlocoExperiencia(novoId);
    const ordemAtual = itensFluxoOrdenados.map((i) => i.idBloco);
    const proximaOrdem = [...ordemAtual, novoBlocoId];

    setMicrofluxos((lista) =>
      sincronizarOrdemHomeNosMicrofluxos([...lista, novoFluxo], proximaOrdem),
    );
    setBlocosSistema((atual) => ({ ...atual, ordemBlocosVitrine: proximaOrdem }));
    setFluxoEmEdicaoId(novoId);
    setBusca("");
    setFiltroVisibilidade("todas");
  }

  function confirmarExclusaoFluxo() {
    if (!podeAlterar || !fluxoParaExcluir) return;
    const idBlocoRemovido = obterIdBlocoExperiencia(fluxoParaExcluir.id);
    const proximaOrdem = itensFluxoOrdenados
      .map((i) => i.idBloco)
      .filter((id) => id !== idBlocoRemovido);
    const restantes = microfluxos.filter((m) => m.id !== fluxoParaExcluir.id);

    setMicrofluxos(sincronizarOrdemHomeNosMicrofluxos(restantes, proximaOrdem));
    setBlocosSistema((atual) => ({ ...atual, ordemBlocosVitrine: proximaOrdem }));
    setFluxoEmEdicaoId(null);
    setIdFluxoExcluir(null);
    notificar.informacao(
      `Exclusão de “${fluxoParaExcluir.titulo}” pendente. Clique em “Publicar página” para removê-la da página pública. Recarregar sem salvar ou publicar cancela esta alteração.`,
    );
  }

  function atualizarFluxoSelecionado(
    atualizador: (atual: DefinicaoMicrofluxo) => DefinicaoMicrofluxo,
  ) {
    if (!podeAlterar || !fluxoAtual) return;
    setMicrofluxos((lista) =>
      lista.map((item) => (item.id === fluxoAtual.id ? atualizador(item) : item)),
    );
  }

  function atualizarEtapaFluxo(
    etapaId: string,
    atualizador: (etapa: EtapaMicrofluxo) => EtapaMicrofluxo,
  ) {
    atualizarFluxoSelecionado((atual) => ({
      ...atual,
      etapas: atual.etapas.map((etapa) => (etapa.id === etapaId ? atualizador(etapa) : etapa)),
    }));
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-marfim-200/80 pb-3 sm:pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
              Experiências Interativas
            </h1>
            {versaoPublicada !== null ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
                Vitrine v{versaoPublicada}
              </span>
            ) : null}
          </div>
          <p className="text-xs leading-relaxed text-mineral-500">
            Organize a ordem de todos os blocos da sua vitrine e clique em uma experiência para
            editar.
          </p>
        </div>
        <AcoesPublicacaoPagina
          controle={controle}
          identificadorPublico={identificadorPublico}
          exibirSalvarRascunho
          orientacao="Publicar página salva as alterações pendentes antes de atualizar a vitrine."
        />
      </header>

      {fluxoAtual ? (
        <EditorExperienciaSelecionada
          organizacaoId={organizacaoId}
          identificadorPublico={identificadorPublico}
          fluxoAtual={fluxoAtual}
          microfluxos={microfluxos}
          profissionais={profissionais}
          quantidadeProfissionaisAtivos={quantidadeProfissionaisAtivos}
          podeAlterar={podeAlterar}
          permiteFinanceiro={politicaPublicidade.permiteCalculoComercial()}
          permitePixManual={politicaPublicidade.permiteEtapaPixManual()}
          servicoCatalogo={servicoCatalogo}
          aoVoltarParaLista={() => setFluxoEmEdicaoId(null)}
          aoAlterarExibicao={alterarExibicao}
          aoSolicitarExclusao={(id) => setIdFluxoExcluir(id)}
          aoAtualizarFluxo={atualizarFluxoSelecionado}
          aoAtualizarEtapa={atualizarEtapaFluxo}
        />
      ) : (
        <ListaOrdenavelBlocosVitrine
          blocoMarcaFixaTopo={blocoMarcaFixaTopo}
          itensFluxoOrdenados={itensFluxoOrdenados}
          identificadorPublico={identificadorPublico}
          busca={busca}
          filtroVisibilidade={filtroVisibilidade}
          podeAlterar={podeAlterar}
          referenciaBotaoNovaExperiencia={botaoNovaExperiencia}
          aoAlterarBusca={setBusca}
          aoAlterarFiltro={setFiltroVisibilidade}
          aoCriarNovaExperiencia={criarNovoFluxo}
          aoReordenarPorArraste={aplicarNovaOrdemBlocos}
          aoMoverItem={moverItem}
          aoAlternarVisibilidadeExperiencia={alternarVisibilidadeExperiencia}
          aoAlternarVisibilidadeSistema={alternarVisibilidadeSistema}
          aoAlternarFixarMarcaTopo={alternarFixarMarcaTopo}
          aoAbrirEditorExperiencia={(id) => setFluxoEmEdicaoId(id)}
        />
      )}

      <DialogoExclusaoExperiencia
        fluxoParaExcluir={fluxoParaExcluir}
        podeAlterar={podeAlterar}
        referenciaRetornoFoco={botaoNovaExperiencia}
        aoFechar={() => setIdFluxoExcluir(null)}
        aoConfirmar={confirmarExclusaoFluxo}
      />
    </div>
  );
}
