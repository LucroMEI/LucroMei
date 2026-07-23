"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

function AssinaturaInner() {
  const { ready, settings, reload } = useFinance();
  const search = useSearchParams();
  const [loading, setLoading] = useState<CheckoutPlan | "portal" | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const success = search.get("success");
    const sessionId = search.get("session_id");
    const canceled = search.get("canceled");

    if (canceled) {
      setError("Checkout cancelado. Pode tentar de novo quando quiser.");
      return;
    }

    if (success === "1" && sessionId) {
      setSyncing(true);
      (async () => {
        try {
          const res = await fetch("/api/stripe/sync-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
          const data = await res.json();
          if (!res.ok || data.ok === false) {
            setError(
              data.error ||
                "Pagamento recebido, mas a sincronização atrasou. Atualize a página em alguns segundos."
            );
          } else {
            setSuccessMsg("Pagamento confirmado! A sua assinatura está ativa.");
            await reload();
          }
        } catch {
          setError("Erro ao confirmar assinatura. Atualize a página em breve.");
        } finally {
          setSyncing(false);
        }
      })();
    } else if (success === "1") {
      setSuccessMsg("Pagamento concluído. A atualizar o seu plano…");
      void reload();
    }
  }, [search, reload]);

  async function checkout(plan: CheckoutPlan) {
    setError("");
    setSuccessMsg("");
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
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
      const res = await fetch("/api/stripe/portal", { method: "POST" });
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
  const isActive = settings?.subscription_status === "active";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plano e assinatura</h1>
        <p className="text-sm text-slate-600">
          Status:{" "}
          <strong className="capitalize">
            {settings?.subscription_status || "trialing"}
          </strong>
          {settings?.plan && settings.plan !== "none" && (
            <> · Plano: <strong>{settings.plan}</strong></>
          )}
          {trialEnd && settings?.subscription_status === "trialing" && (
            <> · Teste até {trialEnd}</>
          )}
        </p>
      </div>

      {syncing && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <Loader2 className="h-4 w-4 animate-spin" />
          A confirmar pagamento com a Stripe…
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          {successMsg}{" "}
          <a href="/dashboard" className="underline">
            Ir ao dashboard
          </a>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </div>
      )}

      {isActive ? (
        <Card className="border-2 border-emerald-500">
          <CardHeader>
            <CardTitle>Assinatura ativa</CardTitle>
            <CardDescription>
              Obrigado! Tem acesso completo ao LucroMEI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={openPortal} disabled={loading !== null}>
              {loading === "portal" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Gerenciar assinatura / cancelar (Stripe)"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                  <p className="pt-2 text-2xl font-extrabold text-slate-900">
                    {info.price}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant={highlight ? "default" : "outline"}
                    disabled={loading !== null || syncing}
                    onClick={() => checkout(plan)}
                  >
                    {loading === plan ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Assinar com cartão"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
          {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test") ? (
            <p className="mt-4 text-xs text-slate-500">
              Modo teste Stripe: use o cartão{" "}
              <code className="rounded bg-slate-100 px-1">4242 4242 4242 4242</code>,
              data futura, CVC qualquer.
            </p>
          ) : (
            <p className="mt-4 text-xs text-slate-500">
              Pagamento real com cartão. Pode cancelar a qualquer momento no portal da
              assinatura. Trial de 14 dias não exige cartão no cadastro.
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-slate-400">
        Pagamentos processados com segurança pela Stripe. Cancele a qualquer momento.
      </p>
    </div>
  );
}

export default function AssinaturaPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Carregando…</p>}>
      <AssinaturaInner />
    </Suspense>
  );
}
