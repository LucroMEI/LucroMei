"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { ensureUserSettings } from "@/lib/user-settings";
import { formatDateBR } from "@/lib/format";

export default function TrialAcabouPage() {
  const [endLabel, setEndLabel] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? null);
      const settings = await ensureUserSettings(supabase, user);
      if (settings?.trial_ends_at) {
        setEndLabel(formatDateBR(settings.trial_ends_at.slice(0, 10)));
      }
    })();
  }, []);

  async function logout() {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    window.location.href = "/";
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-2">
      <Card className="border-2 border-amber-300 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Seu teste grátis de 14 dias terminou</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <p>
            {email ? (
              <>
                Conta: <strong>{email}</strong>
                <br />
              </>
            ) : null}
            {endLabel ? (
              <>
                O período de avaliação encerrou em <strong>{endLabel}</strong>.
              </>
            ) : (
              <>O período de avaliação de 14 dias encerrou.</>
            )}
          </p>
          <p>
            Para continuar a usar o LucroMEI (upload de comprovantes, dashboard e
            alertas), será necessário assinar um plano.
          </p>
          <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
            A cobrança automática via Stripe será ligada em breve. Enquanto isso,
            fale conosco em{" "}
            <a href="/contato" className="font-semibold text-emerald-700 underline">
              Contato
            </a>{" "}
            ou{" "}
            <a
              href="mailto:contato.lucromei@gmail.com"
              className="font-semibold text-emerald-700 underline"
            >
              contato.lucromei@gmail.com
            </a>{" "}
            se precisar de mais dias de teste.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/assinatura" className="flex-1">
              <Button className="w-full">Ver planos</Button>
            </Link>
            <Link href="/contato" className="flex-1">
              <Button variant="outline" className="w-full">
                Falar conosco
              </Button>
            </Link>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full text-center text-xs font-medium text-slate-500 underline"
          >
            Sair da conta
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
