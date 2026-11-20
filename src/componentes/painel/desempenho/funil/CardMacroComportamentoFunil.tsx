import type { ReactNode } from "react";
import { CheckCircle2, Eye, Layers } from "lucide-react";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesCardMacroComportamentoFunil {
  readonly visitas: number;
  readonly caminhosIniciados: number;
  readonly solicitacoesConcluidas: number;
  readonly rotuloVisitas?: string;
  readonly rotuloCaminhos?: string;
  readonly rotuloConclusoes?: string;
  readonly titulo?: string;
  readonly subtexto?: string;
  readonly acaoSuperior?: ReactNode;
  readonly className?: string;
}

function formatarNumeroPtBr(valor: number): string {
  return Number(valor || 0).toLocaleString("pt-BR");
}

export function CardMacroComportamentoFunil({
  visitas,
  caminhosIniciados,
  solicitacoesConcluidas,
  rotuloVisitas = "Visitas",
  rotuloCaminhos = "Caminhos iniciados",
  rotuloConclusoes = "Solicitações concluídas",
  titulo,
  subtexto,
  acaoSuperior,
  className,
}: PropriedadesCardMacroComportamentoFunil) {
  return (
    <div
      className={combinarClasses(
        "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all sm:p-7",
        className,
      )}
    >
      {/* Cabeçalho Opcional do Card */}
      {titulo || acaoSuperior ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            {titulo ? (
              <h4 className="text-sm font-bold tracking-tight text-mineral-950 sm:text-base">
                {titulo}
              </h4>
            ) : null}
            {subtexto ? (
              <p className="mt-0.5 text-xs text-mineral-500">{subtexto}</p>
            ) : null}
          </div>
          {acaoSuperior ? <div>{acaoSuperior}</div> : null}
        </div>
      ) : null}

      {/* Estrutura Bipartida (Funil à esquerda, Métricas à direita) */}
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-8">
        {/* Lado Esquerdo: Funil Tonal Geométrico */}
        <div className="flex flex-col items-center justify-center py-2">
          <div
            aria-label="Representação visual do funil de conversão"
            role="img"
            className="relative h-[172px] w-[260px] select-none"
          >
            {/* SVG Vetorial de Fundo das Camadas */}
            <svg
              viewBox="0 0 260 172"
              className="absolute inset-0 h-full w-full drop-shadow-2xs"
              aria-hidden="true"
            >
              {/* Nível 1: Visitas (Índigo) */}
              <path
                d="M 30,4 L 230,4 Q 244,4 239,18 L 222,46 Q 218,54 210,54 L 50,54 Q 42,54 38,46 L 21,18 Q 16,4 30,4 Z"
                fill="#4F46E5"
              />
              {/* Nível 2: Caminhos iniciados (Azul Celeste) */}
              <path
                d="M 56,60 L 204,60 Q 216,60 211,72 L 194,102 Q 190,110 182,110 L 78,110 Q 70,110 66,102 L 49,72 Q 44,60 56,60 Z"
                fill="#0284C7"
              />
              {/* Nível 3: Solicitações Concluídas (Esmeralda) */}
              <path
                d="M 84,116 L 176,116 Q 188,116 183,128 L 168,154 Q 163,166 150,166 L 110,166 Q 97,166 92,154 L 77,128 Q 72,116 84,116 Z"
                fill="#10B981"
              />
            </svg>

            {/* Conteúdo Sobreposto: Nível 1 */}
            <div className="absolute inset-x-0 top-[4px] flex h-[50px] items-center justify-center gap-2.5 text-white">
              <Eye className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              <span className="font-bold tabular-nums text-sm">
                {formatarNumeroPtBr(visitas)}
              </span>
            </div>

            {/* Conteúdo Sobreposto: Nível 2 */}
            <div className="absolute inset-x-0 top-[60px] flex h-[50px] items-center justify-center gap-2.5 text-white">
              <Layers className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              <span className="font-bold tabular-nums text-sm">
                {formatarNumeroPtBr(caminhosIniciados)}
              </span>
            </div>

            {/* Conteúdo Sobreposto: Nível 3 */}
            <div className="absolute inset-x-0 top-[116px] flex h-[50px] items-center justify-center gap-2.5 text-white">
              <CheckCircle2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              <span className="font-bold tabular-nums text-sm">
                {formatarNumeroPtBr(solicitacoesConcluidas)}
              </span>
            </div>
          </div>
        </div>

        {/* Lado Direito: Métricas Tabulares com Divisores Finos */}
        <div className="flex flex-col justify-center border-t border-slate-100 pt-4 md:border-t-0 md:border-l md:border-slate-100 md:pl-8 md:pt-0">
          <dl className="divide-y divide-slate-100">
            {/* Linha 1: Visitas */}
            <div className="flex items-center justify-between pb-3.5">
              <dt className="flex items-center gap-3 text-mineral-700">
                <Eye className="h-4 w-4 text-mineral-800" strokeWidth={1.8} aria-hidden="true" />
                <span className="text-sm font-medium">{rotuloVisitas}</span>
              </dt>
              <dd className="text-base font-bold tabular-nums text-mineral-950 sm:text-lg">
                {formatarNumeroPtBr(visitas)}
              </dd>
            </div>

            {/* Linha 2: Caminhos iniciados */}
            <div className="flex items-center justify-between py-3.5">
              <dt className="flex items-center gap-3 text-mineral-700">
                <Layers className="h-4 w-4 text-mineral-800" strokeWidth={1.8} aria-hidden="true" />
                <span className="text-sm font-medium">{rotuloCaminhos}</span>
              </dt>
              <dd className="text-base font-bold tabular-nums text-mineral-950 sm:text-lg">
                {formatarNumeroPtBr(caminhosIniciados)}
              </dd>
            </div>

            {/* Linha 3: Solicitações concluídas */}
            <div className="flex items-center justify-between pt-3.5">
              <dt className="flex items-center gap-3 text-mineral-700">
                <CheckCircle2
                  className="h-4 w-4 text-mineral-800"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">{rotuloConclusoes}</span>
              </dt>
              <dd className="text-base font-bold tabular-nums text-mineral-950 sm:text-lg">
                {formatarNumeroPtBr(solicitacoesConcluidas)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

