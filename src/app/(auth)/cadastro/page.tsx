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
import { trackCadastroErro, trackLead } from "@/lib/lead-client";
import { authErrorMessage, authErrorType } from "@/lib/auth-errors";

/** Kill-switch: NEXT_PUBLIC_CADASTRO_GOOGLE=0 esconde o botão Google no cadastro. */
const GOOGLE_SIGNUP_ENABLED = process.env.NEXT_PUBLIC_CADASTRO_GOOGLE !== "0";
const FIRST_STEP = "/upload?primeiro=1";

export default function CadastroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function fail(message: string, errorType: string, method: "email" | "google" = "email") {
    setError(message);
    trackCadastroErro(errorType, method);
  }

  async function signUpGoogle() {
    setError("");
    if (!isSupabaseConfigured()) {
      fail("Cadastro indisponível agora. Tente de novo em instantes.", "supabase_off", "google");
      return;
    }
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(FIRST_STEP)}&origem=cadastro`,
        },
      });
      if (err) {
        fail(authErrorMessage(err, "Não deu para continuar com Google. Tente de novo ou use e-mail e senha."), authErrorType(err), "google");
        setGoogleLoading(false);
      }
    } catch (err) {
      fail(authErrorMessage(err, "Não deu para continuar com Google. Tente de novo ou use e-mail e senha."), authErrorType(err), "google");
      setGoogleLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        fail("Cadastro indisponível agora. Tente de novo em instantes.", "supabase_off");
        return;
      }
      if (password.length < 6) {
        fail("Senha deve ter pelo menos 6 caracteres.", "senha_curta");
        return;
      }
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(FIRST_STEP)}`,
        },
      });
      if (err) {
        fail(authErrorMessage(err, "Não deu para criar a conta. Tenta de novo."), authErrorType(err));
        return;
      }

      if (data.user) {
        try {
          await Promise.race([
            ensureUserSettings(supabase, data.user),
            new Promise((resolve) => setTimeout(resolve, 2500)),
          ]);
        } catch {
          // Sessão vale mesmo se settings atrasarem.
        }
      }

      // Guarda e-mail recente (senha fica no gestor do navegador, se o user aceitar)
      rememberEmail(email);

      // Nesta fase: sem exigir verificação de e-mail — entra no app se houver sessão
      if (data.session) {
        await trackLead("cadastro", data.session.access_token);
        router.push(FIRST_STEP);
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
          try {
            await Promise.race([
              ensureUserSettings(supabase, signInData.user),
              new Promise((resolve) => setTimeout(resolve, 2500)),
            ]);
          } catch {
            // ignore
          }
        }
        await trackLead("cadastro", signInData.session.access_token);
        router.push(FIRST_STEP);
        router.refresh();
        return;
      }

      // Só se o projeto Supabase ainda exigir confirmação de e-mail
      trackCadastroErro("sem_sessao_apos_cadastro");
      setNeedsEmailConfirm(true);
      setDone(true);
    } catch (err) {
      fail(authErrorMessage(err, "Erro ao criar conta"), authErrorType(err));
    } finally {
      setLoading(false);
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
          <CardTitle>Começar o teste grátis</CardTitle>
          <CardDescription>
            <strong>14 dias grátis</strong>, <strong>sem cartão</strong>. Depois é
            só tirar foto do último PIX ou da notinha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="space-y-3 text-center text-sm text-slate-700">
              {needsEmailConfirm ? (
                <>
                  <p className="text-base font-semibold text-emerald-800">
                    Conta criada! Entre com o mesmo e-mail e senha para começar
                    seus 14 dias grátis.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/login?next=${encodeURIComponent(FIRST_STEP)}`)}
                  >
                    Ir para Entrar
                  </Button>
                </>
              ) : (
                <p>Redirecionando…</p>
              )}
            </div>
          ) : (
            <>
            {GOOGLE_SIGNUP_ENABLED && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full bg-white font-semibold"
                  onClick={signUpGoogle}
                  disabled={loading || googleLoading}
                >
                  <GoogleIcon />
                  {googleLoading ? "Abrindo Google…" : "Continuar com Google"}
                </Button>
                <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
                  <div className="h-px flex-1 bg-slate-200" />
                  ou com e-mail
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
              </>
            )}
            <form
              onSubmit={onSubmit}
              className="space-y-4"
              name="lucromei-cadastro"
              autoComplete="on"
              method="post"
            >
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onInvalid={(e) =>
                    trackCadastroErro(
                      e.currentTarget.validity.valueMissing ? "email_vazio" : "email_invalido_form"
                    )
                  }
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
              <Button type="submit" className="w-full" disabled={loading || googleLoading}>
                {loading ? "Criando…" : "Começar 14 dias grátis"}
              </Button>
              <p className="text-center text-[11px] leading-relaxed text-slate-500">
                Sem cartão. Sem cobrança sozinha. Só paga se quiser continuar
                depois dos 14 dias.
              </p>
            </form>
            </>
          )}
          <p className="mt-4 text-center text-sm text-slate-600">
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
      <div className="mt-5 w-full max-w-md rounded-2xl border border-emerald-100 bg-white/70 px-5 py-4 text-sm text-slate-700">
        <p className="font-bold text-slate-900">O que acontece depois</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 font-medium">
          <li>Você entra direto no app (sem esperar e-mail).</li>
          <li>Tira foto de um comprovante ou PIX: o app lê e você confere.</li>
          <li>Vê o lucro estimado do mês. Nada é cobrado nos 14 dias.</li>
        </ol>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          App particular, não é do governo. Dados tratados conforme a LGPD.
          Criado pela Sandra, que usa o LucroMEI na própria empresa.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.77-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.29v-3.1H1.27a12 12 0 0 0 0 10.78l4.01-3.1z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.53 11.53 0 0 0 12 0 12 12 0 0 0 1.27 6.61l4.01 3.1C6.23 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}
