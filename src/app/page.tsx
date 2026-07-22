import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  BarChart3,
  Shield,
  Sparkles,
  Bell,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/disclaimer";
import { SiteFooter } from "@/components/site-footer";
import { InstagramLink } from "@/components/instagram-link";

const features = [
  {
    icon: Camera,
    title: "Foto ou PDF do comprovante",
    desc: "Envie pelo celular em segundos. Sem planilha complicada.",
  },
  {
    icon: Sparkles,
    title: "IA categoriza sozinha",
    desc: "A IA lê o comprovante e sugere categoria e se é dedutível.",
  },
  {
    icon: BarChart3,
    title: "Dashboard de lucro",
    desc: "Receitas, despesas, lucro estimado e impostos aproximados no mês.",
  },
  {
    icon: Bell,
    title: "Alerta do DAS",
    desc: "Não perca o vencimento e evite multa por esquecimento.",
  },
];

const steps = [
  "Tire foto ou envie o PDF do comprovante",
  "A IA preenche valor, data e categoria",
  "Veja lucro e impostos estimados no dashboard",
];

export default function LandingPage() {
  return (
    <div className="landing-shell min-h-screen">
      {/* Header sólido — sem glass/blur */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-base font-extrabold text-white shadow-sm">
              L
            </span>
            <span className="text-lg">LucroMEI</span>
          </div>
          <div className="flex items-center gap-2">
            <InstagramLink className="hidden sm:inline-flex" />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-700">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button size="sm" className="bg-emerald-600 font-semibold shadow-sm hover:bg-emerald-700">
                Testar grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero nítido */}
        <section className="landing-hero">
          <div className="mx-auto max-w-5xl px-4 pb-14 pt-10 text-center md:pb-20 md:pt-16">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm">
              <Shield className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
              Feito para MEIs e freelancers do Brasil · Fase de teste
            </div>

            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-5xl lg:text-[3.25rem]">
              Tira foto do comprovante.
              <br />
              <span className="text-emerald-600">Eu cuido do resto.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-relaxed text-slate-700 md:text-lg">
              Organize finanças sem dor de cabeça. A IA categoriza despesas, o
              dashboard mostra o lucro e uma estimativa de impostos — antes do fim
              do mês.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/cadastro">
                <Button
                  size="lg"
                  className="min-w-[230px] bg-emerald-600 text-base font-bold shadow-md hover:bg-emerald-700"
                >
                  Criar conta · 14 dias grátis
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="min-w-[230px] border-2 border-slate-300 bg-white text-base font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Já tenho conta
                </Button>
              </Link>
            </div>

            <p className="mt-4 max-w-lg text-sm font-medium text-slate-600">
              Crie sua conta e use <strong>14 dias grátis</strong>, sem cartão.
              Depois, se gostar, assina por <strong>R$ 39,90/mês</strong> — sem
              gostar, não paga nada.
            </p>

            <div className="mx-auto mt-8 max-w-md">
              <Disclaimer />
            </div>
          </div>
        </section>

        {/* Demo card — alto contraste */}
        <section className="mx-auto -mt-2 max-w-md px-4 pb-16 md:-mt-6">
          <div className="demo-phone rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Este mês</span>
              <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                Demo
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                  Receitas
                </p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums text-emerald-900">
                  R$ 1.650
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
                  Despesas
                </p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums text-rose-900">
                  R$ 458
                </p>
              </div>
              <div className="col-span-2 rounded-xl bg-slate-900 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Lucro estimado
                </p>
                <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight">
                  R$ 1.192
                </p>
                <p className="mt-2 text-sm font-medium text-emerald-300">
                  Impostos aprox. R$ 80,90 (DAS MEI)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              Simples de verdade
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-base font-medium text-slate-600">
              Feito para quem fatura até ~R$ 90 mil/ano e não quer contabilidade
              complexa.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <Icon className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-5xl border-t border-slate-200 bg-white px-4 py-16">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-900">
            Como funciona
          </h2>
          <ol className="mx-auto mt-10 max-w-md space-y-5">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-extrabold text-white shadow-sm">
                  {i + 1}
                </span>
                <span className="text-base font-semibold text-slate-800">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Pricing */}
        <section className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Preço justo
            </h2>
            <p className="mt-2 font-medium text-slate-600">
              Mais barato que uma multa de DAS — e economiza horas todo mês.
            </p>
            <div className="mx-auto mt-8 max-w-sm rounded-2xl border-2 border-emerald-600 bg-white p-6 text-left shadow-md">
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                Teste grátis · só paga se quiser continuar
              </p>
              <p className="mt-2 text-4xl font-extrabold tabular-nums text-slate-900">
                R$ 39,90
                <span className="text-base font-semibold text-slate-500">/mês</span>
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Só depois dos 14 dias, se você escolher assinar. Sem cartão no
                cadastro e sem cobrança automática no fim do teste.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm font-medium text-slate-800">
                {[
                  "14 dias grátis pra testar com calma",
                  "Sem cartão no cadastro",
                  "Só paga se assinar (pode parar quando quiser)",
                  "Upload de comprovantes + categorização com IA",
                  "Dashboard + estimativa de impostos e DAS",
                  "Exportar relatório",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-emerald-600"
                      strokeWidth={2.5}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" className="mt-6 block">
                <Button
                  className="w-full bg-emerald-600 font-bold hover:bg-emerald-700"
                  size="lg"
                >
                  Criar conta e testar 14 dias
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Legal */}
        <section className="border-t border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 className="text-xl font-extrabold text-slate-900">Transparência</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm font-medium text-slate-600">
              Antes de assinar, leia os documentos e tire suas dúvidas. Estamos em
              validação e respondemos com atenção.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {[
                ["/faq", "Dúvidas (FAQ)"],
                ["/contato", "Contato"],
                ["/termos", "Termos e vendas"],
                ["/privacidade", "Privacidade"],
                ["/confidencialidade", "Confidencialidade"],
              ].map(([href, label]) => (
                <Link key={href} href={href}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-300 font-semibold text-slate-800"
                  >
                    {label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-slate-200 bg-emerald-600 px-4 py-14 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            Pronto para saber o lucro de verdade?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-emerald-100">
            14 dias grátis · sem cartão · só paga se quiser continuar
          </p>
          <Link href="/cadastro" className="mt-6 inline-block">
            <Button
              size="lg"
              className="bg-white font-bold text-emerald-800 shadow-md hover:bg-emerald-50"
            >
              Criar conta grátis
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Button>
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
