"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setError("Recuperação de senha indisponível (Supabase não configurado).");
        return;
      }
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/callback?next=${encodeURIComponent("/nova-senha")}`,
      });
      if (err) {
        setError(err.message);
        return;
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar e-mail");
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
          <CardTitle>Esqueci a senha</CardTitle>
          <CardDescription>
            Enviamos um link para o seu e-mail para criar uma nova senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center text-sm text-slate-700">
              <p className="font-semibold text-emerald-800">E-mail enviado</p>
              <p>
                Se existir conta com <strong>{email}</strong>, você receberá um link em
                alguns minutos. Confira também o spam.
              </p>
              <Link
                href="/login"
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={onSubmit} className="space-y-4" name="lucromei-esqueci-senha">
                <div>
                  <Label htmlFor="email">E-mail da conta</Label>
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
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando…" : "Enviar link de recuperação"}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-slate-600">
                <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
                  Voltar ao login
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
