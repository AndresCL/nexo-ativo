import { describe, expect, it } from "vitest";
import {
  gerarConteudoVCard,
  gerarNomeArquivoVCard,
  normalizarTelefoneInternacional,
} from "@/dominio/servicos/geradorVCardProfissional";

describe("geradorVCardProfissional (RFC 2426 / RFC 6350)", () => {
  it("normaliza telefones brasileiros para o padrão internacional E.164", () => {
    expect(normalizarTelefoneInternacional("11987654321")).toBe("+5511987654321");
    expect(normalizarTelefoneInternacional("(11) 98765-4321")).toBe("+5511987654321");
    expect(normalizarTelefoneInternacional("5511987654321")).toBe("+5511987654321");
    expect(normalizarTelefoneInternacional("+5511987654321")).toBe("+5511987654321");
  });

  it("normaliza telefones internacionais preservando DDI específico", () => {
    expect(normalizarTelefoneInternacional("+351 912 345 678")).toBe("+351912345678");
    expect(normalizarTelefoneInternacional("+1 415 555 2671")).toBe("+14155552671");
    expect(normalizarTelefoneInternacional("00351912345678")).toBe("+351912345678");
  });

  it("gera arquivo vCard 3.0 estruturado com todos os campos principais", () => {
    const vcard = gerarConteudoVCard({
      nomeCompleto: "Dra. Camila Vasconcellos",
      cargoOuEspecialidade: "Dermatologista & Tricologia",
      nomeOrganizacao: "Clínica Lumière",
      registroProfissionalOpcional: "CRM-SP 123456 / RQE 7890",
      minibiografia: "Especialista em saúde capilar e estética avançada.",
      telefoneWhatsappOpcional: "11988887777",
      emailContatoOpcional: "camila@clinicalumiere.com.br",
      urlPublicaCartao: "https://fluxo.app/clinica-lumiere/equipe/camila",
      urlFotoPerfil: "https://storage.googleapis.com/fotos/camila.jpg",
      instagramOpcional: "https://instagram.com/dracamilavasconcellos",
      linkedinOpcional: "https://linkedin.com/in/camilavasconcellos",
    });

    // Verificações essenciais de conformidade vCard 3.0
    expect(vcard).toContain("BEGIN:VCARD");
    expect(vcard).toContain("VERSION:3.0");
    expect(vcard).toContain("FN:Dra. Camila Vasconcellos");
    expect(vcard).toContain("N:Vasconcellos;Dra. Camila;;;");
    expect(vcard).toContain("ORG:Clínica Lumière");
    expect(vcard).toContain("TITLE:Dermatologista & Tricologia");
    expect(vcard).toContain("TEL;TYPE=CELL,VOICE,pref:+5511988887777");
    expect(vcard).toContain("EMAIL;TYPE=INTERNET,WORK:camila@clinicalumiere.com.br");
    expect(vcard).toContain("URL;TYPE=WORK:https://fluxo.app/clinica-lumiere/equipe/camila");
    expect(vcard).toContain("PHOTO;VALUE=URI:https://storage.googleapis.com/fotos/camila.jpg");
    expect(vcard).toContain(
      "X-SOCIALPROFILE;TYPE=instagram:https://instagram.com/dracamilavasconcellos",
    );
    expect(vcard).toContain(
      "X-SOCIALPROFILE;TYPE=linkedin:https://linkedin.com/in/camilavasconcellos",
    );
    expect(vcard).toContain(
      "NOTE:Registro: CRM-SP 123456 / RQE 7890\\n\\nEspecialista em saúde capilar e estética avançada.\\n\\nCartão digital: https://fluxo.app/clinica-lumiere/equipe/camila",
    );
    expect(vcard).toContain("END:VCARD");
  });

  it("trata profissionais com nome único ou sem campos opcionais", () => {
    const vcard = gerarConteudoVCard({
      nomeCompleto: "Aristóteles",
      cargoOuEspecialidade: "Consultor Sênior",
      nomeOrganizacao: "Alpha Advisors",
    });

    expect(vcard).toContain("FN:Aristóteles");
    expect(vcard).toContain("N:;Aristóteles;;;");
    expect(vcard).toContain("ORG:Alpha Advisors");
    expect(vcard).toContain("TITLE:Consultor Sênior");
    expect(vcard).not.toContain("TEL;");
    expect(vcard).not.toContain("EMAIL;");
    expect(vcard).not.toContain("PHOTO;");
  });

  it("gera slug seguro para nome de arquivo .vcf", () => {
    expect(gerarNomeArquivoVCard("João Paulo da Silva")).toBe("contato-joao-paulo-da-silva.vcf");
    expect(gerarNomeArquivoVCard("Dra. Érica Müller")).toBe("contato-dra-erica-muller.vcf");
  });
});
