"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "@/lib/use-finance";
import { formatDateBR } from "@/lib/format";
import { PLAN_LABELS, type CheckoutPlan } from "@/lib/stripe";

const features = [
  "Upload ilimitado de comprovantes",
  "Categorização automática com IA",
  "Dashboard de receitas, despesas e lucro",
  "Estimativa de DAS e impostos",
  "Alertas de vencimento",
  "Exportar relatórios CSV",
];

export default function AssinaturaPage() {
  const { ready, settings } = useFinance();
  const [loading, setLoading] = useState<CheckoutPlan | "portal" | null>(null);
  const [error, setError] = useState("");

  async function checkout(plan: CheckoutPlan) {
    setError("");
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          email: "demo@lucromei.app",
          customerId: settings?.stripe_customer_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível iniciar o checkout");
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("URL de checkout ausente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no Stripe");
    } finally {
      setLoading(null);
    }
  }

  async function openPortal() {
    setError("");
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: settings?.stripe_customer_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Portal indisponível");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no portal");
    } finally {
      setLoading(null);
    }
  }

  if (!ready) return <p className="text-sm text-slate-500">Carregando…</p>;

  const trialEnd = settings?.trial_ends_at
    ? formatDateBR(settings.trial_ends_at.slice(0, 10))
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plano e assinatura</h1>
        <p className="text-sm text-slate-600">
          Status:{" "}
          <strong className="capitalize">{settings?.subscription_status || "trialing"}</strong>
          {trialEnd && settings?.subscription_status === "trialing" && (
            <> · Teste até {trialEnd}</>
          )}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
          <p className="mt-1 text-xs">
            Configure as chaves Stripe no arquivo <code>.env.local</code> (veja{" "}
            <code>.env.example</code>). Conta:{" "}
            <a
              className="underline"
              href="https://dashboard.stripe.com/acct_1PCKl8PxfxckETDg/dashboard"
              target="_blank"
              rel="noreferrer"
            >
              dashboard Stripe
            </a>
            .
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(PLAN_LABELS) as CheckoutPlan[]).map((plan) => {
          const info = PLAN_LABELS[plan];
          const highlight = plan === "monthly";
          return (
            <Card
              key={plan}
              className={highlight ? "border-2 border-emerald-500 shadow-md" : ""}
            >
              <CardHeader>
                {highlight && (
                  <span className="mb-1 text-xs font-semibold text-emerald-700">
                    Recomendado
                  </span>
                )}
                <CardTitle>{info.name}</CardTitle>
                <CardDescription>{info.blurb}</CardDescription>
                <p className="pt-2 text-2xl font-extrabold text-slate-900">{info.price}</p>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant={highlight ? "default" : "outline"}
                  disabled={loading !== null}
                  onClick={() => checkout(plan)}
                >
                  {loading === plan ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Assinar"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tudo incluso em qualquer plano</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                {f}
              </li>
            ))}
          </ul>
          {settings?.stripe_customer_id && (
            <Button
              variant="outline"
              className="mt-6"
              onClick={openPortal}
              disabled={loading !== null}
            >
              {loading === "portal" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Gerenciar assinatura (Stripe)"
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-slate-400">
        Pagamentos processados com segurança pela Stripe. Cancele a qualquer momento.
        Ao assinar, você aceita os{" "}
        <a href="/termos" className="underline hover:text-slate-600">
          Termos e Condições Gerais de Venda
        </a>
        , a{" "}
        <a href="/privacidade" className="underline hover:text-slate-600">
          Privacidade
        </a>{" "}
        e a{" "}
        <a href="/confidencialidade" className="underline hover:text-slate-600">
          Confidencialidade
        </a>
        .{" "}
        <a href="/faq" className="underline hover:text-slate-600">
          Dúvidas?
        </a>{" "}
        <a href="/contato" className="underline hover:text-slate-600">
          Contato
        </a>
        .
      </p>
    </div>
  );
}
