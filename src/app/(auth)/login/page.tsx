"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordField } from "@/components/password-field";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { getRecentEmails, rememberEmail } from "@/lib/saved-accounts";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentEmails, setRecentEmails] = useState<string[]>([]);

  useEffect(() => {
    setRecentEmails(getRecentEmails());
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
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        setError(err.message);
        return;
      }
      if (data.user) {
        const { ensureUserSettings } = await import("@/lib/user-settings");
        await ensureUserSettings(supabase, data.user);
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
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/callback?next=${encodeURIComponent(next)}` },
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Entre com e-mail e senha. O teste grátis de 14 dias começa no cadastro
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </Button>
          <p className="text-center text-[11px] leading-relaxed text-slate-500">
            Várias contas: escolha o e-mail em baixo ou deixe o Chrome/Edge guardar
            cada senha. Toque no olho para ver a senha.
          </p>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          ou
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={loginGoogle}>
          Continuar com Google
        </Button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-emerald-700 hover:underline">
            Criar conta
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <Link href="/" className="mb-6 flex items-center gap-2 font-bold text-emerald-700">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
          L
        </span>
        LucroMEI
      </Link>
      <Suspense fallback={<p className="text-sm text-slate-500">Carregando…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
