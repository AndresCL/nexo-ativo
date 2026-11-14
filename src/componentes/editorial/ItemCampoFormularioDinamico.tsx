"use client";
import { Check } from "lucide-react";
import type { CampoUniversalFormulario } from "@/dominio/microfluxos/tiposMicrofluxo";
import type { ValorCampoDinamico } from "@/dominio/microfluxos/motorExecucaoMicrofluxo";
import { combinarClasses } from "@/utilitarios/combinarClasses";
interface PropriedadesItemCampoDinamico {
  readonly campo: CampoUniversalFormulario;
  readonly ocultarRotulo?: boolean;
  readonly valor: ValorCampoDinamico | undefined;
  readonly aoMudar: (novoValor: ValorCampoDinamico) => void;
}

export function ItemCampoFormularioDinamico({
  campo,
  ocultarRotulo = false,
  valor,
  aoMudar,
}: PropriedadesItemCampoDinamico) {
  const idCampo = `campo-dinamico-${campo.id}`;

  return (
    <div className="space-y-1.5 text-left">
      <label
        htmlFor={idCampo}
        className={
          ocultarRotulo ? "sr-only" : "block text-xs font-medium text-[var(--editorial-texto)]"
        }
      >
        {campo.rotulo}
        {campo.obrigatorio ? <span className="ml-1 text-red-500">*</span> : null}
      </label>

      {campo.tipo === "texto_curto" ? (
        <input
          id={idCampo}
          type="text"
          placeholder={campo.placeholder ?? ""}
          value={typeof valor === "string" ? valor : ""}
          onChange={(e) => aoMudar(e.target.value)}
          className="w-full rounded-md border border-current/20 bg-[var(--editorial-superficie)] px-3.5 py-2.5 text-sm text-[var(--editorial-texto)] placeholder:text-[var(--editorial-texto-secundario)]/60 focus:border-[var(--editorial-destaque)] focus:outline-none"
        />
      ) : null}

      {campo.tipo === "texto_longo" ? (
        <textarea
          id={idCampo}
          rows={3}
          placeholder={campo.placeholder ?? ""}
          value={typeof valor === "string" ? valor : ""}
          onChange={(e) => aoMudar(e.target.value)}
          className="w-full rounded-md border border-current/20 bg-[var(--editorial-superficie)] px-3.5 py-2.5 text-sm text-[var(--editorial-texto)] placeholder:text-[var(--editorial-texto-secundario)]/60 focus:border-[var(--editorial-destaque)] focus:outline-none"
        />
      ) : null}

      {campo.tipo === "numero" ? (
        <div className="relative flex items-center">
          <input
            id={idCampo}
            type="number"
            placeholder={campo.placeholder ?? "0"}
            value={valor !== undefined && valor !== null ? String(valor) : ""}
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Number(e.target.value);
              aoMudar(val);
            }}
            className="w-full rounded-md border border-current/20 bg-[var(--editorial-superficie)] px-3.5 py-2.5 pr-14 text-sm text-[var(--editorial-texto)] placeholder:text-[var(--editorial-texto-secundario)]/60 focus:border-[var(--editorial-destaque)] focus:outline-none"
          />
          {campo.sufixoVisual ? (
            <span className="pointer-events-none absolute right-3 rounded-xs bg-current/10 px-1.5 py-0.5 text-[11px] font-semibold tracking-wider text-[var(--editorial-texto-secundario)] uppercase">
              {campo.sufixoVisual}
            </span>
          ) : null}
        </div>
      ) : null}

      {campo.tipo === "moeda" ? (
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-3 text-xs font-semibold text-[var(--editorial-texto-secundario)]">
            R$
          </span>
          <input
            id={idCampo}
            type="text"
            inputMode="numeric"
            placeholder={campo.placeholder ?? "0,00"}
            value={typeof valor === "string" ? valor : ""}
            onChange={(e) => {
              const digitos = e.target.value.replace(/\D/g, "");
              if (!digitos) {
                aoMudar("");
                return;
              }
              const centavos = parseInt(digitos, 10);
              const formatado = (centavos / 100).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
              aoMudar(formatado);
            }}
            className="w-full rounded-md border border-current/20 bg-[var(--editorial-superficie)] pl-10 pr-3.5 py-2.5 text-sm text-[var(--editorial-texto)] placeholder:text-[var(--editorial-texto-secundario)]/60 focus:border-[var(--editorial-destaque)] focus:outline-none"
          />
        </div>
      ) : null}

      {campo.tipo === "data" ? (
        <input
          id={idCampo}
          type="date"
          value={typeof valor === "string" ? valor : ""}
          onChange={(e) => aoMudar(e.target.value)}
          className="w-full rounded-md border border-current/20 bg-[var(--editorial-superficie)] px-3.5 py-2.5 text-sm text-[var(--editorial-texto)] focus:border-[var(--editorial-destaque)] focus:outline-none"
        />
      ) : null}

      {campo.tipo === "email" ? (
        <input
          id={idCampo}
          type="email"
          placeholder={campo.placeholder ?? "nome@exemplo.com"}
          value={typeof valor === "string" ? valor : ""}
          onChange={(e) => aoMudar(e.target.value)}
          className="w-full rounded-md border border-current/20 bg-[var(--editorial-superficie)] px-3.5 py-2.5 text-sm text-[var(--editorial-texto)] placeholder:text-[var(--editorial-texto-secundario)]/60 focus:border-[var(--editorial-destaque)] focus:outline-none"
        />
      ) : null}

      {campo.tipo === "telefone" ? (
        <input
          id={idCampo}
          type="tel"
          placeholder={campo.placeholder ?? "(11) 99999-9999"}
          value={typeof valor === "string" ? valor : ""}
          onChange={(e) => aoMudar(e.target.value)}
          className="w-full rounded-md border border-current/20 bg-[var(--editorial-superficie)] px-3.5 py-2.5 text-sm text-[var(--editorial-texto)] placeholder:text-[var(--editorial-texto-secundario)]/60 focus:border-[var(--editorial-destaque)] focus:outline-none"
        />
      ) : null}

      {campo.tipo === "booleano" ? (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => aoMudar(true)}
            className={combinarClasses(
              "flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-all",
              valor === true
                ? "border-[var(--editorial-destaque)] bg-[var(--editorial-destaque)]/10 text-[var(--editorial-destaque)] font-semibold shadow-xs"
                : "border-current/20 bg-[var(--editorial-superficie)] text-[var(--editorial-texto)] hover:border-current/40",
            )}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => aoMudar(false)}
            className={combinarClasses(
              "flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-all",
              valor === false
                ? "border-[var(--editorial-destaque)] bg-[var(--editorial-destaque)]/10 text-[var(--editorial-destaque)] font-semibold shadow-xs"
                : "border-current/20 bg-[var(--editorial-superficie)] text-[var(--editorial-texto)] hover:border-current/40",
            )}
          >
            Não
          </button>
        </div>
      ) : null}

      {campo.tipo === "selecao_unica" ? (
        <div className="space-y-1.5 pt-1">
          {campo.opcoesCustomizadas?.map((opcao) => {
            const selecionada = valor === opcao;
            return (
              <button
                key={opcao}
                type="button"
                onClick={() => aoMudar(opcao)}
                className={combinarClasses(
                  "flex w-full items-center justify-between rounded-md border px-3.5 py-2.5 text-left text-xs transition-all",
                  selecionada
                    ? "border-[var(--editorial-destaque)] bg-[var(--editorial-destaque)]/10 font-semibold text-[var(--editorial-destaque)] shadow-xs"
                    : "border-current/15 bg-[var(--editorial-superficie)] text-[var(--editorial-texto)] hover:border-current/30",
                )}
              >
                <span>{opcao}</span>
                {selecionada ? <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {campo.tipo === "selecao_multipla" ? (
        <div className="space-y-1.5 pt-1">
          {campo.opcoesCustomizadas?.map((opcao) => {
            const arr = Array.isArray(valor) ? (valor as readonly string[]) : [];
            const selecionada = arr.includes(opcao);
            return (
              <button
                key={opcao}
                type="button"
                onClick={() => {
                  const novo = selecionada ? arr.filter((x) => x !== opcao) : [...arr, opcao];
                  aoMudar(novo);
                }}
                className={combinarClasses(
                  "flex w-full items-center justify-between rounded-md border px-3.5 py-2.5 text-left text-xs transition-all",
                  selecionada
                    ? "border-[var(--editorial-destaque)] bg-[var(--editorial-destaque)]/10 font-semibold text-[var(--editorial-destaque)] shadow-xs"
                    : "border-current/15 bg-[var(--editorial-superficie)] text-[var(--editorial-texto)] hover:border-current/30",
                )}
              >
                <span>{opcao}</span>
                {selecionada ? <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
