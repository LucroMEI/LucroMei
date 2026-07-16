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

const features = [
  {
    icon: Camera,
    title: "Foto ou PDF do comprovante",
    desc: "Envie pelo celular em segundos. Sem planilha complicada.",
  },
  {
    icon: Sparkles,
    title: "IA categoriza sozinha",
    desc: "Grok Vision lê o comprovante e sugere categoria e se é dedutível.",
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
    <div className="hero-blob min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2 font-bold text-emerald-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            L
          </span>
          LucroMEI
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href="/cadastro">
            <Button size="sm">Testar grátis</Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-8 text-center md:pt-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <Shield className="h-3.5 w-3.5" />
            Feito para MEIs e freelancers do Brasil
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Tira foto do comprovante.{" "}
            <span className="text-emerald-600">Eu cuido do resto.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Organize finanças sem dor de cabeça. A IA categoriza despesas, o dashboard
            mostra o lucro e você vê uma estimativa de impostos — antes do fim do mês.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/dashboard">
              <Button size="lg" className="min-w-[220px]">
                Testar grátis 14 dias
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button size="lg" variant="outline" className="min-w-[220px]">
                Criar conta
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Sem cartão no teste · R$ 39,90/mês depois · Cancele quando quiser
          </p>
          <div className="mx-auto mt-10 max-w-md">
            <Disclaimer />
          </div>
        </section>

        {/* Demo card */}
        <section className="mx-auto max-w-lg px-4 pb-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Este mês</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Demo
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs text-emerald-700">Receitas</p>
                <p className="text-xl font-bold text-emerald-800">R$ 1.650</p>
              </div>
              <div className="rounded-2xl bg-rose-50 p-4">
                <p className="text-xs text-rose-700">Despesas</p>
                <p className="text-xl font-bold text-rose-800">R$ 458</p>
              </div>
              <div className="col-span-2 rounded-2xl bg-slate-900 p-4 text-white">
                <p className="text-xs text-slate-300">Lucro estimado</p>
                <p className="text-2xl font-bold">R$ 1.192</p>
                <p className="mt-1 text-xs text-slate-400">
                  Impostos aprox. R$ 80,90 (DAS MEI)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-2xl font-bold text-slate-900 md:text-3xl">
              Simples de verdade
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">
              Feito para quem fatura até ~R$ 90 mil/ano e não quer contabilidade complexa.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold">Como funciona</h2>
          <ol className="mx-auto mt-8 max-w-md space-y-4">
            {steps.map((s, i) => (
              <li key={s} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="pt-1 text-slate-700">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Pricing */}
        <section className="border-t border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 className="text-2xl font-bold">Preço justo</h2>
            <p className="mt-2 text-slate-600">
              Mais barato que uma multa de DAS — e economiza horas todo mês.
            </p>
            <div className="mx-auto mt-8 max-w-sm rounded-3xl border-2 border-emerald-500 bg-white p-6 text-left shadow-lg">
              <p className="text-sm font-medium text-emerald-700">Plano único</p>
              <p className="mt-1 text-4xl font-extrabold text-slate-900">
                R$ 39,90
                <span className="text-base font-medium text-slate-500">/mês</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                {[
                  "14 dias grátis",
                  "Upload ilimitado de comprovantes",
                  "Categorização com IA",
                  "Dashboard + estimativa de impostos",
                  "Alertas de DAS",
                  "Exportar relatório",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="mt-6 block">
                <Button className="w-full" size="lg">
                  Começar teste grátis
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Ajuda legal */}
        <section className="border-t border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 className="text-xl font-bold text-slate-900">Transparência</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
              Antes de assinar, leia os documentos e tire suas dúvidas. Estamos em
              validação e respondemos com atenção.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/faq">
                <Button variant="outline" size="sm">
                  Dúvidas (FAQ)
                </Button>
              </Link>
              <Link href="/contato">
                <Button variant="outline" size="sm">
                  Contato
                </Button>
              </Link>
              <Link href="/termos">
                <Button variant="outline" size="sm">
                  Termos e vendas
                </Button>
              </Link>
              <Link href="/privacidade">
                <Button variant="outline" size="sm">
                  Privacidade
                </Button>
              </Link>
              <Link href="/confidencialidade">
                <Button variant="outline" size="sm">
                  Confidencialidade
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Pronto para saber o lucro de verdade?
          </h2>
          <Link href="/dashboard" className="mt-6 inline-block">
            <Button size="lg">
              Abrir o app agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Disclaimer compact className="mt-8" />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
