/**
 * Serviço de domínio responsável pela geração e formatação de arquivos vCard (Virtual Contact File)
 * no formato vCard 3.0 (RFC 2426 / RFC 6350).
 *
 * Segue o Princípio da Responsabilidade Única (SRP): apenas formata e sanitiza dados de contato.
 */

import { normalizarNumeroWhatsappInternacional } from "./numeroWhatsappInternacional";

export interface ParametrosGeracaoVCard {
  readonly nomeCompleto: string;
  readonly cargoOuEspecialidade: string;
  readonly nomeOrganizacao: string;
  readonly registroProfissionalOpcional?: string;
  readonly minibiografia?: string;
  readonly telefoneWhatsappOpcional?: string;
  readonly emailContatoOpcional?: string;
  readonly urlPublicaCartao?: string;
  readonly urlFotoPerfil?: string;
  readonly linkedinOpcional?: string;
  readonly instagramOpcional?: string;
}

/**
 * Escapa caracteres especiais segundo a especificação RFC 2426.
 * Vírgulas, ponto-e-vírgula e barras invertidas precisam de escape.
 * Quebras de linha reais devem ser transformadas no literal "\n".
 */
function escaparTextoVCard(valor: string): string {
  return valor
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n")
    .trim();
}

/**
 * Normaliza um número de telefone no formato internacional E.164 (+55...).
 */
export function normalizarTelefoneInternacional(telefone: string): string {
  const numero = normalizarNumeroWhatsappInternacional(telefone);
  return numero ? `+${numero}` : "";
}

/**
 * Decompõe o nome completo no formato vCard "N:Sobrenomes;Nomes;NomesMeio;Prefixos;Sufixos".
 */
function decomporNomeVCard(nomeCompleto: string): { sobrenomes: string; nomes: string } {
  const partes = nomeCompleto.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) {
    return { sobrenomes: "", nomes: "" };
  }
  if (partes.length === 1) {
    return { sobrenomes: "", nomes: partes[0] ?? "" };
  }

  // O último elemento é o sobrenome principal da família; o restante são os prenomes
  const sobrenome = partes[partes.length - 1] ?? "";
  const nomes = partes.slice(0, partes.length - 1).join(" ");
  return { sobrenomes: sobrenome, nomes };
}

/**
 * Gera a string no padrão vCard 3.0 para importação instantânea em iOS, Android e Outlook.
 */
export function gerarConteudoVCard(parametros: ParametrosGeracaoVCard): string {
  const linhas: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "PRODID:-//Fluxo Editorial//Cartao Digital Profissional//PT",
  ];

  // Nome Completo Formatado
  const nomeLimpo = parametros.nomeCompleto.trim();
  linhas.push(`FN:${escaparTextoVCard(nomeLimpo)}`);

  // Estrutura de Nomes (Sobrenome;Nome;;;)
  const { sobrenomes, nomes } = decomporNomeVCard(nomeLimpo);
  linhas.push(`N:${escaparTextoVCard(sobrenomes)};${escaparTextoVCard(nomes)};;;`);

  // Organização e Cargo
  if (parametros.nomeOrganizacao) {
    linhas.push(`ORG:${escaparTextoVCard(parametros.nomeOrganizacao)}`);
  }
  if (parametros.cargoOuEspecialidade) {
    linhas.push(`TITLE:${escaparTextoVCard(parametros.cargoOuEspecialidade)}`);
  }

  // Telefone / WhatsApp celular
  if (parametros.telefoneWhatsappOpcional) {
    const telFormatado = normalizarTelefoneInternacional(parametros.telefoneWhatsappOpcional);
    if (telFormatado) {
      linhas.push(`TEL;TYPE=CELL,VOICE,pref:${telFormatado}`);
    }
  }

  // E-mail profissional
  if (parametros.emailContatoOpcional?.trim()) {
    linhas.push(`EMAIL;TYPE=INTERNET,WORK:${parametros.emailContatoOpcional.trim()}`);
  }

  // URL do Cartão Digital / Presença Web
  if (parametros.urlPublicaCartao?.trim()) {
    linhas.push(`URL;TYPE=WORK:${parametros.urlPublicaCartao.trim()}`);
  }

  // Foto de Perfil via URI
  if (parametros.urlFotoPerfil?.startsWith("http")) {
    linhas.push(`PHOTO;VALUE=URI:${parametros.urlFotoPerfil.trim()}`);
  }

  // Redes Sociais (compatíveis com clientes modernos iOS/Android)
  if (parametros.instagramOpcional?.trim()) {
    linhas.push(`X-SOCIALPROFILE;TYPE=instagram:${parametros.instagramOpcional.trim()}`);
  }
  if (parametros.linkedinOpcional?.trim()) {
    linhas.push(`X-SOCIALPROFILE;TYPE=linkedin:${parametros.linkedinOpcional.trim()}`);
  }

  // Notas e Registro Profissional
  const notas: string[] = [];
  if (parametros.registroProfissionalOpcional?.trim()) {
    notas.push(`Registro: ${parametros.registroProfissionalOpcional.trim()}`);
  }
  if (parametros.minibiografia?.trim()) {
    notas.push(parametros.minibiografia.trim());
  }
  if (parametros.urlPublicaCartao?.trim()) {
    notas.push(`Cartão digital: ${parametros.urlPublicaCartao.trim()}`);
  }

  if (notas.length > 0) {
    linhas.push(`NOTE:${escaparTextoVCard(notas.join("\n\n"))}`);
  }

  linhas.push("END:VCARD");
  linhas.push(""); // Terminar com nova linha final

  return linhas.join("\r\n");
}

/**
 * Gera um nome de arquivo seguro e amigável para download (.vcf).
 */
export function gerarNomeArquivoVCard(nomeCompleto: string): string {
  const normalizado = nomeCompleto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `contato-${normalizado || "profissional"}.vcf`;
}

/**
 * Cria um objeto Blob do navegador configurado para vCard com charset UTF-8.
 */
export function criarBlobVCard(conteudoVCard: string): Blob {
  return new Blob([conteudoVCard], { type: "text/vcard;charset=utf-8;" });
}
