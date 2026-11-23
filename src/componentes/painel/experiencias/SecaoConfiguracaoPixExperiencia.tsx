"use client";

import { AvisoRecursoRestrito } from "@/componentes/painel/AvisosPublicidade";
import { CampoFormulario } from "@/componentes/interface/CampoFormulario";
import type { DefinicaoMicrofluxo, EtapaMicrofluxo } from "@/dominio/microfluxos/tiposMicrofluxo";

export function sincronizarEtapaPixManualNoGrafo(
  etapasAtuais: readonly EtapaMicrofluxo[],
  habilitarPix: boolean,
  dadosPix: {
    readonly chavePix: string;
    readonly nomeRecebedor: string;
    readonly valorReferenciaTexto: string;
    readonly instrucaoComprovante: string;
  },
): readonly EtapaMicrofluxo[] {
  const idPix = "etapa-pix-manual";
  const semPix = etapasAtuais.filter(
    (e) => e.id !== idPix && e.tipoEtapa !== "instrucao_pix_manual",
  );
  const etapaContato =
    semPix.find((e) => e.tipoEtapa === "coleta_contato") ?? semPix[semPix.length - 1];

  if (!etapaContato) {
    return etapasAtuais;
  }

  if (!habilitarPix) {
    return semPix.map((etapa) => {
      if (etapa.proximaEtapaPadraoId === idPix) {
        return {
          ...etapa,
          proximaEtapaPadraoId: etapaContato.id,
        };
      }
      return etapa;
    });
  }

  const novaEtapaPix: EtapaMicrofluxo = {
    id: idPix,
    tipoEtapa: "instrucao_pix_manual",
    titulo: "Sinal ou pagamento via Pix direto",
    subtituloOpcional: "Transfira diretamente para a chave Pix oficial do estabelecimento.",
    obrigatoria: false,
    proximaEtapaPadraoId: etapaContato.id,
    configuracaoPixManual: {
      chavePix: dadosPix.chavePix.trim(),
      nomeRecebedor: dadosPix.nomeRecebedor.trim(),
      ...(dadosPix.valorReferenciaTexto.trim()
        ? { valorReferenciaTexto: dadosPix.valorReferenciaTexto.trim() }
        : {}),
      instrucaoComprovante:
        dadosPix.instrucaoComprovante.trim() ||
        "Apresente ou envie o comprovante após concluir sua solicitação.",
    },
  };

  const reconectadas = semPix.map((etapa) => {
    if (etapa.id !== etapaContato.id && etapa.proximaEtapaPadraoId === etapaContato.id) {
      return {
        ...etapa,
        proximaEtapaPadraoId: idPix,
      };
    }
    return etapa;
  });

  const indiceContato = reconectadas.findIndex((e) => e.id === etapaContato.id);
  return [
    ...reconectadas.slice(0, indiceContato),
    novaEtapaPix,
    ...reconectadas.slice(indiceContato),
  ];
}

export interface PropriedadesSecaoConfiguracaoPixExperiencia {
  readonly fluxoAtual: DefinicaoMicrofluxo;
  readonly identificadorPublico: string;
  readonly podeAlterar: boolean;
  readonly permitePixManual: boolean;
  readonly aoAtualizarFluxo: (atualizador: (atual: DefinicaoMicrofluxo) => DefinicaoMicrofluxo) => void;
  readonly aoAtualizarEtapa: (
    etapaId: string,
    atualizador: (etapa: EtapaMicrofluxo) => EtapaMicrofluxo,
  ) => void;
}

export function SecaoConfiguracaoPixExperiencia({
  fluxoAtual,
  identificadorPublico,
  podeAlterar,
  permitePixManual,
  aoAtualizarFluxo,
  aoAtualizarEtapa,
}: PropriedadesSecaoConfiguracaoPixExperiencia) {
  const etapaPixExistente = fluxoAtual.etapas.find((e) => e.tipoEtapa === "instrucao_pix_manual");

  return (
    <details className="rounded-2xl border border-marfim-200 bg-white p-5 text-xs text-mineral-700 shadow-xs">
      <summary className="cursor-pointer font-semibold text-mineral-900">
        Configurações Adicionais (Instrução Pix e Cálculo Comercial)
      </summary>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-marfim-200 bg-marfim-50/50 p-3.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-mineral-900">Instrução de Pix Manual</span>
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-mineral-800">
              <input
                type="checkbox"
                aria-label="Incluir instrução de Pix manual"
                checked={Boolean(etapaPixExistente)}
                disabled={!podeAlterar || !permitePixManual}
                onChange={(e) => {
                  const habilitar = e.target.checked;
                  aoAtualizarFluxo((atual) => ({
                    ...atual,
                    etapas: sincronizarEtapaPixManualNoGrafo(atual.etapas, habilitar, {
                      chavePix:
                        etapaPixExistente?.configuracaoPixManual?.chavePix ??
                        "contato@estabelecimento.com.br",
                      nomeRecebedor:
                        etapaPixExistente?.configuracaoPixManual?.nomeRecebedor ??
                        identificadorPublico,
                      valorReferenciaTexto:
                        etapaPixExistente?.configuracaoPixManual?.valorReferenciaTexto ?? "",
                      instrucaoComprovante:
                        etapaPixExistente?.configuracaoPixManual?.instrucaoComprovante ??
                        "Envie o comprovante pelo WhatsApp após finalizar sua solicitação.",
                    }),
                  }));
                }}
                className="h-3.5 w-3.5 rounded border-marfim-300 text-mineral-900"
              />
              <span>Habilitar Pix Direto</span>
            </label>
          </div>

          {!permitePixManual ? (
            <AvisoRecursoRestrito mensagem="instruções de Pix não podem ser publicadas. Remova a etapa de Pix para publicar." />
          ) : null}

          {etapaPixExistente?.configuracaoPixManual ? (
            <div className="space-y-2">
              <CampoFormulario
                id="pix-manual-chave"
                rotulo="Chave Pix (CNPJ, e-mail, celular ou aleatória)"
                value={etapaPixExistente.configuracaoPixManual.chavePix}
                disabled={!podeAlterar}
                onChange={(e) =>
                  aoAtualizarEtapa(etapaPixExistente.id, (atual) => ({
                    ...atual,
                    configuracaoPixManual: {
                      ...atual.configuracaoPixManual!,
                      chavePix: e.target.value,
                    },
                  }))
                }
              />

              <CampoFormulario
                id="pix-manual-recebedor"
                rotulo="Nome do favorecido"
                value={etapaPixExistente.configuracaoPixManual.nomeRecebedor}
                disabled={!podeAlterar}
                onChange={(e) =>
                  aoAtualizarEtapa(etapaPixExistente.id, (atual) => ({
                    ...atual,
                    configuracaoPixManual: {
                      ...atual.configuracaoPixManual!,
                      nomeRecebedor: e.target.value,
                    },
                  }))
                }
              />
            </div>
          ) : (
            <p className="text-[11px] text-mineral-600">
              Você também pode adicionar uma caixa de Pix diretamente pelo Editor Visual acima.
            </p>
          )}
        </div>
      </div>
    </details>
  );
}

