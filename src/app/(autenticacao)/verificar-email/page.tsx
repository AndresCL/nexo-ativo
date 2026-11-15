import { redirect } from "next/navigation";
import { obterSessaoAutenticadaServidor } from "@/infraestrutura/firebase/sessaoServidor";
import { PainelVerificacaoEmail } from "@/componentes/autenticacao/PainelVerificacaoEmail";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";

export default async function PaginaVerificarEmail() {
  const sessao = await obterSessaoAutenticadaServidor();

  if (sessao?.emailVerificado) {
    redirect("/painel");
  }

  return (
    <CartaoSuperficie preenchimento="amplo">
      <p className="text-xs tracking-[0.18em] text-mineral-500 uppercase">Confirmação de conta</p>
      <h1 className="mt-2 mb-4 text-2xl font-bold tracking-tight text-mineral-950">
        Confirme seu endereço de e-mail
      </h1>

      <PainelVerificacaoEmail emailAtual={sessao?.email ?? null} />
    </CartaoSuperficie>
  );
}
