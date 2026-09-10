import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessApp } from "@/lib/trial";

const APP_PREFIXES = [
  "/dashboard",
  "/upload",
  "/transacoes",
  "/despesas-fixas",
  "/relatorios",
  "/configuracoes",
  "/assinatura",
  "/trial-acabou",
  "/app",
  "/conta",
];

function isAppPath(path: string) {
  return APP_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

function isProtectedAppPath(path: string) {
  // Estas exigem login + trial/pago (assinatura e trial-acabou só login)
  return (
    path.startsWith("/dashboard") ||
    path.startsWith("/upload") ||
    path.startsWith("/transacoes") ||
    path.startsWith("/despesas-fixas") ||
    path.startsWith("/relatorios") ||
    path.startsWith("/configuracoes")
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("supabase-timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Home e páginas públicas: zero I/O no Supabase (evita 504 / Disk IO).
  if (!isAppPath(path)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sem Supabase: demo local (dev sem chaves)
  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  let user: User | null = null;
  try {
    const result = await withTimeout(supabase.auth.getUser(), 2500);
    user = result.data.user;
  } catch {
    // Auth/DB lento ou Disk IO estourado: não segura o middleware até o 504.
    user = null;
  }

  // Com Supabase configurado: app exige login (demo “sem conta” desligado)
  if (isAppPath(path) && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  // Trial / bloqueio — se o SELECT travar por Disk IO, deixa o client decidir.
  if (user && isProtectedAppPath(path)) {
    try {
      const { data: settings } = await withTimeout(
        supabase
          .from("user_settings")
          .select("trial_ends_at, subscription_status, plan")
          .eq("user_id", user.id)
          .maybeSingle(),
        2500
      );

      // Sem linha ainda: deixa passar; o client cria settings no 1º load
      if (settings) {
        const access = canAccessApp(settings);
        if (!access.ok) {
          const redirect = request.nextUrl.clone();
          redirect.pathname = "/trial-acabou";
          return NextResponse.redirect(redirect);
        }
      }
    } catch {
      // ignore — TrialBanner no client cobre o bloqueio
    }
  }

  return supabaseResponse;
}
