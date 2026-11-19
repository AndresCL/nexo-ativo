"use client";

import { usePublicacaoPagina } from "@/ganchos/usePublicacaoPagina";

import { notificar } from "@/componentes/interface/notificacoes/notificar";

import Imagem from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import {
  Check,
  ChevronDown,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  MessageCircle,
  Plus,
  QrCode,
  Save,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import type { ServicoCatalogoConteudoPorta } from "@/aplicacao/portas/portasCatalogoConteudo";
import type { ResumoDireitosPlano } from "@/dominio/entidades/autenticacaoEOrganizacao";
import {
  construirUrlPublicaCartaoProfissional,
  validarIdentificadorCartaoProfissional,
  validarLimiteProfissionaisPlano,
  type ProfissionalEquipe,
} from "@/dominio/entidades/catalogoConteudo";
import type { CoordenadasPontoFocal } from "@/dominio/entidades/paginaPublicada";
import { normalizarSugestaoIdentificador } from "@/dominio/objetos-valor/identificadorPublico";
import { servicoCatalogoConteudoCliente } from "@/infraestrutura/painel/servicoCatalogoConteudoCliente";
import { ExibicaoQrCodeEditorial } from "@/componentes/editorial/ExibicaoQrCodeEditorial";
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

  const [qrSelecionadoId, setQrSelecionadoId] = useState<string | "organizacao" | null>(null);
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

  const quantidadeAtivos = profissionais.filter((p) => p.ativo).length;
  const limitePlano = resumoDireitosPlano.limiteProfissionaisAtivos;
  const urlPrincipalOrganizacao = `${urlBasePublica.replace(/\/+$/, "")}/${identificadorPublico}`;

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

      <section aria-label="Resumo da equipe" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            rotulo: "Profissionais",
            quantidade: profissionais.length,
            icone: Users,
            cor: "border-indigo-200 from-indigo-50/80 text-indigo-950",
            iconeCor: "bg-indigo-600",
          },
          {
            rotulo: "Perfis ativos",
            quantidade: quantidadeAtivos,
            icone: Check,
            cor: "border-emerald-200 from-emerald-50/80 text-emerald-950",
            iconeCor: "bg-emerald-600",
          },
          {
            rotulo: "Atendimento direto",
            quantidade: profissionais.filter((p) => p.ativo && p.aceitaSolicitacoesDiretas).length,
            icone: MessageCircle,
            cor: "border-sky-200 from-sky-50/80 text-sky-950",
            iconeCor: "bg-sky-600",
          },
          {
            rotulo: "Perfis ocultos",
            quantidade: profissionais.filter((p) => !p.ativo).length,
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

      <CartaoSuperficie
        preenchimento="compacto"
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-sky-200 bg-gradient-to-b from-sky-50/60 to-white shadow-xs"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-xs font-semibold text-mineral-950" data-testid="indicador-cota-equipe">
            Perfis ativos: {quantidadeAtivos} de {limitePlano} incluídos no plano atual
          </p>
          <div
            role="meter"
            aria-label="Perfis ativos no plano"
            aria-valuenow={quantidadeAtivos}
            aria-valuemin={0}
            aria-valuemax={Math.max(limitePlano, quantidadeAtivos, 1)}
            className="h-1.5 max-w-xs overflow-hidden rounded-full bg-sky-100"
          >
            <div
              className="h-full rounded-full bg-sky-500"
              style={{
                width: `${Math.min(100, (quantidadeAtivos / Math.max(limitePlano, 1)) * 100)}%`,
              }}
            />
          </div>
          <p className="text-xs leading-relaxed text-mineral-500">
            {limitePlano <= 1
              ? "O Plano Pro habilita até 10 profissionais ativos com cartões digitais individuais."
              : "Cada profissional ativo recebe um endereço exclusivo de cartão digital e QR Code próprio."}
          </p>
        </div>

        <Botao
          variante="operacional_secundario"
          tamanho="compacto"
          className="rounded-lg border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100"
          aria-expanded={qrSelecionadoId === "organizacao"}
          onClick={() =>
            setQrSelecionadoId((atual) => (atual === "organizacao" ? null : "organizacao"))
          }
        >
          <QrCode className="h-4 w-4" aria-hidden="true" />
          <span>QR Code da página principal</span>
        </Botao>
      </CartaoSuperficie>

      {qrSelecionadoId === "organizacao" ? (
        <ExibicaoQrCodeEditorial
          urlDestino={urlPrincipalOrganizacao}
          rotuloIdentificacao={`Página principal · /${identificadorPublico}`}
          nomeArquivoSvg={`qrcode-${identificadorPublico}`}
        />
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <CartaoSuperficie className="min-w-0 rounded-2xl bg-gradient-to-b from-indigo-50/30 via-white to-white p-5 shadow-xs sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Users className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="text-base font-semibold text-mineral-950">
              {idProfissionalEdicao ? "Editar perfil e cartão digital" : "Cadastrar especialista"}
            </h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-mineral-500">
            Preencha o perfil e os contatos. Depois de salvar, publique para atualizar o cartão
            digital.
          </p>

          <form onSubmit={salvarProfissional} className="mt-4 space-y-4">
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
              placeholder="Ex.: Dra. Helena Vasconcelos"
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
              placeholder="helena-vasconcelos"
            />

            <div className="grid gap-3 sm:grid-cols-2">
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
            </div>

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

            <fieldset className="space-y-4 rounded-xl border border-sky-100 bg-sky-50/20 p-4">
              <legend className="px-1 text-xs font-semibold text-sky-800">
                Contatos e redes sociais
              </legend>

              <div className="grid gap-3 sm:grid-cols-2">
                <CampoFormulario
                  className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
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
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <CampoFormulario
                  className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
                  rotulo="LinkedIn (opcional)"
                  disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />

                <CampoFormulario
                  className="rounded-lg border-marfim-200 focus:border-indigo-400 focus:ring-indigo-100"
                  rotulo="Instagram (opcional)"
                  disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </fieldset>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-sky-200 bg-sky-50/40 px-3.5 py-2.5 text-xs text-mineral-900">
              <input
                type="checkbox"
                disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                checked={aceitaSolicitacoesDiretas}
                onChange={(e) => setAceitaSolicitacoesDiretas(e.target.checked)}
                className="h-4 w-4 accent-sky-600"
              />
              <span>Permitir início de atendimento direto pelo cartão digital</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-indigo-200 bg-indigo-50/40 px-3.5 py-2.5 text-xs text-mineral-900">
              <input
                type="checkbox"
                disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                checked={exibirAcoesVitrineNoCartao}
                onChange={(e) => setExibirAcoesVitrineNoCartao(e.target.checked)}
                className="h-4 w-4 accent-indigo-600"
              />
              <span>
                Exibir acordeão com links e experiências da vitrine no cartão digital
              </span>
            </label>

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
              {profissionaisFiltrados.map((profissional) => {
                const urlCartao = construirUrlPublicaCartaoProfissional({
                  urlBasePublica,
                  identificadorOrganizacao: identificadorPublico,
                  identificadorCartao: profissional.identificadorCartao,
                });
                const qrAberto = qrSelecionadoId === profissional.id;

                return (
                  <li key={profissional.id}>
                    <CartaoSuperficie
                      className={combinarClasses(
                        "min-w-0 space-y-4 overflow-hidden rounded-2xl p-4 shadow-xs sm:p-5",
                        idProfissionalEdicao === profissional.id
                          ? "border-indigo-300 ring-1 ring-indigo-100"
                          : "border-marfim-200",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <RetratoProfissional
                          key={profissional.urlFotoPerfil ?? profissional.id}
                          profissional={profissional}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap gap-1.5">
                            <span
                              className={combinarClasses(
                                "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                                profissional.ativo
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "border-violet-200 bg-violet-50 text-violet-800",
                              )}
                            >
                              {profissional.ativo ? "Ativo" : "Oculto"}
                            </span>
                            {profissional.aceitaSolicitacoesDiretas ? (
                              <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
                                Atendimento direto
                              </span>
                            ) : null}
                          </div>
                          <span className="break-words text-[10px] font-medium tracking-wider text-mineral-500 uppercase">
                            {profissional.cargoOuEspecialidade}
                          </span>
                          <h3 className="mt-1 break-words text-sm font-semibold text-mineral-950">
                            {profissional.nomeCompleto}
                          </h3>
                          <p className="mt-1 break-all text-[11px] text-mineral-500">
                            /{identificadorPublico}/equipe/{profissional.identificadorCartao}
                          </p>
                        </div>
                      </div>
                      <p className="break-words text-xs leading-relaxed text-mineral-500">
                        {profissional.minibiografia}
                      </p>
                      {profissional.emailContatoOpcional || profissional.whatsappOpcional ? (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-xl border border-marfim-100 bg-marfim-50/50 px-3 py-2 text-[11px] text-mineral-600">
                          {profissional.emailContatoOpcional ? (
                            <span className="break-all">{profissional.emailContatoOpcional}</span>
                          ) : null}
                          {profissional.whatsappOpcional ? (
                            <span>{profissional.whatsappOpcional}</span>
                          ) : null}
                        </div>
                      ) : null}
                      <div className="border-t border-marfim-100 pt-3">
                        <div className="flex flex-wrap items-center gap-1">
                          <Botao
                            variante="fantasma"
                            tamanho="compacto"
                            className="rounded-lg px-2.5 text-xs text-violet-700 hover:bg-violet-50"
                            aria-expanded={qrAberto}
                            aria-label={`QR Code de ${profissional.nomeCompleto}`}
                            onClick={() =>
                              setQrSelecionadoId((atual) =>
                                atual === profissional.id ? null : profissional.id,
                              )
                            }
                          >
                            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                            QR Code
                          </Botao>

                          <Botao
                            variante="fantasma"
                            tamanho="compacto"
                            disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                            className="rounded-lg px-2.5 text-xs text-indigo-700 hover:bg-indigo-50"
                            aria-label={`Editar ${profissional.nomeCompleto}`}
                            onClick={() => editarProfissional(profissional)}
                          >
                            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                            Editar
                          </Botao>

                          <Botao
                            variante="fantasma"
                            tamanho="compacto"
                            disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                            className="rounded-lg px-2.5 text-xs text-mineral-600 hover:bg-marfim-50"
                            carregando={alterandoVisibilidadeId === profissional.id}
                            textoCarregando="Salvando…"
                            aria-label={
                              profissional.ativo
                                ? `Desativar ${profissional.nomeCompleto}`
                                : `Reativar ${profissional.nomeCompleto}`
                            }
                            onClick={() => alternarAtivo(profissional)}
                          >
                            {profissional.ativo ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                            {profissional.ativo ? "Ocultar" : "Reativar"}
                          </Botao>

                          <Botao
                            variante="fantasma"
                            tamanho="compacto"
                            disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                            aria-label={`Excluir ${profissional.nomeCompleto}`}
                            onClick={() =>
                              setIdConfirmarExclusao((atual) =>
                                atual === profissional.id ? null : profissional.id,
                              )
                            }
                            className="ml-auto rounded-lg px-2.5 text-red-700 hover:bg-red-50 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Botao>
                        </div>
                      </div>

                      {idConfirmarExclusao === profissional.id ? (
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50/80 p-3 text-xs text-red-900">
                          <span>
                            Deseja realmente excluir <strong>{profissional.nomeCompleto}</strong> e
                            seu cartão digital?
                          </span>
                          <div className="flex items-center gap-2">
                            <Botao
                              variante="fantasma"
                              tamanho="compacto"
                              disabled={ocupado}
                              onClick={() => setIdConfirmarExclusao(null)}
                            >
                              Cancelar
                            </Botao>
                            <Botao
                              variante="operacional_primario"
                              tamanho="compacto"
                              disabled={!podeEditarConteudo || publicacao.publicando || ocupado}
                              carregando={excluindoId === profissional.id}
                              className="bg-red-700 hover:bg-red-800 text-white"
                              onClick={() => executarExclusaoProfissional(profissional)}
                            >
                              Sim, excluir
                            </Botao>
                          </div>
                        </div>
                      ) : null}

                      {versaoPublicadaInicial !== null && profissional.ativo ? (
                        <div>
                          <Link
                            href={`/${identificadorPublico}/equipe/${profissional.identificadorCartao}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-10 items-center gap-1 rounded-lg text-xs font-medium text-indigo-700 hover:text-indigo-900"
                          >
                            <span>Abrir cartão digital publicado</span>
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </Link>
                        </div>
                      ) : null}

                      {qrAberto ? (
                        <ExibicaoQrCodeEditorial
                          urlDestino={urlCartao}
                          rotuloIdentificacao={profissional.nomeCompleto}
                          nomeArquivoSvg={`cartao-${profissional.identificadorCartao}`}
                        />
                      ) : null}
                    </CartaoSuperficie>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function RetratoProfissional({ profissional }: { readonly profissional: ProfissionalEquipe }) {
  const [falhou, setFalhou] = useState(false);
  const iniciais = profissional.nomeCompleto
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toLocaleUpperCase("pt-BR");
  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-sky-50 text-lg font-bold text-indigo-600 sm:h-20 sm:w-20">
      {profissional.urlFotoPerfil && !falhou ? (
        <Imagem
          src={profissional.urlFotoPerfil}
          alt={`Retrato de ${profissional.nomeCompleto}`}
          fill
          unoptimized
          sizes="80px"
          className="object-cover"
          style={{
            objectPosition: `${profissional.pontoFocalFoto.xPercentual}% ${profissional.pontoFocalFoto.yPercentual}%`,
          }}
          onError={() => setFalhou(true)}
        />
      ) : (
        <span aria-label={`Iniciais de ${profissional.nomeCompleto}`}>{iniciais}</span>
      )}
    </div>
  );
}
