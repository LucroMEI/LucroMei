import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { Resend } from "resend";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { hasPaidAccess } from "@/lib/trial";
import {
  firstNameFrom,
  isInternalAccount,
  pickTrialEmailKind,
  trialDaysElapsed,
  trialEmailContent,
  trialEmailHtml,
  type TrialEmailKind,
} from "@/lib/trial-emails";

export const runtime = "nodejs";
export const maxDuration = 60;

type SentMap = Partial<Record<TrialEmailKind, string>>;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization") || "";
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret") || "";
  if (secret) {
    return auth === `Bearer ${secret}` || querySecret === secret;
  }
  return request.headers.get("x-vercel-cron") === "1";
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}

async function run(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Falta RESEND_API_KEY." },
      { status: 503 }
    );
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Falta SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }

  const admin = createAdminClient();
  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM?.trim() || "LucroMei <onboarding@resend.dev>";
  const replyTo =
    process.env.RESEND_REPLY_TO?.trim() || "contato.lucromei@gmail.com";

  const users: User[] = [];

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 100,
    });
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    users.push(...data.users);
    if (data.users.length < 100) break;
  }

  const ids = users.map((u) => u.id);
  const settingsByUser = new Map<
    string,
    { subscription_status: string; plan: string; full_name: string | null }
  >();
  if (ids.length) {
    const { data: settings } = await admin
      .from("user_settings")
      .select("user_id, subscription_status, plan, full_name")
      .in("user_id", ids);
    for (const row of settings || []) {
      settingsByUser.set(row.user_id as string, {
        subscription_status: String(row.subscription_status || ""),
        plan: String(row.plan || ""),
        full_name: (row.full_name as string | null) ?? null,
      });
    }
  }

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users) {
    const email = user.email?.trim().toLowerCase() || "";
    const settings = settingsByUser.get(user.id);
    const fullName =
      settings?.full_name ||
      (user.user_metadata?.full_name as string | undefined) ||
      "";

    if (!email || isInternalAccount(email, fullName)) {
      skipped += 1;
      continue;
    }
    if (
      hasPaidAccess({
        subscription_status: (settings?.subscription_status || "trialing") as
          | "trialing"
          | "active"
          | "past_due"
          | "canceled"
          | "incomplete"
          | "none",
        plan: (settings?.plan || "trial") as
          | "trial"
          | "monthly"
          | "yearly"
          | "earlybird"
          | "none",
      })
    ) {
      skipped += 1;
      continue;
    }

    const days = trialDaysElapsed(user.created_at);
    const kind = pickTrialEmailKind(days);
    if (!kind) {
      skipped += 1;
      continue;
    }

    const meta = (user.user_metadata || {}) as Record<string, unknown>;
    const already = (meta.trial_emails_sent || {}) as SentMap;
    if (already[kind]) {
      skipped += 1;
      continue;
    }

    const name = firstNameFrom(fullName, email);
    const content = trialEmailContent(kind, name);

    const { error: sendErr } = await resend.emails.send({
      from,
      to: email,
      replyTo,
      subject: content.subject,
      text: content.text,
      html: trialEmailHtml(kind, name),
    });

    if (sendErr) {
      console.error("[trial-emails] send", kind, sendErr.message);
      errors += 1;
      continue;
    }

    const nextSent: SentMap = {
      ...already,
      [kind]: new Date().toISOString(),
    };
    const { error: metaErr } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...meta,
        trial_emails_sent: nextSent,
      },
    });
    if (metaErr) {
      console.error("[trial-emails] meta", metaErr.message);
    }
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent, skipped, errors });
}
