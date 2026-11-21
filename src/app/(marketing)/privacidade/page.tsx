import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Diretrizes de privacidade, segurança e conformidade LGPD da plataforma Nexo Ativo.",
};

export default function PaginaPoliticaDePrivacidade() {
  return (
    <main className="min-h-screen bg-marfim-100/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-mineral-600 hover:text-mineral-950 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para a página inicial
          </Link>
        </div>

        <CartaoSuperficie preenchimento="amplo" className="space-y-8 bg-white shadow-xs">
          <header className="border-b border-marfim-200 pb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-alerta-sucesso/10 px-3 py-1 text-xs font-semibold text-alerta-sucesso uppercase tracking-widest">
              <ShieldCheck className="h-3.5 w-3.5" />
              Conformidade LGPD
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-mineral-950 sm:text-4xl font-serif">
              Política de Privacidade
            </h1>
            <p className="mt-2 text-xs text-mineral-500">
              Em estrita conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) · Novembro de 2026
            </p>
          </header>

          <article className="prose prose-sm prose-neutral max-w-none space-y-6 text-sm leading-relaxed text-mineral-700">
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-mineral-950">1. Compromisso com a Privacidade</h2>
              <p>
                O <strong>Nexo Ativo</strong> respeita e protege a privacidade dos seus assinantes e dos visitantes de suas vitrines
                digitais. Esta Política descreve de forma clara como os dados pessoais são coletados, utilizados, armazenados e protegidos
                em nossa plataforma.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-mineral-950">2. Papéis no Tratamento de Dados (Controlador vs Operador)</h2>
              <ul className="list-disc pl-5 space-y-2 text-xs text-mineral-700">
                <li>
                  <strong>Nexo Ativo como Controlador:</strong> Em relação aos dados cadastrais e de cobrança dos assinantes
                  (profissionais e empresas clientes que contratam a plataforma).
                </li>
                <li>
                  <strong>Nexo Ativo como Operador:</strong> Em relação aos dados de visitantes coletados através de microfluxos
                  e formulários nas vitrines dos assinantes. Neste cenário, o assinante é o Controlador dos dados de seus próprios clientes,
                  e o Nexo Ativo processa as informações estritamente para viabilizar a entrega e o registro da solicitação.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-mineral-950">3. Dados Coletados e Finalidades</h2>
              <div className="space-y-3 text-xs text-mineral-600">
                <p>
                  <strong>Dados dos Assinantes:</strong> Nome completo, e-mail corporativo, senha criptografada (hash seguro), dados cadastrais
                  da empresa, histórico de publicações e preferências de conta. Finalidade: execução de contrato de assinatura e autenticação segura.
                </p>
                <p>
                  <strong>Dados dos Visitantes da Vitrine:</strong> Nome, número de telefone/WhatsApp, endereço de e-mail (opcional) e respostas
                  comerciais do microfluxo. Finalidade: envio do alerta comercial para a organização contratante e geração de comprovante de atendimento.
                </p>
                <p>
                  <strong>Telemetria e Métricas:</strong> Contabilização anônima e agregada de visualizações e cliques para o painel do assinante,
                  sem o uso de cookies de rastreamento invasivo ou venda de perfis para redes de publicidade de terceiros.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-mineral-950">4. Compartilhamento Seguro com Provedores Parceiros</h2>
              <p>
                Não comercializamos dados pessoais em nenhuma hipótese. O compartilhamento ocorre unicamente com fornecedores de infraestrutura
                essenciais à operação do serviço:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-mineral-600">
                <li><strong>Google Cloud / Firebase:</strong> Hospedagem, banco de dados criptografado e infraestrutura de autenticação.</li>
                <li><strong>Asaas Gestão Financeira:</strong> Processamento seguro de pagamentos e emissão de cobranças recorrentes.</li>
                <li><strong>Resend Technologies:</strong> Disparo transacional idempotente de e-mails de segurança e alertas comerciais.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-mineral-950">5. Segurança e Retenção das Informações</h2>
              <p>
                Todos os dados em trânsito são protegidos por criptografia de ponta a ponta (TLS 1.3/HTTPS). Os dados em repouso são mantidos
                em servidores com rigoroso isolamento multi-tenant (regras de segurança Firestore no nível do documento).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-mineral-950">6. Direitos do Titular de Dados</h2>
              <p>
                Em conformidade com o Art. 18 da LGPD, você possui o direito de solicitar a qualquer momento:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-mineral-600">
                <li>Confirmação da existência de tratamento e acesso aos seus dados.</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
                <li>Eliminação e exclusão definitiva da conta e dados armazenados diretamente pelo painel ou canal de suporte.</li>
                <li>Revogação do consentimento para recebimento de comunicações institucionais.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-mineral-950">7. Contato do Encarregado de Dados (DPO)</h2>
              <p>
                Para exercer seus direitos de titular ou tirar dúvidas sobre o tratamento de informações, envie uma mensagem para o nosso
                canal oficial: <strong>contato@nexoativo.com.br</strong>.
              </p>
            </section>
          </article>

          <footer className="border-t border-marfim-200 pt-6 text-xs text-mineral-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p>© {new Date().getFullYear()} Nexo Ativo. Privacidade e integridade por padrão.</p>
            <div className="flex gap-4">
              <Link href="/termos" className="underline hover:text-mineral-800">
                Termos de Uso
              </Link>
              <Link href="/entrar" className="underline hover:text-mineral-800">
                Acessar Plataforma
              </Link>
            </div>
          </footer>
        </CartaoSuperficie>
      </div>
    </main>
  );
}

