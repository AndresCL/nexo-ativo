"use client";

import { usePublicacaoPagina } from "@/ganchos/usePublicacaoPagina";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import { useRef, useState, type FormEvent } from "react";
import {
  ChevronDown,
  Plus,
  Save,
  Search,
  Users,
} from "lucide-react";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import type { ResumoDireitosPlano } from "@/dominio/entidades/autenticacaoEOrganizacao";
import {
  validarIdentificadorCartaoProfissional,
  validarLimiteProfissionaisPlano,
  type ProfissionalEquipe,
} from "@/dominio/entidades/catalogoConteudo";
import type { CoordenadasPontoFocal } from "@/dominio/entidades/paginaPublicada";
import { normalizarSugestaoIdentificador } from "@/dominio/objetos-valor/identificadorPublico";
import { servicoCatalogoConteudoCliente } from "@/infraestrutura/painel/servicoCatalogoConteudoCliente";
import { CartaoItemProfissional } from "./CartaoItemProfissional";
import { Botao } from "@/componentes/interface/Botao";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import { CampoTelefoneComDdi } from "@/componentes/interface/CampoTelefoneComDdi";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { CampoUploadMidiaStorage } from "@/componentes/painel/editor/CampoUploadMidiaStorage";
import { SeletorPontoFocalMidia } from "@/componentes/painel/editor/SeletorPontoFocalMidia";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { CabecalhoPublicacaoRapidaAcervo } from "./CabecalhoPublicacaoRapidaAcervo";

export interface PropriedadesGerenciadorEquipePainel {
  readonly organizacaoId: string;
  readonly identificadorPublico: string;
  readonly urlBasePublica: string;
  readonly resumoDireitosPlano: ResumoDireitosPlano;
  readonly profissionaisIniciais: readonly ProfissionalEquipe[];
  readonly versaoPublicadaInicial: number | null;
  readonly podeEditarConteudo: boolean;
  readonly podePublicarPagina: boolean;
  readonly servicoCatalogo?: ServicoCatalogoConteudoPorta;
}

export function GerenciadorEquipePainel({
  organizacaoId,
  identificadorPublico,
  urlBasePublica,
  resumoDireitosPlano,
  profissionaisIniciais,
  versaoPublicadaInicial,
  podeEditarConteudo,
  podePublicarPagina,
  servicoCatalogo = servicoCatalogoConteudoCliente,
}: PropriedadesGerenciadorEquipePainel) {
  const [profissionais, setProfissionais] =
    useState<readonly ProfissionalEquipe[]>(profissionaisIniciais);

  const [busca, setBusca] = useState("");
  const [filtroVisibilidade, setFiltroVisibilidade] = useState<"todos" | "ativos" | "ocultos">(
    "todos",
  );
  const [alterandoVisibilidadeId, setAlterandoVisibilidadeId] = useState<string | null>(null);
  const referenciaNome = useRef<HTMLInputElement>(null);
  const operacaoEmCurso = useRef(false);
  const profissionaisFiltrados = profissionais.filter((profissional) => {
    const correspondeSituacao =
      filtroVisibilidade === "todos" ||
      (filtroVisibilidade === "ativos" ? profissional.ativo : !profissional.ativo);
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return (
      correspondeSituacao &&
      `${profissional.nomeCompleto} ${profissional.cargoOuEspecialidade} ${profissional.identificadorCartao}`
        .toLocaleLowerCase("pt-BR")
        .includes(termo)
    );
  });
  const [idProfissionalEdicao, setIdProfissionalEdicao] = useState<string | null>(null);
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [identificadorCartao, setIdentificadorCartao] = useState("");
  const [identificadorEditadoManualmente, setIdentificadorEditadoManualmente] = useState(false);
  const [cargoOuEspecialidade, setCargoOuEspecialidade] = useState("");
  const [registroProfissional, setRegistroProfissional] = useState("");
  const [minibiografia, setMinibiografia] = useState("");
  const [urlFotoPerfil, setUrlFotoPerfil] = useState("");
  const [pontoFocalFoto, setPontoFocalFoto] = useState<CoordenadasPontoFocal>({
    xPercentual: 50,
    yPercentual: 28,
  });
  const [emailContato, setEmailContato] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [aceitaSolicitacoesDiretas, setAceitaSolicitacoesDiretas] = useState(true);
  const [exibirAcoesVitrineNoCartao, setExibirAcoesVitrineNoCartao] = useState(true);

  const [qrSelecionadoId, setQrSelecionadoId] = useState<string | null>(null);
  const [idConfirmarExclusao, setIdConfirmarExclusao] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const publicacao = usePublicacaoPagina({
    versaoPublicadaInicial,
    podePublicarPagina,
    bloqueado: salvando || excluindoId !== null || alterandoVisibilidadeId !== null,
    revisaoConteudoSalvo: profissionais,
    publicarPagina: () => servicoCatalogo.publicarPagina(organizacaoId),
  });

  const ocupado = publicacao.ocupado;

  function limparFormulario() {
    setIdProfissionalEdicao(null);
    setNomeCompleto("");
    setIdentificadorCartao("");
    setIdentificadorEditadoManualmente(false);
    setCargoOuEspecialidade("");
    setRegistroProfissional("");
    setMinibiografia("");
    setUrlFotoPerfil("");
    setPontoFocalFoto({ xPercentual: 50, yPercentual: 28 });
    setEmailContato("");
    setWhatsapp("");
    setLinkedin("");
    setInstagram("");
    setAceitaSolicitacoesDiretas(true);
    setExibirAcoesVitrineNoCartao(true);
  }

  function editarProfissional(profissional: ProfissionalEquipe) {
    setIdProfissionalEdicao(profissional.id);
    setNomeCompleto(profissional.nomeCompleto);
    setIdentificadorCartao(profissional.identificadorCartao);
    setIdentificadorEditadoManualmente(true);
    setCargoOuEspecialidade(profissional.cargoOuEspecialidade);
    setRegistroProfissional(profissional.registroProfissionalOpcional ?? "");
    setMinibiografia(profissional.minibiografia);
    setUrlFotoPerfil(profissional.urlFotoPerfil ?? "");
    setPontoFocalFoto(profissional.pontoFocalFoto);
    setEmailContato(profissional.emailContatoOpcional ?? "");
    setWhatsapp(profissional.whatsappOpcional ?? "");
    setLinkedin(profissional.linkedinOpcional ?? "");
    setInstagram(profissional.instagramOpcional ?? "");
    setAceitaSolicitacoesDiretas(profissional.aceitaSolicitacoesDiretas);
    setExibirAcoesVitrineNoCartao(profissional.exibirAcoesVitrineNoCartao ?? true);
    referenciaNome.current?.focus();
  }

  async function salvarProfissional(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!podeEditarConteudo || publicacao.publicando || operacaoEmCurso.current) {
      return;
    }

    operacaoEmCurso.current = true;
    setSalvando(true);

    try {
      const existente = profissionais.find((p) => p.id === idProfissionalEdicao);
      const seraAtivo = existente?.ativo ?? true;

      validarLimiteProfissionaisPlano({
        profissionaisExistentes: profissionais,
        resumoDireitosPlano,
        idProfissionalEmEdicao: existente?.id,
        seraAtivo,
      });

      const slugCartaoValidado = validarIdentificadorCartaoProfissional({
        identificadorCartao,
        profissionaisExistentes: profissionais,
        idProfissionalEmEdicao: existente?.id,
      });

      const registro: ProfissionalEquipe = {
        id:
          existente?.id ??
          `prof-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        organizacaoId,
        identificadorCartao: slugCartaoValidado,
        nomeCompleto: nomeCompleto.trim(),
        cargoOuEspecialidade: cargoOuEspecialidade.trim(),
        ...(registroProfissional.trim()
          ? { registroProfissionalOpcional: registroProfissional.trim() }
          : {}),
        minibiografia: minibiografia.trim(),
        ...(urlFotoPerfil.trim() ? { urlFotoPerfil: urlFotoPerfil.trim() } : {}),
        pontoFocalFoto,
        ...(emailContato.trim() ? { emailContatoOpcional: emailContato.trim() } : {}),
        ...(whatsapp.trim() ? { whatsappOpcional: whatsapp.trim() } : {}),
        ...(linkedin.trim() ? { linkedinOpcional: linkedin.trim() } : {}),
        ...(instagram.trim() ? { instagramOpcional: instagram.trim() } : {}),
        aceitaSolicitacoesDiretas,
        ...(exibirAcoesVitrineNoCartao ? {} : { exibirAcoesVitrineNoCartao: false }),
        ordemExibicao: existente?.ordemExibicao ?? profissionais.length + 1,
        ativo: seraAtivo,
        atualizadoEmIso: new Date().toISOString(),
      };

      await servicoCatalogo.salvarProfissional(registro);

      setProfissionais((atuais) => {
        const existe = atuais.some((p) => p.id === registro.id);
        return existe
          ? atuais.map((p) => (p.id === registro.id ? registro : p))
          : [...atuais, registro];
      });

      limparFormulario();
      notificar.sucesso(
        "Perfil e cartão digital salvos. Clique em 'Publicar página' para disponibilizar o link público.",
      );
    } catch (e) {
      notificar.erro(
        e instanceof Error ? e.message : "Não foi possível salvar o perfil profissional.",
      );
    } finally {
      operacaoEmCurso.current = false;
      setSalvando(false);
    }
  }

  async function alternarAtivo(profissional: ProfissionalEquipe) {
    if (!podeEditarConteudo || publicacao.publicando || operacaoEmCurso.current) {
      return;
    }

    operacaoEmCurso.current = true;
    setAlterandoVisibilidadeId(profissional.id);
    const proximoEstado = !profissional.ativo;

    try {
      validarLimiteProfissionaisPlano({
        profissionaisExistentes: profissionais,
        resumoDireitosPlano,
        idProfissionalEmEdicao: profissional.id,
        seraAtivo: proximoEstado,
      });

      const atualizado: ProfissionalEquipe = {
        ...profissional,
        ativo: proximoEstado,
        atualizadoEmIso: new Date().toISOString(),
      };

      await servicoCatalogo.salvarProfissional(atualizado);
      setProfissionais((atuais) =>
        atuais.map((item) => (item.id === profissional.id ? atualizado : item)),
      );
    } catch (e) {
      notificar.erro(
        e instanceof Error ? e.message : "Não foi possível alterar a situação do integrante.",
      );
    } finally {
      operacaoEmCurso.current = false;
      setAlterandoVisibilidadeId(null);
    }
  }

  async function executarExclusaoProfissional(profissional: ProfissionalEquipe) {
    if (!podeEditarConteudo || publicacao.publicando || operacaoEmCurso.current) {
      return;
    }

    operacaoEmCurso.current = true;
    setExcluindoId(profissional.id);

    try {
      await servicoCatalogo.excluirProfissional(organizacaoId, profissional.id);
      setProfissionais((atuais) => atuais.filter((p) => p.id !== profissional.id));
      if (idProfissionalEdicao === profissional.id) {
        limparFormulario();
      }
      if (qrSelecionadoId === profissional.id) {
        setQrSelecionadoId(null);
      }
      setIdConfirmarExclusao(null);
      notificar.sucesso(
        `Integrante "${profissional.nomeCompleto}" e seu cartão digital foram excluídos. Clique em 'Publicar página' para sincronizar com a vitrine pública.`,
      );
    } catch (e) {
      notificar.erro(e instanceof Error ? e.message : "Não foi possível excluir o integrante.");
    } finally {
      operacaoEmCurso.current = false;
      setExcluindoId(null);
    }
  }

  return (
    <div className="space-y-6">
      <CabecalhoPublicacaoRapidaAcervo
        aparencia="clara"
        titulo="Equipe e Cartões"
        subtitulo="Organize sua equipe, personalize os cartões digitais e compartilhe os perfis por link ou QR Code."
        identificadorPublico={identificadorPublico}
        controle={publicacao}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section aria-labelledby="titulo-formulario-especialista" className="min-w-0 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-mineral-800">
                <Users className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 id="titulo-formulario-especialista" className="text-base font-semibold text-mineral-950">
                {idProfissionalEdicao ? "Editar perfil e cartão digital" : "Cadastrar especialista"}
              </h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-mineral-500">
              Preencha o perfil e os contatos. Depois de salvar, publique para atualizar o cartão
              digital.
            </p>
          </div>

          <CartaoSuperficie className="min-w-0 rounded-2xl bg-white p-5 shadow-2xs sm:p-6">
            <form onSubmit={salvarProfissional} className="space-y-4">
              <CampoFormulario
                className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
                ref={referenciaNome}
                rotulo="Nome completo"
                required
                disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                value={nomeCompleto}
                onChange={(e) => {
                  const novoNome = e.target.value;
                  setNomeCompleto(novoNome);
                  if (!identificadorEditadoManualmente) {
                    setIdentificadorCartao(normalizarSugestaoIdentificador(novoNome));
                  }
                }}
                placeholder="Nome do profissional"
              />

              <CampoFormulario
                className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
                rotulo="Endereço do cartão digital"
                prefixoFixo={`/${identificadorPublico}/equipe/`}
                required
                disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                value={identificadorCartao}
                onChange={(e) => {
                  setIdentificadorEditadoManualmente(true);
                  setIdentificadorCartao(e.target.value.toLowerCase());
                }}
                placeholder="identificador-profissional"
              />

              <CampoFormulario
                className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
                rotulo="Cargo ou especialidade"
                required
                disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                value={cargoOuEspecialidade}
                onChange={(e) => setCargoOuEspecialidade(e.target.value)}
                placeholder="Ex.: Sócia · Direito Patrimonial"
              />

              <CampoFormulario
                className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
                rotulo="Registro profissional (opcional)"
                disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                value={registroProfissional}
                onChange={(e) => setRegistroProfissional(e.target.value)}
                placeholder="Ex.: OAB/SP 312.440 ou CRM 000000"
              />

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="minibiografia-profissional"
                  className="text-sm font-medium text-mineral-900"
                >
                  Apresentação editorial *
                </label>
                <textarea
                  id="minibiografia-profissional"
                  rows={3}
                  required
                  disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                  value={minibiografia}
                  onChange={(e) => setMinibiografia(e.target.value)}
                  placeholder="Trajetória resumida e foco de atuação do especialista."
                  className="w-full rounded-lg border border-marfim-200 bg-white px-3.5 py-2.5 text-sm text-mineral-950 focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <CampoUploadMidiaStorage
                organizacaoId={organizacaoId}
                rotulo="Retrato editorial"
                categoria="imagem"
                desabilitado={!podeEditarConteudo || publicacao.publicando || salvando}
                valorUrl={urlFotoPerfil}
                servicoUpload={servicoCatalogo}
                aoAlterarUrl={setUrlFotoPerfil}
              />

              <details className="group overflow-hidden rounded-xl border border-marfim-200 bg-white">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-xs font-semibold text-mineral-700">
                  Ajustar enquadramento do retrato
                  <ChevronDown
                    className="h-4 w-4 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="border-t border-marfim-100 p-3">
                  <SeletorPontoFocalMidia
                    urlImagemVisualizacao={urlFotoPerfil}
                    textoAlternativo={nomeCompleto || "Retrato do profissional"}
                    pontoFocalDesktop={pontoFocalFoto}
                    desabilitado={!podeEditarConteudo || publicacao.publicando || salvando}
                    aoAlterarPontoFocal={(_disp, coord) => {
                      if (coord) {
                        setPontoFocalFoto(coord);
                      }
                    }}
                  />
                </div>
              </details>

              <fieldset className="space-y-3.5 rounded-xl border border-marfim-200 bg-white p-4">
                <legend className="px-1 text-xs font-semibold text-mineral-800">
                  Contatos e redes sociais
                </legend>

                <CampoFormulario
                  className="rounded-lg border-marfim-200 focus:border-mineral-400 focus:ring-mineral-100"
                  rotulo="E-mail de contato (opcional)"
                  type="email"
                  disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                  value={emailContato}
                  onChange={(e) => setEmailContato(e.target.value)}
                  placeholder="nome@escritorio.com.br"
                />

                <CampoTelefoneComDdi
                  rotulo="WhatsApp individual (opcional)"
                  disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                  value={whatsapp}
                  onChange={(novoValor) => setWhatsapp(novoValor)}
                />

                <CampoFormulario
                  className="rounded-lg border-marfim-200 focus:border-mineral-400 focus:ring-mineral-100"
                  rotulo="LinkedIn (opcional)"
                  disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />

                <CampoFormulario
                  className="rounded-lg border-marfim-200 focus:border-mineral-400 focus:ring-mineral-100"
                  rotulo="Instagram (opcional)"
                  disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </fieldset>

              <div className="space-y-2.5 pt-1">
                <label className="flex cursor-pointer items-center gap-2.5 text-xs text-mineral-800">
                  <input
                    type="checkbox"
                    disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                    checked={aceitaSolicitacoesDiretas}
                    onChange={(e) => setAceitaSolicitacoesDiretas(e.target.checked)}
                    className="h-4 w-4 rounded border-marfim-300 accent-mineral-900"
                  />
                  <span>Permitir início de atendimento direto pelo cartão digital</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2.5 text-xs text-mineral-800">
                  <input
                    type="checkbox"
                    disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                    checked={exibirAcoesVitrineNoCartao}
                    onChange={(e) => setExibirAcoesVitrineNoCartao(e.target.checked)}
                    className="h-4 w-4 rounded border-marfim-300 accent-mineral-900"
                  />
                  <span>
                    Exibir acordeão com links e experiências da vitrine no cartão digital
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Botao
                  type="submit"
                  variante="operacional_primario"
                  tamanho="compacto"
                  disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                  className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  carregando={salvando}
                >
                  {idProfissionalEdicao ? (
                    <Save className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>
                    {idProfissionalEdicao ? "Salvar cartão digital" : "Cadastrar profissional"}
                  </span>
                </Botao>

                {idProfissionalEdicao ? (
                  <Botao
                    variante="fantasma"
                    tamanho="compacto"
                    disabled={ocupado}
                    onClick={limparFormulario}
                  >
                    Cancelar edição
                  </Botao>
                ) : null}
              </div>
            </form>
          </CartaoSuperficie>
        </section>

        <section aria-labelledby="titulo-lista-equipe" className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="titulo-lista-equipe" className="text-base font-semibold text-mineral-950">
                Sua equipe{" "}
                <span className="ml-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                  {profissionais.length}
                </span>
              </h2>
              <p className="mt-1 text-xs text-mineral-500">
                Perfis, cartões digitais e contatos em um só lugar.
              </p>
            </div>
            {idProfissionalEdicao && podeEditarConteudo ? (
              <Botao
                variante="operacional_secundario"
                tamanho="compacto"
                disabled={ocupado}
                className="rounded-lg border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100"
                onClick={() => {
                  limparFormulario();
                  referenciaNome.current?.focus();
                }}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Novo profissional
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
                aria-label="Buscar profissionais"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar nome ou especialidade…"
                className="min-h-10 w-full rounded-lg border border-marfim-200 bg-white py-2 pr-3 pl-9 text-xs focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <select
              aria-label="Filtrar visibilidade"
              value={filtroVisibilidade}
              onChange={(e) => setFiltroVisibilidade(e.target.value as typeof filtroVisibilidade)}
              className="min-h-10 min-w-0 rounded-lg border border-marfim-200 bg-white px-3 py-2 text-xs text-mineral-700 focus:border-indigo-400 focus:outline-none"
            >
              <option value="todos">Todos os perfis</option>
              <option value="ativos">Ativos</option>
              <option value="ocultos">Ocultos</option>
            </select>
          </div>
          {profissionaisFiltrados.length === 0 ? (
            <CartaoSuperficie className="flex min-h-64 flex-col items-center justify-center rounded-2xl border-dashed p-6 text-center shadow-none">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <Users className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-sm font-semibold text-mineral-900">
                {profissionais.length === 0
                  ? "Sua equipe começa aqui"
                  : "Nenhum profissional encontrado"}
              </h3>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-mineral-500">
                {profissionais.length === 0
                  ? "Cadastre seu perfil ou o primeiro integrante para preparar o cartão digital e o QR Code."
                  : "Tente outro nome, especialidade ou visibilidade."}
              </p>
              {profissionais.length > 0 ? (
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
            <ul aria-label="Lista de profissionais" className="space-y-4">
              {profissionaisFiltrados.map((profissional) => (
                <li key={profissional.id}>
                  <CartaoItemProfissional
                    profissional={profissional}
                    identificadorPublico={identificadorPublico}
                    urlBasePublica={urlBasePublica}
                    estaEmEdicao={idProfissionalEdicao === profissional.id}
                    qrAberto={qrSelecionadoId === profissional.id}
                    confirmandoExclusao={idConfirmarExclusao === profissional.id}
                    excluindo={excluindoId === profissional.id}
                    alterandoVisibilidade={alterandoVisibilidadeId === profissional.id}
                    podeEditar={podeEditarConteudo}
                    ocupado={publicacao.publicando || ocupado}
                    temPaginaPublicada={versaoPublicadaInicial !== null}
                    onAlternarQr={() =>
                      setQrSelecionadoId((atual) =>
                        atual === profissional.id ? null : profissional.id,
                      )
                    }
                    onEditar={() => editarProfissional(profissional)}
                    onAlternarVisibilidade={() => alternarAtivo(profissional)}
                    onSolicitarExclusao={() =>
                      setIdConfirmarExclusao((atual) =>
                        atual === profissional.id ? null : profissional.id,
                      )
                    }
                    onCancelarExclusao={() => setIdConfirmarExclusao(null)}
                    onConfirmarExclusao={() => executarExclusaoProfissional(profissional)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
