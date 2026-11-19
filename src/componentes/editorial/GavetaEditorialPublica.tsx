"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, Clock } from "lucide-react";
import { IconeWhatsapp } from "@/componentes/interface/IconeWhatsapp";
import {
  formatarApresentacaoPrecoItem,
  obterListaImagensMidia,
  type AcervoPublicoVitrine,
  type ProfissionalEquipe,
} from "@/dominio/entidades/catalogoConteudo";
import {
  obterDescritorPaletaEditorial,
  obterDescritorTipografiaEditorial,
  type ConteudoPaginaPublicada,
} from "@/dominio/entidades/paginaPublicada";
import { normalizarNumeroWhatsappInternacional } from "@/dominio/servicos/numeroWhatsappInternacional";
import type { ContextoOrigemMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import { TransicaoAlternancia } from "@/componentes/interface/TransicaoAlternancia";
import { GaleriaImagensComThumbs } from "@/componentes/interface/GaleriaImagensComThumbs";
import { servicoTelemetriaAnonimaPadrao } from "@/infraestrutura/analytics/servicoTelemetriaAnonima";
import { obterOuDetectarOrigemSessao } from "@/infraestrutura/analytics/rastreadorSessaoOrigem";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { AvatarProfissional } from "./AvatarProfissional";
import { PainelEditorialPublico } from "./PainelEditorialPublico";

export type SecaoAcervoAberta = "produtos" | "servicos" | "portfolio" | "equipe" | null;

export interface PropriedadesGavetaEditorialPublica {
  readonly aoRetornarFoco?: () => void;
  readonly aberto: boolean;
  readonly aoAlterarAbertura: (aberto: boolean) => void;
  readonly secaoAberta: SecaoAcervoAberta;
  readonly tituloPersonalizado?: string;
  readonly pagina: ConteudoPaginaPublicada;
  readonly acervo: AcervoPublicoVitrine;
  readonly aoSolicitarExperiencia: (
    tipoPreferencial: string,
    contexto: ContextoOrigemMicrofluxo,
  ) => void;
  readonly consultorPadraoId?: string;
  readonly aoAbrirCartao?: (profissional: ProfissionalEquipe) => void;
}

export function GavetaEditorialPublica({
  aoRetornarFoco,
  aberto,
  aoAlterarAbertura,
  secaoAberta,
  tituloPersonalizado,
  pagina,
  acervo,
  aoSolicitarExperiencia: _aoSolicitarExperiencia,
  consultorPadraoId: _consultorPadraoId,
  aoAbrirCartao,
}: PropriedadesGavetaEditorialPublica) {
  const paleta = obterDescritorPaletaEditorial(pagina.paletaId);
  const tipografia = obterDescritorTipografiaEditorial(pagina.tipografiaId);
  const tituloGaveta = useMemo(() => {
    if (tituloPersonalizado?.trim()) return tituloPersonalizado.trim();
    switch (secaoAberta) {
      case "produtos":
        return "Produtos";
      case "servicos":
        return "Serviços";
      case "portfolio":
        return "Portfólio & Realizações";
      case "equipe":
        return "Nossa Equipe";
      default:
        return "";
    }
  }, [secaoAberta, tituloPersonalizado]);

  return (
    <PainelEditorialPublico
      aoRetornarFoco={aoRetornarFoco}
      aberto={aberto}
      aoAlterarAbertura={aoAlterarAbertura}
      pagina={pagina}
      titulo={tituloGaveta}
    >
      <TransicaoAlternancia chaveId={secaoAberta ?? "nenhuma"} variante="fade">
        {secaoAberta === "produtos" ? (
          <div className="mt-7 space-y-8 sm:mt-5 sm:space-y-6">
            {acervo.produtos.length === 0 ? (
              <p className="text-sm text-[var(--editorial-texto-secundario)]">
                Os produtos estão sendo atualizados no momento.
              </p>
            ) : null}

            {acervo.produtos.length > 0 ? (
              <section aria-label="Lista de produtos" className="space-y-4 sm:space-y-3">
                {acervo.produtos.map((produto) => (
                  <article
                    key={produto.id}
                    className={combinarClasses(
                      "group rounded-2xl border p-5 transition-all duration-300 hover:border-current/35 sm:p-4",
                      paleta.temaEscuro
                        ? "border-white/12 bg-[var(--editorial-superficie)]/70 backdrop-blur-md hover:bg-[var(--editorial-superficie)]"
                        : "border-black/10 bg-[var(--editorial-superficie)]/80 backdrop-blur-md hover:bg-[var(--editorial-superficie)]",
                    )}
                  >
                    <GaleriaImagensComThumbs
                      imagens={obterListaImagensMidia(
                        produto.urlImagemPrincipal
                          ? {
                              url: produto.urlImagemPrincipal,
                              textoAlternativo: produto.nome,
                              pontoFocal: produto.pontoFocalImagem,
                            }
                          : null,
                        produto.imagens,
                      )}
                      tituloFallback={produto.nome}
                      temaEscuro={paleta.temaEscuro}
                      className="mb-4"
                    />
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="rounded-full bg-current/8 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.12em] text-[var(--editorial-texto-secundario)] uppercase">
                        {produto.categoria}
                      </span>
                      <span className="text-xs font-semibold text-[var(--editorial-texto-secundario)]">
                        {formatarApresentacaoPrecoItem({
                          centavos: produto.precoCentavos,
                          rotuloOpcional: produto.rotuloPrecoOpcional,
                        })}
                      </span>
                    </div>

                    <h3 className="mt-2.5 text-base font-semibold sm:text-lg text-[var(--editorial-texto)]">
                      {produto.nome}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--editorial-texto-secundario)]">
                      {produto.resumo}
                    </p>
                  </article>
                ))}
              </section>
            ) : null}
          </div>
        ) : null}

        {secaoAberta === "servicos" ? (
          <div className="mt-7 space-y-8 sm:mt-5 sm:space-y-6">
            {acervo.servicos.length === 0 ? (
              <p className="text-sm text-[var(--editorial-texto-secundario)]">
                As informações detalhadas de serviços estão em atualização.
              </p>
            ) : null}

            {acervo.servicos.length > 0 ? (
              <section aria-label="Lista de serviços" className="space-y-4 sm:space-y-3">
                {acervo.servicos.map((servico) => (
                  <article
                    key={servico.id}
                    className={combinarClasses(
                      "group rounded-2xl border p-5 transition-all duration-300 hover:border-current/35 sm:p-4",
                      paleta.temaEscuro
                        ? "border-white/12 bg-[var(--editorial-superficie)]/70 backdrop-blur-md hover:bg-[var(--editorial-superficie)]"
                        : "border-black/10 bg-[var(--editorial-superficie)]/80 backdrop-blur-md hover:bg-[var(--editorial-superficie)]",
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
                      temaEscuro={paleta.temaEscuro}
                      className="mb-4"
                    />
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="rounded-full bg-current/8 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.12em] text-[var(--editorial-texto-secundario)] uppercase">
                        {servico.categoria}
                      </span>
                      <span className="text-xs font-semibold text-[var(--editorial-destaque)]">
                        {formatarApresentacaoPrecoItem({
                          centavos: servico.precoBaseCentavos,
                          rotuloOpcional: servico.rotuloPrecoOpcional,
                        })}
                      </span>
                    </div>

                    <h3
                      className={combinarClasses(
                        "mt-2.5 text-xl font-medium sm:text-lg",
                        tipografia.classeTitulo,
                      )}
                    >
                      {servico.nome}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--editorial-texto-secundario)]">
                      {servico.resumo}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-current/10 pt-3">
                      {servico.prazoOuDuracao ? (
                        <p className="flex items-center gap-1.5 text-xs text-[var(--editorial-texto-secundario)]">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{servico.prazoOuDuracao}</span>
                        </p>
                      ) : (
                        <span />
                      )}
                    </div>
                  </article>
                ))}
              </section>
            ) : null}
          </div>
        ) : null}

        {secaoAberta === "portfolio" ? (
          <div className="mt-7 space-y-6 sm:mt-5 sm:space-y-4">
            {acervo.projetosPortfolio.length === 0 ? (
              <p className="text-sm text-[var(--editorial-texto-secundario)]">
                Nenhum projeto detalhado publicado nesta seção no momento.
              </p>
            ) : (
              acervo.projetosPortfolio.map((projeto) => {
                return (
                  <article
                    key={projeto.id}
                    className={combinarClasses(
                      "overflow-hidden rounded-md border",
                      paleta.temaEscuro
                        ? "border-white/12 bg-[var(--editorial-superficie)]"
                        : "border-black/10 bg-[var(--editorial-superficie)]",
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
                      temaEscuro={paleta.temaEscuro}
                      className="p-2 pb-0"
                    />

                    <div className="p-5 sm:p-4">
                      <p className="text-[11px] tracking-[0.16em] text-[var(--editorial-texto-secundario)] uppercase">
                        {projeto.categoriaOuSerie}
                        {projeto.anoOuLocal ? ` · ${projeto.anoOuLocal}` : ""}
                      </p>
                      <h3
                        className={combinarClasses(
                          "mt-1.5 text-2xl sm:text-xl",
                          tipografia.classeTitulo,
                        )}
                      >
                        {projeto.titulo}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--editorial-texto-secundario)]">
                        {projeto.resumoEditorial}
                      </p>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        ) : null}

        {secaoAberta === "equipe" ? (
          <div className="mt-7 space-y-4 sm:mt-5 sm:space-y-3">
            {acervo.profissionais.length === 0 ? (
              <p className="text-sm text-[var(--editorial-texto-secundario)]">
                As informações da equipe estão sendo atualizadas.
              </p>
            ) : (
              acervo.profissionais.map((prof) => {
                return (
                  <article
                    key={prof.id}
                    className={combinarClasses(
                      "flex flex-row items-start gap-3.5 rounded-xl border p-4 sm:gap-3 sm:p-3.5",
                      paleta.temaEscuro
                        ? "border-white/12 bg-[var(--editorial-superficie)]"
                        : "border-black/10 bg-[var(--editorial-superficie)]",
                    )}
                  >
                    <AvatarProfissional
                      urlFoto={prof.urlFotoPerfil}
                      nome={prof.nomeCompleto}
                      pontoFocal={prof.pontoFocalFoto}
                      tamanho="grande"
                      formato="circular"
                      className="sm:h-12 sm:w-12"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <h3
                          className={combinarClasses(
                            "text-lg font-semibold sm:text-base",
                            tipografia.classeTitulo,
                          )}
                        >
                          {prof.nomeCompleto}
                        </h3>
                        {prof.registroProfissionalOpcional ? (
                          <span className="text-[11px] text-[var(--editorial-texto-secundario)]">
                            {prof.registroProfissionalOpcional}
                          </span>
                        ) : null}
                      </div>

                      <p className="text-xs font-semibold text-[var(--editorial-texto-secundario)] uppercase sm:text-[11px]">
                        {prof.cargoOuEspecialidade}
                      </p>
                      <p className="text-xs leading-relaxed text-[var(--editorial-texto-secundario)]">
                        {prof.minibiografia}
                      </p>

                      <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-2">
                        {prof.whatsappOpcional ? (
                          <a
                            href={`https://wa.me/${normalizarNumeroWhatsappInternacional(prof.whatsappOpcional) ?? ""}?text=${encodeURIComponent(`Olá ${prof.nomeCompleto.split(" ")[0]}, vi seu contato na equipe da ${pagina.identidade.nomeExibicao} e gostaria de atendimento.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              const origem = obterOuDetectarOrigemSessao(pagina.organizacaoId);
                              void servicoTelemetriaAnonimaPadrao.registrarEvento({
                                organizacaoId: pagina.organizacaoId,
                                tipoEvento: "clique_whatsapp",
                                canalOrigem: origem.canalOrigem,
                                profissionalId: prof.id,
                                profissionalNome: prof.nomeCompleto,
                                ...(origem.cartaoProfissionalId
                                  ? { cartaoProfissionalId: origem.cartaoProfissionalId }
                                  : {}),
                              });
                            }}
                            className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3.5 py-1.5 text-center text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90 sm:flex-[1.4] sm:px-2.5 sm:text-[11px] sm:whitespace-nowrap"
                          >
                            <IconeWhatsapp
                              className="h-3.5 w-3.5 shrink-0 text-white"
                              aria-hidden="true"
                            />
                            <span>Chamar no WhatsApp</span>
                          </a>
                        ) : null}

                        {aoAbrirCartao ? (
                          <button
                            type="button"
                            onClick={() => aoAbrirCartao(prof)}
                            className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-current/20 px-3.5 py-1.5 text-center text-xs font-medium transition-opacity hover:opacity-80 cursor-pointer sm:px-2.5 sm:text-[11px]"
                          >
                            <span>Ver perfil</span>
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        ) : (
                          <Link
                            href={`/${pagina.identificadorPublico}/equipe/${prof.identificadorCartao}`}
                            onClick={() => aoAlterarAbertura(false)}
                            className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-current/20 px-3.5 py-1.5 text-center text-xs font-medium transition-opacity hover:opacity-80 sm:px-2.5 sm:text-[11px]"
                          >
                            <span>Ver perfil</span>
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        ) : null}
      </TransicaoAlternancia>
    </PainelEditorialPublico>
  );
}
