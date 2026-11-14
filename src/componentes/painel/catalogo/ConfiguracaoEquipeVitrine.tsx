import { useId } from "react";
import type { PosicionamentoEquipeVitrine } from "@/dominio/editorial/posicionamentoEquipeVitrine";
import { resolverPosicionamentoEquipe } from "@/dominio/editorial/posicionamentoEquipeVitrine";

export function ConfiguracaoEquipeVitrine({
  valor,
  aoAlterar,
  disabled,
  quantidadeProfissionais,
  limiteAvatares,
  aoAlterarLimiteAvatares,
}: {
  readonly valor?: PosicionamentoEquipeVitrine;
  readonly aoAlterar: (valor: PosicionamentoEquipeVitrine) => void;
  readonly disabled: boolean;
  readonly quantidadeProfissionais?: number;
  readonly limiteAvatares?: number | null;
  readonly aoAlterarLimiteAvatares: (limite: number | null) => void;
}) {
  const idAjudaLimite = useId();
  const posicao = resolverPosicionamentoEquipe(valor);
  const classes =
    "mt-1 min-h-10 w-full rounded-md border border-marfim-300 bg-white px-3 text-sm text-mineral-950 focus-visible:outline-2 focus-visible:outline-mineral-700";

  return (
    <div className="space-y-3 rounded-lg border border-marfim-200 bg-marfim-50/70 p-3">
      <p className="text-xs leading-relaxed text-mineral-600">
        O título livre aparece com os avatares da equipe. Ao tocar no conjunto, o visitante abre a
        lista completa de integrantes.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-mineral-700">
          Posição no desktop
          <select
            value={posicao.desktop}
            disabled={disabled}
            className={classes}
            onChange={(e) =>
              aoAlterar({
                ...valor,
                desktop: e.target.value as NonNullable<PosicionamentoEquipeVitrine["desktop"]>,
              })
            }
          >
            <option value="lista_acoes">No lugar definido na lista de ações</option>
            <option value="abaixo_hero">Abaixo do texto do hero</option>
          </select>
        </label>
        <label className="text-xs font-medium text-mineral-700">
          Posição no celular
          <select
            value={posicao.mobile}
            disabled={disabled}
            className={classes}
            onChange={(e) =>
              aoAlterar({
                ...valor,
                mobile: e.target.value as NonNullable<PosicionamentoEquipeVitrine["mobile"]>,
              })
            }
          >
            <option value="lista_acoes">No lugar definido na lista de ações</option>
            <option value="antes_acoes">Acima do primeiro botão</option>
          </select>
        </label>
      </div>
      <div className="max-w-xs space-y-1.5">
        <label className="block text-xs font-medium text-mineral-700">
          Limite de avatares (opcional)
          <input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={limiteAvatares ?? ""}
            placeholder="Mostrar todos"
            disabled={disabled}
            aria-describedby={idAjudaLimite}
            className={classes}
            onChange={(evento) =>
              aoAlterarLimiteAvatares(
                evento.target.value === "" ? null : evento.target.valueAsNumber,
              )
            }
          />
        </label>
        <p id={idAjudaLimite} className="text-xs leading-relaxed text-mineral-600">
          Deixe vazio para mostrar todos. Com um limite, os demais integrantes aparecem no contador
          +N.
        </p>
      </div>
      {quantidadeProfissionais === 0 ? (
        <p className="text-xs text-mineral-600">
          Cadastre e ative integrantes em Equipe. O convite aparecerá na vitrine quando houver uma
          equipe publicada.
        </p>
      ) : null}
    </div>
  );
}
