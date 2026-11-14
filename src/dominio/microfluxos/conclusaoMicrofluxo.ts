import { obterRespostaLegivelBloco } from "./composicaoEtapaLivre";
import type { AcervoPublicoVitrine } from "../entidades/catalogoConteudo";
import { ErroValidacaoDominio } from "../erros/errosDominio";
import type { PoliticaPublicidade } from "../publicidade/tiposPerfilPublicidade";
import { montarLinkWhatsapp } from "../servicos/numeroWhatsappInternacional";
import { resolverProximaEtapaId, type EstadoExecucaoMicrofluxo } from "./motorExecucaoMicrofluxo";
import type {
  AcaoConclusaoMicrofluxo,
  CampoResumoConclusao,
  DefinicaoMicrofluxo,
} from "./tiposMicrofluxo";

export function listarCamposResumoConclusao(
  fluxo: DefinicaoMicrofluxo,
): readonly CampoResumoConclusao[] {
  return fluxo.etapas.flatMap((etapa): CampoResumoConclusao[] => {
    if (etapa.tipoEtapa === "etapa_livre")
      return (etapa.blocos ?? []).flatMap((bloco): CampoResumoConclusao[] => {
        if (bloco.tipo === "texto" || bloco.tipo === "imagem") return [];
        return [
          {
            etapaId: etapa.id,
            campoId: bloco.referenciaResumoLegada
              ? undefined
              : bloco.tipo === "campo"
                ? bloco.campo.id
                : bloco.id,
            rotulo: bloco.tipo === "campo" ? bloco.campo.rotulo : bloco.rotulo,
          },
        ];
      });
    if (etapa.campos?.length)
      return etapa.campos.map((campo) => ({
        etapaId: etapa.id,
        campoId: campo.id,
        rotulo: campo.rotulo,
      }));
    if (etapa.tipoEtapa === "coleta_contato")
      return [
        { etapaId: etapa.id, campoId: "nomeCompleto", rotulo: "Nome" },
        { etapaId: etapa.id, campoId: "telefoneOuWhatsapp", rotulo: "Telefone" },
        { etapaId: etapa.id, campoId: "email", rotulo: "E-mail" },
        { etapaId: etapa.id, campoId: "mensagemAdicional", rotulo: "Mensagem" },
      ];
    if (
      [
        "selecao_unica",
        "selecao_multipla",
        "entrada_curta",
        "selecao_catalogo",
        "selecao_profissional",
      ].includes(etapa.tipoEtapa)
    )
      return [{ etapaId: etapa.id, rotulo: etapa.titulo }];
    return [];
  });
}

/** Percorre o caminho atual; respostas antigas de ramos abandonados nunca são projetadas. */
export function obterEtapasPercorridas(estado: EstadoExecucaoMicrofluxo): ReadonlySet<string> {
  const ids = new Set<string>();
  let id: string | null = estado.microfluxo.etapaInicialId;
  while (id && !ids.has(id)) {
    const etapa = estado.microfluxo.etapas.find((item) => item.id === id);
    if (!etapa) break;
    ids.add(id);
    if (id === estado.etapaAtualId) break;
    id = resolverProximaEtapaId(estado.microfluxo, etapa, estado.respostas);
  }
  return ids;
}

export function projetarRespostasConclusao(
  estado: EstadoExecucaoMicrofluxo,
  campos: readonly CampoResumoConclusao[],
  acervo: AcervoPublicoVitrine,
  politica: PoliticaPublicidade,
): readonly { rotulo: string; valor: string }[] {
  const percorridas = obterEtapasPercorridas(estado);
  const r = estado.respostas;
  return campos.flatMap((item) => {
    if (!percorridas.has(item.etapaId)) return [];
    const etapa = estado.microfluxo.etapas.find((e) => e.id === item.etapaId);
    if (!etapa) return [];
    if (etapa.tipoEtapa === "etapa_livre") {
      const bloco = etapa.blocos?.find(
        (b) =>
          b.tipo !== "texto" &&
          b.tipo !== "imagem" &&
          (item.campoId === undefined
            ? b.referenciaResumoLegada
            : (b.tipo === "campo" ? b.campo.id : b.id) === item.campoId),
      );
      if (!bloco || bloco.tipo === "texto" || bloco.tipo === "imagem") return [];
      if (
        bloco.tipo === "campo" &&
        bloco.campo.tipo === "moeda" &&
        !politica.permiteCalculoComercial()
      )
        return [];
      const texto = obterRespostaLegivelBloco(etapa, bloco, r, acervo);
      if (!texto) return [];
      return [
        {
          rotulo: item.rotulo ?? (bloco.tipo === "campo" ? bloco.campo.rotulo : bloco.rotulo),
          valor:
            bloco.tipo === "campo"
              ? (bloco.campo.tipo === "moeda" ? `R$ ${texto}` : texto) +
                (bloco.campo.sufixoVisual ? ` ${bloco.campo.sufixoVisual}` : "")
              : texto,
        },
      ];
    }
    const campo = etapa.campos?.find((c) => c.id === item.campoId);
    if (campo?.tipo === "moeda" && !politica.permiteCalculoComercial()) return [];
    let valor: unknown;
    if (campo) valor = r.camposDinamicosPorEtapa?.[etapa.id]?.[campo.id];
    else if (etapa.tipoEtapa === "coleta_contato" && item.campoId && r.contatoVisitante) {
      const contato = r.contatoVisitante;
      if (item.campoId === "nomeCompleto") valor = contato.nomeCompleto;
      if (item.campoId === "telefoneOuWhatsapp") valor = contato.telefoneOuWhatsapp;
      if (item.campoId === "email") valor = contato.email;
      if (item.campoId === "mensagemAdicional") valor = contato.mensagemAdicional;
    } else if (!item.campoId) {
      if (etapa.tipoEtapa === "selecao_unica")
        valor = etapa.opcoes?.find((o) => o.id === r.opcoesUnicasPorEtapa[etapa.id])?.rotulo;
      if (etapa.tipoEtapa === "selecao_multipla")
        valor = (r.opcoesMultiplasPorEtapa[etapa.id] ?? []).flatMap(
          (id) => etapa.opcoes?.find((o) => o.id === id)?.rotulo ?? [],
        );
      if (etapa.tipoEtapa === "entrada_curta") valor = r.textosCurtosPorEtapa[etapa.id];
      if (etapa.tipoEtapa === "selecao_catalogo")
        valor =
          acervo.servicos.find((s) => s.id === r.servicoSelecionadoId)?.nome ??
          acervo.produtos.find((p) => p.id === r.produtoSelecionadoId)?.nome;
      if (etapa.tipoEtapa === "selecao_profissional")
        valor = acervo.profissionais.find(
          (p) => p.id === r.profissionalSelecionadoId,
        )?.nomeCompleto;
    }
    if (valor === undefined || valor === null) return [];
    const texto = (
      Array.isArray(valor)
        ? valor.join(" · ")
        : typeof valor === "boolean"
          ? valor
            ? "Sim"
            : "Não"
          : String(valor)
    ).trim();
    if (!texto) return [];
    return [
      {
        rotulo: item.rotulo ?? campo?.rotulo ?? etapa.titulo,
        valor:
          (campo?.tipo === "moeda" ? `R$ ${texto}` : texto) +
          (campo?.sufixoVisual ? ` ${campo.sufixoVisual}` : ""),
      },
    ];
  });
}

/** Identidade pública estável, sem expor nomes ou convenções dos IDs internos. */
export function obterIdentificadorPublicoExperiencia(id: string): string {
  const bytes = new TextEncoder().encode(id);
  return `e-${btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")}`;
}

export function construirCaminhoExperiencia(organizacao: string, id: string): string {
  return `/${encodeURIComponent(organizacao)}#experiencia=${obterIdentificadorPublicoExperiencia(id)}`;
}

/** Valida contra o mesmo acervo que será publicado, nunca contra dados de outro tenant. */
export function exigirDestinosConclusaoValidos(
  organizacaoId: string,
  acervo: AcervoPublicoVitrine,
  urlBasePublica?: string,
): void {
  const fluxos = acervo.microfluxos ?? [];
  const falhar = (mensagem: string): never => {
    throw new ErroValidacaoDominio(mensagem, "DESTINO_CONCLUSAO_INVALIDO");
  };
  for (const fluxo of fluxos) {
    if (fluxo.organizacaoId !== organizacaoId)
      falhar("A experiência pertence a outra organização.");
    const disponiveis = listarCamposResumoConclusao(fluxo);
    for (const campo of [
      ...(fluxo.conclusao?.resumo.campos ?? []),
      ...(fluxo.conclusao?.camposWhatsapp ?? []),
    ]) {
      if (!disponiveis.some((c) => c.etapaId === campo.etapaId && c.campoId === campo.campoId))
        falhar(`Campo de conclusão inexistente em “${fluxo.titulo}”.`);
    }
    for (const acao of fluxo.conclusao?.acoes ?? []) {
      if (
        acao.tipo === "url_externa" &&
        urlBasePublica &&
        new URL(acao.url).origin === new URL(urlBasePublica).origin
      ) {
        falhar(
          "Para destinos desta aplicação, escolha home, experiência ou perfil profissional em vez de URL externa.",
        );
      }
      if (
        acao.tipo === "microfluxo" &&
        !fluxos.some(
          (m) =>
            m.id === acao.microfluxoId && m.ativo && (!m.tipoAcao || m.tipoAcao === "microfluxo"),
        )
      )
        falhar("O destino precisa ser uma experiência ativa publicada nesta organização.");
      if (
        acao.tipo === "perfil_profissional" &&
        !acervo.profissionais.some(
          (p) => p.id === acao.profissionalId && p.ativo && p.organizacaoId === organizacaoId,
        )
      )
        falhar("O perfil de destino precisa estar ativo e publicado nesta organização.");
      if (
        acao.tipo === "whatsapp" &&
        acao.numeroOpcional &&
        !montarLinkWhatsapp(acao.numeroOpcional)
      )
        falhar("O telefone da ação de WhatsApp é inválido.");
    }
  }
  const visitando = new Set<string>();
  const visitados = new Set<string>();
  function visitar(id: string) {
    if (visitando.has(id)) falhar("As ações de conclusão criam um ciclo entre experiências.");
    if (visitados.has(id)) return;
    visitando.add(id);
    for (const acao of fluxos.find((m) => m.id === id)?.conclusao?.acoes ?? [])
      if (acao.tipo === "microfluxo") visitar(acao.microfluxoId);
    visitando.delete(id);
    visitados.add(id);
  }
  for (const fluxo of fluxos) visitar(fluxo.id);
}

export function resolverDestinoAcaoConclusao(
  acao: AcaoConclusaoMicrofluxo,
  identificadorOrganizacao: string,
  acervo: AcervoPublicoVitrine,
  linkWhatsapp: string | null,
): string | null {
  if (acao.tipo === "home") return `/${encodeURIComponent(identificadorOrganizacao)}`;
  if (acao.tipo === "whatsapp") return linkWhatsapp;
  if (acao.tipo === "url_externa") {
    try {
      const url = new URL(acao.url);
      return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password
        ? url.href
        : null;
    } catch {
      return null;
    }
  }
  if (acao.tipo === "microfluxo")
    return acervo.microfluxos?.some((m) => m.id === acao.microfluxoId && m.ativo)
      ? construirCaminhoExperiencia(identificadorOrganizacao, acao.microfluxoId)
      : null;
  const profissional = acervo.profissionais.find((p) => p.id === acao.profissionalId && p.ativo);
  return profissional
    ? `/${encodeURIComponent(identificadorOrganizacao)}/equipe/${encodeURIComponent(profissional.identificadorCartao)}`
    : null;
}
