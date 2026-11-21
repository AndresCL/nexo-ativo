import type { Metadata } from "next";
import { CabecalhoLanding } from "@/componentes/marketing/CabecalhoLanding";
import { HeroLanding } from "@/componentes/marketing/HeroLanding";
import { RodapeLanding } from "@/componentes/marketing/RodapeLanding";
import { SecaoChamadaFinalEndereco } from "@/componentes/marketing/SecaoChamadaFinalEndereco";
import { SecaoComoFunciona } from "@/componentes/marketing/SecaoComoFunciona";
import { SecaoMicrofluxosComerciais } from "@/componentes/marketing/SecaoMicrofluxosComerciais";
import { SecaoPerguntasFrequentes } from "@/componentes/marketing/SecaoPerguntasFrequentes";
import { SecaoPlanos } from "@/componentes/marketing/SecaoPlanos";
import { SecaoRecursosPlataforma } from "@/componentes/marketing/SecaoRecursosPlataforma";
import { SecaoSegmentosPme } from "@/componentes/marketing/SecaoSegmentosPme";

export const metadata: Metadata = {
  title: "Nexo Ativo — O microsite que transforma visitas em clientes qualificados",
  description:
    "Serviços, portfólio, equipe e microfluxos comerciais em um único link para PMEs e profissionais.",
};

export default function PaginaApresentacaoInicial() {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-mineral-950">
      <CabecalhoLanding />
      <main id="conteudo-principal" className="flex-1">
        <HeroLanding />
        <SecaoSegmentosPme />
        <SecaoMicrofluxosComerciais />
        <SecaoRecursosPlataforma />
        <SecaoComoFunciona />
        <SecaoPlanos />
        <SecaoPerguntasFrequentes />
        <SecaoChamadaFinalEndereco />
      </main>
      <RodapeLanding />
    </div>
  );
}
