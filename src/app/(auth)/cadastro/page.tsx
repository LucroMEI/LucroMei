"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { ensureUserSettings } from "@/lib/user-settings";

export default function CadastroPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setError(
          "Cadastro real ainda não está ativo neste ambiente (falta Supabase). Configure as chaves e tente de novo."
        );
        return;
      }
      if (password.length < 6) {
        setError("Senha deve ter pelo menos 6 caracteres.");
        return;
      }
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/callback?next=/dashboard`,
        },
      });
      if (err) {
        setError(err.message);
        return;
      }

      if (data.user) {
        await ensureUserSettings(supabase, data.user);
      }

      // Se a sessão já veio (confirmação de e-mail desligada no Supabase)
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setNeedsEmailConfirm(true);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <Link href="/" className="mb-6 flex items-center gap-2 font-bold text-emerald-700">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
          L
        </span>
        LucroMEI
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>
            <strong>14 dias grátis</strong> a partir do cadastro · Sem cartão no teste ·
            Depois R$ 39,90/mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="space-y-3 text-center text-sm text-slate-700">
              {needsEmailConfirm ? (
                <>
                  <p className="font-semibold text-emerald-800">Conta criada!</p>
                  <p>
                    Verifique o e-mail <strong>{email}</strong> e confirme o link. Depois
                    entre com a sua senha — o teste de <strong>14 dias</strong> começa ao
                    criar a conta.
                  </p>
                  <Button className="w-full" onClick={() => router.push("/login")}>
                    Ir para Entrar
                  </Button>
                </>
              ) : (
                <p>Redirecionando…</p>
              )}
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Criando…" : "Começar teste grátis de 14 dias"}
              </Button>
              <p className="text-center text-[11px] text-slate-500">
                Ao criar a conta, o prazo de 14 dias começa a contar. Depois será
                necessário assinar para continuar.
              </p>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-slate-600">
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
