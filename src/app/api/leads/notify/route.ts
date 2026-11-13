import { NextResponse } from "next/server";
import { createClient as createJsClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { sendOwnerLead, type OwnerLeadKind } from "@/lib/owner-leads";
import { isInternalAccount } from "@/lib/trial-emails";

export const runtime = "nodejs";

type NotifyKind = Extract<OwnerLeadKind, "cadastro" | "primeiro_comprovante">;
type SentMap = Partial<Record<NotifyKind, string>>;

function isNotifyKind(value: unknown): value is NotifyKind {
  return value === "cadastro" || value === "primeiro_comprovante";
}

async function userFromRequest(request: Request): Promise<User | null> {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (token && url && anon) {
    try {
      const client = createJsClient(url, anon, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data } = await client.auth.getUser(token);
      if (data.user) return data.user;
    } catch {
      /* tenta cookie abaixo */
    }
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { kind?: unknown };
  if (!isNotifyKind(body.kind)) {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  }
  const kind = body.kind;

  const user = await userFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const email = user.email?.trim() || "";
  const fullName =
    (user.user_metadata?.full_name as string | undefined) || "";

  if (isInternalAccount(email, fullName)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const meta = (user.user_metadata || {}) as Record<string, unknown>;
  const already = (meta.owner_leads_sent || {}) as SentMap;
  if (already[kind]) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const sent = await sendOwnerLead(kind, { fullName, email });
  if (!sent.ok) {
    return NextResponse.json(
      { ok: false, error: sent.error || "Falha ao avisar." },
      { status: 502 }
    );
  }

  if (isAdminConfigured()) {
    try {
      const admin = createAdminClient();
      const nextSent: SentMap = {
        ...already,
        [kind]: new Date().toISOString(),
      };
      await admin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...meta,
          owner_leads_sent: nextSent,
        },
      });
    } catch (err) {
      console.error(
        "[leads.notify] meta",
        err instanceof Error ? err.message : err
      );
    }
  }

  return NextResponse.json({ ok: true });
}
