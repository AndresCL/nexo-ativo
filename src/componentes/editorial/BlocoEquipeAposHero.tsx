import {
  obterAcoesPrincipaisVisiveis,
  type ItemAcaoHome,
} from "@/dominio/entidades/paginaPublicada";
import {
  ehAcaoEquipe,
  resolverPosicionamentoEquipe,
} from "@/dominio/editorial/posicionamentoEquipeVitrine";
import type { PreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";
import { AcaoEquipeVitrine, type ManipuladorAcaoHome } from "./AcaoEquipeVitrine";

export function BlocoEquipeAposHero({
  acoes,
  previaEquipe,
  aoAcionarItem,
}: {
  readonly acoes: readonly ItemAcaoHome[];
  readonly previaEquipe?: PreviaEquipeVitrine;
  readonly aoAcionarItem?: ManipuladorAcaoHome;
}) {
  if (!previaEquipe?.total) return null;
  const acoesHero = obterAcoesPrincipaisVisiveis(acoes).filter(
    (acao) =>
      ehAcaoEquipe(acao) &&
      resolverPosicionamentoEquipe(acao.posicionamentoEquipe).desktop === "abaixo_hero",
  );
  if (!acoesHero.length) return null;

  return (
    <div className="mt-5 hidden max-w-sm space-y-2 @5xl:block" data-local-equipe="abaixo_hero">
      {acoesHero.map((acao) => (
        <AcaoEquipeVitrine
          key={acao.id}
          acao={acao}
          previa={previaEquipe}
          destaque={acao.destaquePrincipal}
          aoAcionarItem={aoAcionarItem}
        />
      ))}
    </div>
  );
}
