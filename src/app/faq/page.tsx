import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { LegalShell, H2, P } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Dúvidas frequentes (FAQ)",
  description: "Perguntas e respostas sobre o LucroMEI, preços, DAS, privacidade e teste grátis.",
};

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "O que é o LucroMEI?",
    a: (
      <>
        É um app simples para MEIs e freelancers organizarem finanças: você tira foto
        ou envia PDF do comprovante, a ferramenta ajuda a categorizar e o dashboard
        mostra receitas, despesas, lucro estimado e impostos aproximados (como o DAS).
      </>
    ),
  },
  {
    q: "Substitui o contador?",
    a: (
      <>
        <strong>Não.</strong> O LucroMEI é organização e estimativa. Não substitui
        contador, DAS oficial do Portal do Empreendedor, nem declarações à Receita.
        Use como apoio no dia a dia.
      </>
    ),
  },
  {
    q: "Quanto custa?",
    a: (
      <>
        Teste grátis de <strong>14 dias</strong>. Depois, plano mensal de referência{" "}
        <strong>R$ 39,90/mês</strong>, com opções anual e early bird quando disponíveis.
        Veja a página de{" "}
        <Link href="/assinatura" className="text-emerald-700 underline">
          planos
        </Link>
        .
      </>
    ),
  },
  {
    q: "Como funciona o teste grátis?",
    a: (
      <>
        Você pode explorar o app e, no fluxo de assinatura, o Stripe pode oferecer 14
        dias de trial conforme o plano. Cancele antes do fim do teste se não quiser
        continuar — assim evita a primeira cobrança.
      </>
    ),
  },
  {
    q: "Como cancelo a assinatura?",
    a: (
      <>
        Pelo portal do cliente Stripe (quando a assinatura estiver ativa) ou pedindo
        cancelamento pela página de{" "}
        <Link href="/contato" className="text-emerald-700 underline">
          Contato
        </Link>
        . O acesso segue até o fim do período já pago, em regra.
      </>
    ),
  },
  {
    q: "Os valores de imposto estão 100% corretos?",
    a: (
      <>
        São <strong>estimativas</strong>. Conferir e pagar o tributo oficial é sempre
        sua responsabilidade (e/ou do seu contador). Veja os{" "}
        <Link href="/termos" className="text-emerald-700 underline">
          Termos
        </Link>
        .
      </>
    ),
  },
  {
    q: "Meus comprovantes ficam seguros?",
    a: (
      <>
        Tratamos dados com sigilo e conforme a LGPD. Detalhes em{" "}
        <Link href="/privacidade" className="text-emerald-700 underline">
          Privacidade
        </Link>{" "}
        e{" "}
        <Link href="/confidencialidade" className="text-emerald-700 underline">
          Confidencialidade
        </Link>
        . Pagamentos vão pela Stripe; cartão completo não fica conosco.
      </>
    ),
  },
  {
    q: "A IA erra a categoria. E agora?",
    a: (
      <>
        É esperado em alguns casos. Sempre revise valor, data e categoria antes de
        salvar. Você pode corrigir manualmente — a palavra final é sua.
      </>
    ),
  },
  {
    q: "Funciona no celular?",
    a: (
      <>
        Sim. O site é mobile-first: use pelo navegador do celular (Chrome, Safari etc.).
      </>
    ),
  },
  {
    q: "Emitem nota fiscal pelo app?",
    a: (
      <>
        Não no MVP. O foco é organizar comprovantes e enxergar lucro/impostos
        estimados. Emissão de NF-e fica para versões futuras ou com seu contador.
      </>
    ),
  },
  {
    q: "Estou nos primeiros 20 testes. O que preciso fazer?",
    a: (
      <>
        Usar o app de verdade por alguns dias e mandar feedback sincero (o que
        gostou, o que faltou, se pagaria). Fale conosco no Instagram{" "}
        <a
          href="https://www.instagram.com/lucromei.oficial"
          className="text-emerald-700 underline"
          target="_blank"
          rel="noreferrer"
        >
          @lucromei.oficial
        </a>{" "}
        ou na página Contato.
      </>
    ),
  },
  {
    q: "Como falo com vocês?",
    a: (
      <>
        Página{" "}
        <Link href="/contato" className="text-emerald-700 underline">
          Contato
        </Link>{" "}
        ou DM no Instagram @lucromei.oficial.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <LegalShell
      title="Dúvidas frequentes"
      subtitle="Respostas rápidas sobre o LucroMEI. Não encontrou a sua? Fale no Contato."
    >
      <div className="space-y-4">
        {faqs.map((item, i) => (
          <details
            key={i}
            className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 open:shadow-sm"
          >
            <summary className="cursor-pointer list-none font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-3">
                <span>
                  {i + 1}. {item.q}
                </span>
                <span className="shrink-0 text-emerald-600 transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <div className="mt-3 border-t border-slate-100 pt-3 text-slate-600">
              {item.a}
            </div>
          </details>
        ))}
      </div>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6">
        <H2>Ainda com dúvida?</H2>
        <P>
          Estamos em validação e respondemos com atenção.{" "}
          <Link href="/contato" className="font-semibold text-emerald-800 underline">
            Fale conosco
          </Link>
          .
        </P>
      </section>
    </LegalShell>
  );
}
