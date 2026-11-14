import { redirect } from "next/navigation";
import { obterSessaoAutenticadaServidor } from "@/infraestrutura/firebase/sessaoServidor";
import { FormularioLogin } from "@/componentes/autenticacao/FormularioLogin";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";

export default async function PaginaEntrar() {
  const sessaoAtiva = await obterSessaoAutenticadaServidor();

  if (sessaoAtiva) {
    redirect("/painel");
  }

  return (
    <CartaoSuperficie preenchimento="amplo">
      <p className="text-xs tracking-[0.18em] text-mineral-500 uppercase">Acesso do assinante</p>
      <h1 className="mt-2 font-editorial text-3xl text-mineral-950">Entrar na sua conta</h1>
      <p className="mt-1.5 mb-6 text-xs leading-relaxed text-mineral-700">
        Gerencie sua página editorial, portfólio, experiências e solicitações recebidas.
      </p>

      <FormularioLogin />
    </CartaoSuperficie>
  );
}
