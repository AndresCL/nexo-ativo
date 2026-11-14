"use client";
import Image from "next/image";
import type { AcervoPublicoVitrine } from "@/dominio/entidades/catalogoConteudo";
import {
  formatarApresentacaoPrecoItem,
  obterListaImagensMidia,
} from "@/dominio/entidades/catalogoConteudo";
import { GaleriaImagensComThumbs } from "@/componentes/interface/GaleriaImagensComThumbs";
import type { BlocoEtapaLivre, EtapaMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";
import type {
  RespostasExecucaoMicrofluxo,
  ValorCampoDinamico,
} from "@/dominio/microfluxos/motorExecucaoMicrofluxo";
import { obterValorBloco } from "@/dominio/microfluxos/composicaoEtapaLivre";
import { ItemCampoFormularioDinamico } from "./ItemCampoFormularioDinamico";
import { AvatarProfissional } from "./AvatarProfissional";

export function BlocosConteudoEditorial({
  blocos,
}: {
  readonly blocos: readonly BlocoEtapaLivre[];
}) {
  return (
    <>
      {blocos.map((bloco) =>
        bloco.tipo === "texto" ? (
          <p key={bloco.id} className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {bloco.texto}
          </p>
        ) : bloco.tipo === "imagem" ? (
          <figure key={bloco.id}>
            <Image
              unoptimized
              src={bloco.url}
              alt={bloco.textoAlternativo}
              width={960}
              height={640}
              className="h-auto w-full rounded-lg object-contain"
            />
          </figure>
        ) : null,
      )}
    </>
  );
}
const classeEscolha =
  "flex w-full items-center gap-3 rounded-lg border border-current/20 bg-[var(--editorial-superficie)] p-3 text-left text-sm transition hover:border-current/50 aria-pressed:border-[var(--editorial-destaque)] aria-pressed:ring-1 aria-pressed:ring-[var(--editorial-destaque)]";
export function ConteudoEtapaLivreVisitante({
  etapa,
  respostas,
  acervo,
  aoResponder,
  aoSelecionarCatalogo,
  aoSelecionarProfissional,
}: {
  readonly etapa: EtapaMicrofluxo;
  readonly respostas: RespostasExecucaoMicrofluxo;
  readonly acervo: AcervoPublicoVitrine;
  readonly aoResponder: (bloco: BlocoEtapaLivre, valor: ValorCampoDinamico) => void;
  readonly aoSelecionarCatalogo: (
    bloco: BlocoEtapaLivre,
    tipo: "produto" | "servico",
    id: string,
  ) => void;
  readonly aoSelecionarProfissional: (bloco: BlocoEtapaLivre, id: string) => void;
}) {
  const repeteTitulo = (rotulo: string) =>
    rotulo.trim().toLocaleLowerCase("pt-BR") === etapa.titulo.trim().toLocaleLowerCase("pt-BR");
  const classeLegenda = (rotulo: string) =>
    repeteTitulo(rotulo) ? "sr-only" : "mb-2 text-sm font-medium";
  return (
    <div className="space-y-5">
      {(etapa.blocos ?? []).map((bloco) => {
        if (bloco.tipo === "texto" || bloco.tipo === "imagem")
          return <BlocosConteudoEditorial key={bloco.id} blocos={[bloco]} />;
        const valor = obterValorBloco(etapa, bloco, respostas);
        if (bloco.tipo === "campo")
          return (
            <ItemCampoFormularioDinamico
              key={bloco.id}
              campo={bloco.campo}
              ocultarRotulo={repeteTitulo(bloco.campo.rotulo)}
              valor={valor}
              aoMudar={(novo) => aoResponder(bloco, novo)}
            />
          );
        if (bloco.tipo === "escolha")
          return (
            <fieldset key={bloco.id} className="space-y-2">
              <legend className={classeLegenda(bloco.rotulo)}>
                {bloco.rotulo}
                {bloco.obrigatorio ? " *" : ""}
              </legend>
              {bloco.opcoes.map((opcao) => {
                const selecionada = bloco.multipla
                  ? Array.isArray(valor) && valor.includes(opcao.id)
                  : valor === opcao.id;
                return (
                  <button
                    key={opcao.id}
                    type="button"
                    aria-pressed={selecionada}
                    className={classeEscolha}
                    onClick={() => {
                      const atuais = Array.isArray(valor) ? valor : [];
                      aoResponder(
                        bloco,
                        bloco.multipla
                          ? selecionada
                            ? atuais.filter((id) => id !== opcao.id)
                            : [...atuais, opcao.id]
                          : opcao.id,
                      );
                    }}
                  >
                    <span>
                      <span className="block">{opcao.rotulo}</span>
                      {opcao.descricaoCurta ? (
                        <span className="mt-1 block text-xs opacity-70">
                          {opcao.descricaoCurta}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </fieldset>
          );
        if (bloco.tipo === "catalogo")
          return (
            <fieldset key={bloco.id} className="space-y-2">
              <legend className={classeLegenda(bloco.rotulo)}>
                {bloco.rotulo}
                {bloco.obrigatorio ? " *" : ""}
              </legend>
              {bloco.fonte !== "servicos"
                ? acervo.produtos.map((produto) => {
                  const imagensProduto = obterListaImagensMidia(
                    produto.urlImagemPrincipal
                      ? {
                        url: produto.urlImagemPrincipal,
                        textoAlternativo: produto.textoAlternativoImagem || produto.nome,
                        pontoFocal: produto.pontoFocalImagem,
                      }
                      : null,
                    produto.imagens,
                  );
                  const selecionado = valor === `produto:${produto.id}`;
                  return (
                    <div
                      key={produto.id}
                      onClick={() => aoSelecionarCatalogo(bloco, "produto", produto.id)}
                      className={`${classeEscolha} cursor-pointer flex-col items-stretch ${selecionado
                          ? "border-[var(--editorial-destaque)] ring-2 ring-[var(--editorial-destaque)]"
                          : ""
                        }`}
                    >
                      <GaleriaImagensComThumbs
                        imagens={imagensProduto}
                        tituloFallback={produto.nome}
                        sizes="(max-width: 768px) 100vw, 520px"
                      />
                      <button
                        type="button"
                        className="w-full text-left"
                        aria-pressed={selecionado}
                        onClick={() => aoSelecionarCatalogo(bloco, "produto", produto.id)}
                      >
                        <span className="block font-medium">{produto.nome}</span>
                        <span className="block text-xs opacity-70">{produto.resumo}</span>
                        <span className="mt-1 block text-xs">
                          {formatarApresentacaoPrecoItem({ centavos: produto.precoCentavos })}
                        </span>
                      </button>
                    </div>
                  );
                })
                : null}
              {bloco.fonte !== "produtos"
                ? acervo.servicos.map((servico) => {
                  const imagensServico = obterListaImagensMidia(
                    servico.urlImagemOpcional
                      ? {
                        url: servico.urlImagemOpcional,
                        textoAlternativo: servico.nome,
                        pontoFocal: servico.pontoFocalImagem,
                      }
                      : null,
                    servico.imagens,
                  );
                  const selecionado = valor === `servico:${servico.id}`;
                  return (
                    <div
                      key={servico.id}
                      onClick={() => aoSelecionarCatalogo(bloco, "servico", servico.id)}
                      className={`${classeEscolha} cursor-pointer flex-col items-stretch ${selecionado
                          ? "border-[var(--editorial-destaque)] ring-2 ring-[var(--editorial-destaque)]"
                          : ""
                        }`}
                    >
                      <GaleriaImagensComThumbs
                        imagens={imagensServico}
                        tituloFallback={servico.nome}
                        sizes="(max-width: 768px) 100vw, 520px"
                      />
                      <button
                        type="button"
                        className="w-full text-left"
                        aria-pressed={selecionado}
                        onClick={() => aoSelecionarCatalogo(bloco, "servico", servico.id)}
                      >
                        <span className="block font-medium">{servico.nome}</span>
                        <span className="block text-xs opacity-70">{servico.resumo}</span>
                        <span className="mt-1 block text-xs">
                          {formatarApresentacaoPrecoItem({
                            centavos: servico.precoBaseCentavos,
                            rotuloOpcional: servico.rotuloPrecoOpcional,
                          })}
                        </span>
                      </button>
                    </div>
                  );
                })
                : null}
            </fieldset>
          );
        return (
          <fieldset key={bloco.id} className="space-y-2">
            <legend className={classeLegenda(bloco.rotulo)}>
              {bloco.rotulo}
              {bloco.obrigatorio ? " *" : ""}
            </legend>
            {acervo.profissionais.map((p) => (
              <button
                key={p.id}
                type="button"
                className={classeEscolha}
                aria-pressed={valor === p.id}
                onClick={() => aoSelecionarProfissional(bloco, p.id)}
              >
                <AvatarProfissional
                  nome={p.nomeCompleto}
                  urlFoto={p.urlFotoPerfil}
                  tamanho="compacto"
                />
                <span>
                  <span className="block font-medium">{p.nomeCompleto}</span>
                  <span className="text-xs opacity-70">{p.cargoOuEspecialidade}</span>
                </span>
              </button>
            ))}
          </fieldset>
        );
      })}
    </div>
  );
}
