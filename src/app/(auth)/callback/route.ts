import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserSettings } from "@/lib/user-settings";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        if (data.user) {
          await ensureUserSettings(supabase, data.user);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // fall through
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
