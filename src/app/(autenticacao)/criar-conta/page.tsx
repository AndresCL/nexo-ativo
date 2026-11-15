import { redirect } from "next/navigation";
import { obterSessaoAutenticadaServidor } from "@/infraestrutura/firebase/sessaoServidor";
import { FormularioCriarConta } from "@/componentes/autenticacao/FormularioCriarConta";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";

export default async function PaginaCriarConta() {
  const sessaoAtiva = await obterSessaoAutenticadaServidor();

  if (sessaoAtiva) {
    redirect("/painel");
  }

  return (
    <CartaoSuperficie preenchimento="amplo">
      <p className="text-xs tracking-[0.18em] text-mineral-500 uppercase">Nova presença digital</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-mineral-950">Criar sua conta</h1>
      <p className="mt-1.5 mb-6 text-xs leading-relaxed text-mineral-700">
        Comece configurando sua identidade editorial no seu ritmo e publique quando desejar.
      </p>

      <FormularioCriarConta />
    </CartaoSuperficie>
  );
}
