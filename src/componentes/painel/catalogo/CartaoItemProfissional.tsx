import Imagem from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Mail,
  Phone,
  QrCode,
  Trash2,
} from "lucide-react";
import type { ProfissionalEquipe } from "@/dominio/entidades/catalogoConteudo";
import { construirUrlPublicaCartaoProfissional } from "@/dominio/entidades/catalogoConteudo";
import { Botao } from "@/componentes/interface/Botao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";
import { ExibicaoQrCodeEditorial } from "@/componentes/editorial/ExibicaoQrCodeEditorial";
import { combinarClasses } from "@/utilitarios/combinarClasses";
import { separarDdiENumero } from "@/dominio/servicos/numeroWhatsappInternacional";

export interface PropriedadesCartaoItemProfissional {
  readonly profissional: ProfissionalEquipe;
  readonly identificadorPublico: string;
  readonly urlBasePublica: string;
  readonly estaEmEdicao: boolean;
  readonly qrAberto: boolean;
  readonly confirmandoExclusao: boolean;
  readonly excluindo: boolean;
  readonly alterandoVisibilidade: boolean;
  readonly podeEditar: boolean;
  readonly ocupado: boolean;
  readonly temPaginaPublicada: boolean;
  readonly onAlternarQr: () => void;
  readonly onEditar: () => void;
  readonly onAlternarVisibilidade: () => void;
  readonly onSolicitarExclusao: () => void;
  readonly onCancelarExclusao: () => void;
  readonly onConfirmarExclusao: () => void;
}

export function CartaoItemProfissional({
  profissional,
  identificadorPublico,
  urlBasePublica,
  estaEmEdicao,
  qrAberto,
  confirmandoExclusao,
  excluindo,
  alterandoVisibilidade,
  podeEditar,
  ocupado,
  temPaginaPublicada,
  onAlternarQr,
  onEditar,
  onAlternarVisibilidade,
  onSolicitarExclusao,
  onCancelarExclusao,
  onConfirmarExclusao,
}: PropriedadesCartaoItemProfissional) {
  const urlCartao = construirUrlPublicaCartaoProfissional({
    urlBasePublica,
    identificadorOrganizacao: identificadorPublico,
    identificadorCartao: profissional.identificadorCartao,
  });

  return (
    <CartaoSuperficie
      className={combinarClasses(
        "min-w-0 space-y-3.5 overflow-hidden rounded-2xl p-4 shadow-2xs transition-colors sm:p-5",
        estaEmEdicao ? "border-indigo-300 ring-2 ring-indigo-100 bg-indigo-50/20" : "border-marfim-200 bg-white",
      )}
    >
      {/* Topo: Foto + Identificação Principal + Status */}
      <div className="flex items-start gap-3.5">
        <RetratoProfissional profissional={profissional} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-mineral-950 sm:text-base">
                {profissional.nomeCompleto}
              </h3>
              <p className="truncate text-xs text-mineral-500">
                {profissional.cargoOuEspecialidade}
              </p>
            </div>

            {/* Indicador discreto apenas se estiver oculto */}
            {!profissional.ativo ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-mineral-200 bg-mineral-50 px-2 py-0.5 text-[10px] font-medium text-mineral-600">
                <span className="h-1.5 w-1.5 rounded-full bg-mineral-400" aria-hidden="true" />
                Oculto
              </span>
            ) : null}
          </div>

          {/* Minibiografia com clamp */}
          {profissional.minibiografia ? (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-mineral-600">
              {profissional.minibiografia}
            </p>
          ) : null}
        </div>
      </div>

      {/* Linha de Contatos minimalista e limpa (inline, sem caixas/bordas) */}
      {profissional.emailContatoOpcional || profissional.whatsappOpcional ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-mineral-500">
          {profissional.emailContatoOpcional ? (
            <a
              href={`mailto:${profissional.emailContatoOpcional}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-mineral-950"
            >
              <Mail className="h-3 w-3 shrink-0 text-mineral-400" aria-hidden="true" />
              <span className="truncate">{profissional.emailContatoOpcional}</span>
            </a>
          ) : null}

          {profissional.emailContatoOpcional && profissional.whatsappOpcional ? (
            <span className="text-mineral-300" aria-hidden="true">
              ·
            </span>
          ) : null}

          {profissional.whatsappOpcional ? (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3 w-3 shrink-0 text-mineral-400" aria-hidden="true" />
              <span>{formatarWhatsappExibicao(profissional.whatsappOpcional)}</span>
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Rodapé: Link do Cartão à esquerda + Ações neutras à direita */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-marfim-100 pt-3">
        {/* Link direto do Cartão Digital */}
        <div className="min-w-0">
          {temPaginaPublicada && profissional.ativo ? (
            <Link
              href={`/${identificadorPublico}/equipe/${profissional.identificadorCartao}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 truncate text-xs text-mineral-600 hover:text-mineral-950"
              title="Abrir cartão digital publicado em nova aba"
            >
              <span className="truncate font-mono text-[11px] text-mineral-500 group-hover:text-mineral-950">
                /equipe/{profissional.identificadorCartao}
              </span>
              <ExternalLink className="h-3 w-3 shrink-0 text-mineral-400 group-hover:text-mineral-800" aria-hidden="true" />
            </Link>
          ) : (
            <span className="font-mono text-[11px] text-mineral-400">
              /equipe/{profissional.identificadorCartao}
            </span>
          )}
        </div>

        {/* Grupo de Ações Sobrio e Minimalista */}
        <div className="flex items-center gap-1">
          <Botao
            variante="fantasma"
            tamanho="compacto"
            className={combinarClasses(
              "rounded-lg px-2 text-xs text-mineral-600 hover:bg-mineral-100 hover:text-mineral-950",
              qrAberto ? "bg-mineral-100 text-mineral-950 font-medium" : "",
            )}
            aria-expanded={qrAberto}
            aria-label={`QR Code de ${profissional.nomeCompleto}`}
            onClick={onAlternarQr}
          >
            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">QR Code</span>
          </Botao>

          <Botao
            variante="fantasma"
            tamanho="compacto"
            disabled={!podeEditar || ocupado}
            className="rounded-lg px-2 text-xs text-mineral-600 hover:bg-mineral-100 hover:text-mineral-950"
            aria-label={`Editar ${profissional.nomeCompleto}`}
            onClick={onEditar}
          >
            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Editar</span>
          </Botao>

          <Botao
            variante="fantasma"
            tamanho="compacto"
            disabled={!podeEditar || ocupado}
            className="rounded-lg px-2 text-xs text-mineral-600 hover:bg-mineral-100 hover:text-mineral-950"
            carregando={alterandoVisibilidade}
            textoCarregando="..."
            aria-label={
              profissional.ativo
                ? `Ocultar ${profissional.nomeCompleto}`
                : `Exibir ${profissional.nomeCompleto}`
            }
            onClick={onAlternarVisibilidade}
          >
            {profissional.ativo ? (
              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{profissional.ativo ? "Ocultar" : "Exibir"}</span>
          </Botao>

          <Botao
            variante="fantasma"
            tamanho="compacto"
            disabled={!podeEditar || ocupado}
            aria-label={`Excluir ${profissional.nomeCompleto}`}
            onClick={onSolicitarExclusao}
            className="rounded-lg px-1.5 text-mineral-400 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </Botao>
        </div>
      </div>

      {/* Confirmação de exclusão em linha */}
      {confirmandoExclusao ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-900">
          <span>
            Excluir <strong>{profissional.nomeCompleto}</strong> e seu cartão digital?
          </span>
          <div className="flex items-center gap-2">
            <Botao
              variante="fantasma"
              tamanho="compacto"
              disabled={ocupado}
              onClick={onCancelarExclusao}
            >
              Cancelar
            </Botao>
            <Botao
              variante="operacional_primario"
              tamanho="compacto"
              disabled={!podeEditar || ocupado}
              carregando={excluindo}
              className="bg-red-700 text-white hover:bg-red-800"
              onClick={onConfirmarExclusao}
            >
              Sim, excluir
            </Botao>
          </div>
        </div>
      ) : null}

      {/* Gaveta do QR Code */}
      {qrAberto ? (
        <div className="pt-2">
          <ExibicaoQrCodeEditorial
            urlDestino={urlCartao}
            rotuloIdentificacao={profissional.nomeCompleto}
            nomeArquivoSvg={`cartao-${profissional.identificadorCartao}`}
          />
        </div>
      ) : null}
    </CartaoSuperficie>
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
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-mineral-200/60 bg-mineral-100 text-sm font-semibold text-mineral-700 sm:h-16 sm:w-16">
      {profissional.urlFotoPerfil && !falhou ? (
        <Imagem
          src={profissional.urlFotoPerfil}
          alt={`Retrato de ${profissional.nomeCompleto}`}
          fill
          unoptimized
          sizes="64px"
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

function formatarWhatsappExibicao(valor: string): string {
  const { ddi, numeroNacional } = separarDdiENumero(valor);
  if (!numeroNacional) return valor;

  // Formatação para Brasil: (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX
  if (ddi === "55" || (!ddi && (numeroNacional.length === 10 || numeroNacional.length === 11))) {
    const ddd = numeroNacional.slice(0, 2);
    const resto = numeroNacional.slice(2);
    const corpo = resto.length === 9 ? `${resto.slice(0, 5)}-${resto.slice(5)}` : `${resto.slice(0, 4)}-${resto.slice(4)}`;
    return `(${ddd}) ${corpo}`;
  }

  return ddi ? `+${ddi} ${numeroNacional}` : valor;
}


