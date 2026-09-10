import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserSettings } from "@/lib/user-settings";

function safeNext(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/dashboard";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        if (data.user) {
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
