import type { Metadata } from "next";
import Link from "next/link";
import { Calculator } from "lucide-react";
import { LimiteMeiCalculator } from "@/components/limite-mei-calculator";
import { SiteFooter } from "@/components/site-footer";
import { InstagramLink } from "@/components/instagram-link";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/disclaimer";
import { formatBRL } from "@/lib/format";
import { LIMITE_MEI_ANUAL } from "@/lib/taxes";
import { getSiteUrl } from "@/lib/site";

const title = "Calculadora do limite MEI 2026";
const description = `Calcule grátis se você está perto do teto de faturamento MEI (${formatBRL(LIMITE_MEI_ANUAL)}/ano). Projeção simples + quanto ainda cabe no limite.`;

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} · LucroMEI`,
    description,
    url: `${getSiteUrl()}/calculadora`,
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · LucroMEI`,
    description,
  },
  alternates: {
    canonical: `${getSiteUrl()}/calculadora`,
  },
  keywords: [
    "limite MEI",
    "calculadora MEI",
    "faturamento MEI 81000",
    "teto MEI",
    "desenquadramento MEI",
    "R$ 81 mil",
  ],
};

export default function CalculadoraPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-base font-extrabold text-white shadow-sm">
              L
            </span>
            <span className="text-lg">LucroMEI</span>
          </Link>
          <div className="flex items-center gap-2">
            <InstagramLink className="hidden sm:inline-flex" />
            <Link href="/cadastro">
              <Button
                size="sm"
                className="bg-emerald-600 font-semibold shadow-sm hover:bg-emerald-700"
              >
                14 dias grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Link
          href="/"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Voltar ao início
        </Link>

        <div className="mt-4 flex items-start gap-3">
          <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Calculator className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Calculadora do limite MEI
            </h1>
            <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
              O teto de faturamento bruto do MEI é{" "}
              <strong className="text-slate-900">
                {formatBRL(LIMITE_MEI_ANUAL)} por ano
              </strong>
              . Informe o que já faturou e a média mensal — a gente projeta se
              você fica dentro, perto ou acima do limite.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <LimiteMeiCalculator />
        </div>

        <div className="mt-8">
          <Disclaimer />
        </div>

        <section className="mt-10 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">
            O que é o limite de R$ 81 mil?
          </h2>
          <p>
            Para continuar como MEI, o faturamento bruto no ano civil não pode
            ultrapassar {formatBRL(LIMITE_MEI_ANUAL)} (regra em vigor — confira
            sempre no Portal do Empreendedor, pois a lei pode mudar).
          </p>
          <p>
            Estourar o teto pode levar a <strong>desenquadramento</strong> e
            mudança de regime tributário. Esta calculadora é só uma{" "}
            <strong>estimativa didática</strong>: não substitui contador nem o
            cálculo oficial da Receita.
          </p>
          <p>
            Dica prática: some todas as notas/receitas do ano (não só o que
            entrou na conta depois de taxas). No app LucroMEI, o dashboard
            acompanha o % do limite com base nas receitas que você registra.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
