import { CabecalhoLanding } from "@/componentes/marketing/CabecalhoLanding";
import { HeroLanding } from "@/componentes/marketing/HeroLanding";
import { RodapeLanding } from "@/componentes/marketing/RodapeLanding";
import { SecaoPlanos } from "@/componentes/marketing/SecaoPlanos";

export default function PaginaApresentacaoInicial() {
  return (
    <div className="flex min-h-dvh flex-col">
      <CabecalhoLanding />
      <main className="flex-1">
        <HeroLanding />
        <SecaoPlanos />
      </main>
      <RodapeLanding />
    </div>
  );
}
