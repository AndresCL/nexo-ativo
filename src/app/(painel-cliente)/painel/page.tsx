import { VisaoGeralPainel } from "@/componentes/painel/VisaoGeralPainel";
import {
  exigirSessaoAutenticadaServidor,
  listarVinculosOrganizacaoServidor,
} from "@/infraestrutura/firebase/sessaoServidor";
import { carregarContextoEditorOrganizacaoServidor } from "@/infraestrutura/painel/leitorPainelOrganizacaoServidor";
import { FormularioCriarPrimeiraOrganizacao } from "@/componentes/autenticacao/FormularioCriarPrimeiraOrganizacao";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";

export default async function PaginaVisaoGeralPainel() {
  const sessao = await exigirSessaoAutenticadaServidor();
  const vinculos = await listarVinculosOrganizacaoServidor(sessao.uid);
  const organizacaoAtiva = vinculos[0];

  if (!organizacaoAtiva) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <header className="border-b border-marfim-200/80 pb-6">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">
            Passo 1 de 2
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-mineral-950 sm:text-2xl">
            Configure sua organização
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-mineral-700">
            Informe como sua atuação profissional ou empresa será identificada. Mesmo perfis
            individuais contam com um ambiente isolado e seguro.
          </p>
        </header>

        <CartaoSuperficie className="rounded-2xl p-5 shadow-xs sm:p-6">
          <FormularioCriarPrimeiraOrganizacao cadastroHabilitado={true} />
        </CartaoSuperficie>
      </div>
    );
  }

  const contextoEditor = await carregarContextoEditorOrganizacaoServidor(
    sessao,
    organizacaoAtiva.organizacaoId,
  );
  return (
    <VisaoGeralPainel
      nomeOrganizacao={organizacaoAtiva.nomeOrganizacao}
      identificadorPublico={organizacaoAtiva.identificadorPublico}
      papel={organizacaoAtiva.papel}
      emailVerificado={sessao.emailVerificado}
      rascunho={contextoEditor?.rascunho}
      resumoPlano={contextoEditor?.organizacao.resumoDireitosPlano}
      versaoPublicada={contextoEditor?.versaoPublicadaAtual ?? null}
      podeEditarAparencia={contextoEditor?.podeEditarAparencia ?? false}
    />
  );
}
