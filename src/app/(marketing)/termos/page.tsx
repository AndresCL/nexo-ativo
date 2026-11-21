import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { CartaoSuperficie } from "@/componentes/interface/CartaoSuperficie";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos e condições gerais de uso da plataforma Nexo Ativo.",
};

export default function PaginaTermosDeUso() {
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
            <div className="inline-flex items-center gap-2 rounded-full bg-marfim-200/60 px-3 py-1 text-xs font-semibold text-mineral-800 uppercase tracking-widest">
              <FileText className="h-3.5 w-3.5" />
              Contrato de Uso
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-mineral-950 sm:text-4xl font-serif">
              Termos de Uso
            </h1>
            <p className="mt-2 text-xs text-mineral-500">
              Última atualização: Novembro de 2026 · Versão 1.1
            </p>
          </header>

          <article className="prose prose-sm prose-neutral max-w-none space-y-6 text-sm leading-relaxed text-mineral-700">
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-mineral-950">1. Objeto e Definição da Plataforma</h2>
              <p>
                O <strong>Nexo Ativo</strong> é uma plataforma SaaS (Software as a Service) especializada em presença
                digital editorial, cartões profissionais interativos e microfluxos comerciais guiados para médicos, advogados,
                arquitetos, clínicas, escritórios e profissionais liberais.
              </p>
              <p>
                Ao criar uma conta ou utilizar os serviços do Nexo Ativo, você declara ter plena capacidade jurídica e concordar
                integralmente com estes Termos de Uso e com a nossa Política de Privacidade.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-mineral-950">2. Cadastro e Responsabilidade da Conta</h2>
              <p>
                O assinante compromete-se a fornecer informações verídicas, exatas e atualizadas durante o cadastro. As credenciais
                de acesso (e-mail e senha) são de uso estritamente pessoal e intransferível, sendo o usuário o único responsável por
                todas as atividades realizadas sob sua conta.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-mineral-950">3. Conteúdo Publicado e Propriedade Intelectual</h2>
              <p>
                O assinante retém todos os direitos de propriedade intelectual sobre as marcas, textos, fotografias e conteúdos
                que publicar em sua vitrine digital. Contudo, o assinante garante que dispõe de todas as licenças e autorizações necessárias
                para a veiculação de tais materiais, isentando o Nexo Ativo de quaisquer reclamações de terceiros.
              </p>
              <p>
                É expressamente proibida a publicação de conteúdos fraudulentos, caluniosos, ofensivos, violadores de sigilo profissional
                ou em desacordo com as diretrizes dos respectivos conselhos de classe (CRM, OAB, CAU, CRO, entre outros).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-mineral-950">4. Planos, Assinaturas e Pagamentos</h2>
              <p>
                Os planos do Nexo Ativo funcionam sob modelo de assinatura recorrente (mensal ou anual), processados através do gateway
                de pagamentos <strong>Asaas</strong>.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-mineral-600">
                <li>O cancelamento da assinatura pode ser solicitado a qualquer momento diretamente pelo painel administrativo da organização.</li>
                <li>Após o cancelamento, a vitrine e recursos permanecem ativos até o término do ciclo de faturamento vigente já quitado.</li>
                <li>O Nexo Ativo reserva-se o direito de reajustar valores mediante notificação prévia de 30 (trinta) dias aos contratantes.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-mineral-950">5. E-mails Transacionais e Limite de Cota</h2>
              <p>
                A plataforma disponibiliza envio de notificações transacionais por e-mail para a equipe e confirmação de solicitações para
                visitantes através de infraestrutura especializada (Resend). Cada plano possui um limite mensal de disparos garantido por
                competência. O envio em massa não solicitado (SPAM) é expressamente proibido e resultará na rescisão imediata da conta.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-mineral-950">6. Disponibilidade e Garantia</h2>
              <p>
                Empregamos as melhores práticas de engenharia, redundância em nuvem (Google Cloud / Firebase) e segurança da informação para
                garantir alta disponibilidade. No entanto, não respondemos por interrupções temporárias decorrentes de manutenções programadas,
                falhas em provedores de telecomunicações ou eventos de força maior.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-mineral-950">7. Foro e Legislação Aplicável</h2>
              <p>
                Estes Termos são regidos pelas leis da República Federativa do Brasil, em especial pelo Marco Civil da Internet (Lei nº 12.965/2014)
                e pelo Código de Defesa do Consumidor (Lei nº 8.078/1990). Fica eleito o foro da comarca do domicílio do contratante para dirimir
                quaisquer controvérsias decorrentes deste contrato.
              </p>
            </section>
          </article>

          <footer className="border-t border-marfim-200 pt-6 text-xs text-mineral-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p>© {new Date().getFullYear()} Nexo Ativo. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <Link href="/privacidade" className="underline hover:text-mineral-800">
                Política de Privacidade
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

