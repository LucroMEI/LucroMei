import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const LOGGED_PREFIXES = [
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
] as const;

function isLoggedArea(path: string) {
  // Compara path === prefixo ou prefixo + "/", para /conta não casar com /contato.
  return LOGGED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  // Home, login, cadastro, FAQ, /contato, etc. nunca checam sessão.
  if (!isLoggedArea(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/upload",
    "/upload/:path*",
    "/transacoes",
    "/transacoes/:path*",
    "/despesas-fixas",
    "/despesas-fixas/:path*",
    "/relatorios",
    "/relatorios/:path*",
    "/configuracoes",
    "/configuracoes/:path*",
    "/assinatura",
    "/assinatura/:path*",
    "/trial-acabou",
    "/trial-acabou/:path*",
    "/app",
    "/app/:path*",
    "/conta",
    "/conta/:path*",
  ],
};
