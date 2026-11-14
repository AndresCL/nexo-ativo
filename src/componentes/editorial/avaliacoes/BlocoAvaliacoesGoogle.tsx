"use client";

import { useRef, useState } from "react";
import type { ConteudoPaginaPublicada } from "@/dominio/entidades/paginaPublicada";
import { construirUrlLocalGoogle } from "@/dominio/entidades/avaliacoesGoogle";
import type {
  OrigemConsultaAvaliacoesGoogle,
  PortaAvaliacoesGoogleCliente,
} from "@/aplicacao/portas/portasAvaliacoesGoogle";
import { useAvaliacoesGoogle } from "@/ganchos/usarAvaliacoesGoogle";
import { PainelEditorialPublico } from "../PainelEditorialPublico";
import { AtribuicaoGoogleMaps } from "./AtribuicaoGoogleMaps";
import { CartaoAvaliacaoGoogle } from "./CartaoAvaliacaoGoogle";
import { CarrosselAvaliacoesGoogle } from "./CarrosselAvaliacoesGoogle";

export function BlocoAvaliacoesGoogle({
  pagina,
  previa = false,
  servico,
}: {
  readonly pagina: ConteudoPaginaPublicada;
  readonly previa?: boolean;
  readonly servico?: PortaAvaliacoesGoogleCliente;
}) {
  const configuracao = pagina.avaliacoesGoogle;
  const identificadorLocal = configuracao?.habilitado ? configuracao.identificadorLocal : undefined;
  const origem: OrigemConsultaAvaliacoesGoogle | undefined = !identificadorLocal
    ? undefined
    : previa
      ? { tipo: "previa", organizacaoId: pagina.organizacaoId, identificadorLocal }
      : { tipo: "publicada", identificadorPublico: pagina.identificadorPublico };
  const { dados, erro, carregando, definirElemento } = useAvaliacoesGoogle(origem, servico);
  const [aberto, alterarAbertura] = useState(false);
  const referenciaBotao = useRef<HTMLButtonElement>(null);
  if (!identificadorLocal || (dados?.totalAvaliacoes === 0 && !previa)) return null;
  const url = dados?.urlGoogleMaps ?? construirUrlLocalGoogle(identificadorLocal);

  return (
    <div ref={definirElemento} className="mt-5 max-w-xl text-left" aria-busy={carregando}>
      {carregando ? (
        <p role="status" className="text-xs text-[var(--editorial-texto-secundario)]">
          Consultando avaliações…
        </p>
      ) : null}
      {erro ? (
        <div className="text-xs">
          {previa ? <p role="alert">{erro}</p> : null}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center underline underline-offset-4"
          >
            Ver avaliações no Google
          </a>
        </div>
      ) : null}
      {dados?.totalAvaliacoes === 0 && previa ? (
        <p className="text-xs">Este estabelecimento ainda não tem avaliações.</p>
      ) : null}
      {dados && dados.totalAvaliacoes > 0 ? (
        <>
          <button
            ref={referenciaBotao}
            type="button"
            onClick={() => alterarAbertura(true)}
            aria-haspopup="dialog"
            className="inline-flex min-h-11 flex-wrap items-center gap-2 rounded-lg border border-current/25 bg-[var(--editorial-superficie)]/90 px-4 py-2 text-sm text-[var(--editorial-texto)] focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {dados.notaMedia !== undefined ? (
              <span aria-label={`${dados.notaMedia.toLocaleString("pt-BR")} de 5 estrelas`}>
                ★ {dados.notaMedia.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
              </span>
            ) : null}
            <span>
              · {dados.totalAvaliacoes.toLocaleString("pt-BR")}{" "}
              {dados.totalAvaliacoes === 1 ? "avaliação" : "avaliações"} no Google
            </span>
            <span className="text-xs underline underline-offset-4">Ver avaliações</span>
          </button>
          {configuracao?.modoExibicao === "carrossel" ? (
            <CarrosselAvaliacoesGoogle key={identificadorLocal} avaliacoes={dados.avaliacoes} />
          ) : null}
          <AtribuicaoGoogleMaps url={url} atribuicoes={dados.atribuicoes} />
          <PainelEditorialPublico
            pagina={pagina}
            titulo="Avaliações no Google"
            aberto={aberto}
            aoAlterarAbertura={alterarAbertura}
            referenciaRetornoFoco={referenciaBotao}
          >
            <div className="mt-5 space-y-4">
              <p className="text-sm">
                {dados.nome} · {dados.endereco}
              </p>
              <p className="text-xs text-[var(--editorial-texto-secundario)]">
                Seleção de avaliações por relevância fornecida pelo Google.
              </p>
              {dados.avaliacoes.map((avaliacao) => (
                <CartaoAvaliacaoGoogle key={avaliacao.id} avaliacao={avaliacao} />
              ))}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
              >
                Ver todas no Google
              </a>
              <AtribuicaoGoogleMaps url={url} atribuicoes={dados.atribuicoes} />
            </div>
          </PainelEditorialPublico>
        </>
      ) : null}
    </div>
  );
}
