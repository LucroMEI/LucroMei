"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { ensureUserSettings } from "@/lib/user-settings";
import { canAccessApp } from "@/lib/trial";
import { formatDateBR } from "@/lib/format";

export function TrialBanner() {
  const [text, setText] = useState<string | null>(null);
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const settings = await ensureUserSettings(supabase, user);
        if (!settings) return;
        const access = canAccessApp(settings);
        if (!access.ok) return;
        if (access.daysLeft == null) return;
        if (access.daysLeft <= 3) setUrgent(true);
        const end = settings.trial_ends_at
          ? formatDateBR(settings.trial_ends_at.slice(0, 10))
          : "";
        setText(
          access.daysLeft <= 0
            ? `Último dia do teste grátis${end ? ` (${end})` : ""}.`
            : `Teste grátis: ${access.daysLeft} dia(s) restante(s)${end ? ` · até ${end}` : ""}.`
        );
      } catch {
        // ignore
      }
    })();
  }, []);

  if (!text) return null;

  return (
    <div
      className={`border-b px-4 py-2 text-center text-xs font-medium sm:text-sm ${
        urgent
          ? "border-amber-300 bg-amber-50 text-amber-950"
          : "border-emerald-200 bg-emerald-50 text-emerald-900"
      }`}
    >
      {text}{" "}
      <Link href="/assinatura" className="font-bold underline">
        Ver planos
      </Link>
    </div>
  );
}
