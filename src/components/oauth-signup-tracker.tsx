"use client";

import { useEffect } from "react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { trackLead } from "@/lib/lead-client";

/**
 * Depois de um cadastro novo com Google, o /callback acrescenta
 * `novo_cadastro=google` ao destino. Aqui marcamos o `sign_up` (GA4) e o aviso
 * por e-mail, uma vez só, e limpamos o parâmetro da URL.
 */
export function OAuthSignupTracker() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("novo_cadastro") !== "google") return;
    url.searchParams.delete("novo_cadastro");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);

    void (async () => {
      let token: string | undefined;
      try {
        if (isSupabaseConfigured()) {
          const { data } = await createClient().auth.getSession();
          token = data.session?.access_token;
        }
      } catch {
        /* ignore */
      }
      await trackLead("cadastro", token, "google");
    })();
  }, []);

  return null;
}
