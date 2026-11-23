"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Botao } from "@/componentes/interface/Botao";
import { RevelacaoScroll } from "./RevelacaoScroll";
import {
  COMPRIMENTO_MINIMO_IDENTIFICADOR,
  ehIdentificadorPublicoValido,
  IDENTIFICADORES_RESERVADOS,
  normalizarSugestaoIdentificador,
} from "@/dominio/objetos-valor/identificadorPublico";
import type { RespostaVerificacaoIdentificador } from "@/app/api/identificadores/verificar/route";

type EstadoVerificacao =
  | { tipo: "ocioso" }
  | { tipo: "verificando" }
  | { tipo: "disponivel"; mensagem: string }
  | { tipo: "indisponivel"; mensagem: string };

/**
 * Chamada final com simulador de endereço público, validação de disponibilidade isolada (sem auth)
 * e botão sóbrio sem animações flutuantes/brilho no CTA.
 */
export function SecaoChamadaFinalEndereco() {
  const router = useRouter();
  const referenciaInput = useRef<HTMLInputElement>(null);
  const [entradaMarca, setEntradaMarca] = useState("");
  const [estadoVerificacao, setEstadoVerificacao] = useState<EstadoVerificacao>({ tipo: "ocioso" });

  const identificadorFormatado = normalizarSugestaoIdentificador(entradaMarca);

  // Verificação de disponibilidade com debounce de 500ms e pré-validação local
  useEffect(() => {
    // Se estiver vazio ou muito curto para validação
    if (!identificadorFormatado || identificadorFormatado.length < COMPRIMENTO_MINIMO_IDENTIFICADOR) {
      setEstadoVerificacao({ tipo: "ocioso" });
      return;
    }

    // Se a digitação atual for intermediária inválida (ex: termina com hífen 'sua-marca-')
    // ou não atender o formato do regex, não dispara requisição desnecessária à rede
    if (!ehIdentificadorPublicoValido(identificadorFormatado)) {
      setEstadoVerificacao({
        tipo: "indisponivel",
        mensagem: "Use apenas letras minúsculas, números e hífens entre palavras.",
      });
      return;
    }

    // Se for palavra reservada do sistema, resolve imediatamente no cliente sem chamada HTTP
    if (IDENTIFICADORES_RESERVADOS.has(identificadorFormatado)) {
      setEstadoVerificacao({
        tipo: "indisponivel",
        mensagem: "Este endereço é reservado pelo sistema.",
      });
      return;
    }

    setEstadoVerificacao({ tipo: "verificando" });
    const controlador = new AbortController();

    const temporizador = setTimeout(async () => {
      try {
        const resposta = await fetch(
          `/api/identificadores/verificar?slug=${encodeURIComponent(identificadorFormatado)}`,
          { signal: controlador.signal }
        );

        if (!resposta.ok) {
          throw new Error("Falha na consulta");
        }

        const dados: RespostaVerificacaoIdentificador = await resposta.json();

        if (dados.disponivel) {
          setEstadoVerificacao({
            tipo: "disponivel",
            mensagem: dados.mensagem,
          });
        } else {
          setEstadoVerificacao({
            tipo: "indisponivel",
            mensagem: dados.mensagem,
          });
        }
      } catch (erro: unknown) {
        if (erro instanceof DOMException && erro.name === "AbortError") {
          return;
        }
        setEstadoVerificacao({ tipo: "ocioso" });
      }
    }, 500);

    return () => {
      clearTimeout(temporizador);
      controlador.abort();
    };
  }, [identificadorFormatado]);

  function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    // Se o usuário digitou algo e não está disponível, bloqueia
    if (entradaPreenchida && estadoVerificacao.tipo !== "disponivel") {
      return;
    }

    const destino = identificadorFormatado
      ? `/criar-conta?identificador=${encodeURIComponent(identificadorFormatado)}`
      : "/criar-conta";
    router.push(destino);
  }

  const entradaPreenchida = entradaMarca.trim().length > 0;
  // Se preencheu algo, o botão só habilita quando estiver comprovadamente disponível.
  // Se estiver em branco, permanece habilitado para o fluxo direto de cadastro padrão.
  const podeSubmeter = !entradaPreenchida || estadoVerificacao.tipo === "disponivel";

  function focarInput() {
    referenciaInput.current?.focus();
  }

  return (
    <section
      aria-labelledby="titulo-chamada-final"
      className="bg-mineral-950 py-18 text-white lg:py-24"
    >
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <RevelacaoScroll>
          <h2
            id="titulo-chamada-final"
            className="text-3xl font-bold tracking-tight text-white sm:text-5xl"
          >
            Garanta o endereço da sua marca.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-neutral-400 sm:text-base">
            Monte grátis no modo rascunho e publique quando estiver pronto.
          </p>
        </RevelacaoScroll>

        <RevelacaoScroll atrasoSegundos={0.08}>
          <form
            onSubmit={aoSubmeter}
            className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="campo-identificador-home" className="sr-only">
              Escolha o endereço da sua marca no Nexo Ativo
            </label>
            <div
              onClick={focarInput}
              role="presentation"
              className="flex flex-1 cursor-text items-center rounded-md border border-white/20 bg-white/10 px-4 transition-colors focus-within:border-white focus-within:bg-white/15 hover:border-white/35"
            >
              <span className="shrink-0 text-sm font-medium text-neutral-400 select-none">
                nexoativo.com.br/
              </span>
              <input
                ref={referenciaInput}
                id="campo-identificador-home"
                type="text"
                value={entradaMarca}
                onChange={(evento) => setEntradaMarca(evento.target.value)}
                placeholder="sua-marca"
                autoComplete="off"
                className="min-h-12 w-full bg-transparent pl-0.5 text-sm font-semibold text-white placeholder:text-neutral-500 focus:outline-none"
              />
              {estadoVerificacao.tipo === "verificando" ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-neutral-400" />
              ) : null}
            </div>

            <Botao
              type="submit"
              variante="editorial_principal"
              tamanho="amplo"
              disabled={!podeSubmeter}
              className="group shrink-0 bg-white font-semibold text-mineral-950 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-neutral-400 disabled:shadow-none"
            >
              <span className="inline-flex items-center gap-2">
                Começar grátis
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-disabled:translate-x-0"
                  aria-hidden="true"
                />
              </span>
            </Botao>
          </form>

          {/* Feedback de validação discreto e elegante */}
          <div className="mt-3 min-h-6 text-xs transition-opacity duration-200">
            {estadoVerificacao.tipo === "disponivel" ? (
              <p className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{estadoVerificacao.mensagem}</span>
              </p>
            ) : estadoVerificacao.tipo === "indisponivel" ? (
              <p className="inline-flex items-center gap-1.5 font-medium text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{estadoVerificacao.mensagem}</span>
              </p>
            ) : identificadorFormatado ? (
              <p className="text-neutral-400">
                Prévia:{" "}
                <strong className="font-semibold text-white">
                  nexoativo.com.br/{identificadorFormatado}
                </strong>
              </p>
            ) : null}
          </div>
        </RevelacaoScroll>
      </div>
    </section>
  );
}
