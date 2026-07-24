"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordField } from "@/components/password-field";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { ensureUserSettings } from "@/lib/user-settings";
import { rememberEmail } from "@/lib/saved-accounts";

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

      // Guarda e-mail recente (senha fica no gestor do navegador, se o user aceitar)
      rememberEmail(email);

      // Nesta fase: sem exigir verificação de e-mail — entra no app se houver sessão
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Fallback: tenta login imediato (quando o Supabase não devolve session no signUp)
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInData.session) {
        if (signInData.user) {
          await ensureUserSettings(supabase, signInData.user);
        }
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Só se o projeto Supabase ainda exigir confirmação de e-mail
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
            <strong>14 dias grátis</strong> a partir do cadastro ·{" "}
            <strong>sem cartão</strong> · sem cobrança automática. Se gostar, assina
            por R$ 39,90/mês; se não, encerra o teste e não paga nada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="space-y-3 text-center text-sm text-slate-700">
              {needsEmailConfirm ? (
                <>
                  <p className="font-semibold text-emerald-800">Conta criada!</p>
                  <p>
                    Sua conta <strong>{email}</strong> foi criada. O teste de{" "}
                    <strong>14 dias</strong> começa ao entrar.
                  </p>
                  <p className="text-slate-600">
                    Se o login pedir confirmação de e-mail, é uma opção do painel
                    Supabase (nesta fase pode desligar). Por agora, tente{" "}
                    <strong>Entrar</strong> com a mesma senha.
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
            <form
              onSubmit={onSubmit}
              className="space-y-4"
              name="lucromei-cadastro"
              autoComplete="on"
              method="post"
            >
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
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
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  required
                />
              </div>
              <PasswordField
                id="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Criando…" : "Começar teste grátis de 14 dias"}
              </Button>
              <p className="text-center text-[11px] leading-relaxed text-slate-500">
                Ao criar a conta, começam os 14 dias grátis (sem cartão). No fim do
                teste, o app pede assinatura só se você quiser seguir usando —{" "}
                <strong>não cobramos sozinho</strong>. Pode parar quando quiser.
              </p>
              <p className="text-center text-[11px] leading-relaxed text-slate-500">
                Com várias contas: aceite “guardar senha” no Chrome/Edge/Safari — o
                navegador memoriza e-mail + senha de cada uma com segurança.
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
