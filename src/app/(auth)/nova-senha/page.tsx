"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordField } from "@/components/password-field";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

export default function NovaSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== password2) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setError("Supabase não configurado.");
        return;
      }
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError(
          "Link inválido ou expirado. Peça um novo em “Esqueci a senha” e abra o e-mail de novo."
        );
        return;
      }
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
        return;
      }
      setDone(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar senha");
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
          <CardTitle>Nova senha</CardTitle>
          <CardDescription>
            Defina uma senha nova para a sua conta LucroMEI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <p className="text-center text-sm font-medium text-emerald-800">
              Senha atualizada! Entrando…
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" name="lucromei-nova-senha">
              <PasswordField
                id="password"
                name="password"
                label="Nova senha"
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
              <PasswordField
                id="password2"
                name="password2"
                label="Confirmar senha"
                autoComplete="new-password"
                value={password2}
                onChange={setPassword2}
                placeholder="Repita a senha"
                required
                minLength={6}
              />
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando…" : "Salvar nova senha"}
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-slate-600">
            <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
              Ir para o login
            </Link>
            {" · "}
            <Link href="/esqueci-senha" className="font-semibold text-emerald-700 hover:underline">
              Pedir novo link
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
