import { FormularioRecuperarSenha } from "@/componentes/autenticacao/FormularioRecuperarSenha";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";

export default function PaginaRecuperarSenha() {
  return (
    <CartaoSuperficie preenchimento="amplo">
      <p className="text-xs tracking-[0.18em] text-mineral-500 uppercase">Segurança da conta</p>
      <h1 className="mt-2 font-editorial text-3xl text-mineral-950">Recuperar senha</h1>
      <p className="mt-1.5 mb-6 text-xs leading-relaxed text-mineral-700">
        Informe o e-mail utilizado no seu cadastro para receber um link seguro de redefinição.
      </p>

      <FormularioRecuperarSenha />
    </CartaoSuperficie>
  );
}
