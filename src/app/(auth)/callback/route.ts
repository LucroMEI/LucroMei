import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserSettings } from "@/lib/user-settings";

/** Conta criada agora pelo Google (OAuth) → o cliente marca o `sign_up` no GA4. */
function isNewOAuthUser(user: {
  created_at?: string;
  app_metadata?: { provider?: string };
}) {
  if (user.app_metadata?.provider !== "google" || !user.created_at) return false;
  const created = Date.parse(user.created_at);
  return Number.isFinite(created) && Date.now() - created < 10 * 60 * 1000;
}

function withParam(path: string, key: string, value: string) {
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`;
}

function safeNext(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/dashboard";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = safeNext(searchParams.get("next"));

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        if (data.user) {
          if (isNewOAuthUser(data.user)) {
            next = withParam(next, "novo_cadastro", "google");
          }
          try {
            await Promise.race([
              ensureUserSettings(supabase, data.user),
              new Promise((resolve) => setTimeout(resolve, 2000)),
            ]);
          } catch {
            // Sessão já existe; settings podem ser criadas no dashboard.
          }
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // fall through
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
