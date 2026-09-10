"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordField } from "@/components/password-field";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { getRecentEmails, rememberEmail } from "@/lib/saved-accounts";

function safeNext(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const [next, setNext] = useState("/dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [recentEmails, setRecentEmails] = useState<string[]>([]);

  useEffect(() => {
    setRecentEmails(getRecentEmails());
    const params = new URLSearchParams(window.location.search);
    setNext(safeNext(params.get("next")));
    if (params.get("error") === "auth") {
      setError(
        "Não foi possível concluir o login com Google agora. Tente de novo, ou entre com e-mail e senha."
      );
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setError(
          "Login real não está ativo (falta Supabase). Configure NEXT_PUBLIC_SUPABASE_URL e ANON_KEY."
        );
        return;
      }
      const supabase = createClient();
      const signIn = supabase.auth.signInWithPassword({ email, password });
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "O servidor está lento agora. Espere 1 minuto e tente de novo."
              )
            ),
          12000
        )
      );
      const { data, error: err } = await Promise.race([signIn, timeout]);
      if (err) {
        const msg = err.message || "Não foi possível entrar.";
        if (/invalid login credentials/i.test(msg)) {
          setError(
            "E-mail ou senha incorretos. Se você criou a conta com Google, use o botão Continuar com Google."
          );
        } else {
          setError(msg);
        }
        return;
      }
      if (data.user) {
        try {
          const { ensureUserSettings } = await import("@/lib/user-settings");
          await Promise.race([
            ensureUserSettings(supabase, data.user),
            new Promise((resolve) => setTimeout(resolve, 2500)),
          ]);
        } catch {
          // Settings podem esperar — a sessão já está criada.
        }
      }
      rememberEmail(email);
      setRecentEmails(getRecentEmails());
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  async function loginGoogle() {
    if (!isSupabaseConfigured()) {
      router.push(next);
      return;
    }
    setError("");
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${origin}/callback?next=${encodeURIComponent(next)}` },
      });
      if (err) {
        setError(err.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar com Google");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF6EE] px-4">
      <Link href="/" className="mb-6 flex items-center gap-2 font-bold text-emerald-700">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
          L
        </span>
        LucroMEI
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Entre com e-mail e senha. Os 14 dias grátis começam no cadastro
            (sem cartão; só paga se assinar depois).
            {!isSupabaseConfigured() && (
              <span className="mt-1 block text-amber-700">
                Supabase ainda não configurado neste ambiente — o login real não funciona até
                colar as chaves.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onSubmit}
            className="space-y-4"
            name="lucromei-login"
            autoComplete="on"
            method="post"
          >
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="username"
                type="email"
                autoComplete="username"
                list="lucromei-recent-emails"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
              />
              {recentEmails.length > 0 && (
                <datalist id="lucromei-recent-emails">
                  {recentEmails.map((e) => (
                    <option key={e} value={e} />
                  ))}
                </datalist>
              )}
              {recentEmails.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {recentEmails.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmail(e)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <PasswordField
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
            />
            <div className="text-right">
              <Link
                href="/esqueci-senha"
                className="text-xs font-medium text-emerald-700 hover:underline"
              >
                Esqueci a senha
              </Link>
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading || googleLoading}>
              {loading ? "Entrando…" : "Entrar"}
            </Button>
            <p className="text-center text-[11px] leading-relaxed text-slate-500">
              Conta Google (Gmail): use o botão abaixo. Senha só funciona se você
              cadastrou uma no LucroMEI.
            </p>
          </form>
          <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            ou
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={loginGoogle}
            disabled={loading || googleLoading}
          >
            {googleLoading ? "Abrindo Google…" : "Continuar com Google"}
          </Button>
          <p className="mt-4 text-center text-sm text-slate-600">
            Não tem conta?{" "}
            <Link href="/cadastro" className="font-semibold text-emerald-700 hover:underline">
              Criar conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
