"use client";

import { FileText } from "lucide-react";
import type { CobrancaHistoricoAsaas } from "@/dominio/assinaturas/tiposAssinaturaAsaas";
import type { SituacaoResumoAssinatura } from "@/dominio/entidades/autenticacaoEOrganizacao";
import { ValorMonetarioCentavos } from "@/dominio/objetos-valor/valorMonetarioCentavos";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { combinarClasses } from "@/utilitarios/combinarClasses";

export interface PropriedadesTabelaHistoricoCobrancas {
  readonly cobrancas: readonly CobrancaHistoricoAsaas[];
  readonly situacaoAssinatura?: SituacaoResumoAssinatura;
}

function formatarData(dataIso: string): string {
  return dataIso.replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, "$3/$2/$1");
}

const ROTULOS_FORMA_PAGAMENTO: Readonly<Record<string, string>> = {
  BOLETO: "Boleto",
  CREDIT_CARD: "Cartão de crédito",
  PIX: "Pix",
  UNDEFINED: "A definir",
};

function obterDescritorSituacao(
  cob: CobrancaHistoricoAsaas,
  situacaoAssinatura?: SituacaoResumoAssinatura,
): { rotulo: string; classe: string; podeVisualizar: boolean } {
  const hojeIso = new Date().toISOString().slice(0, 10);
  const dataVencimento = cob.dataVencimentoIso.slice(0, 10);
  const ehVencimentoFuturo = dataVencimento > hojeIso;

  if (
    cob.situacao === "CANCELLED" ||
    (cob.situacao === "PENDING" && situacaoAssinatura === "cancelada" && ehVencimentoFuturo)
  ) {
    return {
      rotulo: "Cancelada",
      classe: "border-slate-200 bg-slate-100 text-mineral-600",
      podeVisualizar: false,
    };
  }

  if (cob.situacao === "PENDING" && situacaoAssinatura === "ativa" && ehVencimentoFuturo) {
    return {
      rotulo: "Próximo ciclo",
      classe: "border-sky-200 bg-sky-50 text-sky-800",
      podeVisualizar: Boolean(cob.urlFaturaOuComprovante),
    };
  }

  if (["RECEIVED", "CONFIRMED", "DUNNING_RECEIVED"].includes(cob.situacao)) {
    return {
      rotulo: "Paga",
      classe: "border-emerald-200 bg-emerald-50 text-emerald-800",
      podeVisualizar: Boolean(cob.urlFaturaOuComprovante),
    };
  }

  if (["OVERDUE", "DUNNING_REQUESTED", "CHARGEBACK_REQUESTED", "CHARGEBACK_DISPUTE"].includes(cob.situacao)) {
    return {
      rotulo: "Vencida",
      classe: "border-red-200 bg-red-50 text-red-800",
      podeVisualizar: Boolean(cob.urlFaturaOuComprovante),
    };
  }

  if (cob.situacao === "PENDING") {
    return {
      rotulo: "Pendente",
      classe: "border-amber-200 bg-amber-50 text-amber-800",
      podeVisualizar: Boolean(cob.urlFaturaOuComprovante),
    };
  }

  return {
    rotulo: cob.situacao,
    classe: "border-slate-200 bg-slate-50 text-mineral-700",
    podeVisualizar: Boolean(cob.urlFaturaOuComprovante),
  };
}

export function TabelaHistoricoCobrancas({
  cobrancas,
  situacaoAssinatura,
}: PropriedadesTabelaHistoricoCobrancas) {
  const hojeIso = new Date().toISOString().slice(0, 10);
  const cobrancasReais = cobrancas.filter(
    (cob) => !(cob.situacao === "CANCELLED" && cob.dataVencimentoIso.slice(0, 10) > hojeIso),
  );

  return (
    <section aria-labelledby="titulo-historico-cobrancas" className="space-y-4">
      <div>
        <h2 id="titulo-historico-cobrancas" className="text-base font-semibold text-mineral-950">
          Histórico de Faturas e Cobranças
        </h2>
        <p className="mt-1 text-xs text-mineral-500">
          Acesse os comprovantes e faturas geradas.
        </p>
      </div>

      {cobrancasReais.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold text-mineral-600">
              <tr>
                <th scope="col" className="px-4 py-3">Vencimento</th>
                <th scope="col" className="px-4 py-3">Valor</th>
                <th scope="col" className="px-4 py-3">Forma</th>
                <th scope="col" className="px-4 py-3">Situação</th>
                <th scope="col" className="px-4 py-3 text-right">Comprovante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {cobrancasReais.map((cob) => {
                const descritor = obterDescritorSituacao(cob, situacaoAssinatura);

                return (
                  <tr key={cob.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-mineral-900">
                      {formatarData(cob.dataVencimentoIso)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-mineral-950">
                      {ValorMonetarioCentavos.deCentavos(cob.valorCentavos).formatarMoedaBrasileira()}
                    </td>
                    <td className="px-4 py-3 text-mineral-700">
                      {ROTULOS_FORMA_PAGAMENTO[cob.formaPagamento] ?? cob.formaPagamento}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={combinarClasses(
                          "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          descritor.classe,
                        )}
                      >
                        {descritor.rotulo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {descritor.podeVisualizar && cob.urlFaturaOuComprovante ? (
                        <a
                          href={cob.urlFaturaOuComprovante}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-9 items-center rounded-lg px-2 font-semibold text-indigo-700 hover:bg-indigo-50"
                        >
                          Visualizar
                        </a>
                      ) : (
                        <span className="text-mineral-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <CartaoSuperficie className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border-dashed text-center shadow-none">
          <FileText className="h-7 w-7 text-indigo-300" aria-hidden="true" />
          <p className="text-sm font-semibold text-mineral-900">Nenhuma cobrança registrada</p>
          <p className="text-xs text-mineral-500">As faturas e comprovantes aparecerão aqui.</p>
        </CartaoSuperficie>
      )}
    </section>
  );
}
