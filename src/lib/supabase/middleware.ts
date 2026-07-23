import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessApp } from "@/lib/trial";

const APP_PREFIXES = [
  "/dashboard",
  "/upload",
  "/transacoes",
  "/relatorios",
  "/configuracoes",
  "/assinatura",
  "/trial-acabou",
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
    path.startsWith("/relatorios") ||
    path.startsWith("/configuracoes")
  );
}

export async function updateSession(request: NextRequest) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Com Supabase configurado: app exige login (demo “sem conta” desligado)
  if (isAppPath(path) && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  // Utilizador logado não fica em login/cadastro (exceto fluxo de nova senha)
  if ((path === "/login" || path === "/cadastro" || path === "/esqueci-senha") && user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/dashboard";
    return NextResponse.redirect(redirect);
  }
  // /nova-senha: permite sessão (link de recuperação do e-mail)

  // Trial / bloqueio
  if (user && isProtectedAppPath(path)) {
    const { data: settings } = await supabase
      .from("user_settings")
      .select("trial_ends_at, subscription_status, plan")
      .eq("user_id", user.id)
      .maybeSingle();

    // Sem linha ainda: deixa passar; o client cria settings no 1º load
    if (settings) {
      const access = canAccessApp(settings);
      if (!access.ok) {
        const redirect = request.nextUrl.clone();
        redirect.pathname = "/trial-acabou";
        return NextResponse.redirect(redirect);
      }
    }
  }

  return supabaseResponse;
}
